import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/stock_detail_model.dart';

class StockDetailRepository {
  final ApiClient _apiClient;

  StockDetailRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  Future<StockMetadata> getStockDetail(String symbol) async {
    final res = await _apiClient.get(ApiConstants.stockDetail(symbol));
    return StockMetadata.fromJson(res as Map<String, dynamic>);
  }

  Future<StockMetrics?> getStockMetrics(String symbol) async {
    try {
      final res = await _apiClient.get(ApiConstants.stockMetrics(symbol));
      if (res is Map<String, dynamic>) {
        return StockMetrics.fromJson(res);
      }
    } catch (_) {}
    return null;
  }

  Future<StockTechnicalData?> getStockTechnical(String symbol) async {
    try {
      final res = await _apiClient.get(ApiConstants.stockTechnical(symbol));
      if (res is Map<String, dynamic>) {
        return StockTechnicalData.fromJson(res);
      }
    } catch (_) {}
    return null;
  }

  Future<List<StockPricePoint>> getStockHistory(String symbol, String timeframe) async {
    try {
      final res = await _apiClient.get(
        ApiConstants.chartStockPrice(symbol),
        queryParameters: {'timeframe': timeframe},
      );
      if (res is Map<String, dynamic>) {
        final dates = res['dates'] as List? ?? [];
        final closes = res['closes'] as List? ?? [];
        final volumes = res['volumes'] as List? ?? [];
        final points = <StockPricePoint>[];

        for (int i = 0; i < dates.length; i++) {
          points.add(StockPricePoint(
            date: dates[i].toString(),
            close: (closes[i] as num?)?.toDouble() ?? 0.0,
            volume: (volumes[i] as num?)?.toDouble() ?? 0.0,
          ));
        }
        return points;
      }
    } catch (_) {}
    return [];
  }
}
