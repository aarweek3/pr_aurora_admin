import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';


/**
 * HasRole Directive
 *
 * Отображает элемент только если пользователь имеет одну из указанных ролей.
 *
 * @example
 * <div *avHasRole="['Admin', 'Moderator']">...</div>
 * <div *avHasRole="'Admin'">...</div>
 */
@Directive({
  selector: '[avHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  private roles: string[] = [];
  private isViewCreated = false;

  @Input('avHasRole') set avHasRole(value: string | string[]) {
    this.roles = Array.isArray(value) ? value : [value];
    this.updateView();
  }

  constructor() {
    // Автоматически обновляем вид при изменении состояния авторизации или ролей
    effect(() => {
      this.updateView();
    });
  }

  private updateView(): void {
    const userRoles = this.authService.getUserRoles();
    const hasAccess = this.roles.some((role) => userRoles.includes(role));

    if (hasAccess && !this.isViewCreated) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isViewCreated = true;
    } else if (!hasAccess && this.isViewCreated) {
      this.viewContainer.clear();
      this.isViewCreated = false;
    }
  }
}
