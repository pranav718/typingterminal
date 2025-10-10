'use client'

import { useState, useEffect } from 'react';

export interface SettingsType {
  shakeIntensity: 'off' | 'subtle' | 'medium' | 'strong';
  textOpacity: number;
}

const defaultSettings: SettingsType = {
  shakeIntensity: 'medium',
  textOpacity: 0.65,
};

export function useSettings() {
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);

  useEffect(() => {
    const stored = localStorage.getItem('terminaltype_settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  const updateSettings = (newSettings: SettingsType) => {
    setSettings(newSettings);
    localStorage.setItem('terminaltype_settings', JSON.stringify(newSettings));
  };

  return { settings, updateSettings };
}