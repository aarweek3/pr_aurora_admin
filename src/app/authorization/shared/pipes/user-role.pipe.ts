import { Pipe, PipeTransform } from '@angular/core';

/**
 * User Role Pipe
 *
 * Преобразует системное имя роли в человекочитаемое (на русском).
 */
@Pipe({
  name: 'userRole',
  standalone: true,
})
export class UserRolePipe implements PipeTransform {
  private roleMap: Record<string, string> = {
    Admin: 'Администратор',
    Moderator: 'Модератор',
    User: 'Пользователь',
    Guest: 'Гость',
  };

  transform(role: string | null | undefined): string {
    if (!role) return 'Нет роли';
    return this.roleMap[role] || role;
  }
}
