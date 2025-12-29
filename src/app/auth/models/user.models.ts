// src/app/auth/models/user.models.ts

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  department?: string;
}

// Добавьте поле roles в UserListItemDto:
export interface UserListItemDto {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  isExternalAccount: boolean;
  externalProvider?: string;
  roles?: string[];
}

export interface UserSearchResultDto {
  id: string;
  fullName: string;
  email: string;
  department?: string;
  avatar?: string;
  isActive: boolean;
}

export interface UserFilterDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
  isActive?: boolean;
  department?: string;
  isExternalAccount?: boolean;
  externalProvider?: string;
}

export interface UserStatisticsDto {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  externalAccounts: number;
  usersWithTwoFactor: number;
  usersByDepartment: { [key: string]: number };
  registrationTrend: DailyRegistrationDto[];
}

export interface DailyRegistrationDto {
  date: string;
  count: number;
}

// ДОБАВЛЯЕМ НОВЫЕ ИНТЕРФЕЙСЫ:

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  department?: string;
  isActive: boolean;
}

export interface UserDetailDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  department?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  isExternalAccount: boolean;
  externalProvider?: string;
  roles?: string[];
}

// Для универсального модального окна (создание/редактирование/просмотр)
export type UserModalMode = 'create' | 'edit' | 'view';

export interface UserModalData {
  mode: UserModalMode;
  user?: UserDetailDto; // Для edit и view
}
