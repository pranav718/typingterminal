"use client"
import React from "react"
import "../terminal.css"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "CONFIRM ACTION",
  message = "Are you sure you want to proceed?",
  confirmText = "CONFIRM",
  cancelText = "CANCEL",
  isDangerous = false
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[#00120b]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className={`terminal-window max-w-sm w-full animate-fade-in shadow-[0_0_50px_rgba(0,0,0,0.5)] ${isDangerous ? 'border-[#ff5f41]' : 'border-[#41ff5f]'}`}>
        <div className={`border-b px-6 py-3 flex justify-between items-center ${isDangerous ? 'bg-[#ff5f41]/10 border-[#ff5f4140]' : 'bg-[#41ff5f]/10 border-[#41ff5f40]'}`}>
          <h2 className="text-lg font-bold tracking-widest text-shadow-glow text-[#41ff5f]">
            {title}
          </h2>
        </div>

        <div className="p-6 text-center">
          <p className="text-md text-[#7bff9a] font-mono leading-relaxed">
            {message}
          </p>
        </div>

        <div className={`p-4 border-t flex gap-3 justify-center ${isDangerous ? 'border-[#ff5f4140] bg-[#ff5f41]/5' : 'border-[#41ff5f40] bg-[#41ff5f]/5'}`}>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-[#7bff9a]/30 text-[#7bff9a]/60 hover:text-[#7bff9a] hover:border-[#7bff9a] rounded transition-all font-mono text-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 py-2 px-4 border rounded transition-all font-mono text-sm font-bold ${
              isDangerous 
                ? 'border-[#ff5f41] text-[#ff5f41] hover:bg-[#ff5f41] hover:text-[#00120b]' 
                : 'border-[#41ff5f] text-[#41ff5f] hover:bg-[#41ff5f] hover:text-[#00120b]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}