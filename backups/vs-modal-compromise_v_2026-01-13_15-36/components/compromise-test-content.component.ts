import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { VS_MODAL_DATA } from '../models/vs-modal-data.token';
import { VSModalRef } from '../models/vs-modal-ref.model';

@Component({
  selector: 'app-compromise-test-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-container">
      <div class="test-sidebar">
        <div class="icon active">📁</div>
        <div class="icon">🔍</div>
        <div class="icon">🌿</div>
        <div class="icon">⚙️</div>
      </div>

      <div class="test-main">
        <div class="welcome-screen">
          <h1>VS Modal <span class="highlight">Compromise</span></h1>
          <p class="subtitle">Testing 3-level DI & Reactive Signals</p>

          <div class="data-card">
            <h3>Incoming Data:</h3>
            <pre>{{ data | json }}</pre>
          </div>

          <div class="actions-grid">
            <button (click)="changeStatus()" class="test-btn">Update Status Bar</button>
            <button (click)="changeTitle()" class="test-btn">Update Window Title</button>
            <button (click)="simulateProgress()" class="test-btn primary">
              Simulate Background Work
            </button>
            <button (click)="closeWithResult()" class="test-btn danger">Close with Result</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        color: #cccccc;
      }

      .test-container {
        display: flex;
        height: 100%;
      }

      .test-sidebar {
        width: 48px;
        background: #333333;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 12px;
        gap: 18px;
        border-right: 1px solid #454545;

        .icon {
          font-size: 20px;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.2s;
          &:hover {
            opacity: 1;
          }
          &.active {
            opacity: 1;
          }
        }
      }

      .test-main {
        flex: 1;
        padding: 30px;
        background: #1e1e1e;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .welcome-screen {
        max-width: 500px;
        text-align: center;

        h1 {
          font-size: 28px;
          margin-bottom: 8px;
          .highlight {
            color: #007acc;
          }
        }

        .subtitle {
          color: #858585;
          margin-bottom: 30px;
        }
      }

      .data-card {
        background: #252526;
        border: 1px solid #454545;
        padding: 15px;
        border-radius: 4px;
        margin-bottom: 30px;
        text-align: left;
        pre {
          margin: 0;
          font-size: 12px;
          color: #4ec9b0;
        }
      }

      .actions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .test-btn {
        padding: 10px;
        background: #3c3c3c;
        border: 1px solid #454545;
        color: #cccccc;
        border-radius: 2px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;

        &:hover {
          background: #454545;
        }
        &.primary {
          background: #007acc;
          border-color: #007acc;
          &:hover {
            background: #005a9e;
          }
        }
        &.danger {
          &:hover {
            background: #e81123;
            border-color: #e81123;
            color: white;
          }
        }
      }
    `,
  ],
})
export class CompromiseTestContentComponent implements OnInit {
  constructor(
    @Inject(VS_MODAL_DATA) public data: any,
    @Inject(VSModalRef) private modalRef: VSModalRef,
  ) {}

  ngOnInit() {
    console.log('Test Content Initialized with data:', this.data);
  }

  changeStatus() {
    this.modalRef.updateStatus(`Last updated: ${new Date().toLocaleTimeString()}`);
  }

  changeTitle() {
    const titles = ['Editor Mode', 'Config View', 'VS Compromise', 'Angular Power'];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    this.modalRef.updateTitle(`[Compromise] ${randomTitle}`);
  }

  async simulateProgress() {
    this.modalRef.updateTitle('\u23F3 Working...');
    for (let i = 0; i <= 100; i += 20) {
      this.modalRef.updateStatus(`Processing: ${i}%`);
      await new Promise((r) => setTimeout(r, 400));
    }
    this.modalRef.updateStatus('\u2705 Task Complete');
    this.modalRef.updateTitle('VS Modal Compromise');
  }

  closeWithResult() {
    this.modalRef.close({
      timestamp: Date.now(),
      status: 'Success',
      userAction: 'Manual Close',
    });
  }
}
