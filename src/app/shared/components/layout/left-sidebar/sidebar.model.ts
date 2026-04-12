/**
 * Sidebar Models
 *
 * Модели для Left Sidebar согласно архитектуре из SOW.
 * Описывают состояния, конфигурацию и поведение навигационной панели.
 */

/**
 * Состояние Sidebar
 */
export type SidebarState = 'collapsed' | 'expanded';

/**
 * Конфигурация Sidebar
 */
export interface SidebarConfig {
  // Текущее состояние
  state: SidebarState;

  // Группы меню
  menuGroups: MenuGroup[];

  // ID открытого подменю (если есть)
  openSubmenuId?: string;

  // ID активного пункта меню
  activeMenuId?: string;
}

/**
 * Группа меню (для визуального разделения)
 */
export interface MenuGroup {
  id: string;
  title?: string; // Заголовок группы (опционально)
  items: MenuItem[];
  highlight?: boolean; // Флаг для выделения группы (например, красным цветом)
}

/**
 * Пункт меню
 */
export interface MenuItem {
  // Уникальный ID
  id: string;

  // Иконка (ng-zorro icon key)
  icon: string;

  // Название
  label: string;

  // Тип пункта
  type: 'link' | 'submenu';

  // Для type='link': маршрут
  route?: string;

  // Для type='submenu': вложенные пункты
  submenu?: SubMenuItem[];

  // Состояния
  disabled?: boolean;
  visible?: boolean;

  // Badge (опционально)
  badge?: MenuBadge;
}

/**
 * Пункт подменю
 */
export interface SubMenuItem {
  id: string;
  label: string;
  type?: 'link' | 'submenu'; // Опциональный тип, по умолчанию 'link'
  route?: string; // Стало опциональным для поддержки вложенных меню
  icon?: string;
  disabled?: boolean;
  visible?: boolean;
  badge?: MenuBadge;
  submenu?: SubMenuItem[]; // Список вложенных пунктов
}

/**
 * Badge для пункта меню
 */
export interface MenuBadge {
  value: number | string;
  intent?: 'default' | 'info' | 'warning' | 'error' | 'success';
}

/**
 * События Sidebar
 */
export interface SidebarEvents {
  onToggle?: (state: SidebarState) => void;
  onMenuClick?: (menuId: string) => void;
  onSubmenuClick?: (menuId: string, submenuId: string) => void;
  onCloseSubmenu?: () => void;
}

/**
 * Тип события навигации для Event Bus
 */
export type SidebarEventType =
  | 'navigationStarted'
  | 'submenuOpened'
  | 'submenuClosed'
  | 'sidebarToggled';
