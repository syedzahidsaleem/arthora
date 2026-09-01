import 'dart:math';
import 'package:flutter/material.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/formatters.dart';

class SIPCalculatorWidget extends StatefulWidget {
  final double defaultCAGR;

  const SIPCalculatorWidget({super.key, this.defaultCAGR = 14.0});

  @override
  State<SIPCalculatorWidget> createState() => _SIPCalculatorWidgetState();
}

class _SIPCalculatorWidgetState extends State<SIPCalculatorWidget> {
  double _monthlyAmount = 10000;
  double _years = 10;
  late double _expectedReturn;

  @override
  void initState() {
    super.initState();
    _expectedReturn = widget.defaultCAGR.clamp(1.0, 30.0);
  }

  @override
  Widget build(BuildContext context) {
    // Compound SIP formula
    final p = _monthlyAmount;
    final r = (_expectedReturn / 100) / 12;
    final n = _years * 12;

    double totalCorpus = 0;
    if (r > 0) {
      totalCorpus = p * ((pow(1 + r, n) - 1) / r) * (1 + r);
    } else {
      totalCorpus = p * n;
    }

    final totalInvested = p * n;
    final estimatedGains = max(0.0, totalCorpus - totalInvested);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface2,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0x0FFFFFFF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Icon(Icons.calculate_outlined, color: AppColors.brandSecondary, size: 18),
              const SizedBox(width: 8),
              Text('SIP COMPOUND CALCULATOR', style: AppTextStyles.labelSmall),
            ],
          ),
          const SizedBox(height: 16),

          // Monthly SIP Slider
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Text('Monthly Investment', style: AppTextStyles.bodySmall),
              Text(
                Formatters.formatINR(_monthlyAmount),
                style: AppTextStyles.moneySmall.copyWith(color: AppColors.brandSecondary),
              ),
            ],
          ),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: AppColors.brandPrimary,
              inactiveTrackColor: AppColors.surface1,
              thumbColor: AppColors.brandSecondary,
              trackHeight: 3,
            ),
            child: Slider(
              value: _monthlyAmount,
              min: 500,
              max: 100000,
              divisions: 199,
              onChanged: (v) => setState(() => _monthlyAmount = v),
            ),
          ),
          const SizedBox(height: 10),

          // Horizon Slider
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Text('Investment Horizon', style: AppTextStyles.bodySmall),
              Text(
                '${_years.toInt()} Years',
                style: AppTextStyles.moneySmall.copyWith(color: AppColors.brandSecondary),
              ),
            ],
          ),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: AppColors.brandPrimary,
              inactiveTrackColor: AppColors.surface1,
              thumbColor: AppColors.brandSecondary,
              trackHeight: 3,
            ),
            child: Slider(
              value: _years,
              min: 1,
              max: 30,
              divisions: 29,
              onChanged: (v) => setState(() => _years = v),
            ),
          ),
          const SizedBox(height: 10),

          // Expected CAGR Slider
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Text('Expected Return (p.a.)', style: AppTextStyles.bodySmall),
              Text(
                '${_expectedReturn.toStringAsFixed(1)}%',
                style: AppTextStyles.moneySmall.copyWith(color: AppColors.positive),
              ),
            ],
          ),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: AppColors.positive,
              inactiveTrackColor: AppColors.surface1,
              thumbColor: AppColors.positive,
              trackHeight: 3,
            ),
            child: Slider(
              value: _expectedReturn,
              min: 5,
              max: 25,
              divisions: 40,
              onChanged: (v) => setState(() => _expectedReturn = v),
            ),
          ),
          const SizedBox(height: 16),
          const Divider(color: Color(0x0FFFFFFF), height: 1),
          const SizedBox(height: 16),

          // Computation Summary
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.surface1,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('INVESTED', style: AppTextStyles.labelSmall.copyWith(fontSize: 8)),
                      const SizedBox(height: 2),
                      Text(
                        Formatters.formatLargeINR(totalInvested),
                        style: AppTextStyles.moneySmall.copyWith(fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.surface1,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('EST. GAINS', style: AppTextStyles.labelSmall.copyWith(fontSize: 8)),
                      const SizedBox(height: 2),
                      Text(
                        Formatters.formatLargeINR(estimatedGains),
                        style: AppTextStyles.moneySmall.copyWith(
                          fontSize: 12,
                          color: AppColors.positive,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Total Final Corpus
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.brandPrimary.withOpacity(0.2),
                  AppColors.brandSecondary.withOpacity(0.1),
                ],
              ),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.brandPrimary.withOpacity(0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Text(
                  'TOTAL EXPECTED CORPUS',
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.brandSecondary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  Formatters.formatLargeINR(totalCorpus),
                  style: AppTextStyles.moneyLarge.copyWith(
                    fontSize: 18,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
