'use client'

import { useRouter } from 'next/navigation'
import '../terminal.css'

interface PracticeHeaderProps {
  user: any
  isGuest: boolean
  logout: () => void
  onSettingsClick: () => void
  onSkipClick: () => void
  isComplete: boolean
  isLoadingBook: boolean
  showUpload: boolean
  showSelectionScreen: boolean 
  onBackClick?: () => void
}

export default function PracticeHeader({
  user,
  isGuest,
  logout,
  onSettingsClick,
  onSkipClick,
  isComplete,
  isLoadingBook,
  showUpload,
  showSelectionScreen, 
  onBackClick,
}: PracticeHeaderProps) {
  const router = useRouter()

  return (
    <header className="terminal-window mb-6 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <button
          onClick={onBackClick || (() => router.push('/'))}
          className="terminal-btn px-3 py-2 text-xl hover:bg-[#41ff5f20] group"
          title="Return to Root"
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block">&lt;</span>
        </button>
        
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#41ff5f] text-shadow-glow tracking-wider font-mono">
            TYPINGTERMINAL
          </h1>
          <div className="text-[10px] text-[#7bff9a]/60 tracking-widest">
            SESSION_ID: {Math.floor(Math.random() * 99999).toString().padStart(5, '0')}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
        
        {user && (
          <div className="flex items-center border border-[#41ff5f30] bg-[#001a0f]/50 px-3 py-2 rounded-sm gap-4 w-full md:w-auto justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-2 h-2 rounded-full bg-[#41ff5f] animate-pulse shadow-[0_0_10px_#41ff5f]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-[#7bff9a]/60 uppercase leading-none mb-0.5">Logged In As</span>
                <span className="text-xs text-[#41ff5f] font-mono truncate max-w-[150px]">
                  {isGuest ? 'GUEST_USER' : user.email || user.name}
                </span>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="text-xs text-[#ff5f41] hover:text-[#ff5f41] hover:bg-[#ff5f4110] border border-[#ff5f4140] px-2 py-1 transition-all uppercase tracking-wider"
            >
              Logout
            </button>
          </div>
        )}

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={onSettingsClick}
            className="terminal-btn flex-1 md:flex-none text-xs flex items-center justify-center gap-2"
          >
            <span>SETTINGS</span>
          </button>

          {!isComplete && !showUpload && !isLoadingBook && !showSelectionScreen && (
            <button
              onClick={onSkipClick}
              className="terminal-btn flex-1 md:flex-none text-xs border-[#e6b450] text-[#e6b450] hover:bg-[#e6b45010] hover:shadow-[0_0_15px_rgba(230,180,80,0.3)]"
            >
              SKIP PASSAGE 
            </button>
          )}
        </div>
      </div>
    </header>
  )
}