import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Car, Home, Trophy, SlidersHorizontal, Settings,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Clock, Check, X, BarChart2, Bell, User,
  CreditCard, LogOut, RefreshCw, ArrowLeft,
  Maximize2, LayoutTemplate, Grid2X2, Activity,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = 'splash' | 'home' | 'sports' | 'stats' | 'settings' | 'carplay'
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
    leagues: ['Premier League', 'La Liga', 'Champions League'],
    teams: {
      'Premier League': ['Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton',
        'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich',
        'Leicester', 'Liverpool', 'Man City', 'Man United', 'Newcastle',
        'Nottm Forest', 'Southampton', 'Spurs', 'West Ham', 'Wolves'],
      'La Liga': ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Valencia',
        'Villarreal', 'Athletic Bilbao', 'Real Sociedad', 'Betis', 'Osasuna'],
      'Champions League': ['Real Madrid', 'Barcelona', 'Man City', 'Liverpool', 'Bayern Munich',
        'PSG', 'Juventus', 'AC Milan', 'Inter Milan', 'Dortmund'],
    },
  },
}

// ─── Stats Options ────────────────────────────────────────────────────────────

const STATS_OPTIONS: Record<string, string[]> = {
  AFL: ['Disposals', 'Goals', 'Marks', 'Tackles', 'Hitouts', 'Clearances', 'Kicks', 'Handballs', 'Contested Marks', 'Inside 50s'],
  NRL: ['Tries', 'Tackles', 'Metres', 'Runs', 'Offloads', 'Line Breaks', 'Errors', 'Kick Returns', 'Dummy Halves', 'Penalties'],
  Cricket: ['Runs', 'Balls', 'Fours', 'Sixes', 'SR', 'Wickets', 'Overs', 'Economy', 'Maidens', 'Catches'],
  Football: ['Goals', 'Assists', 'Shots', 'Passes', 'Tackles', 'Dribbles', 'Interceptions', 'Clearances', 'Saves', 'xG'],
}

const DEFAULT_STATS: Record<string, string[]> = {
  AFL: ['Disposals', 'Goals', 'Marks'],
  NRL: ['Tries', 'Tackles', 'Metres'],
  Cricket: ['Runs', 'Balls', 'SR'],
  Football: ['Goals', 'Assists', 'Shots'],
}

const DEFAULT_SORT: Record<string, string> = {
  AFL: 'Disposals',
  NRL: 'Tries',
  Cricket: 'Runs',
  Football: 'Goals',
}

// ─── Mock Match Data ──────────────────────────────────────────────────────────

