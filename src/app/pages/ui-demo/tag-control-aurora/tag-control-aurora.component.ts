import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation/control-documentation.component';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '@shared/components/ui/showcase/showcase.component';
import {
  TagColor,
  TagComponent,
  TagInputComponent,
  TagShape,
  TagSize,
  TagVariant,
} from '@shared/components/ui/tag';
import { DOCUMENTATION } from './tag-control-aurora.config';

interface TagPlaygroundConfig {
  label: string;
  size: TagSize;
  variant: TagVariant;
  color: TagColor | string;
  shape: TagShape;
  removable: boolean;
  clickable: boolean;
  icon: string | null;
  // Input settings
  placeholder: string;
  allowDuplicates: boolean;
  maxTags: number | undefined;
}

@Component({
  selector: 'tag-control-aurora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTabsModule,
    NzGridModule,
    NzRadioModule,
    NzCheckboxModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzSwitchModule,
    TagComponent,
    TagInputComponent,
    ShowcaseComponent,
    ControlDocumentationComponent,
  ],
  templateUrl: './tag-control-aurora.component.html',
  styleUrls: ['./tag-control-aurora.component.scss'],
})
export class TagControlAuroraComponent {
  // --- STATE ---
  config = signal<TagPlaygroundConfig>({
    label: 'Interactive Tag',
    size: 'medium',
    variant: 'soft',
    color: 'primary',
    shape: 'rounded',
    removable: false,
    clickable: false,
    icon: null,
    placeholder: 'Add tags...',
    allowDuplicates: false,
    maxTags: undefined,
  });

  // Independent state for tag input demo
  tagsList = signal(['Angular', 'Aurora', 'Signals']);

  // --- SHOWCASE CONFIG ---
  showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: '🏷️ Tag Control Aurora',
      description:
        'Гибкая система тегов и полей ввода списков для современной классификации данных.',
      componentName: 'TagControlAuroraComponent',
      componentPath: 'src/app/pages/ui-demo/tag-control-aurora/tag-control-aurora.component.ts',
      controlComponent: {
        name: 'TagComponent (av-tag)',
        path: 'src/app/shared/components/ui/tag/tag.component.ts',
      },
    },
    showExamples: true,
    showDocs: true,
    columnSplit: [13, 11],
    resultBlocks: {
      preview: { title: '🔴 Live Demo' },
      code: { title: '📄 Генерированный код' },
      description: { title: '📋 Состояние стейта' },
    },
  };

  documentationConfig = DOCUMENTATION;

  // --- CONSTANTS ---
  readonly colors = [
    { label: 'Primary', value: 'primary' },
    { label: 'Success', value: 'success' },
    { label: 'Warning', value: 'warning' },
    { label: 'Error', value: 'error' },
    { label: 'Info', value: 'info' },
    { label: 'Neutral', value: 'neutral' },
  ];

  readonly variants: { label: string; value: TagVariant }[] = [
    { label: 'Soft', value: 'soft' },
    { label: 'Filled', value: 'filled' },
    { label: 'Outlined', value: 'outlined' },
  ];

  readonly sizes: { label: string; value: TagSize }[] = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
  ];

  readonly shapes: { label: string; value: TagShape }[] = [
    { label: 'Rounded', value: 'rounded' },
    { label: 'Pill', value: 'pill' },
  ];

  readonly icons = [
    { label: 'None', value: null },
    { label: 'Settings', value: 'actions/av_settings' },
    { label: 'User', value: 'actions/av_user' },
    { label: 'Check', value: 'actions/av_check_mark' },
    { label: 'Star', value: 'actions/av_star' },
  ];

  // --- COMPUTED ---
  generatedCode = computed(() => {
    const c = this.config();
    const tags = this.tagsList();

    let tagHtml = `<av-tag\n  label="${c.label}"\n  color="${c.color}"\n  variant="${c.variant}"`;
    if (c.size !== 'medium') tagHtml += `\n  size="${c.size}"`;
    if (c.shape !== 'rounded') tagHtml += `\n  shape="${c.shape}"`;
    if (c.icon) tagHtml += `\n  icon="${c.icon}"`;
    if (c.removable) tagHtml += `\n  [removable]="true"`;
    if (c.clickable) tagHtml += `\n  [clickable]="true"`;
    tagHtml += `\n></av-tag>`;

    let inputHtml = `<av-tag-input\n  [(tags)]="myTags"\n  placeholder="${c.placeholder}"\n  color="${c.color}"\n  variant="${c.variant}"`;
    if (c.allowDuplicates) inputHtml += `\n  [allowDuplicates]="true"`;
    if (c.maxTags) inputHtml += `\n  [maxTags]="${c.maxTags}"`;
    inputHtml += `\n></av-tag-input>`;

    return {
      html: `<!-- Одиночный тег -->\n${tagHtml}\n\n<!-- Поле ввода -->\n${inputHtml}`,
      typescript: `myTags = signal(${JSON.stringify(tags)});`,
    };
  });

  codeForShowcase = computed(() => this.generatedCode().html);

  // --- METHODS ---
  updateConfig<K extends keyof TagPlaygroundConfig>(key: K, value: TagPlaygroundConfig[K]): void {
    this.config.update((prev) => ({ ...prev, [key]: value }));
  }

  onTagAction(type: string, label: string): void {
    console.log(`Tag ${type}: ${label}`);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
