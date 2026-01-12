import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-sample-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzGridModule,
    NzInputModule,
    NzIconModule,
  ],
  template: `
    <div nz-row [nzGutter]="16" class="search-container">
      <div nz-col nzSpan="24">
        <nz-input-group nzSuffixIcon="search">
          <input
            nz-input
            placeholder="Поиск по названию"
            [(ngModel)]="currentSearchTerm"
            (ngModelChange)="onModelChange()"
          />
          <span
            *ngIf="currentSearchTerm && currentSearchTerm.length > 0"
            class="clear-search-icon"
            (click)="clearSearch()"
            title="Очистить поиск"
          >
            <i nz-icon nzType="close-circle" nzTheme="fill"></i>
          </span>
        </nz-input-group>
      </div>
    </div>
  `,
  styles: [
    `
      .search-container {
        margin-bottom: 16px;
      }
      .clear-search-icon {
        position: absolute;
        right: 32px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;
        cursor: pointer;
        color: #bfbfbf;
        transition: color 0.2s ease;
      }
      .clear-search-icon:hover {
        color: #ff4d4f;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SampleSearchComponent implements OnInit, OnChanges, OnDestroy {
  @Input() searchTerm: string = '';
  @Output() searchChange = new EventEmitter<string>();

  // Изменяем тип, чтобы явно разрешить null и undefined
  currentSearchTerm: string | null | undefined = '';

  private destroy$ = new Subject<void>();
  private searchTerm$ = new Subject<string>();

  ngOnInit(): void {
    if (typeof this.searchTerm === 'string') {
      this.currentSearchTerm = this.searchTerm;
    }

    this.searchTerm$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        // Убеждаемся, что значение не null и не undefined перед отправкой
        this.searchChange.emit(this.currentSearchTerm || '');
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['searchTerm'] &&
      !changes['searchTerm'].firstChange &&
      typeof this.searchTerm === 'string'
    ) {
      this.currentSearchTerm = this.searchTerm;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onModelChange(): void {
    // Вводим явную проверку перед передачей значения
    if (typeof this.currentSearchTerm === 'string') {
      this.searchTerm$.next(this.currentSearchTerm);
    }
  }

  clearSearch(): void {
    this.currentSearchTerm = '';
    this.searchChange.emit(this.currentSearchTerm);
  }
}
