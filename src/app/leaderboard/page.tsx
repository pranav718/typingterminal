"use client"

import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useAuth } from "../hooks/useAuth"
import { useState } from "react"
import ProfileImage from "../components/ProfileImage"
import "../terminal.css"

type LeaderboardCategory = "composite" | "wpm" | "accuracy"
type TimeRange = "daily" | "weekly" | "monthly" | "all_time"

export default function LeaderboardPage() {
  const { user, isLoading, isGuest, logout } = useAuth()
  const router = useRouter()
  
  const [category, setCategory] = useState<LeaderboardCategory>("composite")
  const [timeRange, setTimeRange] = useState<TimeRange>("all_time")
  const [showAll, setShowAll] = useState(false)

  const leaderboard = useQuery(api.leaderboard.getLeaderboard, {
    limit: showAll ? 100 : 50,
    sortBy: category,
    timeRange: timeRange,
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

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case "daily": return "TODAY"
      case "weekly": return "THIS WEEK"
      case "monthly": return "THIS MONTH"
      case "all_time": return "ALL TIME"
    }
  }

  return (
    <div className="min-h-screen bg-[#00120b] text-[#41ff5f] font-mono relative overflow-hidden">
      <div className="scanline" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="grid-lines absolute inset-0" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 p-4 md:p-6">
        <header className="terminal-window p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push("/")} className="terminal-btn text-sm" title="Back to Home">
                &lt; 
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

        <div className="terminal-window p-4 mb-6 space-y-4">
          <div>
            <div className="text-xs text-[#7bff9a]/60 mb-2 uppercase tracking-wider">TIME PERIOD:</div>
            <div className="flex flex-wrap gap-2">
              {(["daily", "weekly", "monthly", "all_time"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`terminal-tab text-xs font-bold ${timeRange === range ? "active" : ""}`}
                >
                  {getTimeRangeLabel(range)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#7bff9a]/60 mb-2 uppercase tracking-wider">SORT METRIC:</div>
            <div className="flex flex-wrap gap-2">
              {(["composite", "wpm", "accuracy"] as LeaderboardCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`terminal-tab text-xs font-bold ${category === cat ? "active" : ""}`}
                >
                  {getCategoryName(cat)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {userRank && user && timeRange === "all_time" && (
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
                  <div className="text-xs text-[#7bff9a]/60">YOUR ALL-TIME RANK</div>
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

        <div className="terminal-window overflow-hidden mb-6">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#003018]/30 border-b border-[#41ff5f30]">
                <tr className="text-[#41ff5f]">
                  <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">RANK</th>
                  <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">PLAYER</th>
                  <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">
                    {timeRange === 'all_time' ? 'BEST WPM' : 'MAX WPM'}
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">
                    {timeRange === 'all_time' ? 'BEST ACC' : 'MAX ACC'}
                  </th>
                  {category === "composite" && (
                    <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">SCORE</th>
                  )}
                  {timeRange === 'all_time' && (
                    <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">AVG WPM</th>
                  )}
                  <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">SESSIONS</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard?.map((entry) => {
                  const isCurrentUser = user && entry.email === user.email

                  return (
                    <tr
                      key={entry.userId}
                      className={`border-t border-[#41ff5f10] transition-colors ${
                        isCurrentUser ? "bg-[#41ff5f20] hover:bg-[#41ff5f25]" : "hover:bg-[#003018]/20"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className={`font-bold font-mono ${entry.rank <= 3 ? "text-[#41ff5f] text-shadow-glow text-lg" : "text-[#7bff9a]"}`}>
                          #{entry.rank}
                        </span>
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

                      {timeRange === 'all_time' && (
                        <td className="px-6 py-4 text-right">
                          <span className="text-[#7bff9a]/70 font-mono text-sm">{entry.averageWpm}</span>
                        </td>
                      )}

                      <td className="px-6 py-4 text-right">
                        <span className="text-[#7bff9a]/50 text-sm font-mono">{entry.totalSessions}</span>
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

              return (
                <div
                  key={entry.userId}
                  className={`p-4 border-b border-[#41ff5f10] ${
                    isCurrentUser ? "bg-[#41ff5f20]" : "hover:bg-[#003018]/20"
                  } transition-colors`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-[#41ff5f] font-mono text-shadow-glow">#{entry.rank}</span>

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
                      <div className="text-xs text-[#7bff9a]/60">{timeRange === 'all_time' ? 'BEST' : 'MAX'} WPM</div>
                      <div className="text-lg font-bold text-[#41ff5f] font-mono">{entry.bestWpm}</div>
                    </div>

                    <div className="bg-[#003018]/30 rounded p-2 border border-[#41ff5f20]">
                      <div className="text-xs text-[#7bff9a]/60">{timeRange === 'all_time' ? 'BEST' : 'MAX'} ACC</div>
                      <div className="text-lg font-bold text-[#7bff9a] font-mono">{entry.bestAccuracy}%</div>
                    </div>

                    {category === "composite" && (
                      <div className="bg-[#003018]/30 rounded p-2 border border-[#41ff5f20]">
                        <div className="text-xs text-[#7bff9a]/60">SCORE</div>
                        <div className="text-lg font-bold text-[#41ff5f] font-mono">{entry.compositeScore.toFixed(1)}</div>
                      </div>
                    )}

                    <div className="bg-[#003018]/30 rounded p-2 border border-[#41ff5f20]">
                      <div className="text-xs text-[#7bff9a]/60">SESSIONS</div>
                      <div className="text-lg font-bold text-[#7bff9a]/50 font-mono">{entry.totalSessions}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {leaderboard && leaderboard.length === 0 && (
            <div className="p-12 text-center text-[#7bff9a]/60">
              <p>NO RANKINGS FOUND FOR THIS PERIOD.</p>
            </div>
          )}
        </div>
        
        {globalStats && (
          <div className="border-t border-[#41ff5f30] pt-6 mb-6">
            <h3 className="text-sm font-bold text-[#41ff5f] mb-4 text-center tracking-widest">SYSTEM STATISTICS</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="terminal-window p-3 text-center">
                <div className="text-xl font-bold text-[#41ff5f] font-mono">{globalStats.totalUsers.toLocaleString()}</div>
                <div className="text-[10px] text-[#7bff9a]/60 uppercase">Total Typists</div>
              </div>
              <div className="terminal-window p-3 text-center">
                <div className="text-xl font-bold text-[#41ff5f] font-mono">{globalStats.totalSessions.toLocaleString()}</div>
                <div className="text-[10px] text-[#7bff9a]/60 uppercase">Sessions Run</div>
              </div>
              <div className="terminal-window p-3 text-center">
                <div className="text-xl font-bold text-[#41ff5f] font-mono">{globalStats.averageWpm}</div>
                <div className="text-[10px] text-[#7bff9a]/60 uppercase">Avg Speed</div>
              </div>
              <div className="terminal-window p-3 text-center">
                <div className="text-xl font-bold text-[#41ff5f] font-mono">{globalStats.averageAccuracy}%</div>
                <div className="text-[10px] text-[#7bff9a]/60 uppercase">Avg Accuracy</div>
              </div>
            </div>
          </div>
        )}

        <div className="terminal-window p-6 border border-[#41ff5f40] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 text-[10px] text-[#41ff5f40]">meow</div>
          
          <h3 className="text-lg font-bold text-[#41ff5f] mb-4 text-shadow-glow flex items-center gap-2">
            TOTAL SCORE          
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-[#7bff9a]/80 mb-4 leading-relaxed">
                The composite score is designed to reward high speed only when accompanied by high accuracy. Speed without precision results in a significantly lower rank.
              </p>
              <ul className="text-xs text-[#7bff9a]/60 space-y-2 font-mono">
                <li className="flex items-center gap-2">
                  <span className="text-[#41ff5f]">&gt;</span> WPM: Words Per Minute (raw speed)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#41ff5f]">&gt;</span> ACC: Accuracy Percentage (precision)
                </li>
              </ul>
            </div>

            <div className="flex flex-col justify-center">
              <div className="bg-[#001a0f] p-4 border border-[#41ff5f30] rounded text-center relative group">
                <div className="text-xs text-[#7bff9a]/40 mb-2 uppercase tracking-widest">Calculation Formula</div>
                <div className="text-xl md:text-2xl font-bold text-[#41ff5f] font-mono group-hover:text-shadow-glow transition-all">
                  SCORE = WPM × (ACC% / 100)
                </div>
                <div className="mt-3 text-[10px] text-[#7bff9a]/50 border-t border-[#41ff5f10] pt-2">
                  Example: 100 WPM @ 95% Acc = <span className="text-[#41ff5f]">95.0 Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}