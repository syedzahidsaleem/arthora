import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/stock_detail_model.dart';
import '../repositories/stock_detail_repository.dart';

class StockDetailState {
  final bool isLoading;
  final StockMetadata? stock;
  final StockMetrics? metrics;
  final StockTechnicalData? technical;
  final List<StockPricePoint> history;
  final String selectedTimeframe;
  final String? errorMessage;

  const StockDetailState({
    this.isLoading = true,
    this.stock,
    this.metrics,
    this.technical,
    this.history = const [],
    this.selectedTimeframe = '1Y',
    this.errorMessage,
  });

  StockDetailState copyWith({
    bool? isLoading,
    StockMetadata? stock,
    StockMetrics? metrics,
    StockTechnicalData? technical,
    List<StockPricePoint>? history,
    String? selectedTimeframe,
    String? errorMessage,
  }) {
    return StockDetailState(
      isLoading: isLoading ?? this.isLoading,
      stock: stock ?? this.stock,
      metrics: metrics ?? this.metrics,
      technical: technical ?? this.technical,
      history: history ?? this.history,
      selectedTimeframe: selectedTimeframe ?? this.selectedTimeframe,
      errorMessage: errorMessage,
    );
  }
}

final stockDetailRepositoryProvider = Provider<StockDetailRepository>((ref) {
  return StockDetailRepository();
});

final stockDetailFamily =
    StateNotifierProvider.family<StockDetailNotifier, StockDetailState, String>(
  (ref, symbol) {
    final repo = ref.watch(stockDetailRepositoryProvider);
    return StockDetailNotifier(repo, symbol);
  },
);

class StockDetailNotifier extends StateNotifier<StockDetailState> {
  final StockDetailRepository _repository;
  final String _symbol;

  StockDetailNotifier(this._repository, this._symbol)
      : super(const StockDetailState()) {
    loadAll();
  }

  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final stock = await _repository.getStockDetail(_symbol);
      final metrics = await _repository.getStockMetrics(_symbol);
      final technical = await _repository.getStockTechnical(_symbol);
      final history = await _repository.getStockHistory(_symbol, state.selectedTimeframe);

      state = state.copyWith(
        isLoading: false,
        stock: stock,
        metrics: metrics,
        technical: technical,
        history: history,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceAll('ApiException: ', ''),
      );
    }
  }

  Future<void> setTimeframe(String timeframe) async {
    if (state.selectedTimeframe == timeframe) return;
    state = state.copyWith(selectedTimeframe: timeframe);

    try {
      final history = await _repository.getStockHistory(_symbol, timeframe);
      state = state.copyWith(history: history);
    } catch (_) {}
  }
}
