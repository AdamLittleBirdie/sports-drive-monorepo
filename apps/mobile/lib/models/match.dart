class Match {
  final String id;
  final String homeTeam;
  final String awayTeam;
  final int homeScore;
  final int awayScore;
  final String league;
  final DateTime matchDate;
  final String status;

  Match({
    required this.id,
    required this.homeTeam,
    required this.awayTeam,
    required this.homeScore,
    required this.awayScore,
    required this.league,
    required this.matchDate,
    required this.status,
  });

  factory Match.fromJson(Map<String, dynamic> json) {
    return Match(
      id: json['id'] ?? '',
      homeTeam: json['home_team'] ?? 'Unknown',
      awayTeam: json['away_team'] ?? 'Unknown',
      homeScore: json['home_score'] ?? 0,
      awayScore: json['away_score'] ?? 0,
      league: json['league'] ?? 'Unknown',
      matchDate: DateTime.parse(json['match_date'] ?? DateTime.now().toIso8601String()),
      status: json['status'] ?? 'scheduled',
    );
  }
}
