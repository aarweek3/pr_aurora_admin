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
import { AgeRatingAndroid } from './tech-spec.model';

@Component({
  selector: 'app-android-tech-spec-form',
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
    <div [formGroup]="formGroup" class="android-spec-form">
      <!-- 1. Общие поля -->
      <app-base-tech-spec-fields [formGroup]="formGroup"></app-base-tech-spec-fields>

      <!-- 2. Секция Android требований -->
      <nz-divider nzText="Системные требования Android" nzOrientation="left"></nz-divider>

      <div nz-row [nzGutter]="[16, 16]">
        <!-- Минимальная ОС Android -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="minOsVersionId">Минимальная версия ОС</nz-form-label>
            <nz-form-control>
              <nz-select
                formControlName="minOsVersionId"
                nzPlaceHolder="Напр: Android 10"
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

        <!-- Min SDK Level -->
        <div nz-col nzXs="12" nzSm="6" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="minSdkVersion">Min SDK API Level</nz-form-label>
            <nz-form-control>
              <nz-input-number
                formControlName="minSdkVersion"
                nzPlaceHolder="Напр: 29 (Android 10)"
                [nzMin]="1"
                style="width: 100%"
              ></nz-input-number>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Target SDK Level -->
        <div nz-col nzXs="12" nzSm="6" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="targetSdkVersion">Target SDK API Level</nz-form-label>
            <nz-form-control>
              <nz-input-number
                formControlName="targetSdkVersion"
                nzPlaceHolder="Напр: 34 (Android 14)"
                [nzMin]="1"
                style="width: 100%"
              ></nz-input-number>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Требуемые разрешения Android (Permissions) -->
        <div nz-col nzSpan="24">
          <nz-form-item>
            <nz-form-label nzFor="permissionsRequired">Необходимые разрешения (Permissions)</nz-form-label>
            <nz-form-control>
              <nz-select
                formControlName="permissionsRequired"
                nzMode="tags"
                [nzTokenSeparators]="[',', ' ']"
                nzPlaceHolder="Введите необходимые разрешения (Напр: CAMERA, WRITE_EXTERNAL_STORAGE)"
              >
                <nz-option nzValue="CAMERA" nzLabel="CAMERA (Камера)"></nz-option>
                <nz-option nzValue="INTERNET" nzLabel="INTERNET (Доступ в интернет)"></nz-option>
                <nz-option nzValue="ACCESS_FINE_LOCATION" nzLabel="ACCESS_FINE_LOCATION (Геолокация)"></nz-option>
                <nz-option nzValue="RECORD_AUDIO" nzLabel="RECORD_AUDIO (Микрофон)"></nz-option>
                <nz-option nzValue="READ_CONTACTS" nzLabel="READ_CONTACTS (Контакты)"></nz-option>
                <nz-option nzValue="POST_NOTIFICATIONS" nzLabel="POST_NOTIFICATIONS (Уведомления)"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- Свитчи Android поддержки устройств и особенностей -->
      <div nz-row [nzGutter]="[24, 16]" style="margin-top: 8px;">
        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Поддержка Android TV</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsAndroidTv"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Поддержка WearOS (Часы)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsWearOs"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Поддержка Chromebook (ChromeOS)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsChromebook"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Поддержка гибких экранов (Foldable)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsFoldable"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Требуются Google Play Services</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="requiresGoogleServices"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Адаптивная иконка (Adaptive Icon)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="hasAdaptiveIcon"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- 3. Секция дистрибуции Google Play -->
      <nz-divider nzText="Дистрибуция Google Play" nzOrientation="left"></nz-divider>

      <div nz-row [nzGutter]="[16, 16]">
        <!-- Возрастной рейтинг Google Play -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="ageRating">Возрастной рейтинг</nz-form-label>
            <nz-form-control>
              <nz-select formControlName="ageRating">
                <nz-option [nzValue]="AgeRatingAndroid.Everyone" nzLabel="3+ (Everyone)"></nz-option>
                <nz-option [nzValue]="AgeRatingAndroid.Everyone10Plus" nzLabel="10+ (Everyone 10+)"></nz-option>
                <nz-option [nzValue]="AgeRatingAndroid.Teen" nzLabel="12+ (Teen)"></nz-option>
                <nz-option [nzValue]="AgeRatingAndroid.Mature17Plus" nzLabel="18+ (Mature 17+)"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Google Play Package ID -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="googlePlayId">Google Play Package ID</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="googlePlayId" placeholder="Напр: com.android.chrome" />
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Google Play URL -->
        <div nz-col nzXs="24" nzSm="24" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="googlePlayUrl">Ссылка в Google Play</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="googlePlayUrl" placeholder="https://play.google.com/store/apps/details?id=..." />
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- 4. Прямая установка (APK) -->
      <nz-divider nzText="Прямая дистрибуция файлов" nzOrientation="left"></nz-divider>

      <div nz-row [nzGutter]="[16, 16]">
        <div nz-col nzSpan="24">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Скачивание APK напрямую</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="hasApkDownload"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        @if (formGroup.get('hasApkDownload')?.value) {
          <div nz-col nzSpan="24" class="fade-in">
            <nz-form-item>
              <nz-form-label nzFor="apkUrl">Прямая ссылка на .apk файл</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="apkUrl" placeholder="https://domain.com/downloads/app.apk" />
              </nz-form-control>
            </nz-form-item>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .android-spec-form {
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
export class AndroidTechSpecFormComponent implements OnInit {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) platformId!: number;

  private reqApi = inject(SystemRequirementApiService);
  private cdr = inject(ChangeDetectorRef);

  osVersions: PlatformOsVersionDto[] = [];
  osLoading = false;

  AgeRatingAndroid = AgeRatingAndroid;

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

      // Android fields
      minOsVersionId: [null],
      minSdkVersion: [null],
      targetSdkVersion: [null],
      googlePlayId: [''],
      googlePlayUrl: [''],
      ageRating: [AgeRatingAndroid.Everyone],
      hasApkDownload: [false],
      apkUrl: [''],
      supportsAndroidTv: [false],
      supportsWearOs: [false],
      supportsChromebook: [false],
      supportsFoldable: [false],
      requiresGoogleServices: [false],
      hasAdaptiveIcon: [true],
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
