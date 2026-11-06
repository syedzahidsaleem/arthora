import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/text_styles.dart';

class MetricTile extends StatelessWidget {
  final String label;
  final String value;
  final double? change;
  final String? tooltip;

  const MetricTile({
    super.key,
    required this.label,
    required this.value,
    this.change,
    this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    Color valueColor = AppColors.textPrimary;
    if (change != null) {
      valueColor = change! >= 0 ? AppColors.positive : AppColors.negative;
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0x0FFFFFFF), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  label.toUpperCase(),
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.textSecondary,
                    fontSize: 9,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (tooltip != null)
                Tooltip(
                  message: tooltip!,
                  child: const Padding(
                    padding: EdgeInsets.only(left: 2),
                    child: Icon(Icons.info_outline, size: 10, color: AppColors.textMuted),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTextStyles.moneySmall.copyWith(
              color: valueColor,
              fontWeight: FontWeight.w700,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
