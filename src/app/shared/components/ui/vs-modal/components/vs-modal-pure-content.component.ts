import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-vs-modal-pure-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vs-pure-body">
      <!-- Activity Bar (Sidebar) -->
      <aside class="vs-pure-sidebar">
        <div class="side-icon side-icon--active">📁</div>
        <div class="side-icon">🔍</div>
        <div class="side-icon">🌿</div>
        <div class="side-icon">🐛</div>
        <div class="side-icon">📦</div>
      </aside>

      <!-- Main Content Editor -->
      <section class="vs-pure-main">
        <div class="code-header">
          <span class="breadcrumb">src > app > components > <b>editor.ts</b></span>
        </div>
        <div class="vs-code-block">
          <span class="keyword">import</span> &#123; Injectable &#125;
          <span class="keyword">from</span>
          <span class="string">'&#64;angular/core'</span>;<br /><br />
          <span class="comment">// This is a pure content component</span><br />
          <span class="comment">// It has no window frame, no header, no footer</span><br />
          <span class="keyword">export class</span>
          <span class="class">VSModalEngine</span> &#123;<br />
          &nbsp;&nbsp;<span class="keyword">readonly</span> status = signal(<span class="string"
            >'Seamless'</span
          >);<br />
          &#125;
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background-color: #1e1e1e;
        color: #cccccc;
        overflow: hidden;
      }

      .vs-pure-body {
        flex: 1;
        display: flex;
        overflow: hidden;
      }

      .vs-pure-sidebar {
        width: 50px;
        background-color: #333333;
        border-right: 1px solid #454545;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 10px;
        gap: 20px;

        .side-icon {
          font-size: 20px;
          color: #969696;
          cursor: pointer;
          &:hover,
          &--active {
            color: #ffffff;
          }
        }
      }

      .vs-pure-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0;
        background-color: #1e1e1e;

        .code-header {
          height: 35px;
          background: #252526;
          display: flex;
          align-items: center;
          padding: 0 15px;
          font-size: 11px;
          color: #858585;
          border-bottom: 1px solid #454545;
          .breadcrumb b {
            color: #cccccc;
            margin-left: 4px;
          }
        }
      }

      .vs-code-block {
        padding: 20px;
        font-family: 'Consolas', monospace;
        font-size: 13px;
        line-height: 1.6;
        .keyword {
          color: #569cd6;
        }
        .string {
          color: #ce9178;
        }
        .comment {
          color: #6a9955;
        }
        .class {
          color: #4ec9b0;
        }
      }
    `,
  ],
})
export class VsModalPureContentComponent {}
