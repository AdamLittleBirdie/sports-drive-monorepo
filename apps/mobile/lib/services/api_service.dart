import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/match.dart';

class ApiService {
  static const String baseUrl = 'https://sports-drive-backend-production.up.railway.app';

  static Future<List<Match>> getAllMatches() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/all-matches'),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = jsonDecode(response.body);
        final List<dynamic> data = jsonResponse['data'] as List<dynamic>;
        return data.map((json) => Match.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load matches: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching matches: $e');
    }
  }
}