const MATCHES: Match[] = [
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
  return TEAM_COLORS[name] || '#2a3a4d'
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
        style={{ background: 'rgba(0,229,122,0.15)', color: '#00e57a', border: '1px solid rgba(0,229,122,0.3)' }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: '#00e57a' }} />
        LIVE
      </span>
    )
  }
  if (status === 'upcoming') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-display tracking-wider"
        style={{ background: 'rgba(245,166,35,0.12)', color: '#f5a623', border: '1px solid rgba(245,166,35,0.25)' }}>
        <Clock size={10} />
        SOON
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-display tracking-wider"
      style={{ background: 'rgba(240,242,245,0.08)', color: '#8a9bb0', border: '1px solid rgba(240,242,245,0.12)' }}>
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
        background: checked ? '#f5a623' : '#1e2a38',
        border: `1px solid ${checked ? '#f5a623' : '#2a3a4d'}`,
      }}
    >
      <span
        className="inline-block w-4 h-4 rounded-full transition-transform duration-200"
        style={{
          background: checked ? '#070a0f' : '#4a5a6e',
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
  const color = active ? '#f5a623' : '#4a5a6e'
  return (
    <button onClick={onClick} className="p-1.5 rounded transition-all" style={{ background: active ? 'rgba(245,166,35,0.12)' : 'transparent' }}>
      {mode === 'full' && <Maximize2 size={16} color={color} />}
      {mode === 'half' && <LayoutTemplate size={16} color={color} />}
      {mode === 'quarter' && <Grid2X2 size={16} color={color} />}
    </button>
  )
}

function BottomNav({ current, onNavigate }: { current: Screen; onNavigate: (s: Screen) => void }) {
  const items: { screen: Screen; icon: React.ReactNode; label: string }[] = [
    { screen: 'home', icon: <Home size={20} />, label: 'Home' },
    { screen: 'sports', icon: <Trophy size={20} />, label: 'Sports' },
    { screen: 'stats', icon: <SlidersHorizontal size={20} />, label: 'Stats' },
    { screen: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ]
  return (
    <nav className="flex items-center border-t" style={{ background: '#0d1117', borderColor: '#1e2a38', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {items.map(item => {
        const active = current === item.screen
        return (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all"
            style={{ color: active ? '#f5a623' : '#4a5a6e' }}
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
    <div className="flex flex-col h-full" style={{ background: '#070a0f' }}>
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
    <div className="flex flex-col items-center justify-center h-full" style={{ background: '#070a0f' }}>
      {/* Logo */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Pulse rings */}
        <div className="absolute w-24 h-24 rounded-full animate-pulse-ring"
          style={{ background: 'rgba(245,166,35,0.15)', animationDelay: '0s' }} />
        <div className="absolute w-24 h-24 rounded-full animate-pulse-ring"
          style={{ background: 'rgba(245,166,35,0.08)', animationDelay: '0.5s' }} />
        {/* Icon circle */}
        <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(245,166,35,0.15)', border: '2px solid rgba(245,166,35,0.4)' }}>
          <Car size={36} color="#f5a623" />
        </div>
      </div>

      {/* App name */}
      <div className="text-center">
        <h1 className="font-display font-black tracking-widest" style={{ fontSize: 42, letterSpacing: '0.15em' }}>
          <span style={{ color: '#f0f2f5' }}>SCORE</span>
          <span style={{ color: '#f5a623' }}>DRIVE</span>
        </h1>
        <p className="font-body text-xs tracking-widest mt-1" style={{ color: '#4a5a6e', letterSpacing: '0.3em' }}>
          IN-CAR SPORTS TRACKER
        </p>
      </div>

      {/* Loading dots */}
      <div className="flex gap-1.5 mt-12">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
            style={{ background: '#f5a623', animationDelay: `${i * 0.2}s` }} />
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
    <div className="overflow-hidden border-b" style={{ borderColor: '#1e2a38', background: '#0d1117' }}>
      <div className="flex items-center">
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 border-r" style={{ borderColor: '#1e2a38' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: '#00e57a' }} />
          <span className="font-display font-bold text-xs tracking-wider" style={{ color: '#00e57a' }}>LIVE</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-ticker whitespace-nowrap">
            {items.map((m, i) => (
              <div key={`${m.id}-${i}`} className="inline-flex items-center gap-2 px-4 py-2 border-r" style={{ borderColor: '#1e2a38' }}>
                <TeamSwatch color={m.home.color} altColor={m.home.altColor} size="sm" />
                <span className="font-data text-xs" style={{ color: '#f0f2f5' }}>{m.home.abbr}</span>
                <span className="font-data font-bold text-sm" style={{ color: '#f5a623' }}>{m.homeScore}</span>
                <span className="font-data text-xs" style={{ color: '#4a5a6e' }}>–</span>
                <span className="font-data font-bold text-sm" style={{ color: '#f0f2f5' }}>{m.awayScore}</span>
                <span className="font-data text-xs" style={{ color: '#f0f2f5' }}>{m.away.abbr}</span>
                <TeamSwatch color={m.away.color} altColor={m.away.altColor} size="sm" />
                <span className="font-body text-xs" style={{ color: '#4a5a6e' }}>{m.time}</span>
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
      style={{ background: '#0d1117', border: '1px solid #1e2a38' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 18 }}>{config.icon}</span>
          <span className="font-display font-bold text-sm tracking-wide" style={{ color: '#f0f2f5' }}>{sport}</span>
        </div>
        {liveCount > 0 && (
          <span className="text-xs font-bold font-display px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(0,229,122,0.12)', color: '#00e57a', fontSize: 10 }}>
            {liveCount} LIVE
          </span>
        )}
      </div>

      <div className="text-xs font-body mb-2" style={{ color: '#4a5a6e' }}>
        {config.leagues.length} league{config.leagues.length > 1 ? 's' : ''}
      </div>

      {liveMatch && (
        <div className="flex items-center gap-1.5 mt-auto">
          <TeamSwatch color={liveMatch.home.color} altColor={liveMatch.home.altColor} size="sm" />
          <span className="font-data text-xs font-bold" style={{ color: '#f5a623' }}>{liveMatch.homeScore}</span>
          <span className="font-data text-xs" style={{ color: '#4a5a6e' }}>–</span>
          <span className="font-data text-xs font-bold" style={{ color: '#f0f2f5' }}>{liveMatch.awayScore}</span>
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
  const sports = ['AFL', 'NRL', 'Cricket', 'Football']

  return (
    <MobileShell current="home" onNavigate={onNavigate}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#1e2a38' }}>
        <div>
          <h1 className="font-display font-black tracking-widest text-lg" style={{ letterSpacing: '0.12em' }}>
            <span style={{ color: '#f0f2f5' }}>SCORE</span>
            <span style={{ color: '#f5a623' }}>DRIVE</span>
          </h1>
          <p className="font-body text-xs" style={{ color: '#4a5a6e', fontSize: 10 }}>IN-CAR SPORTS TRACKER</p>
        </div>
        <button
          onClick={onCarplay}
          className="flex items-center gap-2 px-3 py-2 rounded-full font-display font-bold text-sm tracking-wide transition-all active:scale-95"
          style={{ background: '#f5a623', color: '#070a0f' }}
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
          <h2 className="font-display font-bold tracking-wide text-sm" style={{ color: '#8a9bb0', letterSpacing: '0.1em' }}>
            YOUR SPORTS
          </h2>
          <span className="font-body text-xs" style={{ color: '#4a5a6e' }}>
            {matches.filter(m => m.status === 'live').length} live now
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {sports.map(sport => (
            <SportTile
              key={sport}
              sport={sport}
              matches={matches.filter(m => m.sport === sport)}
              onClick={() => onNavigate('sports')}
            />
          ))}
        </div>
      </div>

      {/* Upcoming section */}
      <div className="px-4 pb-4">
        <h2 className="font-display font-bold tracking-wide text-sm mb-3" style={{ color: '#8a9bb0', letterSpacing: '0.1em' }}>
          UPCOMING
        </h2>
        <div className="flex flex-col gap-2">
          {matches.filter(m => m.status === 'upcoming').slice(0, 3).map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-md" style={{ background: '#0d1117', border: '1px solid #1e2a38' }}>
              <div className="flex items-center gap-1.5">
                <TeamSwatch color={m.home.color} altColor={m.home.altColor} size="sm" />
                <span className="font-display font-bold text-xs" style={{ color: '#f0f2f5' }}>{m.home.abbr}</span>
              </div>
              <span className="font-body text-xs" style={{ color: '#4a5a6e' }}>vs</span>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-xs" style={{ color: '#f0f2f5' }}>{m.away.abbr}</span>
                <TeamSwatch color={m.away.color} altColor={m.away.altColor} size="sm" />
              </div>
              <div className="ml-auto text-right">
                <div className="font-body text-xs" style={{ color: '#f5a623' }}>{m.startTime}</div>
                <div className="font-body text-xs" style={{ color: '#4a5a6e' }}>{m.league}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  )
}

// ─── Sports Selection Screen ──────────────────────────────────────────────────

function SportsSelectionScreen({
  enabledLeagues, selectedTeams, enabledStats, sortStats, defaultView,
  onToggleLeague, onToggleTeam, onToggleStat, onSetSort, onSetDefaultView,
  onNavigate, onBack,
}: {
  enabledLeagues: Record<string, boolean>
  selectedTeams: Record<string, string[]>
  enabledStats: Record<string, string[]>
  sortStats: Record<string, string>
  defaultView: Record<string, 'stats' | 'scoring'>
  onToggleLeague: (league: string) => void
  onToggleTeam: (sport: string, team: string) => void
  onToggleStat: (sport: string, stat: string) => void
  onSetSort: (sport: string, stat: string) => void
  onSetDefaultView: (sport: string, view: 'stats' | 'scoring') => void
  onNavigate: (s: Screen) => void
  onBack: () => void
}) {
  const [expandedSport, setExpandedSport] = useState<string | null>('AFL')
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({})

  const sports = Object.keys(SPORTS_CONFIG)

  return (
    <MobileShell current="sports" onNavigate={onNavigate}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: '#1e2a38' }}>
        <button onClick={onBack} className="p-1.5 rounded" style={{ color: '#8a9bb0' }}>
          <ArrowLeft size={20} />
        </button>
        <Trophy size={18} color="#f5a623" />
        <h1 className="font-display font-bold tracking-wide" style={{ color: '#f0f2f5', letterSpacing: '0.08em' }}>
          SPORTS & LEAGUES
        </h1>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {sports.map(sport => {
          const config = SPORTS_CONFIG[sport]
          const isExpanded = expandedSport === sport
          const stats = enabledStats[sport] || DEFAULT_STATS[sport]
          const sort = sortStats[sport] || DEFAULT_SORT[sport]
          const view = defaultView[sport] || 'stats'

          return (
            <div key={sport} className="rounded-md overflow-hidden" style={{ border: '1px solid #1e2a38' }}>
              {/* Sport header */}
              <button
                onClick={() => setExpandedSport(isExpanded ? null : sport)}
                className="w-full flex items-center justify-between px-4 py-3"
                style={{ background: '#0d1117' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 18 }}>{config.icon}</span>
                  <span className="font-display font-bold tracking-wide" style={{ color: '#f0f2f5' }}>{sport}</span>
                  <span className="text-xs font-body" style={{ color: '#4a5a6e' }}>
                    {config.leagues.length} leagues
                  </span>
                </div>
                {isExpanded ? <ChevronUp size={16} color="#4a5a6e" /> : <ChevronDown size={16} color="#4a5a6e" />}
              </button>

              {isExpanded && (
                <div className="border-t" style={{ borderColor: '#1e2a38', background: '#070a0f' }}>
                  {/* Leagues */}
                  <div className="px-4 py-3">
                    <p className="font-display font-bold text-xs tracking-wider mb-2" style={{ color: '#4a5a6e', letterSpacing: '0.12em' }}>
                      LEAGUES
                    </p>
                    {config.leagues.map(league => {
                      const leagueKey = `${sport}:${league}`
                      const enabled = enabledLeagues[leagueKey] !== false
                      const teamsExpanded = expandedTeams[leagueKey]

                      return (
                        <div key={league} className="mb-2">
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setExpandedTeams(prev => ({ ...prev, [leagueKey]: !prev[leagueKey] }))}
                                className="p-0.5"
                              >
                                {teamsExpanded ? <ChevronUp size={14} color="#4a5a6e" /> : <ChevronDown size={14} color="#4a5a6e" />}
                              </button>
                              <span className="font-body text-sm" style={{ color: '#f0f2f5' }}>{league}</span>
                            </div>
                            <Toggle checked={enabled} onChange={() => onToggleLeague(leagueKey)} />
                          </div>

                          {teamsExpanded && enabled && (
                            <div className="ml-6 grid grid-cols-2 gap-1 pb-2">
                              {config.teams[league]?.map(team => {
                                const teamSelected = (selectedTeams[`${sport}:${league}`] || []).includes(team)
                                return (
                                  <button
                                    key={team}
                                    onClick={() => onToggleTeam(`${sport}:${league}`, team)}
                                    className="flex items-center gap-1.5 px-2 py-1.5 rounded text-left transition-all"
                                    style={{
                                      background: teamSelected ? 'rgba(245,166,35,0.1)' : '#0d1117',
                                      border: `1px solid ${teamSelected ? 'rgba(245,166,35,0.3)' : '#1e2a38'}`,
                                    }}
                                  >
                                    <TeamSwatch color={getTeamColor(team)} size="sm" />
                                    <span className="font-body text-xs truncate" style={{ color: teamSelected ? '#f5a623' : '#8a9bb0' }}>
                                      {team}
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Stat Views */}
                  <div className="border-t px-4 py-3" style={{ borderColor: '#1e2a38' }}>
                    <p className="font-display font-bold text-xs tracking-wider mb-3" style={{ color: '#4a5a6e', letterSpacing: '0.12em' }}>
                      STAT VIEWS
                    </p>

                    {/* Sort by */}
                    <div className="mb-3">
                      <p className="font-body text-xs mb-2" style={{ color: '#8a9bb0' }}>Sort by</p>
                      <div className="flex flex-wrap gap-1.5">
                        {STATS_OPTIONS[sport].slice(0, 5).map(stat => (
                          <button
                            key={stat}
                            onClick={() => onSetSort(sport, stat)}
                            className="px-2 py-1 rounded text-xs font-body transition-all"
                            style={{
                              background: sort === stat ? '#f5a623' : '#0d1117',
                              color: sort === stat ? '#070a0f' : '#8a9bb0',
                              border: `1px solid ${sort === stat ? '#f5a623' : '#1e2a38'}`,
                              fontWeight: sort === stat ? 700 : 400,
                            }}
                          >
                            {stat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Displayed stats */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-body text-xs" style={{ color: '#8a9bb0' }}>Displayed stats</p>
                        <span className="font-data text-xs" style={{ color: '#4a5a6e' }}>{stats.length}/5</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {STATS_OPTIONS[sport].map(stat => {
                          const active = stats.includes(stat)
                          const atMax = stats.length >= 5
                          const atMin = stats.length <= 3
                          return (
                            <button
                              key={stat}
                              onClick={() => {
                                if (active && atMin) return
                                if (!active && atMax) return
                                onToggleStat(sport, stat)
                              }}
                              className="px-2 py-1 rounded text-xs font-body transition-all"
                              style={{
                                background: active ? 'rgba(245,166,35,0.12)' : '#0d1117',
                                color: active ? '#f5a623' : (!active && atMax) ? '#2a3a4d' : '#8a9bb0',
                                border: `1px solid ${active ? 'rgba(245,166,35,0.3)' : '#1e2a38'}`,
                                opacity: (!active && atMax) || (active && atMin) ? 0.5 : 1,
                              }}
                            >
                              {stat}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Default view */}
                    <div className="mb-3">
                      <p className="font-body text-xs mb-2" style={{ color: '#8a9bb0' }}>Default drive view</p>
                      <div className="flex gap-2">
                        {(['stats', 'scoring'] as const).map(v => (
                          <button
                            key={v}
                            onClick={() => onSetDefaultView(sport, v)}
                            className="flex-1 py-1.5 rounded text-xs font-display font-bold tracking-wide transition-all"
                            style={{
                              background: view === v ? '#f5a623' : '#0d1117',
                              color: view === v ? '#070a0f' : '#8a9bb0',
                              border: `1px solid ${view === v ? '#f5a623' : '#1e2a38'}`,
                            }}
                          >
                            {v === 'stats' ? 'Stats Table' : 'Scoring'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Drive preview */}
                    <div className="rounded-md p-3" style={{ background: '#030507', border: '1px solid #1e2a38' }}>
                      <p className="font-display font-bold text-xs tracking-wider mb-2" style={{ color: '#4a5a6e', letterSpacing: '0.1em' }}>
                        DRIVE PREVIEW
                      </p>
                      {MATCHES.filter(m => m.sport === sport && m.status === 'live').slice(0, 1).map(match => (
                        <div key={match.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-display font-bold text-xs" style={{ color: '#f0f2f5' }}>
                              {match.home.abbr} {match.homeScore} – {match.awayScore} {match.away.abbr}
                            </span>
                            <StatusBadge status="live" />
                          </div>
                          <div className="flex flex-col gap-1">
                            {match.topPlayers.slice(0, 3).map((p, i) => (
                              <div key={p.name} className="flex items-center gap-2">
                                <span className="font-data text-xs w-4" style={{ color: i === 0 ? '#f5a623' : '#4a5a6e' }}>
                                  {i + 1}
                                </span>
                                <TeamSwatch color={getTeamColor(p.team === match.home.abbr ? match.home.name : match.away.name)} size="sm" />
                                <span className="font-body text-xs flex-1 truncate" style={{ color: i === 0 ? '#f5a623' : '#8a9bb0' }}>
                                  {p.name}
                                </span>
                                {stats.slice(0, 3).map(stat => (
                                  <span key={stat} className="font-data text-xs" style={{ color: stat === sort ? '#f5a623' : '#4a5a6e' }}>
                                    {p.stats[stat] ?? '—'}
                                  </span>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {MATCHES.filter(m => m.sport === sport && m.status === 'live').length === 0 && (
                        <p className="font-body text-xs" style={{ color: '#4a5a6e' }}>No live matches</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom buttons */}
      <div className="px-4 pb-4 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-md font-display font-bold tracking-wide text-sm transition-all"
          style={{ background: '#0d1117', color: '#8a9bb0', border: '1px solid #1e2a38' }}
        >
          BACK TO HOME
        </button>
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-md font-display font-bold tracking-wide text-sm transition-all"
          style={{ background: '#f5a623', color: '#070a0f' }}
        >
          SAVE PREFERENCES
        </button>
      </div>
    </MobileShell>
  )
}

// ─── Stats Config Screen ──────────────────────────────────────────────────────

function StatsConfigScreen({
  enabledStats, sortStats,
  onToggleStat, onSetSort,
  onNavigate,
}: {
  enabledStats: Record<string, string[]>
  sortStats: Record<string, string>
  onToggleStat: (sport: string, stat: string) => void
  onSetSort: (sport: string, stat: string) => void
  onNavigate: (s: Screen) => void
}) {
  const [activeSport, setActiveSport] = useState('AFL')
  const sports = ['AFL', 'NRL', 'Cricket', 'Football']
  const stats = enabledStats[activeSport] || DEFAULT_STATS[activeSport]
  const sort = sortStats[activeSport] || DEFAULT_SORT[activeSport]
  const liveMatch = MATCHES.find(m => m.sport === activeSport && m.status === 'live')

  return (
    <MobileShell current="stats" onNavigate={onNavigate}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: '#1e2a38' }}>
        <SlidersHorizontal size={18} color="#f5a623" />
        <h1 className="font-display font-bold tracking-wide" style={{ color: '#f0f2f5', letterSpacing: '0.08em' }}>
          STATS CONFIG
        </h1>
      </div>

      {/* Sport tabs */}
      <div className="flex border-b" style={{ borderColor: '#1e2a38' }}>
        {sports.map(sport => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className="flex-1 py-2.5 font-display font-bold text-xs tracking-wide transition-all"
            style={{
              color: activeSport === sport ? '#f5a623' : '#4a5a6e',
              borderBottom: activeSport === sport ? '2px solid #f5a623' : '2px solid transparent',
              background: 'transparent',
            }}
          >
            {sport}
          </button>
        ))}
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Sort order */}
        <div className="rounded-md p-4" style={{ background: '#0d1117', border: '1px solid #1e2a38' }}>
          <p className="font-display font-bold text-xs tracking-wider mb-3" style={{ color: '#4a5a6e', letterSpacing: '0.12em' }}>
            SORT ORDER
          </p>
          <div className="flex flex-wrap gap-2">
            {STATS_OPTIONS[activeSport].map(stat => (
              <button
                key={stat}
                onClick={() => onSetSort(activeSport, stat)}
                className="px-3 py-1.5 rounded text-xs font-display font-bold tracking-wide transition-all"
                style={{
                  background: sort === stat ? '#f5a623' : '#111820',
                  color: sort === stat ? '#070a0f' : '#8a9bb0',
                  border: `1px solid ${sort === stat ? '#f5a623' : '#1e2a38'}`,
                }}
              >
                {stat}
              </button>
            ))}
          </div>
        </div>

        {/* Displayed stats */}
        <div className="rounded-md p-4" style={{ background: '#0d1117', border: '1px solid #1e2a38' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-bold text-xs tracking-wider" style={{ color: '#4a5a6e', letterSpacing: '0.12em' }}>
              DISPLAYED STATS
            </p>
            <span className="font-data text-xs" style={{ color: '#4a5a6e' }}>
              {stats.length} / 5 &nbsp;
              <span style={{ color: '#2a3a4d' }}>min 3</span>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {STATS_OPTIONS[activeSport].map(stat => {
              const active = stats.includes(stat)
              const atMax = stats.length >= 5
              const atMin = stats.length <= 3
              return (
                <div key={stat} className="flex items-center justify-between py-1">
                  <span className="font-body text-sm" style={{ color: active ? '#f0f2f5' : '#4a5a6e' }}>{stat}</span>
                  <Toggle
                    checked={active}
                    onChange={() => {
                      if (active && atMin) return
                      if (!active && atMax) return
                      onToggleStat(activeSport, stat)
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* In-car preview */}
        <div className="rounded-md overflow-hidden" style={{ border: '1px solid #1e2a38' }}>
          <div className="px-3 py-2 flex items-center justify-between" style={{ background: '#030507' }}>
            <div className="flex items-center gap-2">
              <Car size={14} color="#f5a623" />
              <span className="font-display font-bold text-xs tracking-wider" style={{ color: '#f5a623', letterSpacing: '0.1em' }}>
                IN-CAR PREVIEW
              </span>
            </div>
            <StatusBadge status={liveMatch ? 'live' : 'upcoming'} />
          </div>

          {liveMatch ? (
            <div className="p-3" style={{ background: '#030507' }}>
              {/* Score */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: '#1e2a38' }}>
                <div className="flex items-center gap-2">
                  <TeamSwatch color={liveMatch.home.color} altColor={liveMatch.home.altColor} size="sm" />
                  <span className="font-display font-bold text-sm" style={{ color: '#f0f2f5' }}>{liveMatch.home.abbr}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-data font-bold text-xl" style={{ color: '#f5a623' }}>{liveMatch.homeScore}</span>
                  <span className="font-data text-sm" style={{ color: '#4a5a6e' }}>–</span>
                  <span className="font-data font-bold text-xl" style={{ color: '#f0f2f5' }}>{liveMatch.awayScore}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm" style={{ color: '#f0f2f5' }}>{liveMatch.away.abbr}</span>
                  <TeamSwatch color={liveMatch.away.color} altColor={liveMatch.away.altColor} size="sm" />
                </div>
              </div>

              {/* Top performers */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 text-xs font-data" style={{ color: '#4a5a6e' }}>#</span>
                  <span className="flex-1 text-xs font-body" style={{ color: '#4a5a6e' }}>Player</span>
                  {stats.slice(0, 3).map(s => (
                    <span key={s} className="w-10 text-right text-xs font-data"
                      style={{ color: s === sort ? '#f5a623' : '#4a5a6e' }}>
                      {s.slice(0, 4)}
                    </span>
                  ))}
                </div>
                {liveMatch.topPlayers
                  .sort((a, b) => Number(b.stats[sort] || 0) - Number(a.stats[sort] || 0))
                  .slice(0, 4)
                  .map((p, i) => (
                    <div key={p.name} className="flex items-center gap-2 py-1">
                      <span className="w-5 text-xs font-data" style={{ color: i === 0 ? '#f5a623' : '#4a5a6e' }}>
                        {i + 1}
                      </span>
                      <TeamSwatch color={getTeamColor(p.team === liveMatch.home.abbr ? liveMatch.home.name : liveMatch.away.name)} size="sm" />
                      <span className="flex-1 text-xs font-body truncate" style={{ color: i === 0 ? '#f5a623' : '#8a9bb0' }}>
                        {p.name}
                      </span>
                      {stats.slice(0, 3).map(s => (
                        <span key={s} className="w-10 text-right text-xs font-data"
                          style={{ color: s === sort ? (i === 0 ? '#f5a623' : '#f0f2f5') : '#4a5a6e' }}>
                          {p.stats[s] ?? '—'}
                        </span>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center" style={{ background: '#030507' }}>
              <p className="font-body text-sm" style={{ color: '#4a5a6e' }}>No live {activeSport} matches</p>
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
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: '#1e2a38' }}>
        <Settings size={18} color="#f5a623" />
        <h1 className="font-display font-bold tracking-wide" style={{ color: '#f0f2f5', letterSpacing: '0.08em' }}>
          SETTINGS
        </h1>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Data Refresh */}
        <div className="rounded-md p-4" style={{ background: '#0d1117', border: '1px solid #1e2a38' }}>
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw size={14} color="#f5a623" />
            <p className="font-display font-bold text-xs tracking-wider" style={{ color: '#8a9bb0', letterSpacing: '0.12em' }}>
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
                  background: refreshInterval === v ? '#f5a623' : '#111820',
                  color: refreshInterval === v ? '#070a0f' : '#8a9bb0',
                  border: `1px solid ${refreshInterval === v ? '#f5a623' : '#1e2a38'}`,
                }}
              >
                {v}s
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-md p-4" style={{ background: '#0d1117', border: '1px solid #1e2a38' }}>
          <div className="flex items-center gap-2 mb-3">
            <Bell size={14} color="#f5a623" />
            <p className="font-display font-bold text-xs tracking-wider" style={{ color: '#8a9bb0', letterSpacing: '0.12em' }}>
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
                <span className="font-body text-sm" style={{ color: '#f0f2f5' }}>{item.label}</span>
                <Toggle
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={v => setNotifications(prev => ({ ...prev, [item.key]: v }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="rounded-md p-4" style={{ background: '#0d1117', border: '1px solid #1e2a38' }}>
          <div className="flex items-center gap-2 mb-3">
            <User size={14} color="#f5a623" />
            <p className="font-display font-bold text-xs tracking-wider" style={{ color: '#8a9bb0', letterSpacing: '0.12em' }}>
              ACCOUNT
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: '#1e2a38' }}>
              <div className="flex items-center gap-2">
                <User size={16} color="#4a5a6e" />
                <span className="font-body text-sm" style={{ color: '#f0f2f5' }}>Profile</span>
              </div>
              <span className="font-body text-xs" style={{ color: '#4a5a6e' }}>user@example.com</span>
            </div>
            <button className="flex items-center justify-between py-2.5 border-b w-full" style={{ borderColor: '#1e2a38' }}>
              <div className="flex items-center gap-2">
                <CreditCard size={16} color="#f5a623" />
                <span className="font-body text-sm" style={{ color: '#f5a623' }}>Go Ad-Free</span>
              </div>
              <span className="font-data text-xs font-bold" style={{ color: '#f5a623' }}>$4.99/mo</span>
            </button>
            <button className="flex items-center gap-2 py-2.5 w-full">
              <LogOut size={16} color="#ff4d4d" />
              <span className="font-body text-sm" style={{ color: '#ff4d4d' }}>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-6 text-center">
        <p className="font-body text-xs" style={{ color: '#2a3a4d' }}>ScoreDrive v1.0.0</p>
        <p className="font-body text-xs mt-0.5" style={{ color: '#2a3a4d' }}>Built for the road. Stay safe.</p>
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
            stroke="#1e2a38" strokeWidth={0.5} strokeDasharray="4,4" />
        ))}

        {/* Away line */}
        <path d={awayPath} fill="none" stroke="#8a9bb0" strokeWidth={1.5} strokeLinejoin="round" />

        {/* Home line (amber) */}
        <path d={homePath} fill="none" stroke="#f5a623" strokeWidth={2} strokeLinejoin="round" />

        {/* Wicket markers for cricket */}
        {match.sport === 'Cricket' && prog.wickets && prog.wickets.map((w, i) => {
          if (i === 0) return null
          const prevW = prog.wickets![i - 1]
          if (w > prevW) {
            return (
              <circle key={i} cx={getX(i)} cy={getY(prog.homeScores[i])}
                r={4} fill="#ff4d4d" stroke="#030507" strokeWidth={1} />
            )
          }
          return null
        })}

        {/* Period markers */}
        {prog.periods.map((p, i) => (
          <g key={p}>
            <line x1={getX(i)} y1={height - 12} x2={getX(i)} y2={height}
              stroke="#2a3a4d" strokeWidth={1} />
            <text x={getX(i)} y={height} textAnchor="middle"
              fill="#4a5a6e" fontSize={8} fontFamily="DM Mono">
              {p}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5" style={{ background: '#f5a623' }} />
          <span className="font-data text-xs" style={{ color: '#f5a623' }}>{match.home.abbr}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5" style={{ background: '#8a9bb0' }} />
          <span className="font-data text-xs" style={{ color: '#8a9bb0' }}>{match.away.abbr}</span>
        </div>
        {match.sport === 'Cricket' && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#ff4d4d' }} />
            <span className="font-data text-xs" style={{ color: '#ff4d4d' }}>Wicket</span>
          </div>
        )}
      </div>
    </div>
  )
}

function CricketBalls({ balls }: { balls: CricketBall[] }) {
  const colors: Record<string, { bg: string; text: string }> = {
    'dot': { bg: '#1e2a38', text: '#4a5a6e' },
    '1': { bg: '#111820', text: '#8a9bb0' },
    '2': { bg: '#111820', text: '#8a9bb0' },
    '3': { bg: '#111820', text: '#f0f2f5' },
    '4': { bg: 'rgba(245,166,35,0.2)', text: '#f5a623' },
    '6': { bg: 'rgba(0,229,122,0.2)', text: '#00e57a' },
    'W': { bg: 'rgba(255,77,77,0.2)', text: '#ff4d4d' },
    'wd': { bg: '#111820', text: '#8a9bb0' },
    'nb': { bg: '#111820', text: '#8a9bb0' },
  }

  return (
    <div className="flex items-center gap-2">
      {balls.map((ball, i) => {
        const c = colors[ball.outcome] || colors['dot']
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
      <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: '#1e2a38' }}>
        <span className="w-6 font-data text-xs" style={{ color: '#4a5a6e' }}>#</span>
        <div className="w-5" />
        <span className="flex-1 font-body text-xs" style={{ color: '#4a5a6e' }}>Player</span>
        {stats.map(s => (
          <span key={s} className="w-12 text-right font-data text-xs font-bold"
            style={{ color: s === sort ? '#f5a623' : '#4a5a6e' }}>
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
              borderColor: '#0d1117',
              background: i === 0 ? 'rgba(245,166,35,0.05)' : 'transparent',
            }}
          >
            <span className="w-6 font-data text-sm font-bold"
              style={{ color: i === 0 ? '#f5a623' : '#4a5a6e' }}>
              {i + 1}
            </span>
            <TeamSwatch
              color={getTeamColor(player.team === match.home.abbr ? match.home.name : match.away.name)}
              size="sm"
            />
            <span className="flex-1 font-body text-sm truncate"
              style={{ color: i === 0 ? '#f5a623' : '#f0f2f5' }}>
              {player.name}
            </span>
            {stats.map(s => (
              <span key={s} className="w-12 text-right font-data text-sm"
                style={{ color: s === sort ? (i === 0 ? '#f5a623' : '#f0f2f5') : '#8a9bb0' }}>
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
        <p className="font-display font-bold text-xs tracking-wider mb-2" style={{ color: '#4a5a6e', letterSpacing: '0.1em' }}>
          {match.sport === 'Cricket' ? 'WORM CHART' : 'SCORE PROGRESSION'}
        </p>
        <WormChart match={match} />
      </div>

      {/* Recent events */}
      <div>
        <p className="font-display font-bold text-xs tracking-wider mb-2" style={{ color: '#4a5a6e', letterSpacing: '0.1em' }}>
          {match.sport === 'Cricket' ? 'LAST 6 BALLS' : 'RECENT EVENTS'}
        </p>

        {match.sport === 'Cricket' && match.cricketBalls && (
          <div>
            <CricketBalls balls={match.cricketBalls} />
            {match.batters && (
              <div className="mt-3 flex gap-4">
                {match.batters.map(b => (
                  <div key={b.name} className="flex items-center gap-2">
                    <span className="font-body text-xs" style={{ color: '#8a9bb0' }}>{b.name}</span>
                    <span className="font-data text-sm font-bold" style={{ color: '#f5a623' }}>{b.runs}</span>
                    <span className="font-data text-xs" style={{ color: '#4a5a6e' }}>({b.balls})</span>
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
                <span className="font-data text-xs w-8" style={{ color: '#4a5a6e' }}>{ev.time}'</span>
                <TeamSwatch
                  color={ev.team === 'home' ? match.home.color : match.away.color}
                  size="sm"
                />
                <span className="font-body text-xs" style={{ color: '#f0f2f5' }}>{ev.player}</span>
                <span className="ml-auto font-data text-xs px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(0,229,122,0.12)', color: '#00e57a' }}>
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
        style={{ background: 'rgba(245,166,35,0.12)', color: '#f5a623', border: '1px solid rgba(245,166,35,0.25)' }}>
        {match.league}
      </div>

      {/* Teams */}
      <div className="flex items-center gap-6 w-full">
        <div className="flex-1 flex flex-col items-center gap-2">
          <TeamSwatch color={match.home.color} altColor={match.home.altColor} size="lg" />
          <span className="font-display font-black text-2xl tracking-wide" style={{ color: '#f0f2f5' }}>
            {match.home.abbr}
          </span>
          <span className="font-body text-xs text-center" style={{ color: '#8a9bb0' }}>{match.home.name}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="font-display font-bold text-lg" style={{ color: '#4a5a6e' }}>VS</span>
        </div>

        <div className="flex-1 flex flex-col items-center gap-2">
          <TeamSwatch color={match.away.color} altColor={match.away.altColor} size="lg" />
          <span className="font-display font-black text-2xl tracking-wide" style={{ color: '#f0f2f5' }}>
            {match.away.abbr}
          </span>
          <span className="font-body text-xs text-center" style={{ color: '#8a9bb0' }}>{match.away.name}</span>
        </div>
      </div>

      {/* Countdown */}
      <div className="flex flex-col items-center gap-1">
        <span className="font-display font-bold text-xs tracking-wider" style={{ color: '#4a5a6e', letterSpacing: '0.12em' }}>
          STARTS IN
        </span>
        <span className="font-data font-bold text-3xl animate-countdown" style={{ color: '#f5a623' }}>
          {countdown}
        </span>
        <span className="font-body text-xs" style={{ color: '#4a5a6e' }}>{match.startTime}</span>
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
      style={{ background: '#030507' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
        style={{ borderColor: '#1e2a38' }}>
        <div className="flex items-center gap-2">
          <StatusBadge status={match.status} />
          <span className="font-display font-bold text-xs tracking-wider px-2 py-0.5 rounded"
            style={{ background: '#111820', color: '#8a9bb0', border: '1px solid #1e2a38' }}>
            {match.league}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {(['full', 'half', 'quarter'] as DisplayMode[]).map(m => (
            <ModeIcon key={m} mode={m} active={displayMode === m} onClick={() => setDisplayMode(m)} />
          ))}
          <button onClick={onBack} className="ml-2 p-1.5 rounded" style={{ background: '#111820', border: '1px solid #1e2a38' }}>
            <X size={14} color="#8a9bb0" />
          </button>
        </div>
      </div>

      {/* Score section */}
      <div className="flex-shrink-0 border-b" style={{ height: `${scorePct}%`, borderColor: '#1e2a38' }}>
        {isUpcoming ? (
          <UpcomingMatchCard match={match} />
        ) : (
          <div className="flex items-center justify-center h-full px-4 gap-4">
            {/* Home team */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <TeamSwatch color={match.home.color} altColor={match.home.altColor} size="lg" />
              <span className="font-display font-black tracking-wide"
                style={{ fontSize: displayMode === 'full' ? 20 : 16, color: '#f0f2f5' }}>
                {match.home.abbr}
              </span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-baseline gap-3">
                <span className="font-data font-bold"
                  style={{ fontSize: displayMode === 'full' ? 56 : 40, color: '#f5a623', lineHeight: 1 }}>
                  {match.homeScore}
                </span>
                <span className="font-data" style={{ fontSize: 20, color: '#2a3a4d' }}>–</span>
                <span className="font-data font-bold"
                  style={{ fontSize: displayMode === 'full' ? 56 : 40, color: '#f0f2f5', lineHeight: 1 }}>
                  {match.awayScore}
                </span>
              </div>
              <span className="font-body text-xs" style={{ color: '#4a5a6e' }}>{match.time}</span>
              {match.period && (
                <span className="font-display font-bold text-xs tracking-wider" style={{ color: '#8a9bb0' }}>
                  {match.period}
                </span>
              )}
            </div>

            {/* Away team */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <TeamSwatch color={match.away.color} altColor={match.away.altColor} size="lg" />
              <span className="font-display font-black tracking-wide"
                style={{ fontSize: displayMode === 'full' ? 20 : 16, color: '#f0f2f5' }}>
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
        style={{ borderColor: '#1e2a38', background: '#030507' }}>
        {/* Prev/Next */}
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="p-2 rounded" style={{ background: '#111820', border: '1px solid #1e2a38' }}>
            <ChevronLeft size={16} color="#8a9bb0" />
          </button>
          <button onClick={goNext} className="p-2 rounded" style={{ background: '#111820', border: '1px solid #1e2a38' }}>
            <ChevronRight size={16} color="#8a9bb0" />
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
                background: i === matchIndex ? '#f5a623' : '#2a3a4d',
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
              background: '#111820',
              color: '#f5a623',
              border: '1px solid #1e2a38',
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
      <div className="h-full" style={{ background: '#030507' }}>
        {renderCarplayContent()}
      </div>
    )
  }

  if (displayMode === 'half') {
    return (
      <div className="h-full flex" style={{ background: '#030507' }}>
        <div className="flex-1 border-r" style={{ borderColor: '#1e2a38' }}>
          {renderCarplayContent()}
        </div>
        <div className="flex-1 flex items-center justify-center" style={{ background: '#0a0a0a' }}>
          <div className="text-center">
            <LayoutTemplate size={32} color="#1e2a38" className="mx-auto mb-2" />
            <p className="font-body text-xs" style={{ color: '#2a3a4d' }}>Other App</p>
          </div>
        </div>
      </div>
    )
  }

  // Quarter mode
  return (
    <div className="h-full grid grid-cols-2 grid-rows-2" style={{ background: '#030507' }}>
      <div className="border-r border-b" style={{ borderColor: '#1e2a38' }}>
        {renderCarplayContent()}
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className={cn(
          'flex items-center justify-center',
          i === 1 ? 'border-b' : '',
          i === 2 ? 'border-r' : '',
        )} style={{ borderColor: '#1e2a38', background: '#0a0a0a' }}>
          <div className="text-center">
            <Grid2X2 size={24} color="#1e2a38" className="mx-auto mb-1" />
            <p className="font-body text-xs" style={{ color: '#2a3a4d', fontSize: 10 }}>Other App</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash')

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
            matches={MATCHES}
            onNavigate={navigate}
            onCarplay={() => setCurrentScreen('carplay')}
          />
        )

      case 'sports':
        return (
          <SportsSelectionScreen
            enabledLeagues={enabledLeagues}
            selectedTeams={selectedTeams}
            enabledStats={enabledStats}
            sortStats={sortStats}
            defaultView={defaultView}
            onToggleLeague={handleToggleLeague}
            onToggleTeam={handleToggleTeam}
            onToggleStat={handleToggleStat}
            onSetSort={handleSetSort}
            onSetDefaultView={handleSetDefaultView}
            onNavigate={navigate}
            onBack={() => setCurrentScreen('home')}
          />
        )

      case 'stats':
        return (
          <StatsConfigScreen
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
            matches={MATCHES}
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
    <div className="h-full w-full overflow-hidden" style={{ background: '#070a0f' }}>
      {renderScreen()}
    </div>
  )
}
