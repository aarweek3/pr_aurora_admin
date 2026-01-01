/**
 * CropPresetsComponent - UI для управления пресетами обрезки
 * Aurora Editor
 */

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CropPreset } from '../../services/crop.types';
import { CropPresetsService } from '../../services/crop-presets.service';

@Component({
  selector: 'app-crop-presets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crop-presets.component.html',
  styleUrls: ['./crop-presets.component.scss'],
})
export class CropPresetsComponent implements OnInit {
  @Input() selectedPreset: CropPreset | null = null;
  @Output() selectedPresetChange = new EventEmitter<CropPreset | null>();
  @Output() presetSelected = new EventEmitter<CropPreset>();

  customPresets: CropPreset[] = [];
  socialPresets: CropPreset[] = [];

  showCreatePreset = false;
  newPreset = {
    name: '',
    width: 1080,
    height: 1080,
    icon: '📐',
  };

  constructor(private presetsService: CropPresetsService) {}

  ngOnInit(): void {
    this.loadPresets();
  }

  /**
   * Загрузить пресеты
   */
  loadPresets(): void {
    this.customPresets = this.presetsService.getCustomPresets();
    this.socialPresets = this.presetsService.getSocialPresets();
  }

  /**
   * Выбрать пресет
   */
  selectPreset(preset: CropPreset): void {
    this.selectedPreset = preset;
    this.selectedPresetChange.emit(preset);
    this.presetSelected.emit(preset);
  }

  /**
   * Переключить форму создания
   */
  toggleCreatePreset(): void {
    this.showCreatePreset = !this.showCreatePreset;

    if (!this.showCreatePreset) {
      // Сбросить форму
      this.newPreset = {
        name: '',
        width: 1080,
        height: 1080,
        icon: '📐',
      };
    }
  }

  /**
   * Сохранить новый пресет
   */
  saveCustomPreset(): void {
    if (!this.isPresetValid()) return;

    const saved = this.presetsService.addPreset(this.newPreset);
    this.loadPresets();
    this.toggleCreatePreset();

    // Автоматически выбрать созданный пресет
    this.selectPreset(saved);
  }

  /**
   * Удалить пресет
   */
  deletePreset(preset: CropPreset, event: Event): void {
    event.stopPropagation();

    if (!preset.isCustom) return;

    const success = this.presetsService.deletePreset(preset.id);
    if (success) {
      this.loadPresets();

      // Если удаленный пресет был выбран, сбросить выбор
      if (this.selectedPreset?.id === preset.id) {
        this.selectedPreset = null;
        this.selectedPresetChange.emit(null);
      }
    }
  }

  /**
   * Export пресетов
   */
  exportPresets(): void {
    this.presetsService.exportToJSON();
  }

  /**
   * Import пресетов
   */
  importPresets(): void {
    this.presetsService.importFromJSON();

    // Подождать немного и обновить список
    setTimeout(() => {
      this.loadPresets();
    }, 100);
  }

  /**
   * Проверка валидности нового пресета
   */
  isPresetValid(): boolean {
    return (
      this.newPreset.name.trim().length > 0 &&
      this.newPreset.width > 0 &&
      this.newPreset.height > 0
    );
  }
}
