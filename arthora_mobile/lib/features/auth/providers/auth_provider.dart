import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb;
import '../../../core/storage/secure_storage.dart';
import '../models/user_model.dart';
import '../repositories/auth_repository.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final String? errorMessage;

  const AuthState({
    required this.status,
    this.user,
    this.errorMessage,
  });

  const AuthState.initial()
      : status = AuthStatus.initial,
        user = null,
        errorMessage = null;

  const AuthState.loading()
      : status = AuthStatus.loading,
        user = null,
        errorMessage = null;

  const AuthState.authenticated(UserModel user)
      : status = AuthStatus.authenticated,
        user = user,
        errorMessage = null;

  const AuthState.unauthenticated()
      : status = AuthStatus.unauthenticated,
        user = null,
        errorMessage = null;

  const AuthState.error(String message)
      : status = AuthStatus.error,
        user = null,
        errorMessage = message;

  bool get isAuthenticated => status == AuthStatus.authenticated && user != null;
  bool get isLoading => status == AuthStatus.loading;
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repo = ref.watch(authRepositoryProvider);
  return AuthNotifier(repo);
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;

  AuthNotifier(this._repository) : super(const AuthState.initial()) {
    initialize();
  }

  Future<void> initialize() async {
    final accessToken = await SecureStorage.getAccessToken();
    if (accessToken == null || accessToken.isEmpty) {
      state = const AuthState.unauthenticated();
      return;
    }

    try {
      state = const AuthState.loading();
      final user = await _repository.getMe();
      state = AuthState.authenticated(user);
      _setupFCM();
    } catch (_) {
      await SecureStorage.clearTokens();
      state = const AuthState.unauthenticated();
    }
  }

  Future<void> signInWithEmail(String email, String password) async {
    state = const AuthState.loading();
    try {
      final res = await _repository.loginWithEmail(email, password);
      state = AuthState.authenticated(res.user);
      _setupFCM();
    } catch (e) {
      state = AuthState.error(e.toString().replaceAll('ApiException: ', ''));
    }
  }

  Future<void> register(String name, String email, String password) async {
    state = const AuthState.loading();
    try {
      final res = await _repository.register(name, email, password);
      state = AuthState.authenticated(res.user);
      _setupFCM();
    } catch (e) {
      state = AuthState.error(e.toString().replaceAll('ApiException: ', ''));
    }
  }

  Future<void> signInWithGoogle() async {
    state = const AuthState.loading();
    try {
      final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
      if (googleUser == null) {
        state = const AuthState.unauthenticated();
        return;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final fb.AuthCredential credential = fb.GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential =
          await fb.FirebaseAuth.instance.signInWithCredential(credential);
      final idToken = await userCredential.user?.getIdToken();

      if (idToken == null) {
        throw Exception('Failed to obtain Google authentication ID token');
      }

      final res = await _repository.loginWithGoogle(idToken);
      state = AuthState.authenticated(res.user);
      _setupFCM();
    } catch (e) {
      state = AuthState.error(e.toString().replaceAll('ApiException: ', ''));
    }
  }

  Future<void> signOut() async {
    await _repository.logout();
    state = const AuthState.unauthenticated();
  }

  void _setupFCM() {
    try {
      FirebaseMessaging.instance.getToken().then((token) {
        if (token != null) {
          _repository.sendFcmToken(token);
        }
      });
      FirebaseMessaging.instance.onTokenRefresh.listen((newToken) {
        _repository.sendFcmToken(newToken);
      });
    } catch (_) {
      // Firebase messaging optional in local/mock environments
    }
  }
}
