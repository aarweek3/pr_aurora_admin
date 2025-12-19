// src/app/pages/ui-demo/ui-demo.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ThemeService } from '../../core/services/theme/theme.service';
import { AlertComponent } from '../../shared/components/ui/alert/alert.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ButtonDirective } from '../../shared/components/ui/button/button.directive';
import { FormFieldComponent } from '../../shared/components/ui/form-field/form-field.component';
import { IconComponent } from '../../shared/components/ui/icon/icon.component';

/**
 * UI Demo Component
 *
 * Демонстрационная страница для проверки:
 * - Button Component (все типы и размеры)
 * - FormField Component (с валидацией)
 * - Alert Component (все типы)
 * - Typography классы
 * - Theme Service (переключение темы)
 *
 * Функциональность:
 * - Показ/скрытие примеров кода для каждой секции кнопок
 * - Копирование кода в буфер обмена
 * - Интерактивная демонстрация всех компонентов
 */
@Component({
  selector: 'app-ui-demo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    ButtonDirective,
    FormFieldComponent,
    AlertComponent,
    IconComponent,
  ],
  template: `
    <div class="ui-demo">
      <div class="ui-demo__header">
        <h1>UI Components Demo</h1>
        <p class="text-secondary">Демонстрация всех UI компонентов и стилей</p>

        <!-- Theme Switcher -->
        <div style="margin-top: 16px;">
          <app-button type="default" icon="bulb" (clicked)="toggleTheme()">
            @if (currentTheme() === 'light') { Тёмная тема } @else { Светлая тема }
          </app-button>
        </div>
      </div>

      <!-- New Button Directive API Section -->
      <section class="demo-section">
        <h2>Buttons (New Directive API) ⭐</h2>
        <p class="text-secondary">Использование директивы av-button на нативных элементах</p>

        <!-- Help Button -->
        <div class="help-section">
          <button av-button avType="primary" avSize="small" (click)="toggleHelp()">
            @if (showHelp()) { ❌ Скрыть инструкцию } @else { ℹ️ Показать инструкцию по подключению
            }
          </button>

          @if (showHelp()) {
          <div class="help-content">
            <h4>Как подключить кнопки в проекте</h4>

            <div class="help-step">
              <strong>1. Импортируйте директиву в компонент:</strong>
              <pre
                class="code-example"
              ><code>import {{ '{' }} ButtonDirective {{ '}' }} from '&#64;shared/components/ui/button';</code></pre>
            </div>

            <div class="help-step">
              <strong>2. Добавьте в imports компонента:</strong>
              <pre class="code-example"><code>&#64;Component({{ '{' }}
  selector: 'app-my-component',
  standalone: true,
  imports: [ButtonDirective],
  ...
{{ '}' }})</code></pre>
            </div>

            <div class="help-step">
              <strong>3. Используйте в шаблоне:</strong>
              <pre
                class="code-example"
              ><code>&lt;button av-button avType="primary" (click)="handleClick()"&gt;
  Click Me
&lt;/button&gt;</code></pre>
            </div>

            <div class="help-step">
              <strong>Доступные параметры:</strong>
              <ul>
                <li>
                  <code>avType</code> - тип кнопки: primary | default | dashed | text | link |
                  danger
                </li>
                <li><code>avSize</code> - размер: small | default | large</li>
                <li><code>avLoading</code> - состояние загрузки (boolean)</li>
                <li><code>avBlock</code> - на всю ширину (boolean)</li>
                <li><code>(click)</code> - событие клика</li>
              </ul>
            </div>

            <div class="help-step">
              <strong>Управление размерами кнопок:</strong>
              <pre class="code-example"><code>&lt;!-- Маленькая кнопка --&gt;
&lt;button av-button avType="primary" avSize="small"&gt;Small&lt;/button&gt;

&lt;!-- Обычная кнопка (по умолчанию) --&gt;
&lt;button av-button avType="primary"&gt;Default&lt;/button&gt;

&lt;!-- Большая кнопка --&gt;
&lt;button av-button avType="primary" avSize="large"&gt;Large&lt;/button&gt;</code></pre>
            </div>

            <div class="help-step">
              <strong>Кнопки с иконками:</strong>
              <pre class="code-example"><code>&lt;!-- Импортируйте IconComponent --&gt;
import {{ '{' }} IconComponent {{ '}' }} from '&#64;shared/components/ui/icon';

&lt;!-- Кнопка с иконкой и текстом --&gt;
&lt;button av-button avType="primary"&gt;
  &lt;app-icon type="download" [size]="16"&gt;&lt;/app-icon&gt;
  &lt;span style="margin-left: 8px;"&gt;Download&lt;/span&gt;
&lt;/button&gt;

&lt;!-- Квадратная кнопка с одной иконкой --&gt;
&lt;button av-button avType="primary" class="av-btn--icon-only"&gt;
  &lt;app-icon type="search" [size]="16"&gt;&lt;/app-icon&gt;
&lt;/button&gt;

&lt;!-- Разные размеры кнопок с иконками --&gt;
&lt;button av-button avType="primary" avSize="small" class="av-btn--icon-only"&gt;
  &lt;app-icon type="plus" [size]="14"&gt;&lt;/app-icon&gt;
&lt;/button&gt;

&lt;button av-button avType="primary" avSize="large" class="av-btn--icon-only"&gt;
  &lt;app-icon type="settings" [size]="20"&gt;&lt;/app-icon&gt;
&lt;/button&gt;

&lt;!-- Доступные типы иконок --&gt;
&lt;!-- download, upload, delete, search, plus, settings, close, copy, code, chevron-up, chevron-down, info --&gt;</code></pre>
            </div>
          </div>
          }
        </div>

        <div class="demo-group">
          <h3>Button Types с индивидуальными примерами кода</h3>

          <!-- Primary Button -->
          <div class="button-demo-item">
            <button av-button avType="primary" (click)="showMessage('Primary clicked')">
              Primary
            </button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonPrimaryCode)">
              � Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodePrimary()">
              @if (showCodePrimary()) { � Скрыть код } @else { 🔽 Показать код }
            </button>
            @if (showCodePrimary()) {
            <pre class="code-example"><code>{{ buttonPrimaryCode }}</code></pre>
            }
          </div>

          <!-- Default Button -->
          <div class="button-demo-item">
            <button av-button avType="default" (click)="showMessage('Default clicked')">
              Default
            </button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonDefaultCode)">
              � Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeDefault()">
              @if (showCodeDefault()) { � Скрыть код } @else { 🔽 Показать код }
            </button>
            @if (showCodeDefault()) {
            <pre class="code-example"><code>{{ buttonDefaultCode }}</code></pre>
            }
          </div>

          <!-- Dashed Button -->
          <div class="button-demo-item">
            <button av-button avType="dashed" (click)="showMessage('Dashed clicked')">
              Dashed
            </button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonDashedCode)">
              � Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeDashed()">
              @if (showCodeDashed()) { � Скрыть код } @else { 🔽 Показать код }
            </button>
            @if (showCodeDashed()) {
            <pre class="code-example"><code>{{ buttonDashedCode }}</code></pre>
            }
          </div>

          <!-- Text Button -->
          <div class="button-demo-item">
            <button av-button avType="text" (click)="showMessage('Text clicked')">Text</button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonTextCode)">
              � Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeText()">
              @if (showCodeText()) { � Скрыть код } @else { 🔽 Показать код }
            </button>
            @if (showCodeText()) {
            <pre class="code-example"><code>{{ buttonTextCode }}</code></pre>
            }
          </div>

          <!-- Link Button -->
          <div class="button-demo-item">
            <button av-button avType="link" (click)="showMessage('Link clicked')">Link</button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonLinkCode)">
              � Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeLink()">
              @if (showCodeLink()) { � Скрыть код } @else { 🔽 Показать код }
            </button>
            @if (showCodeLink()) {
            <pre class="code-example"><code>{{ buttonLinkCode }}</code></pre>
            }
          </div>

          <!-- Danger Button -->
          <div class="button-demo-item">
            <button av-button avType="danger" (click)="showMessage('Danger clicked')">
              Danger
            </button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonDangerCode)">
              � Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeDanger()">
              @if (showCodeDanger()) { � Скрыть код } @else { 🔽 Показать код }
            </button>
            @if (showCodeDanger()) {
            <pre class="code-example"><code>{{ buttonDangerCode }}</code></pre>
            }
          </div>
        </div>
      </section>

      <!-- New Button Directive API Section -->
      <section class="demo-section">
        <h2>Buttons (New Directive API)</h2>
        <p class="text-secondary">Использование директивы av-button на нативных элементах</p>

        <!-- Help Button -->
        <div class="help-section">
          <button av-button avType="default" avSize="small" (click)="toggleHelp()">
            @if (showHelp()) { ❌ Hide Help } @else { ℹ️ Show Help }
          </button>

          @if (showHelp()) {
          <div class="help-content">
            <h4>Как подключить кнопки в проекте</h4>

            <div class="help-step">
              <strong>1. Импортируйте директиву в компонент:</strong>
              <pre
                class="code-example"
              ><code>import {{ '{' }} ButtonDirective {{ '}' }} from '&#64;shared/components/ui/button';</code></pre>
            </div>

            <div class="help-step">
              <strong>2. Добавьте в imports компонента:</strong>
              <pre class="code-example"><code>&#64;Component({{ '{' }}
  selector: 'app-my-component',
  standalone: true,
  imports: [ButtonDirective],
  ...
{{ '}' }})</code></pre>
            </div>

            <div class="help-step">
              <strong>3. Используйте в шаблоне:</strong>
              <pre
                class="code-example"
              ><code>&lt;button av-button avType="primary" (clicked)="handleClick()"&gt;
  Click Me
&lt;/button&gt;</code></pre>
            </div>

            <div class="help-step">
              <strong>Доступные параметры:</strong>
              <ul>
                <li>
                  <code>avType</code> - тип кнопки: primary | default | dashed | text | link |
                  danger
                </li>
                <li><code>avSize</code> - размер: small | default | large</li>
                <li><code>avLoading</code> - состояние загрузки (boolean)</li>
                <li><code>avBlock</code> - на всю ширину (boolean)</li>
                <li><code>(clicked)</code> - событие клика</li>
              </ul>
            </div>
          </div>
          }
        </div>

        <div class="demo-group">
          <h3>Button Types</h3>

          <!-- Primary Button -->
          <div class="button-demo-item">
            <button av-button avType="primary" (click)="showMessage('Primary clicked')">
              Primary
            </button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonPrimaryCode)">
              📋 Copy
            </button>
          </div>

          <!-- Default Button -->
          <div class="button-demo-item">
            <button av-button avType="default" (click)="showMessage('Default clicked')">
              Default
            </button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonDefaultCode)">
              📋 Copy
            </button>
          </div>

          <!-- Dashed Button -->
          <div class="button-demo-item">
            <button av-button avType="dashed" (click)="showMessage('Dashed clicked')">
              Dashed
            </button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonDashedCode)">
              📋 Copy
            </button>
          </div>

          <!-- Text Button -->
          <div class="button-demo-item">
            <button av-button avType="text" (click)="showMessage('Text clicked')">Text</button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonTextCode)">
              📋 Copy
            </button>
          </div>

          <!-- Link Button -->
          <div class="button-demo-item">
            <button av-button avType="link" (click)="showMessage('Link clicked')">Link</button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonLinkCode)">
              📋 Copy
            </button>
          </div>

          <!-- Danger Button -->
          <div class="button-demo-item">
            <button av-button avType="danger" (click)="showMessage('Danger clicked')">
              Danger
            </button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonDangerCode)">
              📋 Copy
            </button>
          </div>

          <div class="code-actions">
            <button av-button avType="default" avSize="small" (click)="toggleCode('types')">
              @if (showButtonTypesCode()) { Hide All Code } @else { Show All Code }
            </button>
            <button av-button avType="default" avSize="small" (click)="copyCode(buttonTypesCode)">
              📋 Copy All
            </button>
          </div>
          @if (showButtonTypesCode()) {
          <pre class="code-example"><code>{{ buttonTypesCode }}</code></pre>
          }
        </div>

        <div class="demo-group">
          <h3>Button Sizes</h3>

          <!-- Small Button -->
          <div class="button-demo-item">
            <button av-button avType="primary" avSize="small">Small</button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonSmallCode)">
              📋 Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeSmall()">
              @if (showCodeSmall()) { 🔼 Скрыть код } @else { 🔽 Показать код }
            </button>
            @if (showCodeSmall()) {
            <pre class="code-example"><code>{{ buttonSmallCode }}</code></pre>
            }
          </div>

          <!-- Medium Button -->
          <div class="button-demo-item">
            <button av-button avType="primary" avSize="default">Default</button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonMediumCode)">
              📋 Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeMedium()">
              @if (showCodeMedium()) { 🔼 Скрыть код } @else { 🔽 Показать код }
            </button>
            @if (showCodeMedium()) {
            <pre class="code-example"><code>{{ buttonMediumCode }}</code></pre>
            }
          </div>

          <!-- Large Button -->
          <div class="button-demo-item">
            <button av-button avType="primary" avSize="large">Large</button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonLargeCode)">
              📋 Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeLarge()">
              @if (showCodeLarge()) { 🔼 Скрыть код } @else { 🔽 Показать код }
            </button>
            @if (showCodeLarge()) {
            <pre class="code-example"><code>{{ buttonLargeCode }}</code></pre>
            }
          </div>
        </div>

        <div class="demo-group">
          <h3>Button States</h3>

          <!-- Loading Button -->
          <div class="button-demo-item">
            <button av-button avType="primary" [avLoading]="isLoading()">
              @if (isLoading()) { Loading... } @else { Click to Load }
            </button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonLoadingCode)">
              📋 Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeLoading()">
              @if (showCodeLoading()) { 🔼 Скрыть код } @else { 🔽 Показать код }
            </button>
            @if (showCodeLoading()) {
            <pre class="code-example"><code>{{ buttonLoadingCode }}</code></pre>
            }
          </div>

          <!-- Disabled Button -->
          <div class="button-demo-item">
            <button av-button avType="default" disabled>Disabled</button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonDisabledCode)">
              📋 Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeDisabled()">
              @if (showCodeDisabled()) { 🔼 Скрыть код } @else { 🔽 Показать код }
            </button>
            @if (showCodeDisabled()) {
            <pre class="code-example"><code>{{ buttonDisabledCode }}</code></pre>
            }
          </div>

          <!-- Block Button -->
          <div class="button-demo-item">
            <button av-button avType="primary" [avBlock]="true">Block Button</button>
            <button av-button avType="text" avSize="small" (click)="copyCode(buttonBlockCode)">
              📋 Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeBlock()">
              @if (showCodeBlock()) { 🔼 Скрыть код } @else { 🔽 Показать код }
            </button>
            @if (showCodeBlock()) {
            <pre class="code-example"><code>{{ buttonBlockCode }}</code></pre>
            }
          </div>

          <button av-button avType="primary" (click)="simulateLoading()">Simulate Loading</button>
        </div>

        <div class="demo-group">
          <h3>Кнопка с иконкой и текстом</h3>

          <!-- Icon + Text Primary -->
          <div class="button-demo-item">
            <button av-button avType="primary" (click)="showMessage('Download clicked')">
              <app-icon type="download" [size]="16"></app-icon>
              <span style="margin-left: 8px;">Download</span>
            </button>
            <button
              av-button
              avType="text"
              avSize="small"
              (click)="copyCode(buttonIconTextPrimaryCode)"
            >
              <app-icon type="copy" [size]="14"></app-icon>
              Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeIconTextPrimary()">
              @if (showCodeIconTextPrimary()) {
              <app-icon type="chevron-up" [size]="14"></app-icon>
              Скрыть код } @else {
              <app-icon type="chevron-down" [size]="14"></app-icon>
              Показать код }
            </button>
            @if (showCodeIconTextPrimary()) {
            <pre class="code-example"><code>{{ buttonIconTextPrimaryCode }}</code></pre>
            }
          </div>

          <!-- Icon + Text Default -->
          <div class="button-demo-item">
            <button av-button avType="default" (click)="showMessage('Upload clicked')">
              <app-icon type="upload" [size]="16"></app-icon>
              <span style="margin-left: 8px;">Upload</span>
            </button>
            <button
              av-button
              avType="text"
              avSize="small"
              (click)="copyCode(buttonIconTextDefaultCode)"
            >
              <app-icon type="copy" [size]="14"></app-icon>
              Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeIconTextDefault()">
              @if (showCodeIconTextDefault()) {
              <app-icon type="chevron-up" [size]="14"></app-icon>
              Скрыть код } @else {
              <app-icon type="chevron-down" [size]="14"></app-icon>
              Показать код }
            </button>
            @if (showCodeIconTextDefault()) {
            <pre class="code-example"><code>{{ buttonIconTextDefaultCode }}</code></pre>
            }
          </div>

          <!-- Icon + Text Danger -->
          <div class="button-demo-item">
            <button av-button avType="danger" (click)="showMessage('Delete clicked')">
              <app-icon type="delete" [size]="16"></app-icon>
              <span style="margin-left: 8px;">Delete</span>
            </button>
            <button
              av-button
              avType="text"
              avSize="small"
              (click)="copyCode(buttonIconTextDangerCode)"
            >
              <app-icon type="copy" [size]="14"></app-icon>
              Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeIconTextDanger()">
              @if (showCodeIconTextDanger()) {
              <app-icon type="chevron-up" [size]="14"></app-icon>
              Скрыть код } @else {
              <app-icon type="chevron-down" [size]="14"></app-icon>
              Показать код }
            </button>
            @if (showCodeIconTextDanger()) {
            <pre class="code-example"><code>{{ buttonIconTextDangerCode }}</code></pre>
            }
          </div>
        </div>

        <div class="demo-group">
          <h3>Квадратная кнопка с одной иконкой</h3>

          <!-- Icon Only Primary -->
          <div class="button-demo-item">
            <button
              av-button
              avType="primary"
              class="av-btn--icon-only"
              (click)="showMessage('Search clicked')"
            >
              <app-icon type="search" [size]="16"></app-icon>
            </button>
            <button
              av-button
              avType="text"
              avSize="small"
              (click)="copyCode(buttonIconOnlyPrimaryCode)"
            >
              <app-icon type="copy" [size]="14"></app-icon>
              Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeIconOnlyPrimary()">
              @if (showCodeIconOnlyPrimary()) {
              <app-icon type="chevron-up" [size]="14"></app-icon>
              Скрыть код } @else {
              <app-icon type="chevron-down" [size]="14"></app-icon>
              Показать код }
            </button>
            @if (showCodeIconOnlyPrimary()) {
            <pre class="code-example"><code>{{ buttonIconOnlyPrimaryCode }}</code></pre>
            }
          </div>

          <!-- Icon Only Small -->
          <div class="button-demo-item">
            <button
              av-button
              avType="primary"
              avSize="small"
              class="av-btn--icon-only"
              (click)="showMessage('Plus clicked')"
            >
              <app-icon type="plus" [size]="14"></app-icon>
            </button>
            <button
              av-button
              avType="text"
              avSize="small"
              (click)="copyCode(buttonIconOnlySmallCode)"
            >
              <app-icon type="copy" [size]="14"></app-icon>
              Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeIconOnlySmall()">
              @if (showCodeIconOnlySmall()) {
              <app-icon type="chevron-up" [size]="14"></app-icon>
              Скрыть код } @else {
              <app-icon type="chevron-down" [size]="14"></app-icon>
              Показать код }
            </button>
            @if (showCodeIconOnlySmall()) {
            <pre class="code-example"><code>{{ buttonIconOnlySmallCode }}</code></pre>
            }
          </div>

          <!-- Icon Only Large -->
          <div class="button-demo-item">
            <button
              av-button
              avType="primary"
              avSize="large"
              class="av-btn--icon-only"
              (click)="showMessage('Settings clicked')"
            >
              <app-icon type="settings" [size]="20"></app-icon>
            </button>
            <button
              av-button
              avType="text"
              avSize="small"
              (click)="copyCode(buttonIconOnlyLargeCode)"
            >
              <app-icon type="copy" [size]="14"></app-icon>
              Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeIconOnlyLarge()">
              @if (showCodeIconOnlyLarge()) {
              <app-icon type="chevron-up" [size]="14"></app-icon>
              Скрыть код } @else {
              <app-icon type="chevron-down" [size]="14"></app-icon>
              Показать код }
            </button>
            @if (showCodeIconOnlyLarge()) {
            <pre class="code-example"><code>{{ buttonIconOnlyLargeCode }}</code></pre>
            }
          </div>

          <!-- Icon Only Danger -->
          <div class="button-demo-item">
            <button
              av-button
              avType="danger"
              class="av-btn--icon-only"
              (click)="showMessage('Close clicked')"
            >
              <app-icon type="close" [size]="16"></app-icon>
            </button>
            <button
              av-button
              avType="text"
              avSize="small"
              (click)="copyCode(buttonIconOnlyDangerCode)"
            >
              <app-icon type="copy" [size]="14"></app-icon>
              Копировать
            </button>
            <button av-button avType="text" avSize="small" (click)="toggleCodeIconOnlyDanger()">
              @if (showCodeIconOnlyDanger()) {
              <app-icon type="chevron-up" [size]="14"></app-icon>
              Скрыть код } @else {
              <app-icon type="chevron-down" [size]="14"></app-icon>
              Показать код }
            </button>
            @if (showCodeIconOnlyDanger()) {
            <pre class="code-example"><code>{{ buttonIconOnlyDangerCode }}</code></pre>
            }
          </div>
        </div>
      </section>

      <!-- Alerts Section -->
      <section class="demo-section">
        <h2>Alerts</h2>

        <app-alert type="success" [closable]="true">
          <strong>Success!</strong> Your changes have been saved successfully.
        </app-alert>

        <app-alert
          type="info"
          title="Information"
          description="This is an informational message with title and description."
        ></app-alert>

        <app-alert type="warning" [closable]="true">
          <strong>Warning!</strong> Please review your input before submitting.
        </app-alert>

        <app-alert
          type="error"
          title="Error occurred"
          description="Unable to save changes. Please try again later."
        ></app-alert>

        <app-alert type="info" [showIcon]="false"> Alert without icon </app-alert>
      </section>

      <!-- Form Fields Section -->
      <section class="demo-section">
        <h2>Form Fields</h2>

        <div class="form-demo">
          <app-form-field
            label="Email Address"
            [required]="true"
            [control]="emailControl"
            helpText="We'll never share your email with anyone else."
          >
            <input type="email" placeholder="Enter your email" [formControl]="emailControl" />
          </app-form-field>

          <app-form-field label="Password" [required]="true" [control]="passwordControl">
            <input
              type="password"
              placeholder="Enter your password"
              [formControl]="passwordControl"
            />
          </app-form-field>

          <app-form-field label="Bio" [control]="bioControl" helpText="Tell us about yourself">
            <textarea placeholder="Write something..." [formControl]="bioControl"></textarea>
          </app-form-field>

          <app-form-field label="Disabled Field" [disabled]="true">
            <input type="text" value="This field is disabled" disabled />
          </app-form-field>

          <div class="button-row">
            <app-button type="primary" (clicked)="validateForm()"> Validate Form </app-button>
            <app-button type="default" (clicked)="resetForm()"> Reset </app-button>
          </div>
        </div>
      </section>

      <!-- Typography Section -->
      <section class="demo-section">
        <h2>Typography</h2>

        <div class="demo-group">
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6>Heading 6</h6>
        </div>

        <div class="demo-group">
          <p class="paragraph-lead">
            Lead paragraph - larger text for introductions and important content.
          </p>
          <p>
            Regular paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p class="paragraph-small">Small paragraph - for secondary or less important content.</p>
        </div>

        <div class="demo-group">
          <p class="text-primary">Primary text color</p>
          <p class="text-secondary">Secondary text color</p>
          <p class="text-tertiary">Tertiary text color</p>
          <p class="text-success">Success text</p>
          <p class="text-warning">Warning text</p>
          <p class="text-error">Error text</p>
          <p class="text-info">Info text</p>
        </div>

        <div class="demo-group">
          <code class="code-inline">inline code</code>
          <pre class="code-block"><code>function hello() {{ '{' }}
  console.log('Hello World!');
{{ '}' }}</code></pre>
        </div>
      </section>

      <!-- Message Display -->
      @if (message()) {
      <div class="message-display">
        {{ message() }}
      </div>
      }
    </div>
  `,
  styles: [
    `
      .ui-demo {
        padding: 32px;
        max-width: 1200px;
        margin: 0 auto;

        &__header {
          margin-bottom: 48px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e0e0e0;

          h1 {
            margin-bottom: 8px;
          }
        }
      }

      .demo-section {
        margin-bottom: 48px;

        h2 {
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid #1890ff;
        }
      }

      .demo-group {
        margin-bottom: 32px;

        h3 {
          margin-bottom: 16px;
          color: #595959;
          font-weight: 500;
        }
      }

      .button-row {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }

      .button-demo-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background: #fafafa;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        margin-bottom: 8px;

        &:hover {
          background: #f0f0f0;
        }
      }

      .help-section {
        margin-bottom: 32px;
        padding: 16px;
        background: #f5f5f5;
        border-radius: 8px;
        border: 1px solid #d9d9d9;
      }

      .help-content {
        margin-top: 16px;

        h4 {
          margin-bottom: 16px;
          color: #262626;
        }
      }

      .help-step {
        margin-bottom: 20px;

        strong {
          display: block;
          margin-bottom: 8px;
          color: #595959;
        }

        ul {
          margin-top: 8px;
          padding-left: 20px;

          li {
            margin-bottom: 4px;
            color: #595959;

            code {
              background: #fff;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 13px;
              color: #1890ff;
            }
          }
        }
      }

      .code-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        margin-bottom: 12px;
      }

      .code-example {
        background: #f5f5f5;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        padding: 16px;
        overflow-x: auto;
        margin: 12px 0;

        code {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          color: #262626;
          white-space: pre;
        }
      }

      .form-demo {
        max-width: 500px;
      }

      .message-display {
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 24px;
        background: #1890ff;
        color: white;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      [data-theme='dark'] {
        .ui-demo__header {
          border-bottom-color: #434343;
        }

        .demo-group h3 {
          color: rgba(255, 255, 255, 0.65);
        }

        .button-demo-item {
          background: #1f1f1f;
          border-color: #434343;

          &:hover {
            background: #262626;
          }
        }

        .help-section {
          background: #1f1f1f;
          border-color: #434343;
        }

        .help-content {
          h4 {
            color: rgba(255, 255, 255, 0.85);
          }
        }

        .help-step {
          strong {
            color: rgba(255, 255, 255, 0.65);
          }

          ul li {
            color: rgba(255, 255, 255, 0.65);

            code {
              background: #141414;
              color: #40a9ff;
            }
          }
        }

        .code-example {
          background: #1f1f1f;
          border-color: #434343;

          code {
            color: #e0e0e0;
          }
        }
      }

      /* Button Demo Item */
      .button-demo-item {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: 1px solid var(--color-border-base);
        border-radius: 4px;
        margin-bottom: 8px;

        .code-example {
          flex-basis: 100%;
          margin-top: 4px;
          margin-bottom: 0;
        }
      }

      /* Help Section */
      .help-section {
        margin-bottom: 24px;
        padding: 16px;
        background: var(--color-bg-container);
        border: 1px solid var(--color-border-base);
        border-radius: 4px;

        .help-content {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--color-border-base);

          h4 {
            margin-top: 0;
            margin-bottom: 16px;
            color: var(--color-text-heading);
          }

          .help-step {
            margin-bottom: 16px;

            strong {
              display: block;
              margin-bottom: 8px;
              color: var(--color-text-heading);
            }

            ul {
              margin-top: 8px;
              padding-left: 24px;

              li {
                margin-bottom: 4px;
                color: var(--color-text-secondary);
              }

              code {
                background: var(--color-bg-base);
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 12px;
              }
            }
          }
        }
      }
    `,
  ],
})
export class UiDemoComponent {
  private themeService = inject(ThemeService);

