(function () {
  'use strict';

  var tinymce = window.tinymce;

  tinymce.PluginManager.add('av-image-toolbar', function (editor) {
    // 1. РЕГИСТРАЦИЯ ИКОНОК
    editor.ui.registry.addIcon(
      'av-icon-seo',
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-2.09c-2.14-.15-3.5-.96-3.5-3.03h1.5c0 1.15.82 1.54 2 1.54 1.14 0 2-.45 2-1.27 0-2.11-5-1.57-5-4.82 0-1.8 1.15-2.67 3-2.83V5h2v2c1.77.16 2.76.99 2.87 2.5h-1.56c-.14-.92-.78-1.5-1.81-1.5-1.16 0-1.5.73-1.5 1.19 0 2.05 5 1.5 5 4.67 0 1.9-1.29 2.88-3.5 3.06V16.5h-2z" fill="currentColor"/></svg>',
    );

    // 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    var getSelectedFigure = function (node) {
      if (!node) return null;
      // Проверяем сам узел
      if (
        node.nodeName.toLowerCase() === 'figure' &&
        (editor.dom.hasClass(node, 'av-image') || editor.dom.hasClass(node, 'aurora-image'))
      ) {
        return node;
      }
      // Ищем вверх по дереву
      return editor.dom.getParent(node, 'figure.av-image, figure.aurora-image');
    };

    var applyAlign = function (figure, align) {
      if (!figure) return;

      // Если передали не фигуру (например, img), пробуем найти её.
      // Если передали фигуру, но getSelectedFigure возвращает null (потому что ищет родителя), оставляем как есть.
      if (figure && figure.nodeName.toLowerCase() === 'figure') {
        // Уже фигура, ок
      } else {
        figure = getSelectedFigure(figure);
      }

      if (!figure) return;

      console.log('Applying align:', align, 'to figure:', figure);

      editor.undoManager.transact(function () {
        // Надежно удаляем все старые классы
        var classesToRemove = [
          'av-image--align-left',
          'av-image--align-center',
          'av-image--align-right',
          'av-image--align-full',
        ];
        classesToRemove.forEach(function (cls) {
          editor.dom.removeClass(figure, cls);
        });

        // Добавляем новый
        editor.dom.addClass(figure, 'av-image--align-' + align);

        // Сбрасываем инлайновые стили
        var stylesToClear = {
          display: null,
          'margin-left': null,
          'margin-right': null,
          float: null,
        };

        // Сбрасываем ширину только для режима 'full', чтобы сработал css width:100%
        // В остальных случаях сохраняем (вдруг пользователь уменьшил картинку руками)
        if (align === 'full') {
          stylesToClear.width = null;
        }

        editor.dom.setStyles(figure, stylesToClear);
      });

      editor.fire('Change');
    };

    var applyMargin = function (figure, side, val) {
      if (!figure || figure.nodeName.toLowerCase() !== 'figure') return;

      editor.undoManager.transact(function () {
        if (side === 'all') {
          editor.dom.setStyle(figure, 'margin', val + 'px');
        } else {
          editor.dom.setStyle(figure, 'margin-' + side, val + 'px');
        }
      });
      editor.fire('Change');
    };

    // 3. УНИВЕРСАЛЬНЫЙ ДВОЙНОЙ КЛИК (Через Native DOM для надежности)
    editor.on('init', function () {
      var body = editor.getBody();
      console.log('AV-TOOLBAR: Editor initialized. Body:', body);

      body.addEventListener('dblclick', function (e) {
        console.log('AV-TOOLBAR: Native dblclick detected!', e.target);

        var target = e.target;
        var figure = getSelectedFigure(target);
        var img =
          target.nodeName.toLowerCase() === 'img' ? target : editor.dom.getParent(target, 'img');

        console.log('AV-TOOLBAR: Identification:', { figure: figure, img: img });

        if (figure || img) {
          e.preventDefault();
          e.stopPropagation();
          showCustomMenu(e, figure || img);
        }
      });

      // Дополнительно блокируем контекстное меню браузера, если это наша картинка (по желанию)
      // body.addEventListener('contextmenu', ...);
    });

    function showCustomMenu(e, targetNode) {
      // e - это нативное событие, у него есть clientX/clientY
      console.log('Opening menu at:', e.clientX, e.clientY);

      var figure = getSelectedFigure(targetNode);

      var oldMenu = document.getElementById('av-custom-image-menu');
      if (oldMenu) oldMenu.remove();

      var menu = document.createElement('div');
      menu.id = 'av-custom-image-menu';
      // z-index очень большой, чтобы перекрывать модалки TinyMCE
      menu.style.cssText =
        'position: fixed; z-index: 2147483647; background: #fff; border: 1px solid #ccc; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 5px; min-width: 190px; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; color: #333;';

      menu.style.left = e.clientX + 'px';
      menu.style.top = e.clientY + 'px';

      var createItem = function (label, callback, hasSubmenu) {
        var item = document.createElement('div');
        item.style.cssText =
          'padding: 8px 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border-radius: 4px; position: relative; transition: background 0.1s;';
        item.innerHTML =
          '<span>' +
          label +
          '</span>' +
          (hasSubmenu ? '<span style="font-size: 10px; color: #999;">▶</span>' : '');

        item.onmouseenter = function () {
          item.style.background = '#e6f7ff';
          item.style.color = '#1890ff';
          if (item.submenu) item.submenu.style.display = 'block';
        };
        item.onmouseleave = function () {
          item.style.background = 'transparent';
          item.style.color = '#333';
          if (item.submenu) item.submenu.style.display = 'none';
        };
        if (callback) {
          item.onclick = function (event) {
            console.log('Menu item clicked:', label);
            callback();
            menu.remove();
            event.preventDefault();
            event.stopPropagation();
          };
        }
        return item;
      };

      var createSubmenu = function (parent, items) {
        var sub = document.createElement('div');
        sub.style.cssText =
          'position: absolute; left: 100%; top: -5px; background: #fff; border: 1px solid #ccc; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 5px; min-width: 160px; display: none; border-radius: 6px; z-index: 2147483647;';
        items.forEach(function (i) {
          var subItem = document.createElement('div');
          subItem.style.cssText =
            'padding: 8px 12px; cursor: pointer; border-radius: 4px; color: #333; transition: background 0.1s;';
          subItem.innerText = i.label;
          subItem.onclick = function (event) {
            console.log('Submenu item clicked:', i.label);
            i.action();
            menu.remove();
            event.preventDefault();
            event.stopPropagation();
          };
          subItem.onmouseenter = function () {
            subItem.style.background = '#e6f7ff';
            subItem.style.color = '#1890ff';
          };
          subItem.onmouseleave = function () {
            subItem.style.background = 'transparent';
            subItem.style.color = '#333';
          };
          sub.appendChild(subItem);
        });
        parent.appendChild(sub);
        parent.submenu = sub;
      };

      // 1. ВЫРАВНИВАНИЕ
      var alignMenu = createItem('Выравнивание', null, true);
      createSubmenu(alignMenu, [
        {
          label: 'Слева',
          action: function () {
            applyAlign(figure || targetNode, 'left');
          },
        },
        {
          label: 'По центру',
          action: function () {
            applyAlign(figure || targetNode, 'center');
          },
        },
        {
          label: 'Справа',
          action: function () {
            applyAlign(figure || targetNode, 'right');
          },
        },
        {
          label: 'На всю ширину',
          action: function () {
            applyAlign(figure || targetNode, 'full');
          },
        },
      ]);
      menu.appendChild(alignMenu);

      // 2. ОТСТУПЫ
      var marginMenu = createItem('Отступы', null, true);
      createSubmenu(marginMenu, [
        {
          label: 'Слева (10px)',
          action: function () {
            applyMargin(figure || targetNode, 'left', 10);
          },
        },
        {
          label: 'Слева (20px)',
          action: function () {
            applyMargin(figure || targetNode, 'left', 20);
          },
        },
        {
          label: 'Справа (10px)',
          action: function () {
            applyMargin(figure || targetNode, 'right', 10);
          },
        },
        {
          label: 'Справа (20px)',
          action: function () {
            applyMargin(figure || targetNode, 'right', 20);
          },
        },
        {
          label: 'Сверху (10px)',
          action: function () {
            applyMargin(figure || targetNode, 'top', 10);
          },
        },
        {
          label: 'Сверху (20px)',
          action: function () {
            applyMargin(figure || targetNode, 'top', 20);
          },
        },
        {
          label: 'Снизу (10px)',
          action: function () {
            applyMargin(figure || targetNode, 'bottom', 10);
          },
        },
        {
          label: 'Снизу (20px)',
          action: function () {
            applyMargin(figure || targetNode, 'bottom', 20);
          },
        },
        {
          label: 'Убрать все (0px)',
          action: function () {
            editor.dom.setStyles(figure || targetNode, {
              'margin-left': '0',
              'margin-right': '0',
              'margin-top': '0',
              'margin-bottom': '0',
            });
            editor.fire('Change');
          },
        },
      ]);
      menu.appendChild(marginMenu);

      // 3. SEO
      menu.appendChild(
        createItem('SEO и Ссылка', function () {
          editor.execCommand('avImageSeo', false, figure || targetNode);
        }),
      );

      // 4. СТУДИЯ
      menu.appendChild(
        createItem('Открыть в Студии', function () {
          editor.execCommand('avImage', false, figure || targetNode);
        }),
      );

      document.body.appendChild(menu);

      var closeMenu = function (e) {
        // Не закрываем, если клик был внутри меню
        if (menu.contains(e.target)) return;
        menu.remove();
        document.removeEventListener('mousedown', closeMenu);
      };

      // Небольшая задержка, чтобы текущий клик не закрыл меню сразу
      setTimeout(function () {
        document.addEventListener('mousedown', closeMenu);
      }, 100);
    }

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
