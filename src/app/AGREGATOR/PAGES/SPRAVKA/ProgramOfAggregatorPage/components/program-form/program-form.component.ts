import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { AppLanguage } from '@language-app/models/appLanguage.model';
import { LanguageService } from '@language-app/services/language.service';
import { AvUniversalUploadModalComponent } from '@shared/components/av-universal-upload-modal/av-universal-upload-modal.component';
import { SeoFormComponent } from '@shared/components/ui/seo-form/seo-form.component';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';

import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { CategoryOfAggregatorItem } from '../../../CategoryOfAggregatorPage/models/category-of-aggregator.model';
import { CategoryOfAggregatorApiService } from '../../../CategoryOfAggregatorPage/services/category-of-aggregator-api.service';
import {
  CategoryItemDto,
  SubcategoryItemDto,
} from '../../../CategorySimplifiedPage/models/category-simplified.model';
import { CategorySimplifiedApiService } from '../../../CategorySimplifiedPage/services/category-simplified-api.service';
import { DeveloperOfAggregatorItem } from '../../../DeveloperOfAggregatorPage/models/developer-of-aggregator.model';
import { DeveloperOfAggregatorApiService } from '../../../DeveloperOfAggregatorPage/services/developer-of-aggregator-api.service';
import { PlatformOfAggregatorItemDto } from '../../../PlatformOfAggregatorPage/models/platform-of-aggregator.model';
import { PlatformOfAggregatorApiService } from '../../../PlatformOfAggregatorPage/services/platform-of-aggregator-api.service';
import { TagOfAggregatorItem } from '../../../TagOfAggregatorPage/models/tag-of-aggregator.model';
import { TagOfAggregatorApiService } from '../../../TagOfAggregatorPage/services/tag-of-aggregator-api.service';
import { ProgramOfAggregatorLocalization } from '../../models/program-of-aggregator.model';
import { ScreenshotOfAggregator } from '../../models/screenshot-of-aggregator.model';
import { ProgramOfAggregatorApiService } from '../../services/program-of-aggregator-api.service';
import { ProgramScreenshotApiService } from '../../services/program-screenshot-api.service';
import { ProgramScreenshotManagerComponent } from '../program-screenshot-manager/program-screenshot-manager.component';
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
    ProgramVersionManagerComponent,
    ProgramScreenshotManagerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-page-header
      class="site-page-header"
      (nzBack)="goBack()"
      nzBackIcon
      nzTitle="Программа"
      [nzSubtitle]="isEdit ? 'Редактирование' : 'Создание новой'"
    >
      <nz-breadcrumb nz-page-header-breadcrumb>
        <nz-breadcrumb-item>Агрегатор</nz-breadcrumb-item>
        <nz-breadcrumb-item
          ><a [routerLink]="['/agregator/pages/program']">Программы</a></nz-breadcrumb-item
        >
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
        @if (
          !loading &&
          (categoryTree.length === 0 || developers.length === 0 || languages.length === 0)
        ) {
          <div class="alerts-container">
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
                @if (languages.length === 0) {
                  <li style="color: red; font-weight: bold;">Языки системы (ОБЯЗАТЕЛЬНО)</li>
                }
                @if (categoryTree.length === 0) {
                  <li>Категории программ</li>
                }
                @if (developers.length === 0) {
                  <li>Разработчиков</li>
                }
              </ul>
            </ng-template>
          </div>
        }

        @if (form && languages.length > 0) {
          <form nz-form [formGroup]="form" nzLayout="vertical">
            <nz-tabset [nzAnimated]="false" class="main-tabs">
              <!-- 1. ОСНОВНОЕ -->
              <nz-tab nzTitle="Основные сведения">
                <div class="tab-content">
                  <div nz-row [nzGutter]="[16, 16]">
                    <div nz-col nzSpan="12">
                      <nz-form-item>
                        <nz-form-label nzRequired>Каноническое название</nz-form-label>
                        <nz-form-control nzErrorTip="Введите каноническое название">
                          <input
                            nz-input
                            formControlName="canonicalName"
                            placeholder="Напр: Adobe Photoshop"
                          />
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
                        <nz-form-control
                          nzErrorTip="Выберите основную платформу. Она определяет корень URL (напр. /windows/...)"
                        >
                          <nz-select
                            formControlName="mainPlatformId"
                            nzShowSearch
                            nzAllowClear
                            nzPlaceHolder="Выберите платформу для иерархии"
                          >
                            @for (p of platforms; track p.id) {
                              <nz-option
                                [nzValue]="p.id"
                                [nzLabel]="
                                  p.localizedName || p.name || p.systemCode || 'ID: ' + p.id
                                "
                              ></nz-option>
                            }
                          </nz-select>
                        </nz-form-control>
                      </nz-form-item>
                    </div>

                    <div nz-col nzSpan="12">
                      <nz-form-item>
                        <nz-form-label nzRequired>Мастер-категория (V2)</nz-form-label>
                        <nz-form-control nzErrorTip="Выберите основную категорию">
                          <nz-select
                            formControlName="categoryId"
                            nzShowSearch
                            nzAllowClear
                            nzPlaceHolder="Выберите мастер-категорию"
                          >
                            @for (cat of masterCategories; track cat.id) {
                              <nz-option
                                [nzValue]="cat.id"
                                [nzLabel]="cat.localizedName || cat.canonicalName"
                              ></nz-option>
                            }
                          </nz-select>
                        </nz-form-control>
                      </nz-form-item>
                    </div>
                    <div nz-col nzSpan="12">
                      <nz-form-item>
                        <nz-form-label>Подкатегория (V2)</nz-form-label>
                        <nz-form-control>
                          <nz-select
                            formControlName="subcategoryId"
                            nzShowSearch
                            nzAllowClear
                            nzPlaceHolder="Выберите подкатегорию"
                            [nzLoading]="subcategoriesLoading"
                          >
                            @for (sub of subcategories; track sub.id) {
                              <nz-option
                                [nzValue]="sub.id"
                                [nzLabel]="sub.localizedName || sub.canonicalName"
                              ></nz-option>
                            }
                          </nz-select>
                        </nz-form-control>
                      </nz-form-item>
                    </div>

                    <div nz-col nzSpan="16">
                      <nz-form-item>
                        <nz-form-label nzRequired>Дерево категорий (Legacy/Full)</nz-form-label>
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
                          <nz-select
                            formControlName="developerOfAggregatorId"
                            nzShowSearch
                            nzAllowClear
                          >
                            @for (dev of developers; track dev.id) {
                              <nz-option
                                [nzValue]="dev.id"
                                [nzLabel]="
                                  dev.localizedName || dev.name || dev.systemCode || 'ID: ' + dev.id
                                "
                              ></nz-option>
                            }
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
                              <img
                                [src]="imgService.getAssetUrl(form.get('iconPath')?.value)"
                                (error)="imgService.getPlaceholder()"
                                alt="Иконка программы"
                              />
                            </div>
                            <div class="media-controls">
                              <nz-input-group nzSearch [nzAddOnAfter]="suffixIcon">
                                <input
                                  nz-input
                                  formControlName="iconPath"
                                  placeholder="Путь к иконке..."
                                />
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
                    <!-- Screenshots Manager -->
                    <div nz-col nzSpan="24" style="margin-top: 16px;">
                      <app-program-screenshot-manager
                        [screenshots]="form.get('screenshots')?.value || []"
                        [languages]="languages"
                        [programSlug]="form.get('slug')?.value"
                        (onScreenshotsChange)="onScreenshotsChanged($event)"
                      >
                      </app-program-screenshot-manager>
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
                          <nz-select
                            formControlName="platformIds"
                            nzMode="multiple"
                            nzPlaceHolder="Выберите платформы"
                          >
                            @for (p of platforms; track p.id) {
                              <nz-option
                                [nzValue]="p.id"
                                [nzLabel]="
                                  p.localizedName || p.name || p.systemCode || 'ID: ' + p.id
                                "
                              ></nz-option>
                            }
                          </nz-select>
                        </nz-form-control>
                      </nz-form-item>
                    </div>
                    <div nz-col nzSpan="12">
                      <nz-form-item>
                        <nz-form-label>Теги</nz-form-label>
                        <nz-form-control>
                          <nz-select
                            formControlName="tagIds"
                            nzMode="multiple"
                            nzPlaceHolder="Выберите теги"
                          >
                            @for (t of tags; track t.id) {
                              <nz-option
                                [nzValue]="t.id"
                                [nzLabel]="t.localizedName || t.slug || 'ID: ' + t.id"
                              ></nz-option>
                            }
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
                  <nz-tabset
                    [nzSelectedIndex]="selectedLangIndex"
                    nzSize="small"
                    [nzAnimated]="false"
                  >
                    @for (lang of languages; track lang.id; let i = $index) {
                      <nz-tab [nzTitle]="lang.nativeTitle">
                        <ng-template nz-tab>
                          @if (getLocGroup(lang.id); as locGroup) {
                            <div class="loc-tab-content" [formGroup]="locGroup">
                              <div nz-row [nzGutter]="[16, 16]">
                                <div nz-col nzSpan="24">
                                  <nz-form-item>
                                    <nz-form-label
                                      >Локализованное название ({{ lang.code }})</nz-form-label
                                    >
                                    <nz-form-control>
                                      <input
                                        nz-input
                                        formControlName="name"
                                        placeholder="Оставьте пустым для использования канонического"
                                      />
                                    </nz-form-control>
                                  </nz-form-item>
                                </div>
                                <div nz-col nzSpan="24">
                                  <nz-form-item>
                                    <nz-form-label>Краткое описание</nz-form-label>
                                    <nz-form-control>
                                      <textarea
                                        nz-input
                                        formControlName="shortDescription"
                                        [nzAutosize]="{ minRows: 2, maxRows: 4 }"
                                      ></textarea>
                                    </nz-form-control>
                                  </nz-form-item>
                                </div>
                                <div nz-col nzSpan="24">
                                  <nz-form-item>
                                    <nz-form-label>Полное описание</nz-form-label>
                                    <nz-form-control>
                                      <textarea
                                        nz-input
                                        formControlName="fullDescription"
                                        [nzAutosize]="{ minRows: 4, maxRows: 10 }"
                                      ></textarea>
                                    </nz-form-control>
                                  </nz-form-item>
                                </div>

                                <div nz-col nzSpan="12">
                                  <nz-form-item>
                                    <nz-form-label style="color: green;">Плюсы</nz-form-label>
                                    <nz-form-control>
                                      <textarea
                                        nz-input
                                        formControlName="pros"
                                        [nzAutosize]="{ minRows: 2 }"
                                      ></textarea>
                                    </nz-form-control>
                                  </nz-form-item>
                                </div>
                                <div nz-col nzSpan="12">
                                  <nz-form-item>
                                    <nz-form-label style="color: red;">Минусы</nz-form-label>
                                    <nz-form-control>
                                      <textarea
                                        nz-input
                                        formControlName="cons"
                                        [nzAutosize]="{ minRows: 2 }"
                                      ></textarea>
                                    </nz-form-control>
                                  </nz-form-item>
                                </div>

                                <div nz-col nzSpan="24">
                                  <nz-divider
                                    nzText="SEO Параметры"
                                    nzOrientation="left"
                                  ></nz-divider>
                                  @if (getSeoGroup(lang.id); as seoGroup) {
                                    <app-seo-form
                                      [form]="seoGroup"
                                      [sourceName]="
                                        locGroup.get('name')?.value ||
                                        form.get('canonicalName')?.value
                                      "
                                    ></app-seo-form>
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
              <!-- 5. ВЕРСИИ -->
              <nz-tab nzTitle="Версии">
                <div class="tab-content">
                  @if (isEdit && selectedId) {
                    <div class="versions-inner">
                      <app-program-version-manager
                        [programId]="selectedId"
                        [mainPlatformId]="form.get('mainPlatformId')?.value"
                      >
                      </app-program-version-manager>
                    </div>
                  } @else {
                    <div class="versions-placeholder">
                      <nz-result
                        nzStatus="info"
                        nzTitle="Менеджер версий заблокирован"
                        nzSubTitle="Создание и управление версиями станет доступно сразу после первичного сохранения основной информации о программе."
                      >
                      </nz-result>
                    </div>
                  }
                </div>
              </nz-tab>
            </nz-tabset>
          </form>
        } @else {
          <div class="no-langs-container">Загрузка языков системы...</div>
        }
      </nz-spin>
    </div>
  `,
  styles: [
    `
      .form-container {
        padding: 24px;
        background: #fff;
        min-height: 600px;
      }
      .tab-content {
        padding-top: 24px;
      }
      .loc-tab-content {
        padding-top: 16px;
      }
      .media-upload-wrapper {
        display: flex;
        gap: 24px;
        align-items: center;
      }
      .media-preview {
        width: 120px;
        height: 120px;
        border: 1px dashed #d9d9d9;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .media-preview img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      .media-controls {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .no-langs-container {
        padding: 50px;
        text-align: center;
        color: #8c8c8c;
      }
      .versions-wrapper {
        margin-top: 48px;
        border-top: 1px solid #f0f0f0;
        padding-top: 24px;
      }
      .versions-inner {
        background: #fafafa;
        padding: 24px;
        border-radius: 8px;
        border: 1px solid #f0f0f0;
      }
      .versions-placeholder {
        opacity: 0.7;
      }
    `,
  ],
})
export class ProgramFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private api = inject(ProgramOfAggregatorApiService);
  private catApi = inject(CategoryOfAggregatorApiService);
  private devApi = inject(DeveloperOfAggregatorApiService);
  private platApi = inject(PlatformOfAggregatorApiService);
  private tagApi = inject(TagOfAggregatorApiService);
  private simplifiedCatApi = inject(CategorySimplifiedApiService);
  private langService = inject(LanguageService);
  public imgService = inject(ImageServiceUniversal);
  private screenshotApi = inject(ProgramScreenshotApiService);
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
  categoryTree: NzTreeNodeOptions[] = [];
  developers: DeveloperOfAggregatorItem[] = [];
  platforms: PlatformOfAggregatorItemDto[] = [];
  tags: TagOfAggregatorItem[] = [];

  // Simplified Categories
  masterCategories: CategoryItemDto[] = [];
  subcategories: SubcategoryItemDto[] = [];
  subcategoriesLoading = false;

  constructor() {
    this.form = this.fb.group({
      id: [null],
      canonicalName: ['', [Validators.required, Validators.maxLength(255)]],
      slug: ['', [Validators.required, Validators.maxLength(255)]],
      categoryOfAggregatorId: [null, [Validators.required]],
      categoryId: [null],
      subcategoryId: [null],
      developerOfAggregatorId: [null, [Validators.required]],
      iconPath: [''],
      website: [''],
      status: [1],
      sortOrder: [0],
      isActive: [true],
      platformIds: [[]],
      mainPlatformId: [null, [Validators.required]],
      tagIds: [[]],
      screenshots: [[]],
      localizations: this.fb.array([]),
    });

    // Language sync
    toObservable(this.langService.availableLanguages)
      .pipe(
        filter((langs) => !!langs && langs.length > 0),
        takeUntil(this.destroy$),
      )
      .subscribe((langs) => {
        this.languages = langs;
        this.initLocTabs();
        this.cdr.markForCheck();
      });

    // Simplified Category Change Listener
    this.form
      .get('categoryId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((catId) => {
        if (catId) {
          this.loadSubcategories(catId);
        } else {
          this.subcategories = [];
          this.form.get('subcategoryId')?.setValue(null);
          this.cdr.markForCheck();
        }
      });
  }

  ngOnInit(): void {
    this.loadOptions();

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
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
      developers: this.devApi.getPaged({
        pageNumber: 1,
        pageSize: 500,
        sortBy: 'SortOrder',
        sortDirection: 0,
        showDeleted: false,
      }),
      platforms: this.platApi.getPaged({
        pageNumber: 1,
        pageSize: 100,
        sortBy: 'SortOrder',
        sortDirection: 0,
      }),
      tags: this.tagApi.getPaged({
        pageNumber: 1,
        pageSize: 500,
        sortBy: 'SortOrder',
        sortDirection: 0,
        showDeleted: false,
      }),
      masterCategories: this.simplifiedCatApi.getPaged({
        pageNumber: 1,
        pageSize: 500,
        sortBy: 'SortOrder',
        sortDirection: 0,
        showDeleted: false,
      }),
    }).subscribe((res) => {
      this.categoryTree = this.mapCategoriesToTree(res.categories);
      this.developers = [...res.developers.items];
      this.platforms = [...res.platforms.items];
      this.tags = [...res.tags.items];
      this.masterCategories = [...res.masterCategories.items];

      this.cdr.markForCheck();
    });
  }

  private mapCategoriesToTree(cats: CategoryOfAggregatorItem[]): NzTreeNodeOptions[] {
    return cats.map((c) => ({
      title: c.canonicalName,
      key: c.id.toString(),
      children: c.children ? this.mapCategoriesToTree(c.children) : [],
      isLeaf: !c.children || c.children.length === 0,
    }));
  }

  private loadSubcategories(categoryId: number, selectId?: number): void {
    this.subcategoriesLoading = true;
    this.simplifiedCatApi.getSubcategories(categoryId).subscribe({
      next: (subs) => {
        this.subcategories = subs;
        if (selectId) {
          this.form.get('subcategoryId')?.setValue(selectId);
        } else {
          // If the current subcategoryId is not in the new list, clear it
          const currentId = this.form.get('subcategoryId')?.value;
          if (currentId && !subs.find((s) => s.id === currentId)) {
            this.form.get('subcategoryId')?.setValue(null);
          }
        }
        this.subcategoriesLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.subcategoriesLoading = false;
        this.cdr.markForCheck();
      },
    });
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

  get locsArray(): FormArray {
    return this.form.get('localizations') as FormArray;
  }

  getLocGroup(langId: number): FormGroup | null {
    return this.locsArray.controls.find(
      (c) => c.value.languageOfAggregatorId === langId,
    ) as FormGroup;
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
          categoryId: data.categoryId,
          developerOfAggregatorId: data.developerOfAggregatorId,
          iconPath: data.iconPath,
          website: data.website,
          status: data.status,
          sortOrder: data.sortOrder,
          isActive: data.isActive,
          mainPlatformId: data.mainPlatformId,
          platformIds: data.platformIds,
          tagIds: data.tagIds,
          screenshots: (data.screenshots as unknown as ScreenshotOfAggregator[]) || [],
        });

        // Load subcategories for the selected master category and THEN select the subcategory
        if (data.categoryId) {
          this.loadSubcategories(data.categoryId, data.subcategoryId);
        }

        data.localizations?.forEach((loc: ProgramOfAggregatorLocalization) => {
          const group = this.getLocGroup(loc.languageOfAggregatorId);
          if (group) {
            group.patchValue({
              name: loc.name,
              shortDescription: loc.shortDescription,
              fullDescription: loc.fullDescription,
              pros: loc.pros,
              cons: loc.cons,
            });
            group.get('seoData')?.patchValue({
              metaTitle: loc.metaTitle,
              metaDescription: loc.metaDescription,
            });
          }
        });

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => (this.loading = false),
    });
  }

  openIconUploadModal(): void {
    const slug = (this.form.get('slug')?.value || '').trim();
    const firstChar = slug.charAt(0).toLowerCase();
    const folderSuffix = /^[a-z0-9]$/.test(firstChar) ? firstChar : 'a';
    const targetFolder = `programs/icons/${folderSuffix}`;

    const modalRef = this.modal.create({
      nzContent: AvUniversalUploadModalComponent,
      nzData: {
        folder: targetFolder,
        title: 'Загрузка иконки программы',
        fileName: slug || undefined,
      },
      nzFooter: null,
      nzWidth: 700,
    });

    modalRef.afterClose.subscribe((result: { relativePath?: string }) => {
      if (result?.relativePath) {
        this.form.patchValue({ iconPath: result.relativePath });
        this.cdr.markForCheck();
      }
    });
  }

  onScreenshotsChanged(screenshots: ScreenshotOfAggregator[]): void {
    this.form.get('screenshots')?.setValue(screenshots);
    this.form.get('screenshots')?.markAsDirty();
    this.cdr.markForCheck();
  }

  private getFriendlyControlName(path: string): string {
    const parts = path.split('.');
    let friendlyName = '';

    const locMatch = parts[0].match(/localizations\[(\d+)\]/);
    if (locMatch) {
      const index = parseInt(locMatch[1], 10);
      const lang = this.languages[index];
      const langName = lang ? lang.nativeTitle || lang.code : `Язык #${index + 1}`;

      friendlyName += `Вкладка «${langName}» ➔ `;

      const subParts = parts.slice(1);
      if (subParts.length > 0) {
        if (subParts[0] === 'seoData') {
          friendlyName += 'SEO Параметры ➔ ';
          const seoField = subParts[1];
          const seoFieldNames: Record<string, string> = {
            metaTitle: 'Meta Title (Заголовок страницы)',
            metaDescription: 'Meta Description (Описание страницы)',
            urlSlug: 'URL Slug',
            metaKeywords: 'Meta Keywords',
          };
          friendlyName += seoFieldNames[seoField] || seoField;
        } else {
          const locFieldNames: Record<string, string> = {
            name: 'Локализованное название',
            shortDescription: 'Краткое описание',
            fullDescription: 'Полное описание',
            pros: 'Плюсы',
            cons: 'Минусы',
          };
          friendlyName += locFieldNames[subParts[0]] || subParts[0];
        }
      }
    } else {
      const rootFieldNames: Record<string, string> = {
        canonicalName: 'Каноническое название',
        slug: 'Slug (URL)',
        categoryOfAggregatorId: 'Дерево категорий (Legacy)',
        categoryId: 'Мастер-категория (V2)',
        subcategoryId: 'Подкатегория (V2)',
        developerOfAggregatorId: 'Разработчик',
        mainPlatformId: 'Основная платформа',
        website: 'Официальный сайт',
      };
      friendlyName = rootFieldNames[path] || path;
    }

    return friendlyName;
  }

  private getFriendlyError(errors: ValidationErrors | null): string {
    if (!errors) return 'Неизвестная ошибка';
    if (errors['required']) {
      return 'Обязательное поле должно быть заполнено.';
    }
    if (errors['minlength']) {
      return `Минимальная длина — ${errors['minlength'].requiredLength} символов (сейчас введено: ${errors['minlength'].actualLength}).`;
    }
    if (errors['maxlength']) {
      return `Максимальная длина — ${errors['maxlength'].requiredLength} символов (сейчас введено: ${errors['maxlength'].actualLength}).`;
    }
    if (errors['pattern']) {
      return 'Неверный формат (разрешены только латинские буквы в нижнем регистре, цифры и дефис).';
    }
    return JSON.stringify(errors);
  }

  private collectFormErrors(
    control: AbstractControl | null,
    path = '',
    errorsList: string[] = [],
  ): string[] {
    if (!control) return errorsList;
    if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach((key) => {
        this.collectFormErrors(control.get(key), path ? `${path}.${key}` : key, errorsList);
      });
    } else if (control instanceof FormArray) {
      control.controls.forEach((ctrl, index) => {
        this.collectFormErrors(ctrl, `${path}[${index}]`, errorsList);
      });
    } else if (control.invalid) {
      const friendlyName = this.getFriendlyControlName(path);
      const friendlyError = this.getFriendlyError(control.errors);
      errorsList.push(`<li><strong>${friendlyName}</strong>: ${friendlyError}</li>`);
    }
    return errorsList;
  }

  submit(): void {
    if (this.form.invalid) {
      const errorsHtmlList = this.collectFormErrors(this.form);
      const contentHtml = `
        <div style="max-height: 400px; overflow-y: auto; font-family: system-ui, -apple-system, sans-serif;">
          <p style="margin-bottom: 16px; color: #595959;">Форма содержит нерешённые ошибки валидации. Пожалуйста, исправьте следующие поля перед сохранением:</p>
          <ul style="padding-left: 20px; line-height: 1.8; color: #262626; font-size: 14px;">
            ${errorsHtmlList.join('')}
          </ul>
        </div>
      `;

      this.modal.warning({
        nzTitle: 'Ошибки заполнения формы',
        nzContent: contentHtml,
        nzOkText: 'Понятно',
        nzWidth: 650,
      });

      this.markFormDirty();
      return;
    }

    const val = JSON.parse(JSON.stringify(this.form.value));
    const screenshots = val.screenshots || [];
    delete val.screenshots; // Clean from main program model payload

    val.localizations.forEach(
      (
        loc: ProgramOfAggregatorLocalization & {
          seoData?: { metaTitle?: string; metaDescription?: string };
        },
      ) => {
        // Fallback to canonical name if localized name is empty
        if (!loc.name || loc.name.trim() === '') {
          loc.name = val.canonicalName;
        }

        if (loc.seoData) {
          loc.metaTitle = loc.seoData.metaTitle;
          loc.metaDescription = loc.seoData.metaDescription;
          delete loc.seoData;
        }
      },
    );

    this.loading = true;
    const request: Observable<void | number> = this.isEdit
      ? this.api.update(val.id, val)
      : this.api.create(val);

    request.subscribe({
      next: (res) => {
        const targetProgramId = this.isEdit ? val.id : (res as number);

        // Sync screenshots after program ID is guaranteed
        this.screenshotApi.syncScreenshots(targetProgramId, screenshots).subscribe({
          next: () => {
            this.message.success('Сохранено успешно');
            this.form.get('screenshots')?.markAsPristine();
            this.router.navigate(['/agregator/pages/program']);
          },
          error: () => {
            this.message.error(
              'Сведения о программе сохранены, но произошел сбой при синхронизации скриншотов.',
            );
            this.loading = false;
            this.cdr.markForCheck();
          },
        });
      },
      error: () => (this.loading = false),
    });
  }

  private markFormDirty(): void {
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      control?.markAsDirty();
      control?.updateValueAndValidity();
    });
  }

  goBack(): void {
    this.router.navigate(['/agregator/pages/program']);
  }
}
