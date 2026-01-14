import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { VS_MODAL_DATA } from '../models/vs-modal-data.token';
import { VSModalRef } from '../models/vs-modal-ref.model';

interface MenuItem {
  id: string;
  title: string;
  icon: string;
}

@Component({
  selector: 'app-compromise-test-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compromise-test-content.component.html',
  styleUrl: './compromise-test-content.component.scss',
})
export class CompromiseTestContentComponent implements OnInit {
  public readonly data = inject(VS_MODAL_DATA);
  public readonly modalRef = inject(VSModalRef);

  activeTab = signal<string>('item1');
  item1Quality = signal<number>(80);
  transparency = signal<number>(85);
  zoom = signal<number>(100);

  menuItems: MenuItem[] = [
    { id: 'item1', title: 'Пункт 1', icon: '📁' },
    { id: 'item2', title: 'Пункт 2', icon: '🔍' },
    { id: 'item3', title: 'Пункт 3', icon: '🎨' },
    { id: 'item4', title: 'Пункт 4', icon: '📦' },
    { id: 'item5', title: 'Пункт 5', icon: '⚡' },
    { id: 'item6', title: 'UI', icon: '�️' },
    { id: 'item7', title: 'Пункт 7', icon: '⚙️' },
  ];

  getActiveItem() {
    return this.menuItems.find((m) => m.id === this.activeTab());
  }

  ngOnInit() {
    console.log('Test Content Initialized');
  }

  changeStatus() {
    this.modalRef.updateStatus(`Модуль: ${this.getActiveItem()?.title}`);
  }

  closeWithResult() {
    this.modalRef.close({ action: 'close', source: 'universal_base' });
  }
}
