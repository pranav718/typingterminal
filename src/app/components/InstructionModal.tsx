"use client"
import React from "react"
import "../terminal.css"

interface InstructionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  title?: string
  message?: string
}

export default function InstructionModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "IMPORTANT!!",
  message = "Please click on skip passage till reaching the actual content, thank you :)"
}: InstructionModalProps) {
  if (!isOpen) return null

  const handleAction = () => {
    if (onConfirm) {
      onConfirm()
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-[#00120b]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="terminal-window max-w-md w-full animate-fade-in border-[#41ff5f80] shadow-[0_0_50px_rgba(65,255,95,0.15)]">
        
        <div className="bg-[#001a0f] border-b border-[#41ff5f40] px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-[#ff5f41] animate-pulse"></span>
            <h2 className="text-lg font-bold text-[#41ff5f] text-shadow-glow tracking-wider">
              {title}
            </h2>
          </div>
        </div>

        <div className="p-8 text-center">
          <div className="mb-6 text-4xl">⚠</div>
          <p className="text-md text-[#41ff5f] font-mono leading-relaxed">
            &gt; {message}
          </p>
          <p className="text-xs text-[#7bff9a]/60 mt-4 font-mono border-t border-[#41ff5f20] pt-4">
            Some books contain metadata or copyright pages at the beginning. Use the "Skip passage" button to bypass them.
          </p>
        </div>

        <div className="p-4 border-t border-[#41ff5f40] bg-[#001a0f]/50 flex justify-center">
          <button
            onClick={handleAction}
            className="terminal-btn bg-[#41ff5f10] hover:bg-[#41ff5f20] px-8 py-2 font-bold w-full md:w-auto"
          >
            &gt; 
          </button>
        </div>
      </div>
    </div>
  )
}