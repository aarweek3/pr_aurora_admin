import { Directive, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';


/**
 * IsLoggedIn Directive
 *
 * Отображает элемент только если пользователь авторизован.
 *
 * @example
 * <div *avIsLoggedIn>Контент только для своих</div>
 */
@Directive({
  selector: '[avIsLoggedIn]',
  standalone: true,
})
export class IsLoggedInDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  private isViewCreated = false;

  constructor() {
    effect(() => {
      const isLoggedIn = this.authService.isLoggedIn();

      if (isLoggedIn && !this.isViewCreated) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isViewCreated = true;
      } else if (!isLoggedIn && this.isViewCreated) {
        this.viewContainer.clear();
        this.isViewCreated = false;
      }
    });
  }
}
