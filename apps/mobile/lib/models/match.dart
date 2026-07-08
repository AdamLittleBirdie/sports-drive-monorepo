class Match {
  final String id;
  final String homeTeam;
  final String awayTeam;
  final int homeScore;
  final int awayScore;
  final String sport;
  final DateTime? matchDate;
  final String status;
  final String round;

  Match({
    required this.id,
    required this.homeTeam,
    required this.awayTeam,
    required this.homeScore,
    required this.awayScore,
    required this.sport,
    required this.matchDate,
    required this.status,
    required this.round,
  });

  /// Extracts a total score from a value that may be an [int] or an AFL score
  /// object with [goals] and [behinds] fields (total = goals * 6 + behinds).
  static int _parseScore(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    if (value is Map) {
      final goals = (value['goals'] as num?)?.toInt() ?? 0;
      final behinds = (value['behinds'] as num?)?.toInt() ?? 0;
      // Fall back to a generic 'points' or 'total' field if present.
      if (value.containsKey('points')) {
        return (value['points'] as num?)?.toInt() ?? 0;
      }
      if (value.containsKey('total')) {
        return (value['total'] as num?)?.toInt() ?? 0;
      }
      return goals * 6 + behinds;
    }
    return 0;
  }

  factory Match.fromJson(Map<String, dynamic> json) {
    // home_team / away_team are full Team objects; extract the name field.
    final homeTeamRaw = json['home_team'];
    final awayTeamRaw = json['away_team'];
    final String homeTeam = homeTeamRaw is Map
        ? (homeTeamRaw['name'] as String? ?? 'Unknown')
        : (homeTeamRaw as String? ?? 'Unknown');
    final String awayTeam = awayTeamRaw is Map
        ? (awayTeamRaw['name'] as String? ?? 'Unknown')
        : (awayTeamRaw as String? ?? 'Unknown');

    // id comes as a number from the API; convert to String for display.
    final String id = json['id']?.toString() ?? '';

    // date field is 'date' (ISO 8601 string) and may be null.
    final String? dateStr = json['date'] as String?;
    final DateTime? matchDate =
        dateStr != null ? DateTime.tryParse(dateStr) : null;

    return Match(
      id: id,
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      homeScore: _parseScore(json['home_score']),
      awayScore: _parseScore(json['away_score']),
      sport: json['sport'] as String? ?? 'Unknown',
      matchDate: matchDate,
      status: json['status'] as String? ?? 'scheduled',
      round: json['round'] as String? ?? '',
    );
  }
}
