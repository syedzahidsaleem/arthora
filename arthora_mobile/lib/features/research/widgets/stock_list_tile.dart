import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/formatters.dart';
import '../models/search_models.dart';

class StockListTile extends StatelessWidget {
  final StockSearchResult stock;

  const StockListTile({super.key, required this.stock});

  @override
  Widget build(BuildContext context) {
    final isPositive = (stock.changePercent ?? 0) >= 0;

    return InkWell(
      onTap: () => context.push('/research/stock/${stock.symbol}'),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: const BoxDecoration(
          border: Border(
            bottom: BorderSide(color: Color(0x0AFFFFFF), width: 1),
          ),
        ),
        child: Row(
          children: [
            // Stock Circle Avatar
            CircleAvatar(
              radius: 18,
              backgroundColor: AppColors.surface2,
              child: Text(
                stock.symbol.substring(0, stock.symbol.length > 2 ? 2 : stock.symbol.length),
                style: const TextStyle(
                  fontFamily: 'JetBrainsMono',
                  color: AppColors.brandSecondary,
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Symbol and Company Name
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        stock.symbol,
                        style: AppTextStyles.ticker.copyWith(fontSize: 13),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                        decoration: BoxDecoration(
                          color: AppColors.surface2,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'NSE',
                          style: TextStyle(
                            fontFamily: 'JetBrainsMono',
                            fontSize: 8,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${stock.companyName} · ${stock.sector ?? 'Equity'}',
                    style: AppTextStyles.bodySmall.copyWith(fontSize: 10),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),

            // Price and Day Change
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (stock.currentPrice != null)
                  Text(
                    Formatters.formatINR(stock.currentPrice!),
                    style: AppTextStyles.moneySmall.copyWith(fontSize: 13),
                  ),
                const SizedBox(height: 2),
                if (stock.changePercent != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                    decoration: BoxDecoration(
                      color: (isPositive ? AppColors.positive : AppColors.negative)
                          .withOpacity(0.12),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      '${isPositive ? '+' : ''}${stock.changePercent!.toStringAsFixed(2)}%',
                      style: TextStyle(
                        fontFamily: 'JetBrainsMono',
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: isPositive ? AppColors.positive : AppColors.negative,
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
