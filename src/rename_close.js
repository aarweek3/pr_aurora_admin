const fs = require('fs');
const path = require('path');

const dir = 'd:/_PROGECT/pr_aurora_admin/src';

const replacements = [
  { regex: /@Output\(\)\s+close/g, replacement: '@Output() modalClose' },
  { regex: /this\.close\.emit\(/g, replacement: 'this.modalClose.emit(' },
  { regex: /\(close\)="/g, replacement: '(modalClose)="' },
  { regex: /\(nzOnCancel\)="close\.emit\(\)"/g, replacement: '(nzOnCancel)="modalClose.emit()"' },
  { regex: /\(click\)="close\.emit\(\)"/g, replacement: '(click)="modalClose.emit()"' }
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (['.ts', '.html', '.md', '.json', '.txt'].some(ext => fullPath.endsWith(ext))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const r of replacements) {
        content = content.replace(r.regex, r.replacement);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir(dir);
