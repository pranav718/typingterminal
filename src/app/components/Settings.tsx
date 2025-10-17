"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import type { SettingsType } from "../hooks/useSettings"

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
  settings: SettingsType
  onSettingsChange: (settings: SettingsType) => void
}

const themes = [
  { id: "matrix", name: "Matrix", bg: "bg-[#0a0f0a]", text: "text-[#00ff88]" },
  { id: "paper", name: "Paper", bg: "bg-[#f5f5f5]", text: "text-[#2c3e50]" },
  { id: "ocean", name: "Ocean", bg: "bg-[#0a1929]", text: "text-[#00d9ff]" },
  { id: "sunset", name: "Sunset", bg: "bg-[#1a0a2e]", text: "text-[#ff9f40]" },
  { id: "sakura", name: "Sakura", bg: "bg-[#fffafd]", text: "text-[#db7093]" },
]

export default function Settings({ isOpen, onClose, settings, onSettingsChange }: SettingsProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-matrix-bg-darker border-2 border-matrix-primary rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-matrix-bg-darker border-b border-matrix-primary/20 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-matrix-primary drop-shadow-glow">Settings</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-matrix-bg transition-all hover:rotate-90 flex items-center justify-center text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="pb-6 border-b border-matrix-primary/10">
            <h3 className="text-sm font-semibold text-matrix-primary uppercase tracking-wider mb-4">Theme</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.id}
                  onClick={() => setTheme(themeOption.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:-translate-y-1 ${
                    theme === themeOption.id
                      ? "border-matrix-primary bg-matrix-primary/10 shadow-glow"
                      : "border-matrix-primary/20 hover:border-matrix-primary"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-lg ${themeOption.bg} ${themeOption.text} flex items-center justify-center text-2xl font-bold shadow-inner transition-transform hover:scale-110`}
                  >
                    Aa
                  </div>
                  <span className="text-xs text-matrix-light">{themeOption.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pb-6 border-b border-matrix-primary/10">
            <h3 className="text-sm font-semibold text-matrix-primary uppercase tracking-wider mb-4">
              Error Shake Effect
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["off", "subtle", "medium", "strong"] as const).map((intensity) => (
                <button
                  key={intensity}
                  onClick={() => onSettingsChange({ ...settings, shakeIntensity: intensity })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:-translate-y-1 group ${
                    settings.shakeIntensity === intensity
                      ? "border-matrix-primary bg-matrix-primary/10 shadow-glow"
                      : "border-matrix-primary/20 hover:border-matrix-primary"
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <span
                      className={`text-2xl font-bold text-red-500 group-hover:animate-shake-${intensity === "off" ? "subtle" : intensity}`}
                    >
                      A
                    </span>
                  </div>
                  <span className="text-xs text-matrix-light capitalize">{intensity}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-matrix-primary uppercase tracking-wider mb-4">
              Untyped Text Visibility
            </h3>
            <div className="flex items-center gap-4 mb-3">
              <input
                type="range"
                min="0.3"
                max="0.9"
                step="0.05"
                value={settings.textOpacity}
                onChange={(e) => onSettingsChange({ ...settings, textOpacity: Number.parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-matrix-primary/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:w-5 
                  [&::-webkit-slider-thumb]:h-5 
                  [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-matrix-primary 
                  [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(var(--color-primary),0.5)]
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-125
                  [&::-moz-range-thumb]:w-5
                  [&::-moz-range-thumb]:h-5
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-matrix-primary
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(var(--color-primary),0.5)]
                  [&::-moz-range-thumb]:cursor-pointer"
              />
              <span className="text-matrix-primary font-semibold min-w-[50px] text-right">
                {Math.round(settings.textOpacity * 100)}%
              </span>
            </div>
            <div className="p-4 bg-matrix-primary/5 border border-matrix-primary/20 rounded-lg text-center">
              <span className="text-lg text-matrix-primary" style={{ opacity: settings.textOpacity }}>
                Preview text visibility
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
