export interface AvIcon {
  name: string; // Имя для отображения и поиска
  type: string; // Имя для передачи в av-icon (полный путь без расширения)
  category: string; // Категория (папка)
  svgContent?: string; // Optional: included when batch loading
}

// Алиас для обратной совместимости
export type IconMetadata = AvIcon;

export interface AvIconCategory {
  category: string;
  icons: AvIcon[];
}
