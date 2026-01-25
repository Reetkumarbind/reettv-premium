import React from 'react';
import { X, Moon, Sun, Keyboard, Play, Download, Upload, Trash2 } from 'lucide-react';
import { UserPreferences } from '../types';
import { StorageService } from '../services/storageService';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  preferences,
  onPreferencesChange,
}) => {
  const handleExport = () => {
    const data = StorageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reet-tv-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        if (StorageService.importData(text)) {
          window.location.reload();
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      StorageService.clearAllData();
      window.location.reload();
    }
  };

  if (!isOpen) return null;

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
          <h2 className="text-xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          {/* Appearance */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Appearance
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                <div className="flex items-center gap-3">
                  {preferences.theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="font-medium">Theme</span>
                </div>
                <button
                  onClick={() =>
                    onPreferencesChange({
                      ...preferences,
                      theme: preferences.theme === 'dark' ? 'light' : 'dark',
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
                >
                  {preferences.theme === 'dark' ? 'Dark' : 'Light'}
                </button>
              </div>
            </div>
          </div>

          {/* Playback */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Playback
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5 text-primary" />
                  <span className="font-medium">Auto-play</span>
                </div>
                <button
                  onClick={() =>
                    onPreferencesChange({
                      ...preferences,
                      autoPlay: !preferences.autoPlay,
                    })
                  }
                  className={`w-12 h-7 rounded-full transition-colors ${
                    preferences.autoPlay ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      preferences.autoPlay ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <Keyboard className="w-5 h-5 text-primary" />
                  <span className="font-medium">Keyboard Shortcuts</span>
                </div>
                <button
                  onClick={() =>
                    onPreferencesChange({
                      ...preferences,
                      keyboardShortcuts: !preferences.keyboardShortcuts,
                    })
                  }
                  className={`w-12 h-7 rounded-full transition-colors ${
                    preferences.keyboardShortcuts ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      preferences.keyboardShortcuts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className="font-medium">Default Quality</span>
                </div>
                <select
                  value={preferences.defaultQuality}
                  onChange={(e) =>
                    onPreferencesChange({
                      ...preferences,
                      defaultQuality: e.target.value as UserPreferences['defaultQuality'],
                    })
                  }
                  className="px-3 py-2 rounded-xl bg-muted border-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                >
                  <option value="auto">Auto</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Data Management
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleExport}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Download className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Export</span>
              </button>
              <button
                onClick={handleImport}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Import</span>
              </button>
              <button
                onClick={handleClearData}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-destructive/10 hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-destructive" />
                <span className="text-xs font-medium text-destructive">Clear</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
