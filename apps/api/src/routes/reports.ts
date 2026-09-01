import fs from 'fs';
import path from 'path';
import os from 'os';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Report } from '../lib/models/Report';
import { reportQueue } from '../workers/reportWorker';
import { authMiddleware } from '../lib/middleware/authMiddleware';
import { reportLimiter } from '../lib/middleware/rateLimitMiddleware';
import { validate } from '../lib/middleware/validationMiddleware';
import { AppError } from '../lib/errors/AppError';
import type { ApiResponse } from '@arthora/shared';

const router: Router = Router();

const fundReportSchema = z.object({
  schemeCode: z.number().int().positive('Valid schemeCode is required'),
});

/**
 * POST /reports/fund-analysis - Generate institutional PDF analysis report
 */
router.post(
  '/fund-analysis',
  authMiddleware,
  reportLimiter,
  validate(fundReportSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { schemeCode } = req.body;

      const report = await Report.create({
        userId,
        type: 'fund_analysis',
        status: 'pending',
        schemeCode,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      const reportId = report._id.toString();

      await reportQueue.add(
        'generate-report',
        { reportId },
        { jobId: `report-${reportId}-${Date.now()}` },
      );

      const result = {
        reportId,
        status: 'pending',
        pollUrl: `/api/v1/reports/${reportId}`,
      };

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Report generation started.',
        timestamp: new Date().toISOString(),
      };
      res.status(202).json(response);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /reports/:reportId - Check report generation status
 */
router.get('/:reportId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const report = await Report.findOne({ _id: req.params.reportId, userId }).lean();

    if (!report) {
      throw new AppError('Report not found', 404, 'NOT_FOUND');
    }

    const result = {
      reportId: report._id.toString(),
      status: report.status,
      downloadUrl: report.downloadUrl,
      expiresAt: report.expiresAt,
    };

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /reports/:reportId/download - Download generated PDF document
 */
router.get(
  '/:reportId/download',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const report = await Report.findOne({ _id: req.params.reportId, userId });

      if (!report) {
        throw new AppError('Report not found', 404, 'NOT_FOUND');
      }

      if (report.status !== 'completed') {
        throw new AppError(
          `Report is not ready yet (status: ${report.status})`,
          400,
          'REPORT_NOT_READY',
        );
      }

      const filePath = path.join(os.tmpdir(), 'arthora-reports', `${report._id}.pdf`);
      if (!fs.existsSync(filePath)) {
        throw new AppError('Report file has expired or was removed', 404, 'FILE_NOT_FOUND');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="fund-analysis-${report.schemeCode || report._id}.pdf"`,
      );

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
