"use client"

import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/useAuth"
import ProfileImage from "./ProfileImage"

export default function TopPerformers() {
  const topPerformers = useQuery(api.leaderboard.getTopPerformers)
  const router = useRouter()
  const { isGuest, user } = useAuth()

  if (!topPerformers) {
    return (
      <div className="mt-16 p-8 bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-matrix-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  const renderTopThree = (title: string, performers: any[], metric: string) => (
    <div className="bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl p-6">
      <h3 className="text-xl font-bold text-matrix-primary mb-4 flex items-center gap-2">
        {title}
      </h3>

      {performers.length === 0 ? (
        <p className="text-matrix-light/60 text-sm text-center py-4">No data yet</p>
      ) : (
        <div className="space-y-3">
          {performers.map((performer, idx) => (
            <div
              key={performer.userId}
              className="flex items-center justify-between p-3 bg-matrix-primary/10 rounded-lg hover:bg-matrix-primary/15 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                </span>
                <ProfileImage 
                  src={performer.image} 
                  alt={performer.displayName}
                  fallbackText={performer.displayName}
                />
                <span className="text-matrix-light font-medium truncate max-w-[120px]">
                  {performer.displayName}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-matrix-primary font-mono">
                  {metric === 'wpm' && performer.bestWpm}
                  {metric === 'accuracy' && `${performer.bestAccuracy}%`}
                  {metric === 'score' && performer.compositeScore.toFixed(1)}
                  {metric === 'sessions' && performer.totalSessions}
                </div>
                <div className="text-xs text-matrix-light/60">
                  {metric === 'wpm' && 'WPM'}
                  {metric === 'accuracy' && 'Accuracy'}
                  {metric === 'score' && 'Score'}
                  {metric === 'sessions' && 'Sessions'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-matrix-primary flex items-center gap-2">
            <span>🌟</span>
            Top Performers
          </h2>
          {isGuest && (
            <p className="text-sm text-matrix-light/60 mt-1">
              Sign up to compete for a spot on the leaderboard!
            </p>
          )}
        </div>
        <button
          onClick={() => router.push("/leaderboard")}
          className="px-4 py-2 border-2 border-matrix-primary text-matrix-primary rounded-lg hover:bg-matrix-primary hover:text-matrix-bg transition-all font-semibold text-sm"
        >
          View Full Leaderboard →
        </button>
      </div>
      
      {isGuest && (
        <div className="mb-6 p-4 bg-cyan-500/10 border-2 border-cyan-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="font-semibold text-cyan-400 mb-1">Compete for Glory!</div>
              <div className="text-sm text-matrix-light">
                Create an account to track your stats and appear on the leaderboard. Challenge yourself to reach the top!
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderTopThree("⚡ Fastest Typists", topPerformers.fastestTypers, "wpm")}
        {renderTopThree("🎯 Most Accurate", topPerformers.mostAccurate, "accuracy")}
        {renderTopThree("🏆 Overall Best", topPerformers.topOverall, "score")}
        {renderTopThree("💪 Most Dedicated", topPerformers.mostDedicated, "sessions")}
      </div>
    </div>
  )
}