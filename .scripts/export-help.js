const fs = require('fs');
const path = require('path');

/**
 * Утилита для экспорта JSON справки в текстовый формат (.txt)
 * Использование: node .scripts/export-help.js [путь_к_файлу.json]
 */

const filePath = process.argv[2];

if (!filePath) {
    console.error('Ошибка: Укажите путь к JSON файлу справки.');
    console.log('Пример: node .scripts/export-help.js src/assets/help-data/my-help.json');
    process.exit(1);
}

const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

if (!fs.existsSync(absolutePath)) {
    console.error(`Ошибка: Файл не найден по пути ${absolutePath}`);
    process.exit(1);
}

try {
    let content = fs.readFileSync(absolutePath, 'utf8');
    // Удаляем BOM если он есть
    content = content.replace(/^\uFEFF/, '');
    const jsonData = JSON.parse(content);
    const result = exportToTxt(jsonData);
    
    const outputDir = path.join(path.dirname(absolutePath), 'txt');
    const outputPath = path.join(outputDir, result.filename);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, result.text, 'utf8');
    
    console.log('==========================================');
    console.log('✅ ЭКСПОРТ ЗАВЕРШЕН УСПЕШНО');
    console.log(`Исходный файл: ${path.basename(absolutePath)}`);
    console.log(`Создан файл:   ${result.filename}`);
    console.log(`Путь:          ${outputPath}`);
    console.log('==========================================');

} catch (e) {
    console.error('Ошибка при обработке файла:', e.message);
    process.exit(1);
}

function exportToTxt(jsonData) {
    const date = new Date();
    const oldId = jsonData.helpId || 'unknown';
    const timestamp = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}`;
    
    let text = `==========================================\n`;
    text += `ДОКУМЕНТАЦИЯ: ${jsonData.title || oldId}\n`;
    text += `ID: ${oldId}\n`;
    text += `Подзаголовок: ${jsonData.subtitle || '-'}\n`;
    text += `Дата экспорта: ${date.toLocaleString('ru-RU')}\n`;
    text += `==========================================\n\n`;

    const processBlocks = (blocks, sectionTitle) => {
      if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return '';
      let section = `>>> ${sectionTitle} <<<\n\n`;
      blocks.forEach((block) => {
        section += `[ ${block.title || 'Без заголовка'} ]\n`;
        section += `------------------------------------------\n`;
        
        // Очистка HTML (соответствует логике HelpManagementComponent)
        const plainContent = (block.content || '')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<\/li>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&mdash;/g, '—')
          .replace(/&ndash;/g, '–')
          .replace(/&laquo;/g, '«')
          .replace(/&raquo;/g, '»')
          .replace(/&gt;/g, '>')
          .replace(/&lt;/g, '<')
          .replace(/&amp;/g, '&');

        section += `${plainContent.trim()}\n\n`;
      });
      return section + `\n`;
    };

    // Маппинг всех возможных секций
    if (jsonData.reference) text += processBlocks(jsonData.reference, 'БАЗОВАЯ СПРАВКА / REFERENCE');
    if (jsonData['blocks-main']) text += processBlocks(jsonData['blocks-main'], 'ОСНОВНЫЕ РАЗДЕЛЫ (MAIN)');
    if (jsonData['blocks-front']) text += processBlocks(jsonData['blocks-front'], 'ФРОНТЕНД (FRONT)');
    if (jsonData['blocks-server']) text += processBlocks(jsonData['blocks-server'], 'СЕРВЕР / БЭКЕНД (SERVER)');
    if (jsonData.blocks) text += processBlocks(jsonData.blocks, 'ДОПОЛНИТЕЛЬНЫЕ БЛОКИ');

    return { 
        text, 
        filename: `${path.basename(absolutePath, '.json')}.txt` 
    };
}
