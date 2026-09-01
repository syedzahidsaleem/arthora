import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/fund_detail_model.dart';

class FundDetailRepository {
  final ApiClient _apiClient;

  FundDetailRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  Future<FundMetadata> getFundDetail(dynamic schemeCode) async {
    final res = await _apiClient.get(ApiConstants.fundDetail(schemeCode));
    return FundMetadata.fromJson(res as Map<String, dynamic>);
  }

  Future<FundMetrics?> getFundMetrics(dynamic schemeCode) async {
    try {
      final res = await _apiClient.get(ApiConstants.fundMetrics(schemeCode));
      if (res is Map<String, dynamic>) {
        return FundMetrics.fromJson(res);
      }
    } catch (_) {}
    return null;
  }

  Future<List<HoldingItem>> getFundHoldings(dynamic schemeCode) async {
    try {
      final res = await _apiClient.get(ApiConstants.fundHoldings(schemeCode));
      if (res is Map<String, dynamic> && res['holdings'] is List) {
        final list = res['holdings'] as List;
        return list.map((i) => HoldingItem.fromJson(i as Map<String, dynamic>)).toList();
      } else if (res is List) {
        return res.map((i) => HoldingItem.fromJson(i as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return [];
  }

  Future<List<SectorAllocItem>> getFundSectorAlloc(dynamic schemeCode) async {
    try {
      final res = await _apiClient.get(ApiConstants.fundSectorAlloc(schemeCode));
      if (res is Map<String, dynamic> && res['sectors'] is List) {
        final list = res['sectors'] as List;
        return list.map((i) => SectorAllocItem.fromJson(i as Map<String, dynamic>)).toList();
      } else if (res is List) {
        return res.map((i) => SectorAllocItem.fromJson(i as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return [];
  }

  Future<List<NAVHistoryPoint>> getNAVHistory(dynamic schemeCode, String timeframe) async {
    try {
      final res = await _apiClient.get(
        ApiConstants.chartFundNav(schemeCode),
        queryParameters: {'timeframe': timeframe},
      );
      if (res is Map<String, dynamic>) {
        final dates = res['dates'] as List? ?? [];
        final navs = res['navs'] as List? ?? [];
        final points = <NAVHistoryPoint>[];
        for (int i = 0; i < dates.length; i++) {
          points.add(NAVHistoryPoint(
            date: dates[i].toString(),
            nav: (navs[i] as num?)?.toDouble() ?? 0.0,
          ));
        }
        return points;
      }
    } catch (_) {}
    return [];
  }
}
