import 'package:flutter/material.dart';

/// Team color map extracted from the web version's TEAM_COLORS constant.
/// Covers AFL, NRL, Cricket (Test/BBL/IPL), Football (PL/La Liga/WC), and NBA.

const Color _fallback = Color(0xFF2A3A4D); // cockpitMuted

const Map<String, Color> kTeamColors = {
  // ── AFL ──────────────────────────────────────────────────────────────────
  'Adelaide': Color(0xFF002B5C),
  'Brisbane Lions': Color(0xFFA30046),
  'Carlton': Color(0xFF0E1E2D),
  'Collingwood': Color(0xFF000000),
  'Essendon': Color(0xFFCC2031),
  'Fremantle': Color(0xFF2A1A5E),
  'Geelong': Color(0xFF1C3C6B),
  'Gold Coast': Color(0xFFE8222A),
  'GWS Giants': Color(0xFFF47920),
  'Hawthorn': Color(0xFF4D2004),
  'Melbourne': Color(0xFFCC2031),
  'North Melbourne': Color(0xFF003087),
  'Port Adelaide': Color(0xFF008AAB),
  'Richmond': Color(0xFFFFD200),
  'St Kilda': Color(0xFFED0F05),
  'Sydney': Color(0xFFE2001A),
  'West Coast': Color(0xFF002B7F),
  'Western Bulldogs': Color(0xFF014896),

  // ── NRL ──────────────────────────────────────────────────────────────────
  'Broncos': Color(0xFF4D0000),
  'Raiders': Color(0xFF6ABE45),
  'Bulldogs': Color(0xFF0057A8),
  'Sharks': Color(0xFF00B2A9),
  'Titans': Color(0xFF009FDF),
  'Sea Eagles': Color(0xFF6F1F7B),
  'Storm': Color(0xFF4B0082),
  'Knights': Color(0xFF003087),
  'Cowboys': Color(0xFF003087),
  'Eels': Color(0xFFFFD200),
  'Panthers': Color(0xFF231F20),
  'Rabbitohs': Color(0xFF006B3F),
  'Dragons': Color(0xFFE8222A),
  'Roosters': Color(0xFF003087),
  'Warriors': Color(0xFF231F20),
  'Tigers': Color(0xFFFF6600),
  'Dolphins': Color(0xFFE8222A),

  // ── Cricket — Test nations ────────────────────────────────────────────────
  'Australia': Color(0xFFFFD200),
  'England': Color(0xFF003087),
  'India': Color(0xFF003087),
  'Pakistan': Color(0xFF006B3F),
  'New Zealand': Color(0xFF000000),
  'South Africa': Color(0xFF006B3F),
  'West Indies': Color(0xFF8B0000),
  'Sri Lanka': Color(0xFF003087),
  'Bangladesh': Color(0xFF006B3F),
  'Afghanistan': Color(0xFF003087),
  'Zimbabwe': Color(0xFF006B3F),
  'Ireland': Color(0xFF006B3F),

  // ── Cricket — BBL ─────────────────────────────────────────────────────────
  'Adelaide Strikers': Color(0xFF003087),
  'Brisbane Heat': Color(0xFFFF6600),
  'Hobart Hurricanes': Color(0xFF6F1F7B),
  'Melbourne Renegades': Color(0xFFCC2031),
  'Melbourne Stars': Color(0xFF006B3F),
  'Perth Scorchers': Color(0xFFFF6600),
  'Sydney Sixers': Color(0xFFFF69B4),
  'Sydney Thunder': Color(0xFFFFD200),

  // ── Cricket — IPL ─────────────────────────────────────────────────────────
  'Mumbai Indians': Color(0xFF003087),
  'Chennai Super Kings': Color(0xFFFFD200),
  'Royal Challengers': Color(0xFFCC2031),
  'Kolkata Knight Riders': Color(0xFF6F1F7B),
  'Delhi Capitals': Color(0xFF003087),
  'Punjab Kings': Color(0xFFCC2031),
  'Rajasthan Royals': Color(0xFFFF69B4),
  'Sunrisers Hyderabad': Color(0xFFFF6600),

  // ── Football — Premier League ─────────────────────────────────────────────
  'Arsenal': Color(0xFFEF0107),
  'Aston Villa': Color(0xFF95BFE5),
  'Bournemouth': Color(0xFFDA291C),
  'Brentford': Color(0xFFE30613),
  'Brighton': Color(0xFF0057B8),
  'Chelsea': Color(0xFF034694),
  'Crystal Palace': Color(0xFF1B458F),
  'Everton': Color(0xFF003399),
  'Fulham': Color(0xFF000000),
  'Ipswich': Color(0xFF3A64A3),
  'Leicester': Color(0xFF003090),
  'Liverpool': Color(0xFFC8102E),
  'Man City': Color(0xFF6CABDD),
  'Man United': Color(0xFFDA291C),
  'Newcastle': Color(0xFF241F20),
  'Nottm Forest': Color(0xFFDD0000),
  'Southampton': Color(0xFFD71920),
  'Spurs': Color(0xFF132257),
  'West Ham': Color(0xFF7A263A),
  'Wolves': Color(0xFFFDB913),

  // ── Football — La Liga ────────────────────────────────────────────────────
  'Real Madrid': Color(0xFFFEBE10),
  'Barcelona': Color(0xFFA50044),
  'Atletico Madrid': Color(0xFFCB3524),
  'Sevilla': Color(0xFFD71920),
  'Valencia': Color(0xFFFF7F00),
  'Villarreal': Color(0xFFFFD200),
  'Athletic Bilbao': Color(0xFFCC2031),
  'Real Sociedad': Color(0xFF003087),
  'Betis': Color(0xFF006B3F),
  'Osasuna': Color(0xFFCC2031),

  // ── Football — Champions League extras ───────────────────────────────────
  'Bayern Munich': Color(0xFFDC052D),
  'PSG': Color(0xFF004170),
  'Juventus': Color(0xFF000000),
  'AC Milan': Color(0xFFAC0000),
  'Inter Milan': Color(0xFF010E80),
  'Dortmund': Color(0xFFFFE500),

  // ── Football — World Cup 2026 ─────────────────────────────────────────────
  'Argentina': Color(0xFF75AADB),
  'France': Color(0xFF002395),
  'Brazil': Color(0xFF009C3B),
  'Germany': Color(0xFF000000),
  'Spain': Color(0xFFFFC400),
  'Italy': Color(0xFF009246),
  'Netherlands': Color(0xFFFF6600),
  'Belgium': Color(0xFF000000),
  'Portugal': Color(0xFF006600),
  'Mexico': Color(0xFF006600),
  'USA': Color(0xFF002868),
  'Canada': Color(0xFFFF0000),
  'Uruguay': Color(0xFF0066CC),
  'Japan': Color(0xFFBC002D),
  'South Korea': Color(0xFFC60C30),
  'Morocco': Color(0xFFC1272D),
  'Senegal': Color(0xFF00853F),
  'Croatia': Color(0xFFFF0000),
  'Switzerland': Color(0xFFFF0000),

  // ── NBA ───────────────────────────────────────────────────────────────────
  'Atlanta Hawks': Color(0xFFE03A3E),
  'Boston Celtics': Color(0xFF007A33),
  'Brooklyn Nets': Color(0xFF000000),
  'Charlotte Hornets': Color(0xFF1D1160),
  'Chicago Bulls': Color(0xFFCE1141),
  'Cleveland Cavaliers': Color(0xFF860038),
  'Dallas Mavericks': Color(0xFF00538C),
  'Denver Nuggets': Color(0xFF0E2240),
  'Detroit Pistons': Color(0xFFC8102E),
  'Golden State Warriors': Color(0xFF1D428A),
  'Houston Rockets': Color(0xFFCE1141),
  'Indiana Pacers': Color(0xFF002D62),
  'LA Clippers': Color(0xFFC8102E),
  'LA Lakers': Color(0xFF552583),
  'Memphis Grizzlies': Color(0xFF5D76A9),
  'Miami Heat': Color(0xFF98002E),
  'Milwaukee Bucks': Color(0xFF00471B),
  'Minnesota Timberwolves': Color(0xFF0C2340),
  'New Orleans Pelicans': Color(0xFF0C2340),
  'New York Knicks': Color(0xFF006BB6),
  'Oklahoma City Thunder': Color(0xFF007AC1),
  'Orlando Magic': Color(0xFF0077C0),
  'Philadelphia 76ers': Color(0xFF006BB6),
  'Phoenix Suns': Color(0xFF1D1160),
  'Portland Trail Blazers': Color(0xFFE03A3E),
  'Sacramento Kings': Color(0xFF5A2D81),
  'San Antonio Spurs': Color(0xFFC4CED4),
  'Toronto Raptors': Color(0xFFCE1141),
  'Utah Jazz': Color(0xFF002B5C),
  'Washington Wizards': Color(0xFF002B5C),
};

/// Returns the team's brand color, or a neutral cockpit fallback.
Color getTeamColor(String teamName) {
  return kTeamColors[teamName] ?? _fallback;
}

/// Returns a readable text color (white or near-black) for a given team color.
Color getTeamTextColor(Color teamColor) {
  // Use luminance to decide contrast color
  return teamColor.computeLuminance() > 0.35
      ? const Color(0xFF070A0F) // dark text on light backgrounds
      : const Color(0xFFF0F2F5); // light text on dark backgrounds
}
