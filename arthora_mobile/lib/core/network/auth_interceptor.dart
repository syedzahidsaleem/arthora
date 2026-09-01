import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';
import '../constants/api_constants.dart';

class AuthInterceptor extends Interceptor {
  final Dio dio;

  AuthInterceptor({required this.dio});

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await SecureStorage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    return handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401 &&
        !err.requestOptions.path.contains('/auth/login') &&
        !err.requestOptions.path.contains('/auth/refresh')) {
      final refreshToken = await SecureStorage.getRefreshToken();
      if (refreshToken != null && refreshToken.isNotEmpty) {
        try {
          final refreshDio = Dio(BaseOptions(baseUrl: ApiConstants.baseUrl));
          final res = await refreshDio.post(
            ApiConstants.refresh,
            data: {'refreshToken': refreshToken},
          );

          if (res.statusCode == 200 && res.data['success'] == true) {
            final data = res.data['data'] as Map<String, dynamic>;
            final newAccessToken = data['accessToken'] as String;
            final newRefreshToken = data['refreshToken'] as String;

            await SecureStorage.saveTokens(
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            );

            // Retry original request with new token
            final opts = err.requestOptions;
            opts.headers['Authorization'] = 'Bearer $newAccessToken';

            final cloneReq = await dio.fetch(opts);
            return handler.resolve(cloneReq);
          }
        } catch (_) {
          await SecureStorage.clearTokens();
        }
      } else {
        await SecureStorage.clearTokens();
      }
    }

    return handler.next(err);
  }
}
