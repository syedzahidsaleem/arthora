import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/storage/secure_storage.dart';
import '../models/user_model.dart';

class AuthRepository {
  final ApiClient _apiClient;

  AuthRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<AuthResult> loginWithEmail(String email, String password) async {
    final res = await _apiClient.post(
      ApiConstants.login,
      data: {'email': email, 'password': password},
    );
    final authResult = AuthResult.fromJson(res as Map<String, dynamic>);
    await SecureStorage.saveTokens(
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
    );
    return authResult;
  }

  Future<AuthResult> register(String name, String email, String password) async {
    final res = await _apiClient.post(
      ApiConstants.register,
      data: {'name': name, 'email': email, 'password': password},
    );
    final authResult = AuthResult.fromJson(res as Map<String, dynamic>);
    await SecureStorage.saveTokens(
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
    );
    return authResult;
  }

  Future<AuthResult> loginWithGoogle(String idToken) async {
    final res = await _apiClient.post(
      ApiConstants.googleLogin,
      data: {'idToken': idToken},
    );
    final authResult = AuthResult.fromJson(res as Map<String, dynamic>);
    await SecureStorage.saveTokens(
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
    );
    return authResult;
  }

  Future<void> logout() async {
    final refreshToken = await SecureStorage.getRefreshToken();
    try {
      if (refreshToken != null) {
        await _apiClient.post(
          ApiConstants.logout,
          data: {'refreshToken': refreshToken},
        );
      }
    } catch (_) {
      // Ignore network errors on logout
    } finally {
      await SecureStorage.clearTokens();
    }
  }

  Future<UserModel> getMe() async {
    final res = await _apiClient.get(ApiConstants.me);
    return UserModel.fromJson(res as Map<String, dynamic>);
  }

  Future<void> sendFcmToken(String token) async {
    try {
      await _apiClient.post(
        ApiConstants.fcmToken,
        data: {'fcmToken': token},
      );
    } catch (_) {
      // Best-effort FCM token registration
    }
  }
}
