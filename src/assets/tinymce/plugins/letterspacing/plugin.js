(function () {
  'use strict';

  var tinymce = window.tinymce;

  tinymce.PluginManager.add('letterspacing', function (editor) {
    var spacingValues = [
      { text: 'Обычный', value: 'normal' },
      { text: '-1px', value: '-1px' },
      { text: '-0.5px', value: '-0.5px' },
      { text: '0.5px', value: '0.5px' },
      { text: '1px', value: '1px' },
      { text: '1.5px', value: '1.5px' },
      { text: '2px', value: '2px' },
      { text: '3px', value: '3px' },
      { text: '4px', value: '4px' },
      { text: '5px', value: '5px' },
    ];

    editor.ui.registry.addMenuButton('letterspacing', {
      icon: 'character-count',
      tooltip: 'Межбуквенный интервал',
      fetch: function (callback) {
        var items = spacingValues.map(function (sv) {
          return {
            type: 'menuitem',
            text: sv.text,
            onAction: function () {
              editor.formatter.register('letterspacing_' + sv.value.replace('.', '_'), {
                inline: 'span',
                styles: { 'letter-spacing': sv.value },
              });
              editor.formatter.apply('letterspacing_' + sv.value.replace('.', '_'));
            },
          };
        });
        callback(items);
      },
    });

    return {
      getMetadata: function () {
        return {
          name: 'Letter Spacing',
          url: 'https://github.com/tinymce',
        };
      },
    };
  });
})();
