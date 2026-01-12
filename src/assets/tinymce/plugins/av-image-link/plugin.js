(function () {
  'use strict';

  var tinymce = window.tinymce;

  tinymce.PluginManager.add('av-image-link', function (editor) {
    function AvLinkModal(editor) {
      this.editor = editor;
      this.modal = null;
      this.overlay = null;
    }

    AvLinkModal.prototype.create = function (node) {
      var self = this;
      var figure = this.editor.dom.getParent(node, 'figure.aurora-image');
      if (!figure) return;

      var data = {
        link: figure.getAttribute('data-link') || '',
        isClickable: figure.getAttribute('data-clickable') === 'true',
        openInNewWindow: figure.getAttribute('data-new-window') === 'true',
      };

      // Styles
      var styleId = 'av-link-modal-styles';
      if (!document.getElementById(styleId)) {
        var s = document.createElement('style');
        s.id = styleId;
        s.innerHTML =
          '.av-link-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); z-index:99999; display:flex; align-items:center; justify-content:center; } ' +
          '.av-link-modal { background:#fff; width:450px; border-radius:16px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); overflow:hidden; font-family: sans-serif; animation: av-link-bounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); } ' +
          '@keyframes av-link-bounce { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } } ' +
          '.av-link-header { background: #f8fafc; padding: 18px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; } ' +
          '.av-link-title { color: #1e293b; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; } ' +
          '.av-link-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; } ' +
          '.av-link-field { display: flex; flex-direction: column; gap: 8px; } ' +
          '.av-link-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; } ' +
          '.av-link-input { width: 100%; height: 40px; padding: 0 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; transition: border-color 0.2s; } ' +
          '.av-link-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); } ' +
          '.av-link-checkbox-row { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; } ' +
          '.av-link-checkbox { width: 18px; height: 18px; cursor: pointer; } ' +
          '.av-link-checkbox-text { font-size: 14px; color: #334155; font-weight: 600; } ' +
          '.av-link-footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; } ' +
          '.av-link-btn { padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; } ' +
          '.av-link-btn-cancel { background: #fff; color: #64748b; border: 1px solid #e2e8f0; } ' +
          '.av-link-btn-save { background: #3b82f6; color: #fff; } ' +
          '.av-link-btn-save:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4); } ';
        document.head.appendChild(s);
      }

      // Create DOM
      this.overlay = document.createElement('div');
      this.overlay.className = 'av-link-overlay';

      this.overlay.innerHTML =
        '<div class="av-link-modal">' +
        '<div class="av-link-header">' +
        '<div class="av-link-title">Ссылка и поведение</div>' +
        '<div class="av-link-close" style="cursor:pointer; color:#94a3b8;">✕</div>' +
        '</div>' +
        '<div class="av-link-body">' +
        '<div class="av-link-field">' +
        '<label class="av-link-label">URL ссылки</label>' +
        '<input type="text" id="av-link-url" class="av-link-input" value="' +
        (data.link || '') +
        '" placeholder="https://...">' +
        '</div>' +
        '<label class="av-link-checkbox-row">' +
        '<input type="checkbox" id="av-link-clickable" class="av-link-checkbox" ' +
        (data.isClickable ? 'checked' : '') +
        '>' +
        '<span class="av-link-checkbox-text">Кликабельное</span>' +
        '</label>' +
        '<label class="av-link-checkbox-row">' +
        '<input type="checkbox" id="av-link-newwin" class="av-link-checkbox" ' +
        (data.openInNewWindow ? 'checked' : '') +
        '>' +
        '<span class="av-link-checkbox-text">В новом окне</span>' +
        '</label>' +
        '</div>' +
        '<div class="av-link-footer">' +
        '<button class="av-link-btn av-link-btn-cancel">Отмена</button>' +
        '<button class="av-link-btn av-link-btn-save">Сохранить</button>' +
        '</div>' +
        '</div>';

      document.body.appendChild(this.overlay);

      // Events
      var close = function () {
        self.overlay.remove();
      };
      this.overlay.querySelector('.av-link-close').onclick = close;
      this.overlay.querySelector('.av-link-btn-cancel').onclick = close;

      this.overlay.querySelector('.av-link-btn-save').onclick = function () {
        var url = document.getElementById('av-link-url').value;
        var clickable = document.getElementById('av-link-clickable').checked;
        var newWin = document.getElementById('av-link-newwin').checked;

        self.editor.undoManager.transact(function () {
          figure.setAttribute('data-link', url);
          figure.setAttribute('data-clickable', clickable);
          figure.setAttribute('data-new-window', newWin);

          var img = figure.querySelector('img');
          var a = figure.querySelector('a');

          if (clickable && url.trim()) {
            if (!a) {
              a = self.editor.dom.create('a', { href: url });
              if (img) {
                img.parentNode.insertBefore(a, img);
                a.appendChild(img);
              }
            } else {
              self.editor.dom.setAttribs(a, { href: url });
            }
            if (newWin) {
              self.editor.dom.setAttribs(a, { target: '_blank', rel: 'noopener' });
            } else {
              a.removeAttribute('target');
              a.removeAttribute('rel');
            }
          } else {
            if (a && img) {
              a.parentNode.insertBefore(img, a);
              self.editor.dom.remove(a);
            }
          }
        });

        self.editor.fire('Change');
        close();
      };

      setTimeout(function () {
        document.getElementById('av-link-url').focus();
      }, 100);
    };

    editor.addCommand('avImageLink', function (ui, node) {
      var modal = new AvLinkModal(editor);
      modal.create(node || editor.selection.getNode());
    });
  });
})();