  // Theme
  currentTheme = this.themeService.currentTheme;

  // Loading state
  isLoading = signal(false);

  // Message
  message = signal('');

  // Code visibility toggles
  showButtonTypesCode = signal(false);
  showButtonSizesCode = signal(false);
  showButtonIconsCode = signal(false);
  showButtonStatesCode = signal(false);
  showHelp = signal(false);

  // Individual button code visibility signals
  showCodePrimary = signal(false);
  showCodeDefault = signal(false);
  showCodeDashed = signal(false);
  showCodeText = signal(false);
  showCodeLink = signal(false);
  showCodeDanger = signal(false);

  // Button sizes code visibility
  showCodeSmall = signal(false);
  showCodeMedium = signal(false);
  showCodeLarge = signal(false);

  // Button states code visibility
  showCodeLoading = signal(false);
  showCodeDisabled = signal(false);
  showCodeBlock = signal(false);

  // Button icon + text code visibility
  showCodeIconTextPrimary = signal(false);
  showCodeIconTextDefault = signal(false);
  showCodeIconTextDanger = signal(false);

  // Button icon only code visibility
  showCodeIconOnlyPrimary = signal(false);
  showCodeIconOnlySmall = signal(false);
  showCodeIconOnlyLarge = signal(false);
  showCodeIconOnlyDanger = signal(false);

