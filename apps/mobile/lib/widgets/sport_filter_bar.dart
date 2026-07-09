import 'package:flutter/material.dart';
import '../theme/design_tokens.dart';

/// Horizontal scrollable pill-filter bar for sport selection.
class SportFilterBar extends StatelessWidget {
  final List<String> sports;
  final String selected;
  final ValueChanged<String> onSelected;

  const SportFilterBar({
    Key? key,
    required this.sports,
    required this.selected,
    required this.onSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 44,
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppColors.cockpitBorder, width: 1),
        ),
      ),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.base,
          vertical: AppSpacing.xs,
        ),
        itemCount: sports.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.xs),
        itemBuilder: (context, i) {
          final sport = sports[i];
          final isSelected = sport == selected;
          return GestureDetector(
            onTap: () => onSelected(sport),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.xs,
              ),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.amber
                    : AppColors.cockpitSurface,
                borderRadius: BorderRadius.circular(AppRadius.pill),
                border: Border.all(
                  color: isSelected
                      ? AppColors.amber
                      : AppColors.cockpitBorder,
                ),
              ),
              child: Text(
                sport,
                style: TextStyle(
                  color: isSelected
                      ? AppColors.cockpit
                      : AppColors.fgMuted,
                  fontSize: AppFontSize.xs,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                  letterSpacing: AppLetterSpacing.wide,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
