import express, { Request, Response } from 'express';
import db from '../config/database';
import config from '../config';

const router = express.Router();

// Health check - liveness probe
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// Readiness check - verifies database connectivity
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const isDbHealthy = await db.isHealthy();
    
    if (!isDbHealthy) {
      return res.status(503).json({
        status: 'NOT_READY',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'OK',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
