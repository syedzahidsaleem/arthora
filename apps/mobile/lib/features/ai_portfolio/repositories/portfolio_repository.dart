import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/portfolio_model.dart';

class PortfolioRepository {
  final ApiClient _apiClient;

  PortfolioRepository({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  Future<PortfolioModel> createPortfolio(CreatePortfolioInput input) async {
    final res = await _apiClient.post(
      ApiConstants.portfolios,
      data: input.toJson(),
    );
    return PortfolioModel.fromJson(res as Map<String, dynamic>);
  }

  Future<PortfolioModel> getPortfolio(String id) async {
    final res = await _apiClient.get(ApiConstants.portfolioDetail(id));
    return PortfolioModel.fromJson(res as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> getPortfolioStatus(String id) async {
    final res = await _apiClient.get(ApiConstants.portfolioStatus(id));
    return res as Map<String, dynamic>;
  }

  Future<List<PortfolioModel>> listPortfolios() async {
    final res = await _apiClient.get(ApiConstants.portfolios);
    if (res is List) {
      return res
          .map((item) => PortfolioModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    return [];
  }

  Future<PortfolioModel> togglePin(String id) async {
    final res = await _apiClient.patch(ApiConstants.portfolioPin(id));
    return PortfolioModel.fromJson(res as Map<String, dynamic>);
  }
}
