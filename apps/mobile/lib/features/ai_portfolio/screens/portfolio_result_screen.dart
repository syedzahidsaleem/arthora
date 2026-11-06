import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/disclaimer_widget.dart';
import '../models/portfolio_model.dart';
import '../providers/portfolio_provider.dart';
import '../widgets/allocation_card.dart';

class PortfolioResultScreen extends ConsumerWidget {
  final PortfolioModel portfolio;

  const PortfolioResultScreen({super.key, required this.portfolio});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final aiSuggestion = portfolio.aiSuggestion;
    final allocations = aiSuggestion?.allocation ?? [];
    final projectedCorpus = aiSuggestion?.projectedValue ?? 0.0;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // Sliver App Bar
          SliverAppBar(
            pinned: true,
            title: Text(portfolio.name),
            actions: [
              IconButton(
                icon: Icon(
                  portfolio.isPinned ? Icons.push_pin : Icons.push_pin_outlined,
                  color: portfolio.isPinned
                      ? AppColors.brandSecondary
                      : AppColors.textSecondary,
                ),
                onPressed: () {
                  ref.read(portfolioNotifierProvider.notifier).togglePin(portfolio.id);
                },
              ),
            ],
          ),

          // Main Body
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Goal Header Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surface2,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0x0FFFFFFF)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.brandPrimary.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                portfolio.goalCategory,
                                style: AppTextStyles.labelSmall.copyWith(
                                  color: AppColors.brandSecondary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            Text(
                              '${portfolio.timePeriod} Years Horizon',
                              style: AppTextStyles.labelSmall,
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          portfolio.goal,
                          style: AppTextStyles.titleMedium.copyWith(fontSize: 15),
                        ),
                        const SizedBox(height: 14),
                        const Divider(color: Color(0x0FFFFFFF), height: 1),
                        const SizedBox(height: 14),

                        // Projected Corpus Callout
                        Text(
                          'PROJECTED CORPUS VALUE',
                          style: AppTextStyles.labelSmall.copyWith(fontSize: 10),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              Formatters.formatLargeINR(projectedCorpus),
                              style: AppTextStyles.moneyLarge.copyWith(
                                color: AppColors.positive,
                                fontSize: 26,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'at year ${portfolio.timePeriod}',
                              style: AppTextStyles.bodySmall,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Monte Carlo Projected Curve Chart
                  Text('PROJECTED WEALTH GROWTH (MONTE CARLO)', style: AppTextStyles.labelSmall),
                  const SizedBox(height: 10),
                  Container(
                    height: 220,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surface2,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0x0FFFFFFF)),
                    ),
                    child: _buildProjectionChart(portfolio.timePeriod, projectedCorpus),
                  ),
                  const SizedBox(height: 24),

                  // Allocation Pie Chart Section
                  Text('PORTFOLIO ASSET ALLOCATION', style: AppTextStyles.labelSmall),
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
                          height: 180,
                          child: PieChart(
                            PieChartData(
                              sectionsSpace: 2,
                              centerSpaceRadius: 45,
                              sections: allocations.asMap().entries.map((entry) {
                                final idx = entry.key;
                                final item = entry.value;
                                final color = AppColors.chartPalette[idx % AppColors.chartPalette.length];
                                return PieChartSectionData(
                                  value: item.allocationPercent,
                                  color: color,
                                  title: '${item.allocationPercent.toInt()}%',
                                  titleStyle: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                  radius: 35,
                                );
                              }).toList(),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 12,
                          runSpacing: 6,
                          children: allocations.asMap().entries.map((entry) {
                            final idx = entry.key;
                            final item = entry.value;
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
                                  item.name.length > 18
                                      ? '${item.name.substring(0, 18)}...'
                                      : item.name,
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

                  // Allocation Items List
                  Text('RECOMMENDED INSTRUMENTS', style: AppTextStyles.labelSmall),
                  const SizedBox(height: 10),
                  ...allocations.asMap().entries.map((entry) {
                    final idx = entry.key;
                    final item = entry.value;
                    final color = AppColors.chartPalette[idx % AppColors.chartPalette.length];
                    return AllocationCard(item: item, barColor: color);
                  }),
                  const SizedBox(height: 16),

                  // AI Explanation ExpansionTile
                  if (aiSuggestion != null && aiSuggestion.explanation.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: AppColors.surface2,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0x0FFFFFFF)),
                      ),
                      child: Theme(
                        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                        child: ExpansionTile(
                          iconColor: AppColors.brandSecondary,
                          collapsedIconColor: AppColors.textSecondary,
                          title: Row(
                            children: [
                              const Icon(Icons.auto_awesome, size: 16, color: AppColors.brandSecondary),
                              const SizedBox(width: 8),
                              Text(
                                'AI Strategy & Rationale',
                                style: AppTextStyles.titleMedium.copyWith(fontSize: 14),
                              ),
                            ],
                          ),
                          children: [
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                              child: Text(
                                aiSuggestion.explanation,
                                style: AppTextStyles.bodyMedium.copyWith(height: 1.5),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  // Rebalancing Cadence
                  if (aiSuggestion != null)
                    Container(
                      padding: const EdgeInsets.all(14),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: AppColors.surface1,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0x0FFFFFFF)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.sync_alt, size: 16, color: AppColors.brandSecondary),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Rebalancing Strategy: ${aiSuggestion.rebalancing}',
                              style: AppTextStyles.bodySmall.copyWith(color: AppColors.textPrimary),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Disclaimer
                  DisclaimerWidget(message: aiSuggestion?.disclaimer),
                  const SizedBox(height: 24),

                  // Action Buttons
                  ElevatedButton(
                    onPressed: () => context.go('/ai'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.surface3,
                      foregroundColor: AppColors.textPrimary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: const Text('Create Another Goal'),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProjectionChart(int years, double targetCorpus) {
    final spotsP50 = <FlSpot>[];
    final spotsP75 = <FlSpot>[];
    final spotsP25 = <FlSpot>[];

    for (int y = 0; y <= years; y++) {
      final progress = y / (years == 0 ? 1 : years);
      final p50Val = targetCorpus * (progress * progress * 0.7 + progress * 0.3) / 10000000;
      spotsP50.add(FlSpot(y.toDouble(), p50Val));
      spotsP75.add(FlSpot(y.toDouble(), p50Val * 1.25));
      spotsP25.add(FlSpot(y.toDouble(), p50Val * 0.75));
    }

    return LineChart(
      LineChartData(
        gridData: const FlGridData(show: false),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 36,
              getTitlesWidget: (v, _) => Text(
                '₹${v.toStringAsFixed(1)}Cr',
                style: const TextStyle(fontSize: 8, color: AppColors.textMuted),
              ),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (v, _) => Text(
                'Y${v.toInt()}',
                style: const TextStyle(fontSize: 9, color: AppColors.textMuted),
              ),
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        lineBarsData: [
          // P50 Baseline (Brand Primary)
          LineChartBarData(
            spots: spotsP50,
            isCurved: true,
            color: AppColors.brandSecondary,
            barWidth: 2.5,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  AppColors.brandSecondary.withOpacity(0.3),
                  AppColors.brandPrimary.withOpacity(0.0),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
          // P75 Bull Case (Green dashed)
          LineChartBarData(
            spots: spotsP75,
            isCurved: true,
            color: AppColors.positive.withOpacity(0.7),
            barWidth: 1.5,
            dashArray: [4, 4],
            dotData: const FlDotData(show: false),
          ),
          // P25 Bear Case (Amber dashed)
          LineChartBarData(
            spots: spotsP25,
            isCurved: true,
            color: AppColors.warning.withOpacity(0.7),
            barWidth: 1.5,
            dashArray: [4, 4],
            dotData: const FlDotData(show: false),
          ),
        ],
      ),
    );
  }
}
