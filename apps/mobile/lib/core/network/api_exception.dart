import 'package:dio/dio.dart';

class ApiException implements Exception {
  final int statusCode;
  final String code;
  final String message;

  const ApiException({
    required this.statusCode,
    required this.code,
    required this.message,
  });

  factory ApiException.fromDioError(DioException error) {
    final response = error.response;
    final statusCode = response?.statusCode ?? 500;
    String code = 'NETWORK_ERROR';
    String message = 'A network communication error occurred.';

    if (response?.data is Map<String, dynamic>) {
      final data = response!.data as Map<String, dynamic>;
      if (data['error'] is Map<String, dynamic>) {
        final errMap = data['error'] as Map<String, dynamic>;
        code = errMap['code']?.toString() ?? code;
        message = errMap['message']?.toString() ?? message;
      } else if (data['message'] != null) {
        message = data['message'].toString();
      }
    } else if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      code = 'TIMEOUT';
      message = 'Request timed out. Please check your internet connection.';
    }

    return ApiException(
      statusCode: statusCode,
      code: code,
      message: message,
    );
  }

  factory ApiException.notFound(String resource) => ApiException(
        statusCode: 404,
        code: 'NOT_FOUND',
        message: '$resource not found',
      );

  @override
  String toString() => 'ApiException: [$code ($statusCode)] $message';
}
