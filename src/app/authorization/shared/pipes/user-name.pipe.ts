import { Pipe, PipeTransform } from '@angular/core';
import { UserProfileDto } from '@auth/models';

/**
 * User Name Pipe
 *
 * Форматирует отображение имени пользователя из объекта UserProfileDto.
 *
 * @example
 * {{ user | userName }}
 * {{ user | userName:'full' }}
 */
@Pipe({
  name: 'userName',
  standalone: true,
})
export class UserNamePipe implements PipeTransform {
  transform(user: UserProfileDto | null | undefined, type: 'full' | 'short' = 'full'): string {
    if (!user) return '';

    if (type === 'short') {
      // Пытаемся взять первое слово из fullName или email
      const firstName = user.fullName ? user.fullName.split(' ')[0] : '';
      return firstName || user.email;
    }

    return user.fullName || user.email;
  }

}
