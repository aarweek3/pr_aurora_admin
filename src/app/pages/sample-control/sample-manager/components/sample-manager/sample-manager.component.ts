import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import {
  SampleCreateRequestDto,
  SampleUpdateRequestDto,
  SampleDetailDto,
} from '../../models/sample.dto';
import { SampleHeaderComponent } from '../sample-header/sample-header.component';
import { SampleSearchComponent } from '../sample-search/sample-search.component';
import { SampleTableComponent } from '../sample-table/sample-table.component';
import { SamplePaginationComponent } from '../sample-pagination/sample-pagination.component';
import { SampleViewComponent } from '../sample-view/sample-view.component';
import { SampleModalComponent } from '../sample-modal/sample-modal.component';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SampleState } from '../../models/sample-state.model';
import { SampleService } from '../../services/sample.service';
import { SampleModalService } from '../../services/sample-modal.service';

@Component({
  selector: 'app-sample-manager',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    SampleHeaderComponent,
    SampleSearchComponent,
    SampleTableComponent,
    SamplePaginationComponent,
    SampleViewComponent,
    SampleModalComponent,
  ],
  template: `
    <div nz-row [nzGutter]="16">
      <div nz-col nzSpan="24">
        <app-sample-header
          [total]="(state$ | async)?.total || 0"
          (refresh)="onRefresh()"
          (create)="onCreate()"
        >
        </app-sample-header>
      </div>
      <div nz-col nzSpan="24">
        <app-sample-search
          [searchTerm]="(state$ | async)?.searchTerm || ''"
          (searchChange)="onSearch($event)"
        >
        </app-sample-search>
      </div>
      <div nz-col nzSpan="24">
        <app-sample-table
          [items]="(state$ | async)?.items || []"
          [loading]="(state$ | async)?.loading || false"
          [hasError]="(state$ | async)?.error !== null"
          (view)="onView($event)"
          (edit)="onEdit($event)"
          (delete)="onDelete($event)"
        >
        </app-sample-table>
      </div>
      <div nz-col nzSpan="24">
        <app-sample-pagination
          [total]="(state$ | async)?.total || 0"
          [pageNumber]="(state$ | async)?.pageNumber || 1"
          [pageSize]="(state$ | async)?.pageSize || 10"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)"
        >
        </app-sample-pagination>
      </div>
    </div>
    <app-sample-view
      [visible]="(state$ | async)?.viewModalVisible || false"
      [sample]="(state$ | async)?.selectedSample || null"
      (close)="onCloseView()"
    >
    </app-sample-view>
    <app-sample-modal
      [visible]="(state$ | async)?.editModalVisible || false"
      [mode]="(state$ | async)?.editModalMode || 'add'"
      [sample]="(state$ | async)?.editingSample || null"
      (save)="onSave($event)"
      (cancel)="onCloseEdit()"
    >
    </app-sample-modal>
  `,
})
export class SampleManagerComponent implements OnInit, OnDestroy {
  state$: Observable<SampleState>;
  private destroy$ = new Subject<void>();
  private sampleService = inject(SampleService);
  private sampleModalService = inject(SampleModalService);

  constructor() {
    this.state$ = this.sampleService.getState();
  }

  ngOnInit(): void {
    console.log('SampleManager ngOnInit - запуск');
    this.sampleService.loadSamples();
  }

  ngOnDestroy(): void {
    console.log('SampleManager ngOnDestroy - очистка ресурсов');
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRefresh(): void {
    this.sampleService.refreshSamples();
  }

  onCreate(): void {
    this.sampleModalService.showCreateModal();
  }

  onSearch(searchTerm: string): void {
    this.sampleService.searchSamples(searchTerm);
  }

  onPageChange(pageNumber: number): void {
    this.sampleService.changePage(pageNumber);
  }

  onPageSizeChange(pageSize: number): void {
    this.sampleService.changePageSize(pageSize);
  }

  onView(id: number): void {
    this.sampleService.viewSample(id);
  }

  onEdit(sample: SampleDetailDto): void {
    this.sampleModalService.showEditModal(sample);
  }

  onDelete(id: number): void {
    this.sampleService.deleteSample(id);
  }

  onCloseView(): void {
    this.sampleService.closeViewModal();
  }

  onCloseEdit(): void {
    this.sampleModalService.closeModal();
  }

  onSave(data: {
    mode: 'add' | 'edit';
    sample: SampleCreateRequestDto | SampleUpdateRequestDto;
  }): void {
    if (data.mode === 'add') {
      this.sampleService.createSample(
        data.sample as SampleCreateRequestDto
      );
    } else {
      const updateRequest = data.sample as SampleUpdateRequestDto;
      this.sampleService.updateSample(updateRequest.id, updateRequest);
    }
  }
}
