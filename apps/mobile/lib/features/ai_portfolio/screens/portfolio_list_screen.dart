import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../../../shared/widgets/custom_error_widget.dart';
import '../providers/portfolio_provider.dart';
import '../widgets/portfolio_card.dart';

class PortfolioListScreen extends ConsumerStatefulWidget {
  const PortfolioListScreen({super.key});

  @override
  ConsumerState<PortfolioListScreen> createState() => _PortfolioListScreenState();
}

class _PortfolioListScreenState extends ConsumerState<PortfolioListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(portfolioNotifierProvider.notifier).loadPortfolios();
    });
  }

  @override
  Widget build(BuildContext context) {
    final portfolioState = ref.watch(portfolioNotifierProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Saved Portfolios'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/ai'),
        backgroundColor: AppColors.brandPrimary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('New Goal'),
      ),
      body: Builder(
        builder: (context) {
          if (portfolioState.status == PortfolioStateStatus.loading &&
              portfolioState.portfolios.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(color: AppColors.brandPrimary),
            );
          }

          if (portfolioState.status == PortfolioStateStatus.error &&
              portfolioState.portfolios.isEmpty) {
            return CustomErrorWidget(
              message: portfolioState.errorMessage ?? 'Failed to load portfolios',
              onRetry: () => ref.read(portfolioNotifierProvider.notifier).loadPortfolios(),
            );
          }

          if (portfolioState.portfolios.isEmpty) {
            return EmptyStateWidget(
              icon: Icons.auto_awesome,
              title: 'No Portfolios Yet',
              description: 'Create your first goal-driven AI portfolio to view it here.',
              actionLabel: 'Build AI Portfolio',
              onAction: () => context.push('/ai'),
            );
          }

          return RefreshIndicator(
            onRefresh: () => ref.read(portfolioNotifierProvider.notifier).loadPortfolios(),
            color: AppColors.brandSecondary,
            backgroundColor: AppColors.surface1,
            child: GridView.builder(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.85,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: portfolioState.portfolios.length,
              itemBuilder: (context, index) {
                final item = portfolioState.portfolios[index];
                return PortfolioCard(
                  portfolio: item,
                  onTogglePin: () {
                    ref.read(portfolioNotifierProvider.notifier).togglePin(item.id);
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }
}
