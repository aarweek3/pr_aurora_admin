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

    // Вспомогательная функция: Найти figure.aurora-image
    var getSelectedFigure = function () {
      var node = editor.selection.getNode();
      return editor.dom.getParent(node, 'figure.aurora-image');
    };

    // Вспомогательная функция: Применить выравнивание
    var alignImage = function (alignType) {
      var figure = getSelectedFigure();
      if (!figure) {
        console.warn('No figure.aurora-image selected');
        return;
      }

      // Сброс всех стилей выравнивания перед применением новых
      editor.dom.setStyle(figure, 'float', null);
      editor.dom.setStyle(figure, 'margin-left', null);
      editor.dom.setStyle(figure, 'margin-right', null);
      editor.dom.setStyle(figure, 'display', null); // Сбрасываем, чтобы переопределить

      // Обновляем data-атрибут
      editor.dom.setAttrib(figure, 'data-align', alignType);

      if (alignType === 'left') {
        editor.dom.setStyles(figure, {
          float: 'left',
          'margin-right': '15px',
          'margin-left': '0',
          display: 'table', // Для сохранения контейнерности
        });
      } else if (alignType === 'center') {
        editor.dom.setStyles(figure, {
          float: 'none',
          'margin-left': 'auto',
          'margin-right': 'auto',
          display: 'table',
        });
      } else if (alignType === 'right') {
        editor.dom.setStyles(figure, {
          float: 'right',
          'margin-left': '15px',
          'margin-right': '0',
          display: 'table',
        });
      }

      // Обновляем состояние редактора (undo/redo)
      editor.fire('Change');
    };

    // ===== КНОПКА: ВЫРОВНЯТЬ ИЗОБРАЖЕНИЕ ВЛЕВО =====
    editor.ui.registry.addButton('image-align-left', {
      icon: 'av-image-align-left',
      tooltip: 'Выровнять изображение влево',
      onAction: function () {
        alignImage('left');
      },
    });

    // ===== КНОПКА: ВЫРОВНЯТЬ ИЗОБРАЖЕНИЕ ПО ЦЕНТРУ =====
    editor.ui.registry.addButton('image-align-center', {
      icon: 'av-image-align-center',
      tooltip: 'Выровнять изображение по центру',
      onAction: function () {
        alignImage('center');
      },
    });

    // ===== КНОПКА: ВЫРОВНЯТЬ ИЗОБРАЖЕНИЕ ВПРАВО =====
    editor.ui.registry.addButton('image-align-right', {
      icon: 'av-image-align-right',
      tooltip: 'Выровнять изображение вправо',
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
