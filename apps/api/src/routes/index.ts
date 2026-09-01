import { Router } from 'express';
import authRouter from './auth';
import fundsRouter from './funds';
import stocksRouter from './stocks';
import portfoliosRouter from './portfolios';
import aiRouter from './ai';
import favoritesRouter from './favorites';
import searchRouter from './search';
import reportsRouter from './reports';
import chartsRouter from './charts';
import onboardRouter from './onboard';
import healthRouter from './health';

const router: Router = Router();

// Health check endpoint
router.use('/health', healthRouter);

// Mount feature routers
router.use('/auth', authRouter);
router.use('/funds', fundsRouter);
router.use('/stocks', stocksRouter);
router.use('/portfolios', portfoliosRouter);
router.use('/ai', aiRouter);
router.use('/favorites', favoritesRouter);
router.use('/search', searchRouter);
router.use('/reports', reportsRouter);
router.use('/charts', chartsRouter);
router.use('/onboard', onboardRouter);

export default router;
