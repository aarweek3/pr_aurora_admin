import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HelpCopyContainerComponent, HelpPathHeaderComponent } from '@shared/components/ui';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import {
  ACTION_PATTERNS,
  CATEGORY_FIELDS,
  CONTROLLER_PROMPT_CODE,
  FRONTEND_CHECKLIST_CODE,
  FRONTEND_MAP_CODE_HTML,
  HEADER_ASSEMBLY_HTML_CODE,
  HERITAGE_LOGIC_CODE,
  ICON_MAPPING_CODE,
  LIST_ACTION_TEMPLATE_CODE,
  MASK_IMAGE_CODE,
  MERMAID_DIAGRAM_CODE,
  SERVER_CONTROLLER_CODE,
  SERVER_SEARCH_CODE,
  TAG_FIELDS,
  TOOLBAR_FILTER_CODE,
} from './tag-aggregator-help.data';

@Component({
  selector: 'app-tag-aggregator-help',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzTagModule,
    NzIconModule,
    NzAlertModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    NzPaginationModule,
    NzToolTipModule,
    HelpCopyContainerComponent,
    HelpPathHeaderComponent,
  ],
  templateUrl: './tag-aggregator-help.component.html',
  styleUrls: ['./tag-aggregator-help.component.css'],
})
export class TagAggregatorHelpComponent {
  mermaidDiagramCode = MERMAID_DIAGRAM_CODE;
  actionPatterns = ACTION_PATTERNS;
  categoryFields = CATEGORY_FIELDS;
  tagFields = TAG_FIELDS;
  serverSearchCode = SERVER_SEARCH_CODE;
  heritageLogicCode = HERITAGE_LOGIC_CODE;
  iconMappingCode = ICON_MAPPING_CODE;
  maskImageCode = MASK_IMAGE_CODE;
  controllerPromptCode = CONTROLLER_PROMPT_CODE;
  listActionTemplateCode = LIST_ACTION_TEMPLATE_CODE;
  toolbarFilterCode = TOOLBAR_FILTER_CODE;
  headerAssemblyHtmlCode = HEADER_ASSEMBLY_HTML_CODE;
  serverControllerCode = SERVER_CONTROLLER_CODE;
  frontendMapCodeHtml = FRONTEND_MAP_CODE_HTML;
  frontendChecklistCode = FRONTEND_CHECKLIST_CODE;
}
