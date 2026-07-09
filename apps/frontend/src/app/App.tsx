import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Car, Home, Trophy, SlidersHorizontal, Settings,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Clock, Check, X, BarChart2, Bell, User,
  CreditCard, LogOut, RefreshCw,
  Maximize2, LayoutTemplate, Grid2X2, Activity,
  Target, Zap,
} from 'lucide-react'
// CSS custom properties from theme.css / design-tokens.css
const css = {
  // Figma semantic tokens (theme.css)
  background:  'var(--background)',
  foreground:  'var(--foreground)',
  card:        'var(--card)',
  primary:     'var(--primary)',
  accent:      'var(--accent)',
  radius:      'var(--radius)',

  // Extended cockpit palette (design-tokens.css)
  cockpit:        'var(--color-cockpit)',
  cockpitMid:     'var(--color-cockpit-mid)',
  cockpitSurface: 'var(--color-cockpit-surface)',
  cockpitDeep:    'var(--color-cockpit-deep)',
  cockpitBorder:  'var(--color-cockpit-border)',
  cockpitMuted:   'var(--color-cockpit-muted)',

  // Amber / primary
  amber:                  'var(--color-amber)',
  amberDim:               'var(--color-amber-dim)',
  amberGlow:              'var(--color-amber-glow)',
  amberGlowSubtle:        'var(--color-amber-glow-subtle)',
  amberGlowBorder:        'var(--color-amber-glow-border)',
  amberGlowBorderStrong:  'var(--color-amber-glow-border-strong)',
  amberGlowBg:            'var(--color-amber-glow-bg)',
  amberGlowBgFaint:       'var(--color-amber-glow-bg-faint)',
  amberGlowBgMedium:      'rgba(245, 166, 35, 0.2)',
  amberGlowRing:          'rgba(245, 166, 35, 0.08)',
  amberGlowRingBorder:    'rgba(245, 166, 35, 0.4)',

  // Green / accent / live
  green:              'var(--color-green)',
  greenDim:           'var(--color-green-dim)',
  greenGlow:          'var(--color-green-glow)',
  greenGlowSubtle:    'var(--color-green-glow-subtle)',
  greenGlowBorder:    'var(--color-green-glow-border)',

  // Foreground
  fg:       'var(--color-fg)',
  fgMuted:  'var(--color-fg-muted)',
  fgDim:    'var(--color-fg-dim)',

  // Semantic
  redScore: 'var(--color-red-score)',
  redGlow:  'var(--color-red-glow)',
  blueAway: 'var(--color-blue-away)',

  // Neutral badge
  neutralBadgeBg:     'var(--color-neutral-badge-bg)',
  neutralBadgeBorder: 'var(--color-neutral-badge-border)',
} as const

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = 'splash' | 'home' | 'scores' | 'sports' | 'stats' | 'settings' | 'carplay'
type DisplayMode = 'full' | 'half' | 'quarter'
type CarplayView = 'stats' | 'scoring'
type MatchStatus = 'live' | 'upcoming' | 'ft'

interface Team {
  name: string
  abbr: string
  color: string
  altColor?: string
}

interface Player {
  name: string
  team: string
  stats: Record<string, number | string>
}

interface ScoreProgression {
  periods: string[]
  homeScores: number[]
  awayScores: number[]
  overs?: number[]
  wickets?: number[]
}

interface FootballEvent {
  time: number
  team: 'home' | 'away'
  player: string
  type: 'goal' | 'penalty' | 'own-goal'
}

interface CricketBall {
  outcome: 'dot' | '1' | '2' | '3' | '4' | '6' | 'W' | 'wd' | 'nb'
  runs?: number
}

interface Match {
  id: string
  sport: string
  league: string
  home: Team
  away: Team
  homeScore: number | string
  awayScore: number | string
  time: string
  status: MatchStatus
  period?: string
  topPlayers: Player[]
  scoreProgression?: ScoreProgression
  footballEvents?: FootballEvent[]
  cricketBalls?: CricketBall[]
  currentInnings?: number
  battingTeam?: string
  bowler?: string
  batters?: { name: string; runs: number; balls: number }[]
  startTime?: string
}

// ─── Team Colors ─────────────────────────────────────────────────────────────

const TEAM_COLORS: Record<string, string> = {
  // AFL
  'Adelaide': '#002B5C', 'Brisbane Lions': '#A30046', 'Carlton': '#0E1E2D',
  'Collingwood': '#000000', 'Essendon': '#CC2031', 'Fremantle': '#2A1A5E',
  'Geelong': '#1C3C6B', 'Gold Coast': '#E8222A', 'GWS Giants': '#F47920',
  'Hawthorn': '#4D2004', 'Melbourne': '#CC2031', 'North Melbourne': '#003087',
  'Port Adelaide': '#008AAB', 'Richmond': '#FFD200', 'St Kilda': '#ED0F05',
  'Sydney': '#E2001A', 'West Coast': '#002B7F', 'Western Bulldogs': '#014896',
  // NRL
  'Broncos': '#4D0000', 'Raiders': '#6ABE45', 'Bulldogs': '#0057A8',
  'Sharks': '#00B2A9', 'Titans': '#009FDF', 'Sea Eagles': '#6F1F7B',
  'Storm': '#4B0082', 'Knights': '#003087', 'Cowboys': '#003087',
  'Eels': '#FFD200', 'Panthers': '#231F20', 'Rabbitohs': '#006B3F',
  'Dragons': '#E8222A', 'Roosters': '#003087', 'Warriors': '#231F20',
  'Tigers': '#FF6600', 'Dolphins': '#E8222A',
  // Cricket
  'Australia': '#FFD200', 'England': '#003087', 'India': '#003087',
  'Pakistan': '#006B3F', 'New Zealand': '#000000', 'South Africa': '#006B3F',
  'West Indies': '#8B0000', 'Sri Lanka': '#003087', 'Bangladesh': '#006B3F',
  'Afghanistan': '#003087', 'Zimbabwe': '#006B3F', 'Ireland': '#006B3F',
  // BBL
  'Adelaide Strikers': '#003087', 'Brisbane Heat': '#FF6600', 'Hobart Hurricanes': '#6F1F7B',
  'Melbourne Renegades': '#CC2031', 'Melbourne Stars': '#006B3F', 'Perth Scorchers': '#FF6600',
  'Sydney Sixers': '#FF69B4', 'Sydney Thunder': '#FFD200',
  // IPL
  'Mumbai Indians': '#003087', 'Chennai Super Kings': '#FFD200', 'Royal Challengers': '#CC2031',
  'Kolkata Knight Riders': '#6F1F7B', 'Delhi Capitals': '#003087', 'Punjab Kings': '#CC2031',
  'Rajasthan Royals': '#FF69B4', 'Sunrisers Hyderabad': '#FF6600',
  // Football / Premier League
  'Arsenal': '#EF0107', 'Aston Villa': '#95BFE5', 'Bournemouth': '#DA291C',
  'Brentford': '#E30613', 'Brighton': '#0057B8', 'Chelsea': '#034694',
  'Crystal Palace': '#1B458F', 'Everton': '#003399', 'Fulham': '#000000',
  'Ipswich': '#3A64A3', 'Leicester': '#003090', 'Liverpool': '#C8102E',
  'Man City': '#6CABDD', 'Man United': '#DA291C', 'Newcastle': '#241F20',
  'Nottm Forest': '#DD0000', 'Southampton': '#D71920', 'Spurs': '#132257',
  'West Ham': '#7A263A', 'Wolves': '#FDB913',
  // La Liga
  'Real Madrid': '#FEBE10', 'Barcelona': '#A50044', 'Atletico Madrid': '#CB3524',
  'Sevilla': '#D71920', 'Valencia': '#FF7F00', 'Villarreal': '#FFD200',
  'Athletic Bilbao': '#CC2031', 'Real Sociedad': '#003087', 'Betis': '#006B3F',
  'Osasuna': '#CC2031',
  // World Cup 2026 — national teams
  'Argentina': '#75AADB', 'France': '#002395', 'Brazil': '#009C3B',
  'Germany': '#000000', 'Spain': '#FFC400', 'Italy': '#009246',
  'Netherlands': '#FF6600', 'Belgium': '#000000', 'Portugal': '#006600',
  'Mexico': '#006600', 'USA': '#002868', 'Canada': '#FF0000',
  'Uruguay': '#0066CC', 'Japan': '#BC002D', 'South Korea': '#C60C30',
  'Morocco': '#C1272D', 'Senegal': '#00853F',
  'Croatia': '#FF0000', 'Switzerland': '#FF0000',
  // NBA
  'Atlanta Hawks': '#E03A3E', 'Boston Celtics': '#007A33', 'Brooklyn Nets': '#000000',
  'Charlotte Hornets': '#1D1160', 'Chicago Bulls': '#CE1141', 'Cleveland Cavaliers': '#860038',
  'Dallas Mavericks': '#00538C', 'Denver Nuggets': '#0E2240', 'Detroit Pistons': '#C8102E',
  'Golden State Warriors': '#1D428A', 'Houston Rockets': '#CE1141', 'Indiana Pacers': '#002D62',
  'LA Clippers': '#C8102E', 'LA Lakers': '#552583', 'Memphis Grizzlies': '#5D76A9',
  'Miami Heat': '#98002E', 'Milwaukee Bucks': '#00471B', 'Minnesota Timberwolves': '#0C2340',
  'New Orleans Pelicans': '#0C2340', 'New York Knicks': '#006BB6', 'Oklahoma City Thunder': '#007AC1',
  'Orlando Magic': '#0077C0', 'Philadelphia 76ers': '#006BB6', 'Phoenix Suns': '#1D1160',
  'Portland Trail Blazers': '#E03A3E', 'Sacramento Kings': '#5A2D81', 'San Antonio Spurs': '#C4CED4',
  'Toronto Raptors': '#CE1141', 'Utah Jazz': '#002B5C', 'Washington Wizards': '#002B5C',
}

// ─── Sports Config ────────────────────────────────────────────────────────────

