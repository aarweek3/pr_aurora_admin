# Реализация модального окна на 4 строки (Vanilla JS)

В данном руководстве описана структура и логика интерактивного модального окна, разделенного на 4 горизонтальных секции (строки), с поддержкой перетаскивания и изменения размера с учетом границ экрана.

## 1. Структура и Верстка (Flexbox)

Модальное окно построено на базе `display: flex` с вертикальной ориентацией (`flex-direction: column`). Это позволяет легко управлять высотой строк.

### Описание строк:

1.  **Row 1 (Шапка)**: Фиксированная высота `40px`. Используется как ручка для перетаскивания (класс `av-modal-header`).
2.  **Row 2 (Контент)**: Гибкая высота (`flex: 1`). Занимает половину оставшегося пространства.
3.  **Row 3 (Контент)**: Гибкая высота (`flex: 1`). Занимает вторую половину оставшегося пространства.
4.  **Row 4 (Футер)**: Фиксированная высота `60px`.

### Пример HTML/JS кода рендера:

```javascript
AvExportModal.prototype.render = function () {
  return (
    '<div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #fff; position: relative;">' +
    // Row 1: Header (Фикс 40px, Drag Handle)
    '<div class="av-modal-header" style="height: 40px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; display: flex; align-items: center; padding: 0 20px; cursor: move; flex-shrink: 0;">' +
    '<div class="av-modal-title" style="font-size: 16px; font-weight: bold; color: #1e293b;">Настройки изображения (Row 1)</div>' +
    '<div id="av-export-close" style="margin-left: auto; cursor: pointer; font-size: 20px; padding: 5px;">✕</div>' +
    "</div>" +
    // Row 2 (Гибкая, flex: 1)
    '<div style="flex: 1; min-height: 0; background: #ecfdf5; border-bottom: 2px solid #10b981; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold;">Строка 2 (Row 2)</div>' +
    // Row 3 (Гибкая, flex: 1)
    '<div style="flex: 1; min-height: 0; background: #eff6ff; border-bottom: 2px solid #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold;">Строка 3 (Row 3)</div>' +
    // Row 4 (Фикс 60px)
    '<div style="height: 60px; background: #fef2f2; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; flex-shrink: 0;">Строка 4 (Row 4)</div>' +
    // Элемент для изменения размера (Resizer)
    '<div class="av-modal-resizer" style="position: absolute; right: 0; bottom: 0; width: 20px; height: 20px; cursor: nwse-resize; background: linear-gradient(135deg, transparent 50%, #64748b 50%);"></div>' +
    "</div>"
  );
};
```

---

## 2. Интерактивная логика

Для реализации интерактивности используется делегирование событий и расчет координат относительно окна браузера (`viewport`).

### А) Перетаскивание (Drag & Drop)

При движении мыши рассчитываются новые координаты `X` и `Y`. Важным дополнением является ограничение движения, чтобы окно не уходило за границы экрана.

```javascript
if (self.isDragging) {
  var newX = e.clientX - self.offsetX;
  var newY = e.clientY - self.offsetY;

  // Рассчитываем максимально допустимые координаты (край экрана минус размер окна)
  var maxX = window.innerWidth - self.width;
  var maxY = window.innerHeight - self.height;

  // Ограничиваем: не меньше 0 и не больше максимума
  if (newX < 0) newX = 0;
  if (newX > maxX) newX = maxX;
  if (newY < 0) newY = 0;
  if (newY > maxY) newY = maxY;

  self.x = newX;
  self.y = newY;
  self.updatePosition();
}
```

### Б) Изменение размера (Resize)

Изменение размера также ограничивается краями экрана. Окно нельзя растянуть больше, чем позволяет текущее расстояние от его левого/верхнего угла до края вьюпорта.

```javascript
if (self.isResizing) {
  var newW = e.clientX - self.x;
  var newH = e.clientY - self.y;

  // Ограничения на максимальный ресайз до края экрана
  var maxW = window.innerWidth - self.x;
  var maxH = window.innerHeight - self.y;

  // Math.max защищает от "схлопывания" окна меньше минимального размера (800x600)
  // Math.min защищает от выхода за границы экрана
  self.width = Math.max(800, Math.min(newW, maxW));
  self.height = Math.max(600, Math.min(newH, maxH));

  self.updatePosition();
}
```

## 3. Резюме

- **Flex-shrink: 0**: Обязательно для строк с фиксированной высотой, чтобы flexbox не "сплющивал" их при нехватке места.
- **Min-height: 0**: Важно для гибких строк (`flex: 1`), чтобы они могли корректно уменьшаться внутри флекс-контейнера.
- **Viewport Constraints**: Использование `window.innerWidth/Height` гарантирует позитивный пользовательский опыт, предотвращая потерю окна на экране.
