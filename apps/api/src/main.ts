import 'dotenv/config';
import express, { Express } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';
import { connectDB } from './lib/db/connection';
import { redis } from './lib/db/redis';
import { requestIdMiddleware } from './lib/middleware/requestId';
import { generalLimiter } from './lib/middleware/rateLimitMiddleware';
import { corsMiddleware } from './lib/middleware/corsMiddleware';
import { sanitizeBody } from './lib/middleware/sanitizationMiddleware';
import { notFoundHandler, globalErrorHandler } from './lib/middleware/errorMiddleware';
import apiRouter from './routes';

// Load environment variables
dotenv.config();

// Initialize Sentry if SENTRY_DSN is configured
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

const app: Express = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ---------------------------------------------------------
// Middleware Setup in Exact Required Order:
// 1. Sentry RequestHandler (if active)
// 2. express.json() + express.urlencoded() (1MB limit)
// 3. Sanitization middleware (XSS stripping)
// 4. Helmet.js (security headers: HSTS, CSP, X-Frame-Options, noSniff, xssFilter)
// 5. Compression middleware (gzip)
// 6. Morgan (request logging)
// 7. CORS: allow origins from env.ALLOWED_ORIGINS, credentials: true
// 8. Request ID middleware (uuid v4 -> req.id and X-Request-ID)
// 9. Rate limiting middleware (Redis sliding window)
// 10. Router mounting
// 11. 404 handler
// 12. Sentry ErrorHandler (if active)
// 13. Global error handler
// ---------------------------------------------------------

// 1. Body Parsing (1MB limit for DOS protection)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 2. Input Sanitization (strips malicious HTML/XSS payloads)
app.use(sanitizeBody);

// 3. Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.mfapi.in', 'https://finance.yahoo.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
  }),
);

// 4. Compression (gzip)
app.use(compression());

// 5. Morgan Request Logging
if (NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// 6. CORS Configuration
app.use(corsMiddleware);

// 7. Request ID Injection
app.use(requestIdMiddleware);

// 8. Rate Limiting Middleware (General API Limiter)
app.use(generalLimiter);

// 9. Router Mounting (API Prefix & Root routes)
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);
app.use('/', apiRouter);

// 10. 404 Catch-All Handler
app.use(notFoundHandler);

// 11. Global Error Handler
app.use(globalErrorHandler);

/**
 * Bootstrap database connection and start HTTP server.
 */
async function startServer(): Promise<void> {
  try {
    console.log('🚀 [Server] Initializing Arthora API...');
    
    // Connect to MongoDB
    await connectDB();

    // Verify Redis connection availability
    const redisPing = await redis.ping();
    console.log(`📡 [Redis] Initial ping status: ${redisPing}`);

    if (process.env.RUN_WORKER_IN_PROCESS === 'true') {
      const { startWorkers } = await import('./worker');
      await startWorkers();
      console.log('⚙️ [Worker Process] Embedded background worker started inside API process.');
    }

    const server = app.listen(PORT, () => {
      console.log(`✨ [Server] Arthora API running on port ${PORT} in [${NODE_ENV}] mode.`);
      console.log(`🔗 [Server] Health check: http://localhost:${PORT}/health`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n🛑 [Server] Received ${signal}. Shutting down HTTP server...`);
      server.close(() => {
        console.log('🔒 [Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('💥 [Server] Failed to initialize server:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app };
export default app;
