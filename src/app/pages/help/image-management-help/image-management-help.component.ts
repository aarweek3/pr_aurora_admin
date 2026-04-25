import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  CodeBlockComponent,
  HelpCopyContainerComponent,
  HelpPathHeaderComponent,
} from '@shared/components/ui';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-image-management-help',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTabsModule,
    NzTagModule,
    NzIconModule,
    NzAlertModule,
    HelpCopyContainerComponent,
    HelpPathHeaderComponent,
    CodeBlockComponent,
  ],
  template: `
    <div class="help-container">
      <av-help-path-header
        title="Управление изображениями"
        subtitle="Архитектура и стандарт реализации универсальной системы управления медиа-ресурсами в Aurora v3.5."
        icon="🖼️"
        componentPath="src/app/pages/help/image-management-help/image-management-help.component.ts"
      ></av-help-path-header>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- 1. ОБЗОР -->
        <nz-tab nzTitle="🌟 Обзор">
          <div class="help-section">
            <nz-card nzTitle="Философия системы">
              <p>
                В Aurora v3.5 внедрена
                <strong>Универсальная система управления изображениями</strong>. Она заменяет
                разрозненные методы загрузки в разных контроллерах на единый стандарт.
              </p>

              <div class="feature-grid">
                <div class="feature-item">
                  <i nz-icon nzType="cluster" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Централизация:</strong> Один API-контроллер и один Frontend-сервис для
                    всех модулей (Разработчики, ПО, Лицензии).
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="folder-open" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Динамические папки:</strong> Автоматическое создание структуры в
                    <code>wwwroot/uploads/{{ '{' }}folder{{ '}' }}</code> на основе параметров
                    запроса.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="safety" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Безопасность:</strong> Все операции загрузки защищены авторизацией.
                  </div>
                </div>
              </div>
            </nz-card>

            <nz-alert
              nzType="info"
              nzMessage="Ключевое преимущество"
              nzDescription="Использование относительных путей в БД (например, uploads/dev/logo.png) позволяет легко менять домен API или переезжать на CDN, изменяя конфигурацию только в одном месте."
              nzShowIcon
            ></nz-alert>
          </div>
        </nz-tab>

        <!-- 2. BACKEND -->
        <nz-tab nzTitle="⚙️ Backend">
          <div class="help-section">
            <nz-card nzTitle="UniversalMediaController">
              <p>Универсальная точка входа для загрузки любого медиа-контента.</p>

              <div class="logic-card full-width">
                <h4>Спецификация API:</h4>
                <ul>
                  <li><strong>Route:</strong> <code>POST api/v1/media/upload</code></li>
                  <li><strong>Auth:</strong> <code>[Authorize]</code> (Обязательно)</li>
                  <li>
                    <strong>Params:</strong>
                    <ul>
                      <li>
                        <code>folder</code> (query): Имя подпапки в uploads (например,
                        <code>developers</code>).
                      </li>
                      <li><code>file</code> (body): Binary data.</li>
                    </ul>
                  </li>
                  <li><strong>Поведение:</strong> Перезаписывает файл при совпадении имени.</li>
                </ul>
              </div>

              <av-help-copy-container
                title="Реализация контроллера (C#)"
                [content]="backendCode"
                bgColor="#1e293b"
              ></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 3. FRONTEND SERVICE -->
        <nz-tab nzTitle="🛰️ Frontend">
          <div class="help-section">
            <nz-card nzTitle="ImageServiceUniversal">
              <p>
                Сервис в <code>SharedModule</code>, инкапсулирующий работу с URL и HTTP-запросы.
              </p>

              <div class="logic-grid">
                <div class="logic-card">
                  <h4>Метод getAssetUrl(path)</h4>
                  <ul>
                    <li>Превращает относительный путь в полный URL.</li>
                    <li>Автоматически подставляет заглушку, если путь пуст.</li>
                    <li>Игнорирует внешние ссылки (начинающиеся на http).</li>
                  </ul>
                </div>
                <div class="logic-card">
                  <h4>Метод upload(file, folder)</h4>
                  <ul>
                    <li>Принимает JS File объект.</li>
                    <li>
                      Возвращает Observable с <code>relativePath</code> и <code>fullUrl</code>.
                    </li>
                  </ul>
                </div>
              </div>

              <av-help-copy-container
                title="image-service-universal.service.ts"
                [content]="frontendServiceCode"
                bgColor="#0f172a"
              ></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 4. ИНТЕГРАЦИЯ -->
        <nz-tab nzTitle="🎨 Интеграция">
          <div class="help-section">
            <nz-card nzTitle="Гайд: Добавление управления иконкой в новую форму">
              <p>
                Следуйте этому паттерну, чтобы внедрить современный UI управления медиа в любой
                компонент.
              </p>

              <div class="integration-steps">
                <div class="i-step">
                  <strong>1. Инъекция сервиса:</strong>
                  <code>public imgService = inject(ImageServiceUniversal);</code>
                </div>
                <div class="i-step">
                  <strong>2. Контрол в шаблоне:</strong>
                  <av-code-block [code]="formTemplateCode" language="html"></av-code-block>
                </div>
                <div class="i-step">
                  <strong>3. Метод загрузки:</strong>
                  <av-code-block [code]="formLogicCode" language="typescript"></av-code-block>
                </div>
              </div>

              <div
                class="preview-mock"
                style="margin-top: 24px; padding: 20px; border: 1px dashed #cbd5e1; border-radius: 12px; background: #fff;"
              >
                <span style="font-size: 12px; color: #94a3b8; display: block; margin-bottom: 10px;"
                  >Пример визуализации в форме (Aurora UI):</span
                >
                <div
                  style="display: flex; gap: 16px; align-items: flex-start; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;"
                >
                  <div
                    style="width: 64px; height: 64px; background: #fff; border: 1px dashed #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #2563eb;"
                  >
                    <i nz-icon nzType="api"></i>
                  </div>
                  <div style="flex: 1;">
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                      <div
                        style="flex: 1; height: 32px; background: #fff; border: 1px solid #d1d5db; border-radius: 4px; padding: 4px 8px; font-size: 12px; color: #8c8c8c;"
                      >
                        uploads/developers/adobe.svg
                      </div>
                      <div
                        style="width: 100px; height: 32px; background: #2563eb; color: #fff; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 500;"
                      >
                        Загрузить
                      </div>
                    </div>
                    <span style="font-size: 11px; color: #64748b;"
                      >Рекомендуется SVG с прозрачным фоном.</span
                    >
                  </div>
                </div>
              </div>
            </nz-card>
          </div>
        </nz-tab>
      </nz-tabset>
    </div>
  `,
  styles: [
    `
      .help-container {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .help-section {
        padding-top: 16px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .feature-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 20px;
        margin-top: 20px;
      }
      .feature-item {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }
      .f-icon {
        font-size: 24px;
        color: #2563eb;
      }
      .f-text {
        font-size: 13px;
        line-height: 1.5;
      }

      .logic-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .logic-card {
        padding: 16px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
      }
      .logic-card h4 {
        margin-bottom: 12px;
        color: #1e293b;
        font-weight: 600;
      }
      .logic-card.full-width {
        grid-column: span 2;
      }

      .integration-steps {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .i-step {
        background: #fdf2f8;
        padding: 12px;
        border-radius: 8px;
        border-left: 4px solid #db2777;
      }
      .i-step code {
        background: rgba(0, 0, 0, 0.05);
        padding: 2px 6px;
        border-radius: 4px;
        color: #db2777;
        font-weight: 600;
      }
    `,
  ],
})
export class ImageManagementHelpComponent {
  backendCode = `[HttpPost("upload")]
[Authorize]
public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string folder = "general")
{
    // 1. Санитизация пути папки
    folder = folder.Replace("..", "").Replace("/", "").Replace("\\\\", "");
    var uploadPath = Path.Combine(_env.WebRootPath, "uploads", folder);

    // 2. Создание директории (если нет)
    if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

    // 3. Сохранение (перезапись FileMode.Create)
    var fileName = Path.GetFileName(file.FileName);
    using (var stream = new FileStream(Path.Combine(uploadPath, fileName), FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    return Ok(new { relativePath = $"uploads/{folder}/{fileName}" });
}`;

  frontendServiceCode = `getAssetUrl(path: string | null): string {
  if (!path) return 'assets/icons/default.svg';
  if (path.startsWith('http')) return path;

  return \`\${this.baseUrl}/\${path}\`;
}

upload(file: File, folder: string): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post(\`\${this.apiUrl}/upload?folder=\${folder}\`, formData);
}`;

  formTemplateCode = `<div class="icon-preview-box">
  <img [src]="imgService.getAssetUrl(form.get('iconPath')?.value)" />
</div>
<nz-input-group [nzAddOnAfter]="suffixButton">
  <input nz-input formControlName="iconPath" />
</nz-input-group>
<ng-template #suffixButton>
  <button nz-button (click)="fileInput.click()">Загрузить</button>
</ng-template>
<input #fileInput type="file" (change)="onUpload($event)" style="display:none" />`;

  formLogicCode = `onUpload(event: any): void {
  const file = event.target.files?.[0];
  if (file) {
    this.imgService.upload(file, 'developers').subscribe(res => {
      this.form.patchValue({ iconPath: res.relativePath });
    });
  }
}`;
}
