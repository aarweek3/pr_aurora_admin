// src/app/shared/auth/utils/jwt.utils.ts
export interface JwtPayload {
  sub: string; // user id
  email: string;
  name?: string;
  role?: string;
  roles?: string | string[];
  isAdmin?: string;
  isModerator?: string;
  isUser?: string;
  FirstName?: string;
  LastName?: string;
  Department?: string;
  IsActive?: string;
  exp: number;
  iat: number;
  iss?: string; // issuer
  aud?: string; // audience
  [key: string]: any;
}

export class JwtUtils {
  /**
   * Декодирует JWT токен и возвращает payload
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      if (!token || typeof token !== 'string') {
        return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const paddedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(paddedPayload);
      
      return JSON.parse(decoded) as JwtPayload;
    } catch (error) {
      console.error('JWT Utils: Ошибка декодирования токена:', error);
      return null;
    }
  }

  /**
   * Проверяет, истек ли токен
   */
  static isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    const bufferTime = 30; // 30 секунд буфера
    
    return payload.exp < (now + bufferTime);
  }

  /**
   * Получает роли пользователя из токена
   */
  static getUserRoles(token: string): string[] {
    const payload = this.decodeToken(token);
    if (!payload) {
      return [];
    }

    const roles: string[] = [];

    // 1. Проверяем стандартное поле .NET Identity для ролей
    const rolesClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (rolesClaim) {
      if (Array.isArray(rolesClaim)) {
        roles.push(...rolesClaim.filter(role => typeof role === 'string' && role.trim()));
      } else if (typeof rolesClaim === 'string' && rolesClaim.trim()) {
        roles.push(rolesClaim);
      }
    }

    // 2. Проверяем поле roles (строка через запятую или массив)
    if (payload.roles) {
      if (typeof payload.roles === 'string' && payload.roles.trim()) {
        const rolesArray = payload.roles.split(',')
          .map(role => role.trim())
          .filter(role => role.length > 0);
        roles.push(...rolesArray);
      } else if (Array.isArray(payload.roles)) {
        const validRoles = payload.roles.filter(role => typeof role === 'string' && role.trim());
        roles.push(...validRoles);
      }
    }

    // 3. Проверяем одиночную роль
    if (payload.role && typeof payload.role === 'string' && payload.role.trim()) {
      roles.push(payload.role);
    }

    return Array.from(new Set(roles.filter(role => role && role.trim().length > 0)));
  }

  /**
   * Проверяет, есть ли у пользователя определенная роль
   */
  static hasRole(token: string, role: string): boolean {
    if (!token || !role) {
      return false;
    }

    const userRoles = this.getUserRoles(token);
    return userRoles.some(userRole => 
      userRole.toLowerCase() === role.toLowerCase()
    );
  }

  /**
   * Проверяет, является ли пользователь администратором
   */
  static isAdmin(token: string): boolean {
    const payload = this.decodeToken(token);
    if (payload?.isAdmin === 'true') {
      return true;
    }
    return this.hasRole(token, 'Admin');
  }

  /**
   * Получает ID пользователя из токена
   */
  static getUserId(token: string): string | null {
    const payload = this.decodeToken(token);
    return payload?.sub || payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
  }

  /**
   * Получает время истечения токена
   */
  static getTokenExpiration(token: string): Date | null {
    const payload = this.decodeToken(token);
    if (!payload?.exp) {
      return null;
    }
    return new Date(payload.exp * 1000);
  }

  /**
   * Получает оставшееся время жизни токена в секундах
   */
  static getTokenTimeToLive(token: string): number {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) {
      return 0;
    }
    const now = new Date();
    const ttl = Math.floor((expiration.getTime() - now.getTime()) / 1000);
    return Math.max(0, ttl);
  }
}
