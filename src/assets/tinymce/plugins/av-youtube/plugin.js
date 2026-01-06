(function () {
  'use strict';

  var tinymce = window.tinymce;

  tinymce.PluginManager.add('av-youtube', function (editor) {
    /**
     * Извлечение ID видео из URL
     */
    function extractVideoId(url) {
      if (!url) return '';
      var patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      ];
      for (var i = 0; i < patterns.length; i++) {
        var match = url.match(patterns[i]);
        if (match && match[1]) return match[1];
      }
      if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
      return '';
    }

    /**
     * Генерация HTML для вставки
     */
    function generateHtml(data) {
      var videoId = extractVideoId(data.url);
      if (!videoId) return '';

      var params = [];
      if (data.autoplay) params.push('autoplay=1');
      if (!data.controls) params.push('controls=0');
      if (data.loop) params.push('loop=1&playlist=' + videoId);
      if (data.mute) params.push('mute=1');
      if (data.startTime) params.push('start=' + data.startTime);

      var queryString = params.length > 0 ? '?' + params.join('&') : '';
      var embedUrl = 'https://www.youtube.com/embed/' + videoId + queryString;

      var html = '';
      var alignmentStyle = '';
      if (data.alignment === 'center') {
        alignmentStyle = 'margin: 10px auto; text-align: center;';
      } else if (data.alignment === 'right') {
        alignmentStyle = 'margin: 10px 0 10px auto; text-align: right;';
      } else {
        alignmentStyle = 'margin: 10px auto 10px 0; text-align: left;';
      }

      var width = data.responsive ? '100%' : data.width + 'px';
      var height = data.responsive ? 'auto' : data.height + 'px';

      var captionAlignStyle = 'text-align: ' + (data.captionAlignment || 'center') + ';';

      if (data.responsive) {
        html =
          '<div class="av-youtube-wrapper" style="' +
          alignmentStyle +
          ' max-width: 100%;">' +
          '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">' +
          '<iframe src="' +
          embedUrl +
          '" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>' +
          '</div>';
      } else {
        html =
          '<div class="av-youtube-wrapper" style="' +
          alignmentStyle +
          '">' +
          '<iframe src="' +
          embedUrl +
          '" width="' +
          data.width +
          '" height="' +
          data.height +
          '" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>';
      }

      if (data.caption) {
        html +=
          '<div style="margin-top: 8px; font-style: italic; color: #666; font-size: 0.9em; ' +
          captionAlignStyle +
          '">' +
          data.caption +
          '</div>';
      }

      html += '</div>';
      return html;
    }

    editor.ui.registry.addButton('av-youtube', {
      icon: 'embed',
      tooltip: 'Вставить YouTube видео',
      onAction: function () {
        editor.windowManager.open({
          title: 'Параметры YouTube видео',
          body: {
            type: 'panel',
            items: [
              { type: 'input', name: 'url', label: 'YouTube URL или ID видео' },
              {
                type: 'grid',
                columns: 2,
                items: [
                  { type: 'checkbox', name: 'responsive', label: 'Адаптивный (100%)' },
                  {
                    type: 'checkbox',
                    name: 'proportional',
                    label: 'Сохранять пропорции (16:9)',
                    enabled: true,
                  },
                ],
              },
              {
                type: 'grid',
                columns: 2,
                items: [
                  { type: 'input', name: 'width', label: 'Ширина (px)', inputMode: 'numeric' },
                  { type: 'input', name: 'height', label: 'Высота (px)', inputMode: 'numeric' },
                ],
              },
              {
                type: 'grid',
                columns: 2,
                items: [
                  { type: 'checkbox', name: 'autoplay', label: 'Автоплей' },
                  { type: 'checkbox', name: 'controls', label: 'Управление', enabled: true },
                  { type: 'checkbox', name: 'loop', label: 'Зациклить' },
                  { type: 'checkbox', name: 'mute', label: 'Без звука' },
                ],
              },
              { type: 'input', name: 'startTime', label: 'Начать с (секунды)' },
              {
                type: 'selectbox',
                name: 'alignment',
                label: 'Выравнивание видео',
                items: [
                  { value: 'left', text: 'По левому краю' },
                  { value: 'center', text: 'По центру' },
                  { value: 'right', text: 'По правому краю' },
                ],
              },
              { type: 'textarea', name: 'caption', label: 'Подпись под видео' },
              {
                type: 'selectbox',
                name: 'captionAlignment',
                label: 'Выравнивание подписи',
                items: [
                  { value: 'left', text: 'Слева' },
                  { value: 'center', text: 'По центру' },
                  { value: 'right', text: 'Справа' },
                ],
              },
            ],
          },
          initialData: {
            url: '',
            responsive: true,
            proportional: true,
            width: '560',
            height: '315',
            autoplay: false,
            controls: true,
            loop: false,
            mute: false,
            startTime: '',
            alignment: 'center',
            caption: '',
            captionAlignment: 'center',
          },
          onChange: function (api, details) {
            var data = api.getData();
            if (data.proportional) {
              if (details.name === 'width' && data.width) {
                var newHeight = Math.round((parseInt(data.width, 10) * 9) / 16);
                api.setData({ height: newHeight.toString() });
              } else if (details.name === 'height' && data.height) {
                var newWidth = Math.round((parseInt(data.height, 10) * 16) / 9);
                api.setData({ width: newWidth.toString() });
              }
            }
          },
          buttons: [
            { type: 'cancel', text: 'Отмена' },
            { type: 'submit', text: 'Вставить', primary: true },
          ],
          onSubmit: function (api) {
            var data = api.getData();
            var html = generateHtml(data);
            if (html) {
              editor.insertContent(html);
              api.close();
            } else {
              editor.windowManager.alert('Пожалуйста, введите корректный YouTube URL.');
            }
          },
        });
      },
    });

    return {
      getMetadata: function () {
        return {
          name: 'AV YouTube Plugin',
          url: 'https://aurora.com',
        };
      },
    };
  });
})();
