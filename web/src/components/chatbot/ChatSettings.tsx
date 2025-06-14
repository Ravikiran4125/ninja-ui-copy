'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { X, Moon, Sun, Monitor, Volume2, VolumeX, Upload, Upload as UploadX, Heart, HeartOff, Search, SearchX, Eye, EyeOff, Clock, AlarmClockOff as ClockOff } from 'lucide-react';
import type { ChatbotSettings } from './types';

interface ChatSettingsProps {
  settings: ChatbotSettings;
  onSettingsChange: (settings: Partial<ChatbotSettings>) => void;
  onClose: () => void;
}

export function ChatSettings({ settings, onSettingsChange, onClose }: ChatSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = <K extends keyof ChatbotSettings>(
    key: K,
    value: ChatbotSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange({ [key]: value });
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'auto', label: 'Auto', icon: Monitor },
  ] as const;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Chat Settings</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <div className="flex gap-2">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleSettingChange('theme', value)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    localSettings.theme === value
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  )}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3">
            <SettingToggle
              label="Voice Recording"
              description="Enable voice message recording"
              enabled={localSettings.enableVoice}
              onToggle={(enabled) => handleSettingChange('enableVoice', enabled)}
              enabledIcon={Volume2}
              disabledIcon={VolumeX}
            />

            <SettingToggle
              label="File Upload"
              description="Allow file attachments"
              enabled={localSettings.enableFileUpload}
              onToggle={(enabled) => handleSettingChange('enableFileUpload', enabled)}
              enabledIcon={Upload}
              disabledIcon={UploadX}
            />

            <SettingToggle
              label="Message Reactions"
              description="Enable like/dislike reactions"
              enabled={localSettings.enableReactions}
              onToggle={(enabled) => handleSettingChange('enableReactions', enabled)}
              enabledIcon={Heart}
              disabledIcon={HeartOff}
            />

            <SettingToggle
              label="Message Search"
              description="Enable searching through chat history"
              enabled={localSettings.enableSearch}
              onToggle={(enabled) => handleSettingChange('enableSearch', enabled)}
              enabledIcon={Search}
              disabledIcon={SearchX}
            />

            <SettingToggle
              label="Auto Scroll"
              description="Automatically scroll to new messages"
              enabled={localSettings.autoScroll}
              onToggle={(enabled) => handleSettingChange('autoScroll', enabled)}
              enabledIcon={Eye}
              disabledIcon={EyeOff}
            />

            <SettingToggle
              label="Show Timestamps"
              description="Display message timestamps"
              enabled={localSettings.showTimestamps}
              onToggle={(enabled) => handleSettingChange('showTimestamps', enabled)}
              enabledIcon={Clock}
              disabledIcon={ClockOff}
            />
          </div>

          {/* Message Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message Limit
            </label>
            <select
              value={localSettings.messageLimit}
              onChange={(e) => handleSettingChange('messageLimit', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={100}>100 messages</option>
              <option value={500}>500 messages</option>
              <option value={1000}>1000 messages</option>
              <option value={5000}>5000 messages</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SettingToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  enabledIcon: React.ComponentType<{ size: number }>;
  disabledIcon: React.ComponentType<{ size: number }>;
}

function SettingToggle({ 
  label, 
  description, 
  enabled, 
  onToggle, 
  enabledIcon: EnabledIcon, 
  disabledIcon: DisabledIcon 
}: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={clsx(
          'p-2 rounded-lg',
          enabled 
            ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
        )}>
          {enabled ? <EnabledIcon size={16} /> : <DisabledIcon size={16} />}
        </div>
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">{label}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{description}</div>
        </div>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={clsx(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        )}
      >
        <span
          className={clsx(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}