import { 
  Component, 
  OnInit, 
  inject, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef,
  OnDestroy,
  viewChild,
  untracked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { forkJoin, Subject, Observable, of } from 'rxjs';
import { filter, take, map, takeUntil, switchMap, catchError, finalize } from 'rxjs/operators';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { AvUniversalUploadModalComponent } from '@shared/components/av-universal-upload-modal/av-universal-upload-modal.component';
import { SeoFormComponent } from '@shared/components/ui/seo-form/seo-form.component';
import { LanguageService } from '@assets/languageApp/services/language.service';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';
import { AppLanguage } from '@assets/languageApp/models/appLanguage.model';
import { AvTinymceControlComponent } from '@assets/controls/tinymce-control/tinymce-control.component';

import { ProgramOfAggregatorApiService } from '../../services/program-of-aggregator-api.service';
import { CategoryOfAggregatorApiService } from '../../../CategoryOfAggregatorPage/services/category-of-aggregator-api.service';
import { DeveloperOfAggregatorApiService } from '../../../DeveloperOfAggregatorPage/services/developer-of-aggregator-api.service';
import { PlatformOfAggregatorApiService } from '../../../PlatformOfAggregatorPage/services/platform-of-aggregator-api.service';
import { TagOfAggregatorApiService } from '../../../TagOfAggregatorPage/services/tag-of-aggregator-api.service';
import { ProgramVersionManagerComponent } from '../program-version-manager/program-version-manager.component';

@Component({
  selector: 'app-program-add-wizard',
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
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpaceModule,
    NzAlertModule,
    NzCardModule,
    NzTagModule,
    NzBadgeModule,
    NzToolTipModule,
    NzModalModule,
    SeoFormComponent,
    AvTinymceControlComponent,
    NzTreeSelectModule,
    ProgramVersionManagerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="premium-wizard-container">
      <!-- 1. STICKY HEADER -->
      <nz-page-header class="sticky-header" (nzBack)="goBack()" nzBackIcon nzTitle="Добавление программы" nzSubtitle="Создание новой записи в каталоге агрегатора">
        <nz-breadcrumb nz-page-header-breadcrumb>
          <nz-breadcrumb-item>Агрегатор</nz-breadcrumb-item>
          <nz-breadcrumb-item><a [routerLink]="['/agregator/pages/program']">Программы</a></nz-breadcrumb-item>
          <nz-breadcrumb-item>Добавить</nz-breadcrumb-item>
        </nz-breadcrumb>
        <nz-page-header-extra>
          <nz-space>
            <button *nzSpaceItem nz-button (click)="goBack()">Отмена</button>
            <button *nzSpaceItem nz-button nzType="primary" (click)="save()" [nzLoading]="loading">
              <i nz-icon nzType="save"></i> Создать программу
            </button>
          </nz-space>
        </nz-page-header-extra>
      </nz-page-header>

      <div class="wizard-layout">
        <nz-spin [nzSpinning]="loading" nzTip="Загрузка...">
          
          <!-- БЛОК 1: ИДЕНТИФИКАЦИЯ (ТЕПЕРЬ ТУТ ТОЛЬКО БАЗА) -->
          <div nz-row [nzGutter]="[24, 24]">
            <div nz-col [nzSpan]="24">
              <nz-card nzTitle="Шаг 1: Базовая информация" class="step-card" [class.active-step]="!programId" [class.completed-step]="programId">
                <form [formGroup]="form" nzLayout="vertical">
                  <div nz-row [nzGutter]="16" nzAlign="bottom">
                    <div nz-col [nzXs]="24" [nzLg]="7">
                      <nz-form-item style="margin-bottom: 0;">
                        <nz-form-label nzRequired>Каноническое название</nz-form-label>
                        <nz-form-control nzErrorTip="Введите название программы">
                          <input nz-input nzSize="large" formControlName="canonicalName" placeholder="Adobe Photoshop" [readonly]="programId" />
                        </nz-form-control>
                      </nz-form-item>
                    </div>
                    <div nz-col [nzXs]="24" [nzLg]="7">
                      <nz-form-item style="margin-bottom: 0;">
                        <nz-form-label [nzSpan]="24" nzRequired>Основная платформа</nz-form-label>
                        <nz-form-control [nzSpan]="24" nzErrorTip="Выберите платформу">
                          <nz-select nzSize="large" formControlName="mainPlatformId" nzPlaceHolder="Windows..." [nzDisabled]="!!programId" style="width: 100%;">
                            @for (p of platforms; track p.id) {
                              <nz-option [nzValue]="p.id" [nzLabel]="p.localizedName || p.name || p.systemCode || 'ID: ' + p.id"></nz-option>
                            }
                          </nz-select>
                        </nz-form-control>
                      </nz-form-item>
                    </div>
                    <div nz-col [nzXs]="24" [nzLg]="6">
                      <nz-form-item style="margin-bottom: 0;">
                        <nz-form-label nzRequired>
                          Slug (URL) 
                          <i nz-icon [nzType]="slugLocked ? 'lock' : 'unlock'" (click)="toggleSlugLock()" style="cursor: pointer; margin-left: 8px;"></i>
                        </nz-form-label>
                        <nz-form-control [nzErrorTip]="slugErrorTpl">
                          <input nz-input nzSize="large" formControlName="slug" placeholder="adobe-photoshop" [readonly]="slugLocked || programId" />
                          <ng-template #slugErrorTpl>
                            @if (form.get('slug')?.hasError('required')) { Введите Slug }
                            @if (form.get('slug')?.hasError('pattern')) { Только латиница, цифры и дефис }
                          </ng-template>
                        </nz-form-control>
                      </nz-form-item>
                    </div>
                    <div nz-col [nzXs]="24" [nzLg]="4">
                      @if (!programId) {
                        <button 
                          nz-button 
                          nzType="primary" 
                          nzBlock 
                          nzSize="large" 
                          (click)="createBase()" 
                          [nzLoading]="loading" 
                          [disabled]="form.get('canonicalName')?.invalid || form.get('slug')?.invalid || form.get('mainPlatformId')?.invalid"
                        >
                          <i nz-icon nzType="plus"></i> Создать
                        </button>
                      } @else {
                        <div class="success-badge" style="height: 40px; display: flex; align-items: center;">
                          <i nz-icon nzType="check-circle" nzTheme="twotone" nzTwotoneColor="#52c41a"></i> Создано
                        </div>
                      }
                    </div>
                  </div>
                </form>
              </nz-card>
            </div>
          </div>

          <!-- БЛОК 2: ПОЛНОЕ НАПОЛНЕНИЕ (ВСЯ ШИРИНА, ПОЯВЛЯЕТСЯ ПОСЛЕ ШАГА 1) -->
          @if (programId) {
            <div nz-row [nzGutter]="[24, 24]" class="fade-in mt-24">
              <div nz-col [nzSpan]="24">
                
                <!-- 2.1 СПРАВОЧНИКИ (ТЕПЕРЬ ПЕРВЫЕ ВО ВТОРОМ БЛОКЕ) -->
                <nz-card nzTitle="ШАГ 2: КАТЕГОРИИ И СПРАВОЧНИКИ" [nzExtra]="testBtn" class="step-card">
                  <ng-template #testBtn>
                    <button nz-button nzType="dashed" nzSize="small" (click)="fillTestData()">
                      <i nz-icon nzType="experiment"></i> Заполнить тест
                    </button>
                  </ng-template>
                  <form [formGroup]="form" nzLayout="vertical">
                    <div nz-row [nzGutter]="[16, 16]">
                      <div nz-col [nzXs]="24" [nzLg]="8">
                        <nz-card nzType="inner" nzTitle="Разработчик" class="inner-step-card">
                          <nz-form-item>
                            <nz-form-label>Разработчик</nz-form-label>
                            <nz-form-control>
                              <nz-select formControlName="developerOfAggregatorId" nzShowSearch nzAllowClear nzPlaceHolder="Выберите вендора (необязательно)">
                                @for (dev of developers; track dev.id) {
                                  <nz-option [nzValue]="dev.id" [nzLabel]="dev.localizedName || dev.name || dev.systemCode || 'ID: ' + dev.id"></nz-option>
                                }
                              </nz-select>
                            </nz-form-control>
                          </nz-form-item>
                        </nz-card>
                      </div>

                      <div nz-col [nzXs]="24" [nzLg]="8">
                        <nz-card nzType="inner" nzTitle="Категория" class="inner-step-card">
                          <nz-form-item style="margin-bottom: 0;">
                            <nz-form-label nzRequired>Категория</nz-form-label>
                            <nz-form-control nzErrorTip="Пожалуйста, выберите категорию">
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
                        </nz-card>
                      </div>

                      <div nz-col [nzXs]="24" [nzLg]="8">
                        <nz-card nzType="inner" nzTitle="Статус и активность" class="inner-step-card">
                          <nz-select formControlName="status" style="width: 100%">
                            <nz-option [nzValue]="0" nzLabel="Черновик"></nz-option>
                            <nz-option [nzValue]="1" nzLabel="Опубликовано"></nz-option>
                            <nz-option [nzValue]="2" nzLabel="В архиве"></nz-option>
                          </nz-select>
                          <div class="mt-8 flex-between">
                            <span>Активен:</span>
                            <nz-switch formControlName="isActive"></nz-switch>
                          </div>
                        </nz-card>
                      </div>
                    </div>

                    <div nz-row [nzGutter]="[16, 16]" class="mt-16">
                      <div nz-col [nzXs]="24" [nzLg]="24">
                        <nz-card nzType="inner" nzTitle="Поддерживаемые ОС" class="inner-step-card">
                          <nz-select formControlName="platformIds" nzMode="multiple" nzPlaceHolder="Выберите платформы" style="width: 100%">
                            @for (p of platforms; track p.id) {
                              <nz-option [nzValue]="p.id" [nzLabel]="p.localizedName || p.name || p.canonicalName || p.Name"></nz-option>
                            }
                          </nz-select>
                        </nz-card>
                      </div>
                    </div>
                  </form>
                </nz-card>

                <!-- 2.2 ЛОКАЛИЗАЦИЯ И SEO -->
                <nz-card class="form-card loc-card mt-24">
                  <div class="loc-section-header">
                    <nz-divider nzText="ШАГ 3: ЛОКАЛИЗАЦИЯ И SEO" nzOrientation="center"></nz-divider>
                  </div>

                  <nz-tabset [nzSelectedIndex]="selectedLangIndex" [nzAnimated]="false" nzSize="large" class="premium-tabs">
                    @for (lang of languages; track lang.id; let i = $index) {
                      <nz-tab [nzTitle]="tabTitleTpl" (nzClick)="onTabClick(lang.id)">
                      <ng-template #tabTitleTpl>
                        <span [class.text-danger]="isTabInvalid(lang.id)">
                          {{ lang.nativeTitle || lang.code }}
                          <i *ngIf="isTabInvalid(lang.id)" nz-icon nzType="exclamation-circle" style="margin-left: 4px;"></i>
                        </span>
                      </ng-template>
                        <ng-template nz-tab>
                          @if (getLocGroup(lang.id); as locGroup) {
                            <div class="loc-form-content" [formGroup]="locGroup">
                              <nz-form-item>
                                <nz-form-label nzRequired>Отображаемое название ({{ lang.code }})</nz-form-label>
                                <nz-form-control>
                                  <input nz-input formControlName="name" [placeholder]="'Название на ' + lang.nativeTitle" (input)="onLocalizedNameInput(lang.id)" />
                                </nz-form-control>
                              </nz-form-item>

                              <div nz-row [nzGutter]="24">
                                <div nz-col [nzSpan]="24">
                                  <nz-form-item>
                                    <nz-form-label>Краткое описание</nz-form-label>
                                    <nz-form-control>
                                      <av-tinymce-control formControlName="shortDescription" [height]="180"></av-tinymce-control>
                                    </nz-form-control>
                                  </nz-form-item>
                                </div>
                                <div nz-col [nzSpan]="24">
                                  <nz-form-item>
                                    <nz-form-label>Полное описание</nz-form-label>
                                    <nz-form-control>
                                      <av-tinymce-control formControlName="fullDescription" [height]="300"></av-tinymce-control>
                                    </nz-form-control>
                                  </nz-form-item>
                                </div>
                              </div>

                              <div class="localized-tags-section mt-16">
                                <nz-card nzType="inner" nzTitle="Теги и характеристики (для этой локализации)" class="inner-step-card">
                                  <div nz-row [nzGutter]="16" nzAlign="middle">
                                    <div nz-col [nzSpan]="18">
                                      <nz-form-item style="margin-bottom: 0;">
                                        <nz-form-label>Теги программы</nz-form-label>
                                        <nz-form-control>
                                          <nz-select 
                                            [formControl]="$any(form.get('tagIds'))" 
                                            nzMode="multiple" 
                                            [nzLoading]="tagsLoading"
                                            nzPlaceHolder="Выберите теги..." 
                                            style="width: 100%"
                                          >
                                            @for (t of tags; track t.id) {
                                              <nz-option [nzValue]="t.id" [nzLabel]="t.localizedName || t.name || t.slug || 'ID: ' + t.id"></nz-option>
                                            }
                                          </nz-select>
                                        </nz-form-control>
                                      </nz-form-item>
                                    </div>
                                    <div nz-col [nzSpan]="6">
                                      <nz-form-item style="margin-bottom: 0;">
                                        <nz-form-label>Язык тегов</nz-form-label>
                                        <nz-form-control>
                                          <nz-select [formControl]="tagLangControl" style="width: 100%">
                                            <nz-option [nzValue]="null" nzLabel="Системный (Slug)"></nz-option>
                                            @for (l of languages; track l.id) {
                                              <nz-option [nzValue]="l.id" [nzLabel]="l.code.toUpperCase()"></nz-option>
                                            }
                                          </nz-select>
                                        </nz-form-control>
                                      </nz-form-item>
                                    </div>
                                  </div>
                                </nz-card>
                              </div>

                              <div nz-row [nzGutter]="24">
                                <div nz-col [nzSpan]="12">
                                  <nz-card nzTitle="Плюсы (Pros)" nzSize="small">
                                    <div formArrayName="pros" class="dynamic-list">
                                      @for (pro of getProsArray(lang.id).controls; track $index) {
                                        <div class="list-item">
                                          <input nz-input [formControlName]="$index" />
                                          <button nz-button nzType="text" nzDanger (click)="removePro(lang.id, $index)"><i nz-icon nzType="delete"></i></button>
                                        </div>
                                      }
                                      <button nz-button nzType="dashed" nzBlock (click)="addPro(lang.id)"><i nz-icon nzType="plus"></i> Добавить</button>
                                    </div>
                                  </nz-card>
                                </div>
                                <div nz-col [nzSpan]="12">
                                  <nz-card nzTitle="Минусы (Cons)" nzSize="small">
                                    <div formArrayName="cons" class="dynamic-list">
                                      @for (con of getConsArray(lang.id).controls; track $index) {
                                        <div class="list-item">
                                          <input nz-input [formControlName]="$index" />
                                          <button nz-button nzType="text" nzDanger (click)="removeCons(lang.id, $index)"><i nz-icon nzType="delete"></i></button>
                                        </div>
                                      }
                                      <button nz-button nzType="dashed" nzBlock (click)="addCons(lang.id)"><i nz-icon nzType="plus"></i> Добавить</button>
                                    </div>
                                  </nz-card>
                                </div>
                              </div>

                              <nz-divider nzText="SEO Оптимизация" nzOrientation="left"></nz-divider>
                              @if (getSeoGroup(lang.id); as seoGroup) {
                                <app-seo-form [form]="seoGroup" [sourceName]="locGroup.get('name')?.value || form.get('canonicalName')?.value"></app-seo-form>
                              }
                            </div>
                          }
                        </ng-template>
                      </nz-tab>
                    }
                  </nz-tabset>
                </nz-card>

                <!-- 2.3 МЕДИА И ИКОНКА -->
                <nz-card nzTitle="ШАГ 4: МЕДИА И ИКОНКА" class="step-card mt-24">
                  <form [formGroup]="form" nzLayout="vertical">
                    <div nz-row [nzGutter]="24">
                      <div nz-col [nzSpan]="24">
                        <nz-card nzTitle="Иконка программы" nzSize="small" class="inner-card">
                          <div class="icon-upload-container">
                            <div class="icon-preview">
                              <img [src]="imgService.getAssetUrl(form.get('iconPath')?.value)" (error)="imgService.getPlaceholder()" />
                            </div>
                            <button nz-button (click)="openIconUploadModal()">
                              <i nz-icon nzType="upload"></i> Выбрать файл
                            </button>
                            <input type="hidden" formControlName="iconPath" />
                          </div>
                        </nz-card>
                      </div>
                    </div>
                  </form>
                </nz-card>

                <!-- 2.4 ВЕРСИИ -->
                <nz-card nzTitle="ШАГ 5: ВЕРСИИ ПРОГРАММЫ" class="step-card mt-24">
                  <div class="versions-inner-container">
                    <app-program-version-manager 
                      [programId]="+programId" 
                      [mainPlatformId]="form.get('mainPlatformId')?.value">
                    </app-program-version-manager>
                  </div>
                </nz-card>

                <!-- 2.3 ФИНАЛЬНЫЕ ДЕЙСТВИЯ -->
                <div class="final-actions mt-24">
                   <button nz-button nzType="primary" nzBlock nzSize="large" (click)="save()" [nzLoading]="loading">
                      <i nz-icon nzType="save"></i> СОХРАНИТЬ ВСЕ ИЗМЕНЕНИЯ
                   </button>
                </div>
              </div>
            </div>
          }
        </nz-spin>
      </div>
    </div>
  `,
  styles: [`
    .premium-wizard-container { background: #f0f2f5; min-height: 100vh; padding-bottom: 50px; }
    .sticky-header { background: #fff; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 24px; }
    .wizard-layout { max-width: 1400px; margin: 0 auto; padding: 0 24px; }
    .form-card { margin-bottom: 24px; border-radius: 8px; border: none; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
    .side-card { margin-bottom: 24px; border-radius: 8px; border-top: 3px solid #1890ff; }
    .loc-card { padding: 0; }
    .loc-form-content { padding: 24px 0; }
    .switch-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; }
    .dynamic-list { display: flex; flex-direction: column; gap: 8px; }
    .list-item { display: flex; gap: 8px; }
    .icon-upload-container { display: flex; flex-direction: column; gap: 16px; align-items: center; }
    .icon-preview { width: 120px; height: 120px; border: 2px dashed #d9d9d9; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .icon-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }

    /* Tab enhancements */
    .tab-title-wrapper { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
    .tab-icon { font-size: 16px; color: #1890ff; }
    .lang-label { font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    ::ng-deep .ant-tabs-tab-active .lang-label { color: #1890ff; }

    .loc-section-header { padding: 16px 24px 0; }
    .premium-tabs ::ng-deep .ant-tabs-nav { margin-bottom: 0; padding: 0 24px; }
    .premium-tabs ::ng-deep .ant-tabs-tab { padding: 12px 16px; }

    .step-card { border-radius: 12px; transition: all 0.3s ease; }
    .active-step { border-left: 4px solid #1890ff; box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1); }
    .completed-step { border-left: 4px solid #52c41a; background: #f6ffed; }
    .success-badge { color: #52c41a; font-weight: 600; display: flex; align-items: center; gap: 8px; font-size: 16px; height: 40px; }
    .mt-24 { margin-top: 24px; }
    .mt-16 { margin-top: 16px; }
    .fade-in { animation: fadeIn 0.5s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    
    .inner-step-card { border: 1px solid #e2e8f0; border-radius: 8px; background: #fafafa; }
    .status-grid { display: flex; flex-direction: column; }
    .flex-between { display: flex; justify-content: space-between; align-items: center; }
    .mt-8 { margin-top: 8px; }
    
    .inner-card { background: #fafafa; border: 1px dashed #d9d9d9; }
    .final-actions { padding: 32px 0; }
    .versions-inner-container { padding: 8px 0; }
    .text-danger { color: #ff4d4f !important; }
    .ml-4 { margin-left: 4px; }
  `]
})
export class ProgramAddWizardComponent implements OnInit, OnDestroy {
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
  private modalService = inject(ModalService);
  private router = inject(Router);

  private destroy$ = new Subject<void>();
  private languages$ = toObservable(this.langService.availableLanguages);

  form: FormGroup;
  languages: AppLanguage[] = [];
  loading = false;
  slugLocked = true;
  selectedLangIndex = 0;
  programId: string | null = null;

  // Options
  categoryTree: any[] = [];
  developers: any[] = [];
  platforms: any[] = [];
  tags: any[] = [];
  tagsLoading = false;
  tagLangControl = new FormControl<number | null>(null);

  constructor() {
    this.form = this.fb.group({
      canonicalName: ['', [Validators.required, Validators.maxLength(255)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      mainPlatformId: [null, [Validators.required]],
      categoryOfAggregatorId: [null, [Validators.required]],
      developerOfAggregatorId: [null],
      iconPath: [''],
      status: [0], // Draft
      sortOrder: [0],
      isActive: [false],
      platformIds: [[]],
      tagIds: [[]],
      localizations: this.fb.array([])
    });
  }


  ngOnInit(): void {
    this.loadDictionaries();
    this.initLanguages();
    this.initFormSync();
    
    // Subscribe to language changes for tags
    this.tagLangControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => this.loadTags(val));
  }

  private initFormSync(): void {
    this.form.get('canonicalName')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => {
        // 1. Синхронизация Slug (если замок закрыт)
        if (this.slugLocked && val) {
          this.form.get('slug')?.setValue(this.generateSlug(val), { emitEvent: false });
        }
        // 2. Синхронизация имени в первой локализации (обычно English)
        this.syncPrimaryLanguageName(val);
      });
  }

  private generateSlug(val: string): string {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private syncPrimaryLanguageName(val: string): void {
    const locs = this.form.get('localizations') as FormArray;
    if (locs.length > 0) {
      const firstLoc = locs.at(0);
      // Обновляем только если пользователь сам там еще ничего не написал или если значение совпадает с предыдущим каноническим
      const currentLocName = firstLoc.get('name')?.value;
      if (!currentLocName || currentLocName === this.form.get('canonicalName')?.value) {
        // ВАЖНО: Мы не используем emitEvent: false, чтобы сработал input listener для SEO
      }
      
      // Для простоты: если поле пустое, всегда синхронизируем
      if (!currentLocName) {
        firstLoc.get('name')?.setValue(val);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initLanguages(): void {
    this.languages$
      .pipe(
        filter(langs => !!langs && langs.length > 0),
        takeUntil(this.destroy$)
      )
      .subscribe(langs => {
        this.languages = langs;
        this.buildLocForm();
        this.cdr.markForCheck();
      });
  }

  private buildLocForm(): void {
    const locs = this.form.get('localizations') as FormArray;
    locs.clear();
    this.languages.forEach(lang => {
      locs.push(this.fb.group({
        languageOfAggregatorId: [lang.id],
        name: [''],
        shortDescription: [''],
        fullDescription: [''],
        pros: this.fb.array([]),
        cons: this.fb.array([]),
        seoData: SeoFormComponent.createSeoForm(this.fb)
      }));
    });
  }

  private loadDictionaries(): void {
    this.loading = true;
    forkJoin({
      categories: this.catApi.getTree(),
      developers: this.devApi.getPaged({ pageNumber: 1, pageSize: 500, sortBy: 'SortOrder', sortDirection: 0, showDeleted: false }),
      platforms: this.platApi.getPaged({ pageNumber: 1, pageSize: 100, sortBy: 'SortOrder', sortDirection: 0 }),
      tags: this.tagApi.getPaged({ pageNumber: 1, pageSize: 500, sortBy: 'SortOrder', sortDirection: 0, showDeleted: false })
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe((res: any) => {
      this.categoryTree = this.mapCategoriesToTree(res.categories);
      this.developers = res.developers.items;
      this.platforms = res.platforms.items;
      this.tags = res.tags.items;
    });
  }

  onTabClick(langId: number): void {
    const index = this.languages.findIndex(l => l.id === langId);
    if (index !== -1) {
      this.selectedLangIndex = index;
    }
  }

  loadTags(langId: number | null): void {
    this.tagsLoading = true;
    this.cdr.markForCheck();

    this.tagApi.getPaged({ 
      pageNumber: 1, 
      pageSize: 500, 
      sortBy: 'SortOrder', 
      sortDirection: 0, 
      showDeleted: false,
      languageId: langId 
    }).pipe(
      finalize(() => {
        this.tagsLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe((res: any) => {
      this.tags = res.items;
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



  createBase(): void {
    if (this.form.get('canonicalName')?.invalid || this.form.get('slug')?.invalid) return;
    
    this.loading = true;
    this.cdr.markForCheck();
    
    const baseDto: any = {
      canonicalName: this.form.get('canonicalName')?.value,
      slug: this.form.get('slug')?.value,
      mainPlatformId: this.form.get('mainPlatformId')?.value,
      categoryOfAggregatorId: this.form.get('categoryOfAggregatorId')?.value || 1, 
      developerOfAggregatorId: this.form.get('developerOfAggregatorId')?.value || 1,
      status: this.form.get('status')?.value || 0,
      isActive: this.form.get('isActive')?.value || false,
      localizations: [],
      sortOrder: 0,
      platformIds: this.form.get('platformIds')?.value || [],
      tagIds: this.form.get('tagIds')?.value || []
    };

    this.api.create(baseDto).subscribe({
      next: (id: number) => {
        this.programId = id.toString();
        this.loading = false;
        
        // Показываем красивое модальное окно по нашему шаблону
        this.modalService.success(
          `<div style="text-align: center; padding: 8px 0;">
             <div style="font-size: 1.15em; margin-bottom: 16px; color: #262626;">
               Программа <b style="color: #52c41a;">«${this.form.get('canonicalName')?.value}»</b> успешно создана.
             </div>
             <div style="display: inline-block; background: #f6ffed; border: 1px solid #b7eb8f; padding: 6px 20px; border-radius: 30px; color: #389e0d; font-weight: 800; font-family: SFMono-Regular, Consolas, monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
               ID: ${id}
             </div>
             <div style="margin-top: 16px; font-size: 0.9em; color: #8c8c8c;">
               Теперь вы можете продолжить заполнение справочников и локализаций.
             </div>
           </div>`,
          'Запись создана',
          true
        );
        
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.loading = false;
        let message = err.error?.message || err.message;

        // Красивое форматирование для конфликта Slug
        if (message.includes('Slug уже занят программой')) {
          // Ищем название программы в любых кавычках ("" или «»)
          message = message.replace(/["«]([^"»]+)["»]/, '<b style="color: #1890ff; font-size: 1.1em; text-decoration: underline;">«$1»</b>');
          // Ищем ID в скобках или без
          message = message.replace(/(?:\()?ID: (\d+)(?:\))?/, '<span style="background: #f0f2f5; padding: 2px 8px; border-radius: 6px; font-family: SFMono-Regular, Consolas, monospace; border: 1px solid #d9d9d9; margin-left: 8px; font-size: 0.9em; color: #595959; font-weight: 600;">ID: $1</span>');
        }

        this.modalService.error(
          `<div style="margin-top: 8px;">К сожалению, не удалось создать запись.</div>
           <div style="margin-top: 16px; padding: 12px; background: #fff1f0; border-radius: 8px; border: 1px solid #ffa39e;">
             <b style="color: #cf1322;">Причина:</b> ${message}
           </div>`,
          'Ошибка при создании'
        );
        this.cdr.markForCheck();
      }
    });
  }

  toggleSlugLock(): void {
    this.slugLocked = !this.slugLocked;
  }

  onLocalizedNameInput(langId: number): void {
    // Optional SEO auto-fill
    const group = this.getLocGroup(langId);
    const name = group?.get('name')?.value;
    if (name) {
      const seoTitle = group?.get('seoData')?.get('metaTitle');
      if (!seoTitle?.value) {
        seoTitle?.setValue(name);
      }
    }
  }

  // Loc Accessors
  get locsArray(): FormArray { return this.form.get('localizations') as FormArray; }
  
  getLocGroup(langId: number): FormGroup | null {
    return this.locsArray.controls.find(c => c.value.languageOfAggregatorId === langId) as FormGroup;
  }

  getSeoGroup(langId: number): FormGroup | null {
    const loc = this.getLocGroup(langId);
    return loc ? loc.get('seoData') as FormGroup : null;
  }

  // Pros/Cons Logic
  getProsArray(langId: number): FormArray { return this.getLocGroup(langId)?.get('pros') as FormArray; }
  getConsArray(langId: number): FormArray { return this.getLocGroup(langId)?.get('cons') as FormArray; }

  addPro(langId: number): void { this.getProsArray(langId).push(this.fb.control('')); }
  removePro(langId: number, index: number): void { this.getProsArray(langId).removeAt(index); }
  
  addCons(langId: number): void { this.getConsArray(langId).push(this.fb.control('')); }
  removeCons(langId: number, index: number): void { this.getConsArray(langId).removeAt(index); }

  isTabInvalid(langId: number): boolean {
    const group = this.getLocGroup(langId);
    return !!(group && group.invalid && (group.dirty || group.touched));
  }

  openIconUploadModal(): void {
    const modalRef = this.modalService.open(AvUniversalUploadModalComponent, {
      data: { folder: 'programs/icons', title: 'Загрузка иконки' },
      width: '700px'
    });
    
    modalRef.afterClosed().subscribe((result: any) => {
      if (result?.relativePath) {
        this.form.patchValue({ iconPath: result.relativePath });
        this.cdr.markForCheck();
      }
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      const errors = this.getFormValidationErrors();
      
      this.modalService.error(
        `<div style="margin-top: 8px; font-size: 1.05em;">Невозможно сохранить программу. Обнаружены ошибки в следующих полях:</div>
         <ul style="margin-top: 16px; padding-left: 20px; color: #cf1322; line-height: 1.6;">
           ${errors.map(err => `<li><b>${err.label}</b>: <span style="font-size: 0.9em; opacity: 0.85;">${err.message}</span></li>`).join('')}
         </ul>
         <div style="margin-top: 16px; font-size: 0.85em; color: #8c8c8c;">Пожалуйста, проверьте Шаги 1-4 и исправьте указанные замечания.</div>`,
        'Ошибки в форме'
      );
      
      this.markAllAsDirty(this.form);
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    console.group('%c [PAYLOAD] FINAL SAVE ', 'background: #fadb14; color: #000; padding: 4px;');

    // 1. ПОДГОТОВКА ДАННЫХ (Fallback logic)
    const rawValue = { ...this.form.getRawValue() };
    
    // Удаляем поля, которые могут мешать серверу при PUT (только для чтения или навигационные свойства)
    const fieldsToRemove = ['createdAt', 'updatedAt', 'versions', 'screenshots', 'tags', 'totalDownloads', 'averageRating', 'averageRatingCount', 'isSystem', 'needsReview'];
    fieldsToRemove.forEach(f => delete (rawValue as any)[f]);

    const enLoc = rawValue.localizations.find((l: any) => 
      this.languages.find(al => al.id === l.languageOfAggregatorId)?.code?.toLowerCase() === 'en'
    ) || rawValue.localizations[0];

    rawValue.localizations.forEach((loc: any) => {
      // Fallback: если имя пустое, берем из EN или из канонического названия
      if (!loc.name) {
        loc.name = enLoc?.name || rawValue.canonicalName;
      }
      
      if (!loc.shortDescription) {
        loc.shortDescription = enLoc?.shortDescription || '';
      }
      
      // Конвертация массивов Pros/Cons в строки (если БД ждет строку)
      loc.pros = loc.pros?.filter((p: string) => !!p).join('|');
      loc.cons = loc.cons?.filter((c: string) => !!c).join('|');

      // SEO Flattening
      if (loc.seoData) {
        loc.metaTitle = loc.seoData.metaTitle || loc.name;
        loc.metaDescription = loc.seoData.metaDescription || loc.shortDescription;
        delete loc.seoData;
      }
    });

    // ГАРАНТИРУЕМ, ЧТО ID НЕ NULL ДЛЯ БЭКЕНДА (если не выбрано, ставим 1)
    rawValue.categoryOfAggregatorId = rawValue.categoryOfAggregatorId || 1;
    rawValue.developerOfAggregatorId = rawValue.developerOfAggregatorId || 1;

    console.log('Sending to API:', rawValue);
    console.groupEnd();

    // 2. СОХРАНЕНИЕ
    let saveObservable: Observable<number | null>;

    if (this.programId) {
      // Если программа уже создана на Шаге 1 — просто обновляем её
      const id = Number(this.programId);
      rawValue.id = id;
      saveObservable = this.api.update(id, rawValue).pipe(map(() => id));
    } else {
      // Если по какой-то причине программа еще не создана — делаем полный цикл (Create -> Update)
      const baseDto = { 
        ...rawValue, 
        categoryOfAggregatorId: rawValue.categoryOfAggregatorId || 1,
        developerOfAggregatorId: rawValue.developerOfAggregatorId || 1,
        localizations: [], 
        platformIds: [], 
        tagIds: [] 
      };
      
      saveObservable = this.api.create(baseDto).pipe(
        switchMap(newId => {
          rawValue.id = newId;
          return this.api.update(newId, rawValue).pipe(map(() => newId));
        })
      );
    }

    saveObservable.pipe(
      catchError(err => {
        this.handleBackendError(err);
        return of(null);
      })
    ).subscribe(id => {
      this.loading = false;
      if (id) {
        this.message.success('Все изменения успешно сохранены');
        // Если мы всё еще в режиме "Добавить", переходим в режим "Редактировать"
        this.router.navigate(['/agregator/pages/program', id, 'edit']);
      }
      this.cdr.markForCheck();
    });
  }

  private markAllAsDirty(group: FormGroup | FormArray): void {
    Object.keys(group.controls).forEach(key => {
      const control = (group as any).get(key);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllAsDirty(control);
      } else {
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    });
  }

  private handleBackendError(err: any): void {
    this.loading = false;
    const errorBody = err.error;
    
    let errorMessage = '<div style="margin-top: 8px;">Сервер отклонил запрос.</div>';
    
    if (errorBody?.errors) {
      // Формат FluentValidation или Identity
      const errorList = Object.entries(errorBody.errors)
        .map(([field, msgs]) => `<li><b>${field}</b>: ${(msgs as string[]).join(', ')}</li>`)
        .join('');
      
      errorMessage = `
        <div style="margin-top: 8px; font-weight: 600; color: #cf1322;">Ошибки валидации на сервере:</div>
        <ul style="margin-top: 12px; padding-left: 20px; line-height: 1.6;">
          ${errorList}
        </ul>
      `;
    } else {
      errorMessage = `<div style="margin-top: 16px; padding: 12px; background: #fff1f0; border-radius: 8px; border: 1px solid #ffa39e; color: #cf1322;">
        ${errorBody?.detail || errorBody?.message || err.message}
      </div>`;
    }

    this.modalService.error(errorMessage, 'Ошибка сервера (400)');
    this.cdr.markForCheck();
  }

  private getFormValidationErrors(): { label: string, message: string }[] {
    const errors: { label: string, message: string }[] = [];
    const labels: { [key: string]: string } = {
      'canonicalName': 'Шаг 1: Каноническое название',
      'slug': 'Шаг 1: Slug (URL)',
      'mainPlatformId': 'Шаг 1: Основная платформа',
      'categoryOfAggregatorId': 'Шаг 2: Категория',
      'developerOfAggregatorId': 'Шаг 2: Разработчик',
      'iconPath': 'Шаг 4: Иконка программы'
    };

    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control?.invalid) {
        let message = 'Некорректное значение';
        if (control.errors?.['required']) message = 'Обязательное поле';
        if (control.errors?.['pattern']) message = 'Неверный формат (только латиница и дефис)';
        if (control.errors?.['maxlength']) message = 'Превышена максимальная длина';
        
        errors.push({ label: labels[key] || key, message });
      }
    });

    // Проверка локализаций
    const locs = this.form.get('localizations') as FormArray;
    locs.controls.forEach((loc, index) => {
      if (loc.invalid) {
        const lang = this.languages[index]?.nativeTitle || `Язык ${index + 1}`;
        errors.push({ label: `Шаг 3: Локализация (${lang})`, message: 'Проверьте обязательные поля (название и др.)' });
      }
    });

    return errors;
  }

  fillTestData(): void {
    const canonical = this.form.get('canonicalName')?.value || 'Test Program';
    const mainPlat = this.form.get('mainPlatformId')?.value;

    this.form.patchValue({
      developerOfAggregatorId: this.developers[0]?.id || 1,
      categoryOfAggregatorId: this.categoryTree[0]?.key || 1,
      status: 1, // Опубликовано
      isActive: true,
      platformIds: mainPlat ? [mainPlat] : []
    });

    // Заполняем первую локализацию
    const locs = this.form.get('localizations') as FormArray;
    if (locs.length > 0) {
      locs.at(0).patchValue({
        name: canonical + ' (Test)',
        shortDescription: '<p>Test short description</p>',
        fullDescription: '<p>Test full description with <b>rich text</b></p>'
      });
    }

    this.message.info('Тестовые данные заполнены');
    this.cdr.markForCheck();
  }

  private logInvalidControls(group: FormGroup | FormArray, path = ''): void {
    Object.keys(group.controls).forEach(key => {
      const control = (group as any).get(key);
      const currentPath = path ? `${path}.${key}` : key;
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.logInvalidControls(control, currentPath);
      } else if (control.invalid) {
        console.error(`Field "${currentPath}" is invalid:`, control.errors);
      }
    });
  }

  goBack(): void { this.router.navigate(['/agregator/pages/program']); }
}
