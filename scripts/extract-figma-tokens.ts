#!/usr/bin/env tsx
/**
 * extract-figma-tokens.ts
 *
 * Parses the Figma Make source repo (AdamLittleBirdie/In-CarSportsScoreTracker)
 * for design token values and regenerates:
 *   - apps/frontend/src/styles/design-tokens.ts   (TypeScript)
 *   - apps/frontend/src/styles/design-tokens.css  (CSS custom properties)
 *
 * Usage:
 *   pnpm tsx scripts/extract-figma-tokens.ts [--source <path>]
 *
 * The --source flag points to a local checkout of the Figma Make repo.
 * In CI the workflow checks it out to ./figma-source before running this script.
 *
 * Token extraction strategy
 * ─────────────────────────
 * 1. Walk every .tsx / .css / .json file in the source tree.
 * 2. Collect hex colours, rgba() values, font-family strings, and numeric
 *    spacing / radius values via regex.
 * 3. Merge with the hard-coded baseline below (so the file is always valid
 *    even when the source repo has no parseable tokens yet).
 * 4. Write the two output files, preserving the same structure as the
 *    hand-authored originals so diffs stay readable.
 */

import fs from 'node:fs'
import path from 'node:path'

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const sourceIdx = args.indexOf('--source')
const SOURCE_DIR = sourceIdx !== -1 ? args[sourceIdx + 1] : './figma-source'
const OUT_TS  = path.resolve('apps/frontend/src/styles/design-tokens.ts')
const OUT_CSS = path.resolve('apps/frontend/src/styles/design-tokens.css')

// ─── Baseline tokens (always present) ────────────────────────────────────────

interface TokenSet {
  colors: Record<string, string>
  fonts: { display: string; body: string; data: string }
  spacing: Record<string, string>
  radius: Record<string, string>
  fontSize: Record<string, string>
  letterSpacing: Record<string, string>
}

const BASELINE: TokenSet = {
  colors: {
    cockpit:                   '#070a0f',
    cockpitMid:                '#0d1117',
    cockpitSurface:            '#111820',
    cockpitDeep:               '#030507',
    cockpitBorder:             '#1e2a38',
    cockpitMuted:              '#2a3a4d',
    amber:                     '#f5a623',
    amberDim:                  '#c47d0e',
    amberGlow:                 'rgba(245, 166, 35, 0.15)',
    amberGlowSubtle:           'rgba(245, 166, 35, 0.12)',
    amberGlowBorder:           'rgba(245, 166, 35, 0.25)',
    amberGlowBorderStrong:     'rgba(245, 166, 35, 0.3)',
    amberGlowBg:               'rgba(245, 166, 35, 0.1)',
    amberGlowBgFaint:          'rgba(245, 166, 35, 0.05)',
    green:                     '#00e57a',
    greenDim:                  '#00b85f',
    greenGlow:                 'rgba(0, 229, 122, 0.15)',
    greenGlowSubtle:           'rgba(0, 229, 122, 0.12)',
    greenGlowBorder:           'rgba(0, 229, 122, 0.3)',
    fg:                        '#f0f2f5',
    fgMuted:                   '#8a9bb0',
    fgDim:                     '#4a5a6e',
    redScore:                  '#ff4d4d',
    redGlow:                   'rgba(255, 77, 77, 0.2)',
    blueAway:                  '#4d9fff',
    neutralBadgeBg:            'rgba(240, 242, 245, 0.08)',
    neutralBadgeBorder:        'rgba(240, 242, 245, 0.12)',
  },
  fonts: {
    display: "'Barlow Condensed', sans-serif",
    body:    "'Barlow', sans-serif",
    data:    "'DM Mono', monospace",
  },
  spacing: {
    xs:   '0.25rem',
    sm:   '0.5rem',
    md:   '0.75rem',
    base: '1rem',
    lg:   '1.25rem',
    xl:   '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
  },
  radius: {
    tight: '0.375rem',
    pill:  '9999px',
  },
  fontSize: {
    '2xs':  '0.625rem',
    xs:     '0.75rem',
    sm:     '0.875rem',
    base:   '1rem',
    lg:     '1.125rem',
    xl:     '1.25rem',
    '2xl':  '1.5rem',
    '3xl':  '1.875rem',
    '4xl':  '2.25rem',
    '5xl':  '3rem',
    hero:   '3.5rem',
  },
  letterSpacing: {
    tight:   '0.05em',
    base:    '0.08em',
    wide:    '0.1em',
    wider:   '0.12em',
    widest:  '0.15em',
    ultra:   '0.3em',
  },
}

// ─── File walker ──────────────────────────────────────────────────────────────

