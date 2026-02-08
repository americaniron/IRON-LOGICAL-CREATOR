import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  env: string;
  port: number;
  database: {
    url: string;
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    poolMin: number;
    poolMax: number;
    ssl: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  session: {
    secret: string;
  };
  bcrypt: {
    rounds: number;
  };
  cors: {
    origin: string[];
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  trustProxy: boolean;
  baseUrl: string;
  publicUrl: string;
  logLevel: string;
  admin: {
    defaultPin: string;
    defaultName: string;
    initialCredits: number;
  };
}

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SESSION_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Validate JWT_SECRET length
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long for security');
}

const config: Config = {
  env: process.env.NODE_ENV || process.env.APP_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    url: process.env.DATABASE_URL!,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'iron_logical_creator',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
    ssl: process.env.DB_SSL === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: '7d', // 7 days for persistent sessions
  },
  session: {
    secret: process.env.SESSION_SECRET!,
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },
  cors: {
    origin: (process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map(o => o.trim()),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  trustProxy: process.env.TRUST_PROXY === 'true',
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`,
  publicUrl: process.env.PUBLIC_URL || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',
  admin: {
    defaultPin: process.env.ADMIN_DEFAULT_PIN || '01970',
    defaultName: process.env.ADMIN_DEFAULT_NAME || 'COMMANDER_Z',
    initialCredits: parseInt(process.env.ADMIN_INITIAL_CREDITS || '999999', 10),
  },
};

// Production-specific validations
if (config.env === 'production') {
  if (config.jwt.secret.length < 64) {
    console.warn('WARNING: In production, JWT_SECRET should be at least 64 characters for optimal security');
  }
  
  if (config.admin.defaultPin === '01970') {
    console.warn('WARNING: Using default admin PIN in production. Change ADMIN_DEFAULT_PIN immediately!');
  }
  
  if (!config.database.ssl && !config.database.url.includes('localhost')) {
    console.warn('WARNING: Database SSL is disabled for non-localhost connection');
  }
}

export default config;
