import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'theme/design_tokens.dart';
import 'screens/home_screen.dart';
import 'screens/scores_screen.dart';
import 'screens/sports_screen.dart';
import 'screens/stats_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Force portrait + landscape but lock status bar to dark icons on light bg
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: AppColors.cockpitMid,
    systemNavigationBarIconBrightness: Brightness.light,
  ));
  runApp(const ScoreDriveApp());
}

class ScoreDriveApp extends StatelessWidget {
  const ScoreDriveApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ScoreDrive',
      debugShowCheckedModeBanner: false,
      theme: buildCockpitTheme(),
      home: const RootShell(),
    );
  }
}

class RootShell extends StatefulWidget {
  const RootShell({Key? key}) : super(key: key);

  @override
  State<RootShell> createState() => _RootShellState();
}

class _RootShellState extends State<RootShell> {
  int _currentIndex = 0;

  // Keep screens alive when switching tabs
  final List<Widget> _screens = const [
    HomeScreen(),
    ScoresScreen(),
    SportsScreen(),
    StatsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cockpit,
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(
            top: BorderSide(color: AppColors.cockpitBorder, width: 1),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          backgroundColor: AppColors.cockpitMid,
          selectedItemColor: AppColors.amber,
          unselectedItemColor: AppColors.fgDim,
          selectedLabelStyle: const TextStyle(
            fontSize: AppFontSize.xs,
            fontWeight: FontWeight.w700,
            letterSpacing: AppLetterSpacing.widest,
          ),
          unselectedLabelStyle: const TextStyle(
            fontSize: AppFontSize.xs,
            letterSpacing: AppLetterSpacing.widest,
          ),
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'HOME',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.scoreboard_outlined),
              activeIcon: Icon(Icons.scoreboard),
              label: 'SCORES',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.sports_outlined),
              activeIcon: Icon(Icons.sports),
              label: 'SPORTS',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.bar_chart_outlined),
              activeIcon: Icon(Icons.bar_chart),
              label: 'STATS',
            ),
          ],
        ),
      ),
    );
  }
}

