import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/text_styles.dart';
import '../../core/constants/app_constants.dart';

class DisclaimerWidget extends StatelessWidget {
  final String? message;

  const DisclaimerWidget({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.warning.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.warning.withOpacity(0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.warning_amber_rounded,
            size: 16,
            color: AppColors.warning,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message ?? AppConstants.sebiDisclaimer,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.warning,
                fontSize: 10,
                height: 1.3,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
