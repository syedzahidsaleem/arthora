import 'package:flutter/material.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/metric_tile.dart';
import '../models/stock_detail_model.dart';

class StockMetricsSectionWidget extends StatelessWidget {
  final StockMetrics? metrics;

  const StockMetricsSectionWidget({super.key, required this.metrics});

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
        Text('VALUATION & FUNDAMENTAL RATIOS', style: AppTextStyles.labelSmall),
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
              label: 'P/E Ratio (TTM)',
              value: metrics!.peRatioTTM != null ? metrics!.peRatioTTM!.toStringAsFixed(2) : '—',
            ),
            MetricTile(
              label: 'Forward P/E',
              value: metrics!.peRatioForward != null ? metrics!.peRatioForward!.toStringAsFixed(2) : '—',
            ),
            MetricTile(
              label: 'P/B Ratio',
              value: metrics!.pbRatio != null ? metrics!.pbRatio!.toStringAsFixed(2) : '—',
            ),
            MetricTile(
              label: 'Dividend Yield',
              value: metrics!.dividendYield != null ? '${metrics!.dividendYield!.toStringAsFixed(2)}%' : '—',
            ),
            MetricTile(
              label: 'Market Cap',
              value: metrics!.marketCap != null ? Formatters.formatLargeINR(metrics!.marketCap!) : '—',
            ),
            MetricTile(
              label: 'Beta (Volatility)',
              value: metrics!.beta != null ? metrics!.beta!.toStringAsFixed(2) : '—',
            ),
            MetricTile(
              label: 'EPS (TTM)',
              value: metrics!.epsTTM != null ? '₹${metrics!.epsTTM!.toStringAsFixed(2)}' : '—',
            ),
            MetricTile(
              label: 'EPS Growth YoY',
              value: metrics!.epsGrowthYoY != null ? '${metrics!.epsGrowthYoY! > 0 ? '+' : ''}${metrics!.epsGrowthYoY!.toStringAsFixed(1)}%' : '—',
              change: metrics!.epsGrowthYoY,
            ),
            MetricTile(
              label: 'Return on Equity (ROE)',
              value: metrics!.roe != null ? '${metrics!.roe!.toStringAsFixed(2)}%' : '—',
            ),
            MetricTile(
              label: 'ROCE',
              value: metrics!.roce != null ? '${metrics!.roce!.toStringAsFixed(2)}%' : '—',
            ),
            MetricTile(
              label: 'Revenue (TTM)',
              value: metrics!.revenueTTM != null ? Formatters.formatLargeINR(metrics!.revenueTTM!) : '—',
            ),
            MetricTile(
              label: 'Net Profit (TTM)',
              value: metrics!.netProfitTTM != null ? Formatters.formatLargeINR(metrics!.netProfitTTM!) : '—',
            ),
            MetricTile(
              label: 'Debt to Equity',
              value: metrics!.debtToEquity != null ? metrics!.debtToEquity!.toStringAsFixed(2) : '—',
            ),
            MetricTile(
              label: 'Return on Assets (ROA)',
              value: metrics!.roa != null ? '${metrics!.roa!.toStringAsFixed(2)}%' : '—',
            ),
          ],
        ),
      ],
    );
  }
}
