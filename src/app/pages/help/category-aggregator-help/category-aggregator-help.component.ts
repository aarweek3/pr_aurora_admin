import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HelpCopyContainerComponent, HelpPathHeaderComponent } from '@shared/components/ui';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';

import {
  CORE_FIELDS,
  DX_DICTIONARY_CODE,
  JSON_SAMPLE_CODE,
  LOC_FIELDS,
  MERMAID_DIAGRAM_CODE,
  SERVER_SEARCH_CODE,
  STANDARD_ICONS,
} from './category-aggregator-help.data';

@Component({
  selector: 'app-category-aggregator-help',
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
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    NzPaginationModule,
    HelpCopyContainerComponent,
    HelpPathHeaderComponent,
  ],
  templateUrl: './category-aggregator-help.component.html',
  styleUrls: ['./category-aggregator-help.component.css'],
})
export class CategoryAggregatorHelpComponent {
  coreFields = CORE_FIELDS;
  locFields = LOC_FIELDS;
  serverSearchCode = SERVER_SEARCH_CODE;
  dxDictionaryCode = DX_DICTIONARY_CODE;
  mermaidDiagramCode = MERMAID_DIAGRAM_CODE;
  jsonSampleCode = JSON_SAMPLE_CODE;
  standardIcons = STANDARD_ICONS;
}
