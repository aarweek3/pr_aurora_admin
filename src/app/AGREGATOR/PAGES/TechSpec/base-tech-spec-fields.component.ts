import {
  Component,
  Input,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs/operators';

// Ng-Zorro Modules
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

// Services & Models
import { LicenseTypeOfAggregatorApiService } from '../SPRAVKA/LicenseTypeOfAggregatorPage/services/license-type-of-aggregator-api.service';
import { LicenseTypeOfAggregatorItemDto } from '../SPRAVKA/LicenseTypeOfAggregatorPage/models/license-type-of-aggregator.model';
import { LanguageService } from '@language-app/services/language.service';
import { AppLanguage } from '@language-app/models/appLanguage.model';

@Component({
  selector: 'app-base-tech-spec-fields',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    NzGridModule,
    NzSpaceModule,
    NzDividerModule,
    NzInputNumberModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [formGroup]="formGroup" class="base-spec-fields">
      <nz-divider nzText="Общие финансовые условия" nzOrientation="left"></nz-divider>

      <div nz-row [nzGutter]="[16, 16]">
        <!-- Тип лицензии -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="licenseTypeId" nzRequired>Тип лицензии</nz-form-label>
            <nz-form-control nzErrorTip="Укажите тип лицензии">
              <nz-select
                formControlName="licenseTypeId"
                nzPlaceHolder="Выберите тип лицензии"
                nzShowSearch
                nzAllowClear
                [nzLoading]="licensesLoading"
              >
                @for (license of licenses; track license.id) {
                  <nz-option [nzValue]="license.id" [nzLabel]="license.localizedName || license.canonicalName"></nz-option>
                }
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Цена -->
        @if (showPriceFields) {
          <div nz-col nzXs="24" nzSm="12" nzMd="8" class="fade-in">
            <nz-form-item>
              <nz-form-label nzFor="price" [nzRequired]="priceRequired">Цена</nz-form-label>
              <nz-form-control nzErrorTip="Укажите цену">
                <nz-input-number
                  formControlName="price"
                  nzPlaceHolder="Напр: 29.99"
                  [nzMin]="0"
                  [nzStep]="0.01"
                  style="width: 100%"
                ></nz-input-number>
              </nz-form-control>
            </nz-form-item>
          </div>

          <!-- Валюта -->
          <div nz-col nzXs="24" nzSm="12" nzMd="8" class="fade-in">
            <nz-form-item>
              <nz-form-label nzFor="currency" [nzRequired]="priceRequired">Валюта</nz-form-label>
              <nz-form-control nzErrorTip="Укажите валюту">
                <nz-select formControlName="currency" nzPlaceHolder="Валюта">
                  <nz-option nzValue="USD" nzLabel="USD ($)"></nz-option>
                  <nz-option nzValue="EUR" nzLabel="EUR (€)"></nz-option>
                  <nz-option nzValue="RUB" nzLabel="RUB (₽)"></nz-option>
                  <nz-option nzValue="BYN" nzLabel="BYN (Br)"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>
        }
      </div>

      <nz-divider nzText="Файлы и архитектура" nzOrientation="left"></nz-divider>

      <div nz-row [nzGutter]="[16, 16]">
        <!-- Размер установщика -->
        <div nz-col nzXs="12" nzSm="6" nzMd="6">
          <nz-form-item>
            <nz-form-label nzFor="fileSizeMb">Размер дистрибутива (МБ)</nz-form-label>
            <nz-form-control>
              <nz-input-number
                formControlName="fileSizeMb"
                nzPlaceHolder="МБ"
                [nzMin]="0"
                style="width: 100%"
              ></nz-input-number>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Установленный размер -->
        <div nz-col nzXs="12" nzSm="6" nzMd="6">
          <nz-form-item>
            <nz-form-label nzFor="installedSizeMb">Размер на диске (МБ)</nz-form-label>
            <nz-form-control>
              <nz-input-number
                formControlName="installedSizeMb"
                nzPlaceHolder="МБ"
                [nzMin]="0"
                style="width: 100%"
              ></nz-input-number>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Поддерживаемые архитектуры -->
        <div nz-col nzXs="24" nzSm="12" nzMd="12">
          <nz-form-item>
            <nz-form-label nzFor="architecture">Архитектура процессора</nz-form-label>
            <nz-form-control>
              <nz-select
                formControlName="architecture"
                nzMode="tags"
                [nzTokenSeparators]="[',', ' ']"
                nzPlaceHolder="Выберите или введите (x64, ARM64...)"
              >
                <nz-option nzValue="x64" nzLabel="x64 (64-bit Intel/AMD)"></nz-option>
                <nz-option nzValue="ARM64" nzLabel="ARM64 (Apple Silicon / Qualcomm)"></nz-option>
                <nz-option nzValue="x86" nzLabel="x86 (32-bit)"></nz-option>
                <nz-option nzValue="ARM" nzLabel="ARM (32-bit mobile)"></nz-option>
                <nz-option nzValue="Universal" nzLabel="Universal (Все архитектуры)"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <nz-divider nzText="Возможности и особенности" nzOrientation="left"></nz-divider>

      <!-- Набор функциональных свитчей -->
      <div nz-row [nzGutter]="[24, 16]">
        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Портативная (Portable)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="isPortable"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Автообновление</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="hasAutoUpdate"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Открытый исходный код</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="isOpenSource" (ngModelChange)="onOpenSourceChange($event)"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Требуется интернет</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="requiresInternet"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Поддержка оффлайн</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsOffline"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Встроенные покупки</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="inAppPurchases"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- Ссылка на репозиторий (показывается только для OpenSource) -->
      @if (formGroup.get('isOpenSource')?.value) {
        <div nz-row [nzGutter]="[16, 16]" class="fade-in" style="margin-top: 8px;">
          <div nz-col nzSpan="24">
            <nz-form-item>
              <nz-form-label nzFor="sourceCodeUrl">Ссылка на исходный код (GitHub/GitLab)</nz-form-label>
              <nz-form-control nzErrorTip="Введите корректный URL (например: https://github.com/...)">
                <input
                  nz-input
                  formControlName="sourceCodeUrl"
                  placeholder="https://github.com/username/project"
                />
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
      }

      <nz-divider nzText="Локализация и языки" nzOrientation="left"></nz-divider>

      <div nz-row [nzGutter]="[16, 16]">
        <!-- Поддерживаемые языки интерфейса -->
        <div nz-col nzSpan="24">
          <nz-form-item>
            <nz-form-label nzFor="supportedLanguages">Поддерживаемые языки интерфейса</nz-form-label>
            <nz-form-control>
              <nz-select
                formControlName="supportedLanguages"
                nzMode="multiple"
                nzPlaceHolder="Выберите поддерживаемые языки"
                nzShowSearch
              >
                @for (lang of systemLanguages; track lang.id) {
                  <nz-option [nzValue]="lang.code" [nzLabel]="lang.nativeTitle || lang.title"></nz-option>
                }
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .base-spec-fields {
        background: rgba(255, 255, 255, 0.6);
        padding: 4px 16px 16px 16px;
        border-radius: 8px;
      }
      .switch-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      .switch-item ::ng-deep .nz-form-item-label {
        padding: 0 0 4px 0;
        line-height: 1.5;
        font-size: 13px;
        color: #595959;
      }
      .fade-in {
        animation: fadeIn 0.25s ease-out forwards;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class BaseTechSpecFieldsComponent implements OnInit {
  @Input({ required: true }) formGroup!: FormGroup;

  private licenseApi = inject(LicenseTypeOfAggregatorApiService);
  private langService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);

  private languages$ = toObservable(this.langService.availableLanguages);

  licenses: LicenseTypeOfAggregatorItemDto[] = [];
  systemLanguages: AppLanguage[] = [];
  licensesLoading = false;

  showPriceFields = false;
  priceRequired = false;

  ngOnInit(): void {
    this.loadLicenses();
    this.loadLanguages();

    // Отслеживание изменений типа лицензии для управления валидацией цены
    this.formGroup
      .get('licenseTypeId')
      ?.valueChanges.subscribe((licenseId) => {
        this.updatePricingValidation(licenseId);
      });

    // Первичный запуск валидации
    const currentLicenseId = this.formGroup.get('licenseTypeId')?.value;
    if (currentLicenseId) {
      this.updatePricingValidation(currentLicenseId);
    }
  }

  private loadLicenses(): void {
    this.licensesLoading = true;
    this.licenseApi
      .getPaged({
        pageNumber: 1,
        pageSize: 100,
        sortBy: 'SortOrder',
        sortDirection: 0,
        showDeleted: false,
      })
      .subscribe({
        next: (res) => {
          this.licenses = res.items || [];
          this.licensesLoading = false;
          // Повторно обновляем валидацию цен, так как список лицензий загрузился
          const currentLicenseId = this.formGroup.get('licenseTypeId')?.value;
          if (currentLicenseId) {
            this.updatePricingValidation(currentLicenseId);
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.licensesLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private loadLanguages(): void {
    // Подписываемся на доступные в системе языки
    this.languages$
      .pipe(
        filter((langs) => !!langs && langs.length > 0),
        take(1)
      )
      .subscribe((langs) => {
        this.systemLanguages = langs;
        this.cdr.markForCheck();
      });
  }

  private updatePricingValidation(licenseId: number | null): void {
    if (!licenseId) {
      this.showPriceFields = false;
      this.priceRequired = false;
      this.clearPriceControls();
      this.cdr.markForCheck();
      return;
    }

    const selectedLicense = this.licenses.find((l) => l.id === licenseId);
    if (!selectedLicense) {
      // Если лицензии ещё не загрузились, показываем поля цены на всякий случай
      this.showPriceFields = true;
      this.cdr.markForCheck();
      return;
    }

    const code = (selectedLicense.slug || '').toUpperCase();
    const name = (selectedLicense.canonicalName || '').toUpperCase();

    // Проверяем, является ли лицензия бесплатной
    const isFree =
      code.includes('FREE') ||
      code.includes('OPEN') ||
      name.includes('БЕСПЛАТ') ||
      name.includes('OPEN SOURCE') ||
      name.includes('FREE');

    if (isFree) {
      this.showPriceFields = false;
      this.priceRequired = false;
      this.clearPriceControls();
    } else {
      this.showPriceFields = true;
      // Если это платная лицензия (Commercial, Shareware, etc), делаем цену/валюту обязательной
      this.priceRequired =
        code.includes('COMMERCIAL') ||
        code.includes('PAID') ||
        name.includes('КОММЕРЧ') ||
        name.includes('ПЛАТН');

      const priceCtrl = this.formGroup.get('price');
      const currCtrl = this.formGroup.get('currency');

      if (this.priceRequired) {
        priceCtrl?.setValidators([Validators.required, Validators.min(0)]);
        currCtrl?.setValidators([Validators.required]);
      } else {
        priceCtrl?.setValidators([Validators.min(0)]);
        currCtrl?.clearValidators();
      }

      priceCtrl?.updateValueAndValidity({ emitEvent: false });
      currCtrl?.updateValueAndValidity({ emitEvent: false });
    }

    this.cdr.markForCheck();
  }

  private clearPriceControls(): void {
    const priceCtrl = this.formGroup.get('price');
    const currCtrl = this.formGroup.get('currency');

    priceCtrl?.setValue(null, { emitEvent: false });
    currCtrl?.setValue(null, { emitEvent: false });
    priceCtrl?.clearValidators();
    currCtrl?.clearValidators();
    priceCtrl?.updateValueAndValidity({ emitEvent: false });
    currCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  onOpenSourceChange(isOpenSource: boolean): void {
    const srcCtrl = this.formGroup.get('sourceCodeUrl');
    if (isOpenSource) {
      // Добавляем простую валидацию паттерна ссылки для sourceCodeUrl
      srcCtrl?.setValidators([
        Validators.pattern(/^(https?:\/\/)?(www\.)?(github|gitlab|bitbucket)\.com\/.+$/),
      ]);
    } else {
      srcCtrl?.setValue('', { emitEvent: false });
      srcCtrl?.clearValidators();
    }
    srcCtrl?.updateValueAndValidity({ emitEvent: false });
    this.cdr.markForCheck();
  }
}
