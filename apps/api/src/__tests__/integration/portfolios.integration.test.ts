import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../main';
import { Portfolio } from '../../lib/models/Portfolio';
import { aiSuggestQueue } from '../../workers/aiSuggestWorker';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test_jwt_secret_key_32_characters_long_12345';

vi.mock('../../lib/models/Portfolio');
vi.mock('../../lib/db/redis');
vi.mock('../../workers/aiSuggestWorker', () => ({
  aiSuggestQueue: {
    add: vi.fn().mockResolvedValue({ id: 'ai_job_123' }),
  },
  createAiSuggestWorker: vi.fn(),
}));

describe('Portfolios Integration Endpoints', () => {
  const userId = 'user_port_123';
  const token = jwt.sign(
    { sub: userId, firebaseUid: 'fb_port_123', email: 'port@example.com' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' },
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/portfolios', () => {
    it('creates portfolio, queues BullMQ job, and returns 202 with pollUrl', async () => {
      const mockDoc = {
        _id: { toString: () => 'port_doc_999' },
        userId,
        name: 'Retirement Fund',
        goal: 'Retirement in 20 years',
        timePeriod: 20,
        riskLevel: 'high',
        monthlyInvestment: 25000,
        lumpSum: 100000,
        aiSuggestion: { status: 'pending' },
      };

      vi.mocked(Portfolio.create).mockResolvedValue(mockDoc as never);

      const res = await request(app)
        .post('/api/v1/portfolios')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Retirement Fund',
          goal: 'Retirement in 20 years',
          goalCategory: 'retirement',
          timePeriod: 20,
          riskLevel: 'high',
          monthlyInvestment: 25000,
          lumpSum: 100000,
        });

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.data.portfolioId).toBe('port_doc_999');
      expect(res.body.data.pollUrl).toBe('/api/v1/portfolios/port_doc_999/status');
      expect(aiSuggestQueue.add).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/portfolios/:id/status', () => {
    it('returns pending status when generation is in progress', async () => {
      vi.mocked(Portfolio.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: 'port_doc_999',
          userId,
          aiSuggestion: { status: 'pending' },
        }),
      } as never);

      const res = await request(app)
        .get('/api/v1/portfolios/port_doc_999/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.portfolio).toBeNull();
    });

    it('returns completed status and full portfolio once generated', async () => {
      const completedPortfolio = {
        _id: 'port_doc_999',
        userId,
        name: 'Retirement Fund',
        aiSuggestion: {
          status: 'completed',
          allocation: [
            { assetType: 'mutual_fund', name: 'UTI Nifty 50 Index', allocationPercent: 60 },
          ],
        },
      };

      vi.mocked(Portfolio.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(completedPortfolio),
      } as never);

      const res = await request(app)
        .get('/api/v1/portfolios/port_doc_999/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.portfolio.name).toBe('Retirement Fund');
    });
  });

  describe('PATCH /api/v1/portfolios/:id/pin', () => {
    it('toggles isPinned flag on portfolio', async () => {
      const mockPortfolio = {
        _id: 'port_doc_999',
        userId,
        isPinned: false,
        save: vi.fn().mockImplementation(function (this: { isPinned: boolean }) {
          return Promise.resolve(this);
        }),
      };

      vi.mocked(Portfolio.findOne).mockResolvedValue(mockPortfolio as never);

      const res = await request(app)
        .patch('/api/v1/portfolios/port_doc_999/pin')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isPinned).toBe(true);
    });
  });
});
