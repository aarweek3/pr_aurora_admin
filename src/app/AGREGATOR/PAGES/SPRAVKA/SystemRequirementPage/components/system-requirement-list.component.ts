import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { SystemRequirementDto, RequirementArchitecture } from '../models/system-requirement.model';

@Component({
  selector: 'app-system-requirement-list',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzPopconfirmModule,
    NzToolTipModule
  ],
  template: `
    <nz-table #basicTable [nzData]="items" [nzFrontPagination]="false" nzSize="small">
      <thead>
        <tr>
          <th>Архитектура</th>
          <th>Мин. ОС</th>
          <th>Макс. ОС</th>
          <th>Тип</th>
          <th>Доп. инфо</th>
          <th nzRight nzWidth="100px">Действия</th>
        </tr>
      </thead>
      <tbody>
        @for (data of basicTable.data; track data.id) {
          <tr>
            <td>
              <nz-tag [nzColor]="getArchColor(data.architecture)">
                {{ getArchName(data.architecture) }}
              </nz-tag>
            </td>
            <td>{{ data.minOsVersionName || 'Any' }}</td>
            <td>{{ data.maxOsVersionName || 'Any' }}</td>
            <td>
              @if (data.isRecommended) {
                <nz-tag nzColor="success">Recommended</nz-tag>
              } @else {
                <nz-tag nzColor="default">Minimum</nz-tag>
              }
            </td>
            <td>
              @if (data.localizations && data.localizations.length > 0) {
                <i nz-icon nzType="info-circle" 
                   nz-tooltip 
                   [nzTooltipTitle]="data.localizations[0].additionalNotes"></i>
              }
            </td>
            <td nzRight>
              <button nz-button nzType="text" nzShape="circle" (click)="edit.emit(data)">
                <i nz-icon nzType="edit"></i>
              </button>
              <button nz-button nzType="text" nzDanger nzShape="circle"
                      nz-popconfirm nzPopconfirmTitle="Удалить требование?"
                      (nzOnConfirm)="delete.emit(data.id)">
                <i nz-icon nzType="delete"></i>
              </button>
            </td>
          </tr>
        }
      </tbody>
    </nz-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemRequirementListComponent {
  @Input() items: SystemRequirementDto[] = [];
  @Output() edit = new EventEmitter<SystemRequirementDto>();
  @Output() delete = new EventEmitter<number>();

  getArchName(arch: RequirementArchitecture): string {
    switch (arch) {
      case RequirementArchitecture.Any: return 'Any';
      case RequirementArchitecture.X86: return 'x86';
      case RequirementArchitecture.X64: return 'x64';
      case RequirementArchitecture.Arm64: return 'ARM64';
      default: return 'Unknown';
    }
  }

  getArchColor(arch: RequirementArchitecture): string {
    switch (arch) {
      case RequirementArchitecture.Any: return 'blue';
      case RequirementArchitecture.X64: return 'geekblue';
      case RequirementArchitecture.Arm64: return 'purple';
      default: return 'default';
    }
  }
}
