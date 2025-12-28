import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogEntry } from '../models/logger-console.model';
import { LoggerConsoleService } from '../services/logger-console.service';

@Injectable()
export class LoggerInterceptor implements HttpInterceptor {
  constructor(private loggerService: LoggerConsoleService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = Date.now();

    // Игнорируем фоновые запросы (например, от HMR или ассетов)
    if (req.url.includes('@vite') || req.url.includes('node_modules') || req.url.includes('.svg')) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const duration = Date.now() - startTime;
            this.logResponse(req, event, duration);
          }
        },
        error: (error: HttpErrorResponse) => {
          const duration = Date.now() - startTime;
          this.logError(req, error, duration);
        },
      }),
    );
  }

  private logResponse(req: HttpRequest<any>, res: HttpResponse<any>, duration: number): void {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level: 'info',
      type: 'http',
      prefix: '[HTTP]',
      message: `${req.method} ${req.url}`,
      httpDetails: {
        method: req.method,
        url: req.url,
        statusCode: res.status,
        statusText: res.statusText,
        duration: duration,
      },
      data: [
        req.body ? { 'Request Body': req.body } : null,
        res.body ? { 'Response Body': res.body } : null,
      ].filter((x): x is any => x !== null),
    };

    this.loggerService.addEntry(entry);
  }

  private logError(req: HttpRequest<any>, error: HttpErrorResponse, duration: number): void {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level: 'error',
      type: 'http',
      prefix: '[HTTP]',
      message: `${req.method} ${req.url}`,
      httpDetails: {
        method: req.method,
        url: req.url,
        statusCode: error.status,
        statusText: error.statusText,
        duration: duration,
      },
      data: [
        req.body ? { 'Request Body': req.body } : null,
        { Error: error.message, Details: error.error },
      ].filter((x): x is any => x !== null),
    };
    this.loggerService.addEntry(entry);
  }
}
