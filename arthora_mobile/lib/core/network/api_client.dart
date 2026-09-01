import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_constants.dart';
import 'auth_interceptor.dart';
import 'api_exception.dart';

class ApiClient {
  late final Dio _dio;

  ApiClient({String? baseUrl}) {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? ApiConstants.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(AuthInterceptor(dio: _dio));

    if (kDebugMode) {
      _dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          logPrint: (obj) => debugPrint('[Dio] $obj'),
        ),
      );
    }
  }

  Dio get dio => _dio;

  Future<dynamic> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return _extractData(response);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<dynamic> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.post(path, data: data, queryParameters: queryParameters);
      return _extractData(response);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<dynamic> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.delete(path, data: data, queryParameters: queryParameters);
      return _extractData(response);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<dynamic> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.patch(path, data: data, queryParameters: queryParameters);
      return _extractData(response);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  dynamic _extractData(Response response) {
    if (response.data is Map<String, dynamic>) {
      final map = response.data as Map<String, dynamic>;
      if (map.containsKey('data')) {
        return map['data'];
      }
      return map;
    }
    return response.data;
  }
}
