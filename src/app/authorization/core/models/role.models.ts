// src/app/auth/models/role.models.ts
export interface RoleDto {
  id: string;
  name: string;
  description?: string;
  usersCount: number;
  createdAt?: Date;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export interface AssignRolesDto {
  userId: string;
  roleNames: string[];
}

export interface UserWithRolesDto {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
}