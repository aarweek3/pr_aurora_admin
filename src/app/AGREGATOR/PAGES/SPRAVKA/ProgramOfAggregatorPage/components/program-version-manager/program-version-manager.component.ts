import { 
  Component, 
  Input, 
  OnInit, 
  inject, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzResultModule } from 'ng-zorro-antd/result';

import { ProgramOfAggregatorApiService } from '../../services/program-of-aggregator-api.service';
import { 
  VersionOfAggregatorItem, 
  VersionOfAggregatorDetail,
  VersionOfAggregatorLocalization
} from '../../models/program-of-aggregator.model';
import { LanguageService } from '@assets/languageApp/services/language.service';
import { AppLanguage } from '@assets/languageApp/models/appLanguage.model';
import { VersionStatus } from '../../models/version-status.enum';
import { SystemRequirementManagerComponent } from '../../../SystemRequirementPage/system-requirement-manager.component';

@Component({
  selector: 'app-program-version-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzSwitchModule,
    NzSelectModule,
    NzTabsModule,
    NzSpaceModule,
    NzTagModule,
    NzDividerModule,
    NzEmptyModule,
    NzPopconfirmModule,
    NzResultModule,
    SystemRequirementManagerComponent
  ],
  template: `
    <div class="version-manager-container">
      <div class="header-actions">
        <h3>Управление версиями</h3>
        <button nz-button nzType="primary" (click)="openAddModal()">
          <i nz-icon nzType="plus"></i> Добавить версию
        </button>
      </div>

      <nz-table #basicTable [nzData]="versions" [nzLoading]="loading" [nzSize]="'middle'">
        <thead>
          <tr>
            <th>Версия</th>
            <th>Дата выхода</th>
            <th>Статус</th>
            <th>Последняя</th>
            <th>Ссылки</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          @for (data of basicTable.data; track data.id) {
            <tr>
              <td>
                <span class="version-number">{{ data.versionNumber }}</span>
              </td>
              <td>{{ data.releasedAt | date:'dd.MM.yyyy' }}</td>
              <td>
                <nz-tag [nzColor]="getStatusColor(data.status)">
                  {{ data.status }}
                </nz-tag>
              </td>
              <td>
                @if (data.isLatest) {
                  <nz-tag nzColor="gold">LATEST</nz-tag>
                }
              </td>
              <td>
                <nz-tag nzColor="blue">{{ data.downloadLinksCount }} links</nz-tag>
              </td>
              <td>
                <nz-space>
                  <button *nzSpaceItem nz-button nzType="default" nzSize="small" (click)="editVersion(data.id)">
                    <i nz-icon nzType="edit"></i>
                  </button>
                  <button *nzSpaceItem nz-button nzType="default" nzSize="small" nzDanger
                    nz-popconfirm
                    nzPopconfirmTitle="Вы уверены, что хотите удалить эту версию?"
                    (nzOnConfirm)="deleteVersion(data.id)">
                    <i nz-icon nzType="delete"></i>
                  </button>
                </nz-space>
              </td>
            </tr>
          }
        </tbody>
      </nz-table>

      <!-- Модальное окно редактирования/добавления -->
      <nz-modal 
        [(nzVisible)]="modalVisible" 
        [nzTitle]="modalTitle" 
        (nzOnCancel)="closeModal()" 
        (nzOnOk)="saveVersion()"
        [nzOkText]="currentVersionId ? 'Сохранить' : 'Создать и продолжить'"
        [nzOkLoading]="saving"
        nzWidth="900px"
      >
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="versionForm" nzLayout="vertical">
            <nz-tabset [nzAnimated]="false">
              <!-- ОСНОВНОЕ -->
              <nz-tab nzTitle="Основные сведения">
                <div class="modal-tab-content">
                  <div nz-row [nzGutter]="16">
                    <div nz-col nzSpan="12">
                      <nz-form-item>
                        <nz-form-label nzRequired>Номер версии</nz-form-label>
                        <nz-form-control nzErrorTip="Введите номер версии">
                          <input nz-input formControlName="versionNumber" placeholder="Напр: 1.0.5" />
                        </nz-form-control>
                      </nz-form-item>
                    </div>
                    <div nz-col nzSpan="12">
                      <nz-form-item>
                        <nz-form-label>Дата выхода</nz-form-label>
                        <nz-form-control>
                          <nz-date-picker formControlName="releasedAt" style="width: 100%"></nz-date-picker>
                        </nz-form-control>
                      </nz-form-item>
                    </div>
                    <div nz-col nzSpan="8">
                      <nz-form-item>
                        <nz-form-label>Статус</nz-form-label>
                        <nz-form-control>
                          <nz-select formControlName="status">
                            <nz-option [nzValue]="0" nzLabel="Stable"></nz-option>
                            <nz-option [nzValue]="1" nzLabel="Beta"></nz-option>
                            <nz-option [nzValue]="2" nzLabel="Alpha"></nz-option>
                            <nz-option [nzValue]="3" nzLabel="LTS"></nz-option>
                          </nz-select>
                        </nz-form-control>
                      </nz-form-item>
                    </div>
                    <div nz-col nzSpan="8">
                      <nz-form-item>
                        <nz-form-label>Последняя версия</nz-form-label>
                        <nz-form-control>
                          <nz-switch formControlName="isLatest"></nz-switch>
                        </nz-form-control>
                      </nz-form-item>
                    </div>
                    <div nz-col nzSpan="8">
                      <nz-form-item>
                        <nz-form-label>Порядок</nz-form-label>
                        <nz-form-control>
                          <input nz-input type="number" formControlName="sortOrder" />
                        </nz-form-control>
                      </nz-form-item>
                    </div>
                    <div nz-col nzSpan="24">
                      <nz-form-item>
                        <nz-form-label>URL Changelog (внешний)</nz-form-label>
                        <nz-form-control>
                          <input nz-input formControlName="externalChangelogUrl" placeholder="https://..." />
                        </nz-form-control>
                      </nz-form-item>
                    </div>
                  </div>
                </div>
              </nz-tab>

              <!-- ЛОКАЛИЗАЦИЯ -->
              <nz-tab nzTitle="Локализация">
                <div class="modal-tab-content">
                  <nz-tabset nzSize="small" [nzAnimated]="false">
                    @for (lang of languages; track lang.id; let i = $index) {
                      <nz-tab [nzTitle]="lang.nativeTitle">
                        <ng-template nz-tab>
                          @if (getLocGroup(lang.id); as locGroup) {
                            <div [formGroup]="locGroup">
                              <nz-form-item>
                                <nz-form-label>Список изменений ({{ lang.code }})</nz-form-label>
                                <nz-form-control>
                                  <textarea nz-input formControlName="changelog" [nzAutosize]="{ minRows: 4, maxRows: 8 }"></textarea>
                                </nz-form-control>
                              </nz-form-item>
                              <nz-form-item>
                                <nz-form-label>Описание версии</nz-form-label>
                                <nz-form-control>
                                  <textarea nz-input formControlName="description" [nzAutosize]="{ minRows: 2, maxRows: 4 }"></textarea>
                                </nz-form-control>
                              </nz-form-item>
                            </div>
                          }
                        </ng-template>
                      </nz-tab>
                    }
                  </nz-tabset>
                </div>
              </nz-tab>

              <!-- ТРЕБОВАНИЯ -->
              <nz-tab nzTitle="Системные требования" [nzDisabled]="!currentVersionId">
                <div class="modal-tab-content">
                  @if (currentVersionId) {
                    <app-system-requirement-manager 
                      [versionId]="currentVersionId" 
                      [platformId]="mainPlatformId">
                    </app-system-requirement-manager>
                  } @else {
                    <nz-empty nzNotFoundContent="Сохраните версию, чтобы управлять требованиями"></nz-empty>
                  }
                </div>
              </nz-tab>

              <!-- ССЫЛКИ -->
              <nz-tab nzTitle="Ссылки на скачивание" [nzDisabled]="!currentVersionId">
                <div class="modal-tab-content">
                  <nz-result nzStatus="info" nzTitle="Менеджер ссылок" nzSubTitle="Управление ссылками будет доступно в следующем обновлении (Шаг 4.1)">
                  </nz-result>
                </div>
              </nz-tab>
            </nz-tabset>
          </form>
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [`
    .version-manager-container { padding: 0; }
    .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .header-actions h3 { margin: 0; }
    .version-number { font-weight: bold; font-family: monospace; }
    .modal-tab-content { padding-top: 16px; min-height: 350px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgramVersionManagerComponent implements OnInit {
  @Input({ required: true }) programId!: number;
  @Input({ required: true }) mainPlatformId!: number;

  private api = inject(ProgramOfAggregatorApiService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private message = inject(NzMessageService);
  private langService = inject(LanguageService);

  versions: VersionOfAggregatorItem[] = [];
  loading = false;
  saving = false;

  modalVisible = false;
  modalTitle = 'Добавить версию';
  versionForm: FormGroup;
  currentVersionId: number | null = null;
  languages: AppLanguage[] = [];

  constructor() {
    this.versionForm = this.fb.group({
      id: [null],
      programOfAggregatorId: [null],
      versionNumber: ['', [Validators.required]],
      releasedAt: [null],
      isLatest: [false],
      sortOrder: [0],
      externalChangelogUrl: [''],
      status: [0],
      localizations: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadVersions();
    this.languages = this.langService.availableLanguages();
    this.initLocTabs();
  }

  loadVersions(): void {
    this.loading = true;
    this.api.getVersions(this.programId).subscribe({
      next: (data) => {
        this.versions = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => this.loading = false
    });
  }

  private initLocTabs(): void {
    const locs = this.versionForm.get('localizations') as FormArray;
    locs.clear();
    this.languages.forEach((lang) => {
      locs.push(
        this.fb.group({
          languageOfAggregatorId: [lang.id],
          changelog: [''],
          description: ['']
        })
      );
    });
  }

  get locsArray(): FormArray { return this.versionForm.get('localizations') as FormArray; }

  getLocGroup(langId: number): FormGroup | null {
    return this.locsArray.controls.find((c) => c.value.languageOfAggregatorId === langId) as FormGroup;
  }

  openAddModal(): void {
    this.currentVersionId = null;
    this.modalTitle = 'Добавить версию';
    this.versionForm.reset({
      programOfAggregatorId: this.programId,
      versionNumber: '',
      isLatest: false,
      sortOrder: 0,
      status: 0,
      releasedAt: new Date()
    });
    this.initLocTabs();
    this.modalVisible = true;
  }

  editVersion(id: number): void {
    this.loading = true;
    this.api.getVersionById(id).subscribe({
      next: (data) => {
        this.currentVersionId = data.id;
        this.modalTitle = `Редактировать версию ${data.versionNumber}`;
        this.versionForm.patchValue({
          id: data.id,
          programOfAggregatorId: data.programOfAggregatorId,
          versionNumber: data.versionNumber,
          releasedAt: data.releasedAt,
          isLatest: data.isLatest,
          sortOrder: data.sortOrder,
          externalChangelogUrl: data.externalChangelogUrl,
          status: data.status
        });

        // Patch locs
        data.localizations.forEach(loc => {
          const group = this.getLocGroup(loc.languageOfAggregatorId);
          if (group) {
            group.patchValue({
              changelog: loc.changelog,
              description: loc.description
            });
          }
        });

        this.loading = false;
        this.modalVisible = true;
        this.cdr.markForCheck();
      },
      error: () => this.loading = false
    });
  }

  closeModal(): void {
    this.modalVisible = false;
  }

  saveVersion(): void {
    if (this.versionForm.invalid) {
      this.message.warning('Пожалуйста, заполните обязательные поля');
      return;
    }

    this.saving = true;
    const val = this.versionForm.value;

    console.group('%c [PAYLOAD] Saving Version ', 'background: #222; color: #bada55; padding: 4px;');
    console.log('Action:', this.currentVersionId ? 'UPDATE' : 'CREATE');
    console.log('Program ID:', this.programId);
    console.log('Data:', val);
    console.groupEnd();

    const request: Observable<any> = this.currentVersionId 
      ? this.api.updateVersion(this.currentVersionId, val)
      : this.api.createVersion(val);

    request.subscribe({
      next: (res: any) => {
        const msg = this.currentVersionId 
          ? `Версия ${val.versionNumber} успешно обновлена` 
          : `Новая версия ${val.versionNumber} создана (ID: ${res})`;
          
        this.message.success(msg);
        this.saving = false;
        this.loadVersions();
        
        if (!this.currentVersionId && res) {
          // Если это было создание — фиксируем ID и НЕ закрываем модалку, 
          // чтобы сразу стали доступны вкладки требований и ссылок
          this.currentVersionId = res;
          this.modalTitle = `Редактировать версию ${val.versionNumber}`;
          this.versionForm.patchValue({ id: res });
        } else {
          // Если это было просто обновление — закрываем
          this.closeModal();
        }
        this.cdr.markForCheck();
      },
      error: () => this.saving = false
    });
  }

  deleteVersion(id: number): void {
    this.api.deleteVersion(id).subscribe({
      next: () => {
        this.message.success('Версия удалена');
        this.loadVersions();
      }
    });
  }

  getStatusColor(status: VersionStatus): string {
    switch (status) {
      case VersionStatus.Stable: return 'green';
      case VersionStatus.Beta: return 'orange';
      case VersionStatus.Alpha: return 'red';
      case VersionStatus.Lts: return 'purple';
      default: return 'default';
    }
  }
}
