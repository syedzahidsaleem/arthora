import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  static const _keyTheme = 'arthora_theme';
  static const _keyRecentSearches = 'arthora_recent_searches';
  static const _keyUserPrefs = 'arthora_user_prefs';

  static Future<void> saveTheme(String theme) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyTheme, theme);
  }

  static Future<String> getTheme() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyTheme) ?? 'dark';
  }

  static Future<void> saveRecentSearches(List<String> searches) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_keyRecentSearches, searches);
  }

  static Future<List<String>> getRecentSearches() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_keyRecentSearches) ?? [];
  }

  static Future<void> saveUserPreferences(Map<String, dynamic> prefsMap) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUserPrefs, jsonEncode(prefsMap));
  }

  static Future<Map<String, dynamic>> getUserPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_keyUserPrefs);
    if (raw == null) return {};
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return {};
    }
  }
}
