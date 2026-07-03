/**
 * Design Tokens — ScoreDrive
 *
 * Single source of truth for all design values used across the app.
 * Synced from the Figma Make repo (AdamLittleBirdie/In-CarSportsScoreTracker)
 * via the `.github/workflows/figma-sync.yml` workflow.
 *
 * DO NOT edit colour/font/spacing values by hand — update them in Figma
 * and let the sync workflow regenerate this file.
 */

// ─── Colors ───────────────────────────────────────────────────────────────────

export const colors = {
  // Background layers (darkest → lightest surface)
  cockpit: '#070a0f',
  cockpitMid: '#0d1117',
  cockpitSurface: '#111820',
  cockpitDeep: '#030507',
  cockpitBorder: '#1e2a38',
  cockpitMuted: '#2a3a4d',

  // Accent — amber / gold
  amber: '#f5a623',
  amberDim: '#c47d0e',
  amberGlow: 'rgba(245, 166, 35, 0.15)',
  amberGlowSubtle: 'rgba(245, 166, 35, 0.12)',
  amberGlowBorder: 'rgba(245, 166, 35, 0.25)',
  amberGlowBorderStrong: 'rgba(245, 166, 35, 0.3)',
  amberGlowBg: 'rgba(245, 166, 35, 0.1)',
  amberGlowBgFaint: 'rgba(245, 166, 35, 0.05)',
  amberGlowBgMedium: 'rgba(245, 166, 35, 0.2)',
  amberGlowRing: 'rgba(245, 166, 35, 0.08)',
  amberGlowRingBorder: 'rgba(245, 166, 35, 0.4)',

  // Accent — green / live
  green: '#00e57a',
  greenDim: '#00b85f',
  greenGlow: 'rgba(0, 229, 122, 0.15)',
  greenGlowSubtle: 'rgba(0, 229, 122, 0.12)',
  greenGlowBorder: 'rgba(0, 229, 122, 0.3)',

  // Foreground
  fg: '#f0f2f5',
  fgMuted: '#8a9bb0',
  fgDim: '#4a5a6e',

  // Semantic
  redScore: '#ff4d4d',
  redGlow: 'rgba(255, 77, 77, 0.2)',
  blueAway: '#4d9fff',

  // Neutral badge
  neutralBadgeBg: 'rgba(240, 242, 245, 0.08)',
  neutralBadgeBorder: 'rgba(240, 242, 245, 0.12)',
} as const

// ─── Fonts ────────────────────────────────────────────────────────────────────

export const fonts = {
  display: "'Barlow Condensed', sans-serif",
  body: "'Barlow', sans-serif",
  data: "'DM Mono', monospace",
} as const

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  xs: '0.25rem',   //  4px
  sm: '0.5rem',    //  8px
  md: '0.75rem',   // 12px
  base: '1rem',    // 16px
  lg: '1.25rem',   // 20px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px
} as const

// ─── Border Radius ────────────────────────────────────────────────────────────

export const radius = {
  tight: '0.375rem',  // 6px  — cards, buttons
  pill: '9999px',     // full — badges, toggles
} as const

// ─── Typography Scale ─────────────────────────────────────────────────────────

export const fontSize = {
  '2xs': '0.625rem',  // 10px
  xs: '0.75rem',      // 12px
  sm: '0.875rem',     // 14px
  base: '1rem',       // 16px
  lg: '1.125rem',     // 18px
  xl: '1.25rem',      // 20px
  '2xl': '1.5rem',    // 24px
  '3xl': '1.875rem',  // 30px
  '4xl': '2.25rem',   // 36px
  '5xl': '3rem',      // 48px
  hero: '3.5rem',     // 56px — scoreboard numbers
} as const

// ─── Letter Spacing ───────────────────────────────────────────────────────────

export const letterSpacing = {
  tight: '0.05em',
  base: '0.08em',
  wide: '0.1em',
  wider: '0.12em',
  widest: '0.15em',
  ultra: '0.3em',
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
