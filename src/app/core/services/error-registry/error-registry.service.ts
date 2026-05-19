// src/app/core/services/error-registry/error-registry.service.ts
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import {
  ErrorFilter,
  ErrorLevel,
  ErrorSummary,
  IErrorRegistry,
  RegisteredError,
} from '../../models/error-registry.model';
import { EventBusService } from '../event-bus/event-bus.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorRegistryService implements IErrorRegistry {
  private eventBus = inject(EventBusService);

  private readonly errorsMap = new Map<string, RegisteredError>();
  private readonly errorsSubject = new BehaviorSubject<RegisteredError[]>([]);

  readonly errors$ = this.errorsSubject.asObservable();

  readonly summary$ = this.errors$.pipe(map((errors) => this.calculateSummary(errors)));

  // ===== REGISTRATION =====

  register(errorData: Omit<RegisteredError, 'registryId' | 'registeredAt' | 'lifecycle'>): string {
    const registryId = this.generateId();
    const error: RegisteredError = {
      ...errorData,
      registryId,
      lifecycle: 'active',
      registeredAt: new Date(),
    };

    this.errorsMap.set(registryId, error);
    this.updateSubject();

    this.eventBus.publish({
      type: 'errorRegistered',
      payload: error,
    });

    return registryId;
  }

  registerHttpError(errorResponse: HttpErrorResponse, contextId?: string): string {
    const level: ErrorLevel = errorResponse.status >= 500 ? 'global' : 'contextual';

    return this.register({
      level,
      source: 'http',
      contextId,
      originalError: errorResponse,
      message: errorResponse.message || 'Unknown HTTP Error',
      code: errorResponse.status.toString(),
      metadata: {
        url: errorResponse.url,
        status: errorResponse.status,
        statusText: errorResponse.statusText,
      },
    });
  }

  registerValidationError(fieldId: string, message: string, contextId: string): string {
    return this.register({
      level: 'local',
      source: 'validation',
      contextId,
      fieldId,
      originalError: message,
      message: message,
    });
  }

  // ===== RETRIEVAL =====

  get(registryId: string): RegisteredError | null {
    return this.errorsMap.get(registryId) || null;
  }

  getAll(filter?: ErrorFilter): RegisteredError[] {
    let errors = Array.from(this.errorsMap.values());

    if (filter) {
      errors = errors.filter((error) => this.applyFilter(error, filter));
    }

    return errors;
  }

  getSummary(filter?: ErrorFilter): ErrorSummary {
    const errors = this.getAll(filter).filter((e) => e.lifecycle === 'active');
    return this.calculateSummary(errors);
  }

  // ===== LIFECYCLE MANAGEMENT =====

  resolve(registryId: string): void {
    const error = this.errorsMap.get(registryId);
    if (error && error.lifecycle === 'active') {
      const updated = { ...error, lifecycle: 'resolved' as const, resolvedAt: new Date() };
      this.errorsMap.set(registryId, updated);
      this.updateSubject();

      this.eventBus.publish({
        type: 'errorResolved',
        payload: updated,
      });
    }
  }

  dismiss(registryId: string): void {
    const error = this.errorsMap.get(registryId);
    if (error && error.lifecycle === 'active') {
      const updated = { ...error, lifecycle: 'dismissed' as const, dismissedAt: new Date() };
      this.errorsMap.set(registryId, updated);
      this.updateSubject();

      this.eventBus.publish({
        type: 'errorCleared',
        payload: updated,
      });
    }
  }

  clear(filter: ErrorFilter): void {
    const errorsToRemove = this.getAll(filter);
    errorsToRemove.forEach((error) => {
      this.errorsMap.delete(error.registryId);
      // We might want to emit events here too, or just bulk clear
    });
    this.updateSubject();
  }

  clearContext(contextId: string): void {
    this.clear({ contextId });
    // Also clear validations associated with this context
  }

  clearAll(): void {
    this.errorsMap.clear();
    this.updateSubject();
  }

  // ===== HELPERS =====

  private updateSubject(): void {
    this.errorsSubject.next(Array.from(this.errorsMap.values()));
  }

  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }

  private applyFilter(error: RegisteredError, filter: ErrorFilter): boolean {
    if (filter.level) {
      const levels = Array.isArray(filter.level) ? filter.level : [filter.level];
      if (!levels.includes(error.level)) return false;
    }
    if (filter.source) {
      const sources = Array.isArray(filter.source) ? filter.source : [filter.source];
      if (!sources.includes(error.source)) return false;
    }
    if (filter.lifecycle) {
      const lifecycles = Array.isArray(filter.lifecycle) ? filter.lifecycle : [filter.lifecycle];
      if (!lifecycles.includes(error.lifecycle)) return false;
    }
    if (filter.contextId && error.contextId !== filter.contextId) return false;
    if (filter.fieldId && error.fieldId !== filter.fieldId) return false;
    if (filter.rowId && error.rowId !== filter.rowId) return false;

    return true;
  }

  private calculateSummary(errors: RegisteredError[]): ErrorSummary {
    const activeErrors = errors.filter((e) => e.lifecycle === 'active');

    const summary: ErrorSummary = {
      total: activeErrors.length,
      byLevel: {
        global: activeErrors.filter((e) => e.level === 'global').length,
        contextual: activeErrors.filter((e) => e.level === 'contextual').length,
        local: activeErrors.filter((e) => e.level === 'local').length,
      },
      bySeverity: {
        critical: 0,
        error: 0,
        warning: 0,
        info: 0,
      },
      highestSeverity: null,
    };

    // Calculate severity based on some logic (e.g. HTTP status or explicit metadata)
    // This is a simplified logic
    activeErrors.forEach((e) => {
      if (e.source === 'http' && e.originalError instanceof HttpErrorResponse) {
        if (e.originalError.status >= 500) summary.bySeverity.critical++;
        else if (e.originalError.status >= 400) summary.bySeverity.error++;
        else summary.bySeverity.info++;
      } else if (e.level === 'global') {
        summary.bySeverity.critical++;
      } else if (e.level === 'contextual') {
        summary.bySeverity.error++;
      } else {
        summary.bySeverity.warning++; // Validations are usually warnings or errors
      }
    });

    if (summary.bySeverity.critical > 0) summary.highestSeverity = 'critical';
    else if (summary.bySeverity.error > 0) summary.highestSeverity = 'error';
    else if (summary.bySeverity.warning > 0) summary.highestSeverity = 'warning';
    else if (summary.bySeverity.info > 0) summary.highestSeverity = 'info';

    return summary;
  }
}