  // Form Controls
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl = new FormControl('', [Validators.required, Validators.minLength(6)]);
  bioControl = new FormControl('', [Validators.maxLength(200)]);

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.showMessage(`Theme switched to ${this.currentTheme()}`);
  }

  showMessage(msg: string): void {
    this.message.set(msg);
    setTimeout(() => this.message.set(''), 3000);
  }

  simulateLoading(): void {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.showMessage('Loading completed!');
    }, 2000);
  }

  validateForm(): void {
    this.emailControl.markAsTouched();
    this.passwordControl.markAsTouched();
    this.bioControl.markAsTouched();

    if (this.emailControl.valid && this.passwordControl.valid && this.bioControl.valid) {
      this.showMessage('Form is valid! ✅');
    } else {
      this.showMessage('Please fix form errors ❌');
    }
  }

  resetForm(): void {
    this.emailControl.reset();
    this.passwordControl.reset();
    this.bioControl.reset();
    this.showMessage('Form reset');
  }

  // Code toggle methods
  toggleCode(section: 'types' | 'sizes' | 'icons' | 'states'): void {
    switch (section) {
      case 'types':
        this.showButtonTypesCode.update((v) => !v);
        break;
      case 'sizes':
        this.showButtonSizesCode.update((v) => !v);
        break;
      case 'icons':
        this.showButtonIconsCode.update((v) => !v);
        break;
      case 'states':
        this.showButtonStatesCode.update((v) => !v);
        break;
    }
  }

  // Copy code to clipboard
  async copyCode(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      this.showMessage('Code copied to clipboard! ✅');
    } catch (err) {
      this.showMessage('Failed to copy code ❌');
    }
  }

  toggleHelp(): void {
    this.showHelp.update((v) => !v);
  }

  // Individual button code toggle methods
  toggleCodePrimary(): void {
    this.showCodePrimary.update((v) => !v);
  }

  toggleCodeDefault(): void {
    this.showCodeDefault.update((v) => !v);
  }

  toggleCodeDashed(): void {
    this.showCodeDashed.update((v) => !v);
  }

  toggleCodeText(): void {
    this.showCodeText.update((v) => !v);
  }

  toggleCodeLink(): void {
    this.showCodeLink.update((v) => !v);
  }

  toggleCodeDanger(): void {
    this.showCodeDanger.update((v) => !v);
  }

  // Button sizes toggle methods
  toggleCodeSmall(): void {
    this.showCodeSmall.update((v) => !v);
  }

  toggleCodeMedium(): void {
    this.showCodeMedium.update((v) => !v);
  }

  toggleCodeLarge(): void {
    this.showCodeLarge.update((v) => !v);
  }

  // Button states toggle methods
  toggleCodeLoading(): void {
    this.showCodeLoading.update((v) => !v);
  }

  toggleCodeDisabled(): void {
    this.showCodeDisabled.update((v) => !v);
  }

  toggleCodeBlock(): void {
    this.showCodeBlock.update((v) => !v);
  }

  // Button icon + text toggle methods
  toggleCodeIconTextPrimary(): void {
    this.showCodeIconTextPrimary.update((v) => !v);
  }

  toggleCodeIconTextDefault(): void {
    this.showCodeIconTextDefault.update((v) => !v);
  }

  toggleCodeIconTextDanger(): void {
    this.showCodeIconTextDanger.update((v) => !v);
  }

  // Button icon only toggle methods
  toggleCodeIconOnlyPrimary(): void {
    this.showCodeIconOnlyPrimary.update((v) => !v);
  }

  toggleCodeIconOnlySmall(): void {
    this.showCodeIconOnlySmall.update((v) => !v);
  }

  toggleCodeIconOnlyLarge(): void {
    this.showCodeIconOnlyLarge.update((v) => !v);
  }

  toggleCodeIconOnlyDanger(): void {
    this.showCodeIconOnlyDanger.update((v) => !v);
  }

  // Code examples for individual buttons
  readonly buttonPrimaryCode = `<button av-button avType="primary" (clicked)="handleClick()">Primary</button>`;

  readonly buttonDefaultCode = `<button av-button avType="default" (clicked)="handleClick()">Default</button>`;

  readonly buttonDashedCode = `<button av-button avType="dashed" (clicked)="handleClick()">Dashed</button>`;

  readonly buttonTextCode = `<button av-button avType="text" (clicked)="handleClick()">Text</button>`;

  readonly buttonLinkCode = `<button av-button avType="link" (clicked)="handleClick()">Link</button>`;

  readonly buttonDangerCode = `<button av-button avType="danger" (clicked)="handleClick()">Danger</button>`;

  // Code examples for button sizes
  readonly buttonSmallCode = `<button av-button avType="primary" avSize="small">Small</button>`;

  readonly buttonMediumCode = `<button av-button avType="primary" avSize="default">Default</button>`;

  readonly buttonLargeCode = `<button av-button avType="primary" avSize="large">Large</button>`;

  // Code examples for button states
  readonly buttonLoadingCode = `<button av-button avType="primary" [avLoading]="isLoading()">
  @if (isLoading()) { Loading... } @else { Click to Load }
</button>`;

  readonly buttonDisabledCode = `<button av-button avType="default" disabled>Disabled</button>`;

  readonly buttonBlockCode = `<button av-button avType="primary" [avBlock]="true">Block Button</button>`;

  // Code examples for button icon + text
  readonly buttonIconTextPrimaryCode = `<button av-button avType="primary" (click)="handleClick()">
  <app-icon type="download" [size]="16"></app-icon>
  <span style="margin-left: 8px;">Download</span>
</button>`;

  readonly buttonIconTextDefaultCode = `<button av-button avType="default" (click)="handleClick()">
  <app-icon type="upload" [size]="16"></app-icon>
  <span style="margin-left: 8px;">Upload</span>
</button>`;

  readonly buttonIconTextDangerCode = `<button av-button avType="danger" (click)="handleClick()">
  <app-icon type="delete" [size]="16"></app-icon>
  <span style="margin-left: 8px;">Delete</span>
</button>`;

  // Code examples for button icon only
  readonly buttonIconOnlyPrimaryCode = `<button av-button avType="primary" class="av-btn--icon-only" (click)="handleClick()">
  <app-icon type="search" [size]="16"></app-icon>
</button>`;

  readonly buttonIconOnlySmallCode = `<button av-button avType="primary" avSize="small" class="av-btn--icon-only" (click)="handleClick()">
  <app-icon type="plus" [size]="14"></app-icon>
</button>`;

  readonly buttonIconOnlyLargeCode = `<button av-button avType="primary" avSize="large" class="av-btn--icon-only" (click)="handleClick()">
  <app-icon type="settings" [size]="20"></app-icon>
</button>`;

  readonly buttonIconOnlyDangerCode = `<button av-button avType="danger" class="av-btn--icon-only" (click)="handleClick()">
  <app-icon type="close" [size]="16"></app-icon>
</button>`; // Code examples
  readonly buttonTypesCode = `<button av-button avType="primary" (clicked)="handleClick()">Primary</button>
<button av-button avType="default" (clicked)="handleClick()">Default</button>
<button av-button avType="dashed" (clicked)="handleClick()">Dashed</button>
<button av-button avType="text" (clicked)="handleClick()">Text</button>
<button av-button avType="link" (clicked)="handleClick()">Link</button>
<button av-button avType="danger" (clicked)="handleClick()">Danger</button>`;

  readonly buttonSizesCode = `<button av-button avType="primary" avSize="small">Small</button>
<button av-button avType="primary" avSize="default">Default</button>
<button av-button avType="primary" avSize="large">Large</button>`;

  readonly buttonIconsCode = `<!-- С иконками пока используем app-button компонент -->
<app-button type="primary" icon="check">With Icon</app-button>
<app-button type="default" icon="download" suffixIcon="down">Download</app-button>
<app-button type="primary" icon="plus" [iconOnly]="true"></app-button>
<app-button type="danger" icon="delete" [iconOnly]="true"></app-button>`;

  readonly buttonStatesCode = `<button av-button avType="primary" [avLoading]="isLoading()">
  @if (isLoading()) {{ '{' }}
    Loading...
  {{ '}' }} @else {{ '{' }}
    Click to Load
  {{ '}' }}
</button>
<button av-button avType="default" [disabled]="true">Disabled</button>
<button av-button avType="primary" [avBlock]="true">Block Button</button>`;
}
