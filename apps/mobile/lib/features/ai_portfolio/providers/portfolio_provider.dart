import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/portfolio_model.dart';
import '../repositories/portfolio_repository.dart';

enum PortfolioStateStatus { initial, loading, polling, loaded, error }

class PortfolioState {
  final PortfolioStateStatus status;
  final PortfolioModel? currentPortfolio;
  final List<PortfolioModel> portfolios;
  final String? errorMessage;
  final String? pollingStep;

  const PortfolioState({
    this.status = PortfolioStateStatus.initial,
    this.currentPortfolio,
    this.portfolios = const [],
    this.errorMessage,
    this.pollingStep,
  });

  PortfolioState copyWith({
    PortfolioStateStatus? status,
    PortfolioModel? currentPortfolio,
    List<PortfolioModel>? portfolios,
    String? errorMessage,
    String? pollingStep,
  }) {
    return PortfolioState(
      status: status ?? this.status,
      currentPortfolio: currentPortfolio ?? this.currentPortfolio,
      portfolios: portfolios ?? this.portfolios,
      errorMessage: errorMessage,
      pollingStep: pollingStep ?? this.pollingStep,
    );
  }
}

final portfolioRepositoryProvider = Provider<PortfolioRepository>((ref) {
  return PortfolioRepository();
});

final portfolioNotifierProvider =
    StateNotifierProvider<PortfolioNotifier, PortfolioState>((ref) {
  final repo = ref.watch(portfolioRepositoryProvider);
  return PortfolioNotifier(repo);
});

class PortfolioNotifier extends StateNotifier<PortfolioState> {
  final PortfolioRepository _repository;
  Timer? _pollingTimer;
  int _pollCount = 0;

  PortfolioNotifier(this._repository) : super(const PortfolioState());

  Future<void> loadPortfolios() async {
    state = state.copyWith(status: PortfolioStateStatus.loading);
    try {
      final list = await _repository.listPortfolios();
      state = state.copyWith(
        status: PortfolioStateStatus.loaded,
        portfolios: list,
      );
    } catch (e) {
      state = state.copyWith(
        status: PortfolioStateStatus.error,
        errorMessage: e.toString().replaceAll('ApiException: ', ''),
      );
    }
  }

  Future<PortfolioModel?> createPortfolio(CreatePortfolioInput input) async {
    state = state.copyWith(status: PortfolioStateStatus.loading);
    try {
      final portfolio = await _repository.createPortfolio(input);
      state = state.copyWith(
        status: PortfolioStateStatus.loaded,
        currentPortfolio: portfolio,
      );
      return portfolio;
    } catch (e) {
      state = state.copyWith(
        status: PortfolioStateStatus.error,
        errorMessage: e.toString().replaceAll('ApiException: ', ''),
      );
      return null;
    }
  }

  Future<void> getPortfolio(String id) async {
    state = state.copyWith(status: PortfolioStateStatus.loading);
    try {
      final portfolio = await _repository.getPortfolio(id);
      state = state.copyWith(
        status: PortfolioStateStatus.loaded,
        currentPortfolio: portfolio,
      );
    } catch (e) {
      state = state.copyWith(
        status: PortfolioStateStatus.error,
        errorMessage: e.toString().replaceAll('ApiException: ', ''),
      );
    }
  }

  void startPolling(String portfolioId) {
    stopPolling();
    _pollCount = 0;
    state = state.copyWith(
      status: PortfolioStateStatus.polling,
      pollingStep: '🔍 Analyzing your financial goal...',
    );

    final steps = [
      '🔍 Analyzing your financial goal...',
      '🏦 Searching Indian mutual funds...',
      '📊 Running Monte Carlo projections...',
      '✨ Building your portfolio...',
    ];

    _pollingTimer = Timer.periodic(const Duration(seconds: 2), (timer) async {
      _pollCount++;
      final stepIdx = (_pollCount ~/ 2) % steps.length;
      state = state.copyWith(pollingStep: steps[stepIdx]);

      try {
        final res = await _repository.getPortfolioStatus(portfolioId);
        final status = res['status']?.toString() ?? '';

        if (status == 'completed') {
          stopPolling();
          final fullPortfolio = await _repository.getPortfolio(portfolioId);
          state = state.copyWith(
            status: PortfolioStateStatus.loaded,
            currentPortfolio: fullPortfolio,
          );
        } else if (status == 'failed') {
          stopPolling();
          state = state.copyWith(
            status: PortfolioStateStatus.error,
            errorMessage: res['error']?.toString() ?? 'Portfolio generation failed',
          );
        }
      } catch (e) {
        if (_pollCount > 30) {
          stopPolling();
          state = state.copyWith(
            status: PortfolioStateStatus.error,
            errorMessage: 'Portfolio generation timed out. Please retry.',
          );
        }
      }
    });
  }

  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  Future<void> togglePin(String portfolioId) async {
    try {
      final updated = await _repository.togglePin(portfolioId);
      final updatedList = state.portfolios.map((p) {
        return p.id == portfolioId ? updated : p;
      }).toList();

      state = state.copyWith(
        portfolios: updatedList,
        currentPortfolio: state.currentPortfolio?.id == portfolioId
            ? updated
            : state.currentPortfolio,
      );
    } catch (_) {}
  }

  @override
  void dispose() {
    stopPolling();
    super.dispose();
  }
}
