import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/favorite_model.dart';
import '../repositories/watchlist_repository.dart';

class WatchlistState {
  final bool isLoading;
  final List<FavoriteFundModel> funds;
  final List<FavoriteStockModel> stocks;
  final String? errorMessage;

  const WatchlistState({
    this.isLoading = false,
    this.funds = const [],
    this.stocks = const [],
    this.errorMessage,
  });

  WatchlistState copyWith({
    bool? isLoading,
    List<FavoriteFundModel>? funds,
    List<FavoriteStockModel>? stocks,
    String? errorMessage,
  }) {
    return WatchlistState(
      isLoading: isLoading ?? this.isLoading,
      funds: funds ?? this.funds,
      stocks: stocks ?? this.stocks,
      errorMessage: errorMessage,
    );
  }
}

final watchlistRepositoryProvider = Provider<WatchlistRepository>((ref) {
  return WatchlistRepository();
});

final watchlistNotifierProvider =
    StateNotifierProvider<WatchlistNotifier, WatchlistState>((ref) {
  final repo = ref.watch(watchlistRepositoryProvider);
  return WatchlistNotifier(repo);
});

class WatchlistNotifier extends StateNotifier<WatchlistState> {
  final WatchlistRepository _repository;

  WatchlistNotifier(this._repository) : super(const WatchlistState()) {
    loadFavorites();
  }

  Future<void> loadFavorites() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final res = await _repository.getFavorites();
      state = state.copyWith(
        isLoading: false,
        funds: res['funds'] as List<FavoriteFundModel>,
        stocks: res['stocks'] as List<FavoriteStockModel>,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceAll('ApiException: ', ''),
      );
    }
  }

  Future<void> removeFavoriteFund(String id) async {
    final prev = state.funds;
    state = state.copyWith(funds: state.funds.where((f) => f.id != id).toList());

    try {
      await _repository.removeFavorite(id);
    } catch (_) {
      state = state.copyWith(funds: prev);
    }
  }

  Future<void> removeFavoriteStock(String id) async {
    final prev = state.stocks;
    state = state.copyWith(stocks: state.stocks.where((s) => s.id != id).toList());

    try {
      await _repository.removeFavorite(id);
    } catch (_) {
      state = state.copyWith(stocks: prev);
    }
  }

  Future<void> toggleFavoriteFund({
    required int schemeCode,
    required String name,
    String? category,
    double? latestNAV,
    double? cagr1Y,
  }) async {
    final existing = state.funds.where((f) => f.schemeCode == schemeCode).toList();
    if (existing.isNotEmpty) {
      await removeFavoriteFund(existing.first.id);
    } else {
      final tempId = 'temp_${DateTime.now().millisecondsSinceEpoch}';
      final newFav = FavoriteFundModel(
        id: tempId,
        schemeCode: schemeCode,
        name: name,
        category: category,
        latestNAV: latestNAV,
        cagr1Y: cagr1Y,
      );

      state = state.copyWith(funds: [newFav, ...state.funds]);
      try {
        await _repository.addFavorite(
          assetType: 'mutual_fund',
          schemeCode: schemeCode,
          name: name,
        );
        await loadFavorites();
      } catch (_) {
        state = state.copyWith(funds: state.funds.where((f) => f.id != tempId).toList());
      }
    }
  }

  Future<void> toggleFavoriteStock({
    required String symbol,
    required String name,
    double? currentPrice,
    double? changePercent,
  }) async {
    final existing = state.stocks.where((s) => s.symbol.toUpperCase() == symbol.toUpperCase()).toList();
    if (existing.isNotEmpty) {
      await removeFavoriteStock(existing.first.id);
    } else {
      final tempId = 'temp_${DateTime.now().millisecondsSinceEpoch}';
      final newFav = FavoriteStockModel(
        id: tempId,
        symbol: symbol,
        name: name,
        currentPrice: currentPrice,
        changePercent: changePercent,
      );

      state = state.copyWith(stocks: [newFav, ...state.stocks]);
      try {
        await _repository.addFavorite(
          assetType: 'stock',
          symbol: symbol,
          name: name,
        );
        await loadFavorites();
      } catch (_) {
        state = state.copyWith(stocks: state.stocks.where((s) => s.id != tempId).toList());
      }
    }
  }
}
