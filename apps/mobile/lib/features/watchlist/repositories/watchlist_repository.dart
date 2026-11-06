import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/favorite_model.dart';

class WatchlistRepository {
  final ApiClient _apiClient;

  WatchlistRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  Future<Map<String, List<dynamic>>> getFavorites() async {
    final res = await _apiClient.get(ApiConstants.favorites);
    final funds = <FavoriteFundModel>[];
    final stocks = <FavoriteStockModel>[];

    if (res is List) {
      for (final item in res) {
        if (item is Map<String, dynamic>) {
          final assetType = item['assetType']?.toString() ?? 'mutual_fund';
          if (assetType == 'mutual_fund') {
            funds.add(FavoriteFundModel.fromJson(item));
          } else {
            stocks.add(FavoriteStockModel.fromJson(item));
          }
        }
      }
    }

    return {'funds': funds, 'stocks': stocks};
  }

  Future<void> addFavorite({
    required String assetType,
    String? symbol,
    dynamic schemeCode,
    required String name,
  }) async {
    await _apiClient.post(
      ApiConstants.favorites,
      data: {
        'assetType': assetType,
        'symbol': symbol,
        'schemeCode': schemeCode,
        'name': name,
      },
    );
  }

  Future<void> removeFavorite(String favoriteId) async {
    await _apiClient.delete(ApiConstants.favoriteRemove(favoriteId));
  }
}
