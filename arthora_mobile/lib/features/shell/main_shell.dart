import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';

class MainShell extends StatelessWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  int _calculateSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/ai')) return 0;
    if (location.startsWith('/research')) return 1;
    if (location.startsWith('/watchlist')) return 2;
    if (location.startsWith('/settings')) return 3;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go('/ai');
        break;
      case 1:
        context.go('/research');
        break;
      case 2:
        context.go('/watchlist');
        break;
      case 3:
        context.go('/settings');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = _calculateSelectedIndex(context);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(
            top: BorderSide(color: Color(0x0FFFFFFF), width: 1),
          ),
        ),
        child: NavigationBar(
          selectedIndex: selectedIndex,
          onDestinationSelected: (idx) => _onItemTapped(idx, context),
          backgroundColor: AppColors.surface1,
          indicatorColor: AppColors.brandPrimary.withOpacity(0.2),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.auto_awesome_outlined, color: AppColors.textSecondary),
              selectedIcon: Icon(Icons.auto_awesome, color: AppColors.brandSecondary),
              label: 'AI Goals',
            ),
            NavigationDestination(
              icon: Icon(Icons.search_outlined, color: AppColors.textSecondary),
              selectedIcon: Icon(Icons.search, color: AppColors.brandSecondary),
              label: 'Research',
            ),
            NavigationDestination(
              icon: Icon(Icons.bookmark_border_outlined, color: AppColors.textSecondary),
              selectedIcon: Icon(Icons.bookmark, color: AppColors.brandSecondary),
              label: 'Watchlist',
            ),
            NavigationDestination(
              icon: Icon(Icons.settings_outlined, color: AppColors.textSecondary),
              selectedIcon: Icon(Icons.settings, color: AppColors.brandSecondary),
              label: 'Settings',
            ),
          ],
        ),
      ),
    );
  }
}
