import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { LanguageAggregator, LanguageAggregatorState } from '../models/language-aggregator.model';
import { LanguageAggregatorApiService } from './language-aggregator-api.service';

/**
 * Сервис управления состоянием языков агрегатора.
 */
@Injectable({
  providedIn: 'root',
})
export class LanguageAggregatorService {
  private apiService = inject(LanguageAggregatorApiService);

  // --- Состояние (Signals) ---
  private state = signal<LanguageAggregatorState>({
    all: [],
    available: [],
    current: null,
    isLoading: false,
    error: null,
  });

  // --- Селекторы (Computed) ---
  allLanguages = computed(() => this.state().all);
  availableLanguages = computed(() => this.state().available);
  currentLanguage = computed(() => this.state().current);
  isLoading = computed(() => this.state().isLoading);
  error = computed(() => this.state().error);

  /**
   * Загрузить все языки (для админки)
   */
  refreshList(): void {
    this.setLoading(true);
    this.apiService
      .getAll()
      .pipe(
        tap((all) => this.state.update((s) => ({ ...s, all, error: null }))),
        finalize(() => this.setLoading(false)),
      )
      .subscribe({
        error: (err) => this.setError('Ошибка при загрузке списка языков'),
      });
  }

  /**
   * Загрузить только доступные языки
   */
  loadAvailable(): void {
    this.setLoading(true);
    this.apiService
      .getAvailable()
      .pipe(
        tap((available) => this.state.update((s) => ({ ...s, available, error: null }))),
        finalize(() => this.setLoading(false)),
      )
      .subscribe({
        error: (err) => this.setError('Ошибка при загрузке активных языков'),
      });
  }

  /**
   * Установить текущий язык
   */
  setCurrent(language: LanguageAggregator): void {
    this.state.update((s) => ({ ...s, current: language }));
  }

  // --- Приватные методы управления состоянием ---

  private setLoading(isLoading: boolean): void {
    this.state.update((s) => ({ ...s, isLoading }));
  }

  private setError(error: string | null): void {
    this.state.update((s) => ({ ...s, error }));
  }
}
