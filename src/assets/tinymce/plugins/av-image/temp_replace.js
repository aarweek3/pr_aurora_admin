return (
  '<div class="av-export-overlay">' +
  '<div class="av-export-modal" style="width: 900px; height: auto; max-width: 95vw; max-height: 95vh; display: flex; flex-direction: column;">' +
  // --- DIV 1: HEADER ---
  '<div class="av-export-header">' +
  '<div class="av-export-title">Экспорт изображения</div>' +
  '<div class="av-modal-close" id="av-export-cancel">✕</div>' +
  '</div>' +
  // --- DIV 2: BODY (Split 1/4 & 3/4) ---
  '<div class="av-export-body" style="padding: 24px; overflow-y: auto; flex: 1;">' +
  '<div style="display: flex; gap: 24px; height: 100%;">' +
  // === LEFT COLUMN: PREVIEW (1/4) ===
  '<div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">' +
  '<div class="av-export-preview-box" style="width: 100%; min-height: 200px; height: 100%; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #e2e8f0;">' +
  '<img src="' +
  (exp.finalDataUrl || '') +
  '" style="max-width:100%; max-height:100%; object-fit:contain;">' +
  '</div>' +
  '<div style="text-align: center; margin-top: 10px; font-size: 13px; color: #64748b; font-weight: 500;">' +
  (exp.finalWidth || state.fileInfo.width) +
  ' x ' +
  (exp.finalHeight || state.fileInfo.height) +
  '</div>' +
  '</div>' +
  // === RIGHT COLUMN: SETTINGS (3/4) ===
  '<div style="flex: 3; min-width: 0; display: flex; flex-direction: column; gap: 20px;">' +
  // 1. FILE NAME
  '<div class="av-form-field" style="margin-bottom: 0;">' +
  '<label>Название файла</label>' +
  '<input type="text" id="av-exp-name" value="' +
  exp.fileName +
  '" class="av-input-text" style="width:100%">' +
  '</div>' +
  // 2. FORMAT
  '<div class="av-form-field" style="margin-bottom: 0;">' +
  '<label>Формат файла</label>' +
  '<div style="display:flex; gap:8px;">' +
  formats
    .map(function (f) {
      return (
        '<div class="av-btn-toggle ' +
        (exp.format === f.value ? 'active' : '') +
        '" data-exp-format="' +
        f.value +
        '" style="min-width: 80px; justify-content: center;">' +
        f.label +
        '</div>'
      );
    })
    .join('') +
  '</div>' +
  '</div>' +
  // 3. QUALITY (Only if not PNG)
  (exp.format !== 'image/png'
    ? '<div class="av-form-field" style="margin-bottom: 0;">' +
      '<label>Качество (Compression)</label>' +
      '<div style="display:flex; align-items:center; gap:12px;">' +
      '<input type="range" id="av-exp-quality" min="1" max="100" value="' +
      exp.quality +
      '" style="flex:1">' +
      '<input type="number" id="av-exp-quality-input" min="1" max="100" value="' +
      exp.quality +
      '" style="width:60px; padding:8px; border:1px solid #cbd5e1; border-radius:6px; text-align:center;">' +
      '</div>' +
      '</div>'
    : '') +
  // 4. STATS (Dimensions & Weight)
  '<div style="display: flex; gap: 40px; margin-top: 5px;">' +
  '<div class="av-export-info-item" style="border: none; padding: 0; background: none;">' +
  '<div class="av-export-info-label">ПРИМЕРНЫЕ РАЗМЕРЫ (PX)</div>' +
  '<div class="av-export-info-value" style="font-size: 16px; font-weight: bold; color: #334155;">' +
  (exp.finalWidth || state.fileInfo.width) +
  'x' +
  (exp.finalHeight || state.fileInfo.height) +
  '</div>' +
  '</div>' +
  '<div class="av-export-info-item" style="border: none; padding: 0; background: none;">' +
  '<div class="av-export-info-label">ФИНАЛЬНЫЙ ВЕС</div>' +
  '<div class="av-export-info-value" id="av-exp-size" style="color:#2563eb; font-size: 16px; font-weight: bold;">' +
  exp.estimatedSize +
  '</div>' +
  '</div>' +
  '</div>' +
  // 5. BLOCK: CONTAINER SETTINGS
  '<div class="av-export-container-block" style="padding-top:15px; border-top:1px solid #e2e8f0; margin-top: 5px;">' +
  '<div class="av-form-field" style="margin-bottom:10px;">' +
  '<label class="av-checkbox-label" style="font-weight:600; color:#1e293b; font-size: 13px;">' +
  '<input type="checkbox" id="av-cnt-enabled" ' +
  (exp.containerConfig.enabled ? 'checked' : '') +
  '> Вставить в контейнер' +
  '</label>' +
  '</div>' +
  '<div id="av-cnt-settings" style="display:' +
  (exp.containerConfig.enabled ? 'block' : 'none') +
  '; padding-left:0px;">' +
  // Custom Size Row
  '<div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">' +
  '<label class="av-checkbox-label" style="min-width:100px;">' +
  '<input type="checkbox" id="av-cnt-custom" ' +
  (exp.containerConfig.useCustomSize ? 'checked' : '') +
  '> Свой размер' +
  '</label>' +
  '<div style="display:flex; flex-wrap: wrap; gap:5px; flex:1;">' +
  '<input type="number" id="av-cnt-width" class="av-input-text" placeholder="Ширина" value="' +
  exp.containerConfig.width +
  '" ' +
  (exp.containerConfig.useCustomSize ? '' : 'disabled') +
  ' style="width: 48%; min-width: 80px;">' +
  '<input type="number" id="av-cnt-height" class="av-input-text" placeholder="Высота" value="' +
  exp.containerConfig.height +
  '" ' +
  (exp.containerConfig.useCustomSize ? '' : 'disabled') +
  ' style="width: 48%; min-width: 80px;">' +
  '</div>' +
  '</div>' +
  // Presets Row
  '<div style="margin-bottom:10px;">' +
  '<label style="font-size:11px; color:#64748b; margin-bottom:4px; display:block;">Предустановленные размеры</label>' +
  '<div style="display:flex; gap:8px; flex-wrap: wrap;">' +
  (state.containerPresets && state.containerPresets.length > 0 ? state.containerPresets : [])
    .map(function (p) {
      var w = p.width;
      var h = p.height;
      var isActive =
        !exp.containerConfig.useCustomSize &&
        exp.containerConfig.width === w &&
        exp.containerConfig.height === h;
      var label = p.label || 'ш' + w + '*в' + h;
      return (
        '<div class="av-btn-toggle av-cnt-preset ' +
        (isActive ? 'active' : '') +
        '" data-w="' +
        w +
        '" data-h="' +
        h +
        '" style="padding:4px 8px; font-size:11px;">' +
        label +
        '</div>'
      );
    })
    .join('') +
  '</div>' +
  '</div>' +
  // Alignment Row
  '<div>' +
  '<label style="font-size:11px; color:#64748b; margin-bottom:4px; display:block;">Выравнивание контейнера</label>' +
  '<div style="display:flex; gap:8px;">' +
  [
    { label: 'Лево', value: 'left' },
    { label: 'Центр', value: 'center' },
    { label: 'Право', value: 'right' },
  ]
    .map(function (a) {
      return (
        '<div class="av-btn-toggle av-cnt-align ' +
        (exp.containerConfig.alignment === a.value ? 'active' : '') +
        '" data-align="' +
        a.value +
        '" style="padding:4px 12px; font-size:11px;">' +
        a.label +
        '</div>'
      );
    })
    .join('') +
  '</div>' +
  '</div>' + // end settings
  '</div>' + // end container block (also end of right col elements)
  '</div>' + // END RIGHT COLUMN
  '</div>' + // END SPLIT LAYOUT
  '</div>' + // END DIV 2 (BODY)
  // --- DIV 3: FOOTER ---
  '<div class="av-export-footer" style="padding: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; background: #fff; border-radius: 0 0 8px 8px;">' +
  '<button class="av-btn-secondary" id="av-export-back" style="padding:10px 20px; border:1px solid #cbd5e1; border-radius:6px; background:#fff; cursor:pointer; font-weight:600; color:#475569;">Вернуться к правке</button>' +
  '<button class="av-btn-main" id="av-export-confirm" style="background:#2563eb; color:#fff; padding:10px 30px; border:1px solid #1d4ed8; border-radius:6px; cursor:pointer; font-weight:bold;">Вставить</button>' +
  '</div>' +
  '</div>' + // end modal
  '</div>' // end overlay
);
