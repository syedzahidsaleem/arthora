import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../main';
import { SearchHistory } from '../../lib/models/SearchHistory';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test_jwt_secret_key_32_characters_long_12345';

vi.mock('../../lib/models/SearchHistory');
vi.mock('../../lib/db/redis');

describe('Search History Integration Endpoints', () => {
  const userId = 'user_search_123';
  const token = jwt.sign(
    { sub: userId, firebaseUid: 'fb_search_123', email: 'search@example.com' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' },
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/search/history', () => {
    it('returns paginated list of user searches', async () => {
      const mockHistory = [
        {
          _id: 'search_1',
          userId,
          query: 'HDFC Small Cap',
          assetType: 'mutual_fund',
          resultCount: 5,
          searchedAt: new Date(),
        },
      ];

      vi.mocked(SearchHistory.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              lean: vi.fn().mockResolvedValue(mockHistory),
            }),
          }),
        }),
      } as never);
      vi.mocked(SearchHistory.countDocuments).mockResolvedValue(1 as never);

      const res = await request(app)
        .get('/api/v1/search/history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].query).toBe('HDFC Small Cap');
    });
  });

  describe('DELETE /api/v1/search/history', () => {
    it('clears all user search history and returns 204', async () => {
      vi.mocked(SearchHistory.deleteMany).mockResolvedValue({ acknowledged: true, deletedCount: 5 } as never);

      const res = await request(app)
        .delete('/api/v1/search/history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
      expect(SearchHistory.deleteMany).toHaveBeenCalledWith({ userId });
    });
  });
});
