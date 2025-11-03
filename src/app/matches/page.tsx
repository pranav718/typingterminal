'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAuth } from '../hooks/useAuth'
import AuthModal from '../components/Auth/AuthModal'
import '../terminal.css'

export default function MatchesPage() {
  const { user, isLoading, isGuest } = useAuth()
  const router = useRouter()

  const myMatches = useQuery(api.matches.getMyMatches)
  const matchHistory = useQuery(api.matches.getMatchHistory, { limit: 50 })

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg flex items-center justify-center p-4 md:p-8">
        <AuthModal />
      </div>
    )
  }

  if (isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-warning/10 border-2 border-warning rounded-xl p-8">
            <h2 className="text-2xl font-bold text-warning mb-4">Sign Up Required</h2>
            <p className="text-matrix-light mb-6">Please create an account to participate in matches</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-matrix-primary text-matrix-bg font-bold rounded-lg"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    )
  }

  const activeMatches = myMatches?.filter(m => m.status === 'waiting' || m.status === 'in_progress') || []
  const completedMatches = matchHistory || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 border-2 border-matrix-primary/30 text-matrix-primary rounded-md hover:border-matrix-primary hover:bg-matrix-primary/10 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-matrix-primary">My Matches</h1>
          </div>
        </div>

        {activeMatches.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-matrix-primary mb-4 flex items-center gap-2">
              <span>⚔️</span>
              Active Matches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMatches.map(match => {
                const isHost = user && match.hostId === user._id
                const won = user && match.winnerId === user._id
                const opponent = isHost ? match.opponent : match.host

                return (
                  <div
                    key={match._id}
                    className="bg-matrix-primary/5 border-2 border-matrix-primary/30 rounded-xl p-6 hover:border-matrix-primary hover:bg-matrix-primary/10 transition-all cursor-pointer"
                    onClick={() => router.push(`/match/${match._id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm text-matrix-light mb-1">
                          {match.status === 'waiting' ? '⏳ Waiting' : '🏁 In Progress'}
                        </div>
                        <div className="font-bold text-matrix-primary">{match.passageSource}</div>
                      </div>
                      {match.status === 'waiting' && isHost && (
                        <div className="px-3 py-1 bg-matrix-primary/20 rounded font-mono text-matrix-primary font-bold">
                          {match.inviteCode}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {match.host.image && (
                          <img src={match.host.image} alt={match.host.name} className="w-8 h-8 rounded-full" />
                        )}
                        <span className="text-sm text-matrix-light">{match.host.name}</span>
                      </div>
                      <span className="text-matrix-light">vs</span>
                      {opponent ? (
                        <div className="flex items-center gap-2">
                          {opponent.image && (
                            <img src={opponent.image} alt={opponent.name} className="w-8 h-8 rounded-full" />
                          )}
                          <span className="text-sm text-matrix-light">{opponent.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-matrix-light/50 italic">Waiting...</span>
                      )}
                    </div>

                    <button className="w-full px-4 py-2 border-2 border-matrix-primary text-matrix-primary rounded-lg hover:bg-matrix-primary hover:text-matrix-bg transition-all font-semibold">
                      {match.status === 'waiting' ? 'View Invite' : 'Join Match →'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-matrix-primary mb-4 flex items-center gap-2">
            <span>📜</span>
            Match History
          </h2>

          {completedMatches.length === 0 ? (
            <div className="bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-matrix-light text-lg mb-2">No matches played yet</p>
              <p className="text-matrix-light/60 text-sm">Challenge a friend to start competing!</p>
              <button
                onClick={() => router.push('/')}
                className="mt-6 px-6 py-3 bg-matrix-primary text-matrix-bg font-bold rounded-lg hover:shadow-glow-hover transition-all"
              >
                Go to Homepage
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {completedMatches.map(match => {
                const isHost = match.hostId === user?._id
                const won = match.winnerId === user?._id
                const hostResult = match.results?.find(r => r.userId === match.hostId)
                const opponentResult = match.results?.find(r => r.userId === match.opponentId)

                return (
                  <div
                    key={match._id}
                    className={`bg-gradient-to-r p-6 rounded-xl border-2 transition-all ${
                      won
                        ? 'from-green-500/10 to-green-500/5 border-green-500/30'
                        : 'from-red-500/10 to-red-500/5 border-red-500/30'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{won ? '🏆' : '😔'}</span>
                          <span className="font-bold text-matrix-primary">
                            {won ? 'Victory' : 'Defeat'}
                          </span>
                          <div className="text-sm text-matrix-light">{match.passageSource}</div>
                        </div>
                        <div className="text-xs text-matrix-light/60">
                          {new Date(match.completedAt || 0).toLocaleDateString()} at{' '}
                          {new Date(match.completedAt || 0).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg ${match.winnerId === match.hostId ? 'bg-green-500/10 border border-green-500/30' : 'bg-matrix-primary/5'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          {match.host.image && (
                            <img src={match.host.image} alt={match.host.name} className="w-8 h-8 rounded-full" />
                          )}
                          <div>
                            <div className="font-semibold text-matrix-primary text-sm">{match.host.name}</div>
                            <div className="text-xs text-matrix-light">Host</div>
                          </div>
                          {match.winnerId === match.hostId && <span className="ml-auto">👑</span>}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-matrix-light">WPM:</span>
                            <span className="font-bold text-matrix-primary">{hostResult?.wpm || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-matrix-light">Accuracy:</span>
                            <span className="font-bold text-matrix-primary">{hostResult?.accuracy || 0}%</span>
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg ${match.winnerId === match.opponentId ? 'bg-green-500/10 border border-green-500/30' : 'bg-matrix-primary/5'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          {match.opponent?.image && (
                            <img src={match.opponent.image} alt={match.opponent.name} className="w-8 h-8 rounded-full" />
                          )}
                          <div>
                            <div className="font-semibold text-matrix-primary text-sm">{match.opponent?.name}</div>
                            <div className="text-xs text-matrix-light">Challenger</div>
                          </div>
                          {match.winnerId === match.opponentId && <span className="ml-auto">👑</span>}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-matrix-light">WPM:</span>
                            <span className="font-bold text-matrix-primary">{opponentResult?.wpm || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-matrix-light">Accuracy:</span>
                            <span className="font-bold text-matrix-primary">{opponentResult?.accuracy || 0}%</span>
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