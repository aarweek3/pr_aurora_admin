import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { AvTinymceControlComponent } from '../../../../assets/controls/tinymce-control/tinymce-control.component';
import { IconLaboratoryService } from '@shared/services/icon-laboratory.service';

@Component({
  selector: 'app-help-tiny-mce',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzPageHeaderModule,
    NzCardModule,
    NzButtonModule,
    AvTinymceControlComponent
  ],
  template: `
    <div style="padding: 24px;">
      <nz-page-header
        nzTitle="Подключение Tiny"
        nzSubtitle="Прямое редактирование файла боковое меню.md"
      >
        <nz-page-header-extra>
          <button nz-button nzType="primary" (click)="save()" [nzLoading]="saving()">
            Сохранить изменения
          </button>
        </nz-page-header-extra>
      </nz-page-header>

      <nz-card>
        <av-tinymce-control
          [(ngModel)]="content"
          [height]="700"
          label="Контент файла (сохраняется в src/documentation/боковое меню.md)"
        >
        </av-tinymce-control>
      </nz-card>
      
      <div style="margin-top: 20px; padding: 15px; border: 1px solid #ddd; background: #fff;">
         <h4>Raw Data Check (Отладка):</h4>
         <pre style="max-height: 200px; overflow: auto;">{{ content() }}</pre>
      </div>
    </div>
  `,
})
export class HelpTinyMceComponent implements OnInit {
  private http = inject(HttpClient);
  private iconLabService = inject(IconLaboratoryService);
  private message = inject(NzMessageService);

  content = signal<string>('');
  saving = signal<boolean>(false);

  ngOnInit() {
    this.load();
  }

  load() {
    const fileName = 'боковое меню.html';
    const url = `/documentation/${fileName}?t=${Date.now()}`;
    
    this.http.get(url, { responseType: 'text' }).subscribe({
      next: (val) => this.content.set(val),
      error: (err) => this.message.error('Ошибка загрузки: ' + err.message)
    });
  }

  save() {
    this.saving.set(true);
    const fileName = 'боковое меню.html';
    const savePath = 'src/documentation/';
    
    this.iconLabService.saveToDisk(fileName, savePath, this.content()).subscribe({
      next: () => {
        this.saving.set(false);
        this.message.success('Файл успешно сохранен!');
      },
      error: (err) => {
        this.saving.set(false);
        this.message.error('Ошибка сохранения: ' + err.message);
      }
    });
  }
}
