class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'BACKEND_URL',
    defaultValue: 'http://localhost:3000',
  );

  static const String apiVersion = 'v1';

  static String getEndpoint(String path) => '$baseUrl/api/$apiVersion$path';

  static const Duration timeout = Duration(seconds: 30);
}
