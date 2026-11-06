import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/time_range_selector.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../models/fund_detail_model.dart';

class FundNAVChartWidget extends StatelessWidget {
  final List<NAVHistoryPoint> points;
  final String selectedTimeframe;
  final ValueChanged<String> onTimeframeChanged;
  final bool isLoading;

  const FundNAVChartWidget({
    super.key,
    required this.points,
    required this.selectedTimeframe,
    required this.onTimeframeChanged,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface2,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0x0FFFFFFF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header & Timeframe Row
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Text('HISTORICAL NAV', style: AppTextStyles.labelSmall),
              TimeRangeSelector(
                selected: selectedTimeframe,
                onChanged: onTimeframeChanged,
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Chart Body
          if (isLoading && points.isEmpty)
            const LoadingShimmer(width: double.infinity, height: 200, borderRadius: 12)
          else if (points.isEmpty)
            Container(
              height: 200,
              alignment: Alignment.center,
              child: Text(
                'Historical NAV data unavailable',
                style: AppTextStyles.bodySmall,
              ),
            )
          else
            SizedBox(
              height: 200,
              child: _buildLineChart(),
            ),
        ],
      ),
    );
  }

  Widget _buildLineChart() {
    final navs = points.map((p) => p.nav).toList();
    final minNav = navs.reduce((a, b) => a < b ? a : b);
    final maxNav = navs.reduce((a, b) => a > b ? a : b);
    final buffer = (maxNav - minNav) * 0.08;

    final spots = <FlSpot>[];
    for (int i = 0; i < points.length; i++) {
      spots.add(FlSpot(i.toDouble(), points[i].nav));
    }

    return LineChart(
      LineChartData(
        minY: minNav - buffer,
        maxY: maxNav + buffer,
        gridData: const FlGridData(show: false),
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 42,
              getTitlesWidget: (v, _) => Text(
                '₹${v.toStringAsFixed(1)}',
                style: const TextStyle(fontSize: 8, color: AppColors.textMuted),
              ),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 20,
              interval: (points.length / 4).clamp(1, double.infinity),
              getTitlesWidget: (val, _) {
                final idx = val.toInt();
                if (idx < 0 || idx >= points.length) return const SizedBox.shrink();
                final d = points[idx].date;
                return Text(
                  d.length > 5 ? d.substring(0, 5) : d,
                  style: const TextStyle(fontSize: 8, color: AppColors.textMuted),
                );
              },
            ),
          ),
        ),
        lineTouchData: LineTouchData(
          touchTooltipData: LineTouchTooltipData(
            tooltipBgColor: AppColors.surface1,
            getTooltipItems: (touchedSpots) {
              return touchedSpots.map((barSpot) {
                final idx = barSpot.x.toInt();
                final date = idx < points.length ? points[idx].date : '';
                return LineTooltipItem(
                  '$date\n${Formatters.formatNAV(barSpot.y)}',
                  const TextStyle(
                    fontFamily: 'JetBrainsMono',
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                );
              }).toList();
            },
          ),
        ),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: AppColors.brandPrimary,
            barWidth: 2,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  AppColors.brandPrimary.withOpacity(0.35),
                  AppColors.brandPrimary.withOpacity(0.0),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
