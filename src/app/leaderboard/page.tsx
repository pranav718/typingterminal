"use client"

import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useAuth } from "../hooks/useAuth"
import { useState } from "react"
import ProfileImage from "../components/ProfileImage"
import "../terminal.css"

type LeaderboardCategory = "composite" | "wpm" | "accuracy"

export default function LeaderboardPage() {
  const { user, isLoading, isGuest, logout } = useAuth()
  const router = useRouter()
  const [category, setCategory] = useState<LeaderboardCategory>("composite")
  const [showAll, setShowAll] = useState(false)

  const leaderboard = useQuery(api.leaderboard.getLeaderboard, {
    limit: showAll ? 100 : 50,
    sortBy: category,
  })

  const userRank = useQuery(api.leaderboard.getUserRank, user ? {} : "skip")
  const globalStats = useQuery(api.leaderboard.getGlobalStats)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#00120b] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#41ff5f] border-t-transparent mb-4"></div>
          <p className="text-[#41ff5f] text-xl animate-pulse">LOADING RANKINGS...</p>
        </div>
      </div>
    )
  }

  const getCategoryIcon = (cat: LeaderboardCategory) => {
    switch (cat) {
      case "composite":
        return "🏆"
      case "wpm":
        return "⚡"
      case "accuracy":
        return "🎯"
    }
  }

  const getCategoryName = (cat: LeaderboardCategory) => {
    switch (cat) {
      case "composite":
        return "OVERALL SCORE"
      case "wpm":
        return "SPEED (WPM)"
      case "accuracy":
        return "ACCURACY"
    }
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return null
  }

  return (
    <div className="min-h-screen bg-[#00120b] text-[#41ff5f] font-mono relative overflow-hidden">
      {/* Scanline */}
      <div className="scanline" />

      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="grid-lines absolute inset-0" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 p-4 md:p-6">
        {/* HEADER */}
        <header className="terminal-window p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push("/")} className="terminal-btn text-sm" title="Back to Home">
                ← HOME
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-widest text-shadow-glow">GLOBAL RANKINGS</h1>
                <p className="text-[#7bff9a]/70 text-xs">LIVE LEADERBOARD DATA</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <div className="flex items-center gap-2 px-3 py-1 bg-[#003018]/50 border border-[#41ff5f30] rounded text-xs">
                  <ProfileImage
                    src={user.image}
                    alt={user.name || "User"}
                    fallbackText={user.name || user.email}
                    className="w-6 h-6 rounded-full border border-[#41ff5f60]"
                  />
                  <span className="truncate max-w-[120px]">{isGuest ? "GUEST" : user.email || user.name}</span>
                  {isGuest && <span className="px-2 py-0.5 bg-[#ff5f4180] text-[#ff5f41] rounded">GUEST</span>}
                </div>
              )}

              {user && (
                <button onClick={logout} className="px-3 py-1 border border-[#ff5f4180] text-[#ff5f41] rounded hover:bg-[#ff5f4120] text-xs">
                  LOGOUT
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Guest/Visitor Warning */}
        {isGuest && (
          <div className="terminal-window p-4 mb-6 border-[#41ff5f80]">
            <div className="flex items-start gap-3">
              <div>
                <div className="font-semibold text-[#41ff5f] mb-1">VIEWING AS GUEST</div>
                <div className="text-sm text-[#7bff9a]/80">Sign up to compete on the leaderboard and track your progress!</div>
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className="terminal-window p-4 mb-6 border-[#41ff5f80]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div>
                  <div className="font-semibold text-[#41ff5f] mb-1">VIEWING AS VISITOR</div>
                  <div className="text-sm text-[#7bff9a]/80">Sign up to compete on the leaderboard!</div>
                </div>
              </div>
              <button onClick={() => router.push("/")} className="terminal-btn text-sm whitespace-nowrap">
                SIGN UP NOW →
              </button>
            </div>
          </div>
        )}

        {/* Category Selector */}
        <div className="terminal-window p-4 mb-6">
          <div className="text-xs text-[#7bff9a]/60 mb-3 uppercase tracking-wider">SELECT RANKING MODE:</div>
          <div className="flex flex-wrap gap-2">
            {(["composite", "wpm", "accuracy"] as LeaderboardCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`terminal-tab ${category === cat ? "active" : ""}`}
              >
                <span className="mr-2">{getCategoryIcon(cat)}</span>
                {getCategoryName(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* User Rank Card */}
        {userRank && user && (
          <div className="terminal-window p-4 md:p-6 mb-6 border-[#41ff5f80] animate-slide-up">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <ProfileImage
                  src={user.image}
                  alt="Your profile"
                  fallbackText={user.name || user.email}
                  className="w-12 h-12 rounded-full border-2 border-[#41ff5f]"
                />
                <div>
                  <div className="text-xs text-[#7bff9a]/60">YOUR RANK</div>
                  <div className="text-lg font-bold text-[#41ff5f] text-shadow-glow">
                    {user.name || user.email?.split("@")[0] || "You"}
                  </div>
                </div>
              </div>

              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-[#41ff5f] text-shadow-glow">#{userRank.rank}</div>
                  <div className="text-xs text-[#7bff9a]/60">of {userRank.totalUsers}</div>
                </div>

                <div className="border-l border-[#41ff5f30] pl-6">
                  <div className="text-2xl md:text-3xl font-bold text-[#41ff5f] text-shadow-glow">{userRank.percentile}%</div>
                  <div className="text-xs text-[#7bff9a]/60">Percentile</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="terminal-window overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#003018]/30 border-b border-[#41ff5f30]">
                <tr className="text-[#41ff5f]">
                  <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">RANK</th>
                  <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">PLAYER</th>
                  <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">BEST WPM</th>
                  <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">ACCURACY</th>
                  {category === "composite" && (
                    <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">SCORE</th>
                  )}
                  <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">AVG WPM</th>
                  <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">SESSIONS</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard?.map((entry) => {
                  const isCurrentUser = user && entry.email === user.email
                  const medal = getMedalEmoji(entry.rank)

                  return (
                    <tr
                      key={entry.userId}
                      className={`border-t border-[#41ff5f10] transition-colors ${
                        isCurrentUser ? "bg-[#41ff5f20] hover:bg-[#41ff5f25]" : "hover:bg-[#003018]/20"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {medal && <span className="text-2xl">{medal}</span>}
                          <span className={`font-bold font-mono ${entry.rank <= 3 ? "text-[#41ff5f] text-shadow-glow" : "text-[#7bff9a]"}`}>
                            {!medal && `#${entry.rank}`}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ProfileImage
                            src={entry.image}
                            alt={entry.displayName}
                            fallbackText={entry.displayName}
                            className="w-8 h-8 rounded-full border border-[#41ff5f30]"
                          />
                          <div>
                            <div className={`font-medium ${isCurrentUser ? "text-[#41ff5f] font-bold" : "text-[#7bff9a]"}`}>
                              {entry.displayName}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-[#41ff5f] text-[#00120b] rounded">YOU</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-[#41ff5f] font-mono font-semibold">{entry.bestWpm}</span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-[#7bff9a] font-mono">{entry.bestAccuracy}%</span>
                      </td>

                      {category === "composite" && (
                        <td className="px-6 py-4 text-right">
                          <span className="text-[#41ff5f] font-bold font-mono">{entry.compositeScore.toFixed(1)}</span>
                        </td>
                      )}

                      <td className="px-6 py-4 text-right">
                        <span className="text-[#7bff9a]/70 font-mono text-sm">{entry.averageWpm}</span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-[#7bff9a]/50 text-sm font-mono">{entry.totalSessions}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {leaderboard?.map((entry) => {
              const isCurrentUser = user && entry.email === user.email
              const medal = getMedalEmoji(entry.rank)

              return (
                <div
                  key={entry.userId}
                  className={`p-4 border-b border-[#41ff5f10] ${
                    isCurrentUser ? "bg-[#41ff5f20]" : "hover:bg-[#003018]/20"
                  } transition-colors`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {medal ? (
                        <span className="text-2xl">{medal}</span>
                      ) : (
                        <span className="text-lg font-bold text-[#7bff9a] font-mono">#{entry.rank}</span>
                      )}

                      <ProfileImage
                        src={entry.image}
                        alt={entry.displayName}
                        fallbackText={entry.displayName}
                        className="w-10 h-10 rounded-full border border-[#41ff5f30]"
                      />

                      <div>
                        <div className={`font-medium ${isCurrentUser ? "text-[#41ff5f] font-bold" : "text-[#7bff9a]"}`}>
                          {entry.displayName}
                        </div>
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-0.5 bg-[#41ff5f] text-[#00120b] rounded">YOU</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#003018]/30 rounded p-2 border border-[#41ff5f20]">
                      <div className="text-xs text-[#7bff9a]/60">BEST WPM</div>
                      <div className="text-lg font-bold text-[#41ff5f] font-mono">{entry.bestWpm}</div>
                    </div>

                    <div className="bg-[#003018]/30 rounded p-2 border border-[#41ff5f20]">
                      <div className="text-xs text-[#7bff9a]/60">ACCURACY</div>
                      <div className="text-lg font-bold text-[#7bff9a] font-mono">{entry.bestAccuracy}%</div>
                    </div>

                    {category === "composite" && (
                      <div className="bg-[#003018]/30 rounded p-2 border border-[#41ff5f20]">
                        <div className="text-xs text-[#7bff9a]/60">SCORE</div>
                        <div className="text-lg font-bold text-[#41ff5f] font-mono">{entry.compositeScore.toFixed(1)}</div>
                      </div>
                    )}

                    <div className="bg-[#003018]/30 rounded p-2 border border-[#41ff5f20]">
                      <div className="text-xs text-[#7bff9a]/60">AVG WPM</div>
                      <div className="text-lg font-bold text-[#7bff9a]/70 font-mono">{entry.averageWpm}</div>
                    </div>

                    <div className="bg-[#003018]/30 rounded p-2 border border-[#41ff5f20]">
                      <div className="text-xs text-[#7bff9a]/60">SESSIONS</div>
                      <div className="text-lg font-bold text-[#7bff9a]/50 font-mono">{entry.totalSessions}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Empty State */}
          {leaderboard && leaderboard.length === 0 && (
            <div className="p-12 text-center text-[#7bff9a]/60">
              <div className="text-4xl mb-4">👾</div>
              <p>NO RANKINGS YET. BE THE FIRST TO COMPETE!</p>
            </div>
          )}

          {/* Loading State */}
          {!leaderboard && (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#41ff5f] border-t-transparent mb-4"></div>
              <p className="text-[#41ff5f] animate-pulse">LOADING LEADERBOARD...</p>
            </div>
          )}
        </div>

        {/* Show All Button */}
        {leaderboard && leaderboard.length >= 50 && !showAll && (
          <div className="mt-6 text-center">
            <button onClick={() => setShowAll(true)} className="terminal-btn">
              SHOW ALL RANKINGS
            </button>
          </div>
        )}

        {/* Global Stats Footer */}
        {globalStats && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="terminal-window p-4 text-center">
              <div className="text-2xl font-bold text-[#41ff5f] mb-1 text-shadow-glow font-mono">
                {globalStats.totalUsers.toLocaleString()}
              </div>
              <div className="text-xs text-[#7bff9a]/60 uppercase tracking-wider">Total Typists</div>
            </div>

            <div className="terminal-window p-4 text-center">
              <div className="text-2xl font-bold text-[#41ff5f] mb-1 text-shadow-glow font-mono">
                {globalStats.totalSessions.toLocaleString()}
              </div>
              <div className="text-xs text-[#7bff9a]/60 uppercase tracking-wider">Total Sessions</div>
            </div>

            <div className="terminal-window p-4 text-center">
              <div className="text-2xl font-bold text-[#41ff5f] mb-1 text-shadow-glow font-mono">{globalStats.averageWpm}</div>
              <div className="text-xs text-[#7bff9a]/60 uppercase tracking-wider">Average WPM</div>
            </div>

            <div className="terminal-window p-4 text-center">
              <div className="text-2xl font-bold text-[#41ff5f] mb-1 text-shadow-glow font-mono">{globalStats.averageAccuracy}%</div>
              <div className="text-xs text-[#7bff9a]/60 uppercase tracking-wider">Average Accuracy</div>
            </div>

            <div className="terminal-window p-4 text-center">
              <div className="text-2xl font-bold text-[#41ff5f] mb-1 text-shadow-glow font-mono">{globalStats.highestWpm}</div>
              <div className="text-xs text-[#7bff9a]/60 uppercase tracking-wider">Highest WPM</div>
            </div>

            <div className="terminal-window p-4 text-center">
              <div className="text-2xl font-bold text-[#41ff5f] mb-1 text-shadow-glow font-mono">{globalStats.highestAccuracy}%</div>
              <div className="text-xs text-[#7bff9a]/60 uppercase tracking-wider">Best Accuracy</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}