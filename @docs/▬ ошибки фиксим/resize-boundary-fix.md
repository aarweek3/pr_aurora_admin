# Исправление проблемы "улетания" окна при resize

## 🐛 Проблема

При изменении размера модального окна VS Modal Compromise, если окно находится близко к верхнему краю экрана, оно **"улетает"** за границы viewport.

## 🔍 Диагностика

Добавлено логирование, которое показало:
```
⚠️ ПРОБЛЕМА: Позиция окна изменилась во время resize!
```

Это значит, что `top` и `left` координаты окна менялись во время изменения размера.

## 📊 Причина

1. **cdkDrag использует CSS transform** для позиционирования окна
2. При изменении `width`/`height` через JavaScript, браузер **пересчитывает layout**
3. Flexbox контейнер может **сдвигать** элементы при изменении их размеров
4. `currentRect = getBoundingClientRect()` давал **меняющуюся** позицию на каждом mousemove
5. Расчет `maxHeight = window.innerHeight - currentRect.top` использовал **нестабильное** значение

## ✅ Решение

**Запоминаем transform от cdkDrag и применяем его обратно** при каждом изменении размера:

```typescript
// В начале resize
const currentTransform = window.getComputedStyle(container).transform;
const startTop = rect.top;
const startLeft = rect.left;

// При каждом mousemove
container.style.width = `${newWidth}px`;
container.style.height = `${newHeight}px`;
container.style.transform = currentTransform; // ✅ Фиксируем позицию

// Границы рассчитываются от НАЧАЛЬНОЙ позиции, а не текущей
const maxWidth = window.innerWidth - startLeft - 10;
const maxHeight = window.innerHeight - startTop - 10;
```

## 🎯 Ключевые изменения

### До (проблемный код):
```typescript
const onMouseMove = (moveEvent: MouseEvent) => {
  const currentRect = container.getBoundingClientRect(); // ❌ Позиция меняется!
  const maxHeight = window.innerHeight - currentRect.top - 10; // ❌ Нестабильно

  container.style.width = `${newWidth}px`;
  container.style.height = `${newHeight}px`;
  // ❌ transform теряется при изменении размера
};
```

### После (исправленный код):
```typescript
// Запоминаем transform ОДИН РАЗ в начале
const currentTransform = window.getComputedStyle(container).transform;
const startTop = rect.top;
const startLeft = rect.left;

const onMouseMove = (moveEvent: MouseEvent) => {
  // ✅ Используем начальную позицию для расчета границ
  const maxHeight = window.innerHeight - startTop - 10;

  container.style.width = `${newWidth}px`;
  container.style.height = `${newHeight}px`;
  container.style.transform = currentTransform; // ✅ Восстанавливаем позицию
};
```

## 🧪 Как тестировать

1. Откройте `/tools/test-window-seamless`
2. Нажмите **💎 Запустить Compromise v2.0**
3. Перетащите окно к **верхнему краю** экрана
4. Захватите правый нижний угол (resize handle)
5. Увеличьте размер окна
6. ✅ **Ожидается:** Окно остается на месте, не "улетает" за границу

## 📝 Файлы

**Исправленный файл:**
- `src/app/shared/components/ui/vs-modal-compromise/components/vs-modal-container/vs-modal-container.component.ts:49-105`

## 🔗 Связанные проблемы

- [x] Окно "улетает" вверх при resize (ИСПРАВЛЕНО)
- [x] Окно "улетает" вправо при resize (ИСПРАВЛЕНО в предыдущей версии)
- [x] Позиция окна нестабильна после drag + resize (ИСПРАВЛЕНО)

## 💡 Архитектурные выводы

1. **cdkDrag и ручной resize требуют синхронизации** - нельзя изменять размеры без учета transform
2. **getBoundingClientRect() нужно вызывать ОДИН РАЗ** в начале resize, не на каждом mousemove
3. **Границы viewport должны рассчитываться от начальной позиции**, иначе будут нестабильны
4. **CSS transform имеет приоритет** - его нужно явно восстанавливать после изменения размера
