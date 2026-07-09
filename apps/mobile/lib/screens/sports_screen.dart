import 'package:flutter/material.dart';
import '../theme/design_tokens.dart';

/// Sports screen — browse sports and leagues.
/// Mirrors the web version's Sports tab.
class SportsScreen extends StatefulWidget {
  const SportsScreen({Key? key}) : super(key: key);

  @override
  State<SportsScreen> createState() => _SportsScreenState();
}

class _SportsScreenState extends State<SportsScreen> {
  String? _expandedSport;

  static const List<_SportEntry> _sports = [
    _SportEntry(
      name: 'AFL',
      emoji: '🏉',
      description: 'Australian Football League',
      color: Color(0xFF1C3C6B),
      leagues: [
        _LeagueEntry(name: 'AFL Premiership', teams: 18, icon: Icons.emoji_events),
      ],
    ),
    _SportEntry(
      name: 'Football',
      emoji: '⚽',
      description: 'Soccer — global competitions',
      color: Color(0xFF006B3F),
      leagues: [
        _LeagueEntry(name: 'Premier League', teams: 20, icon: Icons.emoji_events),
        _LeagueEntry(name: 'La Liga', teams: 20, icon: Icons.emoji_events),
        _LeagueEntry(name: 'Champions League', teams: 32, icon: Icons.star),
        _LeagueEntry(name: 'World Cup 2026', teams: 48, icon: Icons.public),
      ],
    ),
    _SportEntry(
      name: 'Basketball',
      emoji: '🏀',
      description: 'NBA — National Basketball Association',
      color: Color(0xFFC8102E),
      leagues: [
        _LeagueEntry(name: 'NBA', teams: 30, icon: Icons.emoji_events),
      ],
    ),
    _SportEntry(
      name: 'NRL',
      emoji: '🏈',
      description: 'National Rugby League',
      color: Color(0xFF4B0082),
      leagues: [
        _LeagueEntry(name: 'NRL Premiership', teams: 17, icon: Icons.emoji_events),
      ],
    ),
    _SportEntry(
      name: 'Cricket',
      emoji: '🏏',
      description: 'International & domestic cricket',
      color: Color(0xFFFFD200),
      leagues: [
        _LeagueEntry(name: 'Test Series', teams: 12, icon: Icons.public),
        _LeagueEntry(name: 'BBL', teams: 8, icon: Icons.emoji_events),
        _LeagueEntry(name: 'IPL', teams: 10, icon: Icons.emoji_events),
      ],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cockpit,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(AppSpacing.base),
                itemCount: _sports.length,
                itemBuilder: (context, i) {
                  final sport = _sports[i];
                  final isExpanded = _expandedSport == sport.name;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                    child: _SportCard(
                      sport: sport,
                      isExpanded: isExpanded,
                      onTap: () => setState(() {
                        _expandedSport = isExpanded ? null : sport.name;
                      }),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'SPORTS',
            style: TextStyle(
              color: AppColors.fg,
              fontSize: AppFontSize.xl,
              fontWeight: FontWeight.w800,
              letterSpacing: AppLetterSpacing.wide,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          const Text(
            'Browse leagues and competitions',
            style: TextStyle(
              color: AppColors.fgMuted,
              fontSize: AppFontSize.sm,
            ),
          ),
        ],
      ),
    );
  }
}

class _SportCard extends StatelessWidget {
  final _SportEntry sport;
  final bool isExpanded;
  final VoidCallback onTap;

  const _SportCard({
    required this.sport,
    required this.isExpanded,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: AppColors.cockpitSurface,
          borderRadius: BorderRadius.circular(AppRadius.card),
          border: Border.all(
            color: isExpanded
                ? sport.color.withOpacity(0.5)
                : AppColors.cockpitBorder,
            width: isExpanded ? 1.5 : 1,
          ),
        ),
        child: Column(
          children: [
            // Top color accent
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(AppRadius.card),
              ),
              child: Container(
                height: 3,
                color: sport.color,
              ),
            ),
            // Header row
            Padding(
              padding: const EdgeInsets.all(AppSpacing.base),
              child: Row(
                children: [
                  // Emoji badge
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: sport.color.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(AppRadius.card),
                      border: Border.all(
                        color: sport.color.withOpacity(0.3),
                      ),
                    ),
                    child: Center(
                      child: Text(
                        sport.emoji,
                        style: const TextStyle(fontSize: 24),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          sport.name,
                          style: const TextStyle(
                            color: AppColors.fg,
                            fontSize: AppFontSize.lg,
                            fontWeight: FontWeight.w800,
                            letterSpacing: AppLetterSpacing.tight,
                          ),
                        ),
                        Text(
                          sport.description,
                          style: const TextStyle(
                            color: AppColors.fgMuted,
                            fontSize: AppFontSize.xs,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // League count badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                      vertical: AppSpacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: sport.color.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(AppRadius.pill),
                    ),
                    child: Text(
                      '${sport.leagues.length} ${sport.leagues.length == 1 ? 'league' : 'leagues'}',
                      style: TextStyle(
                        color: sport.color.computeLuminance() > 0.3
                            ? sport.color.withOpacity(0.8)
                            : sport.color,
                        fontSize: AppFontSize.xs,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Icon(
                    isExpanded ? Icons.expand_less : Icons.expand_more,
                    color: AppColors.fgDim,
                    size: 20,
                  ),
                ],
              ),
            ),
            // Expanded leagues list
            if (isExpanded) ...[
              Container(
                height: 1,
                color: AppColors.cockpitBorder,
                margin: const EdgeInsets.symmetric(horizontal: AppSpacing.base),
              ),
              ...sport.leagues.map(
                (league) => _LeagueRow(league: league, sportColor: sport.color),
              ),
              const SizedBox(height: AppSpacing.xs),
            ],
          ],
        ),
      ),
    );
  }
}

class _LeagueRow extends StatelessWidget {
  final _LeagueEntry league;
  final Color sportColor;

  const _LeagueRow({required this.league, required this.sportColor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.base,
        vertical: AppSpacing.sm,
      ),
      child: Row(
        children: [
          Icon(league.icon, color: sportColor.withOpacity(0.7), size: 16),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              league.name,
              style: const TextStyle(
                color: AppColors.fg,
                fontSize: AppFontSize.sm,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: 2,
            ),
            decoration: BoxDecoration(
              color: AppColors.cockpitMid,
              borderRadius: BorderRadius.circular(AppRadius.pill),
              border: Border.all(color: AppColors.cockpitBorder),
            ),
            child: Text(
              '${league.teams} teams',
              style: const TextStyle(
                color: AppColors.fgDim,
                fontSize: AppFontSize.xs,
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          const Icon(Icons.chevron_right, color: AppColors.fgDim, size: 16),
        ],
      ),
    );
  }
}

// ─── Data Models ──────────────────────────────────────────────────────────────

class _SportEntry {
  final String name;
  final String emoji;
  final String description;
  final Color color;
  final List<_LeagueEntry> leagues;

  const _SportEntry({
    required this.name,
    required this.emoji,
    required this.description,
    required this.color,
    required this.leagues,
  });
}

class _LeagueEntry {
  final String name;
  final int teams;
  final IconData icon;

  const _LeagueEntry({
    required this.name,
    required this.teams,
    required this.icon,
  });
}
