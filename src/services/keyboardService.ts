import { KeyboardShortcut } from '../types';

export class KeyboardService {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private enabled: boolean = true;
  private handler: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    this.handler = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.handler);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;
    
    // Ignore if typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const key = event.key;
    const shortcut = this.shortcuts.get(key);
    
    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }

  addShortcut(shortcut: KeyboardShortcut): void {
    this.shortcuts.set(shortcut.key, shortcut);
  }

  removeShortcut(key: string): void {
    this.shortcuts.delete(key);
  }

  clearShortcuts(): void {
    this.shortcuts.clear();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  destroy(): void {
    if (this.handler) {
      document.removeEventListener('keydown', this.handler);
      this.handler = null;
    }
    this.shortcuts.clear();
  }
}
