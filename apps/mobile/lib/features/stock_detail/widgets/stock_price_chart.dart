import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/time_range_selector.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../models/stock_detail_model.dart';

class StockPriceChartWidget extends StatelessWidget {
  final List<StockPricePoint> history;
  final String selectedTimeframe;
  final ValueChanged<String> onTimeframeChanged;
  final bool isLoading;

  const StockPriceChartWidget({
    super.key,
    required this.history,
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
              Text('PRICE & VOLUME', style: AppTextStyles.labelSmall),
              TimeRangeSelector(
                selected: selectedTimeframe,
                onChanged: onTimeframeChanged,
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Chart or Loading
          if (isLoading && history.isEmpty)
            const LoadingShimmer(width: double.infinity, height: 230, borderRadius: 12)
          else if (history.isEmpty)
            Container(
              height: 230,
              alignment: Alignment.center,
              child: Text(
                'Historical price chart unavailable',
                style: AppTextStyles.bodySmall,
              ),
            )
          else
            Column(
              children: [
                // Price Line Chart
                SizedBox(
                  height: 160,
                  child: _buildPriceChart(),
                ),
                const SizedBox(height: 10),
                const Divider(color: Color(0x0AFFFFFF), height: 1),
                const SizedBox(height: 10),

                // Volume Bar Chart
                SizedBox(
                  height: 50,
                  child: _buildVolumeChart(),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildPriceChart() {
    final prices = history.map((p) => p.close).toList();
    final minPrice = prices.reduce((a, b) => a < b ? a : b);
    final maxPrice = prices.reduce((a, b) => a > b ? a : b);
    final buffer = (maxPrice - minPrice) * 0.08;

    final spots = <FlSpot>[];
    for (int i = 0; i < history.length; i++) {
      spots.add(FlSpot(i.toDouble(), history[i].close));
    }

    return LineChart(
      LineChartData(
        minY: minPrice - buffer,
        maxY: maxPrice + buffer,
        gridData: const FlGridData(show: false),
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 42,
              getTitlesWidget: (v, _) => Text(
                '₹${v.toStringAsFixed(0)}',
                style: const TextStyle(fontSize: 8, color: AppColors.textMuted),
              ),
            ),
          ),
        ),
        lineTouchData: LineTouchData(
          touchTooltipData: LineTouchTooltipData(
            tooltipBgColor: AppColors.surface1,
            getTooltipItems: (touchedSpots) {
              return touchedSpots.map((barSpot) {
                final idx = barSpot.x.toInt();
                final date = idx < history.length ? history[idx].date : '';
                return LineTooltipItem(
                  '$date\n${Formatters.formatINR(barSpot.y)}',
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
            color: AppColors.brandSecondary,
            barWidth: 2,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  AppColors.brandSecondary.withOpacity(0.3),
                  AppColors.brandSecondary.withOpacity(0.0),
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

  Widget _buildVolumeChart() {
    final maxVol = history.map((p) => p.volume).fold(1.0, (a, b) => a > b ? a : b);

    return BarChart(
      BarChartData(
        maxY: maxVol * 1.1,
        gridData: const FlGridData(show: false),
        borderData: FlBorderData(show: false),
        titlesData: const FlTitlesData(show: false),
        barGroups: history.asMap().entries.map((entry) {
          final idx = entry.key;
          final p = entry.value;
          return BarChartGroupData(
            x: idx,
            barRods: [
              BarChartRodData(
                toY: p.volume,
                color: AppColors.brandPrimary.withOpacity(0.5),
                width: 2,
                borderRadius: BorderRadius.circular(1),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }
}
