import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/custom_error_widget.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../../watchlist/providers/watchlist_provider.dart';
import '../providers/fund_detail_provider.dart';
import '../widgets/fund_header_section.dart';
import '../widgets/fund_nav_chart.dart';
import '../widgets/fund_metrics_section.dart';
import '../widgets/fund_holdings_section.dart';
import '../widgets/sip_calculator_widget.dart';

class FundDetailScreen extends ConsumerWidget {
  final dynamic schemeCode;

  const FundDetailScreen({super.key, required this.schemeCode});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final fundState = ref.watch(fundDetailFamily(schemeCode));
    final notifier = ref.read(fundDetailFamily(schemeCode).notifier);
    final watchlistNotifier = ref.read(watchlistNotifierProvider.notifier);
    final isSaved = ref.watch(watchlistNotifierProvider).funds.any(
          (f) => f.schemeCode.toString() == schemeCode.toString(),
        );

    if (fundState.isLoading && fundState.fund == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Fund Research')),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: const [
            LoadingShimmer(width: double.infinity, height: 160, borderRadius: 20),
            SizedBox(height: 16),
            LoadingShimmer(width: double.infinity, height: 240, borderRadius: 20),
            SizedBox(height: 16),
            LoadingShimmer(width: double.infinity, height: 280, borderRadius: 20),
          ],
        ),
      );
    }

    if (fundState.errorMessage != null && fundState.fund == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Fund Research')),
        body: CustomErrorWidget(
          message: fundState.errorMessage!,
          onRetry: () => notifier.loadAll(),
        ),
      );
    }

    final fund = fundState.fund!;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: () => notifier.loadAll(),
        color: AppColors.brandSecondary,
        backgroundColor: AppColors.surface1,
        child: CustomScrollView(
          slivers: [
            // Sliver App Bar
            SliverAppBar(
              pinned: true,
              title: Text(
                fund.schemeName,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              actions: [
                IconButton(
                  icon: Icon(
                    isSaved ? Icons.bookmark : Icons.bookmark_border,
                    color: isSaved ? AppColors.brandSecondary : AppColors.textSecondary,
                  ),
                  onPressed: () {
                    watchlistNotifier.toggleFavoriteFund(
                      schemeCode: fund.schemeCode,
                      name: fund.schemeName,
                      category: fund.category,
                      latestNAV: fund.latestNAV,
                      cagr1Y: fundState.metrics?.cagr1Y,
                    );
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          isSaved
                              ? 'Removed from Watchlist'
                              : '${fund.schemeName} added to Watchlist',
                        ),
                        duration: const Duration(seconds: 2),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                ),
              ],
            ),

            // Content Body
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header Card
                    FundHeaderSection(fund: fund),
                    const SizedBox(height: 16),

                    // NAV Chart
                    FundNAVChartWidget(
                      points: fundState.navHistory,
                      selectedTimeframe: fundState.selectedTimeframe,
                      onTimeframeChanged: (tf) => notifier.setTimeframe(tf),
                    ),
                    const SizedBox(height: 24),

                    // Quantitative Metrics Grid
                    FundMetricsSectionWidget(metrics: fundState.metrics),
                    const SizedBox(height: 24),

                    // Sector Allocations & Holdings
                    FundHoldingsSectionWidget(
                      holdings: fundState.holdings,
                      sectors: fundState.sectors,
                    ),
                    const SizedBox(height: 24),

                    // SIP Calculator
                    SIPCalculatorWidget(
                      defaultCAGR: fundState.metrics?.cagr3Y ?? 14.0,
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
