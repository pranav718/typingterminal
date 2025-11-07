'use client'

import { useState, useEffect } from 'react'

export type ShakeIntensity = 'off' | 'subtle' | 'medium' | 'strong'
export type FontTheme = 'jetbrains' | 'geist' | 'fira'

export interface SettingsType {
  shakeIntensity: ShakeIntensity
  textOpacity: number
  fontTheme: FontTheme
}

const DEFAULT_SETTINGS: SettingsType = {
  shakeIntensity: 'medium',
  textOpacity: 0.3,
  fontTheme: 'jetbrains',
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedSettings = localStorage.getItem('terminaltype-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } catch (error) {
        console.error('Failed to parse settings:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    document.body.classList.remove('font-jetbrains', 'font-geist', 'font-fira')
    
    document.body.classList.add(`font-${settings.fontTheme}`)
  }, [settings.fontTheme, isLoaded])

  const updateSettings = (newSettings: Partial<SettingsType>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem('terminaltype-settings', JSON.stringify(updated))
  }

  return { settings, updateSettings, isLoaded }
}