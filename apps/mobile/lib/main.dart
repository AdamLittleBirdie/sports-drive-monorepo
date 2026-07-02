import 'package:flutter/material.dart';
import 'config/api_config.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const SportsDriveApp());
}

class SportsDriveApp extends StatelessWidget {
  const SportsDriveApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sports Drive',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
