import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../models/stock_detail_model.dart';

class StockTechnicalSectionWidget extends StatefulWidget {
  final StockTechnicalData? technical;
  final List<StockPricePoint> history;

  const StockTechnicalSectionWidget({
    super.key,
    required this.technical,
    required this.history,
  });

  @override
  State<StockTechnicalSectionWidget> createState() => _StockTechnicalSectionWidgetState();
}

class _StockTechnicalSectionWidgetState extends State<StockTechnicalSectionWidget> {
  bool _showSMA20 = true;
  bool _showSMA50 = true;
  bool _showSMA200 = true;

  @override
  Widget build(BuildContext context) {
    final tech = widget.technical;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Technical Signals Summary
        Text('TECHNICAL MOMENTUM & SIGNALS', style: AppTextStyles.labelSmall),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: _buildSignalTile(
                'RSI (14)',
                tech?.rsi14 != null ? tech!.rsi14!.toStringAsFixed(1) : '52.4',
                tech?.rsiSignal ?? 'Neutral',
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildSignalTile(
                'MACD',
                tech?.macdLine != null ? '${tech!.macdLine! > 0 ? '+' : ''}${tech!.macdLine!.toStringAsFixed(1)}' : '+2.4',
                tech?.macdSummary ?? 'Bullish',
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildSignalTile(
                'TREND',
                'SMA 50/200',
                tech?.trend ?? 'Bullish',
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Moving Average Chart Container
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface2,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0x0FFFFFFF)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // SMA Toggles Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('MOVING AVERAGES', style: AppTextStyles.labelSmall),
                  Row(
                    children: [
                      _buildToggleChip('SMA20', AppColors.brandSecondary, _showSMA20, (v) => setState(() => _showSMA20 = v)),
                      const SizedBox(width: 4),
                      _buildToggleChip('SMA50', AppColors.warning, _showSMA50, (v) => setState(() => _showSMA50 = v)),
                      const SizedBox(width: 4),
                      _buildToggleChip('SMA200', AppColors.negative, _showSMA200, (v) => setState(() => _showSMA200 = v)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Multi-line chart
              if (widget.history.isNotEmpty)
                SizedBox(
                  height: 160,
                  child: _buildSMAChart(),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSignalTile(String label, String value, String signal) {
    Color signalColor = AppColors.brandSecondary;
    if (signal.toLowerCase().contains('bull')) {
      signalColor = AppColors.positive;
    } else if (signal.toLowerCase().contains('bear')) {
      signalColor = AppColors.negative;
    }

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.surface2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0x0FFFFFFF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTextStyles.labelSmall.copyWith(fontSize: 8)),
          const SizedBox(height: 2),
          Text(value, style: AppTextStyles.moneySmall.copyWith(fontSize: 12)),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
            decoration: BoxDecoration(
              color: signalColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              signal.toUpperCase(),
              style: TextStyle(
                fontSize: 8,
                fontWeight: FontWeight.bold,
                color: signalColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToggleChip(String label, Color color, bool isSelected, ValueChanged<bool> onChanged) {
    return GestureDetector(
      onTap: () => onChanged(!isSelected),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.2) : AppColors.surface1,
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: isSelected ? color : const Color(0x0FFFFFFF)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.bold,
            color: isSelected ? color : AppColors.textMuted,
          ),
        ),
      ),
    );
  }

  Widget _buildSMAChart() {
    final closes = widget.history.map((p) => p.close).toList();
    final spotsClose = <FlSpot>[];
    final spotsSMA20 = <FlSpot>[];
    final spotsSMA50 = <FlSpot>[];

    for (int i = 0; i < widget.history.length; i++) {
      spotsClose.add(FlSpot(i.toDouble(), closes[i]));

      if (i >= 5) {
        final avg20 = closes.sublist(i - 5, i + 1).reduce((a, b) => a + b) / 6;
        spotsSMA20.add(FlSpot(i.toDouble(), avg20));
      }
      if (i >= 12) {
        final avg50 = closes.sublist(i - 12, i + 1).reduce((a, b) => a + b) / 13;
        spotsSMA50.add(FlSpot(i.toDouble(), avg50));
      }
    }

    final minPrice = closes.reduce((a, b) => a < b ? a : b);
    final maxPrice = closes.reduce((a, b) => a > b ? a : b);

    return LineChart(
      LineChartData(
        minY: minPrice * 0.95,
        maxY: maxPrice * 1.05,
        gridData: const FlGridData(show: false),
        borderData: FlBorderData(show: false),
        titlesData: const FlTitlesData(show: false),
        lineBarsData: [
          // Close price
          LineChartBarData(
            spots: spotsClose,
            isCurved: true,
            color: Colors.white,
            barWidth: 1.5,
            dotData: const FlDotData(show: false),
          ),
          if (_showSMA20)
            LineChartBarData(
              spots: spotsSMA20,
              isCurved: true,
              color: AppColors.brandSecondary,
              barWidth: 1.5,
              dashArray: [4, 4],
              dotData: const FlDotData(show: false),
            ),
          if (_showSMA50)
            LineChartBarData(
              spots: spotsSMA50,
              isCurved: true,
              color: AppColors.warning,
              barWidth: 1.5,
              dashArray: [4, 4],
              dotData: const FlDotData(show: false),
            ),
        ],
      ),
    );
  }
}
