(function () {
  'use strict';

  var tinymce = window.tinymce;

  tinymce.PluginManager.add('av-image-toolbar', function (editor) {
    // 1. РЕГИСТРАЦИЯ ИКОНОК
    editor.ui.registry.addIcon(
      'av-icon-seo',
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-2.09c-2.14-.15-3.5-.96-3.5-3.03h1.5c0 1.15.82 1.54 2 1.54 1.14 0 2-.45 2-1.27 0-2.11-5-1.57-5-4.82 0-1.8 1.15-2.67 3-2.83V5h2v2c1.77.16 2.76.99 2.87 2.5h-1.56c-.14-.92-.78-1.5-1.81-1.5-1.16 0-1.5.73-1.5 1.19 0 2.05 5 1.5 5 4.67 0 1.9-1.29 2.88-3.5 3.06V16.5h-2z" fill="currentColor"/></svg>',
    );
    editor.ui.registry.addIcon(
      'av-icon-link',
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill="currentColor"/></svg>',
    );

    // 2. РЕГИСТРАЦИЯ КНОПОК
    editor.ui.registry.addButton('av-context-seo', {
      icon: 'av-icon-seo',
      tooltip: 'SEO и атрибуты (Alt, Title)',
      onAction: function () {
        editor.execCommand('avImageSeo', false, editor.selection.getNode());
      },
    });

    editor.ui.registry.addButton('av-context-link', {
      icon: 'av-icon-link',
      tooltip: 'Ссылка и поведение',
      onAction: function () {
        editor.execCommand('avImageLink', false, editor.selection.getNode());
      },
    });

    // Кнопка для редактирования основного (Edit)
    editor.ui.registry.addButton('av-context-edit', {
      icon: 'image-options',
      tooltip: 'Редактировать изображение',
      onAction: function () {
        editor.execCommand('avImage', false, editor.selection.getNode());
      },
    });

    // 3. РЕГИСТРАЦИЯ КОНТЕКСТНОЙ ПАНЕЛИ
    editor.ui.registry.addContextToolbar('av-universal-image-toolbar', {
      predicate: function (node) {
        return node.nodeName.toLowerCase() === 'figure' && node.classList.contains('aurora-image');
      },
      // Кнопки: Редактор | SEO и Ссылка | Выравнивание (наше) | Отступы
      items:
        'av-context-edit | av-context-seo av-context-link | image-align-left image-align-center image-align-right | av-image-wrapping av-image-shadow',
      position: 'node',
      scope: 'node',
    });

    return {
      getMetadata: function () {
        return {
          name: 'Aurora Universal Image Toolbar',
          url: 'https://aurora-admin.local',
        };
      },
    };
  });
})();
