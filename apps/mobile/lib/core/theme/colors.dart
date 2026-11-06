import 'package:flutter/material.dart';

class AppColors {
  static const Color background = Color(0xFF0D0E1A);
  static const Color surface1 = Color(0xFF13141F);
  static const Color surface2 = Color(0xFF1A1B2E);
  static const Color surface3 = Color(0xFF22233A);
  static const Color brandPrimary = Color(0xFF6C63FF);
  static const Color brandSecondary = Color(0xFF00D2FF);
  static const Color positive = Color(0xFF00D084);
  static const Color negative = Color(0xFFFF4D6D);
  static const Color textPrimary = Color(0xFFF0F0FA);
  static const Color textSecondary = Color(0xFF9B9BB4);
  static const Color textMuted = Color(0xFF5A5A7A);
  static const Color warning = Color(0xFFFFB344);

  static const List<Color> chartPalette = [
    Color(0xFF6C63FF),
    Color(0xFF00D2FF),
    Color(0xFF00D084),
    Color(0xFFFFB800),
    Color(0xFFFF4D6D),
    Color(0xFFA78BFA),
    Color(0xFF38BDF8),
    Color(0xFF34D399),
  ];

  static const LinearGradient brandGradient = LinearGradient(
    colors: [brandPrimary, brandSecondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
