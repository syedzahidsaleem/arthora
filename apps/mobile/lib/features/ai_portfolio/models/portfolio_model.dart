class AllocationItem {
  final String assetType; // 'mutual_fund' or 'stock'
  final String name;
  final String? isin;
  final int? schemeCode;
  final String? ticker;
  final String category;
  final double allocationPercent;
  final String reason;
  final double expectedReturn;

  const AllocationItem({
    required this.assetType,
    required this.name,
    this.isin,
    this.schemeCode,
    this.ticker,
    required this.category,
    required this.allocationPercent,
    required this.reason,
    required this.expectedReturn,
  });

  factory AllocationItem.fromJson(Map<String, dynamic> json) {
    return AllocationItem(
      assetType: json['assetType']?.toString() ?? 'mutual_fund',
      name: json['name']?.toString() ?? '',
      isin: json['isin']?.toString(),
      schemeCode: json['schemeCode'] != null ? int.tryParse(json['schemeCode'].toString()) : null,
      ticker: json['ticker']?.toString() ?? json['symbol']?.toString(),
      category: json['category']?.toString() ?? 'General',
      allocationPercent: (json['allocationPercent'] as num?)?.toDouble() ?? 0.0,
      reason: json['reason']?.toString() ?? '',
      expectedReturn: (json['expectedReturn'] as num?)?.toDouble() ?? 12.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'assetType': assetType,
      'name': name,
      'isin': isin,
      'schemeCode': schemeCode,
      'ticker': ticker,
      'category': category,
      'allocationPercent': allocationPercent,
      'reason': reason,
      'expectedReturn': expectedReturn,
    };
  }
}

class AISuggestion {
  final String model;
  final List<AllocationItem> allocation;
  final double projectedValue;
  final String rebalancing;
  final String explanation;
  final String disclaimer;

  const AISuggestion({
    required this.model,
    required this.allocation,
    required this.projectedValue,
    required this.rebalancing,
    required this.explanation,
    required this.disclaimer,
  });

  factory AISuggestion.fromJson(Map<String, dynamic> json) {
    final allocList = json['allocation'] as List<dynamic>? ?? [];
    return AISuggestion(
      model: json['model']?.toString() ?? 'Gemini 1.5 Pro',
      allocation: allocList
          .map((item) => AllocationItem.fromJson(item as Map<String, dynamic>))
          .toList(),
      projectedValue: (json['projectedValue'] as num?)?.toDouble() ?? 0.0,
      rebalancing: json['rebalancing']?.toString() ?? 'Annual Review & Rebalance',
      explanation: json['explanation']?.toString() ?? '',
      disclaimer: json['disclaimer']?.toString() ??
          'Projections are based on historical estimates and not guaranteed.',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'model': model,
      'allocation': allocation.map((a) => a.toJson()).toList(),
      'projectedValue': projectedValue,
      'rebalancing': rebalancing,
      'explanation': explanation,
      'disclaimer': disclaimer,
    };
  }
}

class PortfolioModel {
  final String id;
  final String name;
  final String goal;
  final String goalCategory;
  final int timePeriod;
  final String riskLevel;
  final double monthlyInvestment;
  final String status; // 'pending', 'generating', 'completed', 'failed'
  final bool isPinned;
  final AISuggestion? aiSuggestion;
  final DateTime? createdAt;

  const PortfolioModel({
    required this.id,
    required this.name,
    required this.goal,
    required this.goalCategory,
    required this.timePeriod,
    required this.riskLevel,
    required this.monthlyInvestment,
    required this.status,
    this.isPinned = false,
    this.aiSuggestion,
    this.createdAt,
  });

  factory PortfolioModel.fromJson(Map<String, dynamic> json) {
    return PortfolioModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Investment Portfolio',
      goal: json['goal']?.toString() ?? '',
      goalCategory: json['goalCategory']?.toString() ?? 'Wealth Creation',
      timePeriod: (json['timePeriod'] as num?)?.toInt() ?? 5,
      riskLevel: json['riskLevel']?.toString() ?? 'moderate',
      monthlyInvestment: (json['monthlyInvestment'] as num?)?.toDouble() ?? 10000.0,
      status: json['status']?.toString() ?? 'pending',
      isPinned: json['isPinned'] == true,
      aiSuggestion: json['aiSuggestion'] is Map<String, dynamic>
          ? AISuggestion.fromJson(json['aiSuggestion'] as Map<String, dynamic>)
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'goal': goal,
      'goalCategory': goalCategory,
      'timePeriod': timePeriod,
      'riskLevel': riskLevel,
      'monthlyInvestment': monthlyInvestment,
      'status': status,
      'isPinned': isPinned,
      'aiSuggestion': aiSuggestion?.toJson(),
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}

class CreatePortfolioInput {
  final String goal;
  final String goalCategory;
  final int timePeriod;
  final String riskLevel;
  final double monthlyInvestment;

  const CreatePortfolioInput({
    required this.goal,
    required this.goalCategory,
    required this.timePeriod,
    required this.riskLevel,
    required this.monthlyInvestment,
  });

  Map<String, dynamic> toJson() {
    return {
      'goal': goal,
      'goalCategory': goalCategory,
      'timePeriod': timePeriod,
      'riskLevel': riskLevel,
      'monthlyInvestment': monthlyInvestment,
    };
  }
}
