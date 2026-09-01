import { Portfolio } from '../models/Portfolio';
import { aiSuggestQueue } from '../../workers/aiSuggestWorker';
import { AppError } from '../errors/AppError';
import type {
  IPortfolio,
  CreatePortfolioInput,
  UpdatePortfolioInput,
  PaginatedData,
} from '@arthora/shared';

/**
 * Creates a new portfolio tracking document and enqueues background AI synthesis.
 */
export async function createPortfolio(
  userId: string,
  input: CreatePortfolioInput,
): Promise<{ portfolioId: string; status: string; pollUrl: string }> {
  const portfolio = await Portfolio.create({
    userId,
    name: input.name || input.goal || 'Goal Portfolio',
    goal: input.goal,
    timePeriod: input.timePeriod,
    riskLevel: input.riskLevel,
    monthlyInvestment: input.monthlyInvestment ?? 0,
    lumpSum: input.lumpSum ?? 0,
    isPinned: false,
    isActive: true,
    aiSuggestion: {
      status: 'pending',
      allocation: [],
      projectedValue: 0,
      rebalancing: 'quarterly',
      explanation: '',
      disclaimer: '',
    },
  });

  const portfolioId = portfolio._id.toString();

  // Enqueue BullMQ AI Suggestion job
  await aiSuggestQueue.add(
    'generate-ai-suggestion',
    {
      portfolioId,
      userId,
      input: {
        goalName: input.name || input.goal,
        timePeriodYears: input.timePeriod,
        riskLevel: input.riskLevel,
        monthlyInvestment: input.monthlyInvestment ?? 0,
        lumpSum: input.lumpSum ?? 0,
      },
    },
    { jobId: `ai-${portfolioId}-${Date.now()}` },
  );

  return {
    portfolioId,
    status: 'pending',
    pollUrl: `/api/v1/portfolios/${portfolioId}/status`,
  };
}

/**
 * Retrieves paginated list of active user portfolios.
 */
export async function listPortfolios(
  userId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedData<IPortfolio>> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const filter = { userId, isActive: true };

  const [items, total] = await Promise.all([
    Portfolio.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Portfolio.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / safeLimit);
  return {
    items: items as unknown as IPortfolio[],
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
}

/**
 * Retrieves a single portfolio document by ID.
 */
export async function getPortfolioById(
  userId: string,
  portfolioId: string,
): Promise<IPortfolio> {
  const portfolio = await Portfolio.findOne({
    _id: portfolioId,
    userId,
    isActive: true,
  }).lean();

  if (!portfolio) {
    throw new AppError('Portfolio not found', 404, 'NOT_FOUND');
  }

  return portfolio as unknown as IPortfolio;
}

/**
 * Returns real-time status of AI generation and the completed portfolio when ready.
 */
export async function getPortfolioStatus(
  userId: string,
  portfolioId: string,
) {
  const portfolio = await Portfolio.findOne({
    _id: portfolioId,
    userId,
    isActive: true,
  }).lean();

  if (!portfolio) {
    throw new AppError('Portfolio not found', 404, 'NOT_FOUND');
  }

  const status = portfolio.aiSuggestion?.status || 'pending';
  return {
    status,
    portfolio: status === 'completed' ? (portfolio as unknown as IPortfolio) : null,
  };
}

/**
 * Updates metadata or parameters of an existing portfolio.
 */
export async function updatePortfolio(
  userId: string,
  portfolioId: string,
  updates: UpdatePortfolioInput,
): Promise<IPortfolio> {
  const portfolio = await Portfolio.findOne({
    _id: portfolioId,
    userId,
    isActive: true,
  });

  if (!portfolio) {
    throw new AppError('Portfolio not found', 404, 'NOT_FOUND');
  }

  let retriggerAI = false;

  if (updates.name !== undefined) portfolio.name = updates.name.trim();
  if (updates.isPinned !== undefined) portfolio.isPinned = updates.isPinned;
  if (updates.goal !== undefined && updates.goal !== portfolio.goal) {
    portfolio.goal = updates.goal;
    retriggerAI = true;
  }
  if (updates.riskLevel !== undefined && updates.riskLevel !== portfolio.riskLevel) {
    portfolio.riskLevel = updates.riskLevel;
    retriggerAI = true;
  }
  if (updates.timePeriod !== undefined && updates.timePeriod !== portfolio.timePeriod) {
    portfolio.timePeriod = updates.timePeriod;
    retriggerAI = true;
  }
  if (updates.monthlyInvestment !== undefined) {
    portfolio.monthlyInvestment = updates.monthlyInvestment;
  }
  if (updates.lumpSum !== undefined) {
    portfolio.lumpSum = updates.lumpSum;
  }

  if (retriggerAI) {
    if (portfolio.aiSuggestion) {
      portfolio.aiSuggestion.status = 'pending';
    }
    await aiSuggestQueue.add(
      'generate-ai-suggestion',
      {
        portfolioId: portfolio._id.toString(),
        userId,
        input: {
          goalName: portfolio.name,
          timePeriodYears: portfolio.timePeriod,
          riskLevel: portfolio.riskLevel,
          monthlyInvestment: portfolio.monthlyInvestment,
          lumpSum: portfolio.lumpSum,
        },
      },
      { jobId: `ai-re-${portfolioId}-${Date.now()}` },
    );
  }

  await portfolio.save();
  return portfolio.toObject() as unknown as IPortfolio;
}

/**
 * Soft deletes a portfolio.
 */
export async function deletePortfolio(
  userId: string,
  portfolioId: string,
): Promise<void> {
  const result = await Portfolio.findOneAndUpdate(
    { _id: portfolioId, userId, isActive: true },
    { $set: { isActive: false } },
  );

  if (!result) {
    throw new AppError('Portfolio not found', 404, 'NOT_FOUND');
  }
}

/**
 * Toggles pin state for high priority dashboard pinning.
 */
export async function togglePin(
  userId: string,
  portfolioId: string,
): Promise<{ isPinned: boolean }> {
  const portfolio = await Portfolio.findOne({
    _id: portfolioId,
    userId,
    isActive: true,
  });

  if (!portfolio) {
    throw new AppError('Portfolio not found', 404, 'NOT_FOUND');
  }

  portfolio.isPinned = !portfolio.isPinned;
  await portfolio.save();

  return { isPinned: portfolio.isPinned };
}
