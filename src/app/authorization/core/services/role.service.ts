// src/app/auth/services/role.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiEndpoints } from '@environments/api-endpoints';
import { Observable } from 'rxjs';
import {
  AssignRolesDto,
  CreateRoleDto,
  RoleDto,
  UpdateRoleDto,
  UserWithRolesDto,
} from '../models/role.models';
//import { RoleDto, CreateRoleDto, UpdateRoleDto, AssignRolesDto, UserWithRolesDto } from '@auth/models/role.models';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private http = inject(HttpClient);

  getAllRoles(): Observable<{ success: boolean; data: RoleDto[] }> {
    return this.http.get<{ success: boolean; data: RoleDto[] }>(ApiEndpoints.ROLES.BASE);
  }

  getRoleById(roleId: string): Observable<{ success: boolean; data: RoleDto }> {
    return this.http.get<{ success: boolean; data: RoleDto }>(ApiEndpoints.ROLES.BY_ID(roleId));
  }

  createRole(dto: CreateRoleDto): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(ApiEndpoints.ROLES.CREATE, dto);
  }

  updateRole(
    roleId: string,
    dto: UpdateRoleDto,
  ): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      ApiEndpoints.ROLES.UPDATE(roleId),
      dto,
    );
  }

  deleteRole(roleId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      ApiEndpoints.ROLES.DELETE(roleId),
    );
  }

  getUserRoles(userId: string): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(
      ApiEndpoints.ROLES.USER_ROLES(userId),
    );
  }

  assignRoles(dto: AssignRolesDto): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(ApiEndpoints.ROLES.ASSIGN, dto);
  }

  getUsersInRole(roleName: string): Observable<{ success: boolean; data: UserWithRolesDto[] }> {
    return this.http.get<{ success: boolean; data: UserWithRolesDto[] }>(
      ApiEndpoints.ROLES.USERS_IN_ROLE(roleName),
    );
  }
}
