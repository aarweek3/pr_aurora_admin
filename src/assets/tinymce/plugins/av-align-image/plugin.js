(function () {
  'use strict';

  var tinymce = window.tinymce;

  tinymce.PluginManager.add('av-align-image', function (editor) {
    // ===== РЕГИСТРАЦИЯ СВОИХ ИКОНОК =====
    editor.ui.registry.addIcon(
      'av-image-align-left',
      '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h6v6H4zM12 4h8v2h-8zm0 4h8v2h-8zM4 14h16v2H4zM4 18h16v2H4z" fill="currentColor"/></svg>',
    );

    editor.ui.registry.addIcon(
      'av-image-align-center',
      '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 4h6v6H9zM4 12h16v2H4zM4 16h16v2H4zM4 20h16v2H4z" fill="currentColor"/></svg>',
    );

    editor.ui.registry.addIcon(
      'av-image-align-right',
      '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14 4h6v6h-6zM4 4h8v2H4zm0 4h8v2H4zM4 14h16v2H4zM4 18h16v2H4z" fill="currentColor"/></svg>',
    );

    // Вспомогательная функция: Найти figure
    var getSelectedFigure = function () {
      var node = editor.selection.getNode();
      // Проверяем сам узел
      if (
        node &&
        node.nodeName.toLowerCase() === 'figure' &&
        (editor.dom.hasClass(node, 'av-image') || editor.dom.hasClass(node, 'aurora-image'))
      ) {
        return node;
      }
      return editor.dom.getParent(node, 'figure.av-image, figure.aurora-image');
    };

    // Вспомогательная функция: Применить выравнивание
    var alignImage = function (alignType) {
      var figure = getSelectedFigure();
      if (!figure) {
        return;
      }

      editor.undoManager.transact(function () {
        // Сбрасываем старые классы выравнивания
        var classesToRemove = [
          'av-image--align-left',
          'av-image--align-center',
          'av-image--align-right',
          'av-image--align-full',
        ];
        classesToRemove.forEach(function (cls) {
          editor.dom.removeClass(figure, cls);
        });

        // Добавляем новый класс
        editor.dom.addClass(figure, 'av-image--align-' + alignType);

        // Очищаем инлайновые стили, мешающие классам
        // Очищаем инлайновые стили
        var stylesToClear = {
          float: null,
          'margin-left': null,
          'margin-right': null,
          display: null,
        };
        if (alignType === 'full') {
          stylesToClear.width = null;
        }

        editor.dom.setStyles(figure, stylesToClear);
      });

      // Обновляем состояние редактора (undo/redo)
      editor.fire('Change');
    };

    // ===== КОМАНДЫ (для вызова из других плагинов) =====
    editor.addCommand('image-align-left', function () {
      alignImage('left');
    });
    editor.addCommand('image-align-center', function () {
      alignImage('center');
    });
    editor.addCommand('image-align-right', function () {
      alignImage('right');
    });
    editor.addCommand('image-align-full', function () {
      alignImage('full');
    });

    // ===== КНОПКИ ДЛЯ ТУЛБАРА =====
    editor.ui.registry.addButton('image-align-left', {
      icon: 'av-image-align-left',
      tooltip: 'Выровнять влево',
      onAction: function () {
        alignImage('left');
      },
    });

    editor.ui.registry.addButton('image-align-center', {
      icon: 'av-image-align-center',
      tooltip: 'Выровнять по центру',
      onAction: function () {
        alignImage('center');
      },
    });

    editor.ui.registry.addButton('image-align-right', {
      icon: 'av-image-align-right',
      tooltip: 'Выровнять вправо',
      onAction: function () {
        alignImage('right');
      },
    });

    return {
      getMetadata: function () {
        return {
          name: 'Aurora Image Alignment',
          url: 'https://aurora-admin.local',
        };
      },
    };
  });
})();
