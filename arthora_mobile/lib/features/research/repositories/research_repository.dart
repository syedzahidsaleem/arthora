import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/search_models.dart';

class ResearchRepository {
  final ApiClient _apiClient;

  ResearchRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  Future<List<FundSearchResult>> searchFunds({String? query, String? category}) async {
    final queryParams = <String, dynamic>{};
    if (query != null && query.isNotEmpty) queryParams['q'] = query;
    if (category != null && category.isNotEmpty) queryParams['category'] = category;

    final res = await _apiClient.get(
      ApiConstants.fundsSearch,
      queryParameters: queryParams,
    );

    if (res is List) {
      return res
          .map((item) => FundSearchResult.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    return [];
  }

  Future<List<StockSearchResult>> searchStocks({String? query, String? sector}) async {
    final queryParams = <String, dynamic>{};
    if (query != null && query.isNotEmpty) queryParams['q'] = query;
    if (sector != null && sector.isNotEmpty) queryParams['sector'] = sector;

    final res = await _apiClient.get(
      ApiConstants.stocksSearch,
      queryParameters: queryParams,
    );

    if (res is List) {
      return res
          .map((item) => StockSearchResult.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    return [];
  }
}