const SPORTS_CONFIG: Record<string, { icon: string; leagues: string[]; teams: Record<string, string[]> }> = {
  AFL: {
    icon: '🏉',
    leagues: ['AFL Premiership'],
    teams: {
      'AFL Premiership': ['Adelaide', 'Brisbane Lions', 'Carlton', 'Collingwood', 'Essendon',
        'Fremantle', 'Geelong', 'Gold Coast', 'GWS Giants', 'Hawthorn',
        'Melbourne', 'North Melbourne', 'Port Adelaide', 'Richmond', 'St Kilda',
        'Sydney', 'West Coast', 'Western Bulldogs'],
    },
  },
  NRL: {
    icon: '🏈',
    leagues: ['NRL Premiership'],
    teams: {
      'NRL Premiership': ['Broncos', 'Raiders', 'Bulldogs', 'Sharks', 'Titans',
        'Sea Eagles', 'Storm', 'Knights', 'Cowboys', 'Eels',
        'Panthers', 'Rabbitohs', 'Dragons', 'Roosters', 'Warriors', 'Tigers', 'Dolphins'],
    },
  },
  Cricket: {
    icon: '🏏',
    leagues: ['Test Series', 'BBL', 'IPL'],
    teams: {
      'Test Series': ['Australia', 'England', 'India', 'Pakistan', 'New Zealand',
        'South Africa', 'West Indies', 'Sri Lanka', 'Bangladesh', 'Afghanistan'],
      'BBL': ['Adelaide Strikers', 'Brisbane Heat', 'Hobart Hurricanes', 'Melbourne Renegades',
        'Melbourne Stars', 'Perth Scorchers', 'Sydney Sixers', 'Sydney Thunder'],
      'IPL': ['Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers', 'Kolkata Knight Riders',
        'Delhi Capitals', 'Punjab Kings', 'Rajasthan Royals', 'Sunrisers Hyderabad'],
    },
  },
  Football: {
    icon: '⚽',
    leagues: ['Premier League', 'La Liga', 'Champions League', 'World Cup 2026'],
    teams: {
      'Premier League': ['Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton',
        'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich',
        'Leicester', 'Liverpool', 'Man City', 'Man United', 'Newcastle',
        'Nottm Forest', 'Southampton', 'Spurs', 'West Ham', 'Wolves'],
      'La Liga': ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Valencia',
        'Villarreal', 'Athletic Bilbao', 'Real Sociedad', 'Betis', 'Osasuna'],
      'Champions League': ['Real Madrid', 'Barcelona', 'Man City', 'Liverpool', 'Bayern Munich',
        'PSG', 'Juventus', 'AC Milan', 'Inter Milan', 'Dortmund'],
      'World Cup 2026': ['Argentina', 'France', 'Brazil', 'Germany', 'Spain', 'England',
        'Italy', 'Netherlands', 'Belgium', 'Portugal', 'Mexico', 'USA',
        'Canada', 'Uruguay', 'Japan', 'South Korea', 'Australia', 'Morocco',
        'Senegal', 'Croatia', 'Switzerland'],
    },
  },
  Basketball: {
    icon: '🏀',
    leagues: ['NBA'],
    teams: {
      'NBA': ['Atlanta Hawks', 'Boston Celtics', 'Brooklyn Nets', 'Charlotte Hornets',
        'Chicago Bulls', 'Cleveland Cavaliers', 'Dallas Mavericks', 'Denver Nuggets',
        'Detroit Pistons', 'Golden State Warriors', 'Houston Rockets', 'Indiana Pacers',
        'LA Clippers', 'LA Lakers', 'Memphis Grizzlies', 'Miami Heat',
        'Milwaukee Bucks', 'Minnesota Timberwolves', 'New Orleans Pelicans', 'New York Knicks',
        'Oklahoma City Thunder', 'Orlando Magic', 'Philadelphia 76ers', 'Phoenix Suns',
        'Portland Trail Blazers', 'Sacramento Kings', 'San Antonio Spurs', 'Toronto Raptors',
        'Utah Jazz', 'Washington Wizards'],
    },
  },
}

// ─── Stats Options ────────────────────────────────────────────────────────────

const STATS_OPTIONS: Record<string, string[]> = {
  AFL: ['Disposals', 'Goals', 'Marks', 'Tackles', 'Hitouts', 'Clearances', 'Kicks', 'Handballs', 'Contested Marks', 'Inside 50s'],
  NRL: ['Tries', 'Tackles', 'Metres', 'Runs', 'Offloads', 'Line Breaks', 'Errors', 'Kick Returns', 'Dummy Halves', 'Penalties'],
  Cricket: ['Runs', 'Balls', 'Fours', 'Sixes', 'SR', 'Wickets', 'Overs', 'Economy', 'Maidens', 'Catches'],
  Football: ['Goals', 'Assists', 'Shots', 'Passes', 'Tackles', 'Dribbles', 'Interceptions', 'Clearances', 'Saves', 'xG'],
  Basketball: ['Points', 'FGM', 'FGA', 'FG%', '3PM', '3PA', '3P%', 'FTM', 'FTA', 'FT%', 'Rebounds', 'Assists', 'Steals', 'Blocks', 'Turnovers', 'Fouls'],
}

const DEFAULT_STATS: Record<string, string[]> = {
  AFL: ['Disposals', 'Goals', 'Marks'],
  NRL: ['Tries', 'Tackles', 'Metres'],
  Cricket: ['Runs', 'Balls', 'SR'],
  Football: ['Goals', 'Assists', 'Shots'],
  Basketball: ['Points', 'Rebounds', 'Assists'],
}

const DEFAULT_SORT: Record<string, string> = {
  AFL: 'Disposals',
  NRL: 'Tries',
  Cricket: 'Runs',
  Football: 'Goals',
  Basketball: 'Points',
}

// ─── API Config ───────────────────────────────────────────────────────────────

const API_BASE_URL = 'https://sports-drive-backend-production.up.railway.app'

// ─── API Types ────────────────────────────────────────────────────────────────

interface ApiTeam {
  id: number
  name: string
  abbreviation: string
  logo_url: string | null
}

interface ApiMatch {
  id: number
  round: string
  home_team_id: number
  away_team_id: number
  date: string
  home_score: number | null
  away_score: number | null
  status: 'scheduled' | 'in_progress' | 'completed'
  home_team: ApiTeam
  away_team: ApiTeam
}

interface ApiBasketballTeam {
  id: number
  name: string
  abbreviation: string
  logo_url: string | null
}

interface ApiBasketballMatch {
  id: number
  season: string
  game_date: string
  home_team_id: number
  away_team_id: number
  home_score: number | null
  away_score: number | null
  status: 'scheduled' | 'in_progress' | 'completed'
  period: number | null
  period_time: string | null
  home_team: ApiBasketballTeam
  away_team: ApiBasketballTeam
}

// ─── API Transform ────────────────────────────────────────────────────────────

/** Append 'Z' to bare ISO timestamps so they are parsed as UTC, not local time. */
function ensureUtc(dateStr: string): string {
  return /[Z+\-]\d*$/.test(dateStr.trim()) ? dateStr : dateStr + 'Z'
}

/** Parse a score value that may be null, int, or float (Dart JSON decoder quirk). */
function parseScore(value: number | null | undefined): number {
  if (value == null) return 0
  return Math.round(value)
}

/** Normalise alternate API status spellings to canonical MatchStatus values. */
function normalizeStatus(raw: string): MatchStatus {
  const s = raw.toLowerCase().replace(/[^a-z_]/g, '')
  if (s === 'in_progress' || s === 'inprogress' || s === 'live' || s === 'playing') return 'live'
  if (s === 'completed' || s === 'finished' || s === 'ft' || s === 'final' || s === 'ended') return 'ft'
  return 'upcoming'
}

function transformApiMatch(m: ApiMatch): Match {
  const status = normalizeStatus(m.status)
  const homeColor = getTeamColor(m.home_team.name)
  const awayColor = getTeamColor(m.away_team.name)

  const date = new Date(ensureUtc(m.date))
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString()
  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  let startTime: string | undefined
  if (status === 'upcoming') {
    if (isToday) startTime = `Today ${timeStr}`
    else if (isTomorrow) startTime = `Tomorrow ${timeStr}`
    else startTime = date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` ${timeStr}`
  }

  return {
    id: String(m.id),
    sport: 'AFL',
    league: 'AFL Premiership',
    home: {
      name: m.home_team.name,
      abbr: m.home_team.abbreviation,
      color: homeColor,
    },
    away: {
      name: m.away_team.name,
      abbr: m.away_team.abbreviation,
      color: awayColor,
    },
    homeScore: parseScore(m.home_score),
    awayScore: parseScore(m.away_score),
    time: status === 'live' ? m.round : '',
    status,
    period: status === 'live' ? m.round : undefined,
    topPlayers: [],
    scoreProgression: undefined,
    startTime,
  }
}

function transformApiBasketballMatch(m: ApiBasketballMatch): Match {
  const status = normalizeStatus(m.status)
  const homeColor = getTeamColor(m.home_team.name)
  const awayColor = getTeamColor(m.away_team.name)

  const date = new Date(ensureUtc(m.game_date))
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString()
  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  let startTime: string | undefined
  if (status === 'upcoming') {
    if (isToday) startTime = `Today ${timeStr}`
    else if (isTomorrow) startTime = `Tomorrow ${timeStr}`
    else startTime = date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` ${timeStr}`
  }

  let timeDisplay = ''
  let period: string | undefined
  if (status === 'live') {
    const periodLabel = m.period != null
      ? (m.period > 4 ? `OT${m.period - 4}` : `Q${m.period}`)
      : ''
    const periodTime = m.period_time ?? ''
    timeDisplay = periodTime ? `${periodLabel} ${periodTime}` : periodLabel
    period = periodLabel || undefined
  } else if (status === 'ft') {
    timeDisplay = 'FT'
  }

  // Generate abbreviated team name from full name
  const homeAbbr = m.home_team.abbreviation ||
    m.home_team.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()
  const awayAbbr = m.away_team.abbreviation ||
    m.away_team.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()

  return {
    id: `bball-${m.id}`,
    sport: 'Basketball',
    league: 'NBA',
    home: {
      name: m.home_team.name,
      abbr: homeAbbr,
      color: homeColor,
    },
    away: {
      name: m.away_team.name,
      abbr: awayAbbr,
      color: awayColor,
    },
    homeScore: parseScore(m.home_score),
    awayScore: parseScore(m.away_score),
    time: timeDisplay,
    status,
    period,
    topPlayers: [],
    scoreProgression: undefined,
    startTime,
  }
}

// ─── Mock Match Data ──────────────────────────────────────────────────────────

