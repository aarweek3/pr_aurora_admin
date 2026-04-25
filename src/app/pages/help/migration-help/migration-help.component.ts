import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { 
  HelpCopyContainerComponent,
  HelpPathHeaderComponent
} from '@shared/components/ui';

@Component({
  selector: 'app-migration-help',
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
    HelpPathHeaderComponent
  ],
  template: `
    <div class="help-container">
      <av-help-path-header
        title="Database Migrations Guide"
        subtitle="Руководство по созданию и применению миграций Entity Framework Core в архитектуре Aurora v3.5."
        icon="🛠️"
        componentPath="src/app/pages/help/migration-help/migration-help.component.ts"
      ></av-help-path-header>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- 1. ОСНОВНЫЕ КОМАНДЫ -->
        <nz-tab nzTitle="🚀 Команды CLI">
          <div class="help-section">
            <nz-alert
              nzType="info"
              nzMessage="Используйте Dotnet CLI"
              nzDescription="Рекомендуется использовать команды dotnet ef вместо Package Manager Console (Add-Migration), так как CLI более стабилен и избегает ошибок потоков Visual Studio (UI Thread errors)."
              nzShowIcon
            ></nz-alert>

            <nz-card nzTitle="Шаг 1: Создание миграции">
              <p>Создает файлы инструкций для изменения базы данных на основе ваших моделей C#.</p>
              <av-help-copy-container 
                title="Add Migration" 
                content="dotnet ef migrations add [ИмяМиграции] --project DAL --startup-project Project_Server_Auth"
                bgColor="#1e293b"
              ></av-help-copy-container>
            </nz-card>

            <nz-card nzTitle="Шаг 2: Применение миграции">
              <p>Выполняет сгенерированный SQL-код в базе данных.</p>
              <av-help-copy-container 
                title="Update Database" 
                content="dotnet ef database update --project DAL --startup-project Project_Server_Auth"
                bgColor="#064e3b"
              ></av-help-copy-container>
            </nz-card>

            <nz-card nzTitle="Шаг 3: Откат (если нужно)">
              <p>Удаляет последнюю созданную миграцию проекта (если она еще не была применена к БД).</p>
              <av-help-copy-container 
                title="Remove Migration" 
                content="dotnet ef migrations remove --project DAL --startup-project Project_Server_Auth"
                bgColor="#450a0a"
              ></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 2. ИНСТРУМЕНТАРИЙ -->
        <nz-tab nzTitle="🛠️ Настройка среды">
          <div class="help-section">
            <nz-card nzTitle="Установка dotnet-ef">
              <p>Если команда <code>dotnet ef</code> не распознается, установите инструмент глобально:</p>
              <av-help-copy-container 
                title="Install Tool" 
                content="dotnet tool install --global dotnet-ef"
              ></av-help-copy-container>
            </nz-card>

            <nz-card nzTitle="Обновление инструмента">
              <p>Для обновления до последней версии:</p>
              <av-help-copy-container 
                title="Update Tool" 
                content="dotnet tool update --global dotnet-ef"
              ></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 3. ТИПИЧНЫЕ ОШИБКИ -->
        <nz-tab nzTitle="⚠️ Решение проблем">
          <div class="help-section">
            <nz-alert
              nzType="error"
              nzMessage="GetProjectFromHierarchy must be called on the UI thread"
              nzDescription="Эта ошибка специфична для Visual Studio Package Manager Console. Решение: используйте стандартный терминал (PowerShell/CMD) и команды dotnet CLI, указанные на первой вкладке."
              nzShowIcon
            ></nz-alert>

            <nz-alert
              nzType="warning"
              nzMessage="Relation 'TableName' does not exist (Error 500)"
              nzDescription="Означает, что в БД отсутствует таблица. Убедитесь, что вы запустили dotnet ef database update."
              nzShowIcon
            ></nz-alert>

            <nz-alert
              nzType="info"
              nzMessage="Параметр --project DAL"
              nzDescription="В нашей архитектуре папка Migrations находится в проекте DAL. Поэтому мы всегда указываем его как целевой проект."
              nzShowIcon
            ></nz-alert>
          </div>
        </nz-tab>
      </nz-tabset>
    </div>
  `,
  styles: [`
    .help-container { padding: 32px; max-width: 1400px; margin: 0 auto; min-height: 800px; }
    .help-tabs { margin-top: 24px; }
    .help-section { display: flex; flex-direction: column; gap: 24px; padding-top: 16px; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #e11d48; font-size: 13px; }
  `]
})
export class MigrationHelpComponent {}
