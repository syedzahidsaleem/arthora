import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/formatters.dart';
import '../models/search_models.dart';

class FundListTile extends StatelessWidget {
  final FundSearchResult fund;

  const FundListTile({super.key, required this.fund});

  @override
  Widget build(BuildContext context) {
    final initials = (fund.fundHouse?.isNotEmpty ?? false)
        ? fund.fundHouse!.substring(0, 1).toUpperCase()
        : 'F';

    return InkWell(
      onTap: () => context.push('/research/fund/${fund.schemeCode}'),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: const BoxDecoration(
          border: Border(
            bottom: BorderSide(color: Color(0x0AFFFFFF), width: 1),
          ),
        ),
        child: Row(
          children: [
            // Fund House Circle Avatar
            CircleAvatar(
              radius: 18,
              backgroundColor: AppColors.brandPrimary.withOpacity(0.15),
              child: Text(
                initials,
                style: const TextStyle(
                  color: AppColors.brandSecondary,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Name and Category
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    fund.schemeName,
                    style: AppTextStyles.titleMedium.copyWith(fontSize: 13),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${fund.fundHouse ?? 'AMC'} · ${fund.category?.replaceAll('_', ' ') ?? 'Mutual Fund'}',
                    style: AppTextStyles.bodySmall.copyWith(fontSize: 10),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),

            // NAV and 1Y Return
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (fund.latestNAV != null)
                  Text(
                    Formatters.formatNAV(fund.latestNAV!),
                    style: AppTextStyles.moneySmall.copyWith(fontSize: 13),
                  ),
                const SizedBox(height: 2),
                if (fund.cagr1Y != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                    decoration: BoxDecoration(
                      color: (fund.cagr1Y! >= 0 ? AppColors.positive : AppColors.negative)
                          .withOpacity(0.12),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      '${fund.cagr1Y! >= 0 ? '+' : ''}${fund.cagr1Y!.toStringAsFixed(1)}% 1Y',
                      style: TextStyle(
                        fontFamily: 'JetBrainsMono',
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: fund.cagr1Y! >= 0 ? AppColors.positive : AppColors.negative,
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
