import 'package:intl/intl.dart';

class AppDateUtils {
  static String formatShortDate(DateTime date) {
    return DateFormat('dd MMM').format(date);
  }

  static String formatFullDate(DateTime date) {
    return DateFormat('dd MMMM yyyy').format(date);
  }

  static DateTime? parseDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return null;
    try {
      return DateTime.parse(dateStr);
    } catch (_) {
      try {
        return DateFormat('dd-MM-yyyy').parse(dateStr);
      } catch (_) {
        return null;
      }
    }
  }
}
