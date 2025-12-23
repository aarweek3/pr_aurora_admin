import { Component, input } from '@angular/core';
import { IconComponent } from '@shared/components/ui/icon/icon.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@Component({
  selector: 'app-container-ui-help-base',
  standalone: true,
  imports: [
    NzCardModule,
    NzGridModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    IconComponent,
  ],
  templateUrl: './container-ui-help-base.component.html',
  styleUrl: './container-ui-help-base.component.scss',
})
export class ContainerUiHelpBaseComponent {
  pageTitle = input<string>('UI Help Base ⭐');
  pageDescription = input<string>('Базовая структура для компонентов помощи');

  // Любая общая логика для контейнера может быть добавлена здесь
}
