class FavoriteFundModel {
  final String id;
  final int schemeCode;
  final String name;
  final String? category;
  final double? latestNAV;
  final double? cagr1Y;

  const FavoriteFundModel({
    required this.id,
    required this.schemeCode,
    required this.name,
    this.category,
    this.latestNAV,
    this.cagr1Y,
  });

  factory FavoriteFundModel.fromJson(Map<String, dynamic> json) {
    return FavoriteFundModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      schemeCode: int.tryParse(json['schemeCode'].toString()) ?? 0,
      name: json['name']?.toString() ?? '',
      category: json['category']?.toString(),
      latestNAV: (json['latestNAV'] as num?)?.toDouble() ?? (json['nav'] as num?)?.toDouble(),
      cagr1Y: (json['cagr1Y'] as num?)?.toDouble(),
    );
  }
}

class FavoriteStockModel {
  final String id;
  final String symbol;
  final String name;
  final double? currentPrice;
  final double? changePercent;

  const FavoriteStockModel({
    required this.id,
    required this.symbol,
    required this.name,
    this.currentPrice,
    this.changePercent,
  });

  factory FavoriteStockModel.fromJson(Map<String, dynamic> json) {
    return FavoriteStockModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      symbol: json['symbol']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      currentPrice: (json['currentPrice'] as num?)?.toDouble() ?? (json['price'] as num?)?.toDouble(),
      changePercent: (json['changePercent'] as num?)?.toDouble(),
    );
  }
}
