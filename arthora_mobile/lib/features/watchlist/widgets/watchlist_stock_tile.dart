import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/formatters.dart';
import '../models/favorite_model.dart';

class WatchlistStockTile extends StatelessWidget {
  final FavoriteStockModel stock;
  final VoidCallback onDismissed;

  const WatchlistStockTile({
    super.key,
    required this.stock,
    required this.onDismissed,
  });

  @override
  Widget build(BuildContext context) {
    final isPositive = (stock.changePercent ?? 0) >= 0;

    return Dismissible(
      key: Key('stock_${stock.id}'),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: AppColors.negative.withOpacity(0.8),
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      onDismissed: (_) => onDismissed(),
      child: InkWell(
        onTap: () => context.push('/research/stock/${stock.symbol}'),
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
                  color: AppColors.surface2,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.trending_up,
                  size: 18,
                  color: AppColors.brandSecondary,
                ),
              ),
              const SizedBox(width: 12),

              // Symbol & Company
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      stock.symbol,
                      style: AppTextStyles.ticker.copyWith(fontSize: 13),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      stock.name,
                      style: AppTextStyles.bodySmall.copyWith(fontSize: 10),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),

              // Price & Day Change
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (stock.currentPrice != null)
                    Text(
                      Formatters.formatINR(stock.currentPrice!),
                      style: AppTextStyles.moneySmall.copyWith(fontSize: 13),
                    ),
                  if (stock.changePercent != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      '${isPositive ? '+' : ''}${stock.changePercent!.toStringAsFixed(2)}%',
                      style: TextStyle(
                        fontFamily: 'JetBrainsMono',
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: isPositive ? AppColors.positive : AppColors.negative,
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
