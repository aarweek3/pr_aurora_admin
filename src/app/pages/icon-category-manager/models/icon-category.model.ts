export interface IconCategory {
  id: number;
  folderName: string;
  displayName: string;
  isSystem: boolean;
  menuIcon?: string;
  createdAt: string;
  updatedAt?: string;
  iconCount: number;
}

export interface IconCategoryCreateDto {
  folderName: string;
  displayName: string;
  menuIcon?: string;
  isSystem: boolean;
}

export interface IconCategoryUpdateDto {
  displayName: string;
  menuIcon?: string;
}