const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    sport: 'AFL',
    league: 'AFL Premiership',
    home: { name: 'Collingwood', abbr: 'COL', color: '#000000', altColor: '#FFFFFF' },
    away: { name: 'Richmond', abbr: 'RIC', color: '#FFD200', altColor: '#000000' },
    homeScore: 87,
    awayScore: 74,
    time: "Q3 18:42",
    status: 'live',
    period: 'Q3',
    topPlayers: [
      { name: 'N. Daicos', team: 'COL', stats: { Disposals: 34, Goals: 2, Marks: 8, Tackles: 4 } },
      { name: 'T. Mitchell', team: 'RIC', stats: { Disposals: 29, Goals: 1, Marks: 6, Tackles: 7 } },
      { name: 'S. Pendlebury', team: 'COL', stats: { Disposals: 27, Goals: 0, Marks: 5, Tackles: 3 } },
      { name: 'D. Martin', team: 'RIC', stats: { Disposals: 25, Goals: 3, Marks: 4, Tackles: 5 } },
      { name: 'J. De Goey', team: 'COL', stats: { Disposals: 22, Goals: 1, Marks: 7, Tackles: 2 } },
      { name: 'K. Lambert', team: 'RIC', stats: { Disposals: 20, Goals: 0, Marks: 3, Tackles: 8 } },
    ],
    scoreProgression: {
      periods: ['Q1', 'Q2', 'Q3'],
      homeScores: [22, 45, 87],
      awayScores: [18, 39, 74],
    },
  },
  {
    id: 'm2',
    sport: 'NRL',
    league: 'NRL Premiership',
    home: { name: 'Storm', abbr: 'MEL', color: '#4B0082', altColor: '#FFFFFF' },
    away: { name: 'Panthers', abbr: 'PEN', color: '#231F20', altColor: '#FFFFFF' },
    homeScore: 18,
    awayScore: 12,
    time: "65'",
    status: 'live',
    period: '2nd Half',
    topPlayers: [
      { name: 'R. Papenhuyzen', team: 'MEL', stats: { Tries: 2, Tackles: 18, Metres: 142, Runs: 12 } },
      { name: 'N. Cleary', team: 'PEN', stats: { Tries: 1, Tackles: 22, Metres: 98, Runs: 8 } },
      { name: 'C. Munster', team: 'MEL', stats: { Tries: 1, Tackles: 31, Metres: 87, Runs: 14 } },
      { name: 'J. Fisher-Harris', team: 'PEN', stats: { Tries: 0, Tackles: 38, Metres: 112, Runs: 16 } },
      { name: 'U. Hynes', team: 'MEL', stats: { Tries: 0, Tackles: 15, Metres: 76, Runs: 9 } },
      { name: 'L. Kikau', team: 'PEN', stats: { Tries: 1, Tackles: 12, Metres: 134, Runs: 11 } },
    ],
    scoreProgression: {
      periods: ['20\'', '40\'', '60\'', '65\''],
      homeScores: [6, 12, 18, 18],
      awayScores: [0, 6, 12, 12],
    },
    footballEvents: [
      { time: 8, team: 'home', player: 'Papenhuyzen', type: 'goal' },
      { time: 23, team: 'away', player: 'Cleary', type: 'goal' },
      { time: 35, team: 'home', player: 'Munster', type: 'goal' },
      { time: 48, team: 'away', player: 'Kikau', type: 'goal' },
      { time: 57, team: 'home', player: 'Papenhuyzen', type: 'goal' },
    ],
  },
  {
    id: 'm3',
    sport: 'Cricket',
    league: 'Test Series',
    home: { name: 'Australia', abbr: 'AUS', color: '#FFD200', altColor: '#006B3F' },
    away: { name: 'England', abbr: 'ENG', color: '#003087', altColor: '#FFFFFF' },
    homeScore: '287/4',
    awayScore: '312',
    time: "Ov 68.3",
    status: 'live',
    period: '2nd Innings',
    currentInnings: 2,
    battingTeam: 'AUS',
    bowler: 'J. Anderson',
    batters: [
      { name: 'S. Smith', runs: 87, balls: 142 },
      { name: 'M. Labuschagne', runs: 54, balls: 98 },
    ],
    topPlayers: [
      { name: 'S. Smith', team: 'AUS', stats: { Runs: 87, Balls: 142, Fours: 9, Sixes: 1, SR: '61.3' } },
      { name: 'M. Labuschagne', team: 'AUS', stats: { Runs: 54, Balls: 98, Fours: 6, Sixes: 0, SR: '55.1' } },
      { name: 'J. Anderson', team: 'ENG', stats: { Runs: 0, Balls: 0, Fours: 0, Sixes: 0, Wickets: 2, Overs: '18.3', Economy: '3.2' } },
      { name: 'D. Warner', team: 'AUS', stats: { Runs: 67, Balls: 89, Fours: 8, Sixes: 2, SR: '75.3' } },
      { name: 'B. Stokes', team: 'ENG', stats: { Runs: 0, Balls: 0, Fours: 0, Sixes: 0, Wickets: 1, Overs: '14.0', Economy: '2.8' } },
      { name: 'U. Khawaja', team: 'AUS', stats: { Runs: 45, Balls: 78, Fours: 5, Sixes: 0, SR: '57.7' } },
    ],
    scoreProgression: {
      periods: ['10', '20', '30', '40', '50', '60', '68'],
      homeScores: [42, 89, 134, 178, 221, 261, 287],
      awayScores: [0, 0, 0, 0, 0, 0, 0],
      overs: [10, 20, 30, 40, 50, 60, 68],
      wickets: [0, 1, 1, 2, 3, 4, 4],
    },
    cricketBalls: [
      { outcome: 'dot' }, { outcome: '1', runs: 1 }, { outcome: '4', runs: 4 },
      { outcome: 'dot' }, { outcome: '1', runs: 1 }, { outcome: 'W' },
    ],
  },
  {
    id: 'm4',
    sport: 'Football',
    league: 'Premier League',
    home: { name: 'Arsenal', abbr: 'ARS', color: '#EF0107', altColor: '#FFFFFF' },
    away: { name: 'Liverpool', abbr: 'LIV', color: '#C8102E', altColor: '#F6EB61' },
    homeScore: 2,
    awayScore: 1,
    time: "78'",
    status: 'live',
    period: '2nd Half',
    topPlayers: [
      { name: 'B. Saka', team: 'ARS', stats: { Goals: 1, Assists: 1, Shots: 4, Passes: 42, xG: '0.8' } },
      { name: 'M. Salah', team: 'LIV', stats: { Goals: 1, Assists: 0, Shots: 5, Passes: 38, xG: '1.2' } },
      { name: 'K. Havertz', team: 'ARS', stats: { Goals: 1, Assists: 0, Shots: 3, Passes: 31, xG: '0.6' } },
      { name: 'T. Alexander-Arnold', team: 'LIV', stats: { Goals: 0, Assists: 1, Shots: 1, Passes: 67, xG: '0.1' } },
      { name: 'M. Ødegaard', team: 'ARS', stats: { Goals: 0, Assists: 1, Shots: 2, Passes: 58, xG: '0.3' } },
      { name: 'D. Núñez', team: 'LIV', stats: { Goals: 0, Assists: 0, Shots: 3, Passes: 22, xG: '0.7' } },
    ],
    scoreProgression: {
      periods: ['15\'', '30\'', '45\'', '60\'', '75\'', '78\''],
      homeScores: [0, 1, 1, 1, 2, 2],
      awayScores: [0, 0, 0, 1, 1, 1],
    },
    footballEvents: [
      { time: 23, team: 'home', player: 'Havertz', type: 'goal' },
      { time: 61, team: 'away', player: 'Salah', type: 'goal' },
      { time: 74, team: 'home', player: 'Saka', type: 'goal' },
    ],
  },
  // Upcoming matches
  {
    id: 'm5',
    sport: 'AFL',
    league: 'AFL Premiership',
    home: { name: 'Geelong', abbr: 'GEE', color: '#1C3C6B', altColor: '#FFFFFF' },
    away: { name: 'Carlton', abbr: 'CAR', color: '#0E1E2D', altColor: '#FFFFFF' },
    homeScore: 0,
    awayScore: 0,
    time: '',
    status: 'upcoming',
    startTime: 'Today 7:30 PM',
    topPlayers: [],
  },
  {
    id: 'm6',
    sport: 'NRL',
    league: 'NRL Premiership',
    home: { name: 'Roosters', abbr: 'SYD', color: '#003087', altColor: '#FFFFFF' },
    away: { name: 'Rabbitohs', abbr: 'SOU', color: '#006B3F', altColor: '#FFFFFF' },
    homeScore: 0,
    awayScore: 0,
    time: '',
    status: 'upcoming',
    startTime: 'Today 8:00 PM',
    topPlayers: [],
  },
  {
    id: 'm7',
    sport: 'Football',
    league: 'Champions League',
    home: { name: 'Real Madrid', abbr: 'RMA', color: '#FEBE10', altColor: '#003087' },
    away: { name: 'Man City', abbr: 'MCI', color: '#6CABDD', altColor: '#FFFFFF' },
    homeScore: 0,
    awayScore: 0,
    time: '',
    status: 'upcoming',
    startTime: 'Tomorrow 3:00 AM',
    topPlayers: [],
  },
  {
    id: 'm8',
    sport: 'Cricket',
    league: 'IPL',
    home: { name: 'Mumbai Indians', abbr: 'MI', color: '#003087', altColor: '#FFD200' },
    away: { name: 'Chennai Super Kings', abbr: 'CSK', color: '#FFD200', altColor: '#003087' },
    homeScore: 0,
    awayScore: 0,
    time: '',
    status: 'upcoming',
    startTime: 'Tomorrow 7:30 PM',
    topPlayers: [],
  },
]

// ─── Utility Functions ────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

function getTeamColor(name: string): string {
  // Exact match first
  if (TEAM_COLORS[name]) return TEAM_COLORS[name]
  // Case-insensitive fallback
  const lower = name.toLowerCase()
  const key = Object.keys(TEAM_COLORS).find(k => k.toLowerCase() === lower)
  return key ? TEAM_COLORS[key] : '#2a3a4d'
}

function formatCountdown(startTime: string): string {
  // Mock countdown — in production would calculate from actual time
  const times: Record<string, string> = {
    'Today 7:30 PM': '2h 14m',
    'Today 8:00 PM': '2h 44m',
    'Tomorrow 3:00 AM': '9h 22m',
    'Tomorrow 7:30 PM': '27h 14m',
  }
  return times[startTime] || '—'
}

// ─── Shared Components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: MatchStatus }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-display tracking-wider"
        style={{ background: css.greenGlow, color: css.accent, border: `1px solid ${css.greenGlowBorder}` }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: css.accent }} />
        LIVE
      </span>
    )
  }
  if (status === 'upcoming') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-display tracking-wider"
        style={{ background: css.amberGlowSubtle, color: css.primary, border: `1px solid ${css.amberGlowBorder}` }}>
        <Clock size={10} />
        SOON
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-display tracking-wider"
      style={{ background: css.neutralBadgeBg, color: css.fgMuted, border: `1px solid ${css.neutralBadgeBorder}` }}>
      <Check size={10} />
      FT
    </span>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center flex-shrink-0 h-6 w-11 rounded-full transition-all duration-200"
      style={{
        background: checked ? css.primary : css.cockpitBorder,
        border: `1px solid ${checked ? css.primary : css.cockpitMuted}`,
      }}
    >
      <span
        className="inline-block w-4 h-4 rounded-full transition-transform duration-200"
        style={{
          background: checked ? css.background : css.fgDim,
          transform: checked ? 'translateX(24px)' : 'translateX(4px)',
        }}
      />
      {label && <span className="sr-only">{label}</span>}
    </button>
  )
}

function TeamSwatch({ color, altColor, size = 'md' }: { color: string; altColor?: string; size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: { w: 20, h: 12 }, md: { w: 28, h: 18 }, lg: { w: 40, h: 26 } }
  const d = dims[size]
  return (
    <div className="rounded-sm overflow-hidden flex-shrink-0" style={{ width: d.w, height: d.h }}>
      <div className="w-full h-full" style={{
        background: altColor
          ? `linear-gradient(135deg, ${color} 50%, ${altColor} 50%)`
          : color
      }} />
    </div>
  )
}

function ModeIcon({ mode, active, onClick }: { mode: DisplayMode; active: boolean; onClick: () => void }) {
  const color = active ? css.primary : css.fgDim
  return (
    <button onClick={onClick} className="p-1.5 rounded transition-all" style={{ background: active ? css.amberGlowSubtle : 'transparent' }}>
      {mode === 'full' && <Maximize2 size={16} color={color} />}
      {mode === 'half' && <LayoutTemplate size={16} color={color} />}
      {mode === 'quarter' && <Grid2X2 size={16} color={color} />}
    </button>
  )
}

