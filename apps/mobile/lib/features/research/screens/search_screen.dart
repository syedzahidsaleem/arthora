import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../providers/research_provider.dart';
import '../widgets/fund_list_tile.dart';
import '../widgets/stock_list_tile.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchController = TextEditingController();
  Timer? _debounce;

  final List<String> _categories = [
    'All',
    'ELSS',
    'Flexi Cap',
    'Large Cap',
    'Mid Cap',
    'Small Cap',
    'Balanced Advantage',
    'Index Funds',
  ];
  String _selectedCategory = 'All';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      final cat = _selectedCategory == 'All' ? null : _selectedCategory.toLowerCase().replaceAll(' ', '_');
      ref.read(researchNotifierProvider.notifier).search(query, category: cat);
    });
  }

  void _onCategorySelected(String cat) {
    setState(() => _selectedCategory = cat);
    final categoryParam = cat == 'All' ? null : cat.toLowerCase().replaceAll(' ', '_');
    ref.read(researchNotifierProvider.notifier).selectCategory(categoryParam);
  }

  @override
  Widget build(BuildContext context) {
    final researchState = ref.watch(researchNotifierProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Research Hub'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(104),
          child: Column(
            children: [
              // Search Input Field
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: TextField(
                  controller: _searchController,
                  onChanged: _onSearchChanged,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'Search mutual funds (Parag Parikh, SBI) or stocks (TCS, INFY)...',
                    prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textSecondary),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 18, color: AppColors.textSecondary),
                            onPressed: () {
                              _searchController.clear();
                              _onSearchChanged('');
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: AppColors.surface2,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  ),
                ),
              ),
              const SizedBox(height: 8),

              // TabBar: Funds | Stocks
              TabBar(
                controller: _tabController,
                indicatorColor: AppColors.brandSecondary,
                labelColor: AppColors.brandSecondary,
                unselectedLabelColor: AppColors.textSecondary,
                labelStyle: AppTextStyles.titleMedium.copyWith(fontSize: 13),
                tabs: [
                  Tab(text: 'Mutual Funds (${researchState.funds.length})'),
                  Tab(text: 'NSE Stocks (${researchState.stocks.length})'),
                ],
              ),
            ],
          ),
        ),
      ),
      body: Column(
        children: [
          // Category filter chip bar (visible on Funds tab)
          AnimatedBuilder(
            animation: _tabController,
            builder: (context, _) {
              if (_tabController.index != 0) return const SizedBox.shrink();
              return Container(
                height: 44,
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _categories.length,
                  itemBuilder: (context, idx) {
                    final cat = _categories[idx];
                    final isSelected = cat == _selectedCategory;
                    return Padding(
                      padding: const EdgeInsets.only(right: 6.0),
                      child: ChoiceChip(
                        label: Text(cat),
                        selected: isSelected,
                        onSelected: (_) => _onCategorySelected(cat),
                        selectedColor: AppColors.brandPrimary.withOpacity(0.3),
                        backgroundColor: AppColors.surface1,
                        labelStyle: TextStyle(
                          fontSize: 11,
                          color: isSelected ? AppColors.brandSecondary : AppColors.textSecondary,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                          side: BorderSide(
                            color: isSelected ? AppColors.brandPrimary : const Color(0x0FFFFFFF),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              );
            },
          ),

          // Main TabBarView
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Mutual Funds View
                _buildFundList(researchState),

                // Stocks View
                _buildStockList(researchState),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFundList(ResearchState state) {
    if (state.isLoading && state.funds.isEmpty) {
      return ListView.builder(
        itemCount: 8,
        padding: const EdgeInsets.all(16),
        itemBuilder: (_, __) => Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: LoadingShimmer(
            width: double.infinity,
            height: 64,
            borderRadius: 12,
          ),
        ),
      );
    }

    if (state.funds.isEmpty) {
      return const EmptyStateWidget(
        icon: Icons.search_off,
        title: 'No Mutual Funds Found',
        description: 'Try searching by AMFI scheme name or selecting a different category filter.',
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        final cat = _selectedCategory == 'All' ? null : _selectedCategory.toLowerCase().replaceAll(' ', '_');
        await ref.read(researchNotifierProvider.notifier).search(_searchController.text, category: cat);
      },
      color: AppColors.brandSecondary,
      backgroundColor: AppColors.surface1,
      child: ListView.builder(
        itemCount: state.funds.length,
        itemBuilder: (context, index) {
          final fund = state.funds[index];
          return FundListTile(fund: fund);
        },
      ),
    );
  }

  Widget _buildStockList(ResearchState state) {
    if (state.isLoading && state.stocks.isEmpty) {
      return ListView.builder(
        itemCount: 8,
        padding: const EdgeInsets.all(16),
        itemBuilder: (_, __) => Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: LoadingShimmer(
            width: double.infinity,
            height: 64,
            borderRadius: 12,
          ),
        ),
      );
    }

    if (state.stocks.isEmpty) {
      return const EmptyStateWidget(
        icon: Icons.trending_up,
        title: 'No Stocks Found',
        description: 'Try searching for bluechip equity tickers like RELIANCE, TCS, INFY, HDFCBANK.',
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(researchNotifierProvider.notifier).search(_searchController.text);
      },
      color: AppColors.brandSecondary,
      backgroundColor: AppColors.surface1,
      child: ListView.builder(
        itemCount: state.stocks.length,
        itemBuilder: (context, index) {
          final stock = state.stocks[index];
          return StockListTile(stock: stock);
        },
      ),
    );
  }
}
