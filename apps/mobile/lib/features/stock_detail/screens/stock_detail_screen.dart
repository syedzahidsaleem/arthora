import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/custom_error_widget.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../../watchlist/providers/watchlist_provider.dart';
import '../providers/stock_detail_provider.dart';
import '../widgets/stock_header_section.dart';
import '../widgets/stock_price_chart.dart';
import '../widgets/stock_metrics_section.dart';
import '../widgets/stock_technical_section.dart';
import '../widgets/stock_holding_section.dart';

class StockDetailScreen extends ConsumerWidget {
  final String symbol;

  const StockDetailScreen({super.key, required this.symbol});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stockState = ref.watch(stockDetailFamily(symbol));
    final notifier = ref.read(stockDetailFamily(symbol).notifier);
    final watchlistNotifier = ref.read(watchlistNotifierProvider.notifier);
    final isSaved = ref.watch(watchlistNotifierProvider).stocks.any(
          (s) => s.symbol.toUpperCase() == symbol.toUpperCase(),
        );

    if (stockState.isLoading && stockState.stock == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: Text(symbol)),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: const [
            LoadingShimmer(width: double.infinity, height: 160, borderRadius: 20),
            SizedBox(height: 16),
            LoadingShimmer(width: double.infinity, height: 240, borderRadius: 20),
            SizedBox(height: 16),
            LoadingShimmer(width: double.infinity, height: 260, borderRadius: 20),
          ],
        ),
      );
    }

    if (stockState.errorMessage != null && stockState.stock == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: Text(symbol)),
        body: CustomErrorWidget(
          message: stockState.errorMessage!,
          onRetry: () => notifier.loadAll(),
        ),
      );
    }

    final stock = stockState.stock!;

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
                stock.companyName,
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
                    watchlistNotifier.toggleFavoriteStock(
                      symbol: stock.symbol,
                      name: stock.companyName,
                      currentPrice: stock.currentPrice,
                      changePercent: stock.changePercent,
                    );
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          isSaved
                              ? 'Removed from Watchlist'
                              : '${stock.symbol} added to Watchlist',
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
                    StockHeaderSection(stock: stock, metrics: stockState.metrics),
                    const SizedBox(height: 16),

                    // Price & Volume Chart
                    StockPriceChartWidget(
                      history: stockState.history,
                      selectedTimeframe: stockState.selectedTimeframe,
                      onTimeframeChanged: (tf) => notifier.setTimeframe(tf),
                    ),
                    const SizedBox(height: 24),

                    // Fundamentals Grid
                    StockMetricsSectionWidget(metrics: stockState.metrics),
                    const SizedBox(height: 24),

                    // Technical Momentum Chart
                    StockTechnicalSectionWidget(
                      technical: stockState.technical,
                      history: stockState.history,
                    ),
                    const SizedBox(height: 24),

                    // Shareholding Pattern
                    StockHoldingSectionWidget(metrics: stockState.metrics),
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
