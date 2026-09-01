import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../main';
import { Favorite } from '../../lib/models/Favorite';
import { FundNAVHistory } from '../../lib/models/FundNAVHistory';
import { StockPriceHistory } from '../../lib/models/StockPriceHistory';
import * as redisService from '../../lib/db/redis';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test_jwt_secret_key_32_characters_long_12345';

vi.mock('../../lib/models/Favorite');
vi.mock('../../lib/models/FundNAVHistory');
vi.mock('../../lib/models/StockPriceHistory');
vi.mock('../../lib/db/redis');

describe('Favorites Integration Endpoints', () => {
  const userId = 'user_fav_123';
  const token = jwt.sign(
    { sub: userId, firebaseUid: 'fb_fav_123', email: 'fav@example.com' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' },
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/favorites', () => {
    it('adds mutual fund to watchlist and returns 201', async () => {
      vi.mocked(Favorite.findOne).mockResolvedValue(null as never);
      const mockCreated = {
        _id: 'fav_item_1',
        userId,
        assetType: 'mutual_fund',
        schemeCode: 120716,
        name: 'UTI Nifty 50 Index Fund',
        toObject: () => ({
          _id: 'fav_item_1',
          userId,
          assetType: 'mutual_fund',
          schemeCode: 120716,
          name: 'UTI Nifty 50 Index Fund',
        }),
      };
      vi.mocked(Favorite.create).mockResolvedValue(mockCreated as never);

      const res = await request(app)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({
          assetType: 'mutual_fund',
          schemeCode: 120716,
          name: 'UTI Nifty 50 Index Fund',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.schemeCode).toBe(120716);
    });

    it('returns 409 conflict when adding duplicate asset', async () => {
      vi.mocked(Favorite.findOne).mockResolvedValue({
        _id: 'fav_item_1',
        userId,
        assetType: 'mutual_fund',
        schemeCode: 120716,
      } as never);

      const res = await request(app)
        .post('/api/v1/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({
          assetType: 'mutual_fund',
          schemeCode: 120716,
          name: 'UTI Nifty 50 Index Fund',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ALREADY_EXISTS');
    });
  });

  describe('GET /api/v1/favorites', () => {
    it('returns enriched watchlist items', async () => {
      const mockFavorites = [
        {
          _id: 'fav_1',
          userId,
          assetType: 'mutual_fund',
          schemeCode: 120716,
          name: 'UTI Nifty 50 Index Fund',
          addedAt: new Date(),
        },
      ];

      vi.mocked(Favorite.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockFavorites),
        }),
      } as never);

      vi.mocked(FundNAVHistory.aggregate).mockResolvedValue([
        { _id: 120716, latestNav: 165.25, latestDate: '2024-01-01' },
      ] as never);
      vi.mocked(StockPriceHistory.aggregate).mockResolvedValue([] as never);
      vi.mocked(redisService.get).mockResolvedValue(null as never);

      const res = await request(app)
        .get('/api/v1/favorites')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].latestPrice).toBe(165.25);
    });
  });

  describe('DELETE /api/v1/favorites/:id', () => {
    it('removes favorite and returns 204', async () => {
      vi.mocked(Favorite.findOneAndDelete).mockResolvedValue({ _id: 'fav_1', userId } as never);

      const res = await request(app)
        .delete('/api/v1/favorites/fav_1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
    });

    it('returns 404 when favorite does not exist or user mismatch', async () => {
      vi.mocked(Favorite.findOneAndDelete).mockResolvedValue(null as never);

      const res = await request(app)
        .delete('/api/v1/favorites/non_existent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
