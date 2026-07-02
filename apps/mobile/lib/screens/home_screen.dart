import 'package:flutter/material.dart';
import '../config/api_config.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<String> _healthStatus;

  @override
  void initState() {
    super.initState();
    _healthStatus = _checkHealth();
  }

  Future<String> _checkHealth() async {
    try {
      // TODO: Implement actual health check call
      return 'Backend: ${ApiConfig.baseUrl}';
    } catch (e) {
      return 'Error: $e';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sports Drive'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Welcome to Sports Drive'),
            const SizedBox(height: 20),
            FutureBuilder<String>(
              future: _healthStatus,
              builder: (context, snapshot) {
                if (snapshot.hasData) {
                  return Text(snapshot.data!);
                } else if (snapshot.hasError) {
                  return Text('Error: ${snapshot.error}');
                }
                return const CircularProgressIndicator();
              },
            ),
          ],
        ),
      ),
    );
  }
}
