import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../main';
import { Report } from '../../lib/models/Report';
import { generateAccessToken } from '../../lib/middleware/authMiddleware';
import * as redisService from '../../lib/db/redis';

process.env.JWT_SECRET = 'test_jwt_secret_key_32_characters_long_12345';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_32_characters_12345';

vi.mock('../../lib/models/Report');
vi.mock('../../lib/db/redis');
vi.mock('../../workers/reportWorker', () => ({
  reportQueue: {
    add: vi.fn().mockResolvedValue({ id: 'job_report_123' }),
  },
  createReportWorker: vi.fn(),
}));

describe('Reports Integration Endpoints', () => {
  const token = generateAccessToken({ userId: 'user_123', firebaseUid: 'fb_123', email: 'test@example.com' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/reports/fund-analysis', () => {
    it('returns 202 and reportId when queued successfully', async () => {
      vi.mocked(redisService.get).mockResolvedValue(null as never);

      const mockCreated = {
        _id: 'report_abc123',
        userId: 'user_123',
        schemeCode: 118778,
        status: 'pending',
      };
      vi.mocked(Report.create).mockResolvedValue(mockCreated as never);

      const res = await request(app)
        .post('/api/v1/reports/fund-analysis')
        .set('Authorization', `Bearer ${token}`)
        .send({ schemeCode: 118778 });

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reportId).toBe('report_abc123');
      expect(res.body.data.status).toBe('pending');
    });
  });

  describe('GET /api/v1/reports/:reportId', () => {
    it('returns pending status when report is processing', async () => {
      vi.mocked(Report.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: 'report_abc123',
          userId: 'user_123',
          status: 'pending',
        }),
      } as never);

      const res = await request(app)
        .get('/api/v1/reports/report_abc123')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('pending');
    });

    it('returns completed status and download URL when finished', async () => {
      vi.mocked(Report.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: 'report_abc123',
          userId: 'user_123',
          status: 'completed',
          downloadUrl: '/api/v1/reports/report_abc123/download',
        }),
      } as never);

      const res = await request(app)
        .get('/api/v1/reports/report_abc123')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.downloadUrl).toBe('/api/v1/reports/report_abc123/download');
    });

    it('returns 404 when report does not exist', async () => {
      vi.mocked(Report.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as never);

      const res = await request(app)
        .get('/api/v1/reports/nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
