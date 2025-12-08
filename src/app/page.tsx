"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useAuth } from "./hooks/useAuth"
import { useSettings } from "./hooks/useSettings"
import { useSampleBookProgress } from "./hooks/useSampleBookProgress"
import AuthModal from "./components/Auth/AuthModal"
import Settings from "./components/Settings"
import CreateMatchModal from "./components/Match/CreateMatchModal"
import JoinMatchModal from "./components/Match/JoinMatchModal"
import ProfileImage from "./components/ProfileImage"
import { SAMPLE_BOOKS } from "./data/sampleBooks"
import "./terminal.css"

type Tab = "PROFILE" | "LEADERBOARD" | "BOOKS" | "CHALLENGES" | "SETTINGS" | "STATS"

export default function HomePage() {
  const { user, isLoading: authLoading, isGuest, logout } = useAuth()
  const router = useRouter()
  const { getProgress } = useSampleBookProgress(isGuest)
  const { settings, updateSettings } = useSettings()
  
  const [activeTab, setActiveTab] = useState<Tab>("PROFILE")
  const [showSettings, setShowSettings] = useState(false)
  const [showCreateMatch, setShowCreateMatch] = useState(false)
  const [showJoinMatch, setShowJoinMatch] = useState(false)

  const userBooks = useQuery(api.books.getUserBooks)
  const userStats = useQuery(api.sessions.getUserStats)
  const topPerformers = useQuery(api.leaderboard.getTopPerformers)

  const handleMatchCreated = (matchId: string, inviteCode: string) => {
    router.push(`/match/${matchId}`)
  }

  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-[#00120b] flex items-center justify-center p-4">
        <AuthModal />
      </div>
    )
  }

  const tabs: Tab[] = ["PROFILE", "LEADERBOARD", "BOOKS", "CHALLENGES", "SETTINGS", "STATS"]

  return (
    <div className="min-h-screen bg-[#00120b] text-[#41ff5f] font-mono relative overflow-hidden">
      <div className="scanline" />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="grid-lines absolute inset-0" />
      </div>

      <header className="border-b border-[#41ff5f40] bg-[#001a0f]/60 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest text-shadow-glow">
              TYPINGTERMINAL v1.0.0
            </h1>
            <p className="text-[#7bff9a]/70 text-xs md:text-sm">
              {isGuest ? "GUEST SESSION • LIMITED ACCESS" : "LOW SIGNAL • SYSTEM ONLINE"}
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => router.push("/practice")}
              className="terminal-btn text-xs md:text-sm"
            >
              PRACTICE MODE
            </button>
            <button
              onClick={() => router.push("/leaderboard")}
              className="terminal-btn text-xs md:text-sm"
            >
              RANKINGS
            </button>
            {!isGuest && (
              <button
                onClick={() => router.push("/matches")}
                className="terminal-btn text-xs md:text-sm"
              >
                MY MATCHES
              </button>
            )}
          </div>
        </div>
      </header>


      <main className="max-w-7xl mx-auto p-4 md:p-6 grid lg:grid-cols-[2fr_1fr] gap-6 relative z-10">
        <section className="terminal-window flex flex-col">
          <div className="flex flex-wrap gap-2 border-b border-[#41ff5f30] p-2 text-xs">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => {
                  if (tab === "SETTINGS") {
                    setShowSettings(true)
                  } else {
                    setActiveTab(tab)
                  }
                }}
                className={`terminal-tab ${activeTab === tab ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 overflow-y-auto text-sm max-h-[600px]">
            {activeTab === "PROFILE" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border border-[#41ff5f30] rounded p-4">
                  <h2 className="text-lg font-bold mb-3 text-[#41ff5f] text-shadow-glow">PROFILE</h2>
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <ProfileImage
                          src={user.image}
                          alt={user.name || "User"}
                          fallbackText={user.email || user.name}
                          className="w-12 h-12 rounded-full border border-[#41ff5f60]"
                        />
                        <div>
                          <p className="font-bold text-[#41ff5f]">{user.name || "Anonymous User"}</p>
                          <p className="text-[#7bff9a]/80 text-xs">{user.email || "Guest Account"}</p>
                          {isGuest && (
                            <span className="text-xs px-2 py-0.5 bg-[#ff5f4180] text-[#ff5f41] border border-[#ff5f41] rounded mt-1 inline-block">
                              GUEST MODE
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {userStats && (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="bg-[#003018]/30 border border-[#41ff5f20] rounded p-2">
                            <div className="text-xs text-[#7bff9a]/60">BEST WPM</div>
                            <div className="text-xl font-bold text-[#41ff5f]">{userStats.bestWpm}</div>
                          </div>
                          <div className="bg-[#003018]/30 border border-[#41ff5f20] rounded p-2">
                            <div className="text-xs text-[#7bff9a]/60">ACCURACY</div>
                            <div className="text-xl font-bold text-[#41ff5f]">{userStats.bestAccuracy}%</div>
                          </div>
                          <div className="bg-[#003018]/30 border border-[#41ff5f20] rounded p-2">
                            <div className="text-xs text-[#7bff9a]/60">AVG WPM</div>
                            <div className="text-xl font-bold text-[#41ff5f]">{userStats.averageWpm}</div>
                          </div>
                          <div className="bg-[#003018]/30 border border-[#41ff5f20] rounded p-2">
                            <div className="text-xs text-[#7bff9a]/60">SESSIONS</div>
                            <div className="text-xl font-bold text-[#41ff5f]">{userStats.totalSessions}</div>
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={logout}
                        className="mt-3 px-4 py-2 border border-[#ff5f4180] text-[#ff5f41] rounded hover:bg-[#ff5f4120] transition-all w-full"
                      >
                        &gt; LOGOUT
                      </button>
                    </div>
                  ) : (
                    <div className="text-[#7bff9a]/60 animate-pulse">
                      LOADING USER DATA...
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "LEADERBOARD" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border border-[#41ff5f30] rounded p-4">
                  <h2 className="text-lg font-bold mb-3 text-[#41ff5f] text-shadow-glow">TOP PERFORMERS</h2>
                  {topPerformers ? (
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-[#7bff9a]/60 mb-2 uppercase tracking-wider">Fastest Typists</div>
                        <div className="space-y-1">
                          {topPerformers.fastestTypers.slice(0, 3).map((performer, idx) => (
                            <div key={performer.userId} className="flex items-center justify-between p-2 bg-[#003018]/20 border border-[#41ff5f20] rounded">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#41ff5f] font-mono">#{idx + 1}</span>
                                <span className="truncate">{performer.displayName}</span>
                              </div>
                              <span className="font-bold text-[#41ff5f]">{performer.bestWpm} WPM</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-[#7bff9a]/60 mb-2 uppercase tracking-wider">Most Accurate</div>
                        <div className="space-y-1">
                          {topPerformers.mostAccurate.slice(0, 3).map((performer, idx) => (
                            <div key={performer.userId} className="flex items-center justify-between p-2 bg-[#003018]/20 border border-[#41ff5f20] rounded">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#41ff5f] font-mono">#{idx + 1}</span>
                                <span className="truncate">{performer.displayName}</span>
                              </div>
                              <span className="font-bold text-[#41ff5f]">{performer.bestAccuracy}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => router.push("/leaderboard")}
                        className="w-full terminal-btn mt-4"
                      >
                        VIEW FULL RANKINGS →
                      </button>
                    </div>
                  ) : (
                    <div className="text-[#7bff9a]/60 animate-pulse">LOADING RANKINGS...</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "BOOKS" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border border-[#41ff5f30] rounded p-4">
                  <h2 className="text-lg font-bold mb-3 text-[#41ff5f] text-shadow-glow">YOUR BOOKS</h2>
                  {!isGuest && userBooks && userBooks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userBooks.map((book) => {
                        const progress = Math.round((book.lastReadPosition / book.totalPassages) * 100)
                        return (
                          <div
                            key={book._id}
                            onClick={() => router.push(`/practice?uploaded=${book._id}`)}
                            className="p-3 border border-[#41ff5f30] rounded hover:bg-[#003018] cursor-pointer transition-all group"
                          >
                            <h3 className="font-bold truncate group-hover:text-shadow-glow">{book.title}</h3>
                            <div className="text-xs text-[#7bff9a]/70 mt-1">
                              {book.totalPassages} passages • {progress}% complete
                            </div>
                            <div className="mt-2 h-1 bg-[#41ff5f20] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#41ff5f]" 
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-[#7bff9a]/60 text-sm text-center py-8">
                      {isGuest ? "SIGN UP TO UPLOAD BOOKS" : "NO UPLOADED BOOKS YET"}
                    </div>
                  )}
                  
                  {!isGuest && (
                    <button
                      onClick={() => router.push("/practice?upload=true")}
                      className="w-full mt-4 px-4 py-2 border border-[#41ff5f30] text-[#41ff5f] rounded hover:bg-[#003018] transition-all text-sm"
                    >
                      &gt; UPLOAD BOOK (PDF / EPUB)
                    </button>
                  )}
                </div>

                <div className="border border-[#41ff5f30] rounded p-4">
                  <h2 className="text-lg font-bold mb-3 text-[#41ff5f] text-shadow-glow">CLASSIC LIBRARY</h2>
                  <p className="text-[#7bff9a]/80 text-xs mb-4">SELECT A CLASSIC TO PRACTICE TYPING</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {SAMPLE_BOOKS.map((book) => {
                      const currentProgress = getProgress(book.id)
                      const progressPercent = Math.round(((currentProgress + 1) / book.passages.length) * 100)
                      const isStarted = currentProgress > 0

                      return (
                        <div
                          key={book.id}
                          onClick={() => router.push(`/practice?book=${book.id}`)}
                          className="p-3 border border-[#41ff5f30] rounded hover:bg-[#003018] cursor-pointer transition-all group"
                        >
                          <h3 className="font-bold text-sm truncate group-hover:text-shadow-glow">
                            {book.title}
                          </h3>
                          <p className="text-xs text-[#7bff9a]/70 truncate">by {book.author}</p>
                          <div className="text-xs text-[#7bff9a]/60 mt-1">
                            {book.passages.length} passages
                          </div>
                          {isStarted && (
                            <div className="mt-2">
                              <div className="text-xs text-[#7bff9a]/60">{progressPercent}% complete</div>
                              <div className="mt-1 h-1 bg-[#41ff5f20] rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#41ff5f]" 
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "CHALLENGES" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border border-[#41ff5f30] rounded p-4">
                  <h2 className="text-lg font-bold mb-3 text-[#41ff5f] text-shadow-glow">TYPING CHALLENGES</h2>
                  
                  {isGuest ? (
                    <div className="text-center py-8">
                      <div className="text-[#ff5f41] mb-2">GUEST MODE RESTRICTION</div>
                      <p className="text-[#7bff9a]/60 text-sm">SIGN UP TO PARTICIPATE IN MATCHES</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowCreateMatch(true)}
                          className="flex-1 terminal-btn"
                        >
                          CREATE MATCH
                        </button>
                        <button
                          onClick={() => setShowJoinMatch(true)}
                          className="flex-1 terminal-btn"
                        >
                          JOIN MATCH
                        </button>
                      </div>

                      <div className="border border-[#41ff5f20] rounded p-4 bg-[#003018]/20">
                        <div className="text-xs text-[#7bff9a]/60 mb-2">MATCH TYPES:</div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[#7bff9a]/80">Book Passages</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#7bff9a]/80">Random Words</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#7bff9a]/80">Random Letters</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push("/matches")}
                        className="w-full terminal-btn"
                      >
                        VIEW MATCH HISTORY →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "STATS" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border border-[#41ff5f30] rounded p-4">
                  <h2 className="text-lg font-bold mb-3 text-[#41ff5f] text-shadow-glow">PERFORMANCE STATS</h2>
                  
                  {userStats ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#003018]/30 border border-[#41ff5f20] rounded p-3">
                          <div className="text-xs text-[#7bff9a]/60 mb-1">BEST WPM</div>
                          <div className="text-2xl font-bold text-[#41ff5f] text-shadow-glow">
                            {userStats.bestWpm}
                          </div>
                        </div>
                        <div className="bg-[#003018]/30 border border-[#41ff5f20] rounded p-3">
                          <div className="text-xs text-[#7bff9a]/60 mb-1">BEST ACCURACY</div>
                          <div className="text-2xl font-bold text-[#41ff5f] text-shadow-glow">
                            {userStats.bestAccuracy}%
                          </div>
                        </div>
                        <div className="bg-[#003018]/30 border border-[#41ff5f20] rounded p-3">
                          <div className="text-xs text-[#7bff9a]/60 mb-1">AVG WPM</div>
                          <div className="text-2xl font-bold text-[#41ff5f] text-shadow-glow">
                            {userStats.averageWpm}
                          </div>
                        </div>
                        <div className="bg-[#003018]/30 border border-[#41ff5f20] rounded p-3">
                          <div className="text-xs text-[#7bff9a]/60 mb-1">AVG ACCURACY</div>
                          <div className="text-2xl font-bold text-[#41ff5f] text-shadow-glow">
                            {userStats.averageAccuracy}%
                          </div>
                        </div>
                      </div>

                      <div className="border border-[#41ff5f20] rounded p-4 bg-[#003018]/20">
                        <div className="text-xs text-[#7bff9a]/60 mb-3 uppercase">SESSION DATA</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#7bff9a]/80">Total Sessions:</span>
                            <span className="text-[#41ff5f] font-bold">{userStats.totalSessions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#7bff9a]/80">Total Words Typed:</span>
                            <span className="text-[#41ff5f] font-bold">{userStats.totalWordsTyped.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#7bff9a]/80">Composite Score:</span>
                            <span className="text-[#41ff5f] font-bold">{userStats.compositeScore.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push("/practice")}
                        className="w-full terminal-btn"
                      >
                        START PRACTICE SESSION →
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-[#7bff9a]/60 mb-4">NO STATS DATA AVAILABLE</div>
                      <button
                        onClick={() => router.push("/practice")}
                        className="terminal-btn"
                      >
                        START FIRST SESSION
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#41ff5f40] p-2">
            <div className="flex items-center gap-2">
              <span className="text-[#41ff5f]">&gt;</span>
              <input
                type="text"
                placeholder="ENTER COMMAND..."
                className="terminal-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const cmd = e.currentTarget.value.toLowerCase().trim()
                    if (cmd === 'practice') router.push('/practice')
                    else if (cmd === 'leaderboard') router.push('/leaderboard')
                    else if (cmd === 'matches') router.push('/matches')
                    else if (cmd === 'logout') logout()
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
            <div className="text-xs text-[#7bff9a]/40 mt-1">
              Type "practice", "leaderboard", "matches", or "logout"
            </div>
          </div>
        </section>

        <aside className="terminal-window p-4 text-sm flex flex-col justify-between h-fit sticky top-6">
          <div>
            <h2 className="text-sm mb-3 border-b border-[#41ff5f40] pb-2 text-shadow-glow">
              SYSTEM INFO:
            </h2>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#7bff9a]/60">USER:</span>
                <span className="text-[#41ff5f]">{user?.email || "GUEST"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7bff9a]/60">MODE:</span>
                <span className="text-[#41ff5f]">{isGuest ? "GUEST SESSION" : "ACTIVE SESSION"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7bff9a]/60">STATUS:</span>
                <span className="text-[#41ff5f]">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7bff9a]/60">SECURITY:</span>
                <span className="text-[#41ff5f]">48532695-CF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7bff9a]/60">IP:</span>
                <span className="text-[#41ff5f]">192.168.1.37</span>
              </div>
            </div>

            <div className="mt-4 border border-[#41ff5f30] rounded p-4 h-48 flex flex-col items-center justify-center text-[#7bff9a]/50">
              {user?.image && !isGuest ? (
                <div className="text-center">
                  <ProfileImage
                    src={user.image}
                    alt={user.name || "User"}
                    fallbackText={user.name || user.email}
                    className="w-24 h-24 rounded-full border-2 border-[#41ff5f60] mx-auto mb-3"
                  />
                  <div className="text-[#41ff5f] text-sm font-bold">
                    {user.name || "ANONYMOUS"}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-2">👤</div>
                  <div className="text-xs">PROFILE DATA VIEW</div>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-xs text-[#7bff9a]/60 mb-2">QUICK ACTIONS:</div>
              <button
                onClick={() => router.push("/practice")}
                className="w-full text-left px-3 py-2 border border-[#41ff5f20] rounded hover:bg-[#003018] transition-all text-xs"
              >
                &gt; START PRACTICE
              </button>
              <button
                onClick={() => router.push("/leaderboard")}
                className="w-full text-left px-3 py-2 border border-[#41ff5f20] rounded hover:bg-[#003018] transition-all text-xs"
              >
                &gt; VIEW RANKINGS
              </button>
              {!isGuest && (
                <button
                  onClick={() => setShowCreateMatch(true)}
                  className="w-full text-left px-3 py-2 border border-[#41ff5f20] rounded hover:bg-[#003018] transition-all text-xs"
                >
                  &gt; CREATE MATCH
                </button>
              )}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[10px] text-center border-t border-[#41ff5f20] pt-3 text-[#7bff9a]/60">
              PROPERTY OF TYPINGTERMINAL NETWORK SYSTEMS ©2025
            </p>
          </div>
        </aside>
      </main>

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={updateSettings}
      />

      <CreateMatchModal
        isOpen={showCreateMatch}
        onClose={() => setShowCreateMatch(false)}
        onMatchCreated={handleMatchCreated}
      />

      <JoinMatchModal
        isOpen={showJoinMatch}
        onClose={() => setShowJoinMatch(false)}
      />
    </div>
  )
}