function BottomNav({ current, onNavigate }: { current: Screen; onNavigate: (s: Screen) => void }) {
  const items: { screen: Screen; icon: React.ReactNode; label: string }[] = [
    { screen: 'home',   icon: <Home size={20} />,             label: 'Home' },
    { screen: 'scores', icon: <Zap size={20} />,              label: 'Scores' },
    { screen: 'sports', icon: <Trophy size={20} />,           label: 'Sports' },
    { screen: 'stats',  icon: <SlidersHorizontal size={20} />, label: 'Stats' },
  ]
  return (
    <nav className="flex items-center border-t" style={{ background: css.card, borderColor: css.cockpitBorder, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {items.map(item => {
        const active = current === item.screen
        return (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all"
            style={{ color: active ? css.primary : css.fgDim }}
          >
            {item.icon}
            <span className="text-xs font-body" style={{ fontSize: 10 }}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function MobileShell({ children, current, onNavigate }: { children: React.ReactNode; current: Screen; onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full" style={{ background: css.background }}>
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </div>
      <BottomNav current={current} onNavigate={onNavigate} />
    </div>
  )
}

// ─── Splash Screen ────────────────────────────────────────────────────────────

function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="flex flex-col items-center justify-center h-full" style={{ background: css.background }}>
      {/* Logo */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Pulse rings */}
        <div className="absolute w-24 h-24 rounded-full animate-pulse-ring"
          style={{ background: css.amberGlow, animationDelay: '0s' }} />
        <div className="absolute w-24 h-24 rounded-full animate-pulse-ring"
          style={{ background: css.amberGlowRing, animationDelay: '0.5s' }} />
        {/* Icon circle */}
        <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: css.amberGlow, border: `2px solid ${css.amberGlowRingBorder}` }}>
          <Car size={36} color={css.primary} />
        </div>
      </div>

      {/* App name */}
      <div className="text-center">
        <h1 className="font-display font-black tracking-widest" style={{ fontSize: 42, letterSpacing: '0.15em' }}>
          <span style={{ color: css.foreground }}>SCORE</span>
          <span style={{ color: css.primary }}>DRIVE</span>
        </h1>
        <p className="font-body text-xs tracking-widest mt-1" style={{ color: css.fgDim, letterSpacing: '0.3em' }}>
          IN-CAR SPORTS TRACKER
        </p>
      </div>

      {/* Loading dots */}
      <div className="flex gap-1.5 mt-12">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
            style={{ background: css.primary, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  )
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

function LiveTicker({ matches }: { matches: Match[] }) {
  const liveMatches = matches.filter(m => m.status === 'live')
  if (liveMatches.length === 0) return null

  const items = [...liveMatches, ...liveMatches] // duplicate for seamless loop

  return (
    <div className="overflow-hidden border-b" style={{ borderColor: css.cockpitBorder, background: css.card }}>
      <div className="flex items-center">
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 border-r" style={{ borderColor: css.cockpitBorder }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: css.accent }} />
          <span className="font-display font-bold text-xs tracking-wider" style={{ color: css.accent }}>LIVE</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-ticker whitespace-nowrap">
            {items.map((m, i) => (
              <div key={`${m.id}-${i}`} className="inline-flex items-center gap-2 px-4 py-2 border-r" style={{ borderColor: css.cockpitBorder }}>
                <TeamSwatch color={m.home.color} altColor={m.home.altColor} size="sm" />
                <span className="font-data text-xs" style={{ color: css.foreground }}>{m.home.abbr}</span>
                <span className="font-data font-bold text-sm" style={{ color: css.primary }}>{m.homeScore}</span>
                <span className="font-data text-xs" style={{ color: css.fgDim }}>–</span>
                <span className="font-data font-bold text-sm" style={{ color: css.foreground }}>{m.awayScore}</span>
                <span className="font-data text-xs" style={{ color: css.foreground }}>{m.away.abbr}</span>
                <TeamSwatch color={m.away.color} altColor={m.away.altColor} size="sm" />
                <span className="font-body text-xs" style={{ color: css.fgDim }}>{m.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SportTile({ sport, matches, onClick }: { sport: string; matches: Match[]; onClick: () => void }) {
  const config = SPORTS_CONFIG[sport]
  const liveCount = matches.filter(m => m.status === 'live').length
  const liveMatch = matches.find(m => m.status === 'live')

  return (
    <button
      onClick={onClick}
      className="flex flex-col p-3 rounded-md text-left transition-all active:scale-95"
      style={{ background: css.card, border: `1px solid ${css.cockpitBorder}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 18 }}>{config.icon}</span>
          <span className="font-display font-bold text-sm tracking-wide" style={{ color: css.foreground }}>{sport}</span>
        </div>
        {liveCount > 0 && (
          <span className="text-xs font-bold font-display px-1.5 py-0.5 rounded"
            style={{ background: css.greenGlowSubtle, color: css.accent, fontSize: 10 }}>
            {liveCount} LIVE
          </span>
        )}
      </div>

      <div className="text-xs font-body mb-2" style={{ color: css.fgDim }}>
        {config.leagues.length} league{config.leagues.length > 1 ? 's' : ''}
      </div>

      {liveMatch && (
        <div className="flex items-center gap-1.5 mt-auto">
          <TeamSwatch color={liveMatch.home.color} altColor={liveMatch.home.altColor} size="sm" />
          <span className="font-data text-xs font-bold" style={{ color: css.primary }}>{liveMatch.homeScore}</span>
          <span className="font-data text-xs" style={{ color: css.fgDim }}>–</span>
          <span className="font-data text-xs font-bold" style={{ color: css.foreground }}>{liveMatch.awayScore}</span>
          <TeamSwatch color={liveMatch.away.color} altColor={liveMatch.away.altColor} size="sm" />
        </div>
      )}
    </button>
  )
}

function HomeScreen({ matches, onNavigate, onCarplay }: {
  matches: Match[]
  onNavigate: (s: Screen) => void
  onCarplay: () => void
}) {
  const sports = ['AFL', 'NRL', 'Cricket', 'Football', 'Basketball']

  return (
    <MobileShell current="home" onNavigate={onNavigate}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: css.cockpitBorder }}>
        <div>
          <h1 className="font-display font-black tracking-widest text-lg" style={{ letterSpacing: '0.12em' }}>
            <span style={{ color: css.foreground }}>SCORE</span>
            <span style={{ color: css.primary }}>DRIVE</span>
          </h1>
          <p className="font-body text-xs" style={{ color: css.fgDim, fontSize: 10 }}>IN-CAR SPORTS TRACKER</p>
        </div>
        <button
          onClick={onCarplay}
          className="flex items-center gap-2 px-3 py-2 rounded-full font-display font-bold text-sm tracking-wide transition-all active:scale-95"
          style={{ background: css.primary, color: css.background }}
        >
          <Car size={16} />
          DRIVE MODE
        </button>
      </div>

      {/* Live ticker */}
      <LiveTicker matches={matches} />

      {/* Sport tiles */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold tracking-wide text-sm" style={{ color: css.fgMuted, letterSpacing: '0.1em' }}>
            YOUR SPORTS
          </h2>
          <span className="font-body text-xs" style={{ color: css.fgDim }}>
            {matches.filter(m => m.status === 'live').length} live now
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {sports.map(sport => (
            <SportTile
              key={sport}
              sport={sport}
              matches={matches.filter(m => m.sport === sport)}
              onClick={() => onNavigate('scores')}
            />
          ))}
        </div>
      </div>

      {/* Upcoming section */}
      <div className="px-4 pb-4">
        <h2 className="font-display font-bold tracking-wide text-sm mb-3" style={{ color: css.fgMuted, letterSpacing: '0.1em' }}>
          UPCOMING
        </h2>
        <div className="flex flex-col gap-2">
          {matches.filter(m => m.status === 'upcoming').slice(0, 3).map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-md" style={{ background: css.card, border: `1px solid ${css.cockpitBorder}` }}>
              <div className="flex items-center gap-1.5">
                <TeamSwatch color={m.home.color} altColor={m.home.altColor} size="sm" />
                <span className="font-display font-bold text-xs" style={{ color: css.foreground }}>{m.home.abbr}</span>
              </div>
              <span className="font-body text-xs" style={{ color: css.fgDim }}>vs</span>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-xs" style={{ color: css.foreground }}>{m.away.abbr}</span>
                <TeamSwatch color={m.away.color} altColor={m.away.altColor} size="sm" />
              </div>
              <div className="ml-auto text-right">
                <div className="font-body text-xs" style={{ color: css.primary }}>{m.startTime}</div>
                <div className="font-body text-xs" style={{ color: css.fgDim }}>{m.league}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  )
}

// ─── Scores Screen ────────────────────────────────────────────────────────────

function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === 'live'
  const isUpcoming = match.status === 'upcoming'

  return (
    <div
      className="rounded-md overflow-hidden"
      style={{
        background: css.card,
        border: `1px solid ${isLive ? css.greenGlowBorder : css.cockpitBorder}`,
        boxShadow: isLive ? `0 0 12px ${css.greenGlowSubtle}` : 'none',
      }}
    >
      {/* League + status row */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: css.cockpitBorder }}>
        <span className="font-display font-bold text-xs tracking-wider" style={{ color: css.fgDim, letterSpacing: '0.1em' }}>
          {match.league}
        </span>
        <StatusBadge status={match.status} />
      </div>

      {/* Score row */}
      <div className="flex items-center px-3 py-3 gap-3">
        {/* Home */}
        <div className="flex-1 flex items-center gap-2">
          <TeamSwatch color={match.home.color} altColor={match.home.altColor} size="md" />
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm" style={{ color: css.foreground }}>{match.home.abbr}</span>
            <span className="font-body text-xs truncate" style={{ color: css.fgDim, maxWidth: 80 }}>{match.home.name}</span>
          </div>
        </div>

        {/* Score / time */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          {isUpcoming ? (
            <>
              <span className="font-display font-bold text-xs" style={{ color: css.primary }}>{match.startTime}</span>
              <span className="font-data text-xs" style={{ color: css.fgDim }}>vs</span>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-data font-bold text-xl" style={{ color: isLive ? css.primary : css.foreground }}>{match.homeScore}</span>
                <span className="font-data text-sm" style={{ color: css.fgDim }}>–</span>
                <span className="font-data font-bold text-xl" style={{ color: css.foreground }}>{match.awayScore}</span>
              </div>
              {match.time && (
                <span className="font-body text-xs" style={{ color: isLive ? css.accent : css.fgDim }}>{match.time}</span>
              )}
            </>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex items-center gap-2 justify-end">
          <div className="flex flex-col items-end">
            <span className="font-display font-bold text-sm" style={{ color: css.foreground }}>{match.away.abbr}</span>
            <span className="font-body text-xs truncate" style={{ color: css.fgDim, maxWidth: 80 }}>{match.away.name}</span>
          </div>
          <TeamSwatch color={match.away.color} altColor={match.away.altColor} size="md" />
        </div>
      </div>
    </div>
  )
}

function ScoresScreen({ matches, onNavigate }: {
  matches: Match[]
  onNavigate: (s: Screen) => void
}) {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming'>('live')

  const liveMatches = matches.filter(m => m.status === 'live')
  const upcomingMatches = matches.filter(m => m.status === 'upcoming')
  const displayMatches = activeTab === 'live' ? liveMatches : upcomingMatches

  return (
    <MobileShell current="scores" onNavigate={onNavigate}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: css.cockpitBorder }}>
        <div className="flex items-center gap-2">
          <Zap size={18} color={css.primary} />
          <h1 className="font-display font-bold tracking-wide" style={{ color: css.foreground, letterSpacing: '0.08em' }}>
            SCORES
          </h1>
        </div>
        {liveMatches.length > 0 && (
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-full font-display font-bold text-xs"
            style={{ background: css.greenGlowSubtle, color: css.accent, border: `1px solid ${css.greenGlowBorder}` }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: css.accent }} />
            {liveMatches.length} LIVE
          </span>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex border-b" style={{ borderColor: css.cockpitBorder }}>
        {(['live', 'upcoming'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2.5 font-display font-bold text-xs tracking-wider transition-all"
            style={{
              color: activeTab === tab ? css.primary : css.fgDim,
              borderBottom: activeTab === tab ? `2px solid ${css.primary}` : '2px solid transparent',
              background: 'transparent',
              letterSpacing: '0.1em',
            }}
          >
            {tab === 'live' ? `LIVE (${liveMatches.length})` : `UPCOMING (${upcomingMatches.length})`}
          </button>
        ))}
      </div>

      {/* Match list */}
      <div className="p-4 flex flex-col gap-3">
        {displayMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Zap size={32} color={css.cockpitMuted} />
            <p className="font-body text-sm" style={{ color: css.fgDim }}>
              {activeTab === 'live' ? 'No live matches right now' : 'No upcoming matches'}
            </p>
          </div>
        ) : (
          displayMatches.map(m => <MatchCard key={m.id} match={m} />)
        )}
      </div>
    </MobileShell>
  )
}

// ─── Sports Screen ────────────────────────────────────────────────────────────

function SportsSettingsModal({
  sport,
  enabledStats,
  sortStats,
  showUpcoming,
  showLast24h,
  onToggleStat,
  onSetSort,
  onToggleShowUpcoming,
  onToggleShowLast24h,
  onClose,
}: {
  sport: string
  enabledStats: Record<string, string[]>
  sortStats: Record<string, string>
  showUpcoming: boolean
  showLast24h: boolean
  onToggleStat: (sport: string, stat: string) => void
  onSetSort: (sport: string, stat: string) => void
  onToggleShowUpcoming: (v: boolean) => void
  onToggleShowLast24h: (v: boolean) => void
  onClose: () => void
}) {
  const stats = enabledStats[sport] || DEFAULT_STATS[sport]
  const sort = sortStats[sport] || DEFAULT_SORT[sport]

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(3,5,7,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-t-xl overflow-hidden flex flex-col animate-slide-up"
        style={{ background: css.cockpitSurface, border: `1px solid ${css.cockpitBorder}`, maxHeight: '85vh' }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: css.cockpitBorder }}>
          <div className="flex items-center gap-2">
            <Settings size={16} color={css.primary} />
            <span className="font-display font-bold tracking-wide" style={{ color: css.foreground, letterSpacing: '0.08em' }}>
              {sport.toUpperCase()} PREFERENCES
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded" style={{ color: css.fgMuted }}>
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-4">
          {/* Stats to show */}
          <div className="rounded-md p-4" style={{ background: css.card, border: `1px solid ${css.cockpitBorder}` }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-bold text-xs tracking-wider" style={{ color: css.fgDim, letterSpacing: '0.12em' }}>
                STATS TO SHOW
              </p>
              <span className="font-data text-xs" style={{ color: css.fgDim }}>{stats.length}/5 · min 3</span>
            </div>
            <div className="flex flex-col gap-2">
              {STATS_OPTIONS[sport].map(stat => {
                const active = stats.includes(stat)
                const atMax = stats.length >= 5
                const atMin = stats.length <= 3
                const disabled = (active && atMin) || (!active && atMax)
                return (
                  <div key={stat} className="flex items-center justify-between py-0.5">
                    <span className="font-body text-sm" style={{ color: active ? css.foreground : css.fgDim }}>{stat}</span>
                    <Toggle
                      checked={active}
                      onChange={() => {
                        if (disabled) return
                        onToggleStat(sport, stat)
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sort order */}
          <div className="rounded-md p-4" style={{ background: css.card, border: `1px solid ${css.cockpitBorder}` }}>
            <p className="font-display font-bold text-xs tracking-wider mb-3" style={{ color: css.fgDim, letterSpacing: '0.12em' }}>
              SORT ORDER
            </p>
            <div className="flex flex-wrap gap-2">
              {STATS_OPTIONS[sport].map(stat => (
                <button
                  key={stat}
                  onClick={() => onSetSort(sport, stat)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-display font-bold tracking-wide transition-all"
                  style={{
                    background: sort === stat ? css.primary : css.cockpitSurface,
                    color: sort === stat ? css.background : css.fgMuted,
                    border: `1px solid ${sort === stat ? css.primary : css.cockpitBorder}`,
                  }}
                >
                  {sort === stat && <Check size={10} />}
                  {stat}
                </button>
              ))}
            </div>
          </div>

          {/* Display preferences */}
          <div className="rounded-md p-4" style={{ background: css.card, border: `1px solid ${css.cockpitBorder}` }}>
            <p className="font-display font-bold text-xs tracking-wider mb-3" style={{ color: css.fgDim, letterSpacing: '0.12em' }}>
              DISPLAY PREFERENCES
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-body text-sm" style={{ color: css.foreground }}>Show upcoming matches</span>
                  <p className="font-body text-xs" style={{ color: css.fgDim }}>Display scheduled fixtures</p>
                </div>
                <Toggle checked={showUpcoming} onChange={onToggleShowUpcoming} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-body text-sm" style={{ color: css.foreground }}>Show last 24 hours</span>
                  <p className="font-body text-xs" style={{ color: css.fgDim }}>Include recently completed</p>
                </div>
                <Toggle checked={showLast24h} onChange={onToggleShowLast24h} />
              </div>
            </div>
          </div>
        </div>

        {/* Done button */}
        <div className="px-4 py-3 border-t flex-shrink-0" style={{ borderColor: css.cockpitBorder }}>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-md font-display font-bold tracking-wide text-sm transition-all"
            style={{ background: css.primary, color: css.background }}
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  )
}

function SportsScreen({
  matches, enabledLeagues, selectedTeams, enabledStats, sortStats,
  onToggleLeague, onToggleTeam, onToggleStat, onSetSort,
  onNavigate,
}: {
  matches: Match[]
  enabledLeagues: Record<string, boolean>
  selectedTeams: Record<string, string[]>
  enabledStats: Record<string, string[]>
  sortStats: Record<string, string>
  onToggleLeague: (league: string) => void
  onToggleTeam: (sport: string, team: string) => void
  onToggleStat: (sport: string, stat: string) => void
  onSetSort: (sport: string, stat: string) => void
  onNavigate: (s: Screen) => void
}) {
  const [expandedLeagues, setExpandedLeagues] = useState<Record<string, boolean>>({})
  const [settingsSport, setSettingsSport] = useState<string | null>(null)
  const [showUpcoming, setShowUpcoming] = useState(true)
  const [showLast24h, setShowLast24h] = useState(false)

  const sports = Object.keys(SPORTS_CONFIG)

  return (
    <MobileShell current="sports" onNavigate={onNavigate}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: css.cockpitBorder }}>
        <div className="flex items-center gap-2">
          <Trophy size={18} color={css.primary} />
          <h1 className="font-display font-bold tracking-wide" style={{ color: css.foreground, letterSpacing: '0.08em' }}>
            SPORTS
          </h1>
        </div>
      </div>

      <div className="flex flex-col">
        {sports.map(sport => {
          const config = SPORTS_CONFIG[sport]

          return (
            <div key={sport}>
              {/* Sport section header */}
              <div
                className="flex items-center justify-between px-4 py-2.5 border-b"
                style={{ background: css.cockpitSurface, borderColor: css.cockpitBorder }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 16 }}>{config.icon}</span>
                  <span className="font-display font-bold tracking-wider text-sm" style={{ color: css.fgMuted, letterSpacing: '0.1em' }}>
                    {sport.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => setSettingsSport(sport)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded font-display font-bold text-xs tracking-wide transition-all"
                  style={{
                    background: css.amberGlowBgFaint,
                    color: css.primary,
                    border: `1px solid ${css.amberGlowBorder}`,
                  }}
                >
                  <Settings size={11} />
                  SETTINGS
                </button>
              </div>

              {/* Leagues */}
              {config.leagues.map(league => {
                const leagueKey = `${sport}:${league}`
                const enabled = enabledLeagues[leagueKey] !== false
                const teamsExpanded = expandedLeagues[leagueKey]

                return (
                  <div key={leagueKey} className="border-b" style={{ borderColor: css.cockpitBorder }}>
                    {/* League row */}
                    <div className="flex items-center px-4 py-3" style={{ background: css.card }}>
                      <button
                        onClick={() => setExpandedLeagues(prev => ({ ...prev, [leagueKey]: !prev[leagueKey] }))}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        {teamsExpanded
                          ? <ChevronUp size={14} color={css.fgDim} />
                          : <ChevronDown size={14} color={css.fgDim} />
                        }
                        <span className="font-body text-sm" style={{ color: enabled ? css.foreground : css.fgDim }}>
                          {league}
                        </span>
                        <span className="font-body text-xs" style={{ color: css.fgDim }}>
                          {config.teams[league]?.length ?? 0} teams
                        </span>
                      </button>
                      <Toggle checked={enabled} onChange={() => onToggleLeague(leagueKey)} />
                    </div>

                    {/* Teams (expandable) */}
                    {teamsExpanded && (
                      <div className="px-4 pb-3 pt-1" style={{ background: css.background }}>
                        <div className="grid grid-cols-2 gap-1.5">
                          {config.teams[league]?.map(team => {
                            const teamKey = `${sport}:${league}`
                            const teamSelected = (selectedTeams[teamKey] || []).includes(team)
                            return (
                              <button
                                key={team}
                                onClick={() => onToggleTeam(teamKey, team)}
                                className="flex items-center gap-2 px-2.5 py-2 rounded text-left transition-all"
                                style={{
                                  background: teamSelected ? css.amberGlowBg : css.card,
                                  border: `1px solid ${teamSelected ? css.amberGlowBorderStrong : css.cockpitBorder}`,
                                }}
                              >
                                <TeamSwatch color={getTeamColor(team)} size="sm" />
                                <span className="font-body text-xs truncate" style={{ color: teamSelected ? css.primary : css.fgMuted }}>
                                  {team}
                                </span>
                                {teamSelected && <Check size={10} color={css.primary} className="ml-auto flex-shrink-0" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Settings modal */}
      {settingsSport && (
        <SportsSettingsModal
          sport={settingsSport}
          enabledStats={enabledStats}
          sortStats={sortStats}
          showUpcoming={showUpcoming}
          showLast24h={showLast24h}
          onToggleStat={onToggleStat}
          onSetSort={onSetSort}
          onToggleShowUpcoming={setShowUpcoming}
          onToggleShowLast24h={setShowLast24h}
          onClose={() => setSettingsSport(null)}
        />
      )}
    </MobileShell>
  )
}

// ─── Stats Screen ─────────────────────────────────────────────────────────────

function StatsScreen({
  matches, enabledStats, sortStats,
  onToggleStat, onSetSort,
  onNavigate,
}: {
  matches: Match[]
  enabledStats: Record<string, string[]>
  sortStats: Record<string, string>
  onToggleStat: (sport: string, stat: string) => void
  onSetSort: (sport: string, stat: string) => void
  onNavigate: (s: Screen) => void
}) {
  const [activeSport, setActiveSport] = useState('AFL')
  const sports = ['AFL', 'NRL', 'Cricket', 'Football', 'Basketball']
  const stats = enabledStats[activeSport] || DEFAULT_STATS[activeSport]
  const sort = sortStats[activeSport] || DEFAULT_SORT[activeSport]
  const liveMatch = matches.find(m => m.sport === activeSport && m.status === 'live')

  return (
    <MobileShell current="stats" onNavigate={onNavigate}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: css.cockpitBorder }}>
        <SlidersHorizontal size={18} color={css.primary} />
        <h1 className="font-display font-bold tracking-wide" style={{ color: css.foreground, letterSpacing: '0.08em' }}>
          STATS
        </h1>
      </div>

      {/* Per-sport tabs: AFL | NRL | Cricket | Football | Basketball */}
      <div className="flex border-b overflow-x-auto" style={{ borderColor: css.cockpitBorder }}>
        {sports.map(sport => {
          const config = SPORTS_CONFIG[sport]
          return (
            <button
              key={sport}
              onClick={() => setActiveSport(sport)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 font-display font-bold text-xs tracking-wide transition-all"
              style={{
                color: activeSport === sport ? css.primary : css.fgDim,
                borderBottom: activeSport === sport ? `2px solid ${css.primary}` : '2px solid transparent',
                background: 'transparent',
              }}
            >
              <span style={{ fontSize: 13 }}>{config.icon}</span>
              {sport}
            </button>
          )
        })}
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Stat selection */}
        <div className="rounded-md p-4" style={{ background: css.card, border: `1px solid ${css.cockpitBorder}` }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-bold text-xs tracking-wider" style={{ color: css.fgDim, letterSpacing: '0.12em' }}>
              STAT SELECTION
            </p>
            <span className="font-data text-xs" style={{ color: css.fgDim }}>
              {stats.length}/5 &nbsp;<span style={{ color: css.cockpitMuted }}>min 3</span>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {STATS_OPTIONS[activeSport].map(stat => {
              const active = stats.includes(stat)
              const atMax = stats.length >= 5
              const atMin = stats.length <= 3
              const disabled = (active && atMin) || (!active && atMax)
              return (
                <div key={stat} className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2">
                    {active && <Check size={12} color={css.primary} />}
                    {!active && <div style={{ width: 12 }} />}
                    <span className="font-body text-sm" style={{ color: active ? css.foreground : css.fgDim }}>{stat}</span>
                  </div>
                  <Toggle
                    checked={active}
                    onChange={() => {
                      if (disabled) return
                      onToggleStat(activeSport, stat)
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Sort order */}
        <div className="rounded-md p-4" style={{ background: css.card, border: `1px solid ${css.cockpitBorder}` }}>
          <p className="font-display font-bold text-xs tracking-wider mb-3" style={{ color: css.fgDim, letterSpacing: '0.12em' }}>
            SORT ORDER
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.map(stat => (
              <button
                key={stat}
                onClick={() => onSetSort(activeSport, stat)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-display font-bold tracking-wide transition-all"
                style={{
                  background: sort === stat ? css.primary : css.cockpitSurface,
                  color: sort === stat ? css.background : css.fgMuted,
                  border: `1px solid ${sort === stat ? css.primary : css.cockpitBorder}`,
                }}
              >
                {sort === stat && <Check size={10} />}
                {stat}
              </button>
            ))}
          </div>
          <p className="font-body text-xs mt-2" style={{ color: css.fgDim }}>
            Players sorted by selected stat in drive mode
          </p>
        </div>

        {/* Live match preview */}
        <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${css.cockpitBorder}` }}>
          <div className="px-3 py-2 flex items-center justify-between border-b" style={{ background: css.cockpitDeep, borderColor: css.cockpitBorder }}>
            <div className="flex items-center gap-2">
              <Target size={13} color={css.primary} />
              <span className="font-display font-bold text-xs tracking-wider" style={{ color: css.primary, letterSpacing: '0.1em' }}>
                LIVE PREVIEW
              </span>
            </div>
            <StatusBadge status={liveMatch ? 'live' : 'upcoming'} />
          </div>

          {liveMatch ? (
            <div className="p-3" style={{ background: css.cockpitDeep }}>
              {/* Score */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: css.cockpitBorder }}>
                <div className="flex items-center gap-2">
                  <TeamSwatch color={liveMatch.home.color} altColor={liveMatch.home.altColor} size="sm" />
                  <span className="font-display font-bold text-sm" style={{ color: css.foreground }}>{liveMatch.home.abbr}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-data font-bold text-xl" style={{ color: css.primary }}>{liveMatch.homeScore}</span>
                  <span className="font-data text-sm" style={{ color: css.fgDim }}>–</span>
                  <span className="font-data font-bold text-xl" style={{ color: css.foreground }}>{liveMatch.awayScore}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm" style={{ color: css.foreground }}>{liveMatch.away.abbr}</span>
                  <TeamSwatch color={liveMatch.away.color} altColor={liveMatch.away.altColor} size="sm" />
                </div>
              </div>

              {/* Top performers */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 text-xs font-data" style={{ color: css.fgDim }}>#</span>
                  <span className="flex-1 text-xs font-body" style={{ color: css.fgDim }}>Player</span>
                  {stats.slice(0, 3).map(s => (
                    <span key={s} className="w-10 text-right text-xs font-data"
                      style={{ color: s === sort ? css.primary : css.fgDim }}>
                      {s.slice(0, 4)}
                    </span>
                  ))}
                </div>
                {liveMatch.topPlayers
                  .sort((a, b) => Number(b.stats[sort] || 0) - Number(a.stats[sort] || 0))
                  .slice(0, 4)
                  .map((p, i) => (
                    <div key={p.name} className="flex items-center gap-2 py-1">
                      <span className="w-5 text-xs font-data" style={{ color: i === 0 ? css.primary : css.fgDim }}>
                        {i + 1}
                      </span>
                      <TeamSwatch color={getTeamColor(p.team === liveMatch.home.abbr ? liveMatch.home.name : liveMatch.away.name)} size="sm" />
                      <span className="flex-1 text-xs font-body truncate" style={{ color: i === 0 ? css.primary : css.fgMuted }}>
                        {p.name}
                      </span>
                      {stats.slice(0, 3).map(s => (
                        <span key={s} className="w-10 text-right text-xs font-data"
                          style={{ color: s === sort ? (i === 0 ? css.primary : css.foreground) : css.fgDim }}>
                          {p.stats[s] ?? '—'}
                        </span>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center" style={{ background: css.cockpitDeep }}>
              <Target size={24} color={css.cockpitMuted} className="mx-auto mb-2" />
              <p className="font-body text-sm" style={{ color: css.fgDim }}>No live {activeSport} matches</p>
              <p className="font-body text-xs mt-1" style={{ color: css.cockpitMuted }}>Preview will appear when a match is live</p>
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  )
}

// ─── Settings Screen ──────────────────────────────────────────────────────────

function SettingsScreen({
  refreshInterval, onSetRefresh, onNavigate,
}: {
  refreshInterval: number
  onSetRefresh: (v: number) => void
  onNavigate: (s: Screen) => void
}) {
  const [notifications, setNotifications] = useState({
    goalAlerts: true,
    gameStart: true,
    finalScore: false,
  })

  return (
    <MobileShell current="settings" onNavigate={onNavigate}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: css.cockpitBorder }}>
        <Settings size={18} color={css.primary} />
        <h1 className="font-display font-bold tracking-wide" style={{ color: css.foreground, letterSpacing: '0.08em' }}>
          SETTINGS
        </h1>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Data Refresh */}
        <div className="rounded-md p-4" style={{ background: css.card, border: `1px solid ${css.cockpitBorder}` }}>
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw size={14} color={css.primary} />
            <p className="font-display font-bold text-xs tracking-wider" style={{ color: css.fgMuted, letterSpacing: '0.12em' }}>
              DATA REFRESH
            </p>
          </div>
          <div className="flex gap-2">
            {[15, 30, 60].map(v => (
              <button
                key={v}
                onClick={() => onSetRefresh(v)}
                className="flex-1 py-2 rounded font-display font-bold text-sm tracking-wide transition-all"
                style={{
                  background: refreshInterval === v ? css.primary : css.cockpitSurface,
                  color: refreshInterval === v ? css.background : css.fgMuted,
                  border: `1px solid ${refreshInterval === v ? css.primary : css.cockpitBorder}`,
                }}
              >
                {v}s
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-md p-4" style={{ background: css.card, border: `1px solid ${css.cockpitBorder}` }}>
          <div className="flex items-center gap-2 mb-3">
            <Bell size={14} color={css.primary} />
            <p className="font-display font-bold text-xs tracking-wider" style={{ color: css.fgMuted, letterSpacing: '0.12em' }}>
              NOTIFICATIONS
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { key: 'goalAlerts', label: 'Goal / Score Alerts' },
              { key: 'gameStart', label: 'Game Start Reminders' },
              { key: 'finalScore', label: 'Final Score Summary' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="font-body text-sm" style={{ color: css.foreground }}>{item.label}</span>
                <Toggle
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={v => setNotifications(prev => ({ ...prev, [item.key]: v }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="rounded-md p-4" style={{ background: css.card, border: `1px solid ${css.cockpitBorder}` }}>
          <div className="flex items-center gap-2 mb-3">
            <User size={14} color={css.primary} />
            <p className="font-display font-bold text-xs tracking-wider" style={{ color: css.fgMuted, letterSpacing: '0.12em' }}>
              ACCOUNT
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: css.cockpitBorder }}>
              <div className="flex items-center gap-2">
                <User size={16} color={css.fgDim} />
                <span className="font-body text-sm" style={{ color: css.foreground }}>Profile</span>
              </div>
              <span className="font-body text-xs" style={{ color: css.fgDim }}>user@example.com</span>
            </div>
            <button className="flex items-center justify-between py-2.5 border-b w-full" style={{ borderColor: css.cockpitBorder }}>
              <div className="flex items-center gap-2">
                <CreditCard size={16} color={css.primary} />
                <span className="font-body text-sm" style={{ color: css.primary }}>Go Ad-Free</span>
              </div>
              <span className="font-data text-xs font-bold" style={{ color: css.primary }}>$4.99/mo</span>
            </button>
            <button className="flex items-center gap-2 py-2.5 w-full">
              <LogOut size={16} color={css.redScore} />
              <span className="font-body text-sm" style={{ color: css.redScore }}>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-6 text-center">
        <p className="font-body text-xs" style={{ color: css.cockpitMuted }}>ScoreDrive v1.0.0</p>
        <p className="font-body text-xs mt-0.5" style={{ color: css.cockpitMuted }}>Built for the road. Stay safe.</p>
      </div>
    </MobileShell>
  )
}

// ─── Carplay Screen ───────────────────────────────────────────────────────────

function WormChart({ match }: { match: Match }) {
  const prog = match.scoreProgression
  if (!prog) return null

  const width = 280
  const height = 100
  const maxScore = Math.max(...prog.homeScores, ...prog.awayScores, 1)
  const points = prog.homeScores.length

  const getX = (i: number) => (i / (points - 1)) * width
  const getY = (score: number) => height - (score / maxScore) * (height - 10) - 5

  const homePath = prog.homeScores.map((s, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(s)}`).join(' ')
  const awayPath = prog.awayScores.map((s, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(s)}`).join(' ')

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 100 }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1={0} y1={getY(maxScore * f)} x2={width} y2={getY(maxScore * f)}
            stroke={css.cockpitBorder} strokeWidth={0.5} strokeDasharray="4,4" />
        ))}

        {/* Away line */}
        <path d={awayPath} fill="none" stroke={css.fgMuted} strokeWidth={1.5} strokeLinejoin="round" />

        {/* Home line (amber) */}
        <path d={homePath} fill="none" stroke={css.primary} strokeWidth={2} strokeLinejoin="round" />

        {/* Wicket markers for cricket */}
        {match.sport === 'Cricket' && prog.wickets && prog.wickets.map((w, i) => {
          if (i === 0) return null
          const prevW = prog.wickets![i - 1]
          if (w > prevW) {
            return (
              <circle key={i} cx={getX(i)} cy={getY(prog.homeScores[i])}
                r={4} fill={css.redScore} stroke={css.cockpitDeep} strokeWidth={1} />
            )
          }
          return null
        })}

        {/* Period markers */}
        {prog.periods.map((p, i) => (
          <g key={p}>
            <line x1={getX(i)} y1={height - 12} x2={getX(i)} y2={height}
              stroke={css.cockpitMuted} strokeWidth={1} />
            <text x={getX(i)} y={height} textAnchor="middle"
              fill={css.fgDim} fontSize={8} fontFamily="DM Mono">
              {p}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5" style={{ background: css.primary }} />
          <span className="font-data text-xs" style={{ color: css.primary }}>{match.home.abbr}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5" style={{ background: css.fgMuted }} />
          <span className="font-data text-xs" style={{ color: css.fgMuted }}>{match.away.abbr}</span>
        </div>
        {match.sport === 'Cricket' && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: css.redScore }} />
            <span className="font-data text-xs" style={{ color: css.redScore }}>Wicket</span>
          </div>
        )}
      </div>
    </div>
  )
}

function CricketBalls({ balls }: { balls: CricketBall[] }) {
  const ballColors: Record<string, { bg: string; text: string }> = {
    'dot': { bg: css.cockpitBorder,       text: css.fgDim },
    '1':   { bg: css.cockpitSurface,      text: css.fgMuted },
    '2':   { bg: css.cockpitSurface,      text: css.fgMuted },
    '3':   { bg: css.cockpitSurface,      text: css.foreground },
    '4':   { bg: css.amberGlowBgMedium,   text: css.primary },
    '6':   { bg: css.greenGlowSubtle,     text: css.accent },
    'W':   { bg: css.redGlow,             text: css.redScore },
    'wd':  { bg: css.cockpitSurface,      text: css.fgMuted },
    'nb':  { bg: css.cockpitSurface,      text: css.fgMuted },
  }

  return (
    <div className="flex items-center gap-2">
      {balls.map((ball, i) => {
        const c = ballColors[ball.outcome] || ballColors['dot']
        return (
          <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center font-data font-bold text-xs"
            style={{ background: c.bg, color: c.text, border: `1px solid ${c.text}30` }}>
            {ball.outcome === 'dot' ? '•' : ball.outcome}
          </div>
        )
      })}
    </div>
  )
}

function CarplayStatsView({ match, enabledStats, sortStats }: {
  match: Match
  enabledStats: Record<string, string[]>
  sortStats: Record<string, string>
}) {
  const stats = enabledStats[match.sport] || DEFAULT_STATS[match.sport]
  const sort = sortStats[match.sport] || DEFAULT_SORT[match.sport]

  const sorted = [...match.topPlayers].sort(
    (a, b) => Number(b.stats[sort] || 0) - Number(a.stats[sort] || 0)
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header row */}
      <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: css.cockpitBorder }}>
        <span className="w-6 font-data text-xs" style={{ color: css.fgDim }}>#</span>
        <div className="w-5" />
        <span className="flex-1 font-body text-xs" style={{ color: css.fgDim }}>Player</span>
        {stats.map(s => (
          <span key={s} className="w-12 text-right font-data text-xs font-bold"
            style={{ color: s === sort ? css.primary : css.fgDim }}>
            {s.slice(0, 5)}
          </span>
        ))}
      </div>

      {/* Player rows */}
      <div className="flex-1 overflow-y-auto">
        {sorted.map((player, i) => (
          <div
            key={player.name}
            className="flex items-center gap-2 px-4 py-2.5 border-b"
            style={{
              borderColor: css.card,
              background: i === 0 ? css.amberGlowBgFaint : 'transparent',
            }}
          >
            <span className="w-6 font-data text-sm font-bold"
              style={{ color: i === 0 ? css.primary : css.fgDim }}>
              {i + 1}
            </span>
            <TeamSwatch
              color={getTeamColor(player.team === match.home.abbr ? match.home.name : match.away.name)}
              size="sm"
            />
            <span className="flex-1 font-body text-sm truncate"
              style={{ color: i === 0 ? css.primary : css.foreground }}>
              {player.name}
            </span>
            {stats.map(s => (
              <span key={s} className="w-12 text-right font-data text-sm"
                style={{ color: s === sort ? (i === 0 ? css.primary : css.foreground) : css.fgMuted }}>
                {player.stats[s] ?? '—'}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function CarplayScoringView({ match }: { match: Match }) {
  return (
    <div className="flex flex-col h-full px-4 py-3 gap-4">
      {/* Chart */}
      <div className="flex-1">
        <p className="font-display font-bold text-xs tracking-wider mb-2" style={{ color: css.fgDim, letterSpacing: '0.1em' }}>
          {match.sport === 'Cricket' ? 'WORM CHART' : 'SCORE PROGRESSION'}
        </p>
        <WormChart match={match} />
      </div>

      {/* Recent events */}
      <div>
        <p className="font-display font-bold text-xs tracking-wider mb-2" style={{ color: css.fgDim, letterSpacing: '0.1em' }}>
          {match.sport === 'Cricket' ? 'LAST 6 BALLS' : 'RECENT EVENTS'}
        </p>

        {match.sport === 'Cricket' && match.cricketBalls && (
          <div>
            <CricketBalls balls={match.cricketBalls} />
            {match.batters && (
              <div className="mt-3 flex gap-4">
                {match.batters.map(b => (
                  <div key={b.name} className="flex items-center gap-2">
                    <span className="font-body text-xs" style={{ color: css.fgMuted }}>{b.name}</span>
                    <span className="font-data text-sm font-bold" style={{ color: css.primary }}>{b.runs}</span>
                    <span className="font-data text-xs" style={{ color: css.fgDim }}>({b.balls})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {match.sport !== 'Cricket' && match.footballEvents && (
          <div className="flex flex-col gap-1.5">
            {match.footballEvents.slice(-4).map((ev, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-data text-xs w-8" style={{ color: css.fgDim }}>{ev.time}'</span>
                <TeamSwatch
                  color={ev.team === 'home' ? match.home.color : match.away.color}
                  size="sm"
                />
                <span className="font-body text-xs" style={{ color: css.foreground }}>{ev.player}</span>
                <span className="ml-auto font-data text-xs px-1.5 py-0.5 rounded"
                  style={{ background: css.greenGlowSubtle, color: css.accent }}>
                  {ev.type === 'goal' ? '⚽ GOAL' : ev.type === 'penalty' ? '🎯 PEN' : '↩ OG'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function UpcomingMatchCard({ match }: { match: Match }) {
  const [countdown, setCountdown] = useState(formatCountdown(match.startTime || ''))

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(formatCountdown(match.startTime || ''))
    }, 1000)
    return () => clearInterval(t)
  }, [match.startTime])

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-6">
      {/* League badge */}
      <div className="px-3 py-1 rounded-full font-display font-bold text-xs tracking-wider"
        style={{ background: css.amberGlowSubtle, color: css.primary, border: `1px solid ${css.amberGlowBorder}` }}>
        {match.league}
      </div>

      {/* Teams */}
      <div className="flex items-center gap-6 w-full">
        <div className="flex-1 flex flex-col items-center gap-2">
          <TeamSwatch color={match.home.color} altColor={match.home.altColor} size="lg" />
          <span className="font-display font-black text-2xl tracking-wide" style={{ color: css.foreground }}>
            {match.home.abbr}
          </span>
          <span className="font-body text-xs text-center" style={{ color: css.fgMuted }}>{match.home.name}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="font-display font-bold text-lg" style={{ color: css.fgDim }}>VS</span>
        </div>

        <div className="flex-1 flex flex-col items-center gap-2">
          <TeamSwatch color={match.away.color} altColor={match.away.altColor} size="lg" />
          <span className="font-display font-black text-2xl tracking-wide" style={{ color: css.foreground }}>
            {match.away.abbr}
          </span>
          <span className="font-body text-xs text-center" style={{ color: css.fgMuted }}>{match.away.name}</span>
        </div>
      </div>

      {/* Countdown */}
      <div className="flex flex-col items-center gap-1">
        <span className="font-display font-bold text-xs tracking-wider" style={{ color: css.fgDim, letterSpacing: '0.12em' }}>
          STARTS IN
        </span>
        <span className="font-data font-bold text-3xl animate-countdown" style={{ color: css.primary }}>
          {countdown}
        </span>
        <span className="font-body text-xs" style={{ color: css.fgDim }}>{match.startTime}</span>
      </div>
    </div>
  )
}

function CarplayScreen({
  matches, enabledStats, sortStats, defaultView, onBack,
}: {
  matches: Match[]
  enabledStats: Record<string, string[]>
  sortStats: Record<string, string>
  defaultView: Record<string, 'stats' | 'scoring'>
  onBack: () => void
}) {
  const [matchIndex, setMatchIndex] = useState(0)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('full')
  const [carplayView, setCarplayView] = useState<CarplayView>('stats')
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const match = matches[matchIndex]

  // Auto-carousel every 15s
  useEffect(() => {
    autoRef.current = setInterval(() => {
      setMatchIndex(i => (i + 1) % matches.length)
    }, 15000)
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [matches.length])

  // Reset view when match changes
  useEffect(() => {
    if (match) {
      setCarplayView(defaultView[match.sport] || 'stats')
    }
  }, [matchIndex, match, defaultView])

  const goNext = useCallback(() => {
    setMatchIndex(i => (i + 1) % matches.length)
    if (autoRef.current) { clearInterval(autoRef.current) }
    autoRef.current = setInterval(() => setMatchIndex(i => (i + 1) % matches.length), 15000)
  }, [matches.length])

  const goPrev = useCallback(() => {
    setMatchIndex(i => (i - 1 + matches.length) % matches.length)
    if (autoRef.current) { clearInterval(autoRef.current) }
    autoRef.current = setInterval(() => setMatchIndex(i => (i + 1) % matches.length), 15000)
  }, [matches.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goNext(); else goPrev()
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 40) {
      setCarplayView(v => v === 'stats' ? 'scoring' : 'stats')
    }
    touchStartRef.current = null
  }

  if (!match) return null

  const isLive = match.status === 'live'
  const isUpcoming = match.status === 'upcoming'

  // Score section height ratios
  const scorePct = displayMode === 'full' ? 30 : 28
  const statsPct = 100 - scorePct

  const renderCarplayContent = () => (
    <div
      className="flex flex-col h-full"
      style={{ background: css.cockpitDeep }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
        style={{ borderColor: css.cockpitBorder }}>
        <div className="flex items-center gap-2">
          <StatusBadge status={match.status} />
          <span className="font-display font-bold text-xs tracking-wider px-2 py-0.5 rounded"
            style={{ background: css.cockpitSurface, color: css.fgMuted, border: `1px solid ${css.cockpitBorder}` }}>
            {match.league}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {(['full', 'half', 'quarter'] as DisplayMode[]).map(m => (
            <ModeIcon key={m} mode={m} active={displayMode === m} onClick={() => setDisplayMode(m)} />
          ))}
          <button onClick={onBack} className="ml-2 p-1.5 rounded" style={{ background: css.cockpitSurface, border: `1px solid ${css.cockpitBorder}` }}>
            <X size={14} color={css.fgMuted} />
          </button>
        </div>
      </div>

      {/* Score section */}
      <div className="flex-shrink-0 border-b" style={{ height: `${scorePct}%`, borderColor: css.cockpitBorder }}>
        {isUpcoming ? (
          <UpcomingMatchCard match={match} />
        ) : (
          <div className="flex items-center justify-center h-full px-4 gap-4">
            {/* Home team */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <TeamSwatch color={match.home.color} altColor={match.home.altColor} size="lg" />
              <span className="font-display font-black tracking-wide"
                style={{ fontSize: displayMode === 'full' ? 20 : 16, color: css.foreground }}>
                {match.home.abbr}
              </span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-baseline gap-3">
                <span className="font-data font-bold"
                  style={{ fontSize: displayMode === 'full' ? 56 : 40, color: css.primary, lineHeight: 1 }}>
                  {match.homeScore}
                </span>
                <span className="font-data" style={{ fontSize: 20, color: css.cockpitMuted }}>–</span>
                <span className="font-data font-bold"
                  style={{ fontSize: displayMode === 'full' ? 56 : 40, color: css.foreground, lineHeight: 1 }}>
                  {match.awayScore}
                </span>
              </div>
              <span className="font-body text-xs" style={{ color: css.fgDim }}>{match.time}</span>
              {match.period && (
                <span className="font-display font-bold text-xs tracking-wider" style={{ color: css.fgMuted }}>
                  {match.period}
                </span>
              )}
            </div>

            {/* Away team */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <TeamSwatch color={match.away.color} altColor={match.away.altColor} size="lg" />
              <span className="font-display font-black tracking-wide"
                style={{ fontSize: displayMode === 'full' ? 20 : 16, color: css.foreground }}>
                {match.away.abbr}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats / Scoring section */}
      {isLive && (
        <div className="flex-1 overflow-hidden" style={{ height: `${statsPct}%` }}>
          {carplayView === 'stats' ? (
            <CarplayStatsView match={match} enabledStats={enabledStats} sortStats={sortStats} />
          ) : (
            <CarplayScoringView match={match} />
          )}
        </div>
      )}

      {/* Bottom nav */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t"
        style={{ borderColor: css.cockpitBorder, background: css.cockpitDeep }}>
        {/* Prev/Next */}
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="p-2 rounded" style={{ background: css.cockpitSurface, border: `1px solid ${css.cockpitBorder}` }}>
            <ChevronLeft size={16} color={css.fgMuted} />
          </button>
          <button onClick={goNext} className="p-2 rounded" style={{ background: css.cockpitSurface, border: `1px solid ${css.cockpitBorder}` }}>
            <ChevronRight size={16} color={css.fgMuted} />
          </button>
        </div>

        {/* Carousel dots */}
        <div className="flex items-center gap-1.5">
          {matches.map((_, i) => (
            <button
              key={i}
              onClick={() => setMatchIndex(i)}
              className="rounded-full transition-all"
              style={{
                width: i === matchIndex ? 16 : 6,
                height: 6,
                background: i === matchIndex ? css.primary : css.cockpitMuted,
              }}
            />
          ))}
        </div>

        {/* View toggle */}
        {isLive && (
          <button
            onClick={() => setCarplayView(v => v === 'stats' ? 'scoring' : 'stats')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded font-display font-bold text-xs tracking-wide transition-all"
            style={{
              background: css.cockpitSurface,
              color: css.primary,
              border: `1px solid ${css.cockpitBorder}`,
            }}
          >
            {carplayView === 'stats' ? <Activity size={12} /> : <BarChart2 size={12} />}
            {carplayView === 'stats' ? 'SCORING' : 'STATS'}
          </button>
        )}
        {!isLive && <div className="w-20" />}
      </div>
    </div>
  )

  if (displayMode === 'full') {
    return (
      <div className="h-full" style={{ background: css.cockpitDeep }}>
        {renderCarplayContent()}
      </div>
    )
  }

  if (displayMode === 'half') {
    return (
      <div className="h-full flex" style={{ background: css.cockpitDeep }}>
        <div className="flex-1 border-r" style={{ borderColor: css.cockpitBorder }}>
          {renderCarplayContent()}
        </div>
        <div className="flex-1 flex items-center justify-center" style={{ background: '#0a0a0a' }}>
          <div className="text-center">
            <LayoutTemplate size={32} color={css.cockpitBorder} className="mx-auto mb-2" />
            <p className="font-body text-xs" style={{ color: css.cockpitMuted }}>Other App</p>
          </div>
        </div>
      </div>
    )
  }

  // Quarter mode
  return (
    <div className="h-full grid grid-cols-2 grid-rows-2" style={{ background: css.cockpitDeep }}>
      <div className="border-r border-b" style={{ borderColor: css.cockpitBorder }}>
        {renderCarplayContent()}
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className={cn(
          'flex items-center justify-center',
          i === 1 ? 'border-b' : '',
          i === 2 ? 'border-r' : '',
        )} style={{ borderColor: css.cockpitBorder, background: '#0a0a0a' }}>
          <div className="text-center">
            <Grid2X2 size={24} color={css.cockpitBorder} className="mx-auto mb-1" />
            <p className="font-body text-xs" style={{ color: css.cockpitMuted, fontSize: 10 }}>Other App</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash')

  // Match data state
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES)
  const [matchesLoading, setMatchesLoading] = useState(false)
  const [matchesError, setMatchesError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setMatchesLoading(true)
    setMatchesError(null)

    fetch(`${API_BASE_URL}/api/all-matches`)
      .then(res => {
        if (!res.ok) throw new Error(`All-matches API error: ${res.status}`)
        return res.json() as Promise<{ data: (ApiMatch | ApiBasketballMatch)[] } | (ApiMatch | ApiBasketballMatch)[]>
      })
      .then(payload => {
        const raw = Array.isArray(payload) ? payload : (payload as { data: (ApiMatch | ApiBasketballMatch)[] }).data ?? []
        const allMatches: Match[] = raw.map(m => {
          const sport = (m as ApiMatch & { sport?: string }).sport
          if (sport === 'Basketball') {
            return transformApiBasketballMatch(m as ApiBasketballMatch)
          }
          return transformApiMatch(m as ApiMatch)
        })
        if (!cancelled) {
          setMatches(allMatches)
          setMatchesLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.warn('Failed to fetch all matches:', err)
          setMatchesError(err.message)
          setMatches(MOCK_MATCHES)
          setMatchesLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [])

  // Preferences state
  const [enabledLeagues, setEnabledLeagues] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    Object.entries(SPORTS_CONFIG).forEach(([sport, config]) => {
      config.leagues.forEach(league => { init[`${sport}:${league}`] = true })
    })
    return init
  })

  const [selectedTeams, setSelectedTeams] = useState<Record<string, string[]>>({})

  const [enabledStats, setEnabledStats] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {}
    Object.keys(SPORTS_CONFIG).forEach(sport => { init[sport] = [...DEFAULT_STATS[sport]] })
    return init
  })

  const [sortStats, setSortStats] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    Object.keys(SPORTS_CONFIG).forEach(sport => { init[sport] = DEFAULT_SORT[sport] })
    return init
  })

  const [defaultView, setDefaultView] = useState<Record<string, 'stats' | 'scoring'>>(() => {
    const init: Record<string, 'stats' | 'scoring'> = {}
    Object.keys(SPORTS_CONFIG).forEach(sport => { init[sport] = 'stats' })
    return init
  })

  const [refreshInterval, setRefreshInterval] = useState(30)

  // Handlers
  const handleToggleLeague = (league: string) => {
    setEnabledLeagues(prev => ({ ...prev, [league]: !prev[league] }))
  }

  const handleToggleTeam = (leagueKey: string, team: string) => {
    setSelectedTeams(prev => {
      const current = prev[leagueKey] || []
      return {
        ...prev,
        [leagueKey]: current.includes(team)
          ? current.filter(t => t !== team)
          : [...current, team],
      }
    })
  }

  const handleToggleStat = (sport: string, stat: string) => {
    setEnabledStats(prev => {
      const current = prev[sport] || DEFAULT_STATS[sport]
      return {
        ...prev,
        [sport]: current.includes(stat)
          ? current.filter(s => s !== stat)
          : [...current, stat],
      }
    })
  }

  const handleSetSort = (sport: string, stat: string) => {
    setSortStats(prev => ({ ...prev, [sport]: stat }))
  }

  const handleSetDefaultView = (sport: string, view: 'stats' | 'scoring') => {
    setDefaultView(prev => ({ ...prev, [sport]: view }))
  }

  const navigate = (screen: Screen) => setCurrentScreen(screen)

  // Screen renderer
  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onDone={() => setCurrentScreen('home')} />

      case 'home':
        return (
          <HomeScreen
            matches={matches}
            onNavigate={navigate}
            onCarplay={() => setCurrentScreen('carplay')}
          />
        )

      case 'scores':
        return (
          <ScoresScreen
            matches={matches}
            onNavigate={navigate}
          />
        )

      case 'sports':
        return (
          <SportsScreen
            matches={matches}
            enabledLeagues={enabledLeagues}
            selectedTeams={selectedTeams}
            enabledStats={enabledStats}
            sortStats={sortStats}
            onToggleLeague={handleToggleLeague}
            onToggleTeam={handleToggleTeam}
            onToggleStat={handleToggleStat}
            onSetSort={handleSetSort}
            onNavigate={navigate}
          />
        )

      case 'stats':
        return (
          <StatsScreen
            matches={matches}
            enabledStats={enabledStats}
            sortStats={sortStats}
            onToggleStat={handleToggleStat}
            onSetSort={handleSetSort}
            onNavigate={navigate}
          />
        )

      case 'settings':
        return (
          <SettingsScreen
            refreshInterval={refreshInterval}
            onSetRefresh={setRefreshInterval}
            onNavigate={navigate}
          />
        )

      case 'carplay':
        return (
          <CarplayScreen
            matches={matches}
            enabledStats={enabledStats}
            sortStats={sortStats}
            defaultView={defaultView}
            onBack={() => setCurrentScreen('home')}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="h-full w-full overflow-hidden" style={{ background: css.background }}>
      {renderScreen()}
    </div>
  )
}
