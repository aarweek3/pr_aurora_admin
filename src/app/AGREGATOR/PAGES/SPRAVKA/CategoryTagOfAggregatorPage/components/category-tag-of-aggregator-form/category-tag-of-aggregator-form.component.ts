import { 
  Component, 
  OnInit, 
  inject, 
  input, 
  output, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';

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
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { CategoryTagOfAggregatorApiService } from '../../services/category-tag-of-aggregator-api.service';
import { LanguageAggregatorService } from '../../../LanguageOfAggregator/services/language-aggregator.service';
import { SeoFormComponent } from '@shared/components/ui/seo-form/seo-form.component';
import { LanguageAggregator } from '../../../LanguageOfAggregator/models/language-aggregator.model';

@Component({
  selector: 'app-category-tag-of-aggregator-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    SeoFormComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-spin [nzSpinning]="loading">
      <form nz-form [formGroup]="form" nzLayout="vertical" *ngIf="form && languages.length > 0; else noLangs">
        <div nz-row [nzGutter]="[16, 16]">
          
          <div nz-col nzSpan="12">
            <nz-form-item>
              <nz-form-label nzRequired>Slug (URL-Friendly)</nz-form-label>
              <nz-form-control nzErrorTip="Введите корректный slug (маленькие буквы, тире)">
                <input nz-input formControlName="slug" placeholder="Напр: browsers-and-tools" />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="6">
            <nz-form-item>
              <nz-form-label>Порядок</nz-form-label>
              <nz-form-control>
                <input nz-input type="number" formControlName="sortOrder" placeholder="0" />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="6">
            <nz-form-item>
              <nz-form-label>Активность</nz-form-label>
              <nz-form-control>
                <nz-switch formControlName="isActive"></nz-switch>
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="12">
            <nz-form-item>
              <nz-form-label>Иконка (nz-icon type)</nz-form-label>
              <nz-form-control>
                <nz-input-group [nzPrefix]="prefixIcon">
                  <input nz-input formControlName="iconPath" placeholder="Напр: folder, tag, appstore" />
                </nz-input-group>
                <ng-template #prefixIcon>
                  <i nz-icon [nzType]="getIconType(form.get('iconPath')?.value)" [style.color]="form.get('color')?.value"></i>
                </ng-template>
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="12">
            <nz-form-item>
              <nz-form-label>Цвет категории</nz-form-label>
              <nz-form-control>
                <nz-input-group [nzPrefix]="colorPrefix">
                  <input nz-input formControlName="color" placeholder="Напр: #1890ff или var(--av-tag-blue)" />
                </nz-input-group>
                <ng-template #colorPrefix>
                  <div class="color-preview-dot" [style.background-color]="form.get('color')?.value || '#d9d9d9'"></div>
                </ng-template>
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="24">
            <nz-divider nzText="Локализация и SEO" nzOrientation="left"></nz-divider>
          </div>

          <div nz-col nzSpan="24">
            <nz-tabset [(nzSelectedIndex)]="selectedTabIndex" [nzAnimated]="false">
              @for (lang of languages; track lang.id; let i = $index) {
                <nz-tab [nzTitle]="lang.nativeTitle">
                  <ng-template nz-tab>
                    @if (getLocGroup(lang.id); as locGroup) {
                      <div class="tab-content" [formGroup]="locGroup">
                        <div nz-row [nzGutter]="[16, 16]">
                          <div nz-col nzSpan="24">
                            <nz-form-item>
                              <nz-form-label [nzRequired]="lang.code === 'en-US'">Название категории ({{ lang.code }})</nz-form-label>
                              <nz-form-control nzErrorTip="Введите название">
                                <input nz-input formControlName="name" />
                              </nz-form-control>
                            </nz-form-item>
                          </div>

                          <div nz-col nzSpan="24">
                            <nz-form-item>
                              <nz-form-label>Описание</nz-form-label>
                              <nz-form-control>
                                <textarea
                                  nz-input
                                  formControlName="description"
                                  [nzAutosize]="{ minRows: 2, maxRows: 4 }"
                                ></textarea>
                              </nz-form-control>
                            </nz-form-item>
                          </div>

                          <div nz-col nzSpan="24">
                            <nz-collapse [nzBordered]="false">
                              <nz-collapse-panel [nzHeader]="'SEO Настройки (' + lang.code + ')'">
                                @if (getSeoGroup(lang.id); as seoGroup) {
                                  <app-seo-form
                                    [form]="seoGroup"
                                    [sourceName]="locGroup.get('name')?.value"
                                  >
                                  </app-seo-form>
                                }
                              </nz-collapse-panel>
                            </nz-collapse>
                          </div>
                        </div>
                      </div>
                    }
                  </ng-template>
                </nz-tab>
              }
            </nz-tabset>
          </div>
        </div>
      </form>

      <ng-template #noLangs>
        <div class="no-langs-container">
          Для работы формы необходимо инициализировать языки системы.
        </div>
      </ng-template>
    </nz-spin>
  `,
  styles: [`
    .tab-content { padding-top: 16px; min-height: 350px; }
    .no-langs-container { padding: 40px; text-align: center; color: #8c8c8c; }
    .color-preview-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1px solid rgba(0,0,0,0.1);
      transition: all 0.3s;
    }
  `]
})
export class CategoryTagOfAggregatorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(CategoryTagOfAggregatorApiService);
  private langService = inject(LanguageAggregatorService);
  private cdr = inject(ChangeDetectorRef);
  private message = inject(NzMessageService);

  id = input<number | null>(null);
  onSave = output<any>();

  form: FormGroup;
  languages: LanguageAggregator[] = [];
  loading = false;
  selectedTabIndex = 0;

  constructor() {
    this.form = this.fb.group({
      id: [null],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      iconPath: [''],
      color: [''],
      isActive: [true],
      sortOrder: [0],
      localizations: this.fb.array([])
    });

    // Используем availableLanguages из LanguageAggregatorService
    toObservable(this.langService.availableLanguages)
      .pipe(
        filter(langs => !!langs && langs.length > 0),
        takeUntilDestroyed()
      )
      .subscribe(langs => {
        this.languages = langs;
        this.initLocTabs();
        
        if (this.id()) {
          this.loadData(this.id()!);
        }
        this.cdr.markForCheck();
      });
  }

  ngOnInit(): void {}

  private initLocTabs(): void {
    const locs = this.form.get('localizations') as FormArray;
    locs.clear();
    this.languages.forEach((lang) => {
      locs.push(
        this.fb.group({
          languageOfAggregatorId: [lang.id],
          name: ['', [Validators.maxLength(255)]],
          description: [''],
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
    this.cdr.markForCheck();
    this.api.getById(id).pipe(take(1)).subscribe({
      next: (data) => {
        this.form.patchValue({
          id: data.id,
          slug: data.slug,
          iconPath: data.iconPath,
          color: data.color,
          isActive: data.isActive,
          sortOrder: data.sortOrder
        });

        data.localizations?.forEach((loc: any) => {
          const group = this.getLocGroup(loc.languageOfAggregatorId);
          if (group) {
            group.patchValue({
              name: loc.name,
              description: loc.description
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
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  submit(): void {
    if (this.form.valid) {
      const val = JSON.parse(JSON.stringify(this.form.value));
      
      // Маппинг SEO данных перед отправкой
      val.localizations.forEach((loc: any) => {
        if (loc.seoData) {
          loc.metaTitle = loc.seoData.metaTitle;
          loc.metaDescription = loc.seoData.metaDescription;
          delete loc.seoData;
        }
      });

      this.onSave.emit(val);
    } else {
      this.message.warning('Проверьте обязательные поля (Slug и названия)');
      this.cdr.markForCheck();
    }
  }

  /**
   * Возвращает тип иконки с обработкой исключений и маппингом.
   * Фикс для иконки 'shield', которой нет в стандартном наборе Ant Design.
   */
  getIconType(path: string | undefined | null): string {
    if (!path) return 'question';
    if (path === 'shield') return 'safety';
    return path;
  }
}
