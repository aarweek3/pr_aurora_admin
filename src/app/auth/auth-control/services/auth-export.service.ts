import { Injectable } from '@angular/core';
import { ExportData } from '../models/auth-control.models';

@Injectable({
  providedIn: 'root',
})
export class AuthExportService {
  constructor() {}

  exportSession(): void {}
  exportTokens(): void {}
  exportRoles(): void {}
  exportPlaygroundHistory(): void {}

  private downloadJSON(data: ExportData, filename: string): void {
    console.log('Downloading JSON:', filename, data);
  }
}
