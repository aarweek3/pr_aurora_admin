(function () {
  'use strict';

  var tinymce = window.tinymce;

  tinymce.PluginManager.add('av-image-shadow', function (editor) {
    // 1. РЕГИСТРАЦИЯ ИКОНКИ
    editor.ui.registry.addIcon(
      'av-icon-shadow',
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="4" y="4" width="12" height="12" rx="2" fill="currentColor" fill-opacity="0.3"/>' +
        '<rect x="8" y="8" width="12" height="12" rx="2" fill="currentColor"/>' +
        '</svg>',
    );

    // 2. ОПРЕДЕЛЕНИЕ ПРЕСЕТОВ
    var presets = [
      { text: 'Без тени', value: 'none' },
      { text: 'Легкая', value: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' },
      { text: 'Средняя', value: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' },
      { text: 'Глубокая', value: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' },
      { text: 'Нижняя', value: 'drop-shadow(0 15px 15px rgba(0,0,0,0.4))' },
      { text: 'Акцентная (Blue)', value: 'drop-shadow(0 0 15px rgba(59,130,246,0.5))' },
    ];

    // Вспомогательная функция: Найти figure.aurora-image
    var getSelectedFigure = function () {
      var node = editor.selection.getNode();
      return editor.dom.getParent(node, 'figure.aurora-image');
    };

    // 3. РЕГИСТРАЦИЯ МЕНЮ-КНОПКИ
    editor.ui.registry.addMenuButton('av-image-shadow', {
      icon: 'av-icon-shadow',
      tooltip: 'Эффект тени (CSS)',
      fetch: function (callback) {
        var items = presets.map(function (p) {
          return {
            type: 'menuitem',
            text: p.text,
            onAction: function () {
              var figure = getSelectedFigure();
              if (figure) {
                editor.undoManager.transact(function () {
                  editor.dom.setStyle(figure, 'filter', p.value);
                  editor.fire('Change');
                });
              }
            },
          };
        });
        callback(items);
      },
    });

    return {
      getMetadata: function () {
        return {
          name: 'Aurora Image Shadow (CSS)',
          url: 'https://aurora-admin.local',
        };
      },
    };
  });
})();
