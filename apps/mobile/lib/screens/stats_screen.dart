import 'package:flutter/material.dart';
import '../models/match.dart';
import '../services/api_service.dart';
import '../theme/design_tokens.dart';
import '../theme/team_colors.dart';

/// Stats screen — top performers from live and recent matches.
class StatsScreen extends StatefulWidget {
  const StatsScreen({Key? key}) : super(key: key);

  @override
  State<StatsScreen> createState() => _StatsScreenState();
}

class _StatsScreenState extends State<StatsScreen> {
  late Future<List<Match>> _futureMatches;
  String _selectedSport = 'All';

  static const List<String> _sports = [
    'All', 'AFL', 'Football', 'Basketball', 'NRL', 'Cricket',
  ];

  // Stat labels per sport
  static const Map<String, List<String>> _statLabels = {
    'AFL': ['Disposals', 'Goals', 'Marks', 'Tackles'],
    'NRL': ['Tries', 'Tackles', 'Metres', 'Runs'],
    'Cricket': ['Runs', 'Balls', 'Wickets', 'Economy'],
    'Football': ['Goals', 'Assists', 'Shots', 'xG'],
    'Basketball': ['Points', 'Rebounds', 'Assists', 'Steals'],
  };

  @override
  void initState() {
    super.initState();
    _futureMatches = ApiService.getAllMatches();
  }

