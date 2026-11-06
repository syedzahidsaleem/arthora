import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../shared/widgets/custom_error_widget.dart';
import '../providers/portfolio_provider.dart';
import 'portfolio_result_screen.dart';

class PollingScreen extends ConsumerStatefulWidget {
  final String portfolioId;

  const PollingScreen({super.key, required this.portfolioId});

  @override
  ConsumerState<PollingScreen> createState() => _PollingScreenState();
}

class _PollingScreenState extends ConsumerState<PollingScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.9, end: 1.1).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(portfolioNotifierProvider.notifier).startPolling(widget.portfolioId);
    });
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final portfolioState = ref.watch(portfolioNotifierProvider);

    if (portfolioState.status == PortfolioStateStatus.loaded &&
        portfolioState.currentPortfolio != null &&
        portfolioState.currentPortfolio!.status == 'completed') {
      return PortfolioResultScreen(portfolio: portfolioState.currentPortfolio!);
    }

    if (portfolioState.status == PortfolioStateStatus.error) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Generation Status')),
        body: CustomErrorWidget(
          message: portfolioState.errorMessage ?? 'Portfolio creation failed',
          onRetry: () {
            ref.read(portfolioNotifierProvider.notifier).startPolling(widget.portfolioId);
          },
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Pulsing Gradient Container
              ScaleTransition(
                scale: _pulseAnimation,
                child: Container(
                  width: 84,
                  height: 84,
                  decoration: BoxDecoration(
                    gradient: AppColors.brandGradient,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.brandPrimary.withOpacity(0.4),
                        blurRadius: 24,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.auto_awesome,
                    color: Colors.white,
                    size: 40,
                  ),
                ),
              ),
              const SizedBox(height: 36),

              Text(
                'AI Portfolio Engine',
                style: AppTextStyles.headlineMedium.copyWith(fontSize: 22),
              ),
              const SizedBox(height: 12),

              // Animated Step message
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.surface2,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0x0FFFFFFF)),
                ),
                child: Text(
                  portfolioState.pollingStep ?? '🔍 Analyzing your financial goal...',
                  textAlign: TextAlign.center,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.brandSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 28),

              const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.brandPrimary),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
