import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { IconComponent } from '../icon.component';

export interface IconPreset {
  category: string;
  value: string;
  label: string;
}

export interface IconCategory {
  name: string;
  icons: IconPreset[];
}

@Component({
  selector: 'av-icon-library',
  standalone: true,
  imports: [CommonModule, FormsModule, NzCardModule, NzInputModule, IconComponent],
  templateUrl: './icon-library.component.html',
  styleUrl: './icon-library.component.scss',
})
export class IconLibraryComponent {
  // API
  presets = input.required<IconPreset[]>();
  selectedIconType = input<string>('');
  iconColor = input<string>('#1890ff');
  collapsible = input<boolean>(true);
  defaultCollapsed = input<boolean>(false);
  title = input<string>('📚 Библиотека иконок');

  // События
  iconSelected = output<string>();

  // UI состояние
  isVisible = signal<boolean>(!this.defaultCollapsed());
  searchQuery = signal<string>('');

  // Группированные и отфильтрованные категории
  filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const categories: Record<string, IconPreset[]> = {};

    // Группируем иконки по категориям
    this.presets().forEach((preset) => {
      if (!categories[preset.category]) {
        categories[preset.category] = [];
      }
      categories[preset.category].push(preset);
    });

    // Фильтруем по поисковому запросу
    const result = Object.entries(categories)
      .map(([categoryName, icons]) => ({
        name: categoryName,
        icons: query
          ? icons.filter(
              (icon) =>
                icon.label.toLowerCase().includes(query) ||
                icon.category.toLowerCase().includes(query),
            )
          : icons,
      }))
      .filter((category) => category.icons.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    return result;
  });

  // Методы
  toggleVisibility(): void {
    if (this.collapsible()) {
      this.isVisible.set(!this.isVisible());
    }
  }

  selectIcon(iconType: string): void {
    this.iconSelected.emit(iconType);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  // Проверка выбранной иконки
  isIconSelected(iconType: string): boolean {
    return this.selectedIconType() === iconType;
  }
}
