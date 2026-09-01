import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../providers/watchlist_provider.dart';
import '../widgets/watchlist_fund_tile.dart';
import '../widgets/watchlist_stock_tile.dart';

class WatchlistScreen extends ConsumerStatefulWidget {
  const WatchlistScreen({super.key});

  @override
  ConsumerState<WatchlistScreen> createState() => _WatchlistScreenState();
}

class _WatchlistScreenState extends ConsumerState<WatchlistScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final watchlistState = ref.watch(watchlistNotifierProvider);
    final notifier = ref.read(watchlistNotifierProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Investment Watchlist'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.brandSecondary,
          labelColor: AppColors.brandSecondary,
          unselectedLabelColor: AppColors.textSecondary,
          labelStyle: AppTextStyles.titleMedium.copyWith(fontSize: 13),
          tabs: [
            Tab(text: 'Mutual Funds (${watchlistState.funds.length})'),
            Tab(text: 'NSE Stocks (${watchlistState.stocks.length})'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Mutual Funds Tab
          _buildFundsTab(watchlistState, notifier),

          // Stocks Tab
          _buildStocksTab(watchlistState, notifier),
        ],
      ),
    );
  }

  Widget _buildFundsTab(WatchlistState state, WatchlistNotifier notifier) {
    if (state.isLoading && state.funds.isEmpty) {
      return ListView.builder(
        itemCount: 6,
        padding: const EdgeInsets.all(16),
        itemBuilder: (_, __) => const Padding(
          padding: EdgeInsets.only(bottom: 12),
          child: LoadingShimmer(width: double.infinity, height: 60, borderRadius: 12),
        ),
      );
    }

    if (state.funds.isEmpty) {
      return EmptyStateWidget(
        icon: Icons.bookmark_border,
        title: 'No Mutual Funds Saved',
        description: 'Track NAVs and 1Y CAGR by saving mutual funds from the Research hub.',
        actionLabel: 'Explore Mutual Funds',
        onAction: () => context.go('/research'),
      );
    }

    return RefreshIndicator(
      onRefresh: () => notifier.loadFavorites(),
      color: AppColors.brandSecondary,
      backgroundColor: AppColors.surface1,
      child: ListView.builder(
        itemCount: state.funds.length,
        itemBuilder: (context, index) {
          final item = state.funds[index];
          return WatchlistFundTile(
            fund: item,
            onDismissed: () => notifier.removeFavoriteFund(item.id),
          );
        },
      ),
    );
  }

  Widget _buildStocksTab(WatchlistState state, WatchlistNotifier notifier) {
    if (state.isLoading && state.stocks.isEmpty) {
      return ListView.builder(
        itemCount: 6,
        padding: const EdgeInsets.all(16),
        itemBuilder: (_, __) => const Padding(
          padding: EdgeInsets.only(bottom: 12),
          child: LoadingShimmer(width: double.infinity, height: 60, borderRadius: 12),
        ),
      );
    }

    if (state.stocks.isEmpty) {
      return EmptyStateWidget(
        icon: Icons.trending_up,
        title: 'No Stocks Saved',
        description: 'Track live NSE share prices and valuation ratios by bookmarking stocks.',
        actionLabel: 'Explore Stocks',
        onAction: () => context.go('/research'),
      );
    }

    return RefreshIndicator(
      onRefresh: () => notifier.loadFavorites(),
      color: AppColors.brandSecondary,
      backgroundColor: AppColors.surface1,
      child: ListView.builder(
        itemCount: state.stocks.length,
        itemBuilder: (context, index) {
          final item = state.stocks[index];
          return WatchlistStockTile(
            stock: item,
            onDismissed: () => notifier.removeFavoriteStock(item.id),
          );
        },
      ),
    );
  }
}
