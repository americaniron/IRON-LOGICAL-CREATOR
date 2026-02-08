import { Request, Response, NextFunction } from 'express';
import config from '../config';

// Simple structured logging
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    const levelMap: { [key: string]: LogLevel } = {
      error: LogLevel.ERROR,
      warn: LogLevel.WARN,
      info: LogLevel.INFO,
      debug: LogLevel.DEBUG,
    };
    this.logLevel = levelMap[config.logLevel] || LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private log(level: LogLevel, message: string, meta?: any) {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(meta && { meta }),
    };

    // In production, this would go to a logging service
    // For now, output to console in structured format
    const output = JSON.stringify(logEntry);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.INFO:
        console.info(output);
        break;
      case LogLevel.DEBUG:
        console.debug(output);
        break;
    }
  }

  error(message: string, meta?: any) {
    this.log(LogLevel.ERROR, message, meta);
  }

  warn(message: string, meta?: any) {
    this.log(LogLevel.WARN, message, meta);
  }

  info(message: string, meta?: any) {
    this.log(LogLevel.INFO, message, meta);
  }

  debug(message: string, meta?: any) {
    this.log(LogLevel.DEBUG, message, meta);
  }
}

export const logger = new Logger();

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.socket.remoteAddress,
    };

    if (res.statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};
