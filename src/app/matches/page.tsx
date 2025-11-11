'use client'

import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAuth } from '../hooks/useAuth'
import AuthModal from '../components/Auth/AuthModal'
import ProfileImage from '../components/ProfileImage'
import { Id } from '../../../convex/_generated/dataModel'
import { useState } from 'react'
import '../terminal.css'

export default function MatchesPage() {
  const { user, isLoading, isGuest, logout } = useAuth()
  const router = useRouter()

  const myMatches = useQuery(api.matches.getMyMatches)
  const matchHistory = useQuery(api.matches.getMatchHistory, { limit: 50 })
  const cancelMatch = useMutation(api.matches.cancelMatch)

  const [cancellingMatchId, setCancellingMatchId] = useState<Id<"matches"> | null>(null)

  const handleCancelMatch = async (matchId: Id<"matches">) => {
    if (!confirm('TERMINATE MATCH SESSION?')) return

    setCancellingMatchId(matchId)

    try {
      await cancelMatch({ matchId })
    } catch (error: any) {
      console.error('Failed to cancel match:', error)
      alert(`ERROR: ${error.message || 'Failed to cancel match'}`)
    } finally {
      setCancellingMatchId(null)
    }
  }

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-[#00120b] flex items-center justify-center p-4 md:p-8">
        <AuthModal />
      </div>
    )
  }

  if (isGuest) {
    return (
      <div className="min-h-screen bg-[#00120b] text-[#41ff5f] font-mono relative overflow-hidden">
        <div className="scanline" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="grid-lines absolute inset-0" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 p-6">
          <div className="terminal-window p-8 border-[#ff5f4180]">
            <h2 className="text-2xl font-bold text-[#ff5f41] mb-4 text-shadow-glow">⚠️ ACCESS DENIED</h2>
            <p className="text-[#7bff9a]/80 mb-6">GUEST MODE DOES NOT HAVE MATCH PRIVILEGES</p>
            <button
              onClick={() => router.push('/')}
              className="terminal-btn"
            >
              RETURN TO HOME
            </button>
          </div>
        </div>
      </div>
    )
  }

  const activeMatches = myMatches?.filter(m => m.status === 'waiting' || m.status === 'in_progress') || []
  const completedMatches = matchHistory || []

  return (
    <div className="min-h-screen bg-[#00120b] text-[#41ff5f] font-mono relative overflow-hidden">
      {/* Scanline */}
      <div className="scanline" />

      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="grid-lines absolute inset-0" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 p-4 md:p-6">
        {/* HEADER */}
        <header className="terminal-window p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="terminal-btn text-sm"
              >
                ← HOME
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-widest text-shadow-glow">
                  MATCH TERMINAL
                </h1>
                <p className="text-[#7bff9a]/70 text-xs">BATTLE HISTORY & ACTIVE SESSIONS</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <div className="text-xs px-3 py-1 bg-[#003018]/50 border border-[#41ff5f30] rounded">
                  {user.email}
                </div>
              )}

              <button
                onClick={logout}
                className="px-3 py-1 border border-[#ff5f4180] text-[#ff5f41] rounded hover:bg-[#ff5f4120] text-xs"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </header>

        {/* ACTIVE MATCHES */}
        {activeMatches.length > 0 && (
          <div className="mb-12">
            <div className="terminal-window p-4 mb-4">
              <h2 className="text-lg font-bold text-[#41ff5f] text-shadow-glow flex items-center gap-2">
                <span>⚔️</span>
                ACTIVE MATCHES
                <span className="ml-2 px-2 py-0.5 bg-[#41ff5f20] text-[#41ff5f] text-xs rounded font-mono">
                  {activeMatches.length}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMatches.map(match => {
                const isHost = user && match.hostId === user._id
                const opponent = isHost ? match.opponent : match.host
                const canCancel = isHost && match.status === 'waiting'
                const isCancelling = cancellingMatchId === match._id

                return (
                  <div
                    key={match._id}
                    className="terminal-window p-4 relative"
                  >
                    {/* Cancel Button */}
                    {canCancel && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCancelMatch(match._id)
                        }}
                        disabled={isCancelling}
                        className="absolute top-3 right-3 w-7 h-7 rounded border border-[#ff5f4180] text-[#ff5f41] hover:bg-[#ff5f4120] transition-all flex items-center justify-center disabled:opacity-50 text-sm"
                        title="Cancel match"
                      >
                        {isCancelling ? '...' : '✕'}
                      </button>
                    )}

                    <div className="mb-3 pr-8">
                      <div className="text-xs text-[#7bff9a]/60 mb-1 uppercase tracking-wider">
                        {match.status === 'waiting' ? 'WAITING FOR OPPONENT' : 'MATCH IN PROGRESS'}
                      </div>
                      <div className="font-bold text-[#41ff5f] text-sm">{match.passageSource}</div>
                    </div>

                    {match.status === 'waiting' && isHost && (
                      <div className="mb-3 p-2 bg-[#003018]/30 border border-[#41ff5f30] rounded">
                        <div className="text-xs text-[#7bff9a]/60 mb-1">INVITE CODE:</div>
                        <div className="font-mono text-xl text-[#41ff5f] text-shadow-glow tracking-widest">
                          {match.inviteCode}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <ProfileImage 
                          src={match.host.image} 
                          alt={match.host.name} 
                          fallbackText={match.host.name}
                          className="w-6 h-6 rounded-full border border-[#41ff5f30]"
                        />
                        <span className="text-[#7bff9a]">{match.host.name}</span>
                      </div>
                      <span className="text-[#7bff9a]/40">VS</span>
                      {opponent ? (
                        <div className="flex items-center gap-2">
                          <ProfileImage 
                            src={opponent.image} 
                            alt={opponent.name}
                            fallbackText={opponent.name}
                            className="w-6 h-6 rounded-full border border-[#41ff5f30]"
                          />
                          <span className="text-[#7bff9a]">{opponent.name}</span>
                        </div>
                      ) : (
                        <span className="text-[#7bff9a]/40 italic animate-pulse">WAITING...</span>
                      )}
                    </div>

                    <button
                      onClick={() => router.push(`/match/${match._id}`)}
                      className="w-full terminal-btn text-sm"
                    >
                      {match.status === 'waiting' 
                        ? (canCancel ? 'VIEW INVITE CODE' : 'WAITING TO START') 
                        : 'ENTER MATCH →'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* MATCH HISTORY */}
        <div>
          <div className="terminal-window p-4 mb-4">
            <h2 className="text-lg font-bold text-[#41ff5f] text-shadow-glow flex items-center gap-2">
              <span>📜</span>
              MATCH HISTORY
              {completedMatches.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-[#41ff5f20] text-[#41ff5f] text-xs rounded font-mono">
                  {completedMatches.length}
                </span>
              )}
            </h2>
          </div>

          {completedMatches.length === 0 ? (
            <div className="terminal-window p-12 text-center">
              <div className="text-6xl mb-4"></div>
              <p className="text-[#7bff9a]/80 text-lg mb-2">NO MATCHES FOUND</p>
              <p className="text-[#7bff9a]/60 text-sm mb-6">CHALLENGE A FRIEND TO START COMPETING</p>
              <button
                onClick={() => router.push('/')}
                className="terminal-btn"
              >
                RETURN TO HOME
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {completedMatches.map(match => {
                const won = user && match.winnerId === user._id
                const hostResult = match.results?.find(r => r.userId === match.hostId)
                const opponentResult = match.results?.find(r => r.userId === match.opponentId)

                return (
                  <div
                    key={match._id}
                    className={`terminal-window p-6 ${
                      won
                        ? 'border-[#41ff5f80] bg-[#41ff5f08]'
                        : 'border-[#ff5f4180] bg-[#ff5f4108]'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold text-lg ${won ? 'text-[#41ff5f]' : 'text-[#ff5f41]'}`}>
                            {won ? 'VICTORY' : 'DEFEAT'}
                          </span>
                        </div>
                        <div className="text-sm text-[#7bff9a]/80">{match.passageSource}</div>
                        <div className="text-xs text-[#7bff9a]/60 mt-1 font-mono">
                          {new Date(match.completedAt || 0).toLocaleDateString()} • {' '}
                          {new Date(match.completedAt || 0).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Host Result */}
                      <div className={`p-4 rounded border ${
                        match.winnerId === match.hostId 
                          ? 'bg-[#41ff5f10] border-[#41ff5f30]' 
                          : 'bg-[#003018]/20 border-[#41ff5f20]'
                      }`}>
                        <div className="flex items-center gap-2 mb-3">
                          <ProfileImage 
                            src={match.host.image} 
                            alt={match.host.name}
                            fallbackText={match.host.name}
                            className="w-8 h-8 rounded-full border border-[#41ff5f30]"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-[#41ff5f] text-sm">{match.host.name}</div>
                            <div className="text-xs text-[#7bff9a]/60">HOST</div>
                          </div>
                          {match.winnerId === match.hostId && <span className="text-xl">👑</span>}
                        </div>
                        <div className="space-y-1 text-sm font-mono">
                          <div className="flex justify-between">
                            <span className="text-[#7bff9a]/70">WPM:</span>
                            <span className="font-bold text-[#41ff5f]">{hostResult?.wpm || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#7bff9a]/70">ACC:</span>
                            <span className="font-bold text-[#41ff5f]">{hostResult?.accuracy || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#7bff9a]/70">ERR:</span>
                            <span className="font-bold text-[#ff5f41]">{hostResult?.errors || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Opponent Result */}
                      <div className={`p-4 rounded border ${
                        match.winnerId === match.opponentId 
                          ? 'bg-[#41ff5f10] border-[#41ff5f30]' 
                          : 'bg-[#003018]/20 border-[#41ff5f20]'
                      }`}>
                        <div className="flex items-center gap-2 mb-3">
                          <ProfileImage 
                            src={match.opponent?.image} 
                            alt={match.opponent?.name || 'Opponent'}
                            fallbackText={match.opponent?.name}
                            className="w-8 h-8 rounded-full border border-[#41ff5f30]"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-[#41ff5f] text-sm">{match.opponent?.name}</div>
                            <div className="text-xs text-[#7bff9a]/60">CHALLENGER</div>
                          </div>
                          {match.winnerId === match.opponentId && <span className="text-xl">👑</span>}
                        </div>
                        <div className="space-y-1 text-sm font-mono">
                          <div className="flex justify-between">
                            <span className="text-[#7bff9a]/70">WPM:</span>
                            <span className="font-bold text-[#41ff5f]">{opponentResult?.wpm || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#7bff9a]/70">ACC:</span>
                            <span className="font-bold text-[#41ff5f]">{opponentResult?.accuracy || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#7bff9a]/70">ERR:</span>
                            <span className="font-bold text-[#ff5f41]">{opponentResult?.errors || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}