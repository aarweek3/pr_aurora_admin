(function () {
  'use strict';

  var tinymce = window.tinymce;

  tinymce.PluginManager.add('av-image-wrapping', function (editor) {
    // ===== 1. РЕГИСТРАЦИЯ ИКОНКИ =====
    // Иконка "Отступы" - квадрат с внешними стрелками или рамкой (абстракция)
    editor.ui.registry.addIcon(
      'av-margin-icon',
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M21 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 3V5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 21V19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    );

    // ===== 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

    // Найти родительскую figure с классом aurora-image
    var getSelectedFigure = function () {
      var node = editor.selection.getNode();
      return editor.dom.getParent(node, 'figure.aurora-image');
    };

    // Применить отступ к стороне
    var setMargin = function (side, size) {
      var figure = getSelectedFigure();
      if (!figure) {
        return;
      }

      var styleProp = 'margin-' + side; // margin-left, etc.

      if (size === 0 || size === '0') {
        editor.dom.setStyle(figure, styleProp, null);
      } else {
        editor.dom.setStyle(figure, styleProp, size + 'px');
      }

      editor.fire('Change'); // Важно для истории изменений и сохранения
    };

    // Очистить все отступы
    var clearMargins = function () {
      var figure = getSelectedFigure();
      if (!figure) return;

      editor.dom.setStyles(figure, {
        'margin-left': null,
        'margin-right': null,
        'margin-top': null,
        'margin-bottom': null,
      });

      editor.fire('Change');
    };

    // Генератор подменю для одной стороны
    var makeSideMenu = function (label, sideKey) {
      return {
        type: 'nestedmenuitem',
        text: label,
        getSubmenuItems: function () {
          return [
            {
              type: 'menuitem',
              text: '10px',
              onAction: function () {
                setMargin(sideKey, 10);
              },
            },
            {
              type: 'menuitem',
              text: '15px',
              onAction: function () {
                setMargin(sideKey, 15);
              },
            },
            {
              type: 'menuitem',
              text: '20px',
              onAction: function () {
                setMargin(sideKey, 20);
              },
            },
            {
              type: 'separator',
            },
            {
              type: 'menuitem',
              text: 'Убрать (0px)',
              onAction: function () {
                setMargin(sideKey, 0);
              },
            },
          ];
        },
      };
    };

    // ===== 3. РЕГИСТРАЦИЯ КНОПКИ С МЕНЮ =====
    editor.ui.registry.addMenuButton('av-image-wrapping', {
      icon: 'av-margin-icon',
      tooltip: 'Отступы изображения (обтекание)',
      fetch: function (callback) {
        // Мы формируем меню динамически, но оно статично по составу
        var items = [
          makeSideMenu('Отступ слева (Left)', 'left'),
          makeSideMenu('Отступ справа (Right)', 'right'),
          makeSideMenu('Отступ сверху (Top)', 'top'),
          makeSideMenu('Отступ снизу (Bottom)', 'bottom'),
          { type: 'separator' },
          {
            type: 'menuitem',
            text: 'Убрать все отступы',
            onAction: clearMargins,
          },
        ];

        callback(items);
      },
    });

    // ===== 4. РЕГИСТРАЦИЯ КОНТЕКСТНОЙ ПАНЕЛИ (TOOLTIP) =====
    // ОТКЛЮЧЕНО: Теперь используется общий плагин av-image-toolbar
    /*
    editor.ui.registry.addContextToolbar('av-image-wrapping-toolbar', {
      predicate: function (node) {
        return node.nodeName.toLowerCase() === 'figure' && node.classList.contains('aurora-image');
      },
      items: 'av-image-wrapping',
      position: 'node',
      scope: 'node',
    });
    */

    return {
      getMetadata: function () {
        return {
          name: 'Aurora Image Wrapping',
          url: 'https://aurora-admin.local',
        };
      },
    };
  });
})();
