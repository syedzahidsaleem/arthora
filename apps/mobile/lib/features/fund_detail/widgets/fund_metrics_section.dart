import 'package:flutter/material.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/metric_tile.dart';
import '../models/fund_detail_model.dart';

class FundMetricsSectionWidget extends StatelessWidget {
  final FundMetrics? metrics;

  const FundMetricsSectionWidget({super.key, required this.metrics});

  @override
  Widget build(BuildContext context) {
    if (metrics == null) {
      return GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 2.2,
        children: List.generate(
          8,
          (_) => const MetricTile(label: 'Loading...', value: '—'),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('KEY SCHEME METRICS & RATIOS', style: AppTextStyles.labelSmall),
        const SizedBox(height: 10),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 8,
          mainAxisSpacing: 8,
          childAspectRatio: 2.2,
          children: [
            MetricTile(
              label: '1Y CAGR Return',
              value: metrics!.cagr1Y != null ? Formatters.formatPercent(metrics!.cagr1Y!) : '—',
              change: metrics!.cagr1Y,
            ),
            MetricTile(
              label: '3Y CAGR Return',
              value: metrics!.cagr3Y != null ? Formatters.formatPercent(metrics!.cagr3Y!) : '—',
              change: metrics!.cagr3Y,
            ),
            MetricTile(
              label: '5Y CAGR Return',
              value: metrics!.cagr5Y != null ? Formatters.formatPercent(metrics!.cagr5Y!) : '—',
              change: metrics!.cagr5Y,
            ),
            MetricTile(
              label: 'Expense Ratio',
              value: metrics!.expenseRatio != null ? '${metrics!.expenseRatio!.toStringAsFixed(2)}%' : '—',
            ),
            MetricTile(
              label: 'Sharpe Ratio',
              value: metrics!.sharpeRatio != null ? metrics!.sharpeRatio!.toStringAsFixed(2) : '—',
            ),
            MetricTile(
              label: 'Sortino Ratio',
              value: metrics!.sortinoRatio != null ? metrics!.sortinoRatio!.toStringAsFixed(2) : '—',
            ),
            MetricTile(
              label: 'Alpha (vs Index)',
              value: metrics!.alpha != null ? '${metrics!.alpha! > 0 ? '+' : ''}${metrics!.alpha!.toStringAsFixed(2)}%' : '—',
              change: metrics!.alpha,
            ),
            MetricTile(
              label: 'Beta (Volatility)',
              value: metrics!.beta != null ? metrics!.beta!.toStringAsFixed(2) : '—',
            ),
            MetricTile(
              label: 'Standard Deviation',
              value: metrics!.standardDeviation != null ? '${metrics!.standardDeviation!.toStringAsFixed(2)}%' : '—',
            ),
            MetricTile(
              label: 'Max Drawdown',
              value: metrics!.maxDrawdown != null ? '${metrics!.maxDrawdown!.toStringAsFixed(2)}%' : '—',
              change: metrics!.maxDrawdown != null ? -metrics!.maxDrawdown!.abs() : null,
            ),
            MetricTile(
              label: 'Min SIP Investment',
              value: metrics!.minSIP != null ? Formatters.formatINR(metrics!.minSIP!) : '₹500',
            ),
            MetricTile(
              label: 'Min Lumpsum',
              value: metrics!.minLumpsum != null ? Formatters.formatINR(metrics!.minLumpsum!) : '₹1,000',
            ),
            MetricTile(
              label: 'Fund Manager',
              value: metrics!.fundManager ?? 'Experienced Lead',
            ),
            MetricTile(
              label: 'Manager Tenure',
              value: metrics!.fundManagerTenure != null ? '${metrics!.fundManagerTenure!.toStringAsFixed(1)} Yrs' : '—',
            ),
          ],
        ),
      ],
    );
  }
}
