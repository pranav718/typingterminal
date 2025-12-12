"use client"

import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import ProfileImage from "./ProfileImage"

type LeaderboardCategory = "composite" | "wpm" | "accuracy"

export default function Leaderboard() {
  const [category, setCategory] = useState<LeaderboardCategory>("composite")
  const [showAll, setShowAll] = useState(false)
  const { user } = useAuth()

  const leaderboard = useQuery(api.leaderboard.getLeaderboard, {
    limit: showAll ? 5000 : 50,
    sortBy: category
  })
  
  const userRank = useQuery(
    api.leaderboard.getUserRank,
    user ? {} : "skip"
  )

  const getCategoryIcon = (cat: LeaderboardCategory) => {
    switch (cat) {
      case "composite": return "🏆"
      case "wpm": return "⚡️"
      case "accuracy": return "🎯"
    }
  }

  const getCategoryName = (cat: LeaderboardCategory) => {
    switch (cat) {
      case "composite": return "Overall Score"
      case "wpm": return "Speed (WPM)"
      case "accuracy": return "Accuracy"
    }
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-matrix-primary mb-2 drop-shadow-glow">
          📊 Leaderboard
        </h2>
        <p className="text-matrix-light">
          {user ? "Compete with typists worldwide" : "See the best typists worldwide"}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6">
        {(["composite", "wpm", "accuracy"] as LeaderboardCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold transition-all ${
              category === cat
                ? "bg-matrix-primary text-matrix-bg shadow-glow"
                : "border-2 border-matrix-primary/30 text-matrix-primary hover:border-matrix-primary hover:bg-matrix-primary/10"
            }`}
          >
            <span className="text-lg mr-2">{getCategoryIcon(cat)}</span>
            <span className="hidden md:inline">{getCategoryName(cat)}</span>
            <span className="md:hidden">{cat.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {userRank && user && (
        <div className="mb-6 p-4 md:p-6 bg-gradient-to-br from-matrix-primary/20 to-matrix-primary/10 border-2 border-matrix-primary rounded-xl animate-slide-up">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <ProfileImage 
                  src={user.image} 
                  alt={user.name || user.email || "You"}
                  fallbackText={user.name || user.email}
                  className="w-12 h-12 rounded-full"
                />
              <div>
                <div className="text-sm text-matrix-light">Your Rank</div>
                <div className="text-xl font-bold text-matrix-primary">
                  {user.name || user.email?.split("@")[0] || "You"}
                </div>
              </div>
            </div>

            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-matrix-primary">
                  #{userRank.rank}
                </div>
                <div className="text-xs text-matrix-light">
                  of {userRank.totalUsers}
                </div>
              </div>

              <div className="border-l border-matrix-primary/30 pl-6">
                <div className="text-2xl md:text-3xl font-bold text-matrix-primary">
                  {userRank.percentile}%
                </div>
                <div className="text-xs text-matrix-light">
                  Percentile
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-matrix-bg-darker border-2 border-matrix-primary/20 rounded-xl overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-matrix-primary/10 sticky top-0">
              <tr className="text-matrix-primary">
                <th className="px-6 py-4 text-left font-semibold">Rank</th>
                <th className="px-6 py-4 text-left font-semibold">Player</th>
                <th className="px-6 py-4 text-right font-semibold">Best WPM</th>
                <th className="px-6 py-4 text-right font-semibold">Accuracy</th>
                {category === "composite" && (
                  <th className="px-6 py-4 text-right font-semibold">Score</th>
                )}
                <th className="px-6 py-4 text-right font-semibold">Avg WPM</th>
                <th className="px-6 py-4 text-right font-semibold">Sessions</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard?.map((entry, idx) => {
                const isCurrentUser = user && entry.email === user.email
                const medal = getMedalEmoji(entry.rank)

                return (
                  <tr
                    key={entry.userId}
                    className={`border-t border-matrix-primary/10 transition-colors ${
                      isCurrentUser
                        ? "bg-matrix-primary/20 hover:bg-matrix-primary/25"
                        : "hover:bg-matrix-primary/5"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {medal && <span className="text-2xl">{medal}</span>}
                        <span className={`font-bold ${
                          entry.rank <= 3 ? "text-matrix-primary" : "text-matrix-light"
                        }`}>
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
                        />
                        <div>
                          <div className={`font-medium ${
                            isCurrentUser ? "text-matrix-primary font-bold" : "text-matrix-light"
                          }`}>
                            {entry.displayName}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-matrix-primary text-matrix-bg rounded">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="text-matrix-primary font-mono font-semibold">
                        {entry.bestWpm}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="text-matrix-light font-mono">
                        {entry.bestAccuracy}%
                      </span>
                    </td>

                    {category === "composite" && (
                      <td className="px-6 py-4 text-right">
                        <span className="text-matrix-primary font-bold font-mono">
                          {entry.compositeScore.toFixed(1)}
                        </span>
                      </td>
                    )}

                    <td className="px-6 py-4 text-right">
                      <span className="text-matrix-light/70 font-mono text-sm">
                        {entry.averageWpm}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="text-matrix-light/50 text-sm">
                        {entry.totalSessions}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          {leaderboard?.map((entry) => {
            const isCurrentUser = user && entry.email === user.email
            const medal = getMedalEmoji(entry.rank)

            return (
              <div
                key={entry.userId}
                className={`p-4 border-b border-matrix-primary/10 ${
                  isCurrentUser
                    ? "bg-matrix-primary/20"
                    : "hover:bg-matrix-primary/5"
                } transition-colors`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {medal ? (
                      <span className="text-2xl">{medal}</span>
                    ) : (
                      <span className="text-lg font-bold text-matrix-light">
                        #{entry.rank}
                      </span>
                    )}

                    <ProfileImage 
                      src={entry.image} 
                      alt={entry.displayName}
                      fallbackText={entry.displayName}
                      className="w-10 h-10 rounded-full"
                    />

                    <div>
                      <div className={`font-medium ${
                        isCurrentUser ? "text-matrix-primary font-bold" : "text-matrix-light"
                      }`}>
                        {entry.displayName}
                      </div>
                      {isCurrentUser && (
                        <span className="text-xs px-2 py-0.5 bg-matrix-primary text-matrix-bg rounded">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-matrix-primary/5 rounded-lg p-2">
                    <div className="text-xs text-matrix-light/60 mb-1">Best WPM</div>
                    <div className="text-lg font-bold text-matrix-primary font-mono">
                      {entry.bestWpm}
                    </div>
                  </div>

                  <div className="bg-matrix-primary/5 rounded-lg p-2">
                    <div className="text-xs text-matrix-light/60 mb-1">Accuracy</div>
                    <div className="text-lg font-bold text-matrix-light font-mono">
                      {entry.bestAccuracy}%
                    </div>
                  </div>

                  {category === "composite" && (
                    <div className="bg-matrix-primary/5 rounded-lg p-2">
                      <div className="text-xs text-matrix-light/60 mb-1">Score</div>
                      <div className="text-lg font-bold text-matrix-primary font-mono">
                        {entry.compositeScore.toFixed(1)}
                      </div>
                    </div>
                  )}

                  <div className="bg-matrix-primary/5 rounded-lg p-2">
                    <div className="text-xs text-matrix-light/60 mb-1">Avg WPM</div>
                    <div className="text-lg font-bold text-matrix-light/70 font-mono">
                      {entry.averageWpm}
                    </div>
                  </div>

                  <div className="bg-matrix-primary/5 rounded-lg p-2">
                    <div className="text-xs text-matrix-light/60 mb-1">Sessions</div>
                    <div className="text-lg font-bold text-matrix-light/50">
                      {entry.totalSessions}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {leaderboard && leaderboard.length === 0 && (
          <div className="p-12 text-center text-matrix-light/60">
            <div className="text-4xl mb-4">👾</div>
            <p>No rankings yet. Be the first to compete!</p>
          </div>
        )}

        {!leaderboard && (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-matrix-primary border-t-transparent mb-4"></div>
            <p className="text-matrix-primary animate-pulse">Loading leaderboard...</p>
          </div>
        )}
      </div>

      {leaderboard && leaderboard.length >= 50 && !showAll && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-3 border-2 border-matrix-primary text-matrix-primary rounded-lg hover:bg-matrix-primary hover:text-matrix-bg transition-all font-semibold"
          >
            Show All Rankings
          </button>
        </div>
      )}
      <GlobalStatsFooter />
    </div>
  )
}

function GlobalStatsFooter() {
  const globalStats = useQuery(api.leaderboard.getGlobalStats)

  if (!globalStats) return null

  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="p-4 bg-matrix-primary/5 border border-matrix-primary/20 rounded-lg text-center">
        <div className="text-2xl font-bold text-matrix-primary mb-1">
          {globalStats.totalUsers.toLocaleString()}
        </div>
        <div className="text-xs text-matrix-light">Total Typists</div>
      </div>

      <div className="p-4 bg-matrix-primary/5 border border-matrix-primary/20 rounded-lg text-center">
        <div className="text-2xl font-bold text-matrix-primary mb-1">
          {globalStats.totalSessions.toLocaleString()}
        </div>
        <div className="text-xs text-matrix-light">Total Sessions</div>
      </div>

      <div className="p-4 bg-matrix-primary/5 border border-matrix-primary/20 rounded-lg text-center">
        <div className="text-2xl font-bold text-matrix-primary mb-1">
          {globalStats.averageWpm}
        </div>
        <div className="text-xs text-matrix-light">Average WPM</div>
      </div>

      <div className="p-4 bg-matrix-primary/5 border border-matrix-primary/20 rounded-lg text-center">
        <div className="text-2xl font-bold text-matrix-primary mb-1">
          {globalStats.averageAccuracy}%
        </div>
        <div className="text-xs text-matrix-light">Average Accuracy</div>
      </div>

      <div className="p-4 bg-matrix-primary/5 border border-matrix-primary/20 rounded-lg text-center">
        <div className="text-2xl font-bold text-matrix-primary mb-1">
          {globalStats.highestWpm}
        </div>
        <div className="text-xs text-matrix-light">Highest WPM</div>
      </div>

      <div className="p-4 bg-matrix-primary/5 border border-matrix-primary/20 rounded-lg text-center">
        <div className="text-2xl font-bold text-matrix-primary mb-1">
          {globalStats.highestAccuracy}%
        </div>
        <div className="text-xs text-matrix-light">Best Accuracy</div>
      </div>
    </div>
  )
}