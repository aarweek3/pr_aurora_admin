import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AvTinymceControlComponent } from '@assets/controls/tinymce-control/tinymce-control.component';
import { AppLanguage } from '@assets/languageApp/models/appLanguage.model';
import { LanguageService } from '@assets/languageApp/services/language.service';
import { SeoFormComponent } from '@shared/components/ui/seo-form/seo-form.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

@Component({
  selector: 'app-platform-of-aggregator-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTabsModule,
    NzFormModule,
    NzInputModule,
    NzSwitchModule,
    NzButtonModule,
    NzSpinModule,
    NzGridModule,
    NzIconModule,
    NzDividerModule,
    NzCollapseModule,
    NzInputNumberModule,
    SeoFormComponent,
    AvTinymceControlComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-spin [nzSpinning]="loading">
      <form
        nz-form
        *ngIf="form && languages.length > 0; else noLangs"
        [formGroup]="form"
        nzLayout="vertical"
      >
        <div nz-row [nzGutter]="[16, 16]">
          <!-- Основные настройки -->
          <div nz-col nzSpan="12">
            <nz-form-item>
              <nz-form-label nzRequired>Техническое название</nz-form-label>
              <nz-form-control nzErrorTip="Введите название">
                <input nz-input formControlName="name" placeholder="Напр: Windows 11" />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="12">
            <nz-form-item>
              <nz-form-label nzRequired>Системный код (Slug)</nz-form-label>
              <nz-form-control nzErrorTip="Введите код">
                <input nz-input formControlName="systemCode" placeholder="Напр: windows" />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="8">
            <nz-form-item>
              <nz-form-label>Путь к иконке (SVG/JPG)</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  formControlName="iconPath"
                  placeholder="assets/icons/platforms/svg/windows.svg"
                />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="8">
            <nz-form-item>
              <nz-form-label>Порядок сортировки</nz-form-label>
              <nz-form-control>
                <nz-input-number
                  formControlName="sortOrder"
                  [nzMin]="0"
                  style="width: 100%"
                ></nz-input-number>
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="8">
            <nz-form-item>
              <nz-form-label>Активность</nz-form-label>
              <nz-form-control>
                <nz-switch formControlName="isActive"></nz-switch>
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="24">
            <nz-divider nzText="Локализация и SEO" nzOrientation="left"></nz-divider>
          </div>

          <!-- Вкладки языков -->
          <div nz-col nzSpan="24">
            <nz-tabset [(nzSelectedIndex)]="selectedTabIndex" [nzAnimated]="false">
              @for (lang of languages; track lang.id; let i = $index) {
                <nz-tab [nzTitle]="lang.nativeTitle">
                  <ng-template nz-tab>
                    @if (getLocGroup(lang.id); as locGroup) {
                      <div class="tab-content" [formGroup]="locGroup">
                        <div nz-row [nzGutter]="[16, 16]">
                          <div nz-col nzSpan="18">
                            <nz-form-item>
                              <nz-form-label nzRequired>Заголовок ({{ lang.code }})</nz-form-label>
                              <nz-form-control nzErrorTip="Введите заголовок">
                                <input nz-input formControlName="name" />
                              </nz-form-control>
                            </nz-form-item>
                          </div>

                          <div nz-col nzSpan="6">
                            <nz-form-item>
                              <nz-form-label>URL картинки</nz-form-label>
                              <nz-form-control>
                                <input nz-input formControlName="urlPicture" />
                              </nz-form-control>
                            </nz-form-item>
                          </div>

                          <div nz-col nzSpan="24">
                            <nz-form-item>
                              <nz-form-label>Краткое описание</nz-form-label>
                              <nz-form-control>
                                <textarea
                                  nz-input
                                  formControlName="description"
                                  [nzAutosize]="{ minRows: 2, maxRows: 3 }"
                                ></textarea>
                              </nz-form-control>
                            </nz-form-item>
                          </div>

                          <div nz-col nzSpan="24">
                            <nz-form-item>
                              <nz-form-label>HTML Контент</nz-form-label>
                              <nz-form-control>
                                <av-tinymce-control
                                  formControlName="htmlContent"
                                  [height]="400"
                                ></av-tinymce-control>
                              </nz-form-control>
                            </nz-form-item>
                          </div>

                          <!-- SEO Блок -->
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

          <!-- Кнопки -->
          <div nz-col nzSpan="24" *ngIf="showInlineActions" style="margin-top: 24px;">
            <div style="display: flex; justify-content: flex-end; gap: 8px;">
              <button nz-button type="button" (click)="cancel.emit()">Отмена</button>
              <button nz-button nzType="primary" (click)="submitForm()">Сохранить</button>
            </div>
          </div>
        </div>
      </form>

      <ng-template #noLangs>
        <div class="no-langs-container">Для работы формы инициализируйте языки.</div>
      </ng-template>
    </nz-spin>
  `,
  styleUrls: ['./platform-of-aggregator-form.component.scss'],
})
export class PlatformOfAggregatorFormComponent implements OnInit {
  @Input() loading = false;
  @Input() showInlineActions = false;
  @Input() set initialData(item: any) {
    if (item) this.patchForm(item);
    else this.resetForm();
  }

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  selectedTabIndex = 0;
  languages: AppLanguage[] = [];

  constructor(
    private langService: LanguageService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private message: NzMessageService,
  ) {
    this.form = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      systemCode: ['', Validators.required],
      iconPath: [''],
      sortOrder: [0],
      isActive: [true],
      localizations: this.fb.array([]),
    });

    toObservable(this.langService.availableLanguages)
      .pipe(takeUntilDestroyed())
      .subscribe((langs) => {
        if (langs?.length) {
          this.languages = langs;
          this.initLocTabs();
          this.cdr.markForCheck();
        }
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
          name: [''],
          description: [''],
          htmlContent: [''],
          urlPicture: [''],
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

  private patchForm(item: any): void {
    this.form.patchValue({
      id: item.id,
      name: item.name,
      systemCode: item.systemCode,
      iconPath: item.iconPath,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });

    item.localizations?.forEach((l: any) => {
      const group = this.getLocGroup(l.languageOfAggregatorId);
      if (group) {
        group.patchValue({
          name: l.name,
          description: l.description,
          htmlContent: l.htmlContent,
          urlPicture: l.urlPicture,
        });
        if (l.seoData) group.get('seoData')?.patchValue(l.seoData);
      }
    });
    this.cdr.markForCheck();
  }

  resetForm(): void {
    const id = this.form.get('id')?.value;
    this.form.reset({ id: 0, sortOrder: 0, isActive: true });
    this.initLocTabs();
    this.cdr.markForCheck();
  }

  submitForm(): void {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    } else {
      this.message.warning('Проверьте обязательные поля (Заголовок для каждого языка)');
    }
  }
}
