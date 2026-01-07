(function () {
  'use strict';

  var tinymce = window.tinymce;

  tinymce.PluginManager.add('av-image', function (editor) {
    /**
     * AvAssets - Centralized storage for icons and templates
     */
    var AvAssets = {
      getLockSVG: function (isLocked) {
        var color = isLocked ? '#ef4444' : '#22c55e';
        var path = isLocked
          ? 'M 70.774 35.262 h -3.813 V 20.155 C 66.961 9.024 57.937 0 46.806 0 h -3.612 C 32.063 0 23.039 9.024 23.039 20.155 v 15.107 h -3.813 c -3.586 0 -6.493 2.907 -6.493 6.493 v 41.751 c 0 3.586 2.907 6.493 6.493 6.493 h 51.549 c 3.586 0 6.493 -2.907 6.493 -6.493 V 41.755 C 77.268 38.169 74.361 35.262 70.774 35.262 z M 48.548 62.731 v 9.575 c 0 1.959 -1.588 3.548 -3.548 3.548 s -3.548 -1.588 -3.548 -3.548 v -9.575 c -2.128 -1.395 -3.388 -4.003 -2.784 -6.845 c 0.519 -2.438 2.493 -4.405 4.932 -4.915 c 4.192 -0.876 7.883 2.299 7.883 6.337 C 51.483 59.578 50.314 61.573 48.548 62.731 z M 31.032 35.262 V 22.92 c 0 -8.244 6.683 -14.927 14.927 -14.927 c 7.185 0 13.009 5.824 13.009 13.009 v 14.26 H 31.032 z'
          : 'M 70.774 35.262 h -3.813 V 20.155 C 66.961 9.024 57.937 0 46.806 0 h -3.612 C 32.063 0 23.039 9.024 23.039 20.155 v 5.246 h 7.993 v -2.48 c 0 -8.244 6.683 -14.927 14.927 -14.927 c 7.185 0 13.009 5.824 13.009 13.009 v 14.26 H 41.868 v 0 H 19.224 c -3.586 0.001 -6.492 2.908 -6.492 6.493 v 41.751 c 0 3.586 2.907 6.494 6.494 6.494 h 51.549 c 3.586 0 6.494 -2.907 6.494 -6.494 V 41.755 C 77.268 38.169 74.361 35.262 70.774 35.262 z M 48.548 62.731 v 9.575 c 0 1.959 -1.588 3.548 -3.548 3.548 s -3.548 -1.589 -3.548 -3.548 v -9.575 c -2.128 -1.395 -3.388 -4.003 -2.784 -6.845 c 0.519 -2.438 2.493 -4.405 4.932 -4.915 c 4.192 -0.876 7.883 2.299 7.883 6.337 C 51.483 59.578 50.314 61.573 48.548 62.731 z';
        return (
          '<svg width="18" height="18" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; fill: ' +
          color +
          '; pointer-events: none;"><g transform="translate(1.4 1.4) scale(2.81)"><path d="' +
          path +
          '"/></g></svg>'
        );
      },
      fallbackIcon: 'assets/tinymce/icons/update-image/standart.svg',
    };

    /**
     * AvLoader - Handles image loading logic (File or URL)
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
              width: img.naturalWidth,
              height: img.naturalHeight,
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
            width: img.naturalWidth,
            height: img.naturalHeight,
            type: 'url',
          });
        };
        img.onerror = function () {
          reject('Failed to load image from URL.');
        };
        img.src = url;
      });
    };

    /**
     * AvPresetManager - Handles image presets logic
     */
    function AvPresetManager(baseUrl) {
      this.baseUrl = baseUrl || 'https://localhost:7233';
      this.presets = [];
    }

    AvPresetManager.prototype.load = function () {
      var self = this;
      var url = this.baseUrl + '/configs/image-presets.json?v=' + Date.now();
      return fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error('Failed to load');
          return res.json();
        })
        .then(function (data) {
          self.presets = data.sort(function (a, b) {
            return (a.order || 99) - (b.order || 99);
          });
          return self.presets;
        });
    };

    /**
     * AvImageTools - Pure canvas transformation logic
     */
    function AvImageTools() {}

    AvImageTools.prototype.resize = function (dataUrl, targetW, targetH) {
      return new Promise(function (resolve) {
        var canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        var ctx = canvas.getContext('2d');
        var img = new Image();
        img.onload = function () {
          ctx.drawImage(img, 0, 0, targetW, targetH);
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = dataUrl;
      });
    };

    AvImageTools.prototype.getRenderedImageRect = function (imgElement) {
      var canvasZone = imgElement.parentElement;
      if (!canvasZone) return null;

      var containerW = canvasZone.clientWidth;
      var containerH = canvasZone.clientHeight;
      var naturalW = imgElement.naturalWidth;
      var naturalH = imgElement.naturalHeight;

      var ratio = Math.min(containerW / naturalW, containerH / naturalH);
      var width = naturalW * ratio;
      var height = naturalH * ratio;

      return {
        top: (containerH - height) / 2,
        left: (containerW - width) / 2,
        width: width,
        height: height,
      };
    };

    /**
     * AvCropManager - Manages interactive crop overlay
     */
    function AvCropManager(overlayCanvas, imgElement) {
      this.overlay = overlayCanvas;
      this.img = imgElement;
      this.ctx = this.overlay.getContext('2d');
      this.cropRect = null;
      this.active = false;
      this.showGrid = true;
      this.aspectRatio = null; // null = unlocked, number = locked ratio
    }

    AvCropManager.prototype.init = function () {
      if (!this.overlay || !this.img) return;
      this.showGrid = true;
      this.active = true;

      // Initial crop: 80% of current view, centered
      var w = this.overlay.width * 0.8;
      var h = this.overlay.height * 0.8;
      var x = (this.overlay.width - w) / 2;
      var y = (this.overlay.height - h) / 2;

      this.cropRect = { x: x, y: y, w: w, h: h };
      this.draw();
    };

    AvCropManager.prototype.draw = function () {
      if (!this.active || !this.cropRect) return;
      var ctx = this.ctx;
      var cvs = this.overlay;

      // Clear entire canvas
      ctx.clearRect(0, 0, cvs.width, cvs.height);

      // 1. Draw dim background (overlay)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, cvs.width, cvs.height);

      // 2. Clear the selection area (make it transparent)
      ctx.clearRect(this.cropRect.x, this.cropRect.y, this.cropRect.w, this.cropRect.h);

      // 3. Draw border around selection
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.cropRect.x, this.cropRect.y, this.cropRect.w, this.cropRect.h);

      // 4. Draw Grid (Rule of Thirds) if enabled
      if (this.showGrid) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;

        var dw = this.cropRect.w / 3;
        var dh = this.cropRect.h / 3;

        // Vertical lines
        for (var i = 1; i < 3; i++) {
          ctx.moveTo(this.cropRect.x + dw * i, this.cropRect.y);
          ctx.lineTo(this.cropRect.x + dw * i, this.cropRect.y + this.cropRect.h);
        }
        // Horizontal lines
        for (var j = 1; j < 3; j++) {
          ctx.moveTo(this.cropRect.x, this.cropRect.y + dh * j);
          ctx.lineTo(this.cropRect.x + this.cropRect.w, this.cropRect.y + dh * j);
        }
        ctx.stroke();
      }

      // 5. Draw resize handles (corners)
      this.drawHandle(ctx, this.cropRect.x, this.cropRect.y); // top-left
      this.drawHandle(ctx, this.cropRect.x + this.cropRect.w, this.cropRect.y); // top-right
      this.drawHandle(ctx, this.cropRect.x, this.cropRect.y + this.cropRect.h); // bottom-left
      this.drawHandle(ctx, this.cropRect.x + this.cropRect.w, this.cropRect.y + this.cropRect.h); // bottom-right
    };

    AvCropManager.prototype.drawHandle = function (ctx, x, y) {
      var size = 8;
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - size / 2, y - size / 2, size, size);
    };

    AvCropManager.prototype.setShowGrid = function (show) {
      this.showGrid = show;
      this.draw();
    };

    AvCropManager.prototype.toggleProportional = function () {
      if (this.aspectRatio === null && this.cropRect) {
        // Lock: save current aspect ratio
        this.aspectRatio = this.cropRect.w / this.cropRect.h;
      } else {
        // Unlock
        this.aspectRatio = null;
      }
    };

    AvCropManager.prototype.isProportional = function () {
      return this.aspectRatio !== null;
    };

    AvCropManager.prototype.getCropDimensions = function () {
      if (!this.cropRect) return { width: 0, height: 0 };
      // Return dimensions in display coordinates (canvas pixels)
      return {
        width: Math.round(this.cropRect.w),
        height: Math.round(this.cropRect.h),
      };
    };

    AvCropManager.prototype.setTargetSize = function (targetWidth, targetHeight) {
      if (!this.overlay) return;

      var maxW = this.overlay.width;
      var maxH = this.overlay.height;

      // Clamp to canvas bounds
      var w = Math.min(targetWidth, maxW);
      var h = Math.min(targetHeight, maxH);

      // Center the crop rect
      var x = (maxW - w) / 2;
      var y = (maxH - h) / 2;

      this.cropRect = { x: x, y: y, w: w, h: h };

      // Store target output size (exact dimensions user wants)
      this.targetOutputSize = { width: targetWidth, height: targetHeight };

      // Update aspect ratio if proportional mode is on
      if (this.aspectRatio !== null) {
        this.aspectRatio = w / h;
      }

      this.draw();
    };

    // Mouse interaction state
    AvCropManager.prototype.initInteraction = function (onUpdate) {
      this.isDragging = false;
      this.isResizing = false;
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.resizeHandle = null; // 'tl', 'tr', 'bl', 'br'
      this.onUpdate = onUpdate; // Callback to update UI inputs
      this.targetOutputSize = null; // {width, height} - exact output size if manually set
    };

    AvCropManager.prototype.getHandleAtPoint = function (x, y) {
      if (!this.cropRect) return null;
      var handleSize = 12;
      var rect = this.cropRect;

      // Check corners
      var handles = [
        { name: 'tl', x: rect.x, y: rect.y },
        { name: 'tr', x: rect.x + rect.w, y: rect.y },
        { name: 'bl', x: rect.x, y: rect.y + rect.h },
        { name: 'br', x: rect.x + rect.w, y: rect.y + rect.h },
      ];

      for (var i = 0; i < handles.length; i++) {
        var h = handles[i];
        if (
          x >= h.x - handleSize / 2 &&
          x <= h.x + handleSize / 2 &&
          y >= h.y - handleSize / 2 &&
          y <= h.y + handleSize / 2
        ) {
          return h.name;
        }
      }

      return null;
    };

    AvCropManager.prototype.isPointInside = function (x, y) {
      if (!this.cropRect) return false;
      var rect = this.cropRect;
      return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
    };

    AvCropManager.prototype.onMouseDown = function (x, y) {
      if (!this.cropRect) return;

      var handle = this.getHandleAtPoint(x, y);
      if (handle) {
        this.isResizing = true;
        this.resizeHandle = handle;
        this.dragStartX = x;
        this.dragStartY = y;
        this.startRect = {
          x: this.cropRect.x,
          y: this.cropRect.y,
          w: this.cropRect.w,
          h: this.cropRect.h,
        };
      } else if (this.isPointInside(x, y)) {
        this.isDragging = true;
        this.dragStartX = x;
        this.dragStartY = y;
        this.startRect = {
          x: this.cropRect.x,
          y: this.cropRect.y,
          w: this.cropRect.w,
          h: this.cropRect.h,
        };
      }
    };

    AvCropManager.prototype.onMouseMove = function (x, y) {
      if (!this.cropRect) return false;

      var dx = x - this.dragStartX;
      var dy = y - this.dragStartY;
      var changed = false;

      if (this.isDragging) {
        // Move the crop rect
        var newX = this.startRect.x + dx;
        var newY = this.startRect.y + dy;

        // Clamp to canvas bounds
        newX = Math.max(0, Math.min(newX, this.overlay.width - this.cropRect.w));
        newY = Math.max(0, Math.min(newY, this.overlay.height - this.cropRect.h));

        this.cropRect.x = newX;
        this.cropRect.y = newY;

        // Clear target output size when manually dragging
        this.targetOutputSize = null;

        changed = true;
      } else if (this.isResizing) {
        // Resize the crop rect
        var newW = this.startRect.w;
        var newH = this.startRect.h;
        var newX = this.startRect.x;
        var newY = this.startRect.y;

        switch (this.resizeHandle) {
          case 'br': // bottom-right
            newW = this.startRect.w + dx;
            newH = this.startRect.h + dy;
            break;
          case 'bl': // bottom-left
            newW = this.startRect.w - dx;
            newH = this.startRect.h + dy;
            newX = this.startRect.x + dx;
            break;
          case 'tr': // top-right
            newW = this.startRect.w + dx;
            newH = this.startRect.h - dy;
            newY = this.startRect.y + dy;
            break;
          case 'tl': // top-left
            newW = this.startRect.w - dx;
            newH = this.startRect.h - dy;
            newX = this.startRect.x + dx;
            newY = this.startRect.y + dy;
            break;
        }

        // Apply proportional constraint if enabled
        if (this.aspectRatio !== null) {
          // Adjust height based on width to maintain aspect ratio
          newH = newW / this.aspectRatio;

          // Adjust position for top/left handles
          if (this.resizeHandle === 'tl' || this.resizeHandle === 'tr') {
            newY = this.startRect.y + this.startRect.h - newH;
          }
          if (this.resizeHandle === 'tl' || this.resizeHandle === 'bl') {
            newX = this.startRect.x + this.startRect.w - newW;
          }
        }

        // Enforce minimum size
        newW = Math.max(50, newW);
        newH = Math.max(50, newH);

        // Clamp to canvas bounds
        if (newX < 0) {
          newW += newX;
          newX = 0;
        }
        if (newY < 0) {
          newH += newY;
          newY = 0;
        }
        if (newX + newW > this.overlay.width) {
          newW = this.overlay.width - newX;
        }
        if (newY + newH > this.overlay.height) {
          newH = this.overlay.height - newY;
        }

        this.cropRect.x = newX;
        this.cropRect.y = newY;
        this.cropRect.w = newW;
        this.cropRect.h = newH;

        // Clear target output size when manually resizing
        this.targetOutputSize = null;

        changed = true;
      }

      if (changed) {
        this.draw();

        // Call update callback to sync UI inputs
        if (this.onUpdate) {
          this.onUpdate(Math.round(this.cropRect.w), Math.round(this.cropRect.h));
        }
      }

      return changed;
    };

    AvCropManager.prototype.onMouseUp = function () {
      this.isDragging = false;
      this.isResizing = false;
      this.resizeHandle = null;
    };

    AvCropManager.prototype.getCroppedImage = function () {
      if (!this.cropRect || !this.img || !this.overlay) return null;

      // Calculate scale factor: natural image size / displayed canvas size
      var scaleX = this.img.naturalWidth / this.overlay.width;
      var scaleY = this.img.naturalHeight / this.overlay.height;

      // Convert crop rect from canvas coordinates to natural image coordinates
      var cropX = Math.round(this.cropRect.x * scaleX);
      var cropY = Math.round(this.cropRect.y * scaleY);
      var cropW = Math.round(this.cropRect.w * scaleX);
      var cropH = Math.round(this.cropRect.h * scaleY);

      // Determine output size
      var outputW, outputH;
      if (this.targetOutputSize) {
        outputW = this.targetOutputSize.width;
        outputH = this.targetOutputSize.height;
      } else {
        outputW = cropW;
        outputH = cropH;
      }

      // Create temporary canvas for cropping
      var tempCanvas = document.createElement('canvas');
      tempCanvas.width = outputW;
      tempCanvas.height = outputH;
      var tempCtx = tempCanvas.getContext('2d');

      // Draw cropped portion of image (scaled to output size if target size is set)
      tempCtx.drawImage(this.img, cropX, cropY, cropW, cropH, 0, 0, outputW, outputH);

      // Return as data URL with actual dimensions
      return {
        dataUrl: tempCanvas.toDataURL('image/png'),
        width: outputW,
        height: outputH,
      };
    };

    AvCropManager.prototype.destroy = function () {
      this.active = false;
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
      }
    };

    /**
     * AvUIManager - Manages HTML/CSS generation and DOM insertion
     */
    function AvUIManager() {}

    AvUIManager.prototype.renderLayout = function (state, presetsHtml) {
      return (
        '<div class="av-modal-header">' +
        '<div class="av-modal-title">Инструментарий для работы с изображением</div>' +
        '<div class="av-modal-tag">Section: ' +
        state.currentSection +
        '</div>' +
        '<div class="av-modal-close">✕</div>' +
        '</div>' +
        '<div class="av-modal-body">' +
        '<div class="av-sidebar-part">' +
        '<div class="av-sidebar-menu">' +
        '<div class="av-nav-item ' +
        (state.currentSection === 'upload' ? 'active' : '') +
        '" data-sec="upload">Загрузить</div>' +
        '<div class="av-nav-item ' +
        (state.currentSection === 'edit' ? 'active' : '') +
        '" data-sec="edit">Обработка</div>' +
        '<div class="av-nav-item ' +
        (state.currentSection === 'settings' ? 'active' : '') +
        '" data-sec="settings">Настройка</div>' +
        '</div>' +
        '<div class="av-sidebar-btns">' +
        '<div class="av-btn-main" style="background:#059669">Вставить в текст</div>' +
        '<div class="av-btn-main" style="background:#64748b" onclick="this.closest(\'.av-image-modal-root\').remove()">Отмена</div>' +
        '</div>' +
        '</div>' +
        '<div class="av-main-part">' +
        this.renderContent(state, presetsHtml) +
        '</div>' +
        '</div>' +
        '<div class="av-modal-resizer"></div>'
      );
    };

    AvUIManager.prototype.renderContent = function (state, presetsHtml) {
      var srcFileText =
        state.fileInfo.name !== 'Нет данных'
          ? state.fileInfo.name +
            ' (' +
            state.fileInfo.width +
            'x' +
            state.fileInfo.height +
            ', ' +
            state.fileInfo.size +
            ')'
          : 'Нет данных';
      var processedFileText = state.processedFileInfo
        ? state.processedFileInfo.width +
          'x' +
          state.processedFileInfo.height +
          ' (' +
          state.processedFileInfo.size +
          ')'
        : 'Нет обработанных данных';

      var infoBlock =
        '<div class="av-info-picture">' +
        '<div class="av-info-row"><span class="av-info-label">Исходный файл:</span><span class="av-info-value">' +
        srcFileText +
        '</span></div>' +
        '<div class="av-info-row"><span class="av-info-label">Выходной файл:</span><span class="av-info-value">' +
        processedFileText +
        '</span></div>' +
        '</div>';

      var canvasContent = '';
      if (state.loadedImage) {
        canvasContent =
          '<div style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#0f172a;">' +
          '<img id="av-main-img" src="' +
          state.loadedImage +
          '" style="max-width:100%; max-height:100%; object-fit:contain; box-shadow: 0 0 20px rgba(0,0,0,0.5);">' +
          '</div>';
        if (state.currentSection === 'edit' && state.editTool === 'crop') {
          canvasContent +=
            '<canvas id="av-crop-overlay" style="position:absolute; top:0; left:0; pointer-events:auto;"></canvas>';
        }
      } else {
        canvasContent =
          '<div class="av-preview-text">' +
          (state.uploadMode === 'file'
            ? 'Выберите файл для предпросмотра'
            : state.uploadMode === 'url'
            ? 'Введите URL изображения'
            : 'Перетащите изображение сюда') +
          '</div>';
      }

      if (state.currentSection === 'upload') {
        var menuTwo = '';
        if (state.uploadMode === 'file')
          menuTwo =
            '<div class="av-btn-main" id="av-btn-browse">Выбрать файл</div><input type="file" id="av-input-file" hidden accept="image/*">';
        else if (state.uploadMode === 'url')
          menuTwo =
            '<input type="text" class="av-input-text" id="av-input-url" placeholder="https://example.com/image.jpg"><div class="av-btn-main" id="av-btn-load-url">Загрузить</div>';
        else menuTwo = '<span style="color:#64748b; font-weight:bold;">Режим перетаскивания</span>';

        return (
          '<div class="av-menu-one">' +
          '<span class="av-subnav-item ' +
          (state.uploadMode === 'file' ? 'active' : '') +
          '" data-mode="file">Файл</span>' +
          '<span class="av-subnav-item ' +
          (state.uploadMode === 'url' ? 'active' : '') +
          '" data-mode="url">URL</span>' +
          '<span class="av-subnav-item ' +
          (state.uploadMode === 'drop' ? 'active' : '') +
          '" data-mode="drop">Затянуть</span>' +
          '</div>' +
          '<div class="av-menu-two">' +
          menuTwo +
          '</div>' +
          '<div class="av-workspace">' +
          '<div class="av-canvas-zone">' +
          canvasContent +
          '</div>' +
          '<div class="av-canvas-info" style="width:250px; border-left:1px solid #e2e8f0; display:flex; flex-direction:column;">' +
          '<textarea class="av-info-textarea" readonly style="flex:1; border:none; padding:10px; font-size:11px; background:#f8fafc;">' +
          state.logs.join('\n') +
          '</textarea>' +
          '</div>' +
          '</div>' +
          infoBlock
        );
      }

      if (state.currentSection === 'edit') {
        var menuThree = '';
        if (state.editTool === 'crop') {
          menuThree =
            '<div class="av-crop-tools-container">' +
            '<div class="av-crop-manual-box">' +
            '<div class="av-crop-inputs-row">' +
            '<input type="number" class="av-input-sm" id="av-crop-width" placeholder="W">' +
            '<div class="av-crop-lock-btn" id="av-crop-lock-btn">' +
            AvAssets.getLockSVG(state.cropProportional) +
            '</div>' +
            '<input type="number" class="av-input-sm" id="av-crop-height" placeholder="H">' +
            '<button class="av-btn-blue-sm" id="av-btn-crop-size">Задать размер</button>' +
            '</div>' +
            '<div class="av-crop-checks-row">' +
            '<label class="av-checkbox-label"><input type="checkbox" id="av-crop-proportional" ' +
            (state.cropProportional ? 'checked' : '') +
            '> Фикс. пропорции</label>' +
            '<label class="av-checkbox-label"><input type="checkbox" id="av-crop-show-grid" ' +
            (state.showGrid ? 'checked' : '') +
            '> Сетка</label>' +
            '</div>' +
            '</div>' +
            '<div class="av-resize-box" style="margin-top:15px; background:#fff1f2; padding:10px; border:1px dashed #fda4af; border-radius:6px;">' +
            '<div style="font-weight:bold; color:#9f1239; font-size:12px; margin-bottom:10px;">🚀 Быстрое увеличение изображения</div>' +
            '<div class="av-crop-inputs-row">' +
            '<input type="number" class="av-input-sm" id="av-resize-width" placeholder="W">' +
            '<div class="av-resize-lock-btn" id="av-resize-lock-btn">' +
            AvAssets.getLockSVG(state.resizeProportional) +
            '</div>' +
            '<input type="number" class="av-input-sm" id="av-resize-height" placeholder="H">' +
            '<button class="av-btn-blue-sm" id="av-btn-resize-image">Resize</button>' +
            '</div>' +
            '</div>' +
            '<div class="av-crop-presets-header">Пресеты</div>' +
            '<div class="av-crop-presets-grid scroll-custom">' +
            presetsHtml +
            '</div>' +
            '</div>';
        }

        return (
          '<div class="av-menu-one">' +
          '<span class="av-subnav-item ' +
          (state.editTool === 'crop' ? 'active' : '') +
          '" data-tool="crop">Обрезать</span>' +
          '<span class="av-subnav-item ' +
          (state.editTool === 'rotate' ? 'active' : '') +
          '" data-tool="rotate">Поворот</span>' +
          '</div>' +
          '<div class="av-menu-two">' +
          (state.editTool === 'crop'
            ? '<button class="av-btn-main" id="av-btn-crop-apply">Применить обрезку</button>'
            : 'Инструменты...') +
          '</div>' +
          '<div class="av-workspace">' +
          '<div style="display:flex; flex-direction:column; flex: 0 0 33.333%; min-width:0; border-right:2px solid #e2e8f0;">' +
          '<div class="av-canvas-zone" style="background:#1e293b; border:none; flex:3;">' +
          canvasContent +
          '</div>' +
          '<textarea class="av-info-textarea" readonly style="flex:1; border:none; padding:10px; font-size:11px; background:#f8fafc; border-top:1px solid #e2e8f0;">' +
          state.logs.join('\n') +
          '</textarea>' +
          '</div>' +
          '<div class="av-menu-three" style="flex:1; background:#fdf2f8; overflow-y:auto;">' +
          menuThree +
          '</div>' +
          '</div>' +
          infoBlock
        );
      }

      if (state.currentSection === 'settings') {
        return (
          '<div class="av-menu-one"><span class="av-subnav-item active">Общие</span></div>' +
          '<div class="av-settings-form">' +
          '<div class="av-form-field"><label>Alt текст</label><input type="text"></div>' +
          '</div>'
        );
      }
    };

    AvUIManager.prototype.renderPresetCard = function (preset, index) {
      var icon =
        preset.icon || '<img src="' + AvAssets.fallbackIcon + '" style="width:24px; height:24px;">';
      return (
        '<div class="av-preset-card" data-preset-idx="' +
        index +
        '">' +
        '<div class="av-preset-icon">' +
        icon +
        '</div>' +
        '<div class="av-preset-name">' +
        preset.name +
        '</div>' +
        '<div class="av-preset-size">' +
        preset.width +
        ' × ' +
        preset.height +
        '</div>' +
        '</div>'
      );
    };

    AvUIManager.prototype.injectStyles = function () {
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
        '.av-crop-presets-header { margin-top: 20px; margin-bottom: 10px; display: flex; align-items: center; font-weight: bold; color: #be185d; font-family: sans-serif; font-size: 16px; flex-shrink: 0; } ' +
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

    /**
     * AvModal - Main orchestrator of the plugin
     */
    function AvModal() {
      // Services
      this.loader = new AvLoader();
      this.ui = new AvUIManager();
      this.presetManager = new AvPresetManager('https://localhost:7233');
      this.imageTools = new AvImageTools();

      // UI Elements
      this.modal = null;
      this.overlay = null;
      this.cropManager = null;

      // Modal State
      this.width = 1400;
      this.height = 900;
      this.x = (window.innerWidth - 1400) / 2;
      this.y = (window.innerHeight - 900) / 2;
      this.isDragging = false;
      this.isResizing = false;

      // Logic State
      this.currentSection = 'upload'; // upload, edit, settings
      this.uploadMode = 'file'; // file, url, drop
      this.editTool = 'crop'; // crop, rotate, circle

      // Image Data
      this.loadedImage = null; // Data URL
      this.fileInfo = { name: 'Нет данных', size: '0 KB', width: 0, height: 0, type: '' };
      this.processedFileInfo = null;

      // Internal State
      this.logs = [];
      this.cropProportional = false;
      this.resizeProportional = false;
      this.showGrid = true;
    }

    AvModal.prototype.addLog = function (msg) {
      var time = new Date().toLocaleTimeString();
      var logMsg = '[' + time + '] ' + msg;
      this.logs.push(logMsg);
      console.log('AV-LOG:', logMsg);

      var textarea = this.modal ? this.modal.querySelector('.av-info-textarea') : null;
      if (textarea) {
        textarea.value = this.logs.join('\n');
        textarea.scrollTop = textarea.scrollHeight;
      }
    };

    AvModal.prototype.loadPresets = function () {
      var self = this;
      return this.presetManager
        .load()
        .then(function (presets) {
          self.addLog('Loaded ' + presets.length + ' presets from server');
        })
        .catch(function (err) {
          self.addLog('Presets load error: ' + err.message);
        });
    };

    AvModal.prototype.updateIconsUI = function () {
      if (!this.modal) return;

      // Crop Lock
      var cropLockBtn = this.modal.querySelector('#av-crop-lock-btn');
      if (cropLockBtn) {
        var isLocked = this.cropManager ? this.cropManager.isProportional() : this.cropProportional;
        cropLockBtn.innerHTML = AvAssets.getLockSVG(isLocked);
        cropLockBtn.style.background = isLocked ? '#fff1f2' : '#f0fdf4';
        cropLockBtn.style.borderColor = isLocked ? '#fda4af' : '#bbf7d0';
      }

      // Resize Lock
      var resizeLockBtn = this.modal.querySelector('#av-resize-lock-btn');
      if (resizeLockBtn) {
        resizeLockBtn.innerHTML = AvAssets.getLockSVG(this.resizeProportional);
        resizeLockBtn.style.background = this.resizeProportional ? '#fff1f2' : '#f0fdf4';
        resizeLockBtn.style.borderColor = this.resizeProportional ? '#fda4af' : '#bbf7d0';
      }
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
        'position:absolute; background:#fff; border-radius:12px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);';
      this.updatePosition();

      this.ui.injectStyles();
      this.render(); // This now calls initEvents internally

      this.overlay.appendChild(this.modal);
      document.body.appendChild(this.overlay);

      this.loadPresets().then(function () {
        self.render();
      });
    };

    AvModal.prototype.render = function () {
      if (!this.modal) return;
      var self = this;
      var presetsHtml = '';
      this.presetManager.presets.forEach(function (p, idx) {
        presetsHtml += self.ui.renderPresetCard(p, idx);
      });

      this.modal.innerHTML = this.ui.renderLayout(this, presetsHtml);
      this.initEvents();
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
      if (!img || !overlay) return;

      if (img.width === 0) {
        setTimeout(this.updateCropOverlay.bind(this), 50);
        return;
      }

      var rect = this.imageTools.getRenderedImageRect(img);
      overlay.style.top = rect.top + 'px';
      overlay.style.left = rect.left + 'px';
      overlay.width = rect.width;
      overlay.height = rect.height;
      overlay.style.width = rect.width + 'px';
      overlay.style.height = rect.height + 'px';

      var self = this;
      if (!this.cropManager) {
        this.cropManager = new AvCropManager(overlay, img);
        this.cropManager.init();
        this.cropManager.initInteraction(function (w, h) {
          var wIn = self.modal.querySelector('#av-crop-width');
          var hIn = self.modal.querySelector('#av-crop-height');
          if (wIn) wIn.value = w;
          if (hIn) hIn.value = h;
        });
      } else {
        this.cropManager.overlay = overlay;
        this.cropManager.img = img;
        this.cropManager.ctx = overlay.getContext('2d');
      }

      // Re-attach events (essential if canvas was re-rendered)
      overlay.onmousedown = function (e) {
        var r = overlay.getBoundingClientRect();
        self.cropManager.onMouseDown(e.clientX - r.left, e.clientY - r.top);
      };
      overlay.onmousemove = function (e) {
        var r = overlay.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        var h = self.cropManager.getHandleAtPoint(x, y);
        if (h) {
          overlay.style.cursor = h === 'tl' || h === 'br' ? 'nwse-resize' : 'nesw-resize';
        } else {
          overlay.style.cursor = self.cropManager.isPointInside(x, y) ? 'move' : 'default';
        }
        self.cropManager.onMouseMove(x, y);
      };
      overlay.onmouseup = overlay.onmouseleave = function () {
        self.cropManager.onMouseUp();
      };

      if (this.cropManager.active) this.cropManager.draw();
    };

    AvModal.prototype.initEvents = function () {
      var self = this;
      var header = this.modal.querySelector('.av-modal-header');

      // --- 1. SPECIAL OVERLAYS (Wait for DOM) ---
      if (this.currentSection === 'edit' && this.editTool === 'crop' && this.loadedImage) {
        setTimeout(function () {
          self.updateCropOverlay();
          self.updateIconsUI();
          // Sync inputs
          var dims = self.cropManager.getCropDimensions();
          var wIn = self.modal.querySelector('#av-crop-width');
          var hIn = self.modal.querySelector('#av-crop-height');
          var rwIn = self.modal.querySelector('#av-resize-width');
          var rhIn = self.modal.querySelector('#av-resize-height');
          if (wIn) wIn.value = dims.width;
          if (hIn) hIn.value = dims.height;
          if (rwIn) rwIn.value = self.cropManager.img.naturalWidth;
          if (rhIn) rhIn.value = self.cropManager.img.naturalHeight;
        }, 50);
      }

      // --- 2. CLICK DELEGATION ---
      this.modal.onclick = function (e) {
        var t = e.target;

        // Close
        if (t.closest('.av-modal-close')) return self.overlay.remove();

        // Navigation
        var nav = t.closest('.av-nav-item');
        if (nav) {
          self.currentSection = nav.getAttribute('data-sec');
          return self.render();
        }

        // Sub-navigation (Upload Mode or Edit Tool)
        var sub = t.closest('.av-subnav-item');
        if (sub) {
          var mode = sub.getAttribute('data-mode');
          var tool = sub.getAttribute('data-tool');
          if (self.currentSection === 'upload' && mode) self.uploadMode = mode;
          if (self.currentSection === 'edit' && tool) self.editTool = tool;
          return self.render();
        }

        // Action Buttons
        if (t.id === 'av-btn-browse') return self.modal.querySelector('#av-input-file').click();

        if (t.id === 'av-btn-load-url') {
          var url = self.modal.querySelector('#av-input-url').value.trim();
          if (!url) return;
          self.addLog('Loading URL: ' + url);
          return self.loader
            .loadUrl(url)
            .then(function (data) {
              self.loadedImage = data.dataUrl;
              self.fileInfo = data;
              self.addLog('Loaded: ' + data.width + 'x' + data.height);
              self.render();
            })
            .catch(function (err) {
              self.addLog('Error: ' + err);
            });
        }

        // Crop Actions
        if (t.closest('#av-crop-lock-btn')) {
          if (self.cropManager) {
            self.cropManager.toggleProportional();
            self.updateIconsUI();
            if (self.cropManager.isProportional())
              self.modal.querySelector('#av-crop-width').dispatchEvent(new Event('input'));
          }
          return;
        }

        if (t.id === 'av-btn-crop-size') {
          if (!self.cropManager) return;
          var w = parseInt(self.modal.querySelector('#av-crop-width').value);
          var h = parseInt(self.modal.querySelector('#av-crop-height').value);
          if (w > 0 && h > 0) {
            self.cropManager.active = true;
            self.cropManager.setTargetSize(w, h);
            self.addLog('Crop frame: ' + w + 'x' + h);
          }
          return;
        }

        if (t.id === 'av-btn-crop-apply') {
          if (!self.cropManager) return;
          var res = self.cropManager.getCroppedImage();
          self.loadedImage = res.dataUrl;
          self.processedFileInfo = {
            width: res.width,
            height: res.height,
            size: ((res.dataUrl.length * 0.75) / 1024).toFixed(1) + ' KB',
          };
          self.render();
          return;
        }

        // Resize Actions
        if (t.closest('#av-resize-lock-btn')) {
          self.resizeProportional = !self.resizeProportional;
          self.updateIconsUI();
          if (self.resizeProportional)
            self.modal.querySelector('#av-resize-width').dispatchEvent(new Event('input'));
          return;
        }

        if (t.id === 'av-btn-resize-image') {
          var nw = parseInt(self.modal.querySelector('#av-resize-width').value);
          var nh = parseInt(self.modal.querySelector('#av-resize-height').value);
          if (nw > 0 && nh > 0) {
            self.imageTools.resize(self.loadedImage, nw, nh).then(function (dataUrl) {
              self.loadedImage = dataUrl;
              self.fileInfo.width = nw;
              self.fileInfo.height = nh;
              self.addLog('Resized to: ' + nw + 'x' + nh);
              if (self.cropManager) {
                self.cropManager.destroy();
                self.cropManager = null;
              }
              self.render();
            });
          }
          return;
        }

        // Presets
        var card = t.closest('.av-preset-card');
        if (card) {
          var p = self.presetManager.presets[card.getAttribute('data-preset-idx')];
          if (p) {
            self.modal.querySelector('#av-crop-width').value = p.width;
            self.modal.querySelector('#av-crop-height').value = p.height;
            self.modal.querySelector('#av-btn-crop-size').click();
          }
          return;
        }
      };

      // --- 3. INPUT DELEGATION (Proportionality) ---
      this.modal.oninput = function (e) {
        var id = e.target.id;
        var val = parseInt(e.target.value);
        if (isNaN(val) || val < 1) return;

        if (id === 'av-crop-width' || id === 'av-crop-height') {
          if (!self.cropManager || !self.cropManager.isProportional()) return;
          var other = self.modal.querySelector(
            id === 'av-crop-width' ? '#av-crop-height' : '#av-crop-width',
          );
          if (id === 'av-crop-width') other.value = Math.round(val / self.cropManager.aspectRatio);
          else other.value = Math.round(val * self.cropManager.aspectRatio);
        }

        if (id === 'av-resize-width' || id === 'av-resize-height') {
          if (!self.resizeProportional) return;
          var ratio = self.fileInfo.width / self.fileInfo.height;
          var other = self.modal.querySelector(
            id === 'av-resize-width' ? '#av-resize-height' : '#av-resize-width',
          );
          if (id === 'av-resize-width') other.value = Math.round(val / ratio);
          else other.value = Math.round(val * ratio);
        }
      };

      // --- 4. FILE INPUT ---
      var fin = this.modal.querySelector('#av-input-file');
      if (fin)
        fin.onchange = function (e) {
          if (e.target.files[0]) self.processFile(e.target.files[0], 'File');
        };

      // --- 5. DRAG & DROP ---
      var zone = this.modal.querySelector('.av-canvas-zone');
      if (zone && self.currentSection === 'upload' && self.uploadMode === 'drop') {
        zone.ondragover = function (e) {
          e.preventDefault();
          zone.style.outline = '4px dashed #3b82f6';
        };
        zone.ondragleave = function () {
          zone.style.outline = 'none';
        };
        zone.ondrop = function (e) {
          e.preventDefault();
          zone.style.outline = 'none';
          if (e.dataTransfer.files[0]) self.processFile(e.dataTransfer.files[0], 'Drop');
        };
      }

      // --- 6. POSITION & RESIZE ---
      header.onmousedown = function (e) {
        if (e.target !== header && e.target.className !== 'av-modal-title') return;
        self.isDragging = true;
        self.offsetX = e.clientX - self.x;
        self.offsetY = e.clientY - self.y;
      };

      var resizer = this.modal.querySelector('.av-modal-resizer');
      if (resizer)
        resizer.onmousedown = function (e) {
          self.isResizing = true;
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
          if (self.currentSection === 'edit' && self.editTool === 'crop') self.updateCropOverlay();
        }
      };

      window.onmouseup = function () {
        self.isDragging = self.isResizing = false;
      };
    };

    AvModal.prototype.processFile = function (file, source) {
      var self = this;
      this.addLog('Loading ' + source + ': ' + file.name);
      this.loader
        .loadFile(file)
        .then(function (data) {
          self.loadedImage = data.dataUrl;
          self.fileInfo = data;
          self.addLog('Loaded: ' + data.width + 'x' + data.height);
          self.render();
        })
        .catch(function (err) {
          self.addLog('Error: ' + err);
        });
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
