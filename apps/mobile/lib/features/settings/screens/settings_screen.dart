import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/storage/local_storage.dart';
import '../../auth/providers/auth_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  String _defaultTab = 'AI Portfolio';
  String _defaultExchange = 'NSE India';

  @override
  void initState() {
    super.initState();
    _loadPrefs();
  }

  Future<void> _loadPrefs() async {
    final prefs = await LocalStorage.getUserPreferences();
    if (prefs['defaultTab'] != null) {
      setState(() => _defaultTab = prefs['defaultTab'].toString());
    }
    if (prefs['defaultExchange'] != null) {
      setState(() => _defaultExchange = prefs['defaultExchange'].toString());
    }
  }

  Future<void> _savePrefs(String key, String value) async {
    final prefs = await LocalStorage.getUserPreferences();
    prefs[key] = value;
    await LocalStorage.saveUserPreferences(prefs);
  }

  void _clearSearchHistory() async {
    await LocalStorage.saveRecentSearches([]);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Search history cleared successfully'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _handleSignOut() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Sign Out'),
        content: const Text(
          'Are you sure you want to log out of your Arthora account?',
          style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref.read(authNotifierProvider.notifier).signOut();
              context.go('/login');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.negative,
              foregroundColor: Colors.white,
            ),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final user = authState.user;
    final initials = user?.name.isNotEmpty ?? false
        ? user!.name.split(' ').map((n) => n.isNotEmpty ? n[0] : '').join('').toUpperCase()
        : 'U';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // User Profile Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface2,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0x0FFFFFFF)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: AppColors.brandPrimary,
                  child: Text(
                    initials.isNotEmpty ? initials.substring(0, initials.length > 2 ? 2 : initials.length) : 'U',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.name ?? 'Investor',
                        style: AppTextStyles.titleMedium.copyWith(fontSize: 15),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        user?.email ?? 'name@example.com',
                        style: AppTextStyles.bodySmall,
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.surface1,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${user?.authProvider ?? 'email'} auth'.toUpperCase(),
                          style: const TextStyle(
                            fontFamily: 'JetBrainsMono',
                            fontSize: 8,
                            color: AppColors.brandSecondary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Preferences Section
          Text('PREFERENCES', style: AppTextStyles.labelSmall),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: AppColors.surface2,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0x0FFFFFFF)),
            ),
            child: Column(
              children: [
                ListTile(
                  title: const Text('Default Startup Tab', style: TextStyle(fontSize: 13, color: Colors.white)),
                  trailing: DropdownButton<String>(
                    value: _defaultTab,
                    dropdownColor: AppColors.surface1,
                    underline: const SizedBox.shrink(),
                    style: const TextStyle(color: AppColors.brandSecondary, fontSize: 12, fontWeight: FontWeight.bold),
                    items: const [
                      DropdownMenuItem(value: 'AI Portfolio', child: Text('AI Portfolio')),
                      DropdownMenuItem(value: 'Research Hub', child: Text('Research Hub')),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _defaultTab = val);
                        _savePrefs('defaultTab', val);
                      }
                    },
                  ),
                ),
                const Divider(color: Color(0x0AFFFFFF), height: 1),
                ListTile(
                  title: const Text('Default Exchange', style: TextStyle(fontSize: 13, color: Colors.white)),
                  trailing: DropdownButton<String>(
                    value: _defaultExchange,
                    dropdownColor: AppColors.surface1,
                    underline: const SizedBox.shrink(),
                    style: const TextStyle(color: AppColors.brandSecondary, fontSize: 12, fontWeight: FontWeight.bold),
                    items: const [
                      DropdownMenuItem(value: 'NSE India', child: Text('NSE India')),
                      DropdownMenuItem(value: 'BSE India', child: Text('BSE India')),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _defaultExchange = val);
                        _savePrefs('defaultExchange', val);
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Theme & Privacy Section
          Text('THEME & PRIVACY', style: AppTextStyles.labelSmall),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: AppColors.surface2,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0x0FFFFFFF)),
            ),
            child: Column(
              children: [
                const ListTile(
                  title: Text('Midnight Dark Mode', style: TextStyle(fontSize: 13, color: Colors.white)),
                  subtitle: Text('Optimized for OLED displays', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  trailing: Icon(Icons.check_circle, color: AppColors.brandSecondary, size: 20),
                ),
                const Divider(color: Color(0x0AFFFFFF), height: 1),
                ListTile(
                  title: const Text('Clear Search History', style: TextStyle(fontSize: 13, color: Colors.white)),
                  subtitle: const Text('Purge locally cached queries', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline, color: AppColors.textSecondary, size: 20),
                    onPressed: _clearSearchHistory,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // About Section
          Text('ABOUT & COMPLIANCE', style: AppTextStyles.labelSmall),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface2,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0x0FFFFFFF)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    Text('Platform Version', style: AppTextStyles.bodyMedium.copyWith(color: Colors.white)),
                    const Text('v1.0.0 (Build 1)', style: TextStyle(fontFamily: 'JetBrainsMono', fontSize: 11, color: AppColors.textSecondary)),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  AppConstants.sebiDisclaimer,
                  style: AppTextStyles.bodySmall.copyWith(fontSize: 10, color: AppColors.textMuted),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Sign Out Button
          Container(
            decoration: BoxDecoration(
              color: AppColors.negative.withOpacity(0.08),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.negative.withOpacity(0.3)),
            ),
            child: ListTile(
              leading: const Icon(Icons.logout, color: AppColors.negative, size: 20),
              title: const Text(
                'Sign Out',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: AppColors.negative,
                ),
              ),
              onTap: _handleSignOut,
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
