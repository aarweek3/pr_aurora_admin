// sample-control.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoggingService } from '@core/services/logging/logging.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Subject, takeUntil } from 'rxjs';
import { SampleModalComponent } from '../sample-manager/components/sample-modal/sample-modal.component';
import { SampleState } from '../sample-manager/models/sample-state.model';
import {
  SampleCreateRequestDto,
  SampleUpdateRequestDto,
} from '../sample-manager/models/sample.dto';
import { SampleService } from '../sample-manager/services/sample.service';

interface Sample {
  id: number;
  name: string;
}

@Component({
  selector: 'app-sample-control',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule,
    SampleModalComponent,
  ],
  template: `
    <div class="sample-control">
      <nz-select
        [(ngModel)]="selectedSampleId"
        (ngModelChange)="onSampleChange($event)"
        nzPlaceHolder="�������� ��������"
        nzShowSearch
      >
        <nz-option
          *ngFor="let sample of samples"
          [nzValue]="sample.id"
          [nzLabel]="sample.name"
        ></nz-option>
      </nz-select>
      <button nz-button nzType="primary" nzShape="circle" (click)="onAddClick()">
        <span nz-icon nzType="plus"></span>
      </button>
    </div>
    <app-sample-modal
      [visible]="modalVisible"
      [mode]="'add'"
      [sample]="null"
      (save)="onModalSave($event)"
      (cancel)="onModalCancel()"
    ></app-sample-modal>
  `,
  styles: [
    `
      .sample-control {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .sample-control nz-select {
        flex: 1;
      }
    `,
  ],
})
export class SampleControlComponent implements OnInit, OnDestroy {
  @Output() sampleSelected = new EventEmitter<Sample>();

  samples: Sample[] = [];
  selectedSampleId: number | null = null;
  modalVisible = false;

  private destroy$ = new Subject<void>();
  private readonly sampleService = inject(SampleService);
  private readonly logger = inject(LoggingService);

  ngOnInit(): void {
    this.logger.debug('SampleControlComponent', '������������� ����������');
    this.loadSamples();
    this.subscribeToModalOperations();
  }

  ngOnDestroy(): void {
    this.logger.debug('SampleControlComponent', '������� ��������');
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSamples(): void {
    this.logger.debug('SampleControlComponent', '�������� ���������');

    this.sampleService
      .getAllSamplesForSelector()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (samples) => {
          this.logger.debug('SampleControlComponent', '�������� ��������', {
            samples,
          });
          this.samples = samples;
          this.ensureDefaultSample();
          this.selectDefaultSample();
        },
        error: (error) => {
          this.logger.error('SampleControlComponent', '������ ��� �������� ���������', { error });
          this.samples = [{ id: 1, name: 'default' }];
          this.selectDefaultSample();
        },
      });
  }

  private ensureDefaultSample(): void {
    const hasDefaultSample = this.samples.some((cat) => cat.id === 1 && cat.name === 'default');

    if (this.samples.length === 0 || !hasDefaultSample) {
      this.samples.unshift({ id: 1, name: 'default' });
    }
  }

  private selectDefaultSample(): void {
    const defaultSample = this.samples.find((cat) => cat.id === 1 && cat.name === 'default');
    if (defaultSample && !this.selectedSampleId) {
      this.selectedSampleId = defaultSample.id;
      this.sampleSelected.emit(defaultSample);
      this.logger.debug('SampleControlComponent', '������ default ��������', {
        sample: defaultSample,
      });
    }
  }

  onSampleChange(sampleId: number): void {
    const selectedSample = this.samples.find((cat) => cat.id === sampleId);
    if (selectedSample) {
      this.logger.debug('SampleControlComponent', '������� ��������', {
        sample: selectedSample,
      });
      this.sampleSelected.emit(selectedSample);
    }
  }

  onAddClick(): void {
    this.logger.debug('SampleControlComponent', '�������� ���������� ���� �������� ��������');
    this.modalVisible = true;
  }

  onModalCancel(): void {
    this.logger.debug('SampleControlComponent', '������ �������� ��������');
    this.modalVisible = false;
  }

  onModalSave(data: {
    mode: 'add' | 'edit';
    sample: SampleCreateRequestDto | SampleUpdateRequestDto;
  }): void {
    this.logger.debug('SampleControlComponent', '���������� ��������', {
      data,
    });

    if (data.mode === 'add') {
      const createRequest = data.sample as SampleCreateRequestDto;
      this.logger.debug('SampleControlComponent', '�������� ������� �� �������� ��������', {
        createRequest,
      });
      this.sampleService.createSample(createRequest);
    } else {
      const updateRequest = data.sample as SampleUpdateRequestDto;
      this.logger.debug('SampleControlComponent', '�������� ������� �� ���������� ��������', {
        updateRequest,
      });
      this.sampleService.updateSample(updateRequest.id, updateRequest);
    }
  }

  private subscribeToModalOperations(): void {
    this.sampleService
      .getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: SampleState) => {
        this.logger.debug('SampleControlComponent', '��������� ��������� ��������', {
          modalIsLoading: state.modalIsLoading,
          modalOperation: state.modalOperation,
          modalError: state.modalError,
        });

        if (
          !state.modalIsLoading &&
          !state.modalError &&
          state.modalOperation === null &&
          this.modalVisible
        ) {
          this.logger.debug(
            'SampleControlComponent',
            '�������� ������� �������, ������������� ������',
          );
          this.sampleService
            .getAllSamplesForSelector()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (samples) => {
                this.logger.debug('SampleControlComponent', '������ ��������� ��������', {
                  samples,
                });
                this.samples = samples;
                this.ensureDefaultSample();
                this.selectNewestSample();
                this.modalVisible = false;
              },
              error: (error) => {
                this.logger.error(
                  'SampleControlComponent',
                  '������ ��� ���������� ������ ���������',
                  { error },
                );
                this.modalVisible = false;
              },
            });
        } else if (state.modalError) {
          this.logger.error('SampleControlComponent', '������ ��� �������� ��������', {
            error: state.modalError,
          });
        }
      });
  }

  private selectNewestSample(): void {
    if (this.samples.length > 0) {
      const newestSample = this.samples.reduce((prev, current) =>
        prev.id > current.id ? prev : current,
      );
      this.logger.debug('SampleControlComponent', '����� ������ �������� ', {
        sample: newestSample,
      });
      this.selectedSampleId = newestSample.id;
      this.sampleSelected.emit(newestSample);
    }
  }
}
