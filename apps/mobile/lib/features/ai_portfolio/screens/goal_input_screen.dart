import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/gradient_button.dart';
import '../models/portfolio_model.dart';
import '../providers/portfolio_provider.dart';

class GoalInputScreen extends ConsumerStatefulWidget {
  const GoalInputScreen({super.key});

  @override
  ConsumerState<GoalInputScreen> createState() => _GoalInputScreenState();
}

class _GoalInputScreenState extends ConsumerState<GoalInputScreen> {
  final _goalController = TextEditingController();
  final _monthlyController = TextEditingController(text: '10000');

  String _selectedCategory = 'Retirement';
  double _timePeriodYears = 10;
  String _riskLevel = 'moderate';
  bool _isSubmitting = false;

  final List<Map<String, String>> _categories = [
    {'name': 'Retirement', 'hint': 'Accumulate ₹5 Crore for early retirement in Goa'},
    {'name': 'Home Purchase', 'hint': 'Save ₹50 Lakhs down-payment for 3BHK apartment'},
    {'name': "Child's Education", 'hint': 'Build ₹75 Lakhs education corpus for foreign MBA'},
    {'name': 'Wealth Creation', 'hint': 'Long-term high compounding equity growth portfolio'},
    {'name': 'Tax Saving', 'hint': 'Optimize Section 80C with high-alpha ELSS funds'},
    {'name': 'Emergency Fund', 'hint': 'Park 6 months expenses in liquid and arbitrage funds'},
  ];

  @override
  void dispose() {
    _goalController.dispose();
    _monthlyController.dispose();
    super.dispose();
  }

  void _selectCategory(Map<String, String> cat) {
    setState(() {
      _selectedCategory = cat['name']!;
      _goalController.text = cat['hint']!;
    });
  }

  Future<void> _handleSubmit() async {
    final goalText = _goalController.text.trim();
    if (goalText.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your investment goal'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    final monthlyAmount = double.tryParse(_monthlyController.text.replaceAll(',', '')) ?? 10000.0;

    setState(() => _isSubmitting = true);
    final portfolio = await ref.read(portfolioNotifierProvider.notifier).createPortfolio(
          CreatePortfolioInput(
            goal: goalText,
            goalCategory: _selectedCategory,
            timePeriod: _timePeriodYears.toInt(),
            riskLevel: _riskLevel,
            monthlyInvestment: monthlyAmount,
          ),
        );
    setState(() => _isSubmitting = false);

    if (portfolio != null && mounted) {
      context.push('/ai/${portfolio.id}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('AI Portfolio Builder'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history, color: AppColors.brandSecondary),
            onPressed: () => context.push('/ai/history'),
            tooltip: 'Portfolio History',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Headline
            Text(
              'What are you investing for?',
              style: AppTextStyles.headlineMedium.copyWith(fontSize: 22),
            ),
            const SizedBox(height: 4),
            Text(
              'Gemini AI will craft a personalized mutual fund & stock allocation tailored to your timeline.',
              style: AppTextStyles.bodyMedium,
            ),
            const SizedBox(height: 20),

            // Goal Categories Chips
            Text('POPULAR GOAL CATEGORIES', style: AppTextStyles.labelSmall),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _categories.map((cat) {
                  final isSelected = cat['name'] == _selectedCategory;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(cat['name']!),
                      selected: isSelected,
                      onSelected: (_) => _selectCategory(cat),
                      selectedColor: AppColors.brandPrimary.withOpacity(0.3),
                      backgroundColor: AppColors.surface1,
                      labelStyle: TextStyle(
                        color: isSelected ? AppColors.brandSecondary : AppColors.textSecondary,
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                        side: BorderSide(
                          color: isSelected ? AppColors.brandPrimary : const Color(0x0FFFFFFF),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 20),

            // Goal Input Text
            Text('DESCRIBE YOUR GOAL', style: AppTextStyles.labelSmall),
            const SizedBox(height: 8),
            TextFormField(
              controller: _goalController,
              maxLines: 3,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'e.g. Accumulate ₹2 Crore for my daughter’s education in 12 years...',
                filled: true,
                fillColor: AppColors.surface2,
              ),
            ),
            const SizedBox(height: 24),

            // Time Horizon Slider
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Text('TIME HORIZON', style: AppTextStyles.labelSmall),
                Text(
                  '${_timePeriodYears.toInt()} Years',
                  style: AppTextStyles.moneyMedium.copyWith(
                    color: AppColors.brandSecondary,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.surface2,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0x0FFFFFFF)),
              ),
              child: SliderTheme(
                data: SliderTheme.of(context).copyWith(
                  activeTrackColor: AppColors.brandPrimary,
                  inactiveTrackColor: AppColors.surface3,
                  thumbColor: AppColors.brandSecondary,
                  overlayColor: AppColors.brandSecondary.withOpacity(0.2),
                  trackHeight: 4,
                ),
                child: Slider(
                  value: _timePeriodYears,
                  min: 1,
                  max: 30,
                  divisions: 29,
                  onChanged: (v) => setState(() => _timePeriodYears = v),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Risk Appetite Selector
            Text('RISK TOLERANCE', style: AppTextStyles.labelSmall),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildRiskCard('conservative', 'Conservative', 'Low Risk', 'Debt & Large Cap bias'),
                const SizedBox(width: 8),
                _buildRiskCard('moderate', 'Moderate', 'Balanced', 'Flexi Cap & Bluechip'),
                const SizedBox(width: 8),
                _buildRiskCard('aggressive', 'Aggressive', 'High Growth', 'Mid & Small Cap surge'),
              ],
            ),
            const SizedBox(height: 24),

            // Monthly Investment SIP
            Text('MONTHLY SIP AMOUNT', style: AppTextStyles.labelSmall),
            const SizedBox(height: 8),
            TextFormField(
              controller: _monthlyController,
              keyboardType: TextInputType.number,
              style: AppTextStyles.moneyMedium.copyWith(fontSize: 18),
              decoration: const InputDecoration(
                prefixText: '₹ ',
                prefixStyle: TextStyle(color: Colors.white, fontSize: 18),
                hintText: '10000',
              ),
            ),
            const SizedBox(height: 10),

            // Quick Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [5000, 10000, 25000, 50000, 100000].map((amt) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: ActionChip(
                      label: Text(Formatters.formatLargeINR(amt.toDouble())),
                      backgroundColor: AppColors.surface1,
                      labelStyle: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                      onPressed: () {
                        setState(() => _monthlyController.text = amt.toString());
                      },
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: const BorderSide(color: Color(0x0FFFFFFF)),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 32),

            // Submit Button
            GradientButton(
              label: 'Generate AI Portfolio',
              icon: Icons.auto_awesome,
              isLoading: _isSubmitting,
              onPressed: _handleSubmit,
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildRiskCard(String key, String title, String tag, String desc) {
    final isSelected = _riskLevel == key;

    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _riskLevel = key),
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.brandPrimary.withOpacity(0.15)
                : AppColors.surface2,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppColors.brandPrimary : const Color(0x0FFFFFFF),
              width: isSelected ? 1.5 : 1.0,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTextStyles.titleMedium.copyWith(
                  fontSize: 12,
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                tag,
                style: AppTextStyles.labelSmall.copyWith(
                  fontSize: 9,
                  color: AppColors.brandSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
