'use client'

import {useState, useEffect} from 'react';

export interface SettingsType {
    shakeIntensity: 'off' | 'subtle' | 'medium' | 'strong';
    theme: 'matrix' | 'paper' | 'ocean' | 'sunset';
    textOpacity: number;
}

const defaultSettings: SettingsType = {
    shakeIntensity: 'medium',
    theme: 'matrix',
    textOpacity: 0.65
}

interface SettingsProps {
    isOpen: boolean;
    onClose:() => void;
    settings: SettingsType;
    onSettingsChange: (settings: SettingsType)=> void;
}

export function useSettings() {
    const [settings, setSettings] = useState<SettingsType>(defaultSettings);

    useEffect( ()=> {
        const stored = localStorage.getItem('terminaltype_settings');
        if(stored){
            try{
                setSettings(JSON.parse(stored));
            }catch {
                setSettings(defaultSettings);
            }
        }

    }, []);

    const updateSettings = (newSettings: SettingsType) => {
        setSettings(newSettings);
        localStorage.setItem('terminaltype_settings', JSON.stringify(newSettings));
    }

    return { settings, updateSettings };
}

export default function Settings({ isOpen, onClose, settings, onSettingsChange}: SettingsProps) {
    if(!isOpen) return null;

     const handleShakeChange = (intensity: SettingsType['shakeIntensity']) => {
    onSettingsChange({ ...settings, shakeIntensity: intensity });
  };

  const handleThemeChange = (theme: SettingsType['theme']) => {
    onSettingsChange({ ...settings, theme });
  };

  const handleOpacityChange = (opacity: number) => {
    onSettingsChange({ ...settings, textOpacity: opacity });
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <h3 className="setting-title">Theme</h3>
            <div className="theme-grid">
              <button
                className={`theme-option theme-matrix ${settings.theme === 'matrix' ? 'active' : ''}`}
                onClick={() => handleThemeChange('matrix')}
              >
                <div className="theme-preview matrix-preview">
                  <span>Aa</span>
                </div>
                <span>Matrix</span>
              </button>

              <button
                className={`theme-option theme-paper ${settings.theme === 'paper' ? 'active' : ''}`}
                onClick={() => handleThemeChange('paper')}
              >
                <div className="theme-preview paper-preview">
                  <span>Aa</span>
                </div>
                <span>Paper</span>
              </button>

              <button
                className={`theme-option theme-ocean ${settings.theme === 'ocean' ? 'active' : ''}`}
                onClick={() => handleThemeChange('ocean')}
              >
                <div className="theme-preview ocean-preview">
                  <span>Aa</span>
                </div>
                <span>Ocean</span>
              </button>

              <button
                className={`theme-option theme-sunset ${settings.theme === 'sunset' ? 'active' : ''}`}
                onClick={() => handleThemeChange('sunset')}
              >
                <div className="theme-preview sunset-preview">
                  <span>Aa</span>
                </div>
                <span>Sunset</span>
              </button>
            </div>
          </div>

          <div className="setting-group">
            <h3 className="setting-title">Error Shake Effect</h3>
            <div className="shake-options">
              {(['off', 'subtle', 'medium', 'strong'] as const).map((intensity) => (
                <button
                  key={intensity}
                  className={`shake-option ${settings.shakeIntensity === intensity ? 'active' : ''}`}
                  onClick={() => handleShakeChange(intensity)}
                >
                  <div className={`shake-preview shake-${intensity}`}>
                    <span className="shake-demo">A</span>
                  </div>
                  <span>{intensity.charAt(0).toUpperCase() + intensity.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <h3 className="setting-title">Untyped Text Visibility</h3>
            <div className="opacity-control">
              <input
                type="range"
                min="0.3"
                max="0.9"
                step="0.05"
                value={settings.textOpacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                className="opacity-slider"
              />
              <div className="opacity-value">{Math.round(settings.textOpacity * 100)}%</div>
            </div>
            <div className="opacity-preview">
              <span style={{ opacity: settings.textOpacity }}>Preview text visibility</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}