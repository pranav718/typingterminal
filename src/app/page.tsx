"use client"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useAuth } from "./hooks/useAuth"
import { useSettings } from "./hooks/useSettings"
import { useSampleBookProgress } from "./hooks/useSampleBookProgress"
import AuthModal from "./components/Auth/AuthModal"
import Settings from "./components/Settings"
import TopPerformers from "./components/TopPerformers"
import CreateMatchModal from "./components/Match/CreateMatchModal"
import JoinMatchModal from "./components/Match/JoinMatchModal"
import { SAMPLE_BOOKS } from "./data/sampleBooks"
import { useState } from "react"
import "./terminal.css"

export default function HomePage() {
  const { user, isLoading: authLoading, isGuest, logout } = useAuth()
  const router = useRouter()
  const { getProgress } = useSampleBookProgress(isGuest)
  const { settings, updateSettings } = useSettings()
  
  const [showSettings, setShowSettings] = useState(false)
  const [showCreateMatch, setShowCreateMatch] = useState(false)
  const [showJoinMatch, setShowJoinMatch] = useState(false)

  const userBooks = useQuery(api.books.getUserBooks)

  const handleMatchCreated = (matchId: string, inviteCode: string) => {
    router.push(`/match/${matchId}`)
  }

  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg flex items-center justify-center p-4 md:p-8">
        <AuthModal />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg p-4 md:p-8">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-matrix-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-matrix-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12 p-4 md:p-6 bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl backdrop-blur-sm">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-matrix-primary drop-shadow-glow-lg">TerminalType</h1>
            <p className="text-matrix-light text-sm mt-2">Master typing with classic literature</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {user && (
              <div className="flex items-center gap-3 px-4 py-2 bg-matrix-primary/10 rounded-md text-sm text-matrix-light">
                <div className="flex items-center gap-2">
                  {user.image && !isGuest && (
                    <img src={user.image} alt={user.name || "User"} className="w-8 h-8 rounded-full" />
                  )}
                  <span className="truncate max-w-[120px]">{isGuest ? "Guest User" : user.email || user.name}</span>
                  {isGuest && <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs rounded">Guest</span>}
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-xs border-2 border-error text-error rounded hover:bg-error hover:text-matrix-bg transition-all"
                >
                  Logout
                </button>
              </div>
            )}

            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2.5 border-2 border-cyan-500 text-cyan-500 rounded-md hover:bg-cyan-500 hover:text-matrix-bg transition-all font-semibold text-sm flex items-center gap-2"
            >
              ⚙️ Settings
            </button>

            <button
              onClick={() => router.push("/leaderboard")}
              className="px-4 py-2.5 border-2 border-yellow-500 text-yellow-500 rounded-md hover:bg-yellow-500 hover:text-matrix-bg transition-all font-semibold text-sm flex items-center gap-2"
            >
              🏆 Leaderboard
            </button>

            {!isGuest && (
              <>
                <button
                  onClick={() => setShowCreateMatch(true)}
                  className="px-4 py-2.5 border-2 border-purple-500 text-purple-500 rounded-md hover:bg-purple-500 hover:text-matrix-bg transition-all font-semibold text-sm flex items-center gap-2"
                >
                  ⚔️ Create Match
                </button>

                <button
                  onClick={() => setShowJoinMatch(true)}
                  className="px-4 py-2.5 border-2 border-green-500 text-green-500 rounded-md hover:bg-green-500 hover:text-matrix-bg transition-all font-semibold text-sm flex items-center gap-2"
                >
                  🎮 Join Match
                </button>

                <button
                  onClick={() => router.push("/matches")}
                  className="px-4 py-2.5 border-2 border-pink-500 text-pink-500 rounded-md hover:bg-pink-500 hover:text-matrix-bg transition-all font-semibold text-sm flex items-center gap-2"
                >
                  📜 My Matches
                </button>
              </>
            )}
          </div>
        </header>

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

        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-matrix-primary mb-4">Choose a Book to Practice</h2>
          <p className="text-matrix-light max-w-2xl mx-auto">
            {isGuest
              ? "Browse our collection of classic literature. Sign up to upload your own books!"
              : "Select from classics below or upload your own PDF book"}
          </p>
        </div>

        {!isGuest && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={() => router.push("/practice?upload=true")}
              className="px-6 py-3 bg-matrix-primary text-matrix-bg font-bold rounded-lg hover:-translate-y-1 hover:shadow-glow-hover transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Upload Your Own Book (PDF)
            </button>
          </div>
        )}

        {!isGuest && userBooks && userBooks.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-matrix-primary flex items-center gap-2">
                <span>📚</span>
                Your Uploaded Books
              </h3>
              <span className="text-sm text-matrix-light">
                {userBooks.length} {userBooks.length === 1 ? "book" : "books"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBooks.map((book) => {
                const progress = Math.round((book.lastReadPosition / book.totalPassages) * 100)
                const isCompleted = book.lastReadPosition === book.totalPassages - 1

                return (
                  <div
                    key={book._id}
                    className="group bg-gradient-to-br from-matrix-primary/10 to-matrix-primary/5 border-2 border-matrix-primary/30 rounded-xl p-6 hover:border-matrix-primary hover:bg-matrix-primary/15 transition-all cursor-pointer hover:-translate-y-2 hover:shadow-glow-lg"
                    onClick={() => router.push(`/practice?uploaded=${book._id}`)}
                  >
                    <div className="w-full h-48 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg mb-4 flex items-center justify-center border border-cyan-500/30 group-hover:border-cyan-500 transition-all relative overflow-hidden">
                      <div className="text-center p-4">
                        <div className="text-6xl mb-2">📄</div>
                        <div className="text-xs text-matrix-light opacity-60">Your Upload</div>
                      </div>

                      {book.lastReadPosition > 0 && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-matrix-primary/90 text-matrix-bg text-xs font-bold rounded">
                          {progress}%
                        </div>
                      )}

                      {isCompleted && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-green-500/90 text-white text-xs font-bold rounded flex items-center gap-1">
                          <span>✓</span> Completed
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-matrix-primary mb-2 group-hover:drop-shadow-glow transition-all line-clamp-2">
                      {book.title}
                    </h3>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-matrix-light mb-1">
                        <span>Progress</span>
                        <span>
                          {book.lastReadPosition + 1} / {book.totalPassages}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-matrix-primary/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-matrix-primary to-cyan-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-matrix-light/80 mb-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        {book.totalPassages} passages
                      </span>
                      <span className="text-matrix-light/60">{new Date(book.uploadedAt).toLocaleDateString()}</span>
                    </div>

                    <button className="w-full px-4 py-2 border-2 border-cyan-500 text-cyan-500 rounded-lg hover:bg-cyan-500 hover:text-matrix-bg transition-all font-semibold opacity-0 group-hover:opacity-100">
                      {book.lastReadPosition === 0 ? "Start Typing →" : isCompleted ? "Practice Again →" : "Continue →"}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-matrix-primary flex items-center gap-2">
              <span>📖</span>
              Classic Literature
            </h3>
            {isGuest && (
              <span className="text-sm text-matrix-light px-3 py-1 bg-matrix-primary/10 rounded-full">
                Free for all users
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_BOOKS.map((book) => {
              const currentProgress = getProgress(book.id)
              const progressPercent = Math.round(((currentProgress + 1) / book.passages.length) * 100)
              const isStarted = currentProgress > 0
              const isCompleted = currentProgress === book.passages.length - 1

              return (
                <div
                  key={book.id}
                  className="group bg-matrix-primary/5 border-2 border-matrix-primary/20 rounded-xl p-6 hover:border-matrix-primary hover:bg-matrix-primary/10 transition-all cursor-pointer hover:-translate-y-2 hover:shadow-glow-lg"
                  onClick={() => router.push(`/practice?book=${book.id}`)}
                >
                  <div className="w-full h-48 bg-gradient-to-br from-matrix-primary/20 to-matrix-primary/5 rounded-lg mb-4 flex items-center justify-center border border-matrix-primary/30 group-hover:border-matrix-primary transition-all relative overflow-hidden">
                    <div className="text-center p-4">
                      <div className="text-6xl mb-2">📖</div>
                      <div className="text-xs text-matrix-light opacity-60">{book.passages.length} passages</div>
                    </div>

                    {isStarted && !isCompleted && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-matrix-primary/90 text-matrix-bg text-xs font-bold rounded">
                        {progressPercent}%
                      </div>
                    )}

                    {isCompleted && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-green-500/90 text-white text-xs font-bold rounded flex items-center gap-1">
                        <span>✓</span> Completed
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-matrix-primary mb-2 group-hover:drop-shadow-glow transition-all">
                    {book.title}
                  </h3>
                  <p className="text-sm text-matrix-light mb-3">by {book.author}</p>

                  {isStarted && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-matrix-light mb-1">
                        <span>Progress</span>
                        <span>
                          {currentProgress + 1} / {book.passages.length}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-matrix-primary/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-matrix-primary to-cyan-500 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-matrix-light/80">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      {book.passages.length} passages
                    </span>
                    <span className="px-2 py-1 bg-matrix-primary/20 rounded text-matrix-primary font-semibold">Free</span>
                  </div>

                  <button className="w-full mt-4 px-4 py-2 border-2 border-matrix-primary text-matrix-primary rounded-lg hover:bg-matrix-primary hover:text-matrix-bg transition-all font-semibold opacity-0 group-hover:opacity-100">
                    {!isStarted ? "Start Typing →" : isCompleted ? "Practice Again →" : "Continue →"}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {!isGuest && <TopPerformers />}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl">
            <h3 className="text-lg font-bold text-matrix-primary mb-2">Real-time Stats</h3>
            <p className="text-sm text-matrix-light">Track your WPM, accuracy, and errors as you type</p>
          </div>

          <div className="text-center p-6 bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl">
            <h3 className="text-lg font-bold text-matrix-primary mb-2">Classic Literature</h3>
            <p className="text-sm text-matrix-light">Practice with passages from timeless books</p>
          </div>

          <div className="text-center p-6 bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl">
            <h3 className="text-lg font-bold text-matrix-primary mb-2">
              {isGuest ? "Sign Up for More" : "Compete with Friends"}
            </h3>
            <p className="text-sm text-matrix-light">
              {isGuest
                ? "Create an account to upload your own PDFs and save progress"
                : "Challenge friends in real-time typing matches"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}