import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/text_styles.dart';

class TimeRangeSelector extends StatelessWidget {
  final List<String> ranges;
  final String selected;
  final ValueChanged<String> onChanged;

  const TimeRangeSelector({
    super.key,
    this.ranges = const ['1M', '3M', '6M', '1Y', '3Y', '5Y', 'MAX'],
    required this.selected,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: ranges.map((range) {
          final isSelected = range == selected;
          return Padding(
            padding: const EdgeInsets.only(right: 6),
            child: GestureDetector(
              onTap: () => onChanged(range),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  gradient: isSelected ? AppColors.brandGradient : null,
                  color: isSelected ? null : AppColors.surface1,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isSelected ? Colors.transparent : const Color(0x0FFFFFFF),
                  ),
                ),
                child: Text(
                  range,
                  style: isSelected
                      ? AppTextStyles.labelSmall.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        )
                      : AppTextStyles.labelSmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
