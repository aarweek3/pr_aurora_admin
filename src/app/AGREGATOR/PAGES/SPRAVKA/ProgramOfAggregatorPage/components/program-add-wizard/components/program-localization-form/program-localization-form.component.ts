import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { AvTinymceControlComponent } from '@controls';
import { SeoFormComponent } from '@shared-ui';

import { AppLanguage } from '@language-app/models/appLanguage.model';
import { TagOfAggregatorItem } from '../../../../../TagOfAggregatorPage/models/tag-of-aggregator.model';
import { ProgramFormBuilderService } from '../../program-form-builder.service';
import { ProgramLookupService } from '../../program-lookup.service';
import tooltips from '../../program-tooltips.json';

@Component({
  selector: 'app-program-localization-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTabsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzDividerModule,
    NzSelectModule,
    NzToolTipModule,
    NzGridModule,
    NzSpinModule,
    AvTinymceControlComponent,
    SeoFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './program-localization-form.component.html',
})
export class ProgramLocalizationFormComponent implements OnInit, OnDestroy {
  public tooltips = tooltips;
  private formBuilderService = inject(ProgramFormBuilderService);
  private lookupService = inject(ProgramLookupService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  @Input() form!: FormGroup;
  @Input() languages: AppLanguage[] = [];

  selectedLangIndex = 0;
  tags: TagOfAggregatorItem[] = [];
  tagsLoading = false;
  tagLangControl = new FormControl<number | null>(null);

  ngOnInit(): void {
    // Initial tags load
    this.loadTags(null);

    // Subscribe to tag language dropdown changes
    this.tagLangControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => this.loadTags(val));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  onTabClick(langId: number): void {
    const index = this.languages.findIndex((l) => l.id === langId);
    if (index !== -1) {
      this.selectedLangIndex = index;
    }
  }

  isTabInvalid(langId: number): boolean {
    const group = this.getLocGroup(langId);
    return !!group && group.invalid && (group.touched || group.dirty);
  }

  onLocalizedNameInput(langId: number): void {
    const group = this.getLocGroup(langId);
    const name = group?.get('name')?.value;
    if (name) {
      const seoTitle = group?.get('seoData')?.get('metaTitle');
      if (!seoTitle?.value) {
        seoTitle?.setValue(name);
      }
    }
  }

  // Pros/Cons lists
  getProsArray(langId: number): FormArray {
    return this.getLocGroup(langId)?.get('pros') as FormArray;
  }

  getConsArray(langId: number): FormArray {
    return this.getLocGroup(langId)?.get('cons') as FormArray;
  }

  addPro(langId: number): void {
    this.formBuilderService.addPro(this.form, langId);
  }

  removePro(langId: number, index: number): void {
    this.formBuilderService.removePro(this.form, langId, index);
  }

  addCons(langId: number): void {
    this.formBuilderService.addCons(this.form, langId);
  }

  removeCons(langId: number, index: number): void {
    this.formBuilderService.removeCons(this.form, langId, index);
  }

  private loadTags(langId: number | null): void {
    this.tagsLoading = true;
    this.cdr.markForCheck();

    this.lookupService
      .loadTags(langId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tags: TagOfAggregatorItem[]) => {
          this.tags = tags;
          this.tagsLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.tagsLoading = false;
          this.cdr.markForCheck();
        },
      });
  }
}
