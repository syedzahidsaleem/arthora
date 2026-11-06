import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/shell/main_shell.dart';
import '../../features/ai_portfolio/screens/goal_input_screen.dart';
import '../../features/ai_portfolio/screens/polling_screen.dart';
import '../../features/ai_portfolio/screens/portfolio_list_screen.dart';
import '../../features/research/screens/search_screen.dart';
import '../../features/fund_detail/screens/fund_detail_screen.dart';
import '../../features/stock_detail/screens/stock_detail_screen.dart';
import '../../features/watchlist/screens/watchlist_screen.dart';
import '../../features/settings/screens/settings_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authNotifierProvider);

  return GoRouter(
    initialLocation: '/ai',
    redirect: (context, state) {
      final isAuth = authState.isAuthenticated;
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register';

      if (!isAuth && !isAuthRoute) {
        return '/login';
      }

      if (isAuth && isAuthRoute) {
        return '/ai';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/ai',
            builder: (context, state) => const GoalInputScreen(),
            routes: [
              GoRoute(
                path: 'history',
                builder: (context, state) => const PortfolioListScreen(),
              ),
              GoRoute(
                path: ':portfolioId',
                builder: (context, state) {
                  final id = state.pathParameters['portfolioId'] ?? '';
                  return PollingScreen(portfolioId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/research',
            builder: (context, state) => const SearchScreen(),
            routes: [
              GoRoute(
                path: 'fund/:schemeCode',
                builder: (context, state) {
                  final code = state.pathParameters['schemeCode'] ?? '';
                  return FundDetailScreen(schemeCode: code);
                },
              ),
              GoRoute(
                path: 'stock/:symbol',
                builder: (context, state) {
                  final sym = state.pathParameters['symbol'] ?? '';
                  return StockDetailScreen(symbol: sym);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/watchlist',
            builder: (context, state) => const WatchlistScreen(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
        ],
      ),
    ],
  );
});
