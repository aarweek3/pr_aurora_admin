import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { filter } from 'rxjs/operators';
import { EventBusService } from '../../../../core/services/event-bus/event-bus.service';
import { LoggerConsoleService } from '../../../logger-console/services/logger-console.service';
import { DEFAULT_SIDEBAR_CONFIG } from './sidebar-default.config';
import { MenuGroup, MenuItem, SidebarConfig, SidebarState, SubMenuItem } from './sidebar.model';

/**
 * Left Sidebar Component
 *
 * Навигационная панель с поддержкой:
 * - State Machine логики переходов
 * - Иерархических меню с подменю
 * - BEM классов для стилизации
 * - Event Bus интеграции
 * - Конфигурации через input
 *
 * Согласно архитектуре SOW ЧАСТЬ 4.2
 */
@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, NzIconModule, NzBadgeModule, NzToolTipModule],
  template: `
    <aside
      class="left-sidebar"
      [class.is-collapsed]="state() === 'collapsed'"
      [class.is-expanded]="state() === 'expanded'"
      [class.is-resizing]="isResizing()"
      [style.width]="sidebarWidth()"
    >
      <!-- Toggle Button -->
      <div class="sidebar-toggle" (click)="toggleSidebar()">
        <span nz-icon [nzType]="state() === 'collapsed' ? 'menu-unfold' : 'menu-fold'"></span>
      </div>

      <!-- Resize Handle -->
      @if (state() === 'expanded') {
        <div class="sidebar-resizer" (mousedown)="startResizing($event)"></div>
      }

      <!-- Close Submenu Button -->
      @if (showCloseSubmenuButton()) {
        <button class="sidebar-close-submenu" (click)="closeSubmenu()">
          <span nz-icon nzType="close"></span>
          <span class="sidebar-close-submenu__text">Закрыть подменю</span>
        </button>
        <div class="sidebar-divider"></div>
      }

      <!-- Menu Groups -->
      <nav class="sidebar-nav">
        @for (group of menuGroups(); track group.id) {
          <div class="menu-group" [class.menu-group--highlight]="group.highlight">
            @if (group.title && state() === 'expanded') {
              <div class="menu-group__title" [class.is-active]="isGroupActive(group)">
                {{ group.title }}
              </div>
            }

            <!-- Menu Items -->
            @for (item of group.items; track item.id) {
              @if (item.visible !== false) {
                <div class="menu-item-wrapper">
                  <!-- Menu Item without submenu -->
                  @if (item.type === 'link') {
                    <a
                      [routerLink]="item.route || ''"
                      class="menu-item"
                      [class.is-disabled]="item.disabled"
                      [class.is-active]="isActive(item.id)"
                      nz-tooltip
                      [nzTooltipTitle]="state() === 'collapsed' ? item.label : ''"
                      nzTooltipPlacement="right"
                      (click)="handleMenuClick(item)"
                    >
                      <span class="menu-item__icon" nz-icon [nzType]="item.icon"></span>
                      @if (state() === 'expanded') {
                        <span class="menu-item__label">{{ item.label }}</span>
                        @if (item.badge) {
                          <span
                            class="menu-item__badge"
                            [class]="'menu-item__badge--' + (item.badge.intent || 'default')"
                          >
                            {{ item.badge.value }}
                          </span>
                        }
                      }
                    </a>
                  }

                  <!-- Menu Item with submenu -->
                  @if (item.type === 'submenu') {
                    <div
                      class="menu-item"
                      [class.is-disabled]="item.disabled"
                      [class.is-active]="isActive(item.id)"
                      [class.has-submenu-open]="isSubmenuOpen(item.id)"
                      [class]="item.intent ? 'is-intent-' + item.intent : ''"
                      nz-tooltip
                      [nzTooltipTitle]="state() === 'collapsed' ? item.label : ''"
                      nzTooltipPlacement="right"
                      (click)="handleSubmenuToggle(item)"
                    >
                      <span class="menu-item__icon" nz-icon [nzType]="item.icon"></span>
                      @if (state() === 'expanded') {
                        <span class="menu-item__label">{{ item.label }}</span>
                        @if (item.badge) {
                          <span
                            class="menu-item__badge"
                            [class]="'menu-item__badge--' + (item.badge.intent || 'default')"
                          >
                            {{ item.badge.value }}
                          </span>
                        }
                        <span
                          class="menu-item__arrow"
                          nz-icon
                          [nzType]="isSubmenuOpen(item.id) ? 'down' : 'right'"
                        ></span>
                      }
                    </div>

                    <!-- Submenu Items -->
                    @if (isSubmenuOpen(item.id) && state() === 'expanded' && item.submenu) {
                      <div class="submenu">
                        @for (subItem of item.submenu; track subItem.id) {
                          @if (subItem.visible !== false) {
                            @if (subItem.type === 'submenu') {
                              <!-- Second Level Submenu Toggle -->
                              <div
                                class="submenu-item submenu-item--toggle"
                                [class.is-active]="isSubSubmenuOpen(subItem.id)"
                                [class]="subItem.intent ? 'is-intent-' + subItem.intent : ''"
                                (click)="handleSubSubmenuToggle(subItem)"
                              >
                                @if (subItem.icon) {
                                  <span
                                    class="submenu-item__icon"
                                    nz-icon
                                    [nzType]="subItem.icon"
                                  ></span>
                                }
                                <span class="submenu-item__label">{{ subItem.label }}</span>
                                <span
                                  class="submenu-item__arrow"
                                  nz-icon
                                  [nzType]="isSubSubmenuOpen(subItem.id) ? 'down' : 'right'"
                                ></span>
                              </div>

                              <!-- Second Level Items -->
                              @if (isSubSubmenuOpen(subItem.id) && subItem.submenu) {
                                <div class="sub-submenu">
                                  @for (nestedItem of subItem.submenu; track nestedItem.id) {
                                    @if (nestedItem.visible !== false) {
                                      <a
                                        [routerLink]="nestedItem.route || ''"
                                        class="submenu-item submenu-item--level-2"
                                        [class.is-active]="isSubSubActive(nestedItem.id)"
                                        [class.is-disabled]="nestedItem.disabled"
                                        (click)="handleSubmenuItemClick(item, nestedItem)"
                                      >
                                        @if (nestedItem.icon) {
                                          <span
                                            class="submenu-item__icon"
                                            nz-icon
                                            [nzType]="nestedItem.icon"
                                          ></span>
                                        }
                                        <span class="submenu-item__label">{{
                                          nestedItem.label
                                        }}</span>
                                      </a>
                                    }
                                  }
                                </div>
                              }
                            } @else {
                              <!-- Regular Submenu Item (Link) -->
                              <a
                                [routerLink]="subItem.route || ''"
                                class="submenu-item"
                                [class.is-active]="isSubActive(subItem.id)"
                                [class.is-disabled]="subItem.disabled"
                                [class]="subItem.intent ? 'is-intent-' + subItem.intent : ''"
                                (click)="handleSubmenuItemClick(item, subItem)"
                              >
                                @if (subItem.icon) {
                                  <span
                                    class="submenu-item__icon"
                                    nz-icon
                                    [nzType]="subItem.icon"
                                  ></span>
                                }
                                <span class="submenu-item__label">{{ subItem.label }}</span>
                                @if (subItem.badge) {
                                  <span
                                    class="submenu-item__badge"
                                    [class]="
                                      'submenu-item__badge--' + (subItem.badge.intent || 'default')
                                    "
                                  >
                                    {{ subItem.badge.value }}
                                  </span>
                                }
                              </a>
                            }
                          }
                        }
                      </div>
                    }
                  }
                </div>
              }
            }
          </div>
        }
      </nav>
    </aside>
  `,
  styles: [
    `
      .left-sidebar {
        &.is-resizing {
          transition: none !important;
          user-select: none;
        }
      }

      .sidebar-resizer {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 6px;
        cursor: col-resize;
        z-index: 100;
        transition: background 0.3s;

        &:hover {
          background: rgba(24, 144, 255, 0.3);
        }

        .is-resizing & {
          background: #1890ff;
          width: 2px;
        }
      }
    `,
  ],
  styleUrls: ['./left-sidebar.component.scss'],
})
export class LeftSidebarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly eventBus = inject(EventBusService);
  private readonly logger = inject(LoggerConsoleService).getLogger(this);

  // Input конфигурация
  config = input<SidebarConfig>(DEFAULT_SIDEBAR_CONFIG);

  // Внутреннее состояние (signals)
  state = signal<SidebarState>('expanded');
  openSubmenuId = signal<string | undefined>(undefined);
  openSubSubmenuId = signal<string | undefined>(undefined);
  activeMenuId = signal<string | undefined>(undefined);
  activeSubMenuId = signal<string | undefined>(undefined);
  activeSubSubMenuId = signal<string | undefined>(undefined);

  // Resize state
  currentWidth = signal<number>(256);
  isResizing = signal<boolean>(false);
  private readonly minSidebarWidth = 200;
  private readonly maxSidebarWidth = 600;

  // Computed
  sidebarWidth = computed(() => {
    if (this.state() === 'collapsed') return '80px';
    return `${this.currentWidth()}px`;
  });
  menuGroups = computed(() => {
    const groups = this.config()?.menuGroups || [];
    console.log('[LeftSidebar] menuGroups computed:', groups.length, 'groups');
    return groups;
  });

  showCloseSubmenuButton = computed(() => {
    return this.state() === 'expanded' && this.openSubmenuId() !== undefined;
  });

  ngOnInit(): void {
    console.log('[LeftSidebar] ngOnInit called');

    // Инициализация состояния из конфига
    const cfg = this.config();
    console.log('[LeftSidebar] config:', cfg);
    console.log('[LeftSidebar] menuGroups:', this.menuGroups());

    if (cfg) {
      this.state.set(cfg.state);
      this.openSubmenuId.set(cfg.openSubmenuId);
      this.activeMenuId.set(cfg.activeMenuId);
      console.log('[LeftSidebar] State initialized:', {
        state: cfg.state,
        menuGroupsCount: cfg.menuGroups?.length,
      });
    } else {
      console.warn('[LeftSidebar] Config is undefined!');
    }

    // Подписка на изменения роута для автоматического определения активного меню
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateActiveMenu();
    });

    // Установка активного меню при загрузке
    this.updateActiveMenu();
  }

  /**
   * STATE MACHINE: COLLAPSED ↔ EXPANDED
   */
  toggleSidebar(): void {
    const newState: SidebarState = this.state() === 'collapsed' ? 'expanded' : 'collapsed';
    this.state.set(newState);

    // При сворачивании закрываем подменю
    if (newState === 'collapsed') {
      this.openSubmenuId.set(undefined);
      this.openSubSubmenuId.set(undefined);
    }

    // Event Bus: sidebarToggled
    this.eventBus.publish({
      type: 'sidebarToggled',
      payload: { state: newState },
    });
  }

  /**
   * Resizing logic
   */
  startResizing(event: MouseEvent): void {
    if (this.state() === 'collapsed') return;

    event.preventDefault();
    event.stopPropagation();
    this.isResizing.set(true);

    const startX = event.clientX;
    const startWidth = this.currentWidth();

    const mouseMoveHandler = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.min(
        this.maxSidebarWidth,
        Math.max(this.minSidebarWidth, startWidth + deltaX),
      );
      this.currentWidth.set(newWidth);

      // Publish width change if needed
      this.eventBus.publish({
        type: 'sidebarResized',
        payload: { width: newWidth },
      });
    };

    const mouseUpHandler = () => {
      this.isResizing.set(false);
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
    document.body.style.cursor = 'col-resize';
  }

  /**
   * STATE MACHINE: Клик по пункту БЕЗ подменю
   */
  handleMenuClick(item: MenuItem): void {
    if (item.disabled) return;

    // Закрываем текущее подменю
    this.openSubmenuId.set(undefined);
    this.openSubSubmenuId.set(undefined);

    // Устанавливаем активный пункт
    this.activeMenuId.set(item.id);

    // Event Bus: navigationStarted
    this.eventBus.publish({
      type: 'navigationStarted',
      payload: {
        menuId: item.id,
        route: item.route || '',
      },
    });
  }

  /**
   * STATE MACHINE: Клик по пункту С подменю
   */
  handleSubmenuToggle(item: MenuItem): void {
    if (item.disabled) return;

    // Сбрасываем вложенное меню при переключении основного
    this.openSubSubmenuId.set(undefined);

    // Если sidebar свёрнут - раскрываем и сразу открываем подменю
    if (this.state() === 'collapsed') {
      this.state.set('expanded');
      this.openSubmenuId.set(item.id);

      // Event Bus: sidebarToggled
      this.eventBus.publish({
        type: 'sidebarToggled',
        payload: { state: 'expanded' },
      });

      // Event Bus: submenuOpened
      this.eventBus.publish({
        type: 'submenuOpened',
        payload: { menuId: item.id },
      });

      return;
    }

    const currentOpenId = this.openSubmenuId();

    if (currentOpenId === item.id) {
      // Если подменю уже открыто - закрываем
      this.openSubmenuId.set(undefined);

      // Event Bus: submenuClosed
      this.eventBus.publish({
        type: 'submenuClosed',
        payload: { menuId: item.id },
      });
    } else {
      // Закрываем другое подменю и открываем текущее
      this.openSubmenuId.set(item.id);

      // Event Bus: submenuOpened
      this.eventBus.publish({
        type: 'submenuOpened',
        payload: { menuId: item.id },
      });
    }
  }

  /**
   * STATE MACHINE: Клик по пункту ПОДМЕНЮ
   */
  handleSubmenuItemClick(parentItem: MenuItem, subItem: SubMenuItem): void {
    if (subItem.disabled) return;

    // Подменю остаётся открытым!
    // Устанавливаем активный пункт = parent
    this.activeMenuId.set(parentItem.id);

    // Event Bus: navigationStarted
    this.eventBus.publish({
      type: 'navigationStarted',
      payload: {
        menuId: parentItem.id,
        submenuId: subItem.id,
        route: subItem.route || '',
      },
    });
  }

  /**
   * STATE MACHINE: Кнопка "Закрыть подменю"
   */
  closeSubmenu(): void {
    const currentOpenId = this.openSubmenuId();
    this.openSubmenuId.set(undefined);

    // Event Bus: submenuClosed
    if (currentOpenId) {
      this.eventBus.publish({
        type: 'submenuClosed',
        payload: { menuId: currentOpenId },
      });
    }
  }

  /**
   * Проверка активности пункта меню
   */
  /**
   * Проверка активен ли вся группа меню
   */
  isGroupActive(group: MenuGroup): boolean {
    // Приоритет 1: Раскрытое вручную меню в этой группе
    const openId = this.openSubmenuId();
    if (openId && group.items.some((item) => item.id === openId)) {
      return true;
    }

    // Приоритет 2: Если ничего не раскрыто вручную, смотрим на активную страницу
    if (!openId) {
      const activeId = this.activeMenuId();
      if (activeId && group.items.some((item) => item.id === activeId)) {
        return true;
      }
    }

    return false;
  }

  isActive(menuId: string): boolean {
    const openId = this.openSubmenuId();
    if (openId) {
      return openId === menuId;
    }
    return this.activeMenuId() === menuId;
  }

  isSubActive(menuId: string): boolean {
    const openId = this.openSubmenuId();
    // Подсвечиваем подпункт только если его родитель либо открыт, либо нет других открытых меню
    if (openId) {
      // Ищем родителя этого подпункта. Если открыт другой родитель - гасим
      const isActivePage = this.activeSubMenuId() === menuId;
      if (isActivePage) {
        // Проверяем, принадлежит ли этот подпункт раскрытому меню
        const groupHasSubItem = this.menuGroups().some((g) =>
          g.items.some((i) => i.id === openId && i.submenu?.some((s) => s.id === menuId)),
        );
        return groupHasSubItem;
      }
      return false;
    }
    return this.activeSubMenuId() === menuId;
  }

  isSubSubActive(menuId: string): boolean {
    const openId = this.openSubmenuId();
    if (openId) {
      const isActivePage = this.activeSubSubMenuId() === menuId;
      if (isActivePage) {
        // Аналогичная проверка для 3 уровня
        return true; // Для упрощения пока оставим так, обычно 3 уровень глубоко
      }
      return false;
    }
    return this.activeSubSubMenuId() === menuId;
  }

  /**
   * Проверка открытости подменю
   */
  isSubmenuOpen(menuId: string): boolean {
    return this.openSubmenuId() === menuId;
  }

  /**
   * Проверка открытости вложенного подменю
   */
  isSubSubmenuOpen(menuId: string): boolean {
    return this.openSubSubmenuId() === menuId;
  }

  /**
   * Теневое переключение вложенного меню
   */
  handleSubSubmenuToggle(subItem: SubMenuItem): void {
    if (subItem.disabled) return;

    const currentOpenId = this.openSubSubmenuId();
    if (currentOpenId === subItem.id) {
      this.openSubSubmenuId.set(undefined);
    } else {
      this.openSubSubmenuId.set(subItem.id);
    }
  }

  /**
   * Автоматическое определение активного меню по текущему роуту
   */
  private updateActiveMenu(): void {
    const currentUrl = this.router.url;
    this.logger.debug('updateActiveMenu - currentUrl:', currentUrl);
    console.log('[SIDEBAR_DEBUG] Current URL:', currentUrl);

    // Сбрасываем все активные состояния перед началом поиска
    this.activeMenuId.set(undefined);
    this.activeSubMenuId.set(undefined);
    this.activeSubSubMenuId.set(undefined);

    const isMatch = (route: string | undefined, label: string): boolean => {
      if (!route) return false;

      // Нормализация: убираем query, хеши и завершающие/начальные слеши
      const normalize = (path: string) => {
        let p = path.split('?')[0].split('#')[0];
        p = p.replace(/^\/+|\/+$/g, '');
        return p;
      };

      const pureUrl = normalize(currentUrl);
      const pureRoute = normalize(route);

      if (!pureRoute) return pureUrl === '';

      // 1. Точное совпадение
      if (pureUrl === pureRoute) {
        const msg = `Match found [Exact] for "${label}": ${pureUrl} === ${pureRoute}`;
        this.logger.info(msg);
        console.log('[SIDEBAR_DEBUG] ' + msg);
        return true;
      }

      // 2. Частичное совпадение
      if (pureUrl.startsWith(pureRoute + '/')) {
        const msg = `Match found [Prefix] for "${label}": ${pureUrl} starts with ${pureRoute}/`;
        this.logger.info(msg);
        console.log('[SIDEBAR_DEBUG] ' + msg);
        return true;
      }

      return false;
    };

    // Поиск активного пункта в меню
    for (const group of this.menuGroups()) {
      for (const item of group.items) {
        // Проверка обычного пункта (Link)
        if (item.type === 'link' && isMatch(item.route, item.label)) {
          this.activeMenuId.set(item.id);
          this.logger.info('Active TOP-LEVEL item set:', item.id);
          console.log('[SIDEBAR_DEBUG] Active TOP-LEVEL item set:', item.id);
          return;
        }

        // Проверка подменю
        if (item.type === 'submenu' && item.submenu) {
          for (const subItem of item.submenu) {
            // Уровень 1 (Линк внутри подменю)
            if (isMatch(subItem.route, subItem.label)) {
              this.activeMenuId.set(item.id);
              this.activeSubMenuId.set(subItem.id);
              this.logger.info('Active SUB-ITEM set:', { parentId: item.id, subId: subItem.id });
              console.log('[SIDEBAR_DEBUG] Active SUB-ITEM set:', subItem.id, 'parent:', item.id);

              if (this.state() === 'expanded') {
                this.openSubmenuId.set(item.id);
              }
              return;
            }

            // Уровень 2 (Вложенное подменю)
            if (subItem.type === 'submenu' && subItem.submenu) {
              for (const nestedItem of subItem.submenu) {
                if (isMatch(nestedItem.route, nestedItem.label)) {
                  this.activeMenuId.set(item.id);
                  this.activeSubMenuId.set(subItem.id);
                  this.activeSubSubMenuId.set(nestedItem.id);
                  this.logger.info('Active NESTED-ITEM set:', {
                    parentId: item.id,
                    subId: subItem.id,
                    nestedId: nestedItem.id,
                  });
                  console.log(
                    '[SIDEBAR_DEBUG] Active NESTED-ITEM set:',
                    nestedItem.id,
                    'sub:',
                    subItem.id,
                    'parent:',
                    item.id,
                  );

                  if (this.state() === 'expanded') {
                    this.openSubmenuId.set(item.id);
                    this.openSubSubmenuId.set(subItem.id);
                  }
                  return;
                }
              }
            }
          }
        }
      }
    }

    this.logger.debug('No match found for current route in sidebar');
    console.log('[SIDEBAR_DEBUG] No match found');
  }

  /**
   * Получение цвета бейджа
   */
  getBadgeColor(intent?: string): string {
    const colors: Record<string, string> = {
      default: '#d9d9d9',
      info: '#1890ff',
      warning: '#faad14',
      error: '#ff4d4f',
      success: '#52c41a',
    };
    return colors[intent || 'default'];
  }
}
