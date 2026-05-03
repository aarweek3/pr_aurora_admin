import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HelpCopyContainerComponent, HelpPathHeaderComponent } from '@shared/components/ui';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';

import {
  AI_PROMPT_CONTROLLER,
  CORE_FIELDS,
  FALLBACK_LOGIC_CODE,
  ICON_FOLDER_STRUCTURE,
  LOC_FIELDS,
  MERMAID_DIAGRAM_CODE,
  SERVER_SEARCH_CODE,
  SERVER_SORTING_CODE,
} from './category-tag-aggregator-help.data';

@Component({
  selector: 'app-category-tag-aggregator-help',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzTagModule,
    NzIconModule,
    NzAlertModule,
    HelpCopyContainerComponent,
    HelpPathHeaderComponent,
  ],
  templateUrl: './category-tag-aggregator-help.component.html',
  styleUrls: ['./category-tag-aggregator-help.component.css'],
})
export class CategoryTagAggregatorHelpComponent {
  coreFields = CORE_FIELDS;
  locFields = LOC_FIELDS;
  serverSearchCode = SERVER_SEARCH_CODE;
  serverSortingCode = SERVER_SORTING_CODE;
  iconFolderStructure = ICON_FOLDER_STRUCTURE;
  fallbackLogicCode = FALLBACK_LOGIC_CODE;
  aiPromptController = AI_PROMPT_CONTROLLER;
  mermaidDiagramCode = MERMAID_DIAGRAM_CODE;
}
