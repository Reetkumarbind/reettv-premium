import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { KeyboardShortcut } from '../types';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  isOpen,
  onClose,
  shortcuts,
}) => {
  if (!isOpen) return null;

  const defaultShortcuts = [
    { key: 'Space', description: 'Play/Pause' },
    { key: '←', description: 'Previous Channel' },
    { key: '→', description: 'Next Channel' },
    { key: '↑', description: 'Volume Up' },
    { key: '↓', description: 'Volume Down' },
    { key: 'M', description: 'Toggle Mute' },
    { key: 'H', description: 'Toggle Favorite' },
    { key: 'Esc', description: 'Back to Gallery' },
    { key: 'S', description: 'Open Settings' },
    { key: '?', description: 'Show Shortcuts' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative glass-card w-full max-w-md p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20">
              <Keyboard className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2">
          {defaultShortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
            >
              <span className="text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-3 py-1.5 rounded-lg bg-muted font-mono text-sm font-medium">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Tip */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Press <kbd className="px-2 py-0.5 rounded bg-muted font-mono text-xs">?</kbd> anytime to show this panel
        </p>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
