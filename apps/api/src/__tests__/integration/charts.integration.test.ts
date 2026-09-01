import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../main';
import { generateAccessToken } from '../../lib/middleware/authMiddleware';
import * as fundService from '../../lib/services/fundService';
import * as redisService from '../../lib/db/redis';

process.env.JWT_SECRET = 'test_jwt_secret_key_32_characters_long_12345';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_32_characters_12345';

vi.mock('../../lib/services/fundService');
vi.mock('../../lib/services/stockService');
vi.mock('../../lib/db/redis');

describe('Charts Integration Endpoints', () => {
  const token = generateAccessToken({ userId: 'user_123', firebaseUid: 'fb_123', email: 'test@example.com' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/charts/fund-nav', () => {
    it('returns 200 with ~252 data points for 1Y timeframe', async () => {
      vi.mocked(redisService.get).mockResolvedValue(null as never);

      const dates = Array.from({ length: 252 }, (_, i) => `2023-${(i % 12 + 1).toString().padStart(2, '0')}-01`);
      const navs = Array.from({ length: 252 }, (_, i) => 100 + i * 0.2);

      vi.mocked(fundService.getFundNAVHistory).mockResolvedValue({
        dates,
        navs,
      });

      const res = await request(app)
        .get('/api/v1/charts/fund-nav?schemeCode=118834&timeframe=1Y')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data.length).toBe(252);
      expect(res.body.data.data[0].nav).toBe(100);
    });

    it('returns 200 with ~22 data points for 1M timeframe', async () => {
      vi.mocked(redisService.get).mockResolvedValue(null as never);

      const dates = Array.from({ length: 22 }, (_, i) => `2023-12-${(i + 1).toString().padStart(2, '0')}`);
      const navs = Array.from({ length: 22 }, (_, i) => 140 + i * 0.1);

      vi.mocked(fundService.getFundNAVHistory).mockResolvedValue({
        dates,
        navs,
      });

      const res = await request(app)
        .get('/api/v1/charts/fund-nav?schemeCode=118834&timeframe=1M')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data.length).toBe(22);
    });
  });

  describe('GET /api/v1/charts/fund-drawdown', () => {
    it('returns 200 with drawdown series and maxDrawdown analysis', async () => {
      vi.mocked(redisService.get).mockResolvedValue(null as never);

      const dates = ['2023-01-01', '2023-03-01', '2023-06-01', '2023-09-01', '2023-12-01'];
      const navs = [100, 120, 90, 70, 110];

      vi.mocked(fundService.getFundNAVHistory).mockResolvedValue({
        dates,
        navs,
      });

      const res = await request(app)
        .get('/api/v1/charts/fund-drawdown?schemeCode=118834')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.maxDrawdown).toBeCloseTo(0.4167, 3);
      expect(res.body.data.data.length).toBe(5);
    });
  });
});
