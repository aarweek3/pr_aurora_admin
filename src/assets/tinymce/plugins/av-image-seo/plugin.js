(function () {
  'use strict';

  var tinymce = window.tinymce;

  tinymce.PluginManager.add('av-image-seo', function (editor) {
    function AvSeoModal(editor) {
      this.editor = editor;
      this.modal = null;
      this.overlay = null;
    }

    AvSeoModal.prototype.create = function (node) {
      var self = this;
      var figure = this.editor.dom.getParent(node, 'figure.aurora-image, figure.av-image');
      if (!figure) return;

      var img = figure.querySelector('img');
      var data = {
        alt: figure.getAttribute('data-alt') || (img ? img.alt : ''),
        title: figure.getAttribute('data-title') || (img ? img.title : ''),
        caption: figure.querySelector('figcaption')
          ? figure.querySelector('figcaption').innerHTML
          : '',
      };

      // Styles
      var styleId = 'av-seo-modal-styles';
      if (!document.getElementById(styleId)) {
        var s = document.createElement('style');
        s.id = styleId;
        s.innerHTML =
          '.av-seo-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); z-index:99999; display:flex; align-items:center; justify-content:center; } ' +
          '.av-seo-modal { background:#fff; width:450px; border-radius:16px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); overflow:hidden; font-family: sans-serif; animation: av-seo-bounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); } ' +
          '@keyframes av-seo-bounce { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } } ' +
          '.av-seo-header { background: #f8fafc; padding: 18px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; } ' +
          '.av-seo-title { color: #1e293b; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; } ' +
          '.av-seo-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; } ' +
          '.av-seo-field { display: flex; flex-direction: column; gap: 8px; } ' +
          '.av-seo-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; } ' +
          '.av-seo-input { width: 100%; height: 40px; padding: 0 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; transition: border-color 0.2s; } ' +
          '.av-seo-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); } ' +
          '.av-seo-textarea { width: 100%; min-height: 100px; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; resize: none; font-family: inherit; } ' +
          '.av-seo-textarea:focus { outline: none; border-color: #3b82f6; } ' +
          '.av-seo-footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; } ' +
          '.av-seo-btn { padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; } ' +
          '.av-seo-btn-cancel { background: #fff; color: #64748b; border: 1px solid #e2e8f0; } ' +
          '.av-seo-btn-cancel:hover { background: #f1f5f9; } ' +
          '.av-seo-btn-save { background: #3b82f6; color: #fff; } ' +
          '.av-seo-btn-save:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4); } ';
        document.head.appendChild(s);
      }

      // Create DOM
      this.overlay = document.createElement('div');
      this.overlay.className = 'av-seo-overlay';

      this.overlay.innerHTML =
        '<div class="av-seo-modal">' +
        '<div class="av-seo-header">' +
        '<div class="av-seo-title">SEO и атрибуты</div>' +
        '<div class="av-seo-close" style="cursor:pointer; color:#94a3b8;">✕</div>' +
        '</div>' +
        '<div class="av-seo-body">' +
        '<div class="av-seo-field">' +
        '<label class="av-seo-label">Alt текст (Описание)</label>' +
        '<input type="text" id="av-seo-alt" class="av-seo-input" value="' +
        (data.alt || '') +
        '" placeholder="Опишите изображение для поисковиков...">' +
        '</div>' +
        '<div class="av-seo-field">' +
        '<label class="av-seo-label">Заголовок (Title)</label>' +
        '<input type="text" id="av-seo-title-v" class="av-seo-input" value="' +
        (data.title || '') +
        '" placeholder="Всплывающая подсказка при наведении...">' +
        '</div>' +
        '<div class="av-seo-field">' +
        '<label class="av-seo-label">Подпись (Caption)</label>' +
        '<textarea id="av-seo-caption" class="av-seo-textarea" placeholder="Текст под изображением...">' +
        (data.caption || '') +
        '</textarea>' +
        '</div>' +
        '</div>' +
        '<div class="av-seo-footer">' +
        '<button class="av-seo-btn av-seo-btn-cancel">Отмена</button>' +
        '<button class="av-seo-btn av-seo-btn-save">Сохранить изменения</button>' +
        '</div>' +
        '</div>';

      document.body.appendChild(this.overlay);

      // Events
      var close = function () {
        self.overlay.remove();
      };
      this.overlay.querySelector('.av-seo-close').onclick = close;
      this.overlay.querySelector('.av-seo-btn-cancel').onclick = close;

      this.overlay.querySelector('.av-seo-btn-save').onclick = function () {
        var alt = document.getElementById('av-seo-alt').value;
        var title = document.getElementById('av-seo-title-v').value;
        var caption = document.getElementById('av-seo-caption').value;

        self.editor.undoManager.transact(function () {
          figure.setAttribute('data-alt', alt);
          figure.setAttribute('data-title', title);
          if (img) {
            img.alt = alt;
            img.title = title;
          }

          var figcaption = figure.querySelector('figcaption');
          if (caption.trim()) {
            if (!figcaption) {
              figcaption = self.editor.dom.create('figcaption', { class: 'aurora-image__caption' });
              figure.appendChild(figcaption);
            }
            figcaption.innerHTML = caption;
          } else if (figcaption) {
            self.editor.dom.remove(figcaption);
          }
        });

        self.editor.fire('Change');
        close();
      };

      // Focus alt
      setTimeout(function () {
        document.getElementById('av-seo-alt').focus();
      }, 100);
    };

    editor.addCommand('avImageSeo', function (ui, node) {
      var modal = new AvSeoModal(editor);
      modal.create(node || editor.selection.getNode());
    });
  });
})();
