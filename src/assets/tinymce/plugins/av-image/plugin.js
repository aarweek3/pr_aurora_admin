(function () {
  'use strict';

  var tinymce = window.tinymce;

  tinymce.PluginManager.add('av-image', function (editor) {
    function AvModal() {
      this.modal = null;
      this.overlay = null;
      this.isDragging = false;
      this.isResizing = false;
      this.offsetX = 0;
      this.offsetY = 0;
      this.width = 1400;
      this.height = 900;
      this.x = (window.innerWidth - 1400) / 2;
      this.y = (window.innerHeight - 900) / 2;
      this.currentSection = 'upload'; // upload, edit, settings
    }

    AvModal.prototype.create = function () {
      var self = this;
      var old = document.getElementById('av-image-modal-root');
      if (old) old.remove();

      this.overlay = document.createElement('div');
      this.overlay.id = 'av-image-modal-root';
      this.overlay.style.cssText =
        'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:99999; display:flex;';

      this.modal = document.createElement('div');
      this.modal.className = 'av-independent-modal';
      this.modal.style.cssText =
        'position:absolute; background:#fff; border-radius:12px; box-shadow:0 30px 100px rgba(0,0,0,0.6); overflow:hidden; display:flex; flex-direction:column;';
      this.updatePosition();

      this.render();

      this.overlay.appendChild(this.modal);
      document.body.appendChild(this.overlay);

      this.initEvents();
      this.injectStyles();
    };

    AvModal.prototype.render = function () {
      this.modal.innerHTML =
        '<div class="av-modal-header">' +
        '<div class="av-modal-title">Инструментарий для работы с изображением</div>' +
        '<div class="av-modal-tag">Div class plague</div>' +
        '<div class="av-modal-close">✕</div>' +
        '</div>' +
        '<div class="av-modal-body">' +
        // 1. Sidebar (Persistent)
        '<div class="av-sidebar-part">' +
        '<div class="av-sidebar-menu">' +
        '<div class="av-nav-item ' +
        (this.currentSection === 'upload' ? 'active' : '') +
        '" data-sec="upload">Загрузить</div>' +
        '<div class="av-nav-item ' +
        (this.currentSection === 'edit' ? 'active' : '') +
        '" data-sec="edit">Обработка</div>' +
        '<div class="av-nav-item ' +
        (this.currentSection === 'settings' ? 'active' : '') +
        '" data-sec="settings">Настройка</div>' +
        '<div class="av-modal-tag" style="margin-top:20px">Div class sidebar</div>' +
        '</div>' +
        '<div class="av-sidebar-btns">' +
        '<div class="av-btn-main">Вставить</div>' +
        '<div class="av-btn-main" style="background:#64748b">Отменить</div>' +
        '<div class="av-modal-tag" style="margin-top:auto">Div class button</div>' +
        '</div>' +
        '</div>' +
        // 2. Main content area (Reactive)
        '<div class="av-main-part">' +
        this.renderContent() +
        '</div>' +
        '</div>' +
        '<div class="av-modal-resizer"></div>';
    };

    AvModal.prototype.renderContent = function () {
      if (this.currentSection === 'upload') {
        return (
          '<div class="av-menu-one">' +
          '<span class="av-subnav-item active">Файл</span>' +
          '<span class="av-subnav-item">URL</span>' +
          '<span class="av-subnav-item">Затянуть</span>' +
          '<span class="av-modal-tag" style="margin-left:auto">Div class menu-one</span>' +
          '</div>' +
          '<div class="av-menu-two">' +
          '<div class="av-btn-main" style="padding:5px 15px; width:auto">Выбрать файл</div>' +
          '<span style="font-size:13px; color:#6b21a8">Вставить Url / Перетянуть файл</span>' +
          '<span class="av-modal-tag" style="margin-left:auto">Div class menu-two</span>' +
          '</div>' +
          '<div class="av-workspace">' +
          '<div class="av-canvas-zone">' +
          '<div class="av-dropbox-mock">Перетащите изображение сюда Div class dropbox</div>' +
          '<div class="av-modal-tag" style="position:absolute; bottom:15px; left:15px">Div class canvas</div>' +
          '</div>' +
          '</div>'
        );
      }

      if (this.currentSection === 'edit') {
        return (
          '<div class="av-menu-one">' +
          '<span class="av-subnav-item active">Обрезать</span>' +
          '<span class="av-subnav-item">Поворот</span>' +
          '<span class="av-subnav-item">Круг</span>' +
          '<span class="av-modal-tag" style="margin-left:auto">Div class menu-one (Tools)</span>' +
          '</div>' +
          '<div class="av-menu-two">' +
          '<div class="av-tool-controls">Инструментальные кнопки верхнего уровня...</div>' +
          '<span class="av-modal-tag" style="margin-left:auto">Div class menu-two</span>' +
          '</div>' +
          '<div class="av-workspace">' +
          '<div class="av-canvas-zone" style="background: #1e293b">' +
          '<div style="color:#fff">МЕСТО ДЛЯ КАНВАСА (DARK MODE)</div>' +
          '<div class="av-modal-tag" style="position:absolute; bottom:15px; left:15px">Div class canvas</div>' +
          '</div>' +
          '<div class="av-menu-three">' +
          '<div class="av-menu-three-content">Инструменты специфичного режима (Crop presets и т.д.)</div>' +
          '<div class="av-modal-tag" style="text-align:right">Div class menu-three</div>' +
          '</div>' +
          '</div>'
        );
      }

      if (this.currentSection === 'settings') {
        return (
          '<div class="av-menu-one">' +
          '<span class="av-subnav-item active">Общие параметры</span>' +
          '<span class="av-modal-tag" style="margin-left:auto">Div class menu-one</span>' +
          '</div>' +
          '<div class="av-settings-form">' +
          '<div class="av-form-field"><label>Alt текст</label><input type="text"></div>' +
          '<div class="av-form-field"><label>Ширина</label><input type="number" value="100"></div>' +
          '<div class="av-form-field"><label>Позиция</label><select><option>Центр</option><option>Слева</option></select></div>' +
          '</div>'
        );
      }
    };

    AvModal.prototype.updatePosition = function () {
      this.modal.style.left = this.x + 'px';
      this.modal.style.top = this.y + 'px';
      this.modal.style.width = this.width + 'px';
      this.modal.style.height = this.height + 'px';
    };

    AvModal.prototype.initEvents = function () {
      var self = this;
      var header = this.modal.querySelector('.av-modal-header');
      var closeBtn = this.modal.querySelector('.av-modal-close');
      var resizer = this.modal.querySelector('.av-modal-resizer');

      closeBtn.onclick = function () {
        self.overlay.remove();
      };

      // Обработка кликов (Делегирование)
      this.modal.onclick = function (e) {
        var secBtn = e.target.closest('.av-nav-item');
        if (secBtn) {
          self.currentSection = secBtn.getAttribute('data-sec');
          self.render();
          self.initEvents(); // Перепривязка после рендера
        }
      };

      header.onmousedown = function (e) {
        if (e.target !== header && e.target.className !== 'av-modal-title') return;
        self.isDragging = true;
        self.offsetX = e.clientX - self.x;
        self.offsetY = e.clientY - self.y;
        document.body.style.userSelect = 'none';
      };

      resizer.onmousedown = function (e) {
        self.isResizing = true;
        document.body.style.userSelect = 'none';
        e.stopPropagation();
        e.preventDefault();
      };

      window.onmousemove = function (e) {
        if (self.isDragging) {
          self.x = e.clientX - self.offsetX;
          self.y = e.clientY - self.offsetY;
          self.updatePosition();
        }
        if (self.isResizing) {
          self.width = Math.max(800, e.clientX - self.x);
          self.height = Math.max(600, e.clientY - self.y);
          self.updatePosition();
        }
      };

      window.onmouseup = function () {
        self.isDragging = false;
        self.isResizing = false;
        document.body.style.userSelect = '';
      };
    };

    AvModal.prototype.injectStyles = function () {
      var id = 'av-independent-styles';
      if (document.getElementById(id)) return;
      var s = document.createElement('style');
      s.id = id;
      s.textContent =
        '.av-independent-modal * { box-sizing: border-box; margin: 0; padding: 0; } ' +
        '.av-modal-header { height: 60px; background: #cbd5e1; border-bottom: 2px solid #94a3b8; display: flex; align-items: center; padding: 0 20px; cursor: move; flex-shrink: 0; } ' +
        '.av-modal-title { flex: 1; font-weight: bold; color: #1e293b; font-family: sans-serif; font-size: 16px; } ' +
        '.av-modal-tag { font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; font-family: sans-serif; } ' +
        '.av-modal-close { cursor: pointer; font-size: 22px; color: #1e293b; padding: 10px; font-weight: bold; } ' +
        '.av-modal-body { display: flex; flex: 1; min-height: 0; } ' +
        '.av-sidebar-part { width: 280px; display: flex; flex-direction: column; border-right: 2px solid #e2e8f0; flex-shrink: 0; } ' +
        '.av-sidebar-menu { flex: 1; background: #ffedd5; padding: 25px; border-bottom: 2px solid #fed7aa; } ' +
        '.av-sidebar-btns { height: 200px; background: #dcfce7; padding: 25px; display: flex; flex-direction: column; gap: 15px; flex-shrink: 0; } ' +
        '.av-nav-item { padding: 12px; margin-bottom: 8px; background: #fff; border-radius: 6px; cursor: pointer; border: 1px solid #fdba74; font-weight: bold; font-family: sans-serif; text-align: center; color: #64748b; } ' +
        '.av-nav-item.active { background: #fff7ed; color: #c2410c; border-color: #c2410c; } ' +
        '.av-main-part { flex: 1; display: flex; flex-direction: column; min-width: 0; } ' +
        '.av-menu-one { height: 60px; background: #dcfce7; display: flex; align-items: center; padding: 0 25px; gap: 30px; border-bottom: 2px solid #bbf7d0; flex-shrink: 0; font-family: sans-serif; font-weight: bold; color: #166534; } ' +
        '.av-subnav-item { cursor: pointer; opacity: 0.6; } ' +
        '.av-subnav-item.active { opacity: 1; border-bottom: 2px solid #166534; } ' +
        '.av-menu-two { height: 75px; background: #f3e8ff; display: flex; align-items: center; padding: 0 25px; gap: 20px; border-bottom: 2px solid #e9d5ff; flex-shrink: 0; font-family: sans-serif; } ' +
        '.av-workspace { flex: 1; display: flex; min-height: 0; } ' +
        '.av-canvas-zone { flex: 1; background: #dbeafe; display: flex; align-items: center; justify-content: center; position: relative; border: 1px solid #bfdbfe; } ' +
        '.av-dropbox-mock { border: 3px dashed #3b82f6; padding: 40px; color: #3b82f6; background: rgba(255,255,255,0.6); border-radius: 12px; font-weight: bold; font-family: sans-serif; } ' +
        '.av-menu-three { width: 400px; background: #fee2e2; border-left: 2px solid #fecaca; padding: 30px; display: flex; flex-direction: column; flex-shrink: 0; } ' +
        '.av-menu-three-content { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; color: #b91c1c; font-size: 15px; font-weight: 500; font-family: sans-serif; } ' +
        '.av-btn-main { background: #2563eb; color: #fff; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; text-align: center; font-size: 14px; font-family: sans-serif; } ' +
        '.av-modal-resizer { position: absolute; right: 0; bottom: 0; width: 24px; height: 24px; cursor: nwse-resize; background: linear-gradient(135deg, transparent 50%, #cbd5e1 50%); } ' +
        '.av-settings-form { padding: 40px; display: flex; flex-direction: column; gap: 20px; font-family: sans-serif; } ' +
        '.av-form-field { display: flex; flex-direction: column; gap: 8px; } ' +
        '.av-form-field label { font-weight: bold; color: #334155; } ' +
        '.av-form-field input, .av-form-field select { padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; } ';
      document.head.appendChild(s);
    };

    editor.ui.registry.addButton('av-image-text', {
      text: 'Вставить изображение',
      onAction: function () {
        var modal = new AvModal();
        modal.create();
      },
    });
  });
})();
