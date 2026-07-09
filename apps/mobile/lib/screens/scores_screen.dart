import 'package:flutter/material.dart';
import '../models/match.dart';
import '../services/api_service.dart';
import '../theme/design_tokens.dart';
import '../theme/team_colors.dart';
import '../widgets/match_card.dart';
import '../widgets/sport_filter_bar.dart';

class ScoresScreen extends StatefulWidget {
  const ScoresScreen({Key? key}) : super(key: key);

  @override
  State<ScoresScreen> createState() => _ScoresScreenState();
}

class _ScoresScreenState extends State<ScoresScreen>
    with SingleTickerProviderStateMixin {
  late Future<List<Match>> _futureMatches;
  String _selectedSport = 'All';
  Match? _selectedMatch;

  static const List<String> _sports = [
    'All', 'AFL', 'Football', 'Basketball', 'NRL', 'Cricket',
  ];

  @override
  void initState() {
    super.initState();
    _futureMatches = ApiService.getAllMatches();
  }

  void _refresh() {
    setState(() {
      _futureMatches = ApiService.getAllMatches();
      _selectedMatch = null;
    });
  }

  List<Match> _filterMatches(List<Match> matches) {
    if (_selectedSport == 'All') return matches;
    return matches
        .where((m) => m.sport.toLowerCase() == _selectedSport.toLowerCase())
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cockpit,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            SportFilterBar(
              sports: _sports,
              selected: _selectedSport,
              onSelected: (s) => setState(() {
                _selectedSport = s;
                _selectedMatch = null;
              }),
            ),
            Expanded(
              child: FutureBuilder<List<Match>>(
                future: _futureMatches,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(
                      child: CircularProgressIndicator(
                        color: AppColors.amber,
                        strokeWidth: 2,
                      ),
                    );
                  }
                  if (snapshot.hasError) {
                    return _buildError();
                  }
                  if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return _buildEmpty();
                  }

                  final matches = _filterMatches(snapshot.data!);

                  if (_selectedMatch != null) {
                    return _MatchDetail(
                      match: _selectedMatch!,
                      onBack: () => setState(() => _selectedMatch = null),
                    );
                  }

                  return RefreshIndicator(
                    color: AppColors.amber,
                    backgroundColor: AppColors.cockpitSurface,
                    onRefresh: () async => _refresh(),
                    child: ListView.builder(
                      padding: const EdgeInsets.all(AppSpacing.base),
                      itemCount: matches.length,
                      itemBuilder: (context, i) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                          child: MatchCard(
                            match: matches[i],
                            onTap: () =>
                                setState(() => _selectedMatch = matches[i]),
                          ),
                        );
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.base, AppSpacing.lg, AppSpacing.base, AppSpacing.sm,
      ),
      child: Row(
        children: [
          const Text(
            'SCORES',
            style: TextStyle(
              color: AppColors.fg,
              fontSize: AppFontSize.xl,
              fontWeight: FontWeight.w800,
              letterSpacing: AppLetterSpacing.wide,
            ),
          ),
          const Spacer(),
          GestureDetector(
            onTap: _refresh,
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.cockpitSurface,
                borderRadius: BorderRadius.circular(AppRadius.tight),
                border: Border.all(color: AppColors.cockpitBorder),
              ),
              child: const Icon(Icons.refresh, color: AppColors.fgMuted, size: 18),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.wifi_off_rounded, color: AppColors.redScore, size: 40),
          const SizedBox(height: AppSpacing.base),
          const Text(
            'Failed to load scores',
            style: TextStyle(color: AppColors.fgMuted, fontSize: AppFontSize.base),
          ),
          const SizedBox(height: AppSpacing.lg),
          GestureDetector(
            onTap: _refresh,
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.xl,
                vertical: AppSpacing.md,
              ),
              decoration: BoxDecoration(
                color: AppColors.amber,
                borderRadius: BorderRadius.circular(AppRadius.tight),
              ),
              child: const Text(
                'RETRY',
                style: TextStyle(
                  color: AppColors.cockpit,
                  fontWeight: FontWeight.w800,
                  letterSpacing: AppLetterSpacing.widest,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    return const Center(
      child: Text(
        'No scores available',
        style: TextStyle(color: AppColors.fgMuted, fontSize: AppFontSize.base),
      ),
    );
  }
}

// ─── Match Detail View ────────────────────────────────────────────────────────

class _MatchDetail extends StatelessWidget {
  final Match match;
  final VoidCallback onBack;

  const _MatchDetail({required this.match, required this.onBack});

  @override
  Widget build(BuildContext context) {
    final homeColor = getTeamColor(match.homeTeam);
    final awayColor = getTeamColor(match.awayTeam);

    return Column(
      children: [
        // Back bar
        GestureDetector(
          onTap: onBack,
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.base,
              vertical: AppSpacing.sm,
            ),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: AppColors.cockpitBorder),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.chevron_left, color: AppColors.amber, size: 20),
                const SizedBox(width: AppSpacing.xs),
                const Text(
                  'BACK TO SCORES',
                  style: TextStyle(
                    color: AppColors.amber,
                    fontSize: AppFontSize.xs,
                    fontWeight: FontWeight.w700,
                    letterSpacing: AppLetterSpacing.widest,
                  ),
                ),
              ],
            ),
          ),
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.base),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Hero score card
                _HeroScoreCard(
                  match: match,
                  homeColor: homeColor,
                  awayColor: awayColor,
                ),
                const SizedBox(height: AppSpacing.lg),
                // Match info
                _InfoRow(label: 'SPORT', value: match.sport),
                if (match.league.isNotEmpty)
                  _InfoRow(label: 'LEAGUE', value: match.league),
                if (match.round.isNotEmpty)
                  _InfoRow(label: 'ROUND', value: match.round),
                if (match.timeDisplay.isNotEmpty)
                  _InfoRow(label: 'TIME', value: match.timeDisplay),
                const SizedBox(height: AppSpacing.lg),
                // Score breakdown section
                _SectionLabel(label: 'MATCH INFO'),
                const SizedBox(height: AppSpacing.sm),
                _ScoreBreakdownCard(
                  match: match,
                  homeColor: homeColor,
                  awayColor: awayColor,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _HeroScoreCard extends StatelessWidget {
  final Match match;
  final Color homeColor;
  final Color awayColor;

  const _HeroScoreCard({
    required this.match,
    required this.homeColor,
    required this.awayColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cockpitSurface,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(
          color: match.isLive ? AppColors.greenGlowBorder : AppColors.cockpitBorder,
          width: match.isLive ? 1.5 : 1,
        ),
      ),
      child: Column(
        children: [
          // Color bar
          ClipRRect(
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(AppRadius.card),
            ),
            child: Row(
              children: [
                Expanded(child: Container(height: 4, color: homeColor)),
                Expanded(child: Container(height: 4, color: awayColor)),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              children: [
                // Status
                if (match.isLive)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.greenGlow,
                      borderRadius: BorderRadius.circular(AppRadius.pill),
                      border: Border.all(color: AppColors.greenGlowBorder),
                    ),
                    child: const Text(
                      '● LIVE',
                      style: TextStyle(
                        color: AppColors.green,
                        fontSize: AppFontSize.sm,
                        fontWeight: FontWeight.w800,
                        letterSpacing: AppLetterSpacing.widest,
                      ),
                    ),
                  ),
                const SizedBox(height: AppSpacing.lg),
                // Teams + scores
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        children: [
                          Text(
                            match.homeTeam,
                            style: TextStyle(
                              color: homeColor.computeLuminance() > 0.05
                                  ? homeColor
                                  : AppColors.fg,
                              fontSize: AppFontSize.base,
                              fontWeight: FontWeight.w700,
                            ),
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Text(
                            '${match.homeScore}',
                            style: const TextStyle(
                              color: AppColors.fg,
                              fontSize: AppFontSize.hero,
                              fontWeight: FontWeight.w900,
                              height: 1,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.base,
                      ),
                      child: Column(
                        children: [
                          const Text(
                            'VS',
                            style: TextStyle(
                              color: AppColors.fgDim,
                              fontSize: AppFontSize.sm,
                              fontWeight: FontWeight.w700,
                              letterSpacing: AppLetterSpacing.widest,
                            ),
                          ),
                          if (match.timeDisplay.isNotEmpty) ...[
                            const SizedBox(height: AppSpacing.xs),
                            Text(
                              match.timeDisplay,
                              style: TextStyle(
                                color: match.isLive
                                    ? AppColors.green
                                    : AppColors.fgMuted,
                                fontSize: AppFontSize.xs,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        children: [
                          Text(
                            match.awayTeam,
                            style: TextStyle(
                              color: awayColor.computeLuminance() > 0.05
                                  ? awayColor
                                  : AppColors.fg,
                              fontSize: AppFontSize.base,
                              fontWeight: FontWeight.w700,
                            ),
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Text(
                            '${match.awayScore}',
                            style: const TextStyle(
                              color: AppColors.fg,
                              fontSize: AppFontSize.hero,
                              fontWeight: FontWeight.w900,
                              height: 1,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ScoreBreakdownCard extends StatelessWidget {
  final Match match;
  final Color homeColor;
  final Color awayColor;

  const _ScoreBreakdownCard({
    required this.match,
    required this.homeColor,
    required this.awayColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: AppColors.cockpitSurface,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: AppColors.cockpitBorder),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  match.homeTeam,
                  style: TextStyle(
                    color: homeColor.computeLuminance() > 0.05
                        ? homeColor
                        : AppColors.fg,
                    fontSize: AppFontSize.sm,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Text(
                '${match.homeScore}  –  ${match.awayScore}',
                style: const TextStyle(
                  color: AppColors.fg,
                  fontSize: AppFontSize.xl,
                  fontWeight: FontWeight.w800,
                ),
              ),
              Expanded(
                child: Text(
                  match.awayTeam,
                  style: TextStyle(
                    color: awayColor.computeLuminance() > 0.05
                        ? awayColor
                        : AppColors.fg,
                    fontSize: AppFontSize.sm,
                    fontWeight: FontWeight.w700,
                  ),
                  textAlign: TextAlign.right,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          // Score bar
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.pill),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final total = match.homeScore + match.awayScore;
                final homeRatio = total > 0 ? match.homeScore / total : 0.5;
                return Row(
                  children: [
                    Container(
                      width: constraints.maxWidth * homeRatio,
                      height: 6,
                      color: homeColor,
                    ),
                    Expanded(
                      child: Container(height: 6, color: awayColor),
                    ),
                  ],
                );
              },
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                match.statusLabel,
                style: TextStyle(
                  color: match.isLive ? AppColors.green : AppColors.fgMuted,
                  fontSize: AppFontSize.xs,
                  fontWeight: FontWeight.w700,
                  letterSpacing: AppLetterSpacing.widest,
                ),
              ),
              if (match.round.isNotEmpty)
                Text(
                  match.round,
                  style: const TextStyle(
                    color: AppColors.fgDim,
                    fontSize: AppFontSize.xs,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(
                color: AppColors.fgDim,
                fontSize: AppFontSize.xs,
                fontWeight: FontWeight.w600,
                letterSpacing: AppLetterSpacing.widest,
              ),
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              color: AppColors.fg,
              fontSize: AppFontSize.sm,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;

  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.fgDim,
            fontSize: AppFontSize.xs,
            fontWeight: FontWeight.w700,
            letterSpacing: AppLetterSpacing.widest,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(child: Container(height: 1, color: AppColors.cockpitBorder)),
      ],
    );
  }
}
