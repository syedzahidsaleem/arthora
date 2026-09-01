class FundSearchResult {
  final int schemeCode;
  final String schemeName;
  final String? fundHouse;
  final String? category;
  final double? latestNAV;
  final double? cagr1Y;
  final double? cagr3Y;
  final double? cagr5Y;
  final double? aum;

  const FundSearchResult({
    required this.schemeCode,
    required this.schemeName,
    this.fundHouse,
    this.category,
    this.latestNAV,
    this.cagr1Y,
    this.cagr3Y,
    this.cagr5Y,
    this.aum,
  });

  factory FundSearchResult.fromJson(Map<String, dynamic> json) {
    return FundSearchResult(
      schemeCode: int.tryParse(json['schemeCode'].toString()) ?? 0,
      schemeName: json['schemeName']?.toString() ?? '',
      fundHouse: json['fundHouse']?.toString(),
      category: json['category']?.toString(),
      latestNAV: (json['latestNAV'] as num?)?.toDouble() ?? (json['nav'] as num?)?.toDouble(),
      cagr1Y: (json['cagr1Y'] as num?)?.toDouble(),
      cagr3Y: (json['cagr3Y'] as num?)?.toDouble(),
      cagr5Y: (json['cagr5Y'] as num?)?.toDouble(),
      aum: (json['aum'] as num?)?.toDouble(),
    );
  }
}

class StockSearchResult {
  final String symbol;
  final String companyName;
  final String? isin;
  final String? sector;
  final String? marketCapType;
  final double? currentPrice;
  final double? change;
  final double? changePercent;
  final double? peRatio;

  const StockSearchResult({
    required this.symbol,
    required this.companyName,
    this.isin,
    this.sector,
    this.marketCapType,
    this.currentPrice,
    this.change,
    this.changePercent,
    this.peRatio,
  });

  factory StockSearchResult.fromJson(Map<String, dynamic> json) {
    return StockSearchResult(
      symbol: json['symbol']?.toString() ?? '',
      companyName: json['companyName']?.toString() ?? '',
      isin: json['isin']?.toString(),
      sector: json['sector']?.toString(),
      marketCapType: json['marketCapType']?.toString(),
      currentPrice: (json['currentPrice'] as num?)?.toDouble() ?? (json['price'] as num?)?.toDouble(),
      change: (json['change'] as num?)?.toDouble(),
      changePercent: (json['changePercent'] as num?)?.toDouble(),
      peRatio: (json['peRatio'] as num?)?.toDouble(),
    );
  }
}
