import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/formatters.dart';
import '../models/portfolio_model.dart';

class AllocationCard extends StatelessWidget {
  final AllocationItem item;
  final Color barColor;

  const AllocationCard({
    super.key,
    required this.item,
    required this.barColor,
  });

  @override
  Widget build(BuildContext context) {
    final isFund = item.assetType == 'mutual_fund';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface2,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x0FFFFFFF)),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Left Colored Indicator Bar
              Container(
                width: 4,
                color: barColor,
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(14.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Allocation % and Return Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: [
                          Text(
                            FormatPercent(item.allocationPercent),
                            style: AppTextStyles.moneyMedium.copyWith(
                              color: AppColors.brandSecondary,
                              fontSize: 18,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.positive.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Exp: +${item.expectedReturn.toStringAsFixed(1)}%',
                              style: AppTextStyles.labelSmall.copyWith(
                                color: AppColors.positive,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),

                      // Name
                      Text(
                        item.name,
                        style: AppTextStyles.titleMedium.copyWith(fontSize: 14),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),

                      // Identifier Badge & Category
                      Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        children: [
                          if (item.ticker != null || item.isin != null)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.surface1,
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(color: const Color(0x1AFFFFFF)),
                              ),
                              child: Text(
                                (item.ticker ?? item.isin)!,
                                style: AppTextStyles.ticker.copyWith(fontSize: 10),
                              ),
                            ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.brandPrimary.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              item.category,
                              style: AppTextStyles.labelSmall.copyWith(
                                color: AppColors.brandSecondary,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Rationale Reason
                      Text(
                        item.reason,
                        style: AppTextStyles.bodySmall.copyWith(fontSize: 11),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 10),

                      // Action Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton(
                            onPressed: () {
                              if (isFund && item.schemeCode != null) {
                                context.push('/research/fund/${item.schemeCode}');
                              } else if (item.ticker != null) {
                                context.push('/research/stock/${item.ticker}');
                              }
                            },
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: Row(
                              children: [
                                Text(
                                  'Deep Research',
                                  style: AppTextStyles.labelSmall.copyWith(
                                    color: AppColors.brandSecondary,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                const Icon(
                                  Icons.arrow_outward,
                                  size: 12,
                                  color: AppColors.brandSecondary,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  static String FormatPercent(double val) => '${val.toStringAsFixed(1)}%';
}
