import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import config from '../config';

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Needed for Vite dev mode
      styleSrc: ["'self'", "'unsafe-inline'"], // Needed for React inline styles
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://generativelanguage.googleapis.com', 'https://api.openai.com'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", 'blob:'],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow loading external resources
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    features: {
      camera: ["'none'"],
      microphone: ["'self'"], // App uses microphone for live conversation
      geolocation: ["'none'"],
      payment: ["'none'"],
    },
  },
});

// Sanitize output to prevent XSS
export const sanitizeOutput = (data: any): any => {
  if (typeof data === 'string') {
    return data
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeOutput);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeOutput(value);
    }
    return sanitized;
  }
  
  return data;
};

// Input validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  // More robust sanitization to prevent XSS and injection attacks
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove all script tags and event handlers more thoroughly
      let sanitized = obj;
      
      // Remove script tags (including with spaces and variations)
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, '');
      sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gis, '');
      
      // Remove all javascript: protocols
      sanitized = sanitized.replace(/javascript:/gi, '');
      sanitized = sanitized.replace(/data:/gi, '');
      sanitized = sanitized.replace(/vbscript:/gi, '');
      
      // Remove all event handlers (on* attributes) more thoroughly
      sanitized = sanitized.replace(/\s*on\w+\s*=/gi, '');
      
      // Remove potentially dangerous HTML tags
      sanitized = sanitized.replace(/<iframe[^>]*>.*?<\/iframe>/gis, '');
      sanitized = sanitized.replace(/<object[^>]*>.*?<\/object>/gis, '');
      sanitized = sanitized.replace(/<embed[^>]*>/gi, '');
      
      return sanitized;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = sanitize(value);
      }
      return result;
    }
    
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query) as any;
  if (req.params) req.params = sanitize(req.params);

  next();
};

// Prevent common attacks
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Remove server signature
  res.removeHeader('X-Powered-By');
  
  // Add additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // In production, enforce HTTPS (only when behind proxy)
  if (config.env === 'production' && config.trustProxy) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
  } else if (config.env === 'production' && !config.trustProxy) {
    // When not behind proxy, check req.protocol
    if (req.protocol !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
  }
  
  next();
};
