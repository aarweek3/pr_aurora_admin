// src/app/core/services/command/command.service.ts
import { Injectable, inject } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CommandHandler, CommandResult, ICommandService } from '../../models/command.model';
import { ContextService } from '../context/context.service';
import { EventBusService } from '../event-bus/event-bus.service';

@Injectable({
  providedIn: 'root',
})
export class CommandService implements ICommandService {
  private contextService = inject(ContextService);
  private eventBus = inject(EventBusService);

  private readonly handlers = new Map<string, CommandHandler>();
  // LoggingService пока пропустим, будем использовать console
  private readonly contextName = 'CommandService';

  register<T = any, R = any>(commandId: string, handler: CommandHandler<T, R>): void {
    if (this.handlers.has(commandId)) {
      console.warn(`[${this.contextName}] Command ${commandId} already registered`);
      return;
    }

    this.handlers.set(commandId, handler);
    // console.info(`[${this.contextName}] Command registered: ${commandId}`);
  }

  execute<T = any, R = any>(commandId: string, payload: T): Observable<CommandResult<R>> {
    // 1. Валидация существования
    const handler = this.handlers.get(commandId);
    if (!handler) {
      return throwError(() => new Error(`Command ${commandId} not registered`));
    }

    // 2. Валидация доступности
    if (!this.isAvailable(commandId)) {
      return throwError(() => new Error(`Command ${commandId} not available`));
    }

    // 3. Получить контекст (Snapshot)
    const context = this.contextService.getContext();

    // 4. Опубликовать событие начала
    this.eventBus.publish({
      type: 'commandRequested',
      payload: { commandId, payload },
      source: this.contextName,
    });

    // 5. Выполнить команду
    const result$ = from(handler(payload, context)).pipe(
      map((data) => ({ success: true, data }) as CommandResult<R>),
      catchError((error) => {
        // Опубликовать событие ошибки
        this.eventBus.publish({
          type: 'commandFailed',
          payload: { commandId, error },
          source: this.contextName,
        });

        console.error(`[${this.contextName}] Command failed:`, error);
        return of({ success: false, error } as CommandResult<R>);
      }),
      tap((result) => {
        if (result.success) {
          // Опубликовать событие успеха
          this.eventBus.publish({
            type: 'commandCompleted',
            payload: { commandId, result: result.data },
            source: this.contextName,
          });
        }
      }),
    );

    return result$;
  }

  isAvailable(commandId: string): boolean {
    const context = this.contextService.getContext();

    // 1. Проверка блокировок
    if (context.operationalState.locks.length > 0) {
      return false;
    }

    // 2. Проверка режима readonly
    if (context.activeArea?.mode === 'readonly') {
      // Некоторые команды могут быть доступны в readonly (например, 'refresh', 'export')
      // Но по умолчанию блокируем все модифицирующие.
      // В v1.0 пока простое правило: если readonly, то (возможно) недоступно.
      // TODO: Добавить метаданные к командам (isReadOnlySafe)
      if (['save', 'delete', 'create', 'update'].includes(commandId)) {
        return false;
      }
    }

    // 3. Проверка backend
    if (!context.operationalState.backendAvailable) {
      return false;
    }

    return true;
  }

  getRegisteredCommands(): string[] {
    return Array.from(this.handlers.keys());
  }
}
