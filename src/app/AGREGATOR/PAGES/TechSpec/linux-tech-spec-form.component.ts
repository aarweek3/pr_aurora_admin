import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
import { LinuxPackageFormat } from './tech-spec.model';

@Component({
  selector: 'app-linux-tech-spec-form',
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
    <div [formGroup]="formGroup" class="linux-spec-form">
      <!-- 1. Общие поля -->
      <app-base-tech-spec-fields [formGroup]="formGroup"></app-base-tech-spec-fields>

      <!-- 2. Секция Linux требований -->
      <nz-divider nzText="Системные требования Linux" nzOrientation="left"></nz-divider>

      <div nz-row [nzGutter]="[16, 16]">
        <!-- ОЗУ -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="minRamMb">Минимальное ОЗУ (МБ)</nz-form-label>
            <nz-form-control>
              <nz-input-number
                formControlName="minRamMb"
                nzPlaceHolder="Напр: 2048 (2 ГБ)"
                [nzMin]="0"
                [nzStep]="512"
                style="width: 100%"
              ></nz-input-number>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Диск -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8">
          <nz-form-item>
            <nz-form-label nzFor="minDiskMb">Место на диске (МБ)</nz-form-label>
            <nz-form-control>
              <nz-input-number
                formControlName="minDiskMb"
                nzPlaceHolder="Напр: 1024 (1 ГБ)"
                [nzMin]="0"
                [nzStep]="512"
                style="width: 100%"
              ></nz-input-number>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Поддерживаемые дистрибутивы -->
        <div nz-col nzXs="24" nzSm="24" nzMd="24">
          <nz-form-item>
            <nz-form-label nzFor="supportedDistributions">Поддерживаемые дистрибутивы</nz-form-label>
            <nz-form-control>
              <nz-select
                formControlName="supportedDistributions"
                nzMode="tags"
                [nzTokenSeparators]="[',', ' ']"
                nzPlaceHolder="Введите дистрибутивы (Напр: Ubuntu, Debian, Fedora, Arch)"
              >
                <nz-option nzValue="Ubuntu" nzLabel="Ubuntu"></nz-option>
                <nz-option nzValue="Debian" nzLabel="Debian"></nz-option>
                <nz-option nzValue="Fedora" nzLabel="Fedora"></nz-option>
                <nz-option nzValue="Arch Linux" nzLabel="Arch Linux"></nz-option>
                <nz-option nzValue="Linux Mint" nzLabel="Linux Mint"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Окружения рабочего стола (DE) -->
        <div nz-col nzXs="24" nzSm="12" nzMd="12">
          <nz-form-item>
            <nz-form-label nzFor="desktopEnvironments">Окружение рабочего стола (DE)</nz-form-label>
            <nz-form-control>
              <nz-select
                formControlName="desktopEnvironments"
                nzMode="tags"
                [nzTokenSeparators]="[',', ' ']"
                nzPlaceHolder="Напр: GNOME, KDE Plasma, XFCE"
              >
                <nz-option nzValue="GNOME" nzLabel="GNOME"></nz-option>
                <nz-option nzValue="KDE Plasma" nzLabel="KDE Plasma"></nz-option>
                <nz-option nzValue="XFCE" nzLabel="XFCE"></nz-option>
                <nz-option nzValue="Cinnamon" nzLabel="Cinnamon"></nz-option>
                <nz-option nzValue="MATE" nzLabel="MATE"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Системные зависимости -->
        <div nz-col nzXs="24" nzSm="12" nzMd="12">
          <nz-form-item>
            <nz-form-label nzFor="dependencies">Ключевые зависимости пакета</nz-form-label>
            <nz-form-control>
              <nz-select
                formControlName="dependencies"
                nzMode="tags"
                [nzTokenSeparators]="[',', ' ']"
                nzPlaceHolder="Напр: libssl, glibc, gtk3"
              >
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- Свитчи дисплейных серверов -->
      <div nz-row [nzGutter]="[24, 16]" style="margin-top: 8px;">
        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Поддержка Wayland</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="supportsWayland"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="12" nzSm="8" nzMd="6">
          <nz-form-item class="switch-item">
            <nz-form-label nzNoColon>Требуется X11 (X.Org)</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="requiresX11"></nz-switch>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- 3. Секция форматов пакетов и пакетных менеджеров -->
      <nz-divider nzText="Дистрибуция Linux и пакеты" nzOrientation="left"></nz-divider>

      <div nz-row [nzGutter]="[16, 16]">
        <!-- Форматы пакетов (синхронизируется с bitmask) -->
        <div nz-col nzSpan="24">
          <nz-form-item>
            <nz-form-label nzFor="formatsSelect">Доступные форматы пакетов</nz-form-label>
            <nz-form-control>
              <nz-select
                [formControl]="formatsCtrl"
                nzMode="multiple"
                nzPlaceHolder="Выберите поддерживаемые форматы дистрибуции"
              >
                <nz-option nzValue="DEB" nzLabel="DEB (Debian/Ubuntu)"></nz-option>
                <nz-option nzValue="RPM" nzLabel="RPM (RedHat/Fedora/CentOS)"></nz-option>
                <nz-option nzValue="AppImage" nzLabel="AppImage (Portable bundle)"></nz-option>
                <nz-option nzValue="Flatpak" nzLabel="Flatpak (Flathub sandboxed)"></nz-option>
                <nz-option nzValue="Snap" nzLabel="Snap (Ubuntu snapcraft)"></nz-option>
                <nz-option nzValue="Tarball" nzLabel="Tarball (.tar.gz / source)"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- Поля для конкретных пакетов на основе выбранных форматов -->
      <div nz-row [nzGutter]="[16, 16]" class="dynamic-package-fields">
        <!-- Flatpak ID -->
        @if (formatsCtrl.value?.includes('Flatpak')) {
          <div nz-col nzXs="24" nzSm="12" class="fade-in">
            <nz-form-item>
              <nz-form-label nzFor="flatpakId">Flatpak Application ID</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="flatpakId" placeholder="Напр: com.spotify.Client" />
              </nz-form-control>
            </nz-form-item>
          </div>
        }

        <!-- Snap Name -->
        @if (formatsCtrl.value?.includes('Snap')) {
          <div nz-col nzXs="24" nzSm="12" class="fade-in">
            <nz-form-item>
              <nz-form-label nzFor="snapName">Snap Store Name</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="snapName" placeholder="Напр: spotify" />
              </nz-form-control>
            </nz-form-item>
          </div>
        }

        <!-- Ссылка на .deb -->
        @if (formatsCtrl.value?.includes('DEB')) {
          <div nz-col nzSpan="24" class="fade-in">
            <nz-form-item>
              <nz-form-label nzFor="debUrl">Ссылка на скачивание .deb пакета</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="debUrl" placeholder="https://domain.com/downloads/package.deb" />
              </nz-form-control>
            </nz-form-item>
          </div>
        }

        <!-- Ссылка на .rpm -->
        @if (formatsCtrl.value?.includes('RPM')) {
          <div nz-col nzSpan="24" class="fade-in">
            <nz-form-item>
              <nz-form-label nzFor="rpmUrl">Ссылка на скачивание .rpm пакета</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="rpmUrl" placeholder="https://domain.com/downloads/package.rpm" />
              </nz-form-control>
            </nz-form-item>
          </div>
        }

        <!-- Ссылка на AppImage -->
        @if (formatsCtrl.value?.includes('AppImage')) {
          <div nz-col nzSpan="24" class="fade-in">
            <nz-form-item>
              <nz-form-label nzFor="appImageUrl">Ссылка на скачивание AppImage</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="appImageUrl" placeholder="https://domain.com/downloads/app.AppImage" />
              </nz-form-control>
            </nz-form-item>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .linux-spec-form {
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
      .dynamic-package-fields {
        margin-top: 8px;
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
export class LinuxTechSpecFormComponent implements OnInit, OnDestroy {
  @Input({ required: true }) formGroup!: FormGroup;

  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // Локальный FormControl для удобного мультиселектора
  formatsCtrl = new FormControl<string[]>([]);

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

      // Linux fields
      minRamMb: [null],
      minDiskMb: [null],
      supportedDistributions: [[]],
      desktopEnvironments: [[]],
      dependencies: [[]],
      supportsWayland: [true],
      requiresX11: [false],
      packageFormats: [0], // bitmask
      flatpakId: [''],
      snapName: [''],
      debUrl: [''],
      rpmUrl: [''],
      appImageUrl: [''],
    });
  }

  ngOnInit(): void {
    // 1. Синхронизируем начальное значение битовой маски в локальный массив
    const initialMask = this.formGroup.get('packageFormats')?.value || 0;
    this.formatsCtrl.setValue(this.getFormatsArray(initialMask), { emitEvent: false });

    // 2. Отслеживаем внешние изменения (patchValue) -> локальный массив
    this.formGroup
      .get('packageFormats')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((mask) => {
        const arr = this.getFormatsArray(mask || 0);
        if (JSON.stringify(arr) !== JSON.stringify(this.formatsCtrl.value)) {
          this.formatsCtrl.setValue(arr, { emitEvent: false });
          this.cdr.markForCheck();
        }
      });

    // 3. Отслеживаем локальные изменения -> битовая маска в FormGroup
    this.formatsCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((arr) => {
      const mask = this.getFormatsBitmask(arr || []);
      this.formGroup.get('packageFormats')?.setValue(mask, { emitEvent: true });
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Конвертирует битовую маску в массив строк для nz-select
   */
  private getFormatsArray(mask: number): string[] {
    const arr: string[] = [];
    if ((mask & LinuxPackageFormat.DEB) === LinuxPackageFormat.DEB) arr.push('DEB');
    if ((mask & LinuxPackageFormat.RPM) === LinuxPackageFormat.RPM) arr.push('RPM');
    if ((mask & LinuxPackageFormat.AppImage) === LinuxPackageFormat.AppImage) arr.push('AppImage');
    if ((mask & LinuxPackageFormat.Flatpak) === LinuxPackageFormat.Flatpak) arr.push('Flatpak');
    if ((mask & LinuxPackageFormat.Snap) === LinuxPackageFormat.Snap) arr.push('Snap');
    if ((mask & LinuxPackageFormat.Tarball) === LinuxPackageFormat.Tarball) arr.push('Tarball');
    return arr;
  }

  /**
   * Конвертирует массив строк nz-select в битовую маску для бэкенда
   */
  private getFormatsBitmask(arr: string[]): number {
    let mask = 0;
    if (arr.includes('DEB')) mask |= LinuxPackageFormat.DEB;
    if (arr.includes('RPM')) mask |= LinuxPackageFormat.RPM;
    if (arr.includes('AppImage')) mask |= LinuxPackageFormat.AppImage;
    if (arr.includes('Flatpak')) mask |= LinuxPackageFormat.Flatpak;
    if (arr.includes('Snap')) mask |= LinuxPackageFormat.Snap;
    if (arr.includes('Tarball')) mask |= LinuxPackageFormat.Tarball;
    return mask;
  }
}
