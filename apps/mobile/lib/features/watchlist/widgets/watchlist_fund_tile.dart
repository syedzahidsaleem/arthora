import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/formatters.dart';
import '../models/favorite_model.dart';

class WatchlistFundTile extends StatelessWidget {
  final FavoriteFundModel fund;
  final VoidCallback onDismissed;

  const WatchlistFundTile({
    super.key,
    required this.fund,
    required this.onDismissed,
  });

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: Key('fund_${fund.id}'),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: AppColors.negative.withOpacity(0.8),
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      onDismissed: (_) => onDismissed(),
      child: InkWell(
        onTap: () => context.push('/research/fund/${fund.schemeCode}'),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: const BoxDecoration(
            border: Border(
              bottom: BorderSide(color: Color(0x0AFFFFFF), width: 1),
            ),
          ),
          child: Row(
            children: [
              // Avatar
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppColors.brandPrimary.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.business_outlined,
                  size: 18,
                  color: AppColors.brandSecondary,
                ),
              ),
              const SizedBox(width: 12),

              // Name and Category
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      fund.name,
                      style: AppTextStyles.titleMedium.copyWith(fontSize: 13),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (fund.category != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        fund.category!.replaceAll('_', ' '),
                        style: AppTextStyles.bodySmall.copyWith(fontSize: 10),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: 8),

              // NAV & CAGR
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (fund.latestNAV != null)
                    Text(
                      Formatters.formatNAV(fund.latestNAV!),
                      style: AppTextStyles.moneySmall.copyWith(fontSize: 13),
                    ),
                  if (fund.cagr1Y != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      '${fund.cagr1Y! >= 0 ? '+' : ''}${fund.cagr1Y!.toStringAsFixed(1)}% 1Y',
                      style: TextStyle(
                        fontFamily: 'JetBrainsMono',
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: fund.cagr1Y! >= 0 ? AppColors.positive : AppColors.negative,
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
