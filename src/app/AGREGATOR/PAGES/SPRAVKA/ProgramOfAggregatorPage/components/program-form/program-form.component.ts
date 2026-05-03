import { 
  Component, 
  OnInit, 
  inject, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { forkJoin, Subject, Observable } from 'rxjs';
import { filter, take, map, takeUntil } from 'rxjs/operators';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { AvUniversalUploadModalComponent } from '@shared/components/av-universal-upload-modal/av-universal-upload-modal.component';
import { SeoFormComponent } from '@shared/components/ui/seo-form/seo-form.component';
import { LanguageService } from '@assets/languageApp/services/language.service';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';
import { AppLanguage } from '@assets/languageApp/models/appLanguage.model';

import { ProgramOfAggregatorApiService } from '../../services/program-of-aggregator-api.service';
import { CategoryOfAggregatorApiService } from '../../../CategoryOfAggregatorPage/services/category-of-aggregator-api.service';
import { DeveloperOfAggregatorApiService } from '../../../DeveloperOfAggregatorPage/services/developer-of-aggregator-api.service';
import { PlatformOfAggregatorApiService } from '../../../PlatformOfAggregatorPage/services/platform-of-aggregator-api.service';
import { TagOfAggregatorApiService } from '../../../TagOfAggregatorPage/services/tag-of-aggregator-api.service';
import { ProgramVersionManagerComponent } from '../program-version-manager/program-version-manager.component';

@Component({
  selector: 'app-program-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzTabsModule,
    NzSwitchModule,
    NzSpinModule,
    NzGridModule,
    NzDividerModule,
    NzCollapseModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpaceModule,
    NzAlertModule,
    NzResultModule,
    SeoFormComponent,
    NzTreeSelectModule,
    ProgramVersionManagerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-page-header class="site-page-header" (nzBack)="goBack()" nzBackIcon nzTitle="Программа" [nzSubtitle]="isEdit ? 'Редактирование' : 'Создание новой'">
      <nz-breadcrumb nz-page-header-breadcrumb>
        <nz-breadcrumb-item>Агрегатор</nz-breadcrumb-item>
        <nz-breadcrumb-item><a [routerLink]="['/agregator/pages/program']">Программы</a></nz-breadcrumb-item>
        <nz-breadcrumb-item>{{ isEdit ? 'Редактировать' : 'Добавить' }}</nz-breadcrumb-item>
      </nz-breadcrumb>
      <nz-page-header-extra>
        <nz-space>
          <button *nzSpaceItem nz-button (click)="goBack()">Отмена</button>
          <button *nzSpaceItem nz-button nzType="primary" (click)="submit()" [nzLoading]="loading">
            <i nz-icon nzType="save"></i> Сохранить
          </button>
        </nz-space>
      </nz-page-header-extra>
    </nz-page-header>

    <div class="form-container">
      <nz-spin [nzSpinning]="loading">
        
        <div class="alerts-container" *ngIf="!loading && (categoryTree.length === 0 || developers.length === 0 || languages.length === 0)">
          <nz-alert
            nzType="warning"
            nzMessage="Внимание: Справочники пусты"
            [nzDescription]="emptyCatalogsMessage"
            nzShowIcon
            style="margin-bottom: 24px;"
          ></nz-alert>
          <ng-template #emptyCatalogsMessage>
            Для полноценной работы формы необходимо создать:
            <ul style="margin-top: 8px;">
              <li *ngIf="languages.length === 0" style="color: red; font-weight: bold;">Языки системы (ОБЯЗАТЕЛЬНО)</li>
              <li *ngIf="categoryTree.length === 0">Категории программ</li>
              <li *ngIf="developers.length === 0">Разработчиков</li>
            </ul>
          </ng-template>
        </div>

        <form nz-form [formGroup]="form" nzLayout="vertical" *ngIf="form && languages.length > 0; else noLangs">
          <nz-tabset [nzAnimated]="false" class="main-tabs">
            
            <!-- 1. ОСНОВНОЕ -->
            <nz-tab nzTitle="Основные сведения">
              <div class="tab-content">
                <div nz-row [nzGutter]="[16, 16]">
                  <div nz-col nzSpan="12">
                    <nz-form-item>
                      <nz-form-label nzRequired>Каноническое название</nz-form-label>
                      <nz-form-control nzErrorTip="Введите каноническое название">
                        <input nz-input formControlName="canonicalName" placeholder="Напр: Adobe Photoshop" />
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  <div nz-col nzSpan="12">
                    <nz-form-item>
                      <nz-form-label nzRequired>Slug (URL)</nz-form-label>
                      <nz-form-control nzErrorTip="Введите slug">
                        <input nz-input formControlName="slug" placeholder="adobe-photoshop" />
                      </nz-form-control>
                    </nz-form-item>
                  </div>

                  <div nz-col nzSpan="24">
                    <nz-form-item>
                      <nz-form-label nzRequired>Основная платформа (Маршрут)</nz-form-label>
                      <nz-form-control nzErrorTip="Выберите основную платформу. Она определяет корень URL (напр. /windows/...)">
                        <nz-select formControlName="mainPlatformId" nzShowSearch nzAllowClear nzPlaceHolder="Выберите платформу для иерархии">
                          <nz-option *ngFor="let p of platforms" [nzValue]="p.id" [nzLabel]="p.localizedName || p.name || p.systemCode || 'ID: ' + p.id"></nz-option>
                        </nz-select>
                      </nz-form-control>
                    </nz-form-item>
                  </div>

                  <div nz-col nzSpan="16">
                    <nz-form-item>
                      <nz-form-label nzRequired>Категория</nz-form-label>
                      <nz-form-control nzErrorTip="Выберите категорию">
                        <nz-tree-select
                          style="width: 100%"
                          [nzNodes]="categoryTree"
                          formControlName="categoryOfAggregatorId"
                          nzPlaceHolder="Выберите категорию (иерархически)"
                          nzShowSearch
                          nzAllowClear
                          [nzDropdownStyle]="{ 'max-height': '350px' }"
                        >
                        </nz-tree-select>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  <div nz-col nzSpan="8">
                    <nz-form-item>
                      <nz-form-label nzRequired>Разработчик</nz-form-label>
                      <nz-form-control nzErrorTip="Выберите разработчика">
                        <nz-select formControlName="developerOfAggregatorId" nzShowSearch nzAllowClear>
                          <nz-option *ngFor="let dev of developers" [nzValue]="dev.id" [nzLabel]="dev.localizedName || dev.name || dev.systemCode || 'ID: ' + dev.id"></nz-option>
                        </nz-select>
                      </nz-form-control>
                    </nz-form-item>
                  </div>

                  <div nz-col nzSpan="24">
                    <nz-form-item>
                      <nz-form-label>Официальный сайт</nz-form-label>
                      <nz-form-control>
                        <input nz-input formControlName="website" placeholder="https://..." />
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                </div>
              </div>
            </nz-tab>

            <!-- 2. МЕДИА -->
            <nz-tab nzTitle="Медиа">
              <div class="tab-content">
                <div nz-row [nzGutter]="[16, 16]">
                  <div nz-col nzSpan="24">
                    <nz-form-item>
                      <nz-form-label>Главная иконка</nz-form-label>
                      <nz-form-control>
                        <div class="media-upload-wrapper">
                          <div class="media-preview">
                            <img [src]="imgService.getAssetUrl(form.get('iconPath')?.value)" (error)="imgService.getPlaceholder()" />
                          </div>
                          <div class="media-controls">
                            <nz-input-group nzSearch [nzAddOnAfter]="suffixIcon">
                              <input nz-input formControlName="iconPath" placeholder="Путь к иконке..." />
                            </nz-input-group>
                            <ng-template #suffixIcon>
                              <button nz-button nzType="primary" (click)="openIconUploadModal()">
                                <i nz-icon nzType="picture"></i> Выбрать
                              </button>
                            </ng-template>
                          </div>
                        </div>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  <!-- TODO: Screenshots and Video -->
                  <div nz-col nzSpan="24">
                    <nz-alert nzType="info" nzMessage="Дополнительные скриншоты и видео будут доступны в следующем обновлении (Шаг 4)."></nz-alert>
                  </div>
                </div>
              </div>
            </nz-tab>

            <!-- 3. МЕТАДАННЫЕ -->
            <nz-tab nzTitle="Метаданные">
              <div class="tab-content">
                <div nz-row [nzGutter]="[16, 16]">
                  <div nz-col nzSpan="12">
                    <nz-form-item>
                      <nz-form-label>Платформы</nz-form-label>
                      <nz-form-control>
                        <nz-select formControlName="platformIds" nzMode="multiple" nzPlaceHolder="Выберите платформы">
                          <nz-option *ngFor="let p of platforms" [nzValue]="p.id" [nzLabel]="p.localizedName || p.name || p.systemCode || 'ID: ' + p.id"></nz-option>
                        </nz-select>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  <div nz-col nzSpan="12">
                    <nz-form-item>
                      <nz-form-label>Теги</nz-form-label>
                      <nz-form-control>
                        <nz-select formControlName="tagIds" nzMode="multiple" nzPlaceHolder="Выберите теги">
                          <nz-option *ngFor="let t of tags" [nzValue]="t.id" [nzLabel]="(t.localizedName || t.name || t.slug || 'ID: ' + t.id)"></nz-option>
                        </nz-select>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  
                  <div nz-col nzSpan="8">
                    <nz-form-item>
                      <nz-form-label>Статус</nz-form-label>
                      <nz-form-control>
                        <nz-select formControlName="status">
                          <nz-option [nzValue]="0" nzLabel="Черновик"></nz-option>
                          <nz-option [nzValue]="1" nzLabel="Активен"></nz-option>
                          <nz-option [nzValue]="2" nzLabel="В архиве"></nz-option>
                        </nz-select>
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
                  <div nz-col nzSpan="8">
                    <nz-form-item>
                      <nz-form-label>Активен</nz-form-label>
                      <nz-form-control>
                        <nz-switch formControlName="isActive"></nz-switch>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                </div>
              </div>
            </nz-tab>

            <!-- 4. ЛОКАЛИЗАЦИЯ -->
            <nz-tab nzTitle="Локализация & SEO">
              <div class="tab-content">
                <nz-tabset [nzSelectedIndex]="selectedLangIndex" nzSize="small" [nzAnimated]="false">
                  @for (lang of languages; track lang.id; let i = $index) {
                    <nz-tab [nzTitle]="lang.nativeTitle">
                      <ng-template nz-tab>
                        @if (getLocGroup(lang.id); as locGroup) {
                          <div class="loc-tab-content" [formGroup]="locGroup">
                            <div nz-row [nzGutter]="[16, 16]">
                              <div nz-col nzSpan="24">
                                <nz-form-item>
                                  <nz-form-label>Локализованное название ({{ lang.code }})</nz-form-label>
                                  <nz-form-control>
                                    <input nz-input formControlName="name" placeholder="Оставьте пустым для использования канонического" />
                                  </nz-form-control>
                                </nz-form-item>
                              </div>
                              <div nz-col nzSpan="24">
                                <nz-form-item>
                                  <nz-form-label>Краткое описание</nz-form-label>
                                  <nz-form-control>
                                    <textarea nz-input formControlName="shortDescription" [nzAutosize]="{ minRows: 2, maxRows: 4 }"></textarea>
                                  </nz-form-control>
                                </nz-form-item>
                              </div>
                              <div nz-col nzSpan="24">
                                <nz-form-item>
                                  <nz-form-label>Полное описание</nz-form-label>
                                  <nz-form-control>
                                    <textarea nz-input formControlName="fullDescription" [nzAutosize]="{ minRows: 4, maxRows: 10 }"></textarea>
                                  </nz-form-control>
                                </nz-form-item>
                              </div>
                              
                              <div nz-col nzSpan="12">
                                <nz-form-item>
                                  <nz-form-label style="color: green;">Плюсы</nz-form-label>
                                  <nz-form-control>
                                    <textarea nz-input formControlName="pros" [nzAutosize]="{ minRows: 2 }"></textarea>
                                  </nz-form-control>
                                </nz-form-item>
                              </div>
                              <div nz-col nzSpan="12">
                                <nz-form-item>
                                  <nz-form-label style="color: red;">Минусы</nz-form-label>
                                  <nz-form-control>
                                    <textarea nz-input formControlName="cons" [nzAutosize]="{ minRows: 2 }"></textarea>
                                  </nz-form-control>
                                </nz-form-item>
                              </div>

                              <div nz-col nzSpan="24">
                                <nz-divider nzText="SEO Параметры" nzOrientation="left"></nz-divider>
                                @if (getSeoGroup(lang.id); as seoGroup) {
                                  <app-seo-form [form]="seoGroup" [sourceName]="locGroup.get('name')?.value || form.get('canonicalName')?.value"></app-seo-form>
                                }
                              </div>
                            </div>
                          </div>
                        }
                      </ng-template>
                    </nz-tab>
                  }
                </nz-tabset>
              </div>
            </nz-tab>

          </nz-tabset>
        </form>

        <!-- ОТДЕЛЬНЫЙ БЛОК ДЛЯ ВЕРСИЙ -->
        <div class="versions-wrapper">
          @if (isEdit && selectedId) {
            <div class="versions-section">
              <nz-divider nzText="УПРАВЛЕНИЕ ВЕРСИЯМИ ПРОГРАММЫ" nzOrientation="left"></nz-divider>
              <div class="versions-inner">
                <app-program-version-manager 
                  [programId]="selectedId" 
                  [mainPlatformId]="form.get('mainPlatformId')?.value">
                </app-program-version-manager>
              </div>
            </div>
          } @else {
            <div class="versions-placeholder">
              <nz-divider nzText="ВЕРСИИ" nzOrientation="left"></nz-divider>
              <nz-result 
                nzStatus="info" 
                nzTitle="Менеджер версий заблокирован" 
                nzSubTitle="Создание и управление версиями станет доступно сразу после первичного сохранения основной информации о программе.">
              </nz-result>
            </div>
          }
        </div>
      </nz-spin>
    </div>

    <ng-template #noLangs>
      <div class="no-langs-container">Загрузка языков системы...</div>
    </ng-template>
  `,
  styles: [`
    .form-container { padding: 24px; background: #fff; min-height: 600px; }
    .tab-content { padding-top: 24px; }
    .loc-tab-content { padding-top: 16px; }
    .media-upload-wrapper { display: flex; gap: 24px; align-items: center; }
    .media-preview { width: 120px; height: 120px; border: 1px dashed #d9d9d9; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    .media-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .media-controls { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .no-langs-container { padding: 50px; text-align: center; color: #8c8c8c; }
    .versions-wrapper { margin-top: 48px; border-top: 1px solid #f0f0f0; padding-top: 24px; }
    .versions-inner { background: #fafafa; padding: 24px; border-radius: 8px; border: 1px solid #f0f0f0; }
    .versions-placeholder { opacity: 0.7; }
  `]
})
export class ProgramFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private api = inject(ProgramOfAggregatorApiService);
  private catApi = inject(CategoryOfAggregatorApiService);
  private devApi = inject(DeveloperOfAggregatorApiService);
  private platApi = inject(PlatformOfAggregatorApiService);
  private tagApi = inject(TagOfAggregatorApiService);
  private langService = inject(LanguageService);
  public imgService = inject(ImageServiceUniversal);
  private cdr = inject(ChangeDetectorRef);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private destroy$ = new Subject<void>();

  form: FormGroup;
  languages: AppLanguage[] = [];
  loading = false;
  isEdit = false;
  selectedId: number | null = null;
  selectedLangIndex = 0;

  // Options
  categoryTree: any[] = [];
  developers: any[] = [];
  platforms: any[] = [];
  tags: any[] = [];

  constructor() {
    this.form = this.fb.group({
      id: [null],
      canonicalName: ['', [Validators.required, Validators.maxLength(255)]],
      slug: ['', [Validators.required, Validators.maxLength(255)]],
      categoryOfAggregatorId: [null, [Validators.required]],
      developerOfAggregatorId: [null, [Validators.required]],
      iconPath: [''],
      website: [''],
      status: [1],
      sortOrder: [0],
      isActive: [true],
      platformIds: [[]],
      mainPlatformId: [null, [Validators.required]],
      tagIds: [[]],
      localizations: this.fb.array([])
    });

    // Language sync
    toObservable(this.langService.availableLanguages)
      .pipe(
        filter(langs => !!langs && langs.length > 0),
        takeUntil(this.destroy$)
      )
      .subscribe(langs => {
        this.languages = langs;
        this.initLocTabs();
        this.cdr.markForCheck();
      });
  }

  ngOnInit(): void {
    this.loadOptions();
    
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.selectedId = +params['id'];
        this.loadData(this.selectedId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOptions(): void {
    forkJoin({
      categories: this.catApi.getTree(),
      developers: this.devApi.getPaged({ pageNumber: 1, pageSize: 500, sortBy: 'SortOrder', sortDirection: 0, showDeleted: false }),
      platforms: this.platApi.getPaged({ pageNumber: 1, pageSize: 100, sortBy: 'SortOrder', sortDirection: 0 }),
      tags: this.tagApi.getPaged({ pageNumber: 1, pageSize: 500, sortBy: 'SortOrder', sortDirection: 0, showDeleted: false })
    }).subscribe(res => {
      this.categoryTree = this.mapCategoriesToTree(res.categories);
      this.developers = [...res.developers.items];
      this.platforms = [...res.platforms.items];
      this.tags = [...res.tags.items];
      
      console.log('DEBUG: Loaded tags:', this.tags);
      console.log('DEBUG: First tag object:', this.tags[0]);

      this.cdr.markForCheck();
    });
  }

  private mapCategoriesToTree(cats: any[]): any[] {
    return cats.map(c => ({
      title: c.canonicalName,
      key: c.id,
      children: c.children ? this.mapCategoriesToTree(c.children) : [],
      isLeaf: !c.children || c.children.length === 0
    }));
  }



  private initLocTabs(): void {
    const locs = this.form.get('localizations') as FormArray;
    locs.clear();
    this.languages.forEach((lang) => {
      locs.push(
        this.fb.group({
          languageOfAggregatorId: [lang.id],
          name: ['', [Validators.maxLength(255)]],
          shortDescription: [''],
          fullDescription: [''],
          pros: [''],
          cons: [''],
          seoData: SeoFormComponent.createSeoForm(this.fb),
        }),
      );
    });
  }

  get locsArray(): FormArray { return this.form.get('localizations') as FormArray; }

  getLocGroup(langId: number): FormGroup | null {
    return this.locsArray.controls.find((c) => c.value.languageOfAggregatorId === langId) as FormGroup;
  }

  getSeoGroup(langId: number): FormGroup | null {
    const loc = this.getLocGroup(langId);
    return loc ? (loc.get('seoData') as FormGroup) : null;
  }

  private loadData(id: number): void {
    this.loading = true;
    this.api.getById(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          id: data.id,
          canonicalName: data.canonicalName,
          slug: data.slug,
          categoryOfAggregatorId: data.categoryOfAggregatorId,
          developerOfAggregatorId: data.developerOfAggregatorId,
          iconPath: data.iconPath,
          website: data.website,
          status: data.status,
          sortOrder: data.sortOrder,
          isActive: data.isActive,
          mainPlatformId: data.mainPlatformId,
          platformIds: data.platformIds,
          tagIds: data.tagIds
        });



        data.localizations?.forEach((loc: any) => {
          const group = this.getLocGroup(loc.languageOfAggregatorId);
          if (group) {
            group.patchValue({
              name: loc.name,
              shortDescription: loc.shortDescription,
              fullDescription: loc.fullDescription,
              pros: loc.pros,
              cons: loc.cons
            });
            group.get('seoData')?.patchValue({
              metaTitle: loc.metaTitle,
              metaDescription: loc.metaDescription
            });
          }
        });

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => this.loading = false
    });
  }

  openIconUploadModal(): void {
    const modalRef = this.modal.create({
      nzContent: AvUniversalUploadModalComponent,
      nzData: { folder: 'programs/icons', title: 'Загрузка иконки программы' },
      nzFooter: null,
      nzWidth: 700
    });

    modalRef.afterClose.subscribe((result: any) => {
      if (result?.relativePath) {
        this.form.patchValue({ iconPath: result.relativePath });
        this.cdr.markForCheck();
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.message.warning('Пожалуйста, заполните обязательные поля');
      this.markFormDirty();
      return;
    }

    const val = JSON.parse(JSON.stringify(this.form.value));
    val.localizations.forEach((loc: any) => {
      if (loc.seoData) {
        loc.metaTitle = loc.seoData.metaTitle;
        loc.metaDescription = loc.seoData.metaDescription;
        delete loc.seoData;
      }
    });

    this.loading = true;
    const request: Observable<any> = this.isEdit ? this.api.update(val.id, val) : this.api.create(val);

    request.subscribe({
      next: (res: any) => {
        this.message.success('Сохранено успешно');
        if (!this.isEdit) {
          this.router.navigate(['/agregator/pages/program', res, 'edit']);
        } else {
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: () => this.loading = false
    });
  }

  private markFormDirty(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsDirty();
      control?.updateValueAndValidity();
    });
  }

  goBack(): void { this.router.navigate(['/agregator/pages/program']); }
}
