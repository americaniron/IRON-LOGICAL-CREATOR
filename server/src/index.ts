import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import config from './config';
import db from './config/database';
import { UserModel } from './models/User';

// Middleware
import { securityHeaders, securityMiddleware, validateInput } from './middleware/security';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Routes
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import userRoutes from './routes/user';

const app: Application = express();

// Trust proxy when behind Cloudflare or other reverse proxies
if (config.trustProxy) {
  app.set('trust proxy', true);
  console.log('✅ Trust proxy enabled for Cloudflare compatibility');
}

// Security middleware (must be first)
app.use(securityMiddleware);
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (config.cors.origin.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input validation and sanitization
app.use(validateInput);

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api', apiLimiter);

// Health check routes (no rate limiting)
app.use('/', healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// API info endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    name: 'Iron Logical Creator API',
    version: '1.0.0',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting Iron Logical Creator Server...');
    console.log(`Environment: ${config.env}`);
    
    // Test database connection
    const dbHealthy = await db.testConnection();
    if (!dbHealthy) {
      throw new Error('Database connection failed');
    }

    // Initialize admin user
    await UserModel.initializeAdmin();

    // Start listening
    const server = app.listen(config.port, () => {
      console.log(`✅ Server running on port ${config.port}`);
      console.log(`✅ Health check: ${config.baseUrl}/health`);
      console.log(`✅ Readiness check: ${config.baseUrl}/ready`);
      console.log(`✅ API endpoint: ${config.baseUrl}/api`);
      
      if (config.env === 'production') {
        console.log('⚠️  Production mode - Ensure all environment variables are properly set!');
      }
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('\n🔄 Received shutdown signal, closing gracefully...');
      
      server.close(async () => {
        console.log('✅ HTTP server closed');
        
        try {
          await db.close();
          console.log('✅ Database connections closed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force close after 30 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
