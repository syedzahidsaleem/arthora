import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/formatters.dart';
import '../models/portfolio_model.dart';

class PortfolioCard extends StatelessWidget {
  final PortfolioModel portfolio;
  final VoidCallback? onTogglePin;

  const PortfolioCard({
    super.key,
    required this.portfolio,
    this.onTogglePin,
  });

  @override
  Widget build(BuildContext context) {
    final isCompleted = portfolio.status == 'completed';

    return GestureDetector(
      onTap: () => context.push('/ai/${portfolio.id}'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface2,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: portfolio.isPinned
                ? AppColors.brandPrimary.withOpacity(0.5)
                : const Color(0x0FFFFFFF),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Header Row: Category Badge & Pin
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.brandPrimary.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    portfolio.goalCategory,
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.brandSecondary,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                if (onTogglePin != null)
                  GestureDetector(
                    onTap: onTogglePin,
                    child: Icon(
                      portfolio.isPinned ? Icons.push_pin : Icons.push_pin_outlined,
                      size: 16,
                      color: portfolio.isPinned
                          ? AppColors.brandSecondary
                          : AppColors.textMuted,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 10),

            // Goal Title
            Text(
              portfolio.name,
              style: AppTextStyles.titleMedium.copyWith(fontSize: 14),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),

            // Metrics: Horizon & Projected Corpus
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('HORIZON', style: AppTextStyles.labelSmall.copyWith(fontSize: 9)),
                    const SizedBox(height: 2),
                    Text(
                      '${portfolio.timePeriod} Years',
                      style: AppTextStyles.moneySmall.copyWith(fontSize: 12),
                    ),
                  ],
                ),
                if (isCompleted && portfolio.aiSuggestion != null)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('PROJECTED', style: AppTextStyles.labelSmall.copyWith(fontSize: 9)),
                      const SizedBox(height: 2),
                      Text(
                        Formatters.formatLargeINR(portfolio.aiSuggestion!.projectedValue),
                        style: AppTextStyles.moneySmall.copyWith(
                          fontSize: 13,
                          color: AppColors.positive,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
