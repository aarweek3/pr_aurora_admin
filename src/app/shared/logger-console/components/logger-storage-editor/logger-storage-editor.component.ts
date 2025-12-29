import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface StorageItem {
  key: string;
  value: string;
  type: 'local' | 'session' | 'cookie';
}

@Component({
  selector: 'app-logger-storage-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logger-storage-editor.component.html',
  styleUrls: ['./logger-storage-editor.component.scss'],
})
export class LoggerStorageEditorComponent implements OnInit {
  activeType = signal<'local' | 'session' | 'cookie'>('local');
  searchQuery = signal('');
  items = signal<StorageItem[]>([]);

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    const type = this.activeType();
    let data: StorageItem[] = [];

    if (type === 'local') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) data.push({ key, value: localStorage.getItem(key) || '', type });
      }
    } else if (type === 'session') {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) data.push({ key, value: sessionStorage.getItem(key) || '', type });
      }
    } else if (type === 'cookie') {
      document.cookie.split(';').forEach((c) => {
        const [key, ...valueParts] = c.trim().split('=');
        if (key) data.push({ key, value: valueParts.join('='), type });
      });
    }

    this.items.set(data.sort((a, b) => a.key.localeCompare(b.key)));
  }

  get filteredItems() {
    const query = this.searchQuery().toLowerCase();
    return this.items().filter(
      (item) => item.key.toLowerCase().includes(query) || item.value.toLowerCase().includes(query),
    );
  }

  setType(type: 'local' | 'session' | 'cookie') {
    this.activeType.set(type);
    this.refresh();
  }

  saveItem(item: StorageItem, newValue: string) {
    if (item.type === 'local') {
      localStorage.setItem(item.key, newValue);
    } else if (item.type === 'session') {
      sessionStorage.setItem(item.key, newValue);
    } else if (item.type === 'cookie') {
      document.cookie = `${item.key}=${newValue}; path=/`;
    }
    this.refresh();
  }

  deleteItem(item: StorageItem) {
    if (confirm(`Delete ${item.key}?`)) {
      if (item.type === 'local') {
        localStorage.removeItem(item.key);
      } else if (item.type === 'session') {
        sessionStorage.removeItem(item.key);
      } else if (item.type === 'cookie') {
        document.cookie = `${item.key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
      this.refresh();
    }
  }

  clearAll() {
    if (confirm(`Clear ALL ${this.activeType()} storage?`)) {
      const type = this.activeType();
      if (type === 'local') localStorage.clear();
      else if (type === 'session') sessionStorage.clear();
      else if (type === 'cookie') {
        document.cookie.split(';').forEach((c) => {
          const key = c.trim().split('=')[0];
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
      }
      this.refresh();
    }
  }
}
