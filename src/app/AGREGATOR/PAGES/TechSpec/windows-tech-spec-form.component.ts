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
import { WindowsInstallerType } from './tech-spec.model';

@Component({
  selector: 'app-windows-tech-spec-form',
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
    <div [formGroup]="formGroup" class="windows-spec-form">
      <!-- 1. Встраиваем общие поля (лицензия, размер, свитчи возможностей) -->
      <app-base-tech-spec-fields [formGroup]="formGroup"></app-base-tech-spec-fields>

      <!-- 2. Секция Windows системных требований -->
      <nz-divider nzText="Системные требования Windows" nzOrientation="left"></nz-divider>

      <div nz-row [nzGutter]="[16, 16]">
        <!-- Минимальная ОС Windows -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="minOsVersionId">Минимальная версия Windows</nz-form-label>
            <nz-form-control>
              <nz-select
                formControlName="minOsVersionId"
                nzPlaceHolder="Напр: Windows 10"
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
                nzPlaceHolder="Напр: 4096 (4 ГБ)"
                [nzMin]="0"
                [nzStep]="512"
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
                nzPlaceHolder="Напр: 2048 (2 ГБ)"
                [nzMin]="0"
                [nzStep]="1024"
                style="width: 100%"
              ></nz-input-number>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Процессор -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="minCpu">Процессор</nz-form-label>
            <nz-form-control>
              <input
                nz-input
                formControlName="minCpu"
                placeholder="Intel Core i3 / AMD Ryzen 3..."
              />
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- .NET Framework / Core -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="requiresDotNet">Требуемая версия .NET</nz-form-label>
            <nz-form-control>
              <input
                nz-input
                formControlName="requiresDotNet"
                placeholder="Напр: .NET 8.0, Framework 4.8"
              />
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- DirectX -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="requiresDirectX">Требуемая версия DirectX</nz-form-label>
            <nz-form-control>
              <nz-select formControlName="requiresDirectX" nzPlaceHolder="Выберите версию" nzAllowClear>
                <nz-option nzValue="DirectX 9" nzLabel="DirectX 9"></nz-option>
                <nz-option nzValue="DirectX 11" nzLabel="DirectX 11"></nz-option>
                <nz-option nzValue="DirectX 12" nzLabel="DirectX 12"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- Свитчи системные -->
      <div nz-row [nzGutter]="[24, 16]" style="margin-top: 8px;">
        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Требуется Visual C++ Redist</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="requiresVcRedist"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Права администратора</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="requiresAdminRights"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Тихая установка (/S /silent)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsSilentInstall"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Оптимизация High DPI</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsHighDpi"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Поддержка тачскрина</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsTouchscreen"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- 3. Секция дистрибуции -->
      <nz-divider nzText="Дистрибуция и пакетные менеджеры" nzOrientation="left"></nz-divider>

      <div nz-row [nzGutter]="[16, 16]">
        <!-- Тип установщика -->
        <div nz-col nzXs="24" nzSm="12" nzMd="6">
          <nz-form-item>
            <nz-form-label nzFor="installerType">Тип установщика</nz-form-label>
            <nz-form-control>
              <nz-select formControlName="installerType">
                <nz-option [nzValue]="WindowsInstallerType.MSI" nzLabel="MSI (Windows Installer)"></nz-option>
                <nz-option [nzValue]="WindowsInstallerType.EXE" nzLabel="EXE (Executable File)"></nz-option>
                <nz-option [nzValue]="WindowsInstallerType.MSIX" nzLabel="MSIX (Modern App Package)"></nz-option>
                <nz-option [nzValue]="WindowsInstallerType.Portable" nzLabel="Portable (Без установки)"></nz-option>
                <nz-option [nzValue]="WindowsInstallerType.Winget" nzLabel="Winget Package"></nz-option>
                <nz-option [nzValue]="WindowsInstallerType.Store" nzLabel="Microsoft Store"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Winget ID -->
        <div nz-col nzXs="24" nzSm="12" nzMd="6">
          <nz-form-item>
            <nz-form-label nzFor="wingetId">Winget ID</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="wingetId" placeholder="Напр: Google.Chrome" />
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Chocolatey ID -->
        <div nz-col nzXs="24" nzSm="12" nzMd="6">
          <nz-form-item>
            <nz-form-label nzFor="chocolateyId">Chocolatey ID</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="chocolateyId" placeholder="Напр: googlechrome" />
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Scoop Bucket -->
        <div nz-col nzXs="24" nzSm="12" nzMd="6">
          <nz-form-item>
            <nz-form-label nzFor="scoopBucket">Scoop Bucket / App</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="scoopBucket" placeholder="Напр: extras/chrome" />
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- 4. Microsoft Store Секция -->
      <div nz-row [nzGutter]="[16, 16]" style="margin-top: 8px;">
        <div nz-col nzSpan="24">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Доступно в Microsoft Store</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="hasWindowsStore"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      @if (formGroup.get('hasWindowsStore')?.value) {
        <div nz-row [nzGutter]="[16, 16]" class="fade-in">
          <!-- Store ID -->
          <div nz-col nzXs="24" nzSm="12">
            <nz-form-item>
              <nz-form-label nzFor="storeId">Microsoft Store ID</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="storeId" placeholder="Напр: 9WZDNCRFJC3I" />
              </nz-form-control>
            </nz-form-item>
          </div>

          <!-- Store URL -->
          <div nz-col nzXs="24" nzSm="12">
            <nz-form-item>
              <nz-form-label nzFor="storeUrl">Прямая ссылка на Store</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="storeUrl" placeholder="https://apps.microsoft.com/..." />
              </nz-form-control>
            </nz-form-item>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .windows-spec-form {
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
export class WindowsTechSpecFormComponent implements OnInit {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) platformId!: number;

  private reqApi = inject(SystemRequirementApiService);
  private cdr = inject(ChangeDetectorRef);

  osVersions: PlatformOsVersionDto[] = [];
  osLoading = false;

  WindowsInstallerType = WindowsInstallerType;

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

      // Windows fields
      minOsVersionId: [null],
      minRamMb: [null],
      minDiskMb: [null],
      minCpu: [''],
      requiresDotNet: [''],
      requiresVcRedist: [false],
      requiresDirectX: [null],
      requiresAdminRights: [false],
      supportsSilentInstall: [false],
      supportsHighDpi: [true],
      supportsTouchscreen: [false],
      installerType: [WindowsInstallerType.MSI],
      wingetId: [''],
      chocolateyId: [''],
      scoopBucket: [''],
      hasWindowsStore: [false],
      storeId: [''],
      storeUrl: [''],
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
