## Руководство: как написать демонстрационный компонент по образцу ColorComponentAurora

## Цель

Дать понятный, повторяемый шаблон для создания полнофункциональных demo/Showcase компонентов, похожих на
`ColorComponentAuroraComponent`. Руководство покрывает контракт, структуру файлов, рекомендуемые практики (Signals,
computed), шаблоны TypeScript/HTML/SCSS, тесты и чек-лист для QA.

## Кому это полезно

- Разработчикам UI-компонентов, которые пишут демонстрационные страницы для Design System.
- Тем, кто создаёт `ShowcaseComponent`-пейджи с preview/code/docs блоками.

## Короткий контракт (inputs / outputs / поведение)

- Входы (локальные state):
  - сигналы для управляемых полей (например, `selectedColor = signal<string>('#...')`).
  - конфигурация `showcaseConfig: ShowcaseConfig` — обязательный объект для `ShowcaseComponent`.
- Выходы: пользователь взаимодействует с preview; компонент предоставляет методы (copyCode, reset, applyPreset).
- Ошибки/edge-cases: все временные ресурсы (таймеры, подписки) должны чиститься в `ngOnDestroy`.

## Файловая структура (рекомендуется)

- `color-component-aurora.component.ts` — логика компонента (signals, computed, методы, ngOnDestroy).
- `color-component-aurora.component.html` — шаблон с `av-showcase` и тремя блоками (preview/code/description).
- `color-component-aurora.component.scss` — локальные стили для демо-страницы.
- `color-component-aurora.docs.ts` — внешние константы с примерами кода и документацией (использовать import).

## Шаблон TypeScript (минимум, skeleton)

```ts
import { Component, signal, computed, OnDestroy } from "@angular/core";
import { ShowcaseComponent, ShowcaseConfig } from "../../../shared/components/ui/showcase/showcase.component";

@Component({
  selector: "app-my-demo",
  standalone: true,
  imports: [ShowcaseComponent],
  templateUrl: "./my-demo.component.html",
  styleUrl: "./my-demo.component.scss",
})
export class MyDemoComponent implements OnDestroy {
  readonly showcaseConfig: ShowcaseConfig = {
    /* headerConfig, columnSplit, resultBlocks */
  };

  // state
  selectedValue = signal<string>("initial");
  isEnabled = signal<boolean>(true);

  // computed
  generatedCode = computed(() => `selected = '${this.selectedValue()}'`);

  // timers/subscriptions
  private timer: ReturnType<typeof setTimeout> | null = null;

  doAction() {
    this.selectedValue.set("changed");
    // show notification via NzNotificationService if injected
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }
}
```

## Шаблон HTML (минимум)

```html
<av-showcase [config]="showcaseConfig" [headerFixed]="true">
  <nz-tabset>
    <nz-tab nzTitle="Playground">
      <!-- controls -->
    </nz-tab>
    <nz-tab nzTitle="Code">
      <!-- help-copy-container with generatedCode or docs import -->
    </nz-tab>
  </nz-tabset>

  <div showcase-result>
    <!-- preview area: insert component under test or <av-picker> -->
  </div>

  <div showcase-docs>
    <!-- documentation, examples -->
  </div>
</av-showcase>
```

## SCSS: небольшие рекомендации

- Держать стили локальными и минимальными — только для layout/preview.
- Поддержать тёмную тему, если проект использует её (переменные, нейтральные цвета).

## Готовый pattern для генерации кода (computed)

- computed должен serialise-ить текущую конфигурацию в компактный snippet: TS + HTML
- избегайте сериализации всего объекта `showcaseConfig`; берите только релевантные поля (mode, selectedColor, flags)

## UX: кнопки и уведомления

- Добавляйте кнопку "Копировать" рядом с кодом и используйте `navigator.clipboard` + `NzNotificationService` для фидбека.
- Всегда предоставляйте fallback (console) если уведомление недоступно.

## Testing / QA checklist

1. Статическая проверка TypeScript (нет ошибок шаблона).
2. Проверить, что `generatedCode()` отражает текущие значения управления.
3. Проверить copy-to-clipboard (success + error fallback).
4. Проверить поведение при уничтожении компонента (нет утечек таймеров).
5. Проверить доступность (tab order, aria-labels для интерактивных элементов).

## Common pitfalls

- Передача `signal` в шаблон как объект (без вызова) приводит к ошибкам компиляции — используйте `mySignal()` в биндингах, а для установки — `(ngModelChange)="mySignal.set($event)"`.
- Не сериализуйте большие объекты в `generatedCode` — это ухудшает читабельность.
- Если используете `nz-tabset`/`nz-tabs`, убедитесь, что модуль подключён в `imports` standalone компонента.

## Пример полного minimal TS + HTML (реальное использование)

- См. `src/app/pages/ui-demo/color-component-aurora/` — этот пример является эталоном и содержит:
  - `signals` для UI state, `computed` для генерации кода, методы `copyCode`, `resetToDefaults`, `applyPreset`.

## Шаблон для PR / checklist при создании нового demo

1. Создать `.docs.ts` с импортируемыми константами (IMPORT_DOC, USAGE_EXAMPLE и т.д.).
2. Создать standalone component с нужными imports (ShowcaseComponent и нужными Nz модулями).
3. Реализовать reactive state через signals и computed.
4. Добавить кнопку copy + уведомления.
5. Запустить `ng test` (unit) и `ng serve` для ручной верификации.

## Заключение

`ColorComponentAuroraComponent` — хороший референс: он сочетает чистую архитектуру, реактивность, автогенерацию кода и примеры для потребителей. Используйте это руководство как шаблон при создании новых демонстрационных страниц.

Если хотите, я могу:

- 1. автоматически сгенерировать skeleton-файлы для нового demo на основе этого шаблона, или
- 2. подготовить PR с примером (копия color-component с другим контролом).
