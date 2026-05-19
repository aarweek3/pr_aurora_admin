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
import { MacInstallerType } from './tech-spec.model';

@Component({
  selector: 'app-macos-tech-spec-form',
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
    <div [formGroup]="formGroup" class="macos-spec-form">
      <!-- 1. Общие поля -->
      <app-base-tech-spec-fields [formGroup]="formGroup"></app-base-tech-spec-fields>

      <!-- 2. Секция macOS требований -->
      <nz-divider nzText="Системные требования macOS" nzOrientation="left"></nz-divider>

      <div nz-row [nzGutter]="[16, 16]">
        <!-- Минимальная ОС macOS -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="minOsVersionId">Минимальная версия macOS</nz-form-label>
            <nz-form-control>
              <nz-select
                formControlName="minOsVersionId"
                nzPlaceHolder="Напр: macOS 11 Big Sur"
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

        <!-- ОЗУ -->
        <div nz-col nzXs="12" nzSm="6" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="minRamMb">Мин. ОЗУ (МБ)</nz-form-label>
            <nz-form-control>
              <nz-input-number
                formControlName="minRamMb"
                nzPlaceHolder="Напр: 8192 (8 ГБ)"
                [nzMin]="0"
                [nzStep]="1024"
                style="width: 100%"
              ></nz-input-number>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Диск -->
        <div nz-col nzXs="12" nzSm="6" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="minDiskMb">Мин. место на диске (МБ)</nz-form-label>
            <nz-form-control>
              <nz-input-number
                formControlName="minDiskMb"
                nzPlaceHolder="Напр: 4096 (4 ГБ)"
                [nzMin]="0"
                [nzStep]="1024"
                style="width: 100%"
              ></nz-input-number>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Процессор -->
        <div nz-col nzXs="24" nzSm="24" nzMd="24">
          <nz-form-item>
            <nz-form-label nzFor="minCpu">Процессор (Дополнительно)</nz-form-label>
            <nz-form-control>
              <input
                nz-input
                formControlName="minCpu"
                placeholder="Напр: Apple M1 или Intel Core i5"
              />
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- Свитчи macOS архитектур и параметров безопасности -->
      <div nz-row [nzGutter]="[24, 16]" style="margin-top: 8px;">
        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Поддержка Apple Silicon (M1/M2/M3)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsAppleSilicon"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Поддержка Intel процессоров</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsIntel"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Универсальный бинарник (Universal)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="isUniversalBinary"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Требуется Rosetta 2 (для Apple Silicon)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="requiresRosetta"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Работа в песочнице (Sandboxed)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="isSandboxed"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Нотариально заверен Apple (Notarized)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="isNotarized"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- 3. Секция установщика и Mac App Store -->
      <nz-divider nzText="Дистрибуция и Mac App Store" nzOrientation="left"></nz-divider>

      <div nz-row [nzGutter]="[16, 16]">
        <!-- Тип macOS установщика -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="installerType">Формат установщика</nz-form-label>
            <nz-form-control>
              <nz-select formControlName="installerType">
                <nz-option [nzValue]="MacInstallerType.DMG" nzLabel="DMG (Disk Image)"></nz-option>
                <nz-option [nzValue]="MacInstallerType.PKG" nzLabel="PKG (macOS Installer)"></nz-option>
                <nz-option [nzValue]="MacInstallerType.ZIP" nzLabel="ZIP (Archive) / APP (Standalone Bundle)"></nz-option>
                <nz-option [nzValue]="MacInstallerType.Homebrew" nzLabel="Homebrew Cask"></nz-option>
                <nz-option [nzValue]="MacInstallerType.AppStore" nzLabel="Mac App Store"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Homebrew Cask -->
        <div nz-col nzXs="24" nzSm="12" nzMd="16">
          <nz-form-item>
            <nz-form-label nzFor="homebrewCask">Homebrew Cask ID</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="homebrewCask" placeholder="Напр: brew install --cask google-chrome" />
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- App Store свитч -->
      <div nz-row [nzGutter]="[16, 16]" style="margin-top: 8px;">
        <div nz-col nzSpan="24">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Доступно в Mac App Store</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="hasAppStore"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      @if (formGroup.get('hasAppStore')?.value) {
        <div nz-row [nzGutter]="[16, 16]" class="fade-in">
          <!-- App Store ID -->
          <div nz-col nzXs="24" nzSm="12">
            <nz-form-item>
              <nz-form-label nzFor="appStoreId">Mac App Store ID</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="appStoreId" placeholder="Напр: id409201541" />
              </nz-form-control>
            </nz-form-item>
          </div>

          <!-- App Store URL -->
          <div nz-col nzXs="24" nzSm="12">
            <nz-form-item>
              <nz-form-label nzFor="appStoreUrl">Прямая ссылка на Mac App Store</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="appStoreUrl" placeholder="https://apps.apple.com/app/..." />
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .macos-spec-form {
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
export class MacOsTechSpecFormComponent implements OnInit {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) platformId!: number;

  private reqApi = inject(SystemRequirementApiService);
  private cdr = inject(ChangeDetectorRef);

  osVersions: PlatformOsVersionDto[] = [];
  osLoading = false;

  MacInstallerType = MacInstallerType;

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

      // macOS fields
      minOsVersionId: [null],
      minRamMb: [null],
      minDiskMb: [null],
      minCpu: [''],
      supportsAppleSilicon: [true],
      supportsIntel: [true],
      isUniversalBinary: [true],
      requiresRosetta: [false],
      isSandboxed: [false],
      isNotarized: [true],
      installerType: [MacInstallerType.DMG],
      homebrewCask: [''],
      hasAppStore: [false],
      appStoreId: [''],
      appStoreUrl: [''],
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
