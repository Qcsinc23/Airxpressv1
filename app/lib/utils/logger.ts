// app/lib/utils/logger.ts

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
  requestId?: string;
  stack?: string;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp;
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const userId = entry.userId ? ` [user:${entry.userId}]` : '';
    const requestId = entry.requestId ? ` [req:${entry.requestId}]` : '';
    
    return `[${timestamp}] ${levelName}${userId}${requestId}: ${entry.message}${context}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private createLogEntry(
    level: LogLevel, 
    message: string, 
    context?: any, 
    userId?: string, 
    requestId?: string
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId,
      requestId,
    };

    if (level === LogLevel.ERROR && context instanceof Error) {
      entry.stack = context.stack;
    }

    return entry;
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const formattedMessage = this.formatMessage(entry);

    // Console output
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        if (entry.stack) {
          console.error(entry.stack);
        }
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
    }

    // In production, send to monitoring service
    if (!this.isDevelopment && entry.level <= LogLevel.WARN) {
      this.sendToMonitoring(entry);
    }
  }

  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    try {
      // TODO: Implement monitoring service integration
      // Examples:
      // - Send to Sentry for error tracking
      // - Send to DataDog, New Relic, etc. for logging
      // - Send to custom logging service
      
      if (entry.level === LogLevel.ERROR) {
        // await Sentry.captureException(entry.context instanceof Error ? entry.context : new Error(entry.message), {
        //   tags: {
        //     userId: entry.userId,
        //     requestId: entry.requestId,
        //   },
        //   extra: entry.context instanceof Error ? {} : entry.context,
        // });
      }
    } catch (error) {
      console.error('Failed to send log to monitoring service:', error);
    }
  }

  error(message: string, context?: any, userId?: string, requestId?: string): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, userId, requestId);
    this.log(entry);
  }

  warn(message: string, context?: any, userId?: string, requestId?: string): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context, userId, requestId);
    this.log(entry);
  }

  info(message: string, context?: any, userId?: string, requestId?: string): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context, userId, requestId);
    this.log(entry);
  }

  debug(message: string, context?: any, userId?: string, requestId?: string): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, userId, requestId);
    this.log(entry);
  }

  // Convenience methods for common patterns
  apiRequest(method: string, path: string, userId?: string, requestId?: string): void {
    this.info(`${method} ${path}`, undefined, userId, requestId);
  }

  apiResponse(method: string, path: string, statusCode: number, duration: number, userId?: string, requestId?: string): void {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    const message = `${method} ${path} - ${statusCode} (${duration}ms)`;
    
    if (level === LogLevel.WARN) {
      this.warn(message, { statusCode, duration }, userId, requestId);
    } else {
      this.info(message, { statusCode, duration }, userId, requestId);
    }
  }

  paymentEvent(event: string, paymentIntentId: string, amount?: number, userId?: string): void {
    this.info(`Payment ${event}`, { paymentIntentId, amount }, userId);
  }

  bookingEvent(event: string, bookingId: string, userId?: string): void {
    this.info(`Booking ${event}`, { bookingId }, userId);
  }

  carrierWebhook(carrier: string, event: string, trackingNumber: string): void {
    this.info(`${carrier} webhook: ${event}`, { trackingNumber });
  }

  securityEvent(event: string, userId?: string, ip?: string, userAgent?: string): void {
    this.warn(`Security event: ${event}`, { ip, userAgent }, userId);
  }

  performanceMetric(metric: string, value: number, unit: string, context?: any): void {
    this.info(`Performance: ${metric} = ${value}${unit}`, context);
  }

  validationError(schema: string, errors: any, userId?: string, requestId?: string): void {
    this.warn(`Validation failed for ${schema}`, errors, userId, requestId);
  }

  externalApiCall(service: string, endpoint: string, duration: number, success: boolean): void {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    const message = `External API: ${service} ${endpoint} (${duration}ms)`;
    
    if (level === LogLevel.WARN) {
      this.warn(message, { service, endpoint, duration, success });
    } else {
      this.info(message, { service, endpoint, duration, success });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export middleware for request logging
export function requestLogger(req: any, res: any, next: any): void {
  const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  // Add request ID to request object
  req.requestId = requestId;
  
  // Log incoming request
  logger.apiRequest(req.method, req.url, req.auth?.userId, requestId);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = Date.now() - startTime;
    logger.apiResponse(req.method, req.url, res.statusCode, duration, req.auth?.userId, requestId);
    originalEnd.apply(res, args);
  };
  
  next();
}