import { existsSync } from 'node:fs';
import path from 'node:path';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { isDbConnected } from './config/db.js';
import { CLIENT_DIST, env } from './config/env.js';
import { authenticate } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/error.js';
import { apiLimiter } from './middleware/rateLimit.js';
import apiRoutes from './routes/index.js';

export function createApp({ initialize, serveClient = env.serveClient } = {}) {
  const app = express();

  app.disable('x-powered-by');
  // Hosts like Render and Railway sit behind a proxy: trust it for HTTPS detection and client IPs.
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // HTTPS upgrades are handled by the host; keeping this would break plain-HTTP local runs.
          upgradeInsecureRequests: null,
        },
      },
    }),
  );
  if (env.corsOrigins.length) app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  if (!env.isTest) app.use(morgan(env.isProd ? 'combined' : 'dev'));

  // API responses contain personal data: never let browsers or proxies cache them.
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  // Serverless requests must await initialization before running database queries.
  if (initialize) {
    app.use('/api', async (_req, res, next) => {
      try {
        await initialize();
        next();
      } catch {
        console.error('API initialization failed. Check database connectivity and server configuration.');
        res.status(503).json({ message: 'The service is temporarily unavailable. Please try again shortly.' });
      }
    });
  }
  app.get('/api/health', (_req, res) => {
    const connected = isDbConnected();
    res.status(connected ? 200 : 503).json({
      status: connected ? 'ok' : 'unavailable',
      database: connected ? 'connected' : 'disconnected',
      time: new Date().toISOString(),
    });
  });
  app.use('/api', apiLimiter, authenticate, apiRoutes);
  app.use('/api', notFound);

  // Serve the built React app (client/dist) from the same server in production.
  const indexHtml = path.join(CLIENT_DIST, 'index.html');
  if (serveClient && existsSync(indexHtml)) {
    app.use(
      express.static(CLIENT_DIST, {
        index: false,
        setHeaders(res, filePath) {
          const isHashedAsset = filePath.includes(`${path.sep}assets${path.sep}`);
          res.setHeader('Cache-Control', isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache');
        },
      }),
    );
    // Any other path is a page of the single-page app.
    app.get('/{*path}', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(indexHtml);
    });
  } else {
    app.get('/', (_req, res) => {
      res
        .type('text')
        .send(
          'RaktSetu API is running. Start the website with "npm run dev" (port 5173) or build it with "npm run build".',
        );
    });
  }

  app.use(errorHandler);
  return app;
}
