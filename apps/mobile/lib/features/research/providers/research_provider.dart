import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/search_models.dart';
import '../repositories/research_repository.dart';

class ResearchState {
  final bool isLoading;
  final String query;
  final String? selectedCategory;
  final List<FundSearchResult> funds;
  final List<StockSearchResult> stocks;
  final String? errorMessage;

  const ResearchState({
    this.isLoading = false,
    this.query = '',
    this.selectedCategory,
    this.funds = const [],
    this.stocks = const [],
    this.errorMessage,
  });

  ResearchState copyWith({
    bool? isLoading,
    String? query,
    String? selectedCategory,
    List<FundSearchResult>? funds,
    List<StockSearchResult>? stocks,
    String? errorMessage,
  }) {
    return ResearchState(
      isLoading: isLoading ?? this.isLoading,
      query: query ?? this.query,
      selectedCategory: selectedCategory,
      funds: funds ?? this.funds,
      stocks: stocks ?? this.stocks,
      errorMessage: errorMessage,
    );
  }
}

final researchRepositoryProvider = Provider<ResearchRepository>((ref) {
  return ResearchRepository();
});

final researchNotifierProvider =
    StateNotifierProvider<ResearchNotifier, ResearchState>((ref) {
  final repo = ref.watch(researchRepositoryProvider);
  return ResearchNotifier(repo);
});

class ResearchNotifier extends StateNotifier<ResearchState> {
  final ResearchRepository _repository;

  ResearchNotifier(this._repository) : super(const ResearchState()) {
    search('');
  }

  Future<void> search(String query, {String? category}) async {
    state = state.copyWith(
      isLoading: true,
      query: query,
      selectedCategory: category,
      errorMessage: null,
    );

    try {
      final funds = await _repository.searchFunds(
        query: query.isEmpty ? null : query,
        category: category,
      );
      final stocks = await _repository.searchStocks(
        query: query.isEmpty ? null : query,
      );

      state = state.copyWith(
        isLoading: false,
        funds: funds,
        stocks: stocks,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceAll('ApiException: ', ''),
      );
    }
  }

  void selectCategory(String? category) {
    search(state.query, category: category);
  }
}