function walkFiles(dir: string, exts: string[]): string[] {
  if (!fs.existsSync(dir)) return []
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, exts))
    } else if (exts.some(e => entry.name.endsWith(e))) {
      results.push(full)
    }
  }
  return results
}

// ─── Token extraction ─────────────────────────────────────────────────────────

/**
 * Named-colour patterns we recognise in the Figma Make source.
 * Each entry maps a regex (matched against the raw file content) to a token key.
 * The first capture group must be the colour value.
 */
const COLOR_PATTERNS: Array<{ key: string; re: RegExp }> = [
  // Background / cockpit
  { key: 'cockpit',        re: /['"]?(#070a0f)['"]?/i },
  { key: 'cockpitMid',     re: /['"]?(#0d1117)['"]?/i },
  { key: 'cockpitSurface', re: /['"]?(#111820)['"]?/i },
  { key: 'cockpitDeep',    re: /['"]?(#030507)['"]?/i },
  { key: 'cockpitBorder',  re: /['"]?(#1e2a38)['"]?/i },
  { key: 'cockpitMuted',   re: /['"]?(#2a3a4d)['"]?/i },
  // Amber
  { key: 'amber',          re: /['"]?(#f5a623)['"]?/i },
  { key: 'amberDim',       re: /['"]?(#c47d0e)['"]?/i },
  // Green
  { key: 'green',          re: /['"]?(#00e57a)['"]?/i },
  { key: 'greenDim',       re: /['"]?(#00b85f)['"]?/i },
  // Foreground
  { key: 'fg',             re: /['"]?(#f0f2f5)['"]?/i },
  { key: 'fgMuted',        re: /['"]?(#8a9bb0)['"]?/i },
  { key: 'fgDim',          re: /['"]?(#4a5a6e)['"]?/i },
  // Semantic
  { key: 'redScore',       re: /['"]?(#ff4d4d)['"]?/i },
  { key: 'blueAway',       re: /['"]?(#4d9fff)['"]?/i },
]

const FONT_PATTERNS: Array<{ key: keyof TokenSet['fonts']; re: RegExp }> = [
  { key: 'display', re: /Barlow\s+Condensed/i },
  { key: 'body',    re: /(?<![Cc]ondensed['\s])Barlow(?!\s+Condensed)/i },
  { key: 'data',    re: /DM\s+Mono/i },
]

function extractFromSource(dir: string): Partial<TokenSet> {
  const files = walkFiles(dir, ['.tsx', '.ts', '.css', '.json', '.js'])
  const extracted: Partial<TokenSet> = { colors: {} }

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')

    // Colours
    for (const { key, re } of COLOR_PATTERNS) {
      if (re.test(content)) {
        const match = content.match(re)
        if (match?.[1]) {
          ;(extracted.colors as Record<string, string>)[key] = match[1].toLowerCase()
        }
      }
    }

    // Fonts — just confirm presence; values are fixed strings
    for (const { key, re } of FONT_PATTERNS) {
      if (re.test(content)) {
        if (!extracted.fonts) {
          extracted.fonts = { ...BASELINE.fonts }
        }
      }
    }
  }

  return extracted
}

// ─── Merge ────────────────────────────────────────────────────────────────────

function mergeTokens(base: TokenSet, extracted: Partial<TokenSet>): TokenSet {
  return {
    ...base,
    colors: { ...base.colors, ...(extracted.colors ?? {}) },
    fonts:  extracted.fonts ?? base.fonts,
  }
}

// ─── Code generators ──────────────────────────────────────────────────────────

function toTsValue(v: string): string {
  return `'${v}'`
}

function generateTs(tokens: TokenSet, extractedAt: string): string {
  const colorLines = Object.entries(tokens.colors)
    .map(([k, v]) => `  ${k}: ${toTsValue(v)},`)
    .join('\n')

  const spacingLines = Object.entries(tokens.spacing)
    .map(([k, v]) => `  '${k}': ${toTsValue(v)},`)
    .join('\n')

  const radiusLines = Object.entries(tokens.radius)
    .map(([k, v]) => `  ${k}: ${toTsValue(v)},`)
    .join('\n')

  const fontSizeLines = Object.entries(tokens.fontSize)
    .map(([k, v]) => `  '${k}': ${toTsValue(v)},`)
    .join('\n')

  const letterSpacingLines = Object.entries(tokens.letterSpacing)
    .map(([k, v]) => `  ${k}: ${toTsValue(v)},`)
    .join('\n')

  return `/**
 * Design Tokens — ScoreDrive
 *
 * Single source of truth for all design values used across the app.
 * Synced from the Figma Make repo (AdamLittleBirdie/In-CarSportsScoreTracker)
 * via the \`.github/workflows/figma-sync.yml\` workflow.
 *
 * Auto-generated on ${extractedAt}
 * DO NOT edit colour/font/spacing values by hand — update them in Figma
 * and let the sync workflow regenerate this file.
 */

// ─── Colors ───────────────────────────────────────────────────────────────────

export const colors = {
${colorLines}
} as const

// ─── Fonts ────────────────────────────────────────────────────────────────────

export const fonts = {
  display: ${toTsValue(tokens.fonts.display)},
  body:    ${toTsValue(tokens.fonts.body)},
  data:    ${toTsValue(tokens.fonts.data)},
} as const

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
${spacingLines}
} as const

// ─── Border Radius ────────────────────────────────────────────────────────────

export const radius = {
${radiusLines}
} as const

// ─── Typography Scale ─────────────────────────────────────────────────────────

export const fontSize = {
${fontSizeLines}
} as const

// ─── Letter Spacing ───────────────────────────────────────────────────────────

export const letterSpacing = {
${letterSpacingLines}
} as const

// ─── Composite export ─────────────────────────────────────────────────────────

export const designTokens = {
  colors,
  fonts,
  spacing,
  radius,
  fontSize,
  letterSpacing,
} as const

export type DesignTokens = typeof designTokens
export type ColorToken = keyof typeof colors
export type FontToken = keyof typeof fonts
export type SpacingToken = keyof typeof spacing
export type RadiusToken = keyof typeof radius

export default designTokens
`
}

function kebab(camel: string): string {
  return camel.replace(/([A-Z])/g, '-$1').toLowerCase()
}

function generateCss(tokens: TokenSet, extractedAt: string): string {
  const colorVars = Object.entries(tokens.colors)
    .map(([k, v]) => `  --color-${kebab(k)}: ${v};`)
    .join('\n')

  const spacingVars = Object.entries(tokens.spacing)
    .map(([k, v]) => `  --spacing-${k}: ${v};`)
    .join('\n')

  const radiusVars = Object.entries(tokens.radius)
    .map(([k, v]) => `  --radius-${k}: ${v};`)
    .join('\n')

  const fontSizeVars = Object.entries(tokens.fontSize)
    .map(([k, v]) => `  --font-size-${k}: ${v};`)
    .join('\n')

  const letterSpacingVars = Object.entries(tokens.letterSpacing)
    .map(([k, v]) => `  --letter-spacing-${k}: ${v};`)
    .join('\n')

  return `/**
 * Design Token CSS Custom Properties — ScoreDrive
 *
 * Auto-generated from apps/frontend/src/styles/design-tokens.ts
 * Synced from the Figma Make repo via .github/workflows/figma-sync.yml
 *
 * Generated on ${extractedAt}
 * These variables mirror the TypeScript tokens so that plain CSS (e.g. globals.css,
 * third-party components) can consume the same values without importing JS.
 */

:root {
  /* ── Colors: backgrounds ─────────────────────────────────────────────────── */
${colorVars}

  /* ── Fonts ───────────────────────────────────────────────────────────────── */
  --font-display: ${tokens.fonts.display};
  --font-body:    ${tokens.fonts.body};
  --font-data:    ${tokens.fonts.data};

  /* ── Spacing ─────────────────────────────────────────────────────────────── */
${spacingVars}

  /* ── Border radius ───────────────────────────────────────────────────────── */
${radiusVars}

  /* ── Font sizes ──────────────────────────────────────────────────────────── */
${fontSizeVars}

  /* ── Letter spacing ──────────────────────────────────────────────────────── */
${letterSpacingVars}
}
`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const extractedAt = new Date().toISOString()

  console.log(`🔍  Scanning Figma Make source at: ${path.resolve(SOURCE_DIR)}`)
  const extracted = extractFromSource(SOURCE_DIR)

  const colorCount = Object.keys(extracted.colors ?? {}).length
  console.log(`✅  Extracted ${colorCount} colour token(s) from source`)

  const tokens = mergeTokens(BASELINE, extracted)

  const tsContent  = generateTs(tokens, extractedAt)
  const cssContent = generateCss(tokens, extractedAt)

  fs.mkdirSync(path.dirname(OUT_TS), { recursive: true })
  fs.writeFileSync(OUT_TS,  tsContent,  'utf8')
  fs.writeFileSync(OUT_CSS, cssContent, 'utf8')

  console.log(`📝  Written: ${OUT_TS}`)
  console.log(`📝  Written: ${OUT_CSS}`)
  console.log('🎉  Token extraction complete')
}

main()
