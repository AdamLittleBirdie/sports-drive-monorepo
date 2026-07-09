class Match {
  final String id;
  final String homeTeam;
  final String awayTeam;
  final String homeTeamAbbr;
  final String awayTeamAbbr;
  final String? homeTeamLogo;
  final String? awayTeamLogo;
  final int homeTeamId;
  final int awayTeamId;
  final int homeScore;
  final int awayScore;
  final String sport;
  final String league;
  final DateTime? matchDate;
  final String status;
  final String round;
  final String? period;
  final String? periodTime;

  Match({
    required this.id,
    required this.homeTeam,
    required this.awayTeam,
    this.homeTeamAbbr = '',
    this.awayTeamAbbr = '',
    this.homeTeamLogo,
    this.awayTeamLogo,
    this.homeTeamId = 0,
    this.awayTeamId = 0,
    required this.homeScore,
    required this.awayScore,
    required this.sport,
    this.league = '',
    required this.matchDate,
    required this.status,
    required this.round,
    this.period,
    this.periodTime,
  });

  /// Extracts a total score from a value that may be a [num] or an AFL score
  /// object with [goals] and [behinds] fields (total = goals * 6 + behinds).
  ///
  /// Fix: handles both [int] and [double] since Dart's JSON decoder may return
  /// either depending on the value (e.g. 14 vs 14.0). Using [num] covers both.
  static int _parseScore(dynamic value) {
    if (value == null) return 0;
    // Handle both int and double — Dart's JSON decoder may return either.
    if (value is num) return value.toInt();
    if (value is Map) {
      // Fall back to a generic 'points' or 'total' field if present.
      if (value.containsKey('points')) {
        return (value['points'] as num?)?.toInt() ?? 0;
      }
      if (value.containsKey('total')) {
        return (value['total'] as num?)?.toInt() ?? 0;
      }
      final goals = (value['goals'] as num?)?.toInt() ?? 0;
      final behinds = (value['behinds'] as num?)?.toInt() ?? 0;
      return goals * 6 + behinds;
    }
    return 0;
  }

  /// Normalises an API status string to one of the three canonical values.
  ///
  /// The API should return 'scheduled', 'in_progress', or 'completed', but
  /// guard against alternate spellings (e.g. 'live', 'finished', 'ft') so
  /// status badges always render correctly.
  static String _normaliseStatus(String? raw) {
    switch ((raw ?? '').toLowerCase()) {
      case 'in_progress':
      case 'live':
      case 'inprogress':
        return 'in_progress';
      case 'completed':
      case 'finished':
      case 'ft':
      case 'final':
        return 'completed';
      case 'scheduled':
      case 'upcoming':
      case 'pre':
      default:
        return 'scheduled';
    }
  }

  factory Match.fromJson(Map<String, dynamic> json) {
    // home_team / away_team are full Team objects; extract fields.
    final homeTeamRaw = json['home_team'];
    final awayTeamRaw = json['away_team'];

    final String homeTeam = homeTeamRaw is Map
        ? (homeTeamRaw['name'] as String? ?? 'Unknown')
        : (homeTeamRaw as String? ?? 'Unknown');
    final String awayTeam = awayTeamRaw is Map
        ? (awayTeamRaw['name'] as String? ?? 'Unknown')
        : (awayTeamRaw as String? ?? 'Unknown');

    final String homeTeamAbbr = homeTeamRaw is Map
        ? (homeTeamRaw['abbreviation'] as String? ?? '')
        : '';
    final String awayTeamAbbr = awayTeamRaw is Map
        ? (awayTeamRaw['abbreviation'] as String? ?? '')
        : '';

    final String? homeTeamLogo = homeTeamRaw is Map
        ? (homeTeamRaw['logo_url'] as String?)
        : null;
    final String? awayTeamLogo = awayTeamRaw is Map
        ? (awayTeamRaw['logo_url'] as String?)
        : null;

    final int homeTeamId = homeTeamRaw is Map
        ? ((homeTeamRaw['id'] as num?)?.toInt() ?? 0)
        : (json['home_team_id'] as num?)?.toInt() ?? 0;
    final int awayTeamId = awayTeamRaw is Map
        ? ((awayTeamRaw['id'] as num?)?.toInt() ?? 0)
        : (json['away_team_id'] as num?)?.toInt() ?? 0;

    // id comes as a number from the API; convert to String.
    final String id = json['id']?.toString() ?? '';

    // date field is 'date' or 'game_date' (ISO 8601 string).
    //
    // Fix: The API returns UTC timestamps. If the string has no timezone
    // suffix (no 'Z' and no '+'/'-' offset), append 'Z' so Dart parses it
    // as UTC rather than local time — ensuring .toLocal() in timeDisplay
    // converts to the user's actual local timezone correctly.
    final String? dateStr =
        (json['date'] ?? json['game_date']) as String?;
    DateTime? matchDate;
    if (dateStr != null) {
      String normalized = dateStr.trim();
      // Detect whether a timezone offset is already present.
      final bool hasOffset = normalized.endsWith('Z') ||
          normalized.contains('+') ||
          (normalized.length > 6 &&
              normalized[normalized.length - 3] == ':' &&
              (normalized[normalized.length - 6] == '+' ||
                  normalized[normalized.length - 6] == '-'));
      if (!hasOffset && normalized.isNotEmpty) {
        normalized = '${normalized}Z';
      }
      matchDate = DateTime.tryParse(normalized);
    }

    // Basketball-specific period info
    final int? periodNum = (json['period'] as num?)?.toInt();
    String? period;
    String? periodTime;
    if (periodNum != null) {
      period = periodNum > 4 ? 'OT${periodNum - 4}' : 'Q$periodNum';
      periodTime = json['period_time'] as String?;
    }

    // League / sport label
    final String sport = json['sport'] as String? ?? 'Unknown';
    final String league = json['league'] as String? ?? '';

    return Match(
      id: id,
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      homeTeamAbbr: homeTeamAbbr,
      awayTeamAbbr: awayTeamAbbr,
      homeTeamLogo: homeTeamLogo,
      awayTeamLogo: awayTeamLogo,
      homeTeamId: homeTeamId,
      awayTeamId: awayTeamId,
      homeScore: _parseScore(json['home_score']),
      awayScore: _parseScore(json['away_score']),
      sport: sport,
      league: league,
      matchDate: matchDate,
      status: _normaliseStatus(json['status'] as String?),
      round: json['round'] as String? ?? '',
      period: period,
      periodTime: periodTime,
    );
  }

  /// Human-readable status label.
  String get statusLabel {
    switch (status) {
      case 'in_progress':
        return 'LIVE';
      case 'completed':
        return 'FT';
      case 'scheduled':
      default:
        return 'SOON';
    }
  }

  bool get isLive => status == 'in_progress';
  bool get isCompleted => status == 'completed';
  bool get isScheduled => status == 'scheduled';

  /// Returns a display string for the match time / period.
  String get timeDisplay {
    if (isLive) {
      if (period != null && periodTime != null) {
        return '$period $periodTime';
      }
      if (period != null) return period!;
      if (round.isNotEmpty) return round;
    }
    if (isCompleted) return 'FT';
    if (matchDate != null) {
      final now = DateTime.now();
      final local = matchDate!.toLocal();
      final isToday = local.year == now.year &&
          local.month == now.month &&
          local.day == now.day;
      final tomorrow = now.add(const Duration(days: 1));
      final isTomorrow = local.year == tomorrow.year &&
          local.month == tomorrow.month &&
          local.day == tomorrow.day;
      final timeStr =
          '${local.hour % 12 == 0 ? 12 : local.hour % 12}:${local.minute.toString().padLeft(2, '0')} ${local.hour >= 12 ? 'PM' : 'AM'}';
      if (isToday) return 'Today $timeStr';
      if (isTomorrow) return 'Tomorrow $timeStr';
      return '${_monthAbbr(local.month)} ${local.day} $timeStr';
    }
    return '';
  }

  static String _monthAbbr(int month) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  }
}
