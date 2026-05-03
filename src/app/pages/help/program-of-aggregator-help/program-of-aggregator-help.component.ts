import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { HelpCopyContainerComponent, HelpPathHeaderComponent } from '@shared/components/ui';
import {
  ACTION_COLUMN_TEMPLATE,
  CORE_FIELDS,
  FALLBACK_CODE_SAMPLE,
  LOC_FIELDS,
  MARKET_FIELDS,
  MASTER_FIELDS,
  MERMAID_CODE,
  PLATFORM_FIELDS,
  PLATFORM_HIERARCHY_DOC,
  SEARCH_CODE_SAMPLE,
  SEARCH_PROMPT,
  SERVICE_PROMPT,
  VERSION_FIELDS,
} from './program-of-aggregator-help.data';

@Component({
  selector: 'app-program-of-aggregator-help',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTabsModule,
    NzTableModule,
    NzCardModule,
    NzTagModule,
    NzAlertModule,
    NzCollapseModule,
    NzCheckboxModule,
    HelpPathHeaderComponent,
    HelpCopyContainerComponent,
  ],
  templateUrl: './program-of-aggregator-help.component.html',
  styleUrls: ['./program-of-aggregator-help.component.css'],
})
export class ProgramOfAggregatorHelpComponent {
  coreFields = CORE_FIELDS;
  locFields = LOC_FIELDS;
  versionFields = VERSION_FIELDS;
  platformFields = PLATFORM_FIELDS;
  marketFields = MARKET_FIELDS;
  masterFields = MASTER_FIELDS;
  mermaidCode = MERMAID_CODE;
  platformHierarchyDoc = PLATFORM_HIERARCHY_DOC;
  searchCodeSample = SEARCH_CODE_SAMPLE;
  fallbackCodeSample = FALLBACK_CODE_SAMPLE;
  servicePrompt = SERVICE_PROMPT;
  searchPrompt = SEARCH_PROMPT;
  actionColumnTemplate = ACTION_COLUMN_TEMPLATE;
}
