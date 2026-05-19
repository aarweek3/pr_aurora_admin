import {
  Component,
  Input,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Ng-Zorro Modules
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCardModule } from 'ng-zorro-antd/card';

// Child components & models
import { BaseTechSpecFieldsComponent } from './base-tech-spec-fields.component';
import { SystemRequirementApiService } from '../SPRAVKA/SystemRequirementPage/services/system-requirement-api.service';
import { PlatformOsVersionDto } from '../SPRAVKA/SystemRequirementPage/models/system-requirement.model';
import { AgeRatingIos } from './tech-spec.model';

@Component({
  selector: 'app-ios-tech-spec-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    NzGridModule,
    NzDividerModule,
    NzInputNumberModule,
    NzCardModule,
    BaseTechSpecFieldsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [formGroup]="formGroup" class="ios-spec-form">
      <!-- 1. Общие поля -->
      <app-base-tech-spec-fields [formGroup]="formGroup"></app-base-tech-spec-fields>

      <!-- 2. Секция iOS требований -->
      <nz-divider nzText="Системные требования iOS / iPadOS" nzOrientation="left"></nz-divider>

      <div nz-row [nzGutter]="[16, 16]">
        <!-- Минимальная ОС iOS -->
        <div nz-col nzXs="24" nzSm="12" nzMd="12">
          <nz-form-item>
            <nz-form-label nzFor="minOsVersionId">Минимальная версия iOS / iPadOS</nz-form-label>
            <nz-form-control>
              <nz-select
                formControlName="minOsVersionId"
                nzPlaceHolder="Напр: iOS 15"
                nzShowSearch
                nzAllowClear
                [nzLoading]="osLoading"
              >
                @for (os of osVersions; track os.id) {
                  <nz-option [nzValue]="os.id" [nzLabel]="os.name"></nz-option>
                }
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Требуемые разрешения (Permissions) -->
        <div nz-col nzSpan="24">
          <nz-form-item>
            <nz-form-label nzFor="permissionsRequired">Необходимые разрешения (Permissions)</nz-form-label>
            <nz-form-control>
              <nz-select
                formControlName="permissionsRequired"
                nzMode="tags"
                [nzTokenSeparators]="[',', ' ']"
                nzPlaceHolder="Введите необходимые разрешения (Напр: camera, microphone, location)"
              >
                <nz-option nzValue="camera" nzLabel="NSCameraUsageDescription (Камера)"></nz-option>
                <nz-option nzValue="microphone" nzLabel="NSMicrophoneUsageDescription (Микрофон)"></nz-option>
                <nz-option nzValue="location" nzLabel="NSLocationWhenInUseUsageDescription (Геолокация)"></nz-option>
                <nz-option nzValue="photoLibrary" nzLabel="NSPhotoLibraryUsageDescription (Фотогалерея)"></nz-option>
                <nz-option nzValue="contacts" nzLabel="NSContactsUsageDescription (Контакты)"></nz-option>
                <nz-option nzValue="calendars" nzLabel="NSCalendarsUsageDescription (Календарь)"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- Свитчи iOS поддержки устройств -->
      <div nz-row [nzGutter]="[24, 16]" style="margin-top: 8px;">
        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Поддержка iPhone</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsIphone"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Поддержка iPad (iPadOS)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsIpad"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Поддержка Apple Watch (watchOS)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsAppleWatch"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Поддержка Mac Catalyst (macOS)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsMacCatalyst"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Поддержка Apple TV (tvOS)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsAppleTv"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- Функциональные свитчи iOS -->
      <nz-divider nzText="Возможности системы iOS" nzOrientation="left"></nz-divider>

      <div nz-row [nzGutter]="[24, 16]">
        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Виджеты на экране</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="hasWidgets"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Интеграция с Siri</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="hasSiriIntegration"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Синхронизация iCloud</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="hasICloudSync"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Семейный доступ</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="hasFamilySharing"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Активные Live Activities</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="hasLiveActivities"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Кнопка «Поделиться» (Share Ext)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="hasShareExtension"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- 3. Секция дистрибуции App Store -->
      <nz-divider nzText="Дистрибуция App Store" nzOrientation="left"></nz-divider>

      <div nz-row [nzGutter]="[16, 16]">
        <!-- Возрастной рейтинг App Store -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="ageRating">Возрастной рейтинг</nz-form-label>
            <nz-form-control>
              <nz-select formControlName="ageRating">
                <nz-option [nzValue]="AgeRatingIos.Rating4Plus" nzLabel="4+"></nz-option>
                <nz-option [nzValue]="AgeRatingIos.Rating9Plus" nzLabel="9+"></nz-option>
                <nz-option [nzValue]="AgeRatingIos.Rating12Plus" nzLabel="12+"></nz-option>
                <nz-option [nzValue]="AgeRatingIos.Rating17Plus" nzLabel="17+"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- App Store App ID -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="appStoreId">App Store Apple ID</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="appStoreId" placeholder="Напр: id389801252" />
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- App Store URL -->
        <div nz-col nzXs="24" nzSm="24" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="appStoreUrl">Прямая ссылка в App Store</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="appStoreUrl" placeholder="https://apps.apple.com/app/..." />
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .ios-spec-form {
        background: #fff;
        padding: 0;
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
    `,
  ],
})
export class IosTechSpecFormComponent implements OnInit {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) platformId!: number;

  private reqApi = inject(SystemRequirementApiService);
  private cdr = inject(ChangeDetectorRef);

  osVersions: PlatformOsVersionDto[] = [];
  osLoading = false;

  AgeRatingIos = AgeRatingIos;

  /**
   * Статический хелпер для инициализации FormGroup в родительском компоненте
   */
  static createFormGroup(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [0],
      versionId: [0],

      // Base fields
      licenseTypeId: [null, [Validators.required]],
      price: [null],
      currency: [null],
      fileSizeMb: [null],
      installedSizeMb: [null],
      architecture: [[]],
      isPortable: [false],
      hasAutoUpdate: [false],
      isOpenSource: [false],
      sourceCodeUrl: [''],
      requiresInternet: [false],
      supportsOffline: [false],
      inAppPurchases: [false],
      supportedLanguages: [[]],

      // iOS fields
      minOsVersionId: [null],
      supportsIphone: [true],
      supportsIpad: [true],
      supportsAppleWatch: [false],
      supportsMacCatalyst: [false],
      supportsAppleTv: [false],
      appStoreId: [''],
      appStoreUrl: [''],
      ageRating: [AgeRatingIos.Rating4Plus],
      hasWidgets: [false],
      hasSiriIntegration: [false],
      hasICloudSync: [false],
      hasFamilySharing: [false],
      hasLiveActivities: [false],
      hasShareExtension: [false],
      permissionsRequired: [[]],
    });
  }

  ngOnInit(): void {
    this.loadOsVersions();
  }

  private loadOsVersions(): void {
    if (!this.platformId) return;

    this.osLoading = true;
    this.reqApi
      .getOsVersions({
        pageNumber: 1,
        pageSize: 100,
        platformId: this.platformId,
        showDeleted: false,
      })
      .subscribe({
        next: (res) => {
          this.osVersions = res.items;
          this.osLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.osLoading = false;
          this.cdr.markForCheck();
        },
      });
  }
}
