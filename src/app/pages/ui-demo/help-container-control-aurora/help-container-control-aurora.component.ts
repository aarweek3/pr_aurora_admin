import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { HelpCopyContainerComponent } from '@shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation/control-documentation.component';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '@shared/components/ui/showcase/showcase.component';
import { DOCUMENTATION } from './help-container-control-aurora.config';

interface HelpContainerPlaygroundConfig {
  title: string;
  content: string;
  width: string;
  height: string;
  bgColor: string;
  showCopy: boolean;
  showHelpButton: boolean;
  helpContent: string;
}

@Component({
  selector: 'app-help-container-control-aurora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTabsModule,
    NzGridModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    HelpCopyContainerComponent,
    ShowcaseComponent,
    ControlDocumentationComponent,
  ],
  templateUrl: './help-container-control-aurora.component.html',
  styleUrls: ['./help-container-control-aurora.component.scss'],
})
export class HelpContainerControlAuroraComponent {
  // --- STATE ---
  config = signal<HelpContainerPlaygroundConfig>({
    title: 'Code Snippet',
    content:
      'export class Aurora {\n  version = "3.0";\n  constructor() {\n    console.log("Ready");\n  }\n}',
    width: '100%',
    height: '200px',
    bgColor: '#1e293b',
    showCopy: true,
    showHelpButton: true,
    helpContent: 'Это встроенная справка для данного фрагмента кода.',
  });

  // --- SHOWCASE CONFIG ---
  showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: '📜 Help Container Control',
      description:
        'Компонент для презентации кода с функционалом копирования и контекстной справки.',
      componentName: 'HelpContainerControlAuroraComponent',
      componentPath:
        'src/app/pages/ui-demo/help-container-control-aurora/help-container-control-aurora.component.ts',
      controlComponent: {
        name: 'HelpCopyContainerComponent',
        path: 'src/app/shared/components/ui/container-help-copy-ui/container-help-copy-ui.component.ts',
      },
    },
    showExamples: true,
    showDocs: true,
    columnSplit: [13, 11],
    resultBlocks: {
      preview: { title: '🔴 Live Demo' },
      code: { title: '📄 Генерированный код' },
      description: { title: '📋 Состояние параметров' },
    },
  };

  documentationConfig = DOCUMENTATION;

  // --- CONSTANTS ---
  readonly widthPresets = [
    { label: '100%', value: '100%' },
    { label: '500px', value: '500px' },
    { label: '300px', value: '300px' },
  ];

  readonly heightPresets = [
    { label: 'Auto', value: 'auto' },
    { label: '150px', value: '150px' },
    { label: '250px', value: '250px' },
    { label: '400px', value: '400px' },
  ];

  // --- COMPUTED ---
  generatedCode = computed(() => {
    const c = this.config();
    const attributes: string[] = [];

    attributes.push(`title="${c.title}"`);
    attributes.push(`[content]="myContent"`);

    if (c.width !== '100%') attributes.push(`width="${c.width}"`);
    if (c.height !== 'auto') attributes.push(`height="${c.height}"`);
    if (c.bgColor) attributes.push(`bgColor="${c.bgColor}"`);
    if (!c.showCopy) attributes.push(`[showCopy]="false"`);
    if (c.showHelpButton) {
      attributes.push(`[showHelpButton]="true"`);
      if (c.helpContent) attributes.push(`helpContent="${c.helpContent}"`);
    }

    const html = `<av-help-copy-container\n  ${attributes.join(
      '\n  ',
    )}\n>\n</av-help-copy-container>`;
    const ts = `myContent = \`${c.content}\`;`;

    return { html, ts };
  });

  codeForShowcase = computed(() => this.generatedCode().html);

  // --- METHODS ---
  updateConfig<K extends keyof HelpContainerPlaygroundConfig>(
    key: K,
    value: HelpContainerPlaygroundConfig[K],
  ): void {
    this.config.update((prev) => ({ ...prev, [key]: value }));
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
