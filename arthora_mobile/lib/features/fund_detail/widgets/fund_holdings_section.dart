import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../models/fund_detail_model.dart';

class FundHoldingsSectionWidget extends StatelessWidget {
  final List<HoldingItem> holdings;
  final List<SectorAllocItem> sectors;

  const FundHoldingsSectionWidget({
    super.key,
    required this.holdings,
    required this.sectors,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Sector Allocation Pie Chart
        if (sectors.isNotEmpty) ...[
          Text('SECTOR ALLOCATION', style: AppTextStyles.labelSmall),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface2,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0x0FFFFFFF)),
            ),
            child: Column(
              children: [
                SizedBox(
                  height: 160,
                  child: PieChart(
                    PieChartData(
                      sectionsSpace: 2,
                      centerSpaceRadius: 40,
                      sections: sectors.take(6).toList().asMap().entries.map((entry) {
                        final idx = entry.key;
                        final s = entry.value;
                        final color = AppColors.chartPalette[idx % AppColors.chartPalette.length];
                        return PieChartSectionData(
                          value: s.percentage,
                          color: color,
                          title: '${s.percentage.toInt()}%',
                          titleStyle: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                          radius: 30,
                        );
                      }).toList(),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 10,
                  runSpacing: 6,
                  children: sectors.take(6).toList().asMap().entries.map((entry) {
                    final idx = entry.key;
                    final s = entry.value;
                    final color = AppColors.chartPalette[idx % AppColors.chartPalette.length];
                    return Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: color,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${s.sector} (${s.percentage.toStringAsFixed(1)}%)',
                          style: AppTextStyles.labelSmall.copyWith(fontSize: 10),
                        ),
                      ],
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],

        // Top Portfolio Holdings
        Text('TOP PORTFOLIO HOLDINGS (${holdings.length})', style: AppTextStyles.labelSmall),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: AppColors.surface2,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0x0FFFFFFF)),
          ),
          child: ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: holdings.take(10).length,
            separatorBuilder: (_, __) => const Divider(color: Color(0x0AFFFFFF), height: 1),
            itemBuilder: (context, idx) {
              final h = holdings[idx];
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: AppColors.surface1,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '${idx + 1}',
                        style: const TextStyle(
                          fontFamily: 'JetBrainsMono',
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppColors.brandSecondary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            h.companyName,
                            style: AppTextStyles.titleMedium.copyWith(fontSize: 13),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (h.sector != null)
                            Text(
                              h.sector!,
                              style: AppTextStyles.bodySmall.copyWith(fontSize: 10),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.brandPrimary.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '${h.percentage.toStringAsFixed(2)}%',
                        style: const TextStyle(
                          fontFamily: 'JetBrainsMono',
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
