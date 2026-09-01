class ApiConstants {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:4000/api/v1', // Android emulator host proxy
  );

  // Auth Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String googleLogin = '/auth/google';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';
  static const String fcmToken = '/auth/fcm-token';

  // Mutual Funds Endpoints
  static const String fundsSearch = '/funds/search';
  static const String fundCategories = '/funds/categories';
  static String fundDetail(dynamic code) => '/funds/$code';
  static String fundMetrics(dynamic code) => '/funds/$code/metrics';
  static String fundHoldings(dynamic code) => '/funds/$code/holdings';
  static String fundSectorAlloc(dynamic code) => '/funds/$code/sector-allocation';
  static String fundPeers(dynamic code) => '/funds/$code/peers';

  // Stocks Endpoints
  static const String stocksSearch = '/stocks/search';
  static String stockDetail(String symbol) => '/stocks/$symbol';
  static String stockMetrics(String symbol) => '/stocks/$symbol/metrics';
  static String stockTechnical(String symbol) => '/stocks/$symbol/technical';
  static String stockPeers(String symbol) => '/stocks/$symbol/peers';

  // Portfolio Endpoints
  static const String portfolios = '/portfolios';
  static String portfolioDetail(String id) => '/portfolios/$id';
  static String portfolioStatus(String id) => '/portfolios/$id/status';
  static String portfolioPin(String id) => '/portfolios/$id/pin';

  // Watchlist / Favorites Endpoints
  static const String favorites = '/favorites';
  static String favoriteRemove(String id) => '/favorites/$id';

  // Charts
  static String chartFundNav(dynamic code) => '/charts/fund-nav/$code';
  static String chartStockPrice(String symbol) => '/charts/stock-price/$symbol';
  static String chartFundDrawdown(dynamic code) => '/charts/fund-drawdown/$code';
}
