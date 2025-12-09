'use client'

import { useRouter } from 'next/navigation'
import ProfileImage from './ProfileImage'
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
          className="terminal-btn px-3 h-9 flex items-center justify-center text-xl hover:bg-[#41ff5f20] group"
          title="Return to Root"
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block">&lt;</span>
        </button>
        
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#41ff5f] text-shadow-glow tracking-wider font-mono leading-none">
            TYPINGTERMINAL
          </h1>
          <div className="text-[10px] text-[#7bff9a]/60 tracking-widest mt-1">
            SESSION_ID: {Math.floor(Math.random() * 99999).toString().padStart(5, '0')}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto justify-end">
        
        {user && (
          <>
            <div className="flex items-center gap-2 px-3 h-9 bg-[#003018]/50 border border-[#41ff5f30] rounded-sm text-xs select-none">
              <ProfileImage
                src={user.image}
                alt={user.name || "User"}
                fallbackText={user.name || user.email}
                className="w-5 h-5 rounded-full border border-[#41ff5f60]"
              />
              <span className="text-[#41ff5f] font-mono max-w-[100px] truncate hidden sm:inline-block">
                {user.name || user.email?.split('@')[0]}
              </span>
              {isGuest && (
                <span className="px-1.5 py-0.5 bg-[#ff5f4180] text-[#000] text-[10px] font-bold rounded">
                  GUEST
                </span>
              )}
            </div>

            <button
              onClick={logout}
              className="h-9 px-3 border border-[#ff5f4180] text-[#ff5f41] rounded-sm hover:bg-[#ff5f4120] text-xs font-bold tracking-wider transition-colors"
            >
              LOGOUT
            </button>
          </>
        )}

        <button
          onClick={onSettingsClick}
          className="terminal-btn h-9 px-4 text-xs flex items-center justify-center gap-2"
        >
          <span>SETTINGS</span>
        </button>

        {!isComplete && !showUpload && !isLoadingBook && !showSelectionScreen && (
          <button
            onClick={onSkipClick}
            className="h-9 px-3 border border-[#e6b450] text-[#e6b450] bg-transparent hover:bg-[#e6b45010] hover:shadow-[0_0_15px_rgba(230,180,80,0.3)] rounded-sm text-xs font-bold tracking-wider transition-all"
          >
            SKIP
          </button>
        )}
      </div>
    </header>
  )
}