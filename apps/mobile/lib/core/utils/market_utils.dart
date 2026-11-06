import 'package:flutter/material.dart';
import '../theme/colors.dart';

class MarketUtils {
  static bool isMarketOpen() {
    final now = DateTime.now().toUtc();
    // IST is UTC + 5 hours 30 mins
    final istTotalMinutes = now.hour * 60 + now.minute + 330;
    final istMinutesInDay = istTotalMinutes % 1440;

    // Weekdays Monday=1 to Friday=5
    final weekday = (now.weekday + (istTotalMinutes >= 1440 ? 1 : 0)) % 7;
    final isWeekday = weekday >= 1 && weekday <= 5;

    // Market hours: 9:15 AM (555 min) to 3:30 PM (930 min)
    return isWeekday && istMinutesInDay >= 555 && istMinutesInDay <= 930;
  }

  static Color priceColor(double change) =>
      change >= 0 ? AppColors.positive : AppColors.negative;

  static IconData priceIcon(double change) =>
      change >= 0 ? Icons.trending_up : Icons.trending_down;
}
