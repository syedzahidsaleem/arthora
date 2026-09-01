import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as mfapi from '../../lib/external/mfapi';
import * as redisService from '../../lib/db/redis';
import { AppError } from '../../lib/errors/AppError';

vi.mock('../../lib/db/redis');

describe('mfapi.in External API Integration', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('fetchAllSchemes', () => {
    it('returns cached schemes on Redis cache hit without calling fetch', async () => {
      const cachedData = [{ schemeCode: 119598, schemeName: 'Mirae Asset Cash Management' }];
      vi.mocked(redisService.get).mockResolvedValue(cachedData as never);
      const mockFetch = vi.fn();
      global.fetch = mockFetch;

      const result = await mfapi.fetchAllSchemes();
      expect(result).toEqual(cachedData);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('fetches from API and sets Redis on cache miss', async () => {
      const apiData = [{ schemeCode: 120716, schemeName: 'UTI Nifty 50 Index' }];
      vi.mocked(redisService.get).mockResolvedValue(null as never);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => apiData,
      } as Response);
      vi.mocked(redisService.set).mockResolvedValue('OK' as never);

      const result = await mfapi.fetchAllSchemes();
      expect(result).toEqual(apiData);
      expect(redisService.set).toHaveBeenCalledWith('fund:all_schemes', apiData, 86400);
    });

    it('throws AppError 502 on network/upstream failure', async () => {
      vi.mocked(redisService.get).mockResolvedValue(null as never);
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(mfapi.fetchAllSchemes()).rejects.toThrowError(AppError);
      await expect(mfapi.fetchAllSchemes()).rejects.toMatchObject({
        statusCode: 502,
        code: 'EXTERNAL_API_ERROR',
      });
    });
  });

  describe('fetchSchemeDetail', () => {
    it('throws AppError 404 if scheme does not exist', async () => {
      vi.mocked(redisService.get).mockResolvedValue(null as never);
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      await expect(mfapi.fetchSchemeDetail(999999)).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });
  });

  describe('fetchNAVHistory', () => {
    it('correctly parses DD-MM-YYYY dates and converts NAV string to numbers', async () => {
      vi.mocked(redisService.get).mockResolvedValue(null as never);
      const mockDetail = {
        meta: {
          fund_house: 'HDFC',
          scheme_type: 'Open Ended',
          scheme_category: 'Large Cap',
          scheme_code: 119598,
          scheme_name: 'HDFC Top 100',
        },
        data: [
          { date: '01-01-2020', nav: '123.4567' },
          { date: '02-01-2020', nav: '124.5678' },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockDetail,
      } as Response);
      vi.mocked(redisService.set).mockResolvedValue('OK' as never);

      const navs = await mfapi.fetchNAVHistory(119598);
      expect(navs.length).toBe(2);
      expect(navs[0]?.nav).toBe(123.4567);
      expect(navs[0]?.date.getUTCFullYear()).toBe(2020);
      expect(navs[0]?.date.getUTCMonth()).toBe(0);
      expect(navs[0]?.date.getUTCDate()).toBe(1);
    });
  });
});
