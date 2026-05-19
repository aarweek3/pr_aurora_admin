import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { TagOfAggregatorListComponent } from './components/tag-of-aggregator-list/tag-of-aggregator-list.component';
import { TagOfAggregatorFormComponent } from './components/tag-of-aggregator-form/tag-of-aggregator-form.component';
import { TagOfAggregatorViewModalComponent } from './components/tag-of-aggregator-view-modal/tag-of-aggregator-view-modal.component';
import { TagOfAggregatorStateService } from './services/tag-of-aggregator-state.service';
import { TagOfAggregatorDetail } from './models/tag-of-aggregator.model';

@Component({
  selector: 'app-tag-of-aggregator-manager',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzRadioModule,
    NzModalModule,
    TagOfAggregatorListComponent,
    TagOfAggregatorFormComponent,
    TagOfAggregatorViewModalComponent,
  ],
  template: `
    <div class="manager-container">
      <div class="manager-header">
        <div class="header-left">
          <h1>
            Менеджер Тегов <span class="total">Всего: {{ state.total() }}</span>
          </h1>
          <p class="subtitle">Управление тегами и иерархией агрегатора (SEO Ready)</p>
        </div>
        <div class="header-right">
          <nz-radio-group
            [ngModel]="viewMode()"
            (ngModelChange)="setViewMode($event)"
            nzButtonStyle="solid"
          >
            <label nz-radio-button nzValue="modal">Модалка</label>
            <label nz-radio-button nzValue="split">Инлайн (Split)</label>
            <label nz-radio-button nzValue="page">Отдельная страница</label>
          </nz-radio-group>
        </div>
      </div>

      <div class="manager-content" [class.split-layout]="viewMode() === 'split'">
        <div class="list-section">
          <app-tag-of-aggregator-list (add)="state.openEditModal()"></app-tag-of-aggregator-list>
        </div>

        <div class="split-view" *ngIf="viewMode() === 'split' && state.selectedId()">
          <app-tag-of-aggregator-form
            [tag]="state.selectedId()"
            (save)="handleSave($event)"
            (cancel)="state.updateState({ selectedId: null })"
          ></app-tag-of-aggregator-form>
        </div>
      </div>

      <!-- MODALS (Like DeveloperOfAggregator) -->
      <app-tag-of-aggregator-view-modal></app-tag-of-aggregator-view-modal>

      <nz-modal
        [(nzVisible)]="isEditModalVisible"
        [nzTitle]="(state.selectedId() ? '✏️ Редактирование' : '✨ Создание') + ' тега'"
        [nzWidth]="1000"
        [nzFooter]="modalFooter"
        [nzMaskClosable]="false"
        (nzOnCancel)="state.closeEditModal()"
      >
        <ng-container *nzModalContent>
          <app-tag-of-aggregator-form
            #tagForm
            [tag]="state.selectedId()"
            (save)="handleSave($event)"
            (cancel)="state.closeEditModal()"
          ></app-tag-of-aggregator-form>
        </ng-container>

        <ng-template #modalFooter>
          <button nz-button nzType="default" (click)="state.closeEditModal()">Отмена</button>
          <button
            nz-button
            nzType="primary"
            [nzLoading]="state.modalLoading()"
            (click)="tagForm.submit()"
          >
            Сохранить тег
          </button>
        </ng-template>
      </nz-modal>
    </div>
  `,
  styleUrls: ['./tag-of-aggregator-manager.component.scss'],
})
export class TagOfAggregatorManagerComponent implements OnInit {
  public state = inject(TagOfAggregatorStateService);

  viewMode = signal<'modal' | 'split' | 'page'>('modal');

  get isEditModalVisible(): boolean {
    return this.state.editModalVisible();
  }
  set isEditModalVisible(v: boolean) {
    if (!v) this.state.closeEditModal();
  }

  ngOnInit(): void {
    this.state.loadItems();
  }

  @ViewChild('tagForm') tagForm!: TagOfAggregatorFormComponent;

  setViewMode(mode: 'modal' | 'split' | 'page'): void {
    this.viewMode.set(mode);
    this.state.updateState({ selectedId: null });
  }

  handleSave(dto: any): void {
    this.state.save(dto).subscribe(() => {
      this.state.closeEditModal();
    });
  }
}
