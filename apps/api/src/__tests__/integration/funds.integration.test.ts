import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../main';
import { FundMetadata } from '../../lib/models/FundMetadata';
import { FundNAVHistory } from '../../lib/models/FundNAVHistory';
import { FundMetrics } from '../../lib/models/FundMetrics';
import * as redisService from '../../lib/db/redis';
import { metricCalcQueue } from '../../workers/metricCalcWorker';

vi.mock('../../lib/models/FundMetadata');
vi.mock('../../lib/models/FundNAVHistory');
vi.mock('../../lib/models/FundMetrics');
vi.mock('../../lib/models/FundHoldings');
vi.mock('../../lib/models/FundSectorAlloc');
vi.mock('../../lib/models/SearchHistory');
vi.mock('../../lib/db/redis');
vi.mock('../../workers/metricCalcWorker', () => ({
  metricCalcQueue: {
    add: vi.fn().mockResolvedValue({ id: 'job_123' }),
  },
  createMetricCalcWorker: vi.fn(),
}));

describe('Funds Integration Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/funds/search', () => {
    it('returns paginated fund list matching search query', async () => {
      vi.mocked(redisService.get).mockResolvedValue(null as never);

      const mockFunds = [
        {
          schemeCode: 119598,
          schemeName: 'HDFC Top 100 Fund - Direct - Growth',
          fundHouse: 'HDFC',
          category: 'large_cap',
        },
      ];

      vi.mocked(FundMetadata.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              lean: vi.fn().mockResolvedValue(mockFunds),
            }),
          }),
        }),
      } as never);
      vi.mocked(FundMetadata.countDocuments).mockResolvedValue(1 as never);
      vi.mocked(redisService.set).mockResolvedValue('OK' as never);

      const res = await request(app).get('/api/v1/funds/search?q=HDFC&page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.pagination.total).toBe(1);
    });

    it('returns cached results on subsequent call', async () => {
      const cachedResult = {
        items: [{ schemeCode: 120716, schemeName: 'UTI Nifty 50' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      };
      vi.mocked(redisService.get).mockResolvedValue(cachedResult as never);

      const res = await request(app).get('/api/v1/funds/search?q=UTI');
      expect(res.status).toBe(200);
      expect(res.body.data.items[0].schemeCode).toBe(120716);
      expect(FundMetadata.find).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/funds/:schemeCode', () => {
    it('returns 200 with complete fund detail and latest NAV', async () => {
      vi.mocked(redisService.get).mockResolvedValue(null as never);

      const mockMeta = {
        schemeCode: 118778,
        schemeName: 'Nippon India Small Cap Fund',
        fundHouse: 'Nippon India',
        category: 'small_cap',
      };
      vi.mocked(FundMetadata.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockMeta),
      } as never);

      vi.mocked(FundNAVHistory.findOne).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({ date: new Date('2024-01-01'), nav: 145.5 }),
        }),
      } as never);

      const res = await request(app).get('/api/v1/funds/118778');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.schemeName).toBe('Nippon India Small Cap Fund');
      expect(res.body.data.latestNAV).toBe(145.5);
    });
  });

  describe('GET /api/v1/funds/:schemeCode/metrics', () => {
    it('returns 202 with calculating status when metrics document is not yet computed', async () => {
      vi.mocked(redisService.get).mockResolvedValue(null as never);
      vi.mocked(FundMetrics.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as never);

      const res = await request(app).get('/api/v1/funds/119598/metrics');
      expect(res.status).toBe(202);
      expect(res.body.data.status).toBe('calculating');
      expect(metricCalcQueue.add).toHaveBeenCalledWith('calc-fund-metrics', { schemeCode: 119598 }, expect.anything());
    });
  });
});
