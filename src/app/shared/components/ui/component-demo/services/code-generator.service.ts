import { Injectable } from '@angular/core';

/**
 * Сервис для генерации кода компонента на основе его props
 */
@Injectable({
  providedIn: 'root',
})
export class CodeGeneratorService {
  /**
   * Генерирует HTML код компонента на основе props
   * @param componentName - Название класса компонента (например, "ButtonComponent")
   * @param props - Объект с props компонента
   * @returns Сгенерированный HTML код
   */
  generate(componentName: string, props: Record<string, any>): string {
    const tagName = this.toKebabCase(componentName);
    const attributes: string[] = [];
    let textContent = '';

    Object.entries(props).forEach(([key, value]) => {
      // Обработка специальных ключей для контента
      if (this.isContentKey(key)) {
        textContent = value;
        return;
      }

      // Генерация атрибутов
      if (typeof value === 'boolean') {
        if (value) {
          attributes.push(`[${key}]="true"`);
        }
      } else if (typeof value === 'string') {
        attributes.push(`${key}="${value}"`);
      } else if (typeof value === 'number') {
        attributes.push(`[${key}]="${value}"`);
      } else if (value !== null && value !== undefined) {
        // Для объектов и массивов
        attributes.push(`[${key}]='${JSON.stringify(value)}'`);
      }
    });

    // Форматирование кода
    const attrsString = attributes.length > 0 ? ' ' + attributes.join('\n  ') : '';

    if (textContent) {
      return `<${tagName}${attrsString}>\n  ${textContent}\n</${tagName}>`;
    } else {
      return `<${tagName}${attrsString} />`;
    }
  }

  /**
   * Проверяет, является ли ключ ключом для текстового контента
   */
  private isContentKey(key: string): boolean {
    const contentKeys = ['text', 'label', 'content', 'title', 'placeholder'];
    return contentKeys.includes(key.toLowerCase());
  }

  /**
   * Преобразует название класса в kebab-case для тега
   * Например: "ButtonComponent" -> "av-button"
   */
  private toKebabCase(str: string): string {
    return (
      'av-' +
      str
        .replace(/Component$/, '') // Удаляем "Component"
        .replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase -> kebab-case
        .toLowerCase()
    );
  }

  /**
   * Генерирует TypeScript код для использования в коде
   */
  generateTypeScript(componentName: string, props: Record<string, any>): string {
    const lines: string[] = [];
    lines.push(`// Пример использования в TypeScript`);
    lines.push(`import { ${componentName} } from '...';`);
    lines.push('');
    lines.push(`// В компоненте:`);
    lines.push(`readonly props = {`);

    Object.entries(props).forEach(([key, value]) => {
      if (typeof value === 'string') {
        lines.push(`  ${key}: '${value}',`);
      } else {
        lines.push(`  ${key}: ${JSON.stringify(value)},`);
      }
    });

    lines.push(`};`);
    return lines.join('\n');
  }
}
