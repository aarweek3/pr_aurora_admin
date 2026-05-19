Мы будем использовать функциональные гарды (Functional Guards) — это современный стандарт в Angular (начиная с версии 16+), который заменяет старые классовые гарды.

Вот план реализации, соответствующий вашей структуре ("Phase 6" в
app.routes.ts
):

1. Стратегия защиты
   Мы создадим один основной гард (или два, если нужно разделение прав), который будет работать как "фейсконтроль" перед доступом к защищенным маршрутам.

authGuard: Проверяет, авторизован ли пользователь (есть ли валидный токен/сессия).
Логика:
Если
isLoggedIn() === true
→ Пропускаем (return true).
Если
isLoggedIn() === false
→ Блокируем и перенаправляем на страницу входа (/auth/login), сохраняя URL, куда пользователь хотел попасть (чтобы вернуть его туда после логина). 2. Структура файла
Мы создадим файл src/app/core/guards/auth.guard.ts. В данный момент папки core/guards у вас, скорее всего, нет, поэтому мы её создадим.

Пример будущего кода (auth.guard.ts):

typescript
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
export const authGuard: CanActivateFn = (route, state) => {
const authService = inject(AuthService);
const router = inject(Router);
// 1. Проверяем авторизацию через ваш AuthService
if (authService.isLoggedIn()) {
return true;
}
// 2. Если не авторизован — редирект на логин с сохранением returnUrl
return router.createUrlTree(['/auth/login'], {
queryParams: { returnUrl: state.url }
});
}; 3. Интеграция в роутинг
После создания файла мы раскомментируем и обновим
app.routes.ts
:

typescript
// Было:
// canActivate: [], // TODO: Add [authGuard] in Phase 6
// Станет:
canActivate: [authGuard], 4. Дополнительная защита (Роли)
Для раздела /admin мы можем доработать этот гард или создать отдельный adminGuard, который будет проверять не только факт входа, но и наличие роли
Admin
(используя метод authService.isAdminUser()).

Готовы приступить к созданию src/app/core/guards/auth.guard.ts сейчас?
