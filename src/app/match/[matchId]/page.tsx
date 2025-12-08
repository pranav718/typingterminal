'use client'

import { useEffect, useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'
import { useAuth } from '../../hooks/useAuth'
import { useSettings } from '../../hooks/useSettings'
import ProfileImage from '../../components/ProfileImage'
import ConfirmationModal from '../../components/ConfirmationModal' 
import '../../terminal.css'

interface MatchPageProps {
  params: Promise<{ matchId: string }>
}

export default function MatchPage({ params }: MatchPageProps) {
  const resolvedParams = use(params)
  const matchId = resolvedParams.matchId as Id<"matches">
  const router = useRouter()
  const { user, isGuest, isLoading } = useAuth()
  const { settings } = useSettings()

  const [userInput, setUserInput] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [errors, setErrors] = useState(0)
  const [liveWpm, setLiveWpm] = useState(0)
  const [liveAccuracy, setLiveAccuracy] = useState(100)
  const [isComplete, setIsComplete] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  
  const [isCopied, setIsCopied] = useState(false)
  
  const [showCancelModal, setShowCancelModal] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const matchData = useQuery(api.matches.getMatch, { matchId })
  const submitResult = useMutation(api.matches.submitMatchResult)
  const cancelMatch = useMutation(api.matches.cancelMatch)

  const text = matchData?.passageText || ''
  const isHost = user?._id === matchData?.hostId
  const isOpponent = user?._id === matchData?.opponentId

  useEffect(() => {
    if (matchData?.status === 'in_progress' && !isComplete) {
      inputRef.current?.focus()
    }
  }, [matchData?.status, isComplete])

  const handleConfirmCancel = async () => {
    try {
      await cancelMatch({ matchId })
      router.push('/matches')
    } catch (error) {
      console.error('Failed to cancel:', error)
      alert('ERROR: FAILED TO CANCEL MATCH') 
    }
  }

  if (!isLoading && (isGuest || !user)) {
    return (
      <div className="min-h-screen bg-[#00120b] text-[#41ff5f] font-mono relative overflow-hidden flex items-center justify-center">
        <div className="scanline" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="grid-lines absolute inset-0" />
        </div>
        <div className="relative z-10 max-w-lg w-full p-4">
          <div className="terminal-window p-8 border-[#ff5f4180] text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-[#ff5f41] mb-4 text-shadow-glow">ACCESS DENIED</h2>
            <p className="text-[#7bff9a]/80 mb-6 font-mono">AUTHENTICATION REQUIRED FOR MATCH PROTOCOLS</p>
            <button
              onClick={() => router.push('/')}
              className="terminal-btn border-[#ff5f41] text-[#ff5f41] hover:bg-[#ff5f4120]"
            >
              RETURN TO ROOT
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoading && matchData && user && matchData.hostId !== user._id && matchData.opponentId !== user._id) {
    return (
      <div className="min-h-screen bg-[#00120b] text-[#41ff5f] font-mono relative overflow-hidden flex items-center justify-center">
        <div className="scanline" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="grid-lines absolute inset-0" />
        </div>
        <div className="relative z-10 max-w-lg w-full p-4">
          <div className="terminal-window p-8 border-[#ff5f4180] text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-[#ff5f41] mb-4 text-shadow-glow">UNAUTHORIZED</h2>
            <p className="text-[#7bff9a]/80 mb-6 font-mono">YOU ARE NOT A PARTICIPANT IN THIS SESSION</p>
            <button
              onClick={() => router.push('/')}
              className="terminal-btn border-[#ff5f41] text-[#ff5f41] hover:bg-[#ff5f4120]"
            >
              RETURN TO ROOT
            </button>
          </div>
        </div>
      </div>
    )
  }


  const countCorrectWords = (input: string, reference: string): number => {
    if (!input || !reference) return 0
    let correctChars = 0
    const minLength = Math.min(input.length, reference.length)
    for (let i = 0; i < minLength; i++) {
      if (input[i] === reference[i]) correctChars++
    }
    return correctChars / 5
  }

  useEffect(() => {
    if (!startTime || userInput.length === 0) {
      setLiveWpm(0)
      return
    }

    const interval = setInterval(() => {
      const timeElapsed = (Date.now() - startTime) / 60000
      if (timeElapsed > 0) {
        const correctWords = countCorrectWords(userInput, text)
        setLiveWpm(Math.round(correctWords / timeElapsed))
      }
    }, 100)

    return () => clearInterval(interval)
  }, [startTime, userInput, text])

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComplete || hasSubmitted) return

    const input = e.target.value
    if (input.length > text.length) return

    if (!startTime && input.length === 1) {
      setStartTime(Date.now())
    }

    setUserInput(input)

    let errorCount = 0
    for (let i = 0; i < input.length; i++) {
      if (input[i] !== text[i]) errorCount++
    }
    setErrors(errorCount)

    if (input.length > 0) {
      setLiveAccuracy(Math.round(((input.length - errorCount) / input.length) * 100))
    }

    if (input.length === text.length && startTime) {
      const timeTaken = (Date.now() - startTime) / 60000
      const correctWords = countCorrectWords(input, text)
      const finalWPM = timeTaken > 0 ? Math.round(correctWords / timeTaken) : 0
      const finalAccuracy = Math.round(((text.length - errorCount) / text.length) * 100)

      setLiveWpm(finalWPM)
      setLiveAccuracy(finalAccuracy)
      setIsComplete(true)

      try {
        await submitResult({
          matchId,
          wpm: finalWPM,
          accuracy: finalAccuracy,
          errors: errorCount,
        })
        setHasSubmitted(true)
      } catch (error) {
        console.error('Failed to submit result:', error)
      }
    }
  }

  const renderText = () => {
    return text.split("").map((char, index) => {
      let className = "inline-block transition-all duration-150"
      let style: React.CSSProperties = { whiteSpace: "pre" }

      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += " text-[#41ff5f] drop-shadow-[0_0_8px_rgba(65,255,95,0.6)]"
        } else {
          const shakeClass = settings?.shakeIntensity !== "off" ? ` animate-shake-${settings?.shakeIntensity || "medium"}` : ""
          className += ` text-[#ff5f41] bg-[#ff5f4120] px-0.5 rounded drop-shadow-[0_0_8px_rgba(255,95,65,0.6)]${shakeClass}`
        }
      } else if (index === userInput.length) {
        className += " bg-[#41ff5f40] rounded px-1 -mx-0.5 scale-110 animate-pulse"
      } else {
        className += " text-[#7bff9a]"
        style.opacity = settings?.textOpacity ?? 0.3
      }

      const displayChar = char === " " ? "\u00A0" : char

      return (
        <span key={index} className={className} style={style}>
          {displayChar}
        </span>
      )
    })
  }

  const opponentResult = matchData?.results?.find(r => r.userId !== user?._id)
  const myResult = matchData?.results?.find(r => r.userId === user?._id)

  if (isLoading || !matchData) {
    return (
      <div className="min-h-screen bg-[#00120b] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#41ff5f] border-t-transparent mb-4"></div>
          <p className="text-[#41ff5f] text-xl animate-pulse">LOADING MATCH DATA...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  if (matchData.status === 'waiting') {
    const isHost = user._id === matchData.hostId

    return (
      <div className="min-h-screen bg-[#00120b] text-[#41ff5f] font-mono relative overflow-hidden">
        <ConfirmationModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleConfirmCancel}
          title="CANCEL MATCH?"
          message="Are you sure you want to terminate this session? Your opponent will not be able to join."
          confirmText="TERMINATE"
          cancelText="RESUME"
          isDangerous={true}
        />

        <div className="scanline" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="grid-lines absolute inset-0" />
        </div>

        <div className="max-w-2xl mx-auto p-6 relative z-10">
          <button
            onClick={() => router.push('/')}
            className="mb-6 terminal-btn text-sm"
          >
            &lt; BACK
          </button>

          <div className="terminal-window p-8 text-center relative">
            {isHost && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="absolute top-4 right-4 w-8 h-8 rounded border-2 border-[#ff5f41] text-[#ff5f41] hover:bg-[#ff5f4120] transition-all flex items-center justify-center text-lg font-bold"
                title="Cancel match"
              >
                ✕
              </button>
            )}

            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-[#41ff5f] mb-2 text-shadow-glow">
                WAITING FOR OPPONENT
              </h2>
              <div className="flex items-center justify-center gap-2 text-sm text-[#7bff9a]/60 animate-pulse">
                <div className="w-2 h-2 bg-[#41ff5f] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#41ff5f] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#41ff5f] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
            
            <div className="mb-8 p-6 bg-[#003018]/30 border-2 border-[#41ff5f30] rounded">
              <p className="text-xs text-[#7bff9a]/60 mb-2 uppercase tracking-wider">SHARE INVITE CODE:</p>
              <div className="text-4xl md:text-5xl font-bold text-[#41ff5f] tracking-widest font-mono text-shadow-glow mb-4">
                {matchData.inviteCode}
              </div>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(matchData.inviteCode)
                  setIsCopied(true)
                  setTimeout(() => setIsCopied(false), 2000)
                }}
                className={`terminal-btn transition-all duration-300 ${isCopied ? 'border-[#41ff5f] bg-[#41ff5f20] text-shadow-glow' : ''}`}
              >
                 {isCopied ? '✓ CODE COPIED' : 'COPY CODE'}
              </button>
            </div>

            <div className="text-[#7bff9a]/80 mb-6">
              <p className="mb-2 text-xs uppercase tracking-wider">PASSAGE: <span className="font-semibold text-[#41ff5f]">{matchData.passageSource}</span></p>
              <div className="p-4 bg-[#00120b] border border-[#41ff5f20] rounded text-sm max-h-32 overflow-y-auto text-left font-mono">
                {matchData.passageText.substring(0, 150)}...
              </div>
            </div>

            <div className="text-[#41ff5f] text-sm font-mono">
              <div className="flex items-center justify-center gap-2 animate-pulse">
                <span className="inline-block w-1 h-1 bg-[#41ff5f] rounded-full"></span>
                <span>SCANNING FOR OPPONENT CONNECTION</span>
                <span className="inline-block w-1 h-1 bg-[#41ff5f] rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (matchData.status === 'completed') {
    const winner = matchData.winnerId === user._id
    const hostResult = matchData.results?.find(r => r.userId === matchData.hostId)
    const opponentResultFinal = matchData.results?.find(r => r.userId === matchData.opponentId)

    return (
      <div className="min-h-screen bg-[#00120b] text-[#41ff5f] font-mono relative overflow-hidden">
        <div className="scanline" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="grid-lines absolute inset-0" />
        </div>

        <div className="max-w-4xl mx-auto p-6 relative z-10">
          <button
            onClick={() => router.push('/')}
            className="mb-6 terminal-btn text-sm"
          >
            &lt; RETURN HOME
          </button>

          <div className={`terminal-window p-8 ${winner ? 'border-[#41ff5f80]' : 'border-[#ff5f4180]'}`}>
            <div className="text-center mb-8">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 text-shadow-glow ${winner ? 'text-[#41ff5f]' : 'text-[#ff5f41]'}`}>
                {winner ? 'VICTORY' : 'DEFEAT'}
              </h2>
              <p className="text-[#7bff9a]/80 text-sm font-mono uppercase tracking-wider">MATCH TERMINATED</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded border-2 ${matchData.winnerId === matchData.hostId ? 'bg-[#41ff5f10] border-[#41ff5f]' : 'bg-[#003018]/20 border-[#41ff5f20]'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <ProfileImage 
                    src={matchData.host.image} 
                    alt={matchData.host.name}
                    fallbackText={matchData.host.name}
                    className="w-12 h-12 rounded-full border-2 border-[#41ff5f60]"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-[#41ff5f]">{matchData.host.name}</div>
                    <div className="text-xs text-[#7bff9a]/60 uppercase">HOST</div>
                  </div>
                  {matchData.winnerId === matchData.hostId && <span className="text-3xl">👑</span>}
                </div>
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#7bff9a]/70">WPM:</span>
                    <span className="font-bold text-[#41ff5f] text-lg">{hostResult?.wpm || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7bff9a]/70">ACCURACY:</span>
                    <span className="font-bold text-[#41ff5f] text-lg">{hostResult?.accuracy || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7bff9a]/70">ERRORS:</span>
                    <span className="font-bold text-[#ff5f41]">{hostResult?.errors || 0}</span>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded border-2 ${matchData.winnerId === matchData.opponentId ? 'bg-[#41ff5f10] border-[#41ff5f]' : 'bg-[#003018]/20 border-[#41ff5f20]'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <ProfileImage 
                    src={matchData.opponent?.image} 
                    alt={matchData.opponent?.name || 'Opponent'}
                    fallbackText={matchData.opponent?.name}
                    className="w-12 h-12 rounded-full border-2 border-[#41ff5f60]"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-[#41ff5f]">{matchData.opponent?.name || 'Opponent'}</div>
                    <div className="text-xs text-[#7bff9a]/60 uppercase">CHALLENGER</div>
                  </div>
                  {matchData.winnerId === matchData.opponentId && <span className="text-3xl">👑</span>}
                </div>
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#7bff9a]/70">WPM:</span>
                    <span className="font-bold text-[#41ff5f] text-lg">{opponentResultFinal?.wpm || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7bff9a]/70">ACCURACY:</span>
                    <span className="font-bold text-[#41ff5f] text-lg">{opponentResultFinal?.accuracy || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7bff9a]/70">ERRORS:</span>
                    <span className="font-bold text-[#ff5f41]">{opponentResultFinal?.errors || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <button
                onClick={() => router.push('/')}
                className="terminal-btn mr-4"
              >
                RETURN HOME
              </button>
              <button
                onClick={() => router.push('/matches')}
                className="terminal-btn"
              >
                VIEW HISTORY
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#00120b] text-[#41ff5f] font-mono relative overflow-hidden">
      <div className="scanline" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="grid-lines absolute inset-0" />
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 relative z-10">
        <div className="terminal-window p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#41ff5f] text-shadow-glow uppercase tracking-wider">MATCH</h2>
              <p className="text-sm text-[#7bff9a]/70 font-mono">{matchData.passageSource}</p>
            </div>

            <div className="flex gap-6">
              <div className="text-center p-3 bg-[#003018]/30 rounded border-2 border-[#41ff5f]">
                <div className="text-xs text-[#7bff9a]/60 mb-1 uppercase">YOU</div>
                <div className="font-bold text-[#41ff5f] font-mono text-lg">
                  {isComplete ? `${liveWpm} WPM` : myResult?.isFinished ? `${myResult.wpm} WPM` : 'TYPING...'}
                </div>
              </div>

              <div className="flex items-center text-2xl font-bold text-[#7bff9a]/40">VS</div>

              <div className="text-center p-3 bg-[#003018]/30 rounded border-2 border-[#41ff5f30]">
                <div className="text-xs text-[#7bff9a]/60 mb-1 uppercase">
                  {isHost ? matchData.opponent?.name : matchData.host.name}
                </div>
                <div className="font-bold text-[#41ff5f] font-mono text-lg">
                  {opponentResult?.isFinished ? `${opponentResult.wpm} WPM` : 'TYPING...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="terminal-window p-6 mb-6 min-h-[300px]">
          <div className="text-xs text-[#7bff9a]/60 mb-3 uppercase tracking-wider">TEXT BUFFER:</div>
          <div className="text-lg md:text-xl leading-relaxed font-mono">
            {renderText()}
          </div>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className="hidden-input"
          disabled={isComplete || hasSubmitted}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="terminal-window p-4 text-center">
            <div className="text-xs text-[#7bff9a]/60 mb-1">WPM</div>
            <div className="text-3xl font-bold text-[#41ff5f] text-shadow-glow font-mono">{liveWpm}</div>
          </div>

          <div className="terminal-window p-4 text-center">
            <div className="text-xs text-[#7bff9a]/60 mb-1">ACCURACY</div>
            <div className="text-3xl font-bold text-[#41ff5f] text-shadow-glow font-mono">{liveAccuracy}%</div>
          </div>

          <div className="terminal-window p-4 text-center">
            <div className="text-xs text-[#7bff9a]/60 mb-1">ERRORS</div>
            <div className="text-3xl font-bold text-[#41ff5f] text-shadow-glow font-mono">{errors}</div>
          </div>
        </div>

        {isComplete && !hasSubmitted && (
          <div className="terminal-window p-4 text-center border-[#41ff5f80]">
            <p className="text-[#41ff5f] animate-pulse font-mono">SUBMITTING RESULTS...</p>
          </div>
        )}

        {hasSubmitted && !opponentResult?.isFinished && (
          <div className="terminal-window p-4 text-center border-[#41ff5f80]">
            <p className="text-[#41ff5f] font-semibold font-mono">MATCH COMPLETED!! WAITING FOR OPPONENT...</p>
          </div>
        )}

        {!isComplete && (
          <div className="text-center text-sm text-[#7bff9a]/60 animate-pulse font-mono uppercase">
            TYPE TO BEGIN BATTLE...
          </div>
        )}
      </div>
    </div>
  )
}