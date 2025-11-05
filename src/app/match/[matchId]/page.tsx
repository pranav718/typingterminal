'use client'

import { useEffect, useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'
import { useAuth } from '../../hooks/useAuth'
import { useSettings } from '../../hooks/useSettings'
import TypingArea from '../../components/Typing/TypingArea'
import StatsDisplay from '../../components/Typing/StatsDisplay'
import '../../terminal.css'
import ProfileImage from '../../components/ProfileImage'

interface MatchPageProps {
  params: Promise<{ matchId: string }>
}

export default function MatchPage({ params }: MatchPageProps) {
  const cancelMatch = useMutation(api.matches.cancelMatch)
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

  const inputRef = useRef<HTMLInputElement>(null)

  const matchData = useQuery(api.matches.getMatch, { matchId })
  const submitResult = useMutation(api.matches.submitMatchResult)

  const text = matchData?.passageText || ''
  
  const isHost = user?._id === matchData?.hostId
  const isOpponent = user?._id === matchData?.opponentId

  useEffect(() => {
    if (!isLoading && (isGuest || !user)) {
      alert('Please log in to participate in matches')
      router.push('/')
    }
  }, [isGuest, user, isLoading, router])

  useEffect(() => {
    if (!isLoading && matchData && user && matchData.hostId !== user._id && matchData.opponentId !== user._id) {
      alert('You are not a participant in this match')
      router.push('/')
    }
  }, [matchData, user, isLoading, router])

  useEffect(() => {
    if (matchData?.status === 'in_progress' && !isComplete) {
      inputRef.current?.focus()
    }
  }, [matchData?.status, isComplete])

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

  const opponentResult = matchData?.results?.find(r => user && r.userId !== user._id)
  const myResult = matchData?.results?.find(r => user && r.userId === user._id)

  if (isLoading || !matchData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-matrix-primary border-t-transparent mb-4"></div>
          <p className="text-matrix-primary text-xl">Loading match...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

    if (matchData.status === 'waiting') {
    const isHost = user._id === matchData.hostId

    return (
        <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
            <button
            onClick={() => router.push('/')}
            className="mb-6 px-4 py-2 border-2 border-matrix-primary/30 text-matrix-primary rounded-md hover:border-matrix-primary transition-all"
            >
            ← Back to Home
            </button>

            <div className="bg-matrix-primary/5 border-2 border-matrix-primary/30 rounded-2xl p-8 text-center relative">
            {isHost && (
                <button
                onClick={async () => {
                    if (confirm('Are you sure you want to cancel this match?')) {
                    try {
                        await cancelMatch({ matchId })
                        router.push('/matches')
                    } catch (error) {
                        console.error('Failed to cancel:', error)
                        alert('Failed to cancel match')
                    }
                    }
                }}
                className="absolute top-4 right-4 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all font-semibold text-sm"
                >
                ✕ Cancel Match
                </button>
            )}

            <h2 className="text-3xl font-bold text-matrix-primary mb-6">Waiting for Opponent...</h2>
            
            <div className="mb-8 p-6 bg-matrix-primary/10 border border-matrix-primary/20 rounded-xl">
                <p className="text-sm text-matrix-light mb-2">Share this invite code:</p>
                <div className="text-4xl font-bold text-matrix-primary tracking-widest font-mono">
                {matchData.inviteCode}
                </div>
                <button
                onClick={() => {
                    navigator.clipboard.writeText(matchData.inviteCode)
                    alert('Invite code copied!')
                }}
                className="mt-4 px-6 py-2 border-2 border-matrix-primary text-matrix-primary rounded-lg hover:bg-matrix-primary hover:text-matrix-bg transition-all"
                >
                📋 Copy Code
                </button>
            </div>

            <div className="text-matrix-light mb-6">
                <p className="mb-2">Passage: <span className="font-semibold">{matchData.passageSource}</span></p>
                <div className="p-4 bg-matrix-bg/50 rounded-lg text-sm max-h-32 overflow-y-auto text-left">
                {matchData.passageText.substring(0, 150)}...
                </div>
            </div>

            <div className="animate-pulse text-matrix-primary mb-4">
                Waiting for someone to join...
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
      <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/')}
            className="mb-6 px-4 py-2 border-2 border-matrix-primary/30 text-matrix-primary rounded-md hover:border-matrix-primary transition-all"
          >
            ← Back to Home
          </button>

          <div className="bg-gradient-to-br from-matrix-primary/20 to-matrix-primary/10 border-2 border-matrix-primary rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-matrix-primary mb-4">
                {winner ? '🏆 You Won! 🏆' : '😔 You Lost'}
              </h2>
              <p className="text-matrix-light">Match Completed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-xl border-2 ${matchData.winnerId === matchData.hostId ? 'bg-green-500/10 border-green-500' : 'bg-matrix-primary/5 border-matrix-primary/20'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <ProfileImage 
                    src={matchData.host.image} 
                    alt={matchData.host.name}
                    fallbackText={matchData.host.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-bold text-matrix-primary">{matchData.host.name}</div>
                    <div className="text-xs text-matrix-light">Host</div>
                  </div>
                  {matchData.winnerId === matchData.hostId && <span className="ml-auto text-2xl">👑</span>}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-matrix-light">WPM:</span>
                    <span className="font-bold text-matrix-primary">{hostResult?.wpm || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-matrix-light">Accuracy:</span>
                    <span className="font-bold text-matrix-primary">{hostResult?.accuracy || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-matrix-light">Errors:</span>
                    <span className="font-bold text-error">{hostResult?.errors || 0}</span>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl border-2 ${matchData.winnerId === matchData.opponentId ? 'bg-green-500/10 border-green-500' : 'bg-matrix-primary/5 border-matrix-primary/20'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <ProfileImage 
                    src={matchData.opponent?.image} 
                    alt={matchData.opponent?.name || 'Opponent'}
                    fallbackText={matchData.opponent?.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-bold text-matrix-primary">{matchData.opponent?.name || 'Opponent'}</div>
                    <div className="text-xs text-matrix-light">Challenger</div>
                  </div>
                  {matchData.winnerId === matchData.opponentId && <span className="ml-auto text-2xl">👑</span>}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-matrix-light">WPM:</span>
                    <span className="font-bold text-matrix-primary">{opponentResultFinal?.wpm || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-matrix-light">Accuracy:</span>
                    <span className="font-bold text-matrix-primary">{opponentResultFinal?.accuracy || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-matrix-light">Errors:</span>
                    <span className="font-bold text-error">{opponentResultFinal?.errors || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <button
                onClick={() => router.push('/')}
                className="px-8 py-3 bg-matrix-primary text-matrix-bg font-bold rounded-lg hover:shadow-glow-hover transition-all"
              >
                Back to Home
              </button>
              <button
                onClick={() => router.push('/matches')}
                className="ml-4 px-8 py-3 border-2 border-matrix-primary text-matrix-primary font-bold rounded-lg hover:bg-matrix-primary hover:text-matrix-bg transition-all"
              >
                View Match History
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 p-4 bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-matrix-primary">Live Match</h2>
              <p className="text-sm text-matrix-light">{matchData.passageSource}</p>
            </div>

            <div className="flex gap-6">
              <div className="text-center p-3 bg-matrix-primary/10 rounded-lg border-2 border-matrix-primary">
                <div className="text-xs text-matrix-light mb-1">You</div>
                <div className="font-bold text-matrix-primary">
                  {isComplete ? `${liveWpm} WPM` : myResult?.isFinished ? `${myResult.wpm} WPM` : 'Typing...'}
                </div>
              </div>

              <div className="flex items-center text-2xl font-bold text-matrix-light">VS</div>

              <div className="text-center p-3 bg-matrix-primary/10 rounded-lg border-2 border-matrix-primary/30">
                <div className="text-xs text-matrix-light mb-1">
                  {isHost ? matchData.opponent?.name : matchData.host.name}
                </div>
                <div className="font-bold text-matrix-primary">
                  {opponentResult?.isFinished ? `${opponentResult.wpm} WPM` : 'Typing...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <TypingArea
          text={text}
          userInput={userInput}
          isComplete={isComplete}
          isDisabled={false}
          settings={settings}
        />

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

        <StatsDisplay wpm={liveWpm} accuracy={liveAccuracy} errors={errors} />

        {isComplete && !hasSubmitted && (
          <div className="mt-6 p-4 bg-matrix-primary/10 border border-matrix-primary rounded-lg text-center">
            <p className="text-matrix-primary animate-pulse">Submitting your result...</p>
          </div>
        )}

        {hasSubmitted && !opponentResult?.isFinished && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500 rounded-lg text-center">
            <p className="text-green-500 font-semibold">✓ Result submitted! Waiting for opponent...</p>
          </div>
        )}

        {!isComplete && (
          <div className="mt-6 text-center text-sm text-matrix-light/60 animate-pulse">
            Type to start the race...
          </div>
        )}
      </div>
    </div>
  )
}