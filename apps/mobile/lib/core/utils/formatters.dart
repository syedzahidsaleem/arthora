import 'package:intl/intl.dart';

class Formatters {
  static String formatINR(double amount) {
    final formatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 2,
    );
    return formatter.format(amount);
  }

  static String formatLargeINR(double amount) {
    if (amount >= 10000000) {
      final cr = amount / 10000000;
      return '₹${cr.toStringAsFixed(2)} Cr';
    } else if (amount >= 100000) {
      final lk = amount / 100000;
      return '₹${lk.toStringAsFixed(2)} L';
    }
    return formatINR(amount);
  }

  static String formatPercent(double value, {int decimals = 2}) {
    return '${value.toStringAsFixed(decimals)}%';
  }

  static String formatDate(DateTime date) {
    return DateFormat('dd MMM yyyy').format(date);
  }

  static String formatNAV(double nav) {
    return '₹${nav.toStringAsFixed(2)}';
  }
}
