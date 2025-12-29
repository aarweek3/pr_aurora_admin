import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoggerConsoleService } from '../../services/logger-console.service';

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'system';
  timestamp: Date;
}

@Component({
  selector: 'app-logger-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logger-terminal.component.html',
  styleUrls: ['./logger-terminal.component.scss'],
})
export class LoggerTerminalComponent {
  private loggerService = inject(LoggerConsoleService);

  @ViewChild('terminalBody') private terminalBody!: ElementRef;
  @ViewChild('cmdInput') private cmdInput!: ElementRef;

  currentCommand = signal('');
  lines = signal<TerminalLine[]>([
    { text: 'Aurora System Terminal v1.0', type: 'system', timestamp: new Date() },
    { text: 'Type "help" to see available commands.', type: 'system', timestamp: new Date() },
  ]);

  async runCommand() {
    const cmd = this.currentCommand().trim();
    if (!cmd) return;

    // Add input to display
    this.lines.update((prev) => [
      ...prev,
      { text: `> ${cmd}`, type: 'input', timestamp: new Date() },
    ]);

    // Reset input
    this.currentCommand.set('');

    // Execute
    const response = await this.loggerService.executeCommand(cmd);

    // Add output to display
    this.lines.update((prev) => [
      ...prev,
      {
        text: response,
        type: response.startsWith('Error') ? 'error' : 'output',
        timestamp: new Date(),
      },
    ]);

    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.terminalBody) {
        const el = this.terminalBody.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }

  focusInput() {
    this.cmdInput.nativeElement.focus();
  }
}
