// src/app/models/common.models.ts

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
}

export interface PagedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PagedRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
  startDate?: string;
  endDate?: string;
}

export enum ActivityAction {
  Login = 'Login',
  Logout = 'Logout',
  Register = 'Register',
  ForgotPassword = 'ForgotPassword',
  ResetPassword = 'ResetPassword',
  ChangePassword = 'ChangePassword',
  UpdateProfile = 'UpdateProfile',
  CreateUser = 'CreateUser',
  UpdateUser = 'UpdateUser',
  BlockUser = 'BlockUser',
  UnblockUser = 'UnblockUser',
  DeleteUser = 'DeleteUser',
  UpdateSettings = 'UpdateSettings',
  ViewLogs = 'ViewLogs',
  ExternalLogin = 'ExternalLogin',
  LinkExternalAccount = 'LinkExternalAccount',
  UnlinkExternalAccount = 'UnlinkExternalAccount',
  ExternalRegister = 'ExternalRegister',
}

export enum DeviceType {
  Unknown = 'Unknown',
  Desktop = 'Desktop',
  Mobile = 'Mobile',
  Tablet = 'Tablet',
}

export enum BulkOperationType {
  Block = 'Block',
  Unblock = 'Unblock',
  Delete = 'Delete',
  ChangeRole = 'ChangeRole',
  ForceLogout = 'ForceLogout',
  ResetPassword = 'ResetPassword',
  ConfirmEmail = 'ConfirmEmail',
}

export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  [ActivityAction.Login]: 'Вход в систему',
  [ActivityAction.Logout]: 'Выход из системы',
  [ActivityAction.Register]: 'Регистрация',
  [ActivityAction.ForgotPassword]: 'Запрос сброса пароля',
  [ActivityAction.ResetPassword]: 'Сброс пароля',
  [ActivityAction.ChangePassword]: 'Смена пароля',
  [ActivityAction.UpdateProfile]: 'Обновление профиля',
  [ActivityAction.CreateUser]: 'Создание пользователя',
  [ActivityAction.UpdateUser]: 'Обновление пользователя',
  [ActivityAction.BlockUser]: 'Блокировка пользователя',
  [ActivityAction.UnblockUser]: 'Разблокировка пользователя',
  [ActivityAction.DeleteUser]: 'Удаление пользователя',
  [ActivityAction.UpdateSettings]: 'Обновление настроек',
  [ActivityAction.ViewLogs]: 'Просмотр логов',
  [ActivityAction.ExternalLogin]: 'Внешний вход',
  [ActivityAction.LinkExternalAccount]: 'Привязка внешнего аккаунта',
  [ActivityAction.UnlinkExternalAccount]: 'Отвязка внешнего аккаунта',
  [ActivityAction.ExternalRegister]: 'Внешняя регистрация',
};
