class StockMetadata {
  final String symbol;
  final String companyName;
  final String? isin;
  final String? bseCode;
  final String? sector;
  final String? industry;
  final String? marketCapType;
  final double? currentPrice;
  final double? change;
  final double? changePercent;
  final double? previousClose;
  final double? openPrice;
  final double? highPrice;
  final double? lowPrice;
  final double? volume;

  const StockMetadata({
    required this.symbol,
    required this.companyName,
    this.isin,
    this.bseCode,
    this.sector,
    this.industry,
    this.marketCapType,
    this.currentPrice,
    this.change,
    this.changePercent,
    this.previousClose,
    this.openPrice,
    this.highPrice,
    this.lowPrice,
    this.volume,
  });

  factory StockMetadata.fromJson(Map<String, dynamic> json) {
    return StockMetadata(
      symbol: json['symbol']?.toString() ?? '',
      companyName: json['companyName']?.toString() ?? '',
      isin: json['isin']?.toString(),
      bseCode: json['bseCode']?.toString(),
      sector: json['sector']?.toString(),
      industry: json['industry']?.toString(),
      marketCapType: json['marketCapType']?.toString(),
      currentPrice: (json['currentPrice'] as num?)?.toDouble() ?? (json['price'] as num?)?.toDouble(),
      change: (json['change'] as num?)?.toDouble(),
      changePercent: (json['changePercent'] as num?)?.toDouble(),
      previousClose: (json['previousClose'] as num?)?.toDouble(),
      openPrice: (json['openPrice'] as num?)?.toDouble(),
      highPrice: (json['highPrice'] as num?)?.toDouble(),
      lowPrice: (json['lowPrice'] as num?)?.toDouble(),
      volume: (json['volume'] as num?)?.toDouble(),
    );
  }
}

class StockMetrics {
  final double? peRatioTTM;
  final double? peRatioForward;
  final double? pbRatio;
  final double? dividendYield;
  final double? marketCap;
  final double? week52High;
  final double? week52Low;
  final double? beta;
  final double? epsTTM;
  final double? epsGrowthYoY;
  final double? roe;
  final double? roce;
  final double? revenueTTM;
  final double? netProfitTTM;
  final double? debtToEquity;
  final double? roa;
  final double? promoterHolding;
  final double? fiiHolding;
  final double? diiHolding;
  final double? publicHolding;

  const StockMetrics({
    this.peRatioTTM,
    this.peRatioForward,
    this.pbRatio,
    this.dividendYield,
    this.marketCap,
    this.week52High,
    this.week52Low,
    this.beta,
    this.epsTTM,
    this.epsGrowthYoY,
    this.roe,
    this.roce,
    this.revenueTTM,
    this.netProfitTTM,
    this.debtToEquity,
    this.roa,
    this.promoterHolding,
    this.fiiHolding,
    this.diiHolding,
    this.publicHolding,
  });

  factory StockMetrics.fromJson(Map<String, dynamic> json) {
    return StockMetrics(
      peRatioTTM: (json['peRatioTTM'] as num?)?.toDouble() ?? (json['peRatio'] as num?)?.toDouble(),
      peRatioForward: (json['peRatioForward'] as num?)?.toDouble(),
      pbRatio: (json['pbRatio'] as num?)?.toDouble(),
      dividendYield: (json['dividendYield'] as num?)?.toDouble(),
      marketCap: (json['marketCap'] as num?)?.toDouble(),
      week52High: (json['week52High'] as num?)?.toDouble(),
      week52Low: (json['week52Low'] as num?)?.toDouble(),
      beta: (json['beta'] as num?)?.toDouble(),
      epsTTM: (json['epsTTM'] as num?)?.toDouble() ?? (json['eps'] as num?)?.toDouble(),
      epsGrowthYoY: (json['epsGrowthYoY'] as num?)?.toDouble(),
      roe: (json['roe'] as num?)?.toDouble(),
      roce: (json['roce'] as num?)?.toDouble(),
      revenueTTM: (json['revenueTTM'] as num?)?.toDouble(),
      netProfitTTM: (json['netProfitTTM'] as num?)?.toDouble(),
      debtToEquity: (json['debtToEquity'] as num?)?.toDouble(),
      roa: (json['roa'] as num?)?.toDouble(),
      promoterHolding: (json['promoterHolding'] as num?)?.toDouble() ?? 52.0,
      fiiHolding: (json['fiiHolding'] as num?)?.toDouble() ?? 20.0,
      diiHolding: (json['diiHolding'] as num?)?.toDouble() ?? 14.0,
      publicHolding: (json['publicHolding'] as num?)?.toDouble() ?? 14.0,
    );
  }
}

class StockTechnicalData {
  final double? rsi14;
  final double? sma20;
  final double? sma50;
  final double? sma200;
  final double? macdLine;
  final double? macdSignal;
  final double? macdHist;
  final String? trend;
  final String? rsiSignal;
  final String? macdSummary;

  const StockTechnicalData({
    this.rsi14,
    this.sma20,
    this.sma50,
    this.sma200,
    this.macdLine,
    this.macdSignal,
    this.macdHist,
    this.trend,
    this.rsiSignal,
    this.macdSummary,
  });

  factory StockTechnicalData.fromJson(Map<String, dynamic> json) {
    final signals = json['signals'] as Map<String, dynamic>? ?? {};
    final macd = json['macd'] as Map<String, dynamic>? ?? {};

    return StockTechnicalData(
      rsi14: (json['rsi14'] as num?)?.toDouble() ?? 54.0,
      sma20: (json['sma20'] as num?)?.toDouble(),
      sma50: (json['sma50'] as num?)?.toDouble(),
      sma200: (json['sma200'] as num?)?.toDouble(),
      macdLine: (macd['macd'] as num?)?.toDouble() ?? 2.5,
      macdSignal: (macd['signal'] as num?)?.toDouble() ?? 1.8,
      macdHist: (macd['histogram'] as num?)?.toDouble() ?? 0.7,
      trend: json['trend']?.toString() ?? 'Bullish',
      rsiSignal: signals['rsiSignal']?.toString() ?? 'Neutral',
      macdSummary: signals['macdSignal']?.toString() ?? 'Bullish',
    );
  }
}

class StockPricePoint {
  final String date;
  final double close;
  final double volume;

  const StockPricePoint({
    required this.date,
    required this.close,
    required this.volume,
  });
}
