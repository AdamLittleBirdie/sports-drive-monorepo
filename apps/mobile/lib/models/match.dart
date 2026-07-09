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

  /// Extracts a total score from a value that may be an [int], [double], or an
  /// AFL score object with [goals] and [behinds] fields (total = goals * 6 + behinds).
  static int _parseScore(dynamic value) {
    if (value == null) return 0;
    if (value is num) return value.toInt();
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

  /// Appends 'Z' to bare ISO timestamps (no timezone suffix) so that
  /// [DateTime.tryParse] treats them as UTC instead of local time.
  static String _ensureUtc(String dateStr) {
    final trimmed = dateStr.trim();
    // Already has a timezone indicator: ends with Z or +HH:MM / -HH:MM
    if (trimmed.endsWith('Z')) return trimmed;
    final offsetPattern = RegExp(r'[+\-]\d{2}:\d{2}$');
    if (offsetPattern.hasMatch(trimmed)) return trimmed;
    return '${trimmed}Z';
  }

  /// Maps alternate API status spellings to the canonical values used
  /// throughout the app ('scheduled', 'in_progress', 'completed').
  static String _normaliseStatus(String raw) {
    final s = raw.toLowerCase().replaceAll(RegExp(r'[^a-z_]'), '');
    if (s == 'in_progress' || s == 'inprogress' || s == 'live' || s == 'playing') {
      return 'in_progress';
    }
    if (s == 'completed' || s == 'finished' || s == 'ft' || s == 'final' || s == 'ended') {
      return 'completed';
    }
    return 'scheduled';
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
    // Append 'Z' if the timestamp has no timezone suffix so it is parsed as
    // UTC rather than local time; .toLocal() in timeDisplay then converts it
    // correctly to the device timezone.
    final String? dateStr =
        (json['date'] ?? json['game_date']) as String?;
    final String? dateStrUtc = dateStr != null ? _ensureUtc(dateStr) : null;
    final DateTime? matchDate =
        dateStrUtc != null ? DateTime.tryParse(dateStrUtc) : null;

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
      status: _normaliseStatus(json['status'] as String? ?? 'scheduled'),
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
