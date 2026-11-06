class FundMetadata {
  final int schemeCode;
  final String schemeName;
  final String? isinGrowth;
  final String? fundHouse;
  final String? category;
  final String? schemeType;
  final double? latestNAV;
  final DateTime? latestNAVDate;
  final double? navChange;
  final double? navChangePercent;
  final double? aum;
  final double? expenseRatio;
  final String? fundManager;
  final String? riskLevel;

  const FundMetadata({
    required this.schemeCode,
    required this.schemeName,
    this.isinGrowth,
    this.fundHouse,
    this.category,
    this.schemeType,
    this.latestNAV,
    this.latestNAVDate,
    this.navChange,
    this.navChangePercent,
    this.aum,
    this.expenseRatio,
    this.fundManager,
    this.riskLevel,
  });

  factory FundMetadata.fromJson(Map<String, dynamic> json) {
    return FundMetadata(
      schemeCode: int.tryParse(json['schemeCode'].toString()) ?? 0,
      schemeName: json['schemeName']?.toString() ?? '',
      isinGrowth: json['isinGrowth']?.toString(),
      fundHouse: json['fundHouse']?.toString(),
      category: json['category']?.toString(),
      schemeType: json['schemeType']?.toString(),
      latestNAV: (json['latestNAV'] as num?)?.toDouble() ?? (json['nav'] as num?)?.toDouble(),
      latestNAVDate: json['latestNAVDate'] != null
          ? DateTime.tryParse(json['latestNAVDate'].toString())
          : null,
      navChange: (json['navChange'] as num?)?.toDouble(),
      navChangePercent: (json['navChangePercent'] as num?)?.toDouble(),
      aum: (json['aum'] as num?)?.toDouble(),
      expenseRatio: (json['expenseRatio'] as num?)?.toDouble(),
      fundManager: json['fundManager']?.toString(),
      riskLevel: json['riskLevel']?.toString(),
    );
  }
}

class FundMetrics {
  final double? cagr1Y;
  final double? cagr3Y;
  final double? cagr5Y;
  final double? cagr10Y;
  final double? sharpeRatio;
  final double? sortinoRatio;
  final double? alpha;
  final double? beta;
  final double? standardDeviation;
  final double? maxDrawdown;
  final double? expenseRatio;
  final String? exitLoad;
  final double? minSIP;
  final double? minLumpsum;
  final String? fundManager;
  final double? fundManagerTenure;
  final double? aum;

  const FundMetrics({
    this.cagr1Y,
    this.cagr3Y,
    this.cagr5Y,
    this.cagr10Y,
    this.sharpeRatio,
    this.sortinoRatio,
    this.alpha,
    this.beta,
    this.standardDeviation,
    this.maxDrawdown,
    this.expenseRatio,
    this.exitLoad,
    this.minSIP,
    this.minLumpsum,
    this.fundManager,
    this.fundManagerTenure,
    this.aum,
  });

  factory FundMetrics.fromJson(Map<String, dynamic> json) {
    return FundMetrics(
      cagr1Y: (json['cagr1Y'] as num?)?.toDouble(),
      cagr3Y: (json['cagr3Y'] as num?)?.toDouble(),
      cagr5Y: (json['cagr5Y'] as num?)?.toDouble(),
      cagr10Y: (json['cagr10Y'] as num?)?.toDouble(),
      sharpeRatio: (json['sharpeRatio'] as num?)?.toDouble(),
      sortinoRatio: (json['sortinoRatio'] as num?)?.toDouble(),
      alpha: (json['alpha'] as num?)?.toDouble(),
      beta: (json['beta'] as num?)?.toDouble(),
      standardDeviation: (json['standardDeviation'] as num?)?.toDouble(),
      maxDrawdown: (json['maxDrawdown'] as num?)?.toDouble(),
      expenseRatio: (json['expenseRatio'] as num?)?.toDouble(),
      exitLoad: json['exitLoad']?.toString(),
      minSIP: (json['minSIP'] as num?)?.toDouble(),
      minLumpsum: (json['minLumpsum'] as num?)?.toDouble(),
      fundManager: json['fundManager']?.toString(),
      fundManagerTenure: (json['fundManagerTenure'] as num?)?.toDouble(),
      aum: (json['aum'] as num?)?.toDouble(),
    );
  }
}

class HoldingItem {
  final String companyName;
  final String? ticker;
  final String? sector;
  final double percentage;

  const HoldingItem({
    required this.companyName,
    this.ticker,
    this.sector,
    required this.percentage,
  });

  factory HoldingItem.fromJson(Map<String, dynamic> json) {
    return HoldingItem(
      companyName: json['companyName']?.toString() ?? json['name']?.toString() ?? '',
      ticker: json['ticker']?.toString() ?? json['symbol']?.toString(),
      sector: json['sector']?.toString(),
      percentage: (json['percentage'] as num?)?.toDouble() ??
          (json['weight'] as num?)?.toDouble() ??
          0.0,
    );
  }
}

class SectorAllocItem {
  final String sector;
  final double percentage;

  const SectorAllocItem({required this.sector, required this.percentage});

  factory SectorAllocItem.fromJson(Map<String, dynamic> json) {
    return SectorAllocItem(
      sector: json['sector']?.toString() ?? '',
      percentage: (json['percentage'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class NAVHistoryPoint {
  final String date;
  final double nav;

  const NAVHistoryPoint({required this.date, required this.nav});

  factory NAVHistoryPoint.fromJson(Map<String, dynamic> json) {
    return NAVHistoryPoint(
      date: json['date']?.toString() ?? '',
      nav: (json['nav'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
