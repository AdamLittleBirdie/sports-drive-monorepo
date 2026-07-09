import 'package:flutter/material.dart';
import '../models/match.dart';
import '../services/api_service.dart';
import '../theme/design_tokens.dart';
import '../widgets/match_card.dart';
import '../widgets/sport_filter_bar.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<List<Match>> _futureMatches;
  String _selectedSport = 'All';

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
              onSelected: (s) => setState(() => _selectedSport = s),
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
                    return _buildError(snapshot.error.toString());
                  }
                  if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return _buildEmpty();
                  }

                  final all = _filterMatches(snapshot.data!);
                  final live = all.where((m) => m.isLive).toList();
                  final upcoming = all.where((m) => m.isScheduled).toList();
                  final finished = all.where((m) => m.isCompleted).toList();

                  return RefreshIndicator(
                    color: AppColors.amber,
                    backgroundColor: AppColors.cockpitSurface,
                    onRefresh: () async => _refresh(),
                    child: ListView(
                      padding: const EdgeInsets.only(
                        left: AppSpacing.base,
                        right: AppSpacing.base,
                        bottom: AppSpacing.xl,
                      ),
                      children: [
                        if (live.isNotEmpty) ...[
                          _buildSectionHeader('LIVE NOW', AppColors.green, Icons.circle),
                          const SizedBox(height: AppSpacing.sm),
                          ...live.map((m) => Padding(
                                padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                                child: MatchCard(match: m),
                              )),
                          const SizedBox(height: AppSpacing.lg),
                        ],
                        if (upcoming.isNotEmpty) ...[
                          _buildSectionHeader('UPCOMING', AppColors.amber, Icons.schedule),
                          const SizedBox(height: AppSpacing.sm),
                          ...upcoming.map((m) => Padding(
                                padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                                child: MatchCard(match: m),
                              )),
                          const SizedBox(height: AppSpacing.lg),
                        ],
                        if (finished.isNotEmpty) ...[
                          _buildSectionHeader('RESULTS', AppColors.fgDim, Icons.check_circle_outline),
                          const SizedBox(height: AppSpacing.sm),
                          ...finished.map((m) => Padding(
                                padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                                child: MatchCard(match: m),
                              )),
                        ],
                        if (all.isEmpty)
                          _buildEmpty(),
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
          // Logo / wordmark
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.amber,
                  borderRadius: BorderRadius.circular(AppRadius.tight),
                ),
                child: const Icon(
                  Icons.directions_car,
                  color: AppColors.cockpit,
                  size: 18,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              const Text(
                'SCORE',
                style: TextStyle(
                  color: AppColors.fg,
                  fontSize: AppFontSize.xl,
                  fontWeight: FontWeight.w800,
                  letterSpacing: AppLetterSpacing.wide,
                ),
              ),
              const Text(
                'DRIVE',
                style: TextStyle(
                  color: AppColors.amber,
                  fontSize: AppFontSize.xl,
                  fontWeight: FontWeight.w800,
                  letterSpacing: AppLetterSpacing.wide,
                ),
              ),
            ],
          ),
          const Spacer(),
          // Refresh button
          GestureDetector(
            onTap: _refresh,
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.cockpitSurface,
                borderRadius: BorderRadius.circular(AppRadius.tight),
                border: Border.all(color: AppColors.cockpitBorder),
              ),
              child: const Icon(
                Icons.refresh,
                color: AppColors.fgMuted,
                size: 18,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String label, Color color, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: color, size: 12),
        const SizedBox(width: AppSpacing.xs),
        Text(
          label,
          style: TextStyle(
            color: color,
            fontSize: AppFontSize.xs,
            fontWeight: FontWeight.w700,
            letterSpacing: AppLetterSpacing.widest,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Container(
            height: 1,
            color: AppColors.cockpitBorder,
          ),
        ),
      ],
    );
  }

  Widget _buildError(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.redScore.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppRadius.card),
                border: Border.all(color: AppColors.redScore.withOpacity(0.3)),
              ),
              child: const Icon(
                Icons.wifi_off_rounded,
                color: AppColors.redScore,
                size: 40,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            const Text(
              'CONNECTION ERROR',
              style: TextStyle(
                color: AppColors.fg,
                fontSize: AppFontSize.base,
                fontWeight: FontWeight.w700,
                letterSpacing: AppLetterSpacing.widest,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              error,
              style: const TextStyle(
                color: AppColors.fgMuted,
                fontSize: AppFontSize.sm,
              ),
              textAlign: TextAlign.center,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: AppSpacing.xl),
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
                    fontSize: AppFontSize.sm,
                    fontWeight: FontWeight.w800,
                    letterSpacing: AppLetterSpacing.widest,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.sports_score_outlined,
            color: AppColors.fgDim,
            size: 48,
          ),
          const SizedBox(height: AppSpacing.base),
          Text(
            _selectedSport == 'All'
                ? 'No matches available'
                : 'No $_selectedSport matches',
            style: const TextStyle(
              color: AppColors.fgMuted,
              fontSize: AppFontSize.base,
            ),
          ),
        ],
      ),
    );
  }
}

