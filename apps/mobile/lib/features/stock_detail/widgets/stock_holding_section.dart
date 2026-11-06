import 'package:flutter/material.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../shared/widgets/metric_tile.dart';
import '../models/stock_detail_model.dart';

class StockHoldingSectionWidget extends StatelessWidget {
  final StockMetrics? metrics;

  const StockHoldingSectionWidget({super.key, required this.metrics});

  @override
  Widget build(BuildContext context) {
    final promoter = metrics?.promoterHolding ?? 52.0;
    final fii = metrics?.fiiHolding ?? 20.0;
    final dii = metrics?.diiHolding ?? 14.0;
    final publicHolding = metrics?.publicHolding ?? 14.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('SHAREHOLDING PATTERN BREAKDOWN', style: AppTextStyles.labelSmall),
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
              label: 'Promoter Stake',
              value: '${promoter.toStringAsFixed(1)}%',
            ),
            MetricTile(
              label: 'FII / FPI Stake',
              value: '${fii.toStringAsFixed(1)}%',
            ),
            MetricTile(
              label: 'DII Stake',
              value: '${dii.toStringAsFixed(1)}%',
            ),
            MetricTile(
              label: 'Public & Retail',
              value: '${publicHolding.toStringAsFixed(1)}%',
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Stacked Horizontal Bar
        Container(
          height: 12,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(6),
            color: AppColors.surface1,
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: Row(
              children: [
                Expanded(flex: promoter.toInt(), child: Container(color: AppColors.brandPrimary)),
                Expanded(flex: fii.toInt(), child: Container(color: AppColors.brandSecondary)),
                Expanded(flex: dii.toInt(), child: Container(color: AppColors.positive)),
                Expanded(flex: publicHolding.toInt(), child: Container(color: AppColors.textMuted)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
