import 'package:flutter/material.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/market_utils.dart';
import '../models/stock_detail_model.dart';

class StockHeaderSection extends StatefulWidget {
  final StockMetadata stock;
  final StockMetrics? metrics;

  const StockHeaderSection({
    super.key,
    required this.stock,
    this.metrics,
  });

  @override
  State<StockHeaderSection> createState() => _StockHeaderSectionState();
}

class _StockHeaderSectionState extends State<StockHeaderSection>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final stock = widget.stock;
    final metrics = widget.metrics;
    final isMarketOpen = MarketUtils.isMarketOpen();
    final isPositive = (stock.changePercent ?? 0) >= 0;

    // 52-week price range calculation
    final low52 = metrics?.week52Low ?? 0.0;
    final high52 = metrics?.week52High ?? 1.0;
    final current = stock.currentPrice ?? 0.0;
    final progress = high52 > low52
        ? ((current - low52) / (high52 - low52)).clamp(0.0, 1.0)
        : 0.5;

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
          // Top Badges & Live Dot
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Wrap(
                spacing: 6,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.surface1,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      stock.symbol,
                      style: AppTextStyles.ticker.copyWith(fontSize: 11),
                    ),
                  ),
                  if (stock.sector != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.brandPrimary.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        stock.sector!,
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.brandSecondary,
                          fontSize: 10,
                        ),
                      ),
                    ),
                ],
              ),
              Row(
                children: [
                  AnimatedBuilder(
                    animation: _pulseController,
                    builder: (context, child) {
                      return Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isMarketOpen
                              ? AppColors.positive.withOpacity(0.4 + 0.6 * _pulseController.value)
                              : AppColors.textMuted,
                        ),
                      );
                    },
                  ),
                  const SizedBox(width: 6),
                  Text(
                    isMarketOpen ? 'NSE LIVE' : 'NSE CLOSED',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: isMarketOpen ? AppColors.positive : AppColors.textMuted,
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Company Name
          Text(
            stock.companyName,
            style: AppTextStyles.headlineMedium.copyWith(fontSize: 18),
          ),
          const SizedBox(height: 16),
          const Divider(color: Color(0x0FFFFFFF), height: 1),
          const SizedBox(height: 16),

          // Current Price & 1D Change
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('CURRENT PRICE', style: AppTextStyles.labelSmall.copyWith(fontSize: 9)),
                  const SizedBox(height: 2),
                  Text(
                    stock.currentPrice != null ? Formatters.formatINR(stock.currentPrice!) : '—',
                    style: AppTextStyles.moneyLarge.copyWith(fontSize: 26),
                  ),
                ],
              ),
              if (stock.changePercent != null)
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
                        '${isPositive ? '+' : ''}${stock.changePercent!.toStringAsFixed(2)}%',
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

          // 52-Week Range Bar
          if (low52 > 0 && high52 > low52) ...[
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Text(
                  '52W L: ${Formatters.formatINR(low52)}',
                  style: const TextStyle(fontFamily: 'JetBrainsMono', fontSize: 9, color: AppColors.textMuted),
                ),
                Text(
                  '52W H: ${Formatters.formatINR(high52)}',
                  style: const TextStyle(fontFamily: 'JetBrainsMono', fontSize: 9, color: AppColors.textMuted),
                ),
              ],
            ),
            const SizedBox(height: 4),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: AppColors.surface1,
                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.brandSecondary),
                minHeight: 4,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
