import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const SportsdriveApp());
}

class SportsdriveApp extends StatelessWidget {
  const SportsdriveApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sports Drive',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
