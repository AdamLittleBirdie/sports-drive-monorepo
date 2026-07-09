import 'package:flutter/material.dart';

/// ScoreDrive Design Tokens
/// Mirrors apps/frontend/src/styles/design-tokens.ts
/// Dark cockpit theme for in-car sports dashboard.

// ─── Colors ───────────────────────────────────────────────────────────────────

class AppColors {
  AppColors._();

  // Background layers (darkest → lightest surface)
  static const Color cockpit = Color(0xFF070A0F);
  static const Color cockpitMid = Color(0xFF0D1117);
  static const Color cockpitSurface = Color(0xFF111820);
  static const Color cockpitDeep = Color(0xFF030507);
  static const Color cockpitBorder = Color(0xFF1E2A38);
  static const Color cockpitMuted = Color(0xFF2A3A4D);

  // Accent — amber / gold
  static const Color amber = Color(0xFFF5A623);
  static const Color amberDim = Color(0xFFC47D0E);
  static const Color amberGlow = Color(0x26F5A623); // 15% opacity
  static const Color amberGlowSubtle = Color(0x1FF5A623); // 12% opacity
  static const Color amberGlowBorder = Color(0x40F5A623); // 25% opacity
  static const Color amberGlowBorderStrong = Color(0x4DF5A623); // 30% opacity
  static const Color amberGlowBg = Color(0x1AF5A623); // 10% opacity
  static const Color amberGlowBgFaint = Color(0x0DF5A623); // 5% opacity
  static const Color amberGlowBgMedium = Color(0x33F5A623); // 20% opacity

  // Accent — green / live
  static const Color green = Color(0xFF00E57A);
  static const Color greenDim = Color(0xFF00B85F);
  static const Color greenGlow = Color(0x2600E57A); // 15% opacity
  static const Color greenGlowSubtle = Color(0x1F00E57A); // 12% opacity
  static const Color greenGlowBorder = Color(0x4D00E57A); // 30% opacity

  // Foreground
  static const Color fg = Color(0xFFF0F2F5);
  static const Color fgMuted = Color(0xFF8A9BB0);
  static const Color fgDim = Color(0xFF4A5A6E);

  // Semantic
  static const Color redScore = Color(0xFFFF4D4D);
  static const Color redGlow = Color(0x33FF4D4D); // 20% opacity
  static const Color blueAway = Color(0xFF4D9FFF);

  // Neutral badge
  static const Color neutralBadgeBg = Color(0x14F0F2F5); // 8% opacity
  static const Color neutralBadgeBorder = Color(0x1FF0F2F5); // 12% opacity
}

// ─── Spacing ──────────────────────────────────────────────────────────────────

class AppSpacing {
  AppSpacing._();

  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double base = 16.0;
  static const double lg = 20.0;
  static const double xl = 24.0;
  static const double xxl = 32.0;
  static const double xxxl = 48.0;
}

// ─── Border Radius ────────────────────────────────────────────────────────────

class AppRadius {
  AppRadius._();

  static const double tight = 6.0;
  static const double card = 10.0;
  static const double pill = 9999.0;
}

// ─── Typography Scale ─────────────────────────────────────────────────────────

class AppFontSize {
  AppFontSize._();

  static const double xxs = 10.0;
  static const double xs = 12.0;
  static const double sm = 14.0;
  static const double base = 16.0;
  static const double lg = 18.0;
  static const double xl = 20.0;
  static const double xxl = 24.0;
  static const double xxxl = 30.0;
  static const double xxxxl = 36.0;
  static const double hero = 48.0; // scoreboard numbers
}

// ─── Letter Spacing ───────────────────────────────────────────────────────────

class AppLetterSpacing {
  AppLetterSpacing._();

  static const double tight = 0.8;
  static const double base = 1.2;
  static const double wide = 1.6;
  static const double wider = 2.0;
  static const double widest = 2.4;
  static const double ultra = 4.8;
}

// ─── Theme ────────────────────────────────────────────────────────────────────

ThemeData buildCockpitTheme() {
  return ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.cockpit,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.amber,
      secondary: AppColors.green,
      surface: AppColors.cockpitSurface,
      onPrimary: AppColors.cockpit,
      onSecondary: AppColors.cockpit,
      onSurface: AppColors.fg,
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.cockpitMid,
      selectedItemColor: AppColors.amber,
      unselectedItemColor: AppColors.fgDim,
      type: BottomNavigationBarType.fixed,
      elevation: 0,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.cockpitMid,
      foregroundColor: AppColors.fg,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        color: AppColors.fg,
        fontSize: AppFontSize.lg,
        fontWeight: FontWeight.w700,
        letterSpacing: AppLetterSpacing.wide,
      ),
    ),
    cardTheme: CardTheme(
      color: AppColors.cockpitSurface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.card),
        side: const BorderSide(color: AppColors.cockpitBorder, width: 1),
      ),
      margin: EdgeInsets.zero,
    ),
    dividerColor: AppColors.cockpitBorder,
    textTheme: const TextTheme(
      displayLarge: TextStyle(
        color: AppColors.fg,
        fontSize: AppFontSize.hero,
        fontWeight: FontWeight.w800,
        letterSpacing: AppLetterSpacing.tight,
      ),
      headlineMedium: TextStyle(
        color: AppColors.fg,
        fontSize: AppFontSize.xxl,
        fontWeight: FontWeight.w700,
        letterSpacing: AppLetterSpacing.tight,
      ),
      titleLarge: TextStyle(
        color: AppColors.fg,
        fontSize: AppFontSize.xl,
        fontWeight: FontWeight.w700,
        letterSpacing: AppLetterSpacing.tight,
      ),
      titleMedium: TextStyle(
        color: AppColors.fg,
        fontSize: AppFontSize.base,
        fontWeight: FontWeight.w600,
      ),
      bodyLarge: TextStyle(
        color: AppColors.fg,
        fontSize: AppFontSize.base,
      ),
      bodyMedium: TextStyle(
        color: AppColors.fgMuted,
        fontSize: AppFontSize.sm,
      ),
      labelSmall: TextStyle(
        color: AppColors.fgDim,
        fontSize: AppFontSize.xs,
        letterSpacing: AppLetterSpacing.widest,
        fontWeight: FontWeight.w600,
      ),
    ),
    useMaterial3: true,
  );
}
