import 'package:flutter/material.dart';
import '../models/match.dart';
import '../theme/design_tokens.dart';
import '../theme/team_colors.dart';

/// A cockpit-themed match card used across Home and Scores screens.
class MatchCard extends StatelessWidget {
  final Match match;
  final VoidCallback? onTap;

  const MatchCard({Key? key, required this.match, this.onTap}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final homeColor = getTeamColor(match.homeTeam);
    final awayColor = getTeamColor(match.awayTeam);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.cockpitSurface,
          borderRadius: BorderRadius.circular(AppRadius.card),
          border: Border.all(
            color: match.isLive
                ? AppColors.greenGlowBorder
                : AppColors.cockpitBorder,
            width: match.isLive ? 1.5 : 1,
          ),
        ),
        child: Column(
          children: [
            // Top accent bar — team colors
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(AppRadius.card),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Container(height: 3, color: homeColor),
                  ),
                  Expanded(
                    child: Container(height: 3, color: awayColor),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.base),
              child: Column(
                children: [
                  // Sport / league + status badge row
                  Row(
                    children: [
                      Text(
                        _sportEmoji(match.sport),
                        style: const TextStyle(fontSize: 14),
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        match.sport.toUpperCase(),
                        style: const TextStyle(
                          color: AppColors.fgDim,
                          fontSize: AppFontSize.xs,
                          fontWeight: FontWeight.w600,
                          letterSpacing: AppLetterSpacing.widest,
                        ),
                      ),
                      if (match.round.isNotEmpty) ...[
                        const SizedBox(width: AppSpacing.xs),
                        Text(
                          '· ${match.round}',
                          style: const TextStyle(
                            color: AppColors.fgDim,
                            fontSize: AppFontSize.xs,
                          ),
                        ),
                      ],
                      const Spacer(),
                      _StatusBadge(match: match),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  // Main score row
                  Row(
                    children: [
                      // Home team
                      Expanded(
                        child: _TeamColumn(
                          name: match.homeTeam,
                          abbr: match.homeTeamAbbr,
                          logoUrl: match.homeTeamLogo,
                          color: homeColor,
                          align: CrossAxisAlignment.start,
                        ),
                      ),
                      // Score
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                        ),
                        child: _ScoreDisplay(match: match),
                      ),
                      // Away team
                      Expanded(
                        child: _TeamColumn(
                          name: match.awayTeam,
                          abbr: match.awayTeamAbbr,
                          logoUrl: match.awayTeamLogo,
                          color: awayColor,
                          align: CrossAxisAlignment.end,
                        ),
                      ),
                    ],
                  ),
                  // Time / period info
                  if (match.timeDisplay.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.sm),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: AppSpacing.xs,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.cockpitMid,
                        borderRadius: BorderRadius.circular(AppRadius.tight),
                      ),
                      child: Text(
                        match.timeDisplay,
                        style: TextStyle(
                          color: match.isLive
                              ? AppColors.green
                              : AppColors.fgMuted,
                          fontSize: AppFontSize.xs,
                          fontWeight: FontWeight.w600,
                          letterSpacing: AppLetterSpacing.wide,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  static String _sportEmoji(String sport) {
    switch (sport.toLowerCase()) {
      case 'afl':
        return '🏉';
      case 'nrl':
        return '🏈';
      case 'cricket':
        return '🏏';
      case 'football':
        return '⚽';
      case 'basketball':
        return '🏀';
      default:
        return '🏆';
    }
  }
}

class _TeamColumn extends StatelessWidget {
  final String name;
  final String abbr;
  final String? logoUrl;
  final Color color;
  final CrossAxisAlignment align;

  const _TeamColumn({
    required this.name,
    required this.abbr,
    this.logoUrl,
    required this.color,
    required this.align,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: align,
      children: [
        // Logo or color swatch
        _TeamLogo(logoUrl: logoUrl, color: color, size: 36),
        const SizedBox(height: AppSpacing.xs),
        Text(
          name,
          style: TextStyle(
            color: color.computeLuminance() > 0.05 ? color : AppColors.fg,
            fontSize: AppFontSize.sm,
            fontWeight: FontWeight.w700,
          ),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          textAlign: align == CrossAxisAlignment.start
              ? TextAlign.left
              : TextAlign.right,
        ),
        if (abbr.isNotEmpty)
          Text(
            abbr,
            style: const TextStyle(
              color: AppColors.fgDim,
              fontSize: AppFontSize.xs,
              letterSpacing: AppLetterSpacing.wide,
            ),
          ),
      ],
    );
  }
}

class _TeamLogo extends StatelessWidget {
  final String? logoUrl;
  final Color color;
  final double size;

  const _TeamLogo({this.logoUrl, required this.color, required this.size});

  @override
  Widget build(BuildContext context) {
    if (logoUrl != null && logoUrl!.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: Image.network(
          logoUrl!,
          width: size,
          height: size,
          fit: BoxFit.contain,
          errorBuilder: (_, __, ___) => _colorSwatch(size, color),
        ),
      );
    }
    return _colorSwatch(size, color);
  }

  static Widget _colorSwatch(double size, Color color) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.5), width: 1.5),
      ),
      child: Center(
        child: Container(
          width: size * 0.4,
          height: size * 0.4,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}

class _ScoreDisplay extends StatelessWidget {
  final Match match;

  const _ScoreDisplay({required this.match});

  @override
  Widget build(BuildContext context) {
    if (match.isScheduled) {
      return const Text(
        'VS',
        style: TextStyle(
          color: AppColors.fgDim,
          fontSize: AppFontSize.xl,
          fontWeight: FontWeight.w800,
          letterSpacing: AppLetterSpacing.wide,
        ),
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          '${match.homeScore}',
          style: TextStyle(
            color: match.isLive ? AppColors.fg : AppColors.fgMuted,
            fontSize: AppFontSize.xxxxl,
            fontWeight: FontWeight.w800,
            height: 1,
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs),
          child: Text(
            '–',
            style: TextStyle(
              color: AppColors.fgDim,
              fontSize: AppFontSize.xl,
              fontWeight: FontWeight.w300,
            ),
          ),
        ),
        Text(
          '${match.awayScore}',
          style: TextStyle(
            color: match.isLive ? AppColors.fg : AppColors.fgMuted,
            fontSize: AppFontSize.xxxxl,
            fontWeight: FontWeight.w800,
            height: 1,
          ),
        ),
      ],
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final Match match;

  const _StatusBadge({required this.match});

  @override
  Widget build(BuildContext context) {
    if (match.isLive) {
      return Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm,
          vertical: 3,
        ),
        decoration: BoxDecoration(
          color: AppColors.greenGlow,
          borderRadius: BorderRadius.circular(AppRadius.pill),
          border: Border.all(color: AppColors.greenGlowBorder),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _PulseDot(),
            const SizedBox(width: 4),
            const Text(
              'LIVE',
              style: TextStyle(
                color: AppColors.green,
                fontSize: AppFontSize.xs,
                fontWeight: FontWeight.w800,
                letterSpacing: AppLetterSpacing.widest,
              ),
            ),
          ],
        ),
      );
    }

    if (match.isCompleted) {
      return Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm,
          vertical: 3,
        ),
        decoration: BoxDecoration(
          color: AppColors.neutralBadgeBg,
          borderRadius: BorderRadius.circular(AppRadius.pill),
          border: Border.all(color: AppColors.neutralBadgeBorder),
        ),
        child: const Text(
          'FT',
          style: TextStyle(
            color: AppColors.fgMuted,
            fontSize: AppFontSize.xs,
            fontWeight: FontWeight.w700,
            letterSpacing: AppLetterSpacing.widest,
          ),
        ),
      );
    }

    // Scheduled / upcoming
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: 3,
      ),
      decoration: BoxDecoration(
        color: AppColors.amberGlowSubtle,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        border: Border.all(color: AppColors.amberGlowBorder),
      ),
      child: const Text(
        'SOON',
        style: TextStyle(
          color: AppColors.amber,
          fontSize: AppFontSize.xs,
          fontWeight: FontWeight.w700,
          letterSpacing: AppLetterSpacing.widest,
        ),
      ),
    );
  }
}

class _PulseDot extends StatefulWidget {
  @override
  State<_PulseDot> createState() => _PulseDotState();
}

class _PulseDotState extends State<_PulseDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _opacity = Tween<double>(begin: 0.3, end: 1.0).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _opacity,
      child: Container(
        width: 6,
        height: 6,
        decoration: const BoxDecoration(
          color: AppColors.green,
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}
