// sample-control-test.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SampleControlComponent } from '../sample-control/sample-control.component';

interface Sample {
  id: number;
  name: string;
}

@Component({
  selector: 'app-sample-control-test',
  standalone: true,
  imports: [CommonModule, SampleControlComponent],
  template: `
    <div style="padding: 24px;">
      <h1>Тестирование компонента SampleControl</h1>
      <app-sample-control
        (sampleSelected)="onSampleSelected($event)"
      ></app-sample-control>
      <div
        *ngIf="selectedSample"
        style="margin-top: 24px; padding: 16px; border: 1px solid #ddd; border-radius: 8px;"
      >
        <h3>Выберите родителя:</h3>
        <p><strong>ID:</strong> {{ selectedSample.id }}</p>
        <p><strong>Название:</strong> {{ selectedSample.name }}</p>
      </div>
    </div>
  `,
})
export class SampleControlTestComponent {
  selectedSample: Sample | null = null;

  onSampleSelected(sample: Sample): void {
    this.selectedSample = sample;
  }
}
