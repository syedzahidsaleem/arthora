import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/fund_detail_model.dart';
import '../repositories/fund_detail_repository.dart';

class FundDetailState {
  final bool isLoading;
  final FundMetadata? fund;
  final FundMetrics? metrics;
  final List<HoldingItem> holdings;
  final List<SectorAllocItem> sectors;
  final List<NAVHistoryPoint> navHistory;
  final String selectedTimeframe;
  final String? errorMessage;

  const FundDetailState({
    this.isLoading = true,
    this.fund,
    this.metrics,
    this.holdings = const [],
    this.sectors = const [],
    this.navHistory = const [],
    this.selectedTimeframe = '1Y',
    this.errorMessage,
  });

  FundDetailState copyWith({
    bool? isLoading,
    FundMetadata? fund,
    FundMetrics? metrics,
    List<HoldingItem>? holdings,
    List<SectorAllocItem>? sectors,
    List<NAVHistoryPoint>? navHistory,
    String? selectedTimeframe,
    String? errorMessage,
  }) {
    return FundDetailState(
      isLoading: isLoading ?? this.isLoading,
      fund: fund ?? this.fund,
      metrics: metrics ?? this.metrics,
      holdings: holdings ?? this.holdings,
      sectors: sectors ?? this.sectors,
      navHistory: navHistory ?? this.navHistory,
      selectedTimeframe: selectedTimeframe ?? this.selectedTimeframe,
      errorMessage: errorMessage,
    );
  }
}

final fundDetailRepositoryProvider = Provider<FundDetailRepository>((ref) {
  return FundDetailRepository();
});

final fundDetailFamily = StateNotifierProvider.family<FundDetailNotifier, FundDetailState, dynamic>(
  (ref, schemeCode) {
    final repo = ref.watch(fundDetailRepositoryProvider);
    return FundDetailNotifier(repo, schemeCode);
  },
);

class FundDetailNotifier extends StateNotifier<FundDetailState> {
  final FundDetailRepository _repository;
  final dynamic _schemeCode;

  FundDetailNotifier(this._repository, this._schemeCode)
      : super(const FundDetailState()) {
    loadAll();
  }

  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final fund = await _repository.getFundDetail(_schemeCode);
      final metrics = await _repository.getFundMetrics(_schemeCode);
      final holdings = await _repository.getFundHoldings(_schemeCode);
      final sectors = await _repository.getFundSectorAlloc(_schemeCode);
      final history = await _repository.getNAVHistory(_schemeCode, state.selectedTimeframe);

      state = state.copyWith(
        isLoading: false,
        fund: fund,
        metrics: metrics,
        holdings: holdings,
        sectors: sectors,
        navHistory: history,
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
      final history = await _repository.getNAVHistory(_schemeCode, timeframe);
      state = state.copyWith(navHistory: history);
    } catch (_) {}
  }
}
