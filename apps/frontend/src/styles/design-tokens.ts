/**
 * Design Tokens — ScoreDrive
 *
 * Single source of truth for all design values used across the app.
 * Synced from the Figma Make repo (AdamLittleBirdie/In-CarSportsScoreTracker)
 * via the `.github/workflows/figma-sync.yml` workflow.
 *
 * Auto-generated on 2026-07-22T04:58:57.006Z
 * DO NOT edit colour/font/spacing values by hand — update them in Figma
 * and let the sync workflow regenerate this file.
 */

// ─── Colors ───────────────────────────────────────────────────────────────────

export const colors = {
  cockpit: '#070a0f',
  cockpitMid: '#0d1117',
  cockpitSurface: '#111820',
  cockpitDeep: '#030507',
  cockpitBorder: '#1e2a38',
  cockpitMuted: '#2a3a4d',
  amber: '#f5a623',
  amberDim: '#c47d0e',
  amberGlow: 'rgba(245, 166, 35, 0.15)',
  amberGlowSubtle: 'rgba(245, 166, 35, 0.12)',
  amberGlowBorder: 'rgba(245, 166, 35, 0.25)',
  amberGlowBorderStrong: 'rgba(245, 166, 35, 0.3)',
  amberGlowBg: 'rgba(245, 166, 35, 0.1)',
  amberGlowBgFaint: 'rgba(245, 166, 35, 0.05)',
  green: '#00e57a',
  greenDim: '#00b85f',
  greenGlow: 'rgba(0, 229, 122, 0.15)',
  greenGlowSubtle: 'rgba(0, 229, 122, 0.12)',
  greenGlowBorder: 'rgba(0, 229, 122, 0.3)',
  fg: '#f0f2f5',
  fgMuted: '#8a9bb0',
  fgDim: '#4a5a6e',
  redScore: '#ff4d4d',
  redGlow: 'rgba(255, 77, 77, 0.2)',
  blueAway: '#4d9fff',
  neutralBadgeBg: 'rgba(240, 242, 245, 0.08)',
  neutralBadgeBorder: 'rgba(240, 242, 245, 0.12)',
} as const

// ─── Fonts ────────────────────────────────────────────────────────────────────

export const fonts = {
  display: ''Barlow Condensed', sans-serif',
  body:    ''Barlow', sans-serif',
  data:    ''DM Mono', monospace',
} as const

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  'xs': '0.25rem',
  'sm': '0.5rem',
  'md': '0.75rem',
  'base': '1rem',
  'lg': '1.25rem',
  'xl': '1.5rem',
  '2xl': '2rem',
  '3xl': '3rem',
} as const

// ─── Border Radius ────────────────────────────────────────────────────────────

export const radius = {
  tight: '0.375rem',
  pill: '9999px',
} as const

// ─── Typography Scale ─────────────────────────────────────────────────────────

export const fontSize = {
  '2xs': '0.625rem',
  'xs': '0.75rem',
  'sm': '0.875rem',
  'base': '1rem',
  'lg': '1.125rem',
  'xl': '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  'hero': '3.5rem',
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
