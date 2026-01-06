/**
 * AvCropService - Модуль для интерактивной обрезки изображений на холсте.
 * Инкапсулирует логику отрисовки рамки, управления маркерами и пересчета координат.
 */
window.AvCropService = (function () {
  'use strict';

  function AvCropService() {
    this.canvas = null;
    this.ctx = null;
    this.overlay = null;
    this.oCtx = null;
    this.originalImage = null;

    this.cropArea = { x: 0, y: 0, w: 0, h: 0 };
    this.aspectRatio = null; // null, 1, 1.33, 1.77 etc.
    this.showGrid = true;

    // Состояние взаимодействия
    this.isDragging = false;
    this.isResizing = false;
    this.resizeHandle = null; // 'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'
    this.dragStart = { x: 0, y: 0 };

    this.handleSize = 10;
    this.minSize = 30;

    // Привязка методов (для addEventListener)
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  AvCropService.prototype.init = function (mainCanvas, config) {
    this.canvas = mainCanvas;
    this.ctx = mainCanvas.getContext('2d');

    // Создаем или находим overlay холст
    var overlayId = 'av-crop-overlay';
    this.overlay = document.getElementById(overlayId);
    if (!this.overlay) {
      this.overlay = document.createElement('canvas');
      this.overlay.id = overlayId;
      this.overlay.style.position = 'absolute';
      this.overlay.style.top = mainCanvas.offsetTop + 'px';
      this.overlay.style.left = mainCanvas.offsetLeft + 'px';
      this.overlay.style.cursor = 'crosshair';
      this.overlay.style.zIndex = '100';
      mainCanvas.parentElement.appendChild(this.overlay);
    }

    this.oCtx = this.overlay.getContext('2d');
    this.syncSize();

    // Начальная область (80% от центра)
    this.resetCropArea();

    this.overlay.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);

    this.render();
  };

  AvCropService.prototype.destroy = function () {
    if (this.overlay) {
      this.overlay.removeEventListener('mousedown', this.onMouseDown);
      this.overlay.remove();
      this.overlay = null;
    }
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  };

  AvCropService.prototype.syncSize = function () {
    if (!this.canvas || !this.overlay) return;
    this.overlay.width = this.canvas.width;
    this.overlay.height = this.canvas.height;
    this.overlay.style.width = this.canvas.clientWidth + 'px';
    this.overlay.style.height = this.canvas.clientHeight + 'px';
    this.overlay.style.top = this.canvas.offsetTop + 'px';
    this.overlay.style.left = this.canvas.offsetLeft + 'px';
  };

  AvCropService.prototype.resetCropArea = function () {
    var w = this.canvas.width * 0.8;
    var h = this.canvas.height * 0.8;
    if (this.aspectRatio) {
      if (w / h > this.aspectRatio) w = h * this.aspectRatio;
      else h = w / this.aspectRatio;
    }
    this.cropArea = {
      x: (this.canvas.width - w) / 2,
      y: (this.canvas.height - h) / 2,
      w: w,
      h: h,
    };
  };

  AvCropService.prototype.setAspectRatio = function (ratio) {
    this.aspectRatio = ratio;
    this.resetCropArea();
    this.render();
  };

  AvCropService.prototype.onMouseDown = function (e) {
    var pos = this.getMousePos(e);
    var handle = this.getHandleAt(pos.x, pos.y);

    if (handle) {
      this.isResizing = true;
      this.resizeHandle = handle;
    } else if (this.isInside(pos.x, pos.y)) {
      this.isDragging = true;
    }

    this.dragStart = pos;
    e.preventDefault();
  };

  AvCropService.prototype.onMouseMove = function (e) {
    if (!this.isDragging && !this.isResizing) {
      this.updateCursor(e);
      return;
    }

    var pos = this.getMousePos(e);
    var dx = pos.x - this.dragStart.x;
    var dy = pos.y - this.dragStart.y;

    if (this.isDragging) {
      this.cropArea.x += dx;
      this.cropArea.y += dy;
    } else if (this.isResizing) {
      this.doResize(dx, dy);
    }

    this.constrain();
    this.dragStart = pos;
    this.render();
  };

  AvCropService.prototype.onMouseUp = function () {
    this.isDragging = false;
    this.isResizing = false;
    this.resizeHandle = null;
  };

  AvCropService.prototype.doResize = function (dx, dy) {
    var a = this.cropArea;
    var r = this.aspectRatio;

    if (this.resizeHandle === 'se') {
      a.w += dx;
      if (r) a.h = a.w / r;
      else a.h += dy;
    } else if (this.resizeHandle === 'sw') {
      a.x += dx;
      a.w -= dx;
      if (r) a.h = a.w / r;
      else a.h += dy;
    } else if (this.resizeHandle === 'ne') {
      a.y += dy;
      a.h -= dy;
      if (r) a.w = a.h * r;
      else a.w += dx;
    } else if (this.resizeHandle === 'nw') {
      a.x += dx;
      a.w -= dx;
      a.y += dy;
      a.h -= dy;
      if (r) {
        a.h = a.w / r;
      }
    } else if (this.resizeHandle === 'e') {
      a.w += dx;
      if (r) a.h = a.w / r;
    } else if (this.resizeHandle === 'w') {
      a.x += dx;
      a.w -= dx;
      if (r) a.h = a.w / r;
    } else if (this.resizeHandle === 's') {
      a.h += dy;
      if (r) a.w = a.h * r;
    } else if (this.resizeHandle === 'n') {
      a.y += dy;
      a.h -= dy;
      if (r) a.w = a.h * r;
    }
  };

  AvCropService.prototype.constrain = function () {
    var a = this.cropArea;
    if (a.w < this.minSize) a.w = this.minSize;
    if (a.h < this.minSize) a.h = this.minSize;
    if (a.x < 0) a.x = 0;
    if (a.y < 0) a.y = 0;
    if (a.x + a.w > this.canvas.width) a.x = this.canvas.width - a.w;
    if (a.y + a.h > this.canvas.height) a.y = this.canvas.height - a.h;
  };

  AvCropService.prototype.render = function () {
    var ctx = this.oCtx;
    var w = this.overlay.width;
    var h = this.overlay.height;
    var a = this.cropArea;

    ctx.clearRect(0, 0, w, h);

    // Затемнение
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, w, h);

    // Очистка выделенной области
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(a.x, a.y, a.w, a.h);
    ctx.globalCompositeOperation = 'source-over';

    // Рамка
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(a.x, a.y, a.w, a.h);

    // Сетка (3x3)
    if (this.showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Вертикали
      ctx.moveTo(a.x + a.w / 3, a.y);
      ctx.lineTo(a.x + a.w / 3, a.y + a.h);
      ctx.moveTo(a.x + (2 * a.w) / 3, a.y);
      ctx.lineTo(a.x + (2 * a.w) / 3, a.y + a.h);
      // Горизонтали
      ctx.moveTo(a.x, a.y + a.h / 3);
      ctx.lineTo(a.x + a.w, a.y + a.h / 3);
      ctx.moveTo(a.x, a.y + (2 * a.h) / 3);
      ctx.lineTo(a.x + a.w, a.y + (2 * a.h) / 3);
      ctx.stroke();
    }

    // Маркеры (углы)
    ctx.fillStyle = '#007bff';
    var s = this.handleSize;
    ctx.fillRect(a.x - s / 2, a.y - s / 2, s, s); // nw
    ctx.fillRect(a.x + a.w - s / 2, a.y - s / 2, s, s); // ne
    ctx.fillRect(a.x - s / 2, a.y + a.h - s / 2, s, s); // sw
    ctx.fillRect(a.x + a.w - s / 2, a.y + a.h - s / 2, s, s); // se
    // Маркеры (стороны)
    ctx.fillRect(a.x + a.w / 2 - s / 2, a.y - s / 2, s, s); // n
    ctx.fillRect(a.x + a.w / 2 - s / 2, a.y + a.h - s / 2, s, s); // s
    ctx.fillRect(a.x - s / 2, a.y + a.h / 2 - s / 2, s, s); // w
    ctx.fillRect(a.x + a.w - s / 2, a.y + a.h / 2 - s / 2, s, s); // e
  };

  AvCropService.prototype.getMousePos = function (e) {
    var rect = this.overlay.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.overlay.width / rect.width),
      y: (e.clientY - rect.top) * (this.overlay.height / rect.height),
    };
  };

  AvCropService.prototype.getHandleAt = function (x, y) {
    var a = this.cropArea;
    var s = this.handleSize + 10; // область клика чуть больше визуального размера
    if (Math.abs(x - a.x) < s && Math.abs(y - a.y) < s) return 'nw';
    if (Math.abs(x - (a.x + a.w)) < s && Math.abs(y - a.y) < s) return 'ne';
    if (Math.abs(x - a.x) < s && Math.abs(y - (a.y + a.h)) < s) return 'sw';
    if (Math.abs(x - (a.x + a.w)) < s && Math.abs(y - (a.y + a.h)) < s) return 'se';

    if (Math.abs(x - (a.x + a.w / 2)) < s && Math.abs(y - a.y) < s) return 'n';
    if (Math.abs(x - (a.x + a.w / 2)) < s && Math.abs(y - (a.y + a.h)) < s) return 's';
    if (Math.abs(x - a.x) < s && Math.abs(y - (a.y + a.h / 2)) < s) return 'w';
    if (Math.abs(x - (a.x + a.w)) < s && Math.abs(y - (a.y + a.h / 2)) < s) return 'e';

    return null;
  };

  AvCropService.prototype.isInside = function (x, y) {
    var a = this.cropArea;
    return x > a.x && x < a.x + a.w && y > a.y && y < a.y + a.h;
  };

  AvCropService.prototype.updateCursor = function (e) {
    var pos = this.getMousePos(e);
    var handle = this.getHandleAt(pos.x, pos.y);
    if (handle) {
      var cursors = {
        nw: 'nwse-resize',
        se: 'nwse-resize',
        ne: 'nesw-resize',
        sw: 'nesw-resize',
        n: 'ns-resize',
        s: 'ns-resize',
        e: 'ew-resize',
        w: 'ew-resize',
      };
      this.overlay.style.cursor = cursors[handle];
    } else if (this.isInside(pos.x, pos.y)) {
      this.overlay.style.cursor = 'move';
    } else {
      this.overlay.style.cursor = 'crosshair';
    }
  };

  return AvCropService;
})();
