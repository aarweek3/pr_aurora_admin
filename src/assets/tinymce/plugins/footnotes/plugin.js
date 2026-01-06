(function () {
  'use strict';

  var tinymce = window.tinymce;

  tinymce.PluginManager.add('footnotes', function (editor) {
    editor.ui.registry.addButton('footnotes', {
      icon: 'notes',
      tooltip: 'Добавить сноску',
      onAction: function () {
        editor.windowManager.open({
          title: 'Текст сноски',
          body: {
            type: 'panel',
            items: [
              {
                type: 'textarea',
                name: 'note',
                label: 'Введите текст сноски',
              },
            ],
          },
          buttons: [
            {
              type: 'cancel',
              text: 'Отмена',
            },
            {
              type: 'submit',
              text: 'Сохранить',
              primary: true,
            },
          ],
          onSubmit: function (api) {
            var data = api.getData();
            if (data.note) {
              insertFootnote(editor, data.note);
            }
            api.close();
          },
        });
      },
    });

    function insertFootnote(editor, noteText) {
      editor.undoManager.transact(function () {
        var content = editor.getContent();
        var footnoteMatch = content.match(/class="mce-footnote-marker"/g);
        var count = footnoteMatch ? footnoteMatch.length + 1 : 1;
        var id = 'footnote_' + count;

        // Insert marker at cursor
        editor.insertContent(
          '<sup class="mce-footnote-marker"><a href="#' +
            id +
            '" data-mce-href="#' +
            id +
            '">[' +
            count +
            ']</a></sup>',
        );

        // Check if footnotes container exists
        var footnotesArea = editor.dom.select('#mce-footnotes-section')[0];
        if (!footnotesArea) {
          editor.dom.add(
            editor.getBody(),
            'div',
            {
              id: 'mce-footnotes-section',
              style:
                'margin-top: 40px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 0.8em;',
            },
            '<h3>Сноски:</h3><ol id="mce-footnotes-list"></ol>',
          );
          footnotesArea = editor.dom.select('#mce-footnotes-list')[0];
        } else {
          footnotesArea = editor.dom.select('#mce-footnotes-list')[0];
        }

        // Add note to list
        editor.dom.add(
          footnotesArea,
          'li',
          { id: id },
          noteText +
            " <a href=\"javascript:void(0);\" onclick=\"this.closest('ol').ownerDocument.defaultView.tinymce.activeEditor.selection.select(this.closest('ol').ownerDocument.getElementById('footnote_marker_" +
            count +
            '\'));" style="text-decoration: none;">&uarr;</a>',
        );

        // Wrap marker with id for return link
        var markers = editor.dom.select('.mce-footnote-marker');
        var currentMarker = markers[markers.length - 1];
        editor.dom.setAttrib(currentMarker, 'id', 'footnote_marker_' + count);
      });
    }

    return {
      getMetadata: function () {
        return {
          name: 'Automatic Footnotes',
          url: 'https://github.com/tinymce',
        };
      },
    };
  });
})();
