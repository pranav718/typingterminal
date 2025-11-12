"use client"

import { useState, useEffect } from "react"
import type { SettingsType, FontTheme } from "../hooks/useSettings"

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
  settings: SettingsType
  onSettingsChange: (settings: SettingsType) => void
}

const fontThemes = [
  { 
    id: "jetbrains" as FontTheme, 
    name: "JetBrains Mono",
    preview: "JetBrains"
  },
  { 
    id: "geist" as FontTheme, 
    name: "Geist Mono", 
    preview: "Geist"
  },
  { 
    id: "fira" as FontTheme, 
    name: "Fira Code", 
    preview: "Fira"
  },
]

export default function Settings({ isOpen, onClose, settings, onSettingsChange }: SettingsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  return (
    <div 
      className="fixed inset-0 bg-[#00120b]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="terminal-window max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#001a0f] border-b border-[#41ff5f40] px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-[#41ff5f] text-shadow-glow tracking-wider">
            SYSTEM SETTINGS
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-[#ff5f4180] text-[#ff5f41] hover:bg-[#ff5f4120] transition-all flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="pb-6 border-b border-[#41ff5f10]">
            <h3 className="text-xs font-semibold text-[#7bff9a]/80 uppercase tracking-wider mb-4">
              FONT THEME:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {fontThemes.map((font) => (
                <button
                  key={font.id}
                  onClick={() => onSettingsChange({ ...settings, fontTheme: font.id })}
                  className={`flex flex-col items-center gap-2 p-4 rounded border-2 transition-all hover:-translate-y-1 ${
                    settings.fontTheme === font.id
                      ? "border-[#41ff5f] bg-[#41ff5f10] shadow-[0_0_20px_rgba(65,255,95,0.3)]"
                      : "border-[#41ff5f20] hover:border-[#41ff5f]"
                  }`}
                >
                  <div
                    className={`w-full h-16 rounded bg-[#003018]/30 border border-[#41ff5f30] flex items-center justify-center text-2xl font-bold shadow-inner transition-transform hover:scale-105`}
                    style={{ fontFamily: font.id === 'jetbrains' ? '"JetBrains Mono", monospace' : font.id === 'geist' ? '"Geist Mono", monospace' : '"Fira Code", monospace' }}
                  >
                    {font.preview}
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#41ff5f] font-bold font-mono">{font.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pb-6 border-b border-[#41ff5f10]">
            <h3 className="text-xs font-semibold text-[#7bff9a]/80 uppercase tracking-wider mb-4">
              ERROR SHAKE INTENSITY:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["off", "subtle", "medium", "strong"] as const).map((intensity) => (
                <button
                  key={intensity}
                  onClick={() => onSettingsChange({ ...settings, shakeIntensity: intensity })}
                  className={`flex flex-col items-center gap-2 p-3 rounded border-2 transition-all hover:-translate-y-1 group ${
                    settings.shakeIntensity === intensity
                      ? "border-[#41ff5f] bg-[#41ff5f10] shadow-[0_0_20px_rgba(65,255,95,0.3)]"
                      : "border-[#41ff5f20] hover:border-[#41ff5f]"
                  }`}
                >
                  <div className="w-12 h-12 rounded bg-[#ff5f4110] border border-[#ff5f4130] flex items-center justify-center">
                    <span
                      className={`text-2xl font-bold text-[#ff5f41] ${
                        intensity !== 'off' ? `group-hover:animate-shake-${intensity}` : ''
                      }`}
                    >
                      A
                    </span>
                  </div>
                  <span className="text-xs text-[#41ff5f] font-mono uppercase">{intensity}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#7bff9a]/80 uppercase tracking-wider mb-4">
              UNTYPED TEXT VISIBILITY:
            </h3>
            <div className="flex items-center gap-4 mb-3">
              <input
                type="range"
                min="0.3"
                max="0.9"
                step="0.05"
                value={settings.textOpacity}
                onChange={(e) => onSettingsChange({ ...settings, textOpacity: Number.parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-[#41ff5f20] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-[#41ff5f]
                  [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(65,255,95,0.5)]
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-125
                  [&::-moz-range-thumb]:w-5
                  [&::-moz-range-thumb]:h-5
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-[#41ff5f]
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(65,255,95,0.5)]
                  [&::-moz-range-thumb]:cursor-pointer"
              />
              <span className="text-[#41ff5f] font-semibold min-w-[50px] text-right font-mono">
                {Math.round(settings.textOpacity * 100)}%
              </span>
            </div>
            <div className="p-4 bg-[#003018]/20 border border-[#41ff5f20] rounded text-center">
              <span className="text-lg text-[#41ff5f]" style={{ opacity: settings.textOpacity }}>
                PREVIEW TEXT VISIBILITY
              </span>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-[#41ff5f10] border border-[#41ff5f30] rounded">
            <div className="text-xs text-[#7bff9a]/80 font-mono">
              <div className="mb-2">💡 TIP: SETTINGS ARE SAVED LOCALLY</div>
              <div className="text-[#7bff9a]/60">
                • Font themes change the entire app typography<br/>
                • Shake effects indicate typing errors<br/>
                • Text opacity controls untyped character visibility
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}