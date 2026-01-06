(function () {
  'use strict';

  var tinymce = window.tinymce;

  tinymce.PluginManager.add('av-image', function (editor) {
    /**
     * AvLoader - Handles image loading logic (File or URL)
     * Returns Promises with normalized image data.
     */
    function AvLoader() {}

    AvLoader.prototype.loadFile = function (file) {
      return new Promise(function (resolve, reject) {
        if (!file.type.startsWith('image/')) {
          reject('Selected file is not an image.');
          return;
        }

        var reader = new FileReader();
        reader.onload = function (evt) {
          var dataUrl = evt.target.result;
          var img = new Image();
          img.onload = function () {
            resolve({
              dataUrl: dataUrl,
              name: file.name,
              size: (file.size / 1024).toFixed(1) + ' KB',
              width: img.width,
              height: img.height,
              type: file.type,
            });
          };
          img.onerror = function () {
            reject('Failed to load image data.');
          };
          img.src = dataUrl;
        };
        reader.onerror = function () {
          reject('Failed to read file.');
        };
        reader.readAsDataURL(file);
      });
    };

    AvLoader.prototype.loadUrl = function (url) {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () {
          resolve({
            dataUrl: url,
            name: url.substring(url.lastIndexOf('/') + 1) || 'Image from URL',
            size: 'Unknown',
            width: img.width,
            height: img.height,
            type: 'url',
          });
        };
        img.onerror = function () {
          reject('Failed to load image from URL.');
        };
        img.src = url;
      });
    };

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
      this.uploadMode = 'file'; // file, url, drop

      // Edit Mode State
      this.editTool = 'crop'; // crop, rotate, circle

      // Image Data
      this.loadedImage = null; // Data URL of the image
      this.fileInfo = {
        name: 'Нет данных',
        size: '0 KB',
        width: 0,
        height: 0,
        type: '',
      };
      this.logs = []; // Array of log strings
      this.loader = new AvLoader();
    }

    AvModal.prototype.addLog = function (msg) {
      var time = new Date().toLocaleTimeString();
      this.logs.push('[' + time + '] ' + msg);
    };

    // Helper to calculate where the image is actually drawn insideobject-fit: contain
    AvModal.prototype.getRenderedImageRect = function (imgElement) {
      if (!imgElement) return { top: 0, left: 0, width: 0, height: 0 };

      var cw = imgElement.width; // Container (element) width
      var ch = imgElement.height; // Container (element) height
      var nw = imgElement.naturalWidth;
      var nh = imgElement.naturalHeight;

      if (nw === 0 || nh === 0) return { top: 0, left: 0, width: 0, height: 0 };

      var imgRatio = nw / nh;
      var containerRatio = cw / ch;

      var rw, rh, rt, rl;

      if (imgRatio > containerRatio) {
        // Image is wider than container (constrained by width)
        rw = cw;
        rh = cw / imgRatio;
        rtl = 0;
        top = (ch - rh) / 2;
      } else {
        // Image is taller than container (constrained by height)
        rh = ch;
        rw = ch * imgRatio;
        top = 0;
        rtl = (cw - rw) / 2; // 'left'
      }

      return {
        width: rw,
        height: rh,
        top: (ch - rh) / 2, // Centered vertically
        left: (cw - rw) / 2, // Centered horizontally
      };
    };

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
      // Info Block Data
      var srcFileText =
        this.fileInfo.name !== 'Нет данных'
          ? this.fileInfo.name +
            ' (' +
            this.fileInfo.width +
            'x' +
            this.fileInfo.height +
            ', ' +
            this.fileInfo.size +
            ')'
          : 'Нет данных';

      var infoBlock =
        '<div class="av-info-picture">' +
        '<div class="av-info-row">' +
        '<span class="av-info-label">Исходный файл:</span>' +
        '<span class="av-info-value">' +
        srcFileText +
        '</span>' +
        '</div>' +
        '<div class="av-info-row">' +
        '<span class="av-info-label">Выходной файл:</span>' +
        '<span class="av-info-value">Нет обработанных данных</span>' +
        '</div>' +
        '<div class="av-modal-tag" style="position:absolute; top:10px; right:10px">Div class info-picture</div>' +
        '</div>';

      // Log Textarea Content
      var logContent = this.logs.join('\n');

      // Shared Canvas Content (Image or Placeholder)
      var canvasContent = '';
      if (this.loadedImage) {
        // Core layer: The image itself
        canvasContent =
          '<div style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#0f172a;">' +
          '<img id="av-main-img" src="' +
          this.loadedImage +
          '" style="width:100%; height:100%; object-fit:contain; box-shadow: 0 0 20px rgba(0,0,0,0.5);">' +
          '</div>';

        // Edit Mode Overlays
        if (this.currentSection === 'edit' && this.editTool === 'crop') {
          // We will calculate exact pos in initEvents or via a resize handler.
          // For static render, we just place the container.
          canvasContent +=
            '<div id="av-crop-overlay" style="position:absolute; pointer-events:none;"></div>';
        }
      } else {
        // Default placeholders depending on mode
        if (this.currentSection === 'upload' && this.uploadMode === 'file') {
          canvasContent =
            '<div class="av-preview-text">Выберите файл на компьютере для предпросмотра</div>';
        } else if (this.currentSection === 'upload' && this.uploadMode === 'url') {
          canvasContent = '<div class="av-preview-text">Введите URL и нажмите Загрузить</div>';
        } else if (this.currentSection === 'upload' && this.uploadMode === 'drop') {
          canvasContent =
            '<div class="av-dropbox-active" id="av-dropzone">Перетащите изображение сюда</div>';
        } else if (this.currentSection === 'edit') {
          canvasContent = '<div class="av-preview-text">Нет изображения для обработки</div>';
        } else {
          canvasContent = '<div style="color:#fff">МЕСТО ДЛЯ КАНВАСА (Пусто)</div>';
        }
      }
      canvasContent +=
        '<div class="av-modal-tag" style="position:absolute; bottom:15px; left:15px">Div class canvas</div>';

      // --- SECTION: UPLOAD ---
      if (this.currentSection === 'upload') {
        var menuTwoContent = '';

        if (this.uploadMode === 'file') {
          menuTwoContent =
            '<div class="av-btn-main" id="av-btn-browse">Выбрать файл</div>' +
            '<input type="file" id="av-input-file" hidden accept="image/*">' +
            '<span class="av-modal-tag" style="margin-left:auto">Div class menu-two</span>';
        } else if (this.uploadMode === 'url') {
          menuTwoContent =
            '<input type="text" class="av-input-text" id="av-input-url" placeholder="https://example.com/image.jpg">' +
            '<div class="av-btn-main" id="av-btn-load-url">Загрузить</div>' +
            '<span class="av-modal-tag" style="margin-left:auto">Div class menu-two</span>';
        } else if (this.uploadMode === 'drop') {
          menuTwoContent =
            '<span style="color:#64748b; font-weight:bold; font-size:14px">Режим перетаскивания</span>' +
            '<span class="av-modal-tag" style="margin-left:auto">Div class menu-two</span>';
        }

        return (
          '<div class="av-menu-one">' +
          '<span class="av-subnav-item ' +
          (this.uploadMode === 'file' ? 'active' : '') +
          '" data-mode="file">Файл</span>' +
          '<span class="av-subnav-item ' +
          (this.uploadMode === 'url' ? 'active' : '') +
          '" data-mode="url">URL</span>' +
          '<span class="av-subnav-item ' +
          (this.uploadMode === 'drop' ? 'active' : '') +
          '" data-mode="drop">Затянуть</span>' +
          '<span class="av-modal-tag" style="margin-left:auto">Div class menu-one</span>' +
          '</div>' +
          '<div class="av-menu-two">' +
          menuTwoContent +
          '</div>' +
          '<div class="av-workspace">' +
          // Left Column (1/3)
          '<div style="display:flex; flex-direction:column; flex: 0 0 33.333%; min-width:0; border-right:1px solid #bfdbfe;">' +
          '<div class="av-canvas-zone" style="flex: 3; border:none; border-bottom:1px solid #bfdbfe; position:relative; overflow:hidden;">' +
          canvasContent +
          '</div>' +
          '<div class="av-canvas-info" style="flex: 1; background: #f0f9ff; padding: 10px; display:flex; flex-direction:column; position:relative;">' +
          '<textarea class="av-info-textarea" readonly>' +
          logContent +
          '</textarea>' +
          '<div class="av-modal-tag" style="position:absolute; bottom:5px; right:5px; opacity:0.5;">Div class canvas-info</div>' +
          '</div>' +
          '</div>' +
          // Right Column (2/3)
          '<div class="av-menu-three" style="width:auto; flex:1; background: #fdf2f8; border-color: #fbcfe8;">' +
          '<div class="av-menu-three-content" style="color:#db2777">Область предпросмотра или подсказок (2/3)</div>' +
          '<div class="av-modal-tag" style="text-align:right">Div class menu-three</div>' +
          '</div>' +
          '</div>' +
          infoBlock
        );
      }

      // --- SECTION: EDIT ---
      // --- SECTION: EDIT ---
      if (this.currentSection === 'edit') {
        var menuThreeContent = '';
        if (this.editTool === 'crop') {
          menuThreeContent =
            '<div class="av-crop-tools-container">' +
            // Manual Resize Box
            '<div class="av-crop-manual-box">' +
            '<div class="av-crop-inputs-row">' +
            '<div class="av-crop-input-group">' +
            '<input type="number" placeholder="Ширина" class="av-input-sm" id="av-crop-width">' +
            '</div>' +
            '<div class="av-crop-lock-btn" title="Сохранять пропорции">🔒</div>' +
            '<div class="av-crop-input-group">' +
            '<input type="number" placeholder="Высота" class="av-input-sm" id="av-crop-height">' +
            '</div>' +
            '<button class="av-btn-blue-sm">Применить размер</button>' +
            '</div>' +
            '<div class="av-crop-checks-row">' +
            '<label class="av-checkbox-label"><input type="checkbox" checked> Пропорционально</label>' +
            '<label class="av-checkbox-label"><input type="checkbox" checked> Показать сетку</label>' +
            '</div>' +
            '</div>' +
            // Presets Header
            '<div class="av-crop-presets-header">' +
            '<span>Предустановленные размеры</span>' +
            '<button class="av-btn-add-preset">+</button>' +
            '</div>' +
            // Presets Grid
            '<div class="av-crop-presets-grid scroll-custom">' +
            // Generating sample cards
            this.renderPresetCard('instagram', 'Instagram Post', '1080 × 1080') +
            this.renderPresetCard('instagram', 'Instagram Story', '1080 × 1920') +
            this.renderPresetCard('instagram', 'Instagram Reels', '1080 × 1920') +
            this.renderPresetCard('instagram', 'Instagram Carousel', '1080 × 1350') +
            this.renderPresetCard('facebook', 'Facebook Post', '1200 × 630') +
            this.renderPresetCard('facebook', 'Facebook Cover', '820 × 312') +
            this.renderPresetCard('facebook', 'Facebook Story', '1080 × 1920') +
            this.renderPresetCard('youtube', 'YouTube Thumb', '1280 × 720') +
            this.renderPresetCard('youtube-banner', 'YouTube Banner', '2560 × 1440') +
            this.renderPresetCard('twitter', 'Twitter Post', '1200 × 675') +
            this.renderPresetCard('twitter', 'Twitter Header', '1500 × 500') +
            this.renderPresetCard('linkedin', 'LinkedIn Post', '1200 × 627') +
            this.renderPresetCard('linkedin', 'LinkedIn Cover', '1584 × 396') +
            this.renderPresetCard('tiktok', 'TikTok Video', '1080 × 1920') +
            this.renderPresetCard('pinterest', 'Pinterest Pin', '1000 × 1500') +
            this.renderPresetCard('monitor', 'HD 16:9', '1920 × 1080') +
            this.renderPresetCard('tv', 'Full HD', '1920 × 1080') +
            this.renderPresetCard('film', '4K UHD', '3840 × 2160') +
            '</div>' +
            '</div>';
        } else {
          menuThreeContent =
            '<div class="av-menu-three-content">Инструменты для ' + this.editTool + '</div>';
        }

        return (
          '<div class="av-menu-one">' +
          '<span class="av-subnav-item ' +
          (this.editTool === 'crop' ? 'active' : '') +
          '" data-tool="crop">Обрезать</span>' +
          '<span class="av-subnav-item ' +
          (this.editTool === 'rotate' ? 'active' : '') +
          '" data-tool="rotate">Поворот</span>' +
          '<span class="av-subnav-item ' +
          (this.editTool === 'circle' ? 'active' : '') +
          '" data-tool="circle">Круг</span>' +
          '<span class="av-modal-tag" style="margin-left:auto">Div class menu-one (Tools)</span>' +
          '</div>' +
          '<div class="av-menu-two">' +
          '<div class="av-tool-controls">' +
          (this.editTool === 'crop'
            ? '<button class="av-btn-main" id="av-btn-crop-apply">Применить обрезку</button>'
            : 'Инструменты...') +
          '</div>' +
          '<span class="av-modal-tag" style="margin-left:auto">Div class menu-two</span>' +
          '</div>' +
          '<div class="av-workspace">' +
          // Left Column (1/3)
          '<div style="display:flex; flex-direction:column; flex: 0 0 33.333%; min-width:0; border-right:1px solid #bfdbfe;">' +
          '<div class="av-canvas-zone" style="background: #1e293b; flex: 3; border:none; border-bottom:1px solid #334155; position:relative; overflow:hidden;">' +
          canvasContent +
          '</div>' +
          '<div class="av-canvas-info" style="flex: 1; background: #f0f9ff; padding: 10px; display:flex; flex-direction:column; position:relative;">' +
          '<textarea class="av-info-textarea" readonly>' +
          logContent +
          '</textarea>' +
          '<div class="av-modal-tag" style="position:absolute; bottom:5px; right:5px; opacity:0.5;">Div class canvas-info</div>' +
          '</div>' +
          '</div>' +
          // Right Column (2/3)
          '<div class="av-menu-three" style="width:auto; flex:1; padding:0; background:#fdf2f8;">' +
          menuThreeContent +
          '<div class="av-modal-tag" style="text-align:right; position:absolute; bottom:5px; right:5px;">Div class menu-three</div>' +
          '</div>' +
          '</div>' +
          infoBlock
        );
      }

      // --- SECTION: SETTINGS ---
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

    AvModal.prototype.renderPresetCard = function (iconType, title, size) {
      // Simple icon placeholder logic
      var iconHtml = '🖼️';
      if (iconType === 'instagram') iconHtml = '<span style="color:#E1306C">📷</span>';
      if (iconType === 'facebook') iconHtml = '<span style="color:#1877F2">fb</span>';
      if (iconType === 'youtube') iconHtml = '<span style="color:#FF0000">▶️</span>';
      if (iconType === 'youtube-banner')
        iconHtml = '<span style="color:#FF0000; font-size:22px">🎨</span>';
      if (iconType === 'twitter') iconHtml = '<span style="color:#1DA1F2">🐦</span>';
      if (iconType === 'linkedin') iconHtml = '<span style="color:#0A66C2">in</span>';
      if (iconType === 'tiktok') iconHtml = '<span style="color:#000000">🎵</span>';
      if (iconType === 'pinterest') iconHtml = '<span style="color:#BD081C">📌</span>';
      if (iconType === 'monitor') iconHtml = '<span style="color:#555">🖥️</span>';
      if (iconType === 'tv') iconHtml = '<span style="color:#555">📺</span>';
      if (iconType === 'film') iconHtml = '<span style="color:#64748b">🎬</span>';

      return (
        '<div class="av-preset-card">' +
        '<div class="av-preset-icon">' +
        iconHtml +
        '</div>' +
        '<div class="av-preset-name">' +
        title +
        '</div>' +
        '<div class="av-preset-size">' +
        size +
        '</div>' +
        '</div>'
      );
    };

    AvModal.prototype.updatePosition = function () {
      this.modal.style.left = this.x + 'px';
      this.modal.style.top = this.y + 'px';
      this.modal.style.width = this.width + 'px';
      this.modal.style.height = this.height + 'px';
    };

    AvModal.prototype.updateCropOverlay = function () {
      var img = this.modal.querySelector('#av-main-img');
      var overlay = this.modal.querySelector('#av-crop-overlay');

      if (img && overlay) {
        // Need to wait for image to have visual dimensions
        if (img.width === 0) {
          // Try again in a moment
          setTimeout(this.updateCropOverlay.bind(this), 50);
          return;
        }

        var rect = this.getRenderedImageRect(img);
        overlay.style.top = rect.top + 'px';
        overlay.style.left = rect.left + 'px';
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
        // Visual debug
        overlay.style.border = '2px solid rgba(255, 0, 0, 0.5)';
        overlay.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.5)'; // Darken outside
      }
    };

    AvModal.prototype.initEvents = function () {
      var self = this;
      var header = this.modal.querySelector('.av-modal-header');
      var closeBtn = this.modal.querySelector('.av-modal-close');
      var resizer = this.modal.querySelector('.av-modal-resizer');

      // --- FILE INPUT HANDLING ---
      var fileInput = this.modal.querySelector('#av-input-file');
      if (fileInput) {
        fileInput.onchange = function (e) {
          var file = e.target.files[0];
          if (!file) return;
          self.processFile(file, 'File Input');
        };
      }

      // --- URL INPUT HANDLING ---
      var btnLoadUrl = this.modal.querySelector('#av-btn-load-url');
      var inputUrl = this.modal.querySelector('#av-input-url');
      if (btnLoadUrl && inputUrl) {
        btnLoadUrl.onclick = function () {
          var url = inputUrl.value.trim();
          if (!url) return;
          self.addLog('Loading URL: ' + url);
          self.loader
            .loadUrl(url)
            .then(function (data) {
              self.loadedImage = data.dataUrl;
              self.fileInfo = data;
              self.addLog(
                'Image loaded from URL: ' + self.fileInfo.width + 'x' + self.fileInfo.height,
              );
              self.render();
              self.initEvents();
            })
            .catch(function (err) {
              self.addLog('Error: ' + err);
              self.render();
              self.initEvents();
            });
        };
      }

      // --- DROPZONE HANDLING (PARENT CONTAINER) ---
      var canvasZone = this.modal.querySelector('.av-canvas-zone');
      if (canvasZone && self.currentSection === 'upload' && self.uploadMode === 'drop') {
        canvasZone.ondragover = function (e) {
          e.preventDefault();
          e.stopPropagation();
          canvasZone.style.outline = '4px dashed #3b82f6';
          canvasZone.style.outlineOffset = '-4px';
        };
        canvasZone.ondragleave = function (e) {
          e.preventDefault();
          e.stopPropagation();
          canvasZone.style.outline = 'none';
        };
        canvasZone.ondrop = function (e) {
          e.preventDefault();
          e.stopPropagation();
          canvasZone.style.outline = 'none';
          if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            self.processFile(e.dataTransfer.files[0], 'Drag & Drop');
          }
        };
      }

      // --- CROP OVERLAY INIT ---
      if (this.currentSection === 'edit' && this.editTool === 'crop' && this.loadedImage) {
        // Trigger calculation after render
        setTimeout(function () {
          self.updateCropOverlay();
        }, 0);

        // Also recalculate on window resize since canvas zone changes size
        // We can attach a resize observer or just simple window resize for now
        // For simplicity:
        // window.addEventListener('resize', ...) - caution with memory leaks in SPA,
        // usually we'd track this listener to remove it.
      }

      closeBtn.onclick = function () {
        self.overlay.remove();
      };

      this.modal.onclick = function (e) {
        var secBtn = e.target.closest('.av-nav-item');
        if (secBtn) {
          self.currentSection = secBtn.getAttribute('data-sec');
          self.render();
          self.initEvents();
          return;
        }
        var modeBtn = e.target.closest('.av-subnav-item');
        if (modeBtn) {
          var mode = modeBtn.getAttribute('data-mode');
          var tool = modeBtn.getAttribute('data-tool');
          if (self.currentSection === 'upload' && mode) {
            self.uploadMode = mode;
            self.render();
            self.initEvents();
            return;
          }
          if (self.currentSection === 'edit' && tool) {
            self.editTool = tool;
            self.render();
            self.initEvents();
            return;
          }
        }
        // Button Browse
        if (e.target.id === 'av-btn-browse') {
          var inp = document.getElementById('av-input-file');
          if (inp) inp.click();
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
          if (self.currentSection === 'edit' && self.editTool === 'crop') {
            self.updateCropOverlay(); // Update crop overlay on window resize
          }
        }
      };

      window.onmouseup = function () {
        self.isDragging = false;
        self.isResizing = false;
        document.body.style.userSelect = '';
      };
    };

    AvModal.prototype.processFile = function (file, source) {
      var self = this;
      self.addLog('Started loading file (' + source + '): ' + file.name);

      this.loader
        .loadFile(file)
        .then(function (data) {
          self.loadedImage = data.dataUrl;
          self.fileInfo = data;
          self.addLog(
            'Image loaded successfully (' + self.fileInfo.width + 'x' + self.fileInfo.height + ')',
          );
          self.render();
          self.initEvents();
        })
        .catch(function (err) {
          self.addLog('Error: ' + err);
          self.render();
          self.initEvents();
        });
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
        '.av-subnav-item { cursor: pointer; opacity: 0.6; padding: 5px 0; } ' +
        '.av-subnav-item.active { opacity: 1; border-bottom: 2px solid #166534; } ' +
        '.av-menu-two { height: 75px; background: #f3e8ff; display: flex; align-items: center; padding: 0 25px; gap: 20px; border-bottom: 2px solid #e9d5ff; flex-shrink: 0; font-family: sans-serif; } ' +
        '.av-workspace { flex: 1; display: flex; min-height: 0; } ' +
        '.av-canvas-zone { flex: 1; background: #dbeafe; display: flex; align-items: center; justify-content: center; position: relative; border: 1px solid #bfdbfe; } ' +
        '.av-preview-text { color: #5785a8; font-weight: bold; font-family: sans-serif; } ' +
        '.av-dropbox-active { border: 4px dashed #3b82f6; width: 300px; height: 200px; display: flex; align-items: center; justify-content: center; color: #3b82f6; background: #eff6ff; border-radius: 12px; font-weight: bold; font-family: sans-serif; cursor: pointer; } ' +
        '.av-menu-three { width: 400px; background: #fee2e2; border-left: 2px solid #fecaca; padding: 30px; display: flex; flex-direction: column; flex-shrink: 0; } ' +
        '.av-menu-three-content { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; color: #b91c1c; font-size: 15px; font-weight: 500; font-family: sans-serif; } ' +
        '.av-btn-main { background: #2563eb; color: #fff; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; text-align: center; font-size: 14px; font-family: sans-serif; } ' +
        '.av-input-text { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; width: 300px; } ' +
        '.av-modal-resizer { position: absolute; right: 0; bottom: 0; width: 24px; height: 24px; cursor: nwse-resize; background: linear-gradient(135deg, transparent 50%, #cbd5e1 50%); } ' +
        '.av-settings-form { padding: 40px; display: flex; flex-direction: column; gap: 20px; font-family: sans-serif; } ' +
        '.av-form-field { display: flex; flex-direction: column; gap: 8px; } ' +
        '.av-form-field label { font-weight: bold; color: #334155; } ' +
        '.av-form-field input, .av-form-field select { padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; } ' +
        '.av-info-picture { height: 80px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: center; padding: 10px 20px; font-size: 12px; font-family: sans-serif; color: #64748b; font-weight: 500; flex-shrink: 0; gap: 5px; overflow-y: auto; position: relative; } ' +
        '.av-info-row { display: flex; gap: 10px; align-items: center; } ' +
        '.av-info-label { font-weight: bold; color: #475569; min-width: 100px; } ' +
        '.av-info-textarea { width: 100%; height: 100%; border: 1px solid #cbd5e1; padding: 10px; font-family: monospace; font-size: 12px; resize: none; border-radius: 4px; color: #334155; outline: none; } ' +
        // New styles for Crop Tools
        '.av-crop-tools-container { display: flex; flex-direction: column; height: 100%; width: 100%; padding: 20px; overflow: hidden; } ' +
        '.av-crop-manual-box { background: #dbeafe; border: 2px solid #93c5fd; border-radius: 8px; padding: 15px; display: flex; flex-direction: column; gap: 10px; flex-shrink: 0; } ' +
        '.av-crop-inputs-row { display: flex; align-items: center; gap: 10px; } ' +
        '.av-crop-input-group { flex: 1; } ' +
        '.av-input-sm { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; outline: none; text-align: center; } ' +
        '.av-crop-lock-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; color: #f59e0b; } ' +
        '.av-btn-blue-sm { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: sans-serif; font-size: 13px; text-transform: nowrap; white-space: nowrap; } ' +
        '.av-btn-blue-sm:hover { background: #2563eb; } ' +
        '.av-crop-checks-row { display: flex; gap: 20px; margin-top: 5px; } ' +
        '.av-checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #334155; font-family: sans-serif; cursor: pointer; } ' +
        '.av-crop-presets-header { margin-top: 20px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; font-weight: bold; color: #be185d; font-family: sans-serif; font-size: 16px; flex-shrink: 0; } ' +
        '.av-btn-add-preset { width: 30px; height: 30px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: bold; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; } ' +
        '.av-crop-presets-grid { display: grid; grid-template-columns: repeat(auto-fill, 90px); gap: 8px; overflow-y: auto; padding-right: 5px; flex: 1; justify-content: start; align-content: start; } ' +
        '.av-preset-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; height: 70px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; text-align: center; gap: 2px; } ' +
        '.av-preset-card:hover { border-color: #3b82f6; transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); } ' +
        '.av-preset-icon { font-size: 26px; margin-bottom: 2px; } ' +
        '.av-preset-name { font-size: 10px; font-weight: bold; color: #1e293b; line-height: 1.1; } ' +
        '.av-preset-size { font-size: 9px; color: #64748b; } ' +
        '.scroll-custom::-webkit-scrollbar { width: 6px; } ' +
        '.scroll-custom::-webkit-scrollbar-track { background: transparent; } ' +
        '.scroll-custom::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; } ' +
        '.scroll-custom::-webkit-scrollbar-thumb:hover { background: #94a3b8; } ';
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
