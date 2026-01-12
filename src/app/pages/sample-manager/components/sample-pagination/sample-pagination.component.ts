import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-sample-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule, NzPaginationModule, NzSelectModule],
  template: `
    <div
      style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;"
    >
      <div>
        <span style="margin-right: 8px;">Показать:</span>
        <nz-select
          [(ngModel)]="currentPageSize"
          (ngModelChange)="onPageSizeChange($event)"
          style="width: 80px;"
        >
          <nz-option
            *ngFor="let size of pageSizeOptions"
            [nzValue]="size"
            [nzLabel]="size.toString()"
          ></nz-option>
        </nz-select>
        <span style="margin-left: 8px;">записей на странице</span>
      </div>

      <nz-pagination
        [nzPageIndex]="pageNumber"
        [nzTotal]="total"
        [nzPageSize]="pageSize"
        [nzShowSizeChanger]="false"
        [nzShowQuickJumper]="true"
        (nzPageIndexChange)="pageChange.emit($event)"
      >
      </nz-pagination>
    </div>
  `,
})
export class SamplePaginationComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() total: number = 0;
  @Input() pageNumber: number = 1;
  @Input() pageSize: number = 10;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  pageSizeOptions = [10, 20, 50, 100];
  currentPageSize: number = 10;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    console.log('SamplePagination ngOnInit - инициализация');
    this.currentPageSize = this.pageSize;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Синхронизация currentPageSize при изменении pageSize извне
    if (changes['pageSize'] && !changes['pageSize'].firstChange) {
      this.currentPageSize = this.pageSize;
      console.log(
        'SamplePagination - синхронизация pageSize:',
        this.pageSize
      );
    }
  }

  ngOnDestroy(): void {
    console.log('SamplePagination ngOnDestroy - очистка ресурсов');
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageSizeChange(size: number): void {
    console.log('SamplePagination - изменение размера страницы:', size);
    this.pageSizeChange.emit(size);
  }
}
