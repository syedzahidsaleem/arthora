import 'package:flutter/material.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/formatters.dart';
import '../models/fund_detail_model.dart';

class FundHeaderSection extends StatelessWidget {
  final FundMetadata fund;

  const FundHeaderSection({super.key, required this.fund});

  @override
  Widget build(BuildContext context) {
    final isPositive = (fund.navChange ?? 0) >= 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface2,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0x0FFFFFFF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Badges Row
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              if (fund.category != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.brandPrimary.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    fund.category!.replaceAll('_', ' ').toUpperCase(),
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.brandSecondary,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              if (fund.riskLevel != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.warning.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    fund.riskLevel!.toUpperCase(),
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.warning,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              if (fund.aum != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.surface1,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'AUM: ${Formatters.formatLargeINR(fund.aum!)}',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.textSecondary,
                      fontSize: 10,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),

          // Scheme Name
          Text(
            fund.schemeName,
            style: AppTextStyles.headlineMedium.copyWith(fontSize: 18),
          ),
          const SizedBox(height: 4),
          Text(
            '${fund.fundHouse ?? 'AMC'} · ${fund.schemeType ?? 'Open Ended'}',
            style: AppTextStyles.bodySmall,
          ),
          const SizedBox(height: 16),
          const Divider(color: Color(0x0FFFFFFF), height: 1),
          const SizedBox(height: 16),

          // NAV and 1D Change
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('LATEST NAV', style: AppTextStyles.labelSmall.copyWith(fontSize: 9)),
                  const SizedBox(height: 2),
                  Text(
                    fund.latestNAV != null ? Formatters.formatNAV(fund.latestNAV!) : '—',
                    style: AppTextStyles.moneyLarge.copyWith(fontSize: 26),
                  ),
                ],
              ),
              if (fund.navChangePercent != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: (isPositive ? AppColors.positive : AppColors.negative).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isPositive ? Icons.trending_up : Icons.trending_down,
                        size: 14,
                        color: isPositive ? AppColors.positive : AppColors.negative,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${isPositive ? '+' : ''}${fund.navChangePercent!.toStringAsFixed(2)}% (1D)',
                        style: TextStyle(
                          fontFamily: 'JetBrainsMono',
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isPositive ? AppColors.positive : AppColors.negative,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
