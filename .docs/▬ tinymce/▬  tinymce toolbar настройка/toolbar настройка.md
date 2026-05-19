Настройка toolbar-а Tinymce в вашем проекте разделена на две части: основной тулбар редактора и контекстный тулбар (появляющийся при клике на элементы, например, изображения).

1. Основной Toolbar
Главная настройка кнопок редактора (верхняя панель) находится НЕ в папке assets, а в коде компонента Angular:

Файл:
[Открыть](../../../src/app/shared/components/ui/tinymce-editor/tinymce-editor.component.ts)

Строки: 154-158
Код: Свойство toolbar в объекте конфигурации tinymce.init.



2. Контекстный Toolbar (Quickbars)
Контекстный тулбар (панель, которая появляется при выделении текста или клике на изображение) настраивается в свойстве quickbars:

Файл:
src/app/shared/components/ui/tinymce-editor/tinymce-editor.component.ts
Строки: 152-153
Код: Свойство quickbars в объекте конфигурации tinymce.init.



3. Настройка плагинов
Список доступных плагинов и их конфигурация находятся в свойстве plugins и external_plugins:

Файл:
src/app/shared/components/ui/tinymce-editor/tinymce-editor.component.ts
Строки: 144-151
Код: Свойства plugins и external_plugins в объекте конфигурации tinymce.init.



4. Кнопка Aurora Image Studio
Кнопка "Aurora Studio" добавляется через external_plugins и настраивается в свойстве toolbar. Она использует кастомный плагин, который открывает модальное окно Image Studio.

Файл:
src/app/shared/components/ui/tinymce-editor/tinymce-editor.component.ts
Строки: 154-158
Код: Свойство toolbar в объекте конфигурации tinymce.init.



5. Файлы плагинов
Кастомные плагины и их иконки находятся в папке:

assets/tinymce/plugins/



6. Иконки
  Иконки для кнопок находятся в:

        assets/tinymce/plugins/<plugin-name>/icons/<plugin-name>.svg



7. Краткая инструкция по изменению
Чтобы изменить toolbar, выполните следующие шаги:

Откройте файл:
src/app/shared/components/ui/tinymce-editor/tinymce-editor.component.ts
Найдите свойство toolbar и измените список кнопок в соответствии с документацией TinyMCE.
Если нужно добавить кастомную кнопку, сначала создайте плагин в
assets/tinymce/plugins/, затем добавьте его в external_plugins и в toolbar.
Для изменения контекстного тулбара отредактируйте свойство quickbars.



8. Дополнительные ресурсы
Официальная документация TinyMCE по настройке toolbar:

https://www.tiny.cloud/docs/tinymce/latest/toolbar-configuration/

Официальная документация TinyMCE по плагинам:

https://www.tiny.cloud/docs/tinymce/latest/plugins/



