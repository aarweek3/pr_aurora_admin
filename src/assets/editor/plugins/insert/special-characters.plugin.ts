/* ============================================================================
SPECIAL CHARACTERS PLUGIN
============================================================================

Плагин для вставки специальных символов.
Предоставляет dropdown с популярными специальными символами.

Особенности:
- Dropdown с категориями символов
- Вставка символа в позицию курсора
- Визуальное представление символов

============================================================================ */

import { AuroraPlugin } from '../aurora-plugin.interface';

/**
 * Интерфейс для описания специального символа
 */
export interface SpecialCharacter {
  /** Символ для отображения */
  char: string;
  /** Название символа */
  label: string;
  /** Код символа (для подсказки) */
  code: string;
}

/**
 * Плагин для вставки специальных символов
 */
export class SpecialCharactersPlugin implements AuroraPlugin {
  name = 'specialCharacters';
  title = 'Специальные символы';
  icon = '&Omega;'; // Символ Омега
  category = 'insert';
  isDropdown = true;

  /**
   * Список специальных символов
   */
  options: SpecialCharacter[] = [
    // Математические символы
    { char: '±', label: 'Плюс-минус', code: '&plusmn;' },
    { char: '×', label: 'Умножение', code: '&times;' },
    { char: '÷', label: 'Деление', code: '&divide;' },
    { char: '≠', label: 'Не равно', code: '&ne;' },
    { char: '≈', label: 'Приблизительно равно', code: '&asymp;' },
    { char: '≤', label: 'Меньше или равно', code: '&le;' },
    { char: '≥', label: 'Больше или равно', code: '&ge;' },
    { char: '∞', label: 'Бесконечность', code: '&infin;' },
    { char: '√', label: 'Квадратный корень', code: '&radic;' },
    { char: '∑', label: 'Сумма', code: '&sum;' },
    { char: '∏', label: 'Произведение', code: '&prod;' },
    { char: '∫', label: 'Интеграл', code: '&int;' },
    { char: '∂', label: 'Частная производная', code: '&part;' },
    { char: '°', label: 'Градус', code: '&deg;' },

    // Стрелки
    { char: '←', label: 'Стрелка влево', code: '&larr;' },
    { char: '→', label: 'Стрелка вправо', code: '&rarr;' },
    { char: '↑', label: 'Стрелка вверх', code: '&uarr;' },
    { char: '↓', label: 'Стрелка вниз', code: '&darr;' },
    { char: '↔', label: 'Стрелка влево-вправо', code: '&harr;' },
    { char: '⇐', label: 'Двойная стрелка влево', code: '&lArr;' },
    { char: '⇒', label: 'Двойная стрелка вправо', code: '&rArr;' },
    { char: '⇔', label: 'Двойная стрелка влево-вправо', code: '&hArr;' },

    // Греческие буквы
    { char: 'α', label: 'Альфа', code: '&alpha;' },
    { char: 'β', label: 'Бета', code: '&beta;' },
    { char: 'γ', label: 'Гамма', code: '&gamma;' },
    { char: 'δ', label: 'Дельта', code: '&delta;' },
    { char: 'ε', label: 'Эпсилон', code: '&epsilon;' },
    { char: 'θ', label: 'Тета', code: '&theta;' },
    { char: 'λ', label: 'Лямбда', code: '&lambda;' },
    { char: 'μ', label: 'Мю', code: '&mu;' },
    { char: 'π', label: 'Пи', code: '&pi;' },
    { char: 'σ', label: 'Сигма', code: '&sigma;' },
    { char: 'Σ', label: 'Сигма (заглавная)', code: '&Sigma;' },
    { char: 'φ', label: 'Фи', code: '&phi;' },
    { char: 'Ω', label: 'Омега', code: '&Omega;' },

    // Валюты
    { char: '€', label: 'Евро', code: '&euro;' },
    { char: '$', label: 'Доллар', code: '$' },
    { char: '£', label: 'Фунт', code: '&pound;' },
    { char: '¥', label: 'Иена', code: '&yen;' },
    { char: '₽', label: 'Рубль', code: '&#8381;' },
    { char: '¢', label: 'Цент', code: '&cent;' },

    // Типографские символы
    { char: '©', label: 'Копирайт', code: '&copy;' },
    { char: '®', label: 'Зарегистрированный товарный знак', code: '&reg;' },
    { char: '™', label: 'Товарный знак', code: '&trade;' },
    { char: '§', label: 'Параграф', code: '&sect;' },
    { char: '¶', label: 'Знак абзаца', code: '&para;' },
    { char: '†', label: 'Крест', code: '&dagger;' },
    { char: '‡', label: 'Двойной крест', code: '&Dagger;' },
    { char: '•', label: 'Маркер', code: '&bull;' },
    { char: '…', label: 'Многоточие', code: '&hellip;' },
    { char: '′', label: 'Штрих', code: '&prime;' },
    { char: '″', label: 'Двойной штрих', code: '&Prime;' },
    { char: '‹', label: 'Левая угловая кавычка', code: '&lsaquo;' },
    { char: '›', label: 'Правая угловая кавычка', code: '&rsaquo;' },
    { char: '«', label: 'Левая кавычка-ёлочка', code: '&laquo;' },
    { char: '»', label: 'Правая кавычка-ёлочка', code: '&raquo;' },
    { char: '"', label: 'Левая двойная кавычка', code: '&ldquo;' },
    { char: '"', label: 'Правая двойная кавычка', code: '&rdquo;' },
    { char: '\u2018', label: 'Левая одинарная кавычка', code: '&lsquo;' },
    { char: '\u2019', label: 'Правая одинарная кавычка', code: '&rsquo;' },
    { char: '—', label: 'Длинное тире', code: '&mdash;' },
    { char: '–', label: 'Короткое тире', code: '&ndash;' },

    // Другие символы
    { char: '¼', label: 'Одна четверть', code: '&frac14;' },
    { char: '½', label: 'Одна второя', code: '&frac12;' },
    { char: '¾', label: 'Три четверти', code: '&frac34;' },
    { char: '№', label: 'Номер', code: '&#8470;' },
    { char: '℃', label: 'Градус Цельсия', code: '&#8451;' },
    { char: '℉', label: 'Градус Фаренгейта', code: '&#8457;' },
    { char: '♠', label: 'Пики', code: '&spades;' },
    { char: '♣', label: 'Трефы', code: '&clubs;' },
    { char: '♥', label: 'Червы', code: '&hearts;' },
    { char: '♦', label: 'Бубны', code: '&diams;' },
    { char: '☺', label: 'Смайлик', code: '&#9786;' },
    { char: '☻', label: 'Смайлик черный', code: '&#9787;' },
    { char: '★', label: 'Черная звезда', code: '&#9733;' },
    { char: '☆', label: 'Белая звезда', code: '&#9734;' },
    { char: '✓', label: 'Галочка', code: '&#10003;' },
    { char: '✗', label: 'Крестик', code: '&#10007;' },
  ];

  /**
   * Выполнение вставки специального символа
   */
  execute(editorElement: HTMLElement, value?: string): boolean {
    if (!value) {
      return false;
    }

    const selection = window.getSelection();
    if (!selection) {
      return false;
    }

    // Если нет выделения, создаем его в конце редактора
    if (selection.rangeCount === 0) {
      const range = document.createRange();
      range.selectNodeContents(editorElement);
      range.collapse(false);
      selection.addRange(range);
    }

    const range = selection.getRangeAt(0);

    // Удаляем выделенный текст, если есть
    range.deleteContents();

    // Создаем текстовый узел со специальным символом
    const textNode = document.createTextNode(value);
    range.insertNode(textNode);

    // Перемещаем курсор после вставленного символа
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    // Фокусируем редактор
    editorElement.focus();

    return true;
  }

  /**
   * Проверка активности плагина (всегда неактивен)
   */
  isActive(editorElement: HTMLElement): boolean {
    return false;
  }
}