  void _refresh() {
    setState(() => _futureMatches = ApiService.getAllMatches());
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
            // Sport filter chips
            _buildSportFilter(),
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

                  final matches = snapshot.data ?? [];
                  final liveMatches = matches
                      .where((m) =>
                          m.isLive &&
                          (_selectedSport == 'All' ||
                              m.sport.toLowerCase() ==
                                  _selectedSport.toLowerCase()))
                      .toList();

                  return RefreshIndicator(
                    color: AppColors.amber,
                    backgroundColor: AppColors.cockpitSurface,
                    onRefresh: () async => _refresh(),
                    child: ListView(
                      padding: const EdgeInsets.all(AppSpacing.base),
                      children: [
                        // Live match summary cards
                        if (liveMatches.isNotEmpty) ...[
                          _SectionLabel(label: 'LIVE MATCHES'),
                          const SizedBox(height: AppSpacing.sm),
                          ...liveMatches.map(
                            (m) => Padding(
                              padding:
                                  const EdgeInsets.only(bottom: AppSpacing.sm),
                              child: _LiveMatchSummary(match: m),
                            ),
                          ),
                          const SizedBox(height: AppSpacing.lg),
                        ],
                        // Stats overview
                        _SectionLabel(label: 'STAT CATEGORIES'),
                        const SizedBox(height: AppSpacing.sm),
                        _buildStatCategories(),
                        const SizedBox(height: AppSpacing.lg),
                        // Coming soon card
                        _ComingSoonCard(),
                      ],
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
            'STATS',
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

  Widget _buildSportFilter() {
    return Container(
      height: 44,
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppColors.cockpitBorder),
        ),
      ),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.base,
          vertical: AppSpacing.xs,
        ),
        itemCount: _sports.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.xs),
        itemBuilder: (context, i) {
          final sport = _sports[i];
          final isSelected = sport == _selectedSport;
          return GestureDetector(
            onTap: () => setState(() => _selectedSport = sport),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.xs,
              ),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.amber : AppColors.cockpitSurface,
                borderRadius: BorderRadius.circular(AppRadius.pill),
                border: Border.all(
                  color: isSelected ? AppColors.amber : AppColors.cockpitBorder,
                ),
              ),
              child: Text(
                sport,
                style: TextStyle(
                  color: isSelected ? AppColors.cockpit : AppColors.fgMuted,
                  fontSize: AppFontSize.xs,
                  fontWeight:
                      isSelected ? FontWeight.w800 : FontWeight.w500,
                  letterSpacing: AppLetterSpacing.wide,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatCategories() {
    final sports = _selectedSport == 'All'
        ? _statLabels.keys.toList()
        : (_statLabels.containsKey(_selectedSport)
            ? [_selectedSport]
            : <String>[]);

    return Column(
      children: sports.map((sport) {
        final labels = _statLabels[sport]!;
        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.sm),
          child: _StatCategoryCard(sport: sport, statLabels: labels),
        );
      }).toList(),
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
            'Failed to load stats',
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
}

// ─── Sub-widgets ──────────────────────────────────────────────────────────────

class _LiveMatchSummary extends StatelessWidget {
  final Match match;

  const _LiveMatchSummary({required this.match});

  @override
  Widget build(BuildContext context) {
    final homeColor = getTeamColor(match.homeTeam);
    final awayColor = getTeamColor(match.awayTeam);

    return Container(
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: AppColors.cockpitSurface,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: AppColors.greenGlowBorder, width: 1.5),
      ),
      child: Row(
        children: [
          // Live badge
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: 3,
            ),
            decoration: BoxDecoration(
              color: AppColors.greenGlow,
              borderRadius: BorderRadius.circular(AppRadius.pill),
              border: Border.all(color: AppColors.greenGlowBorder),
            ),
            child: const Text(
              'LIVE',
              style: TextStyle(
                color: AppColors.green,
                fontSize: AppFontSize.xs,
                fontWeight: FontWeight.w800,
                letterSpacing: AppLetterSpacing.widest,
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${match.homeTeam} vs ${match.awayTeam}',
                  style: const TextStyle(
                    color: AppColors.fg,
                    fontSize: AppFontSize.sm,
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  match.sport,
                  style: const TextStyle(
                    color: AppColors.fgDim,
                    fontSize: AppFontSize.xs,
                  ),
                ),
              ],
            ),
          ),
          // Score
          Text(
            '${match.homeScore} – ${match.awayScore}',
            style: const TextStyle(
              color: AppColors.fg,
              fontSize: AppFontSize.lg,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCategoryCard extends StatelessWidget {
  final String sport;
  final List<String> statLabels;

  const _StatCategoryCard({
    required this.sport,
    required this.statLabels,
  });

  static const Map<String, String> _sportEmojis = {
    'AFL': '🏉',
    'NRL': '🏈',
    'Cricket': '🏏',
    'Football': '⚽',
    'Basketball': '🏀',
  };

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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                _sportEmojis[sport] ?? '🏆',
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                sport.toUpperCase(),
                style: const TextStyle(
                  color: AppColors.fg,
                  fontSize: AppFontSize.sm,
                  fontWeight: FontWeight.w700,
                  letterSpacing: AppLetterSpacing.widest,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: AppSpacing.xs,
            runSpacing: AppSpacing.xs,
            children: statLabels.map((label) {
              return Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: AppSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: AppColors.cockpitMid,
                  borderRadius: BorderRadius.circular(AppRadius.tight),
                  border: Border.all(color: AppColors.cockpitBorder),
                ),
                child: Text(
                  label,
                  style: const TextStyle(
                    color: AppColors.fgMuted,
                    fontSize: AppFontSize.xs,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _ComingSoonCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: AppColors.cockpitSurface,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: AppColors.amberGlowBorder),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.amberGlowBg,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.bar_chart_rounded,
              color: AppColors.amber,
              size: 32,
            ),
          ),
          const SizedBox(height: AppSpacing.base),
          const Text(
            'PLAYER STATS',
            style: TextStyle(
              color: AppColors.fg,
              fontSize: AppFontSize.base,
              fontWeight: FontWeight.w800,
              letterSpacing: AppLetterSpacing.widest,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'Detailed player statistics, leaderboards, and performance trends are coming soon.',
            style: TextStyle(
              color: AppColors.fgMuted,
              fontSize: AppFontSize.sm,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.base),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.xs,
            ),
            decoration: BoxDecoration(
              color: AppColors.amberGlowSubtle,
              borderRadius: BorderRadius.circular(AppRadius.pill),
              border: Border.all(color: AppColors.amberGlowBorder),
            ),
            child: const Text(
              'COMING SOON',
              style: TextStyle(
                color: AppColors.amber,
                fontSize: AppFontSize.xs,
                fontWeight: FontWeight.w700,
                letterSpacing: AppLetterSpacing.widest,
              ),
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
