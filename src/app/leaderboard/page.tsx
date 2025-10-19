"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/useAuth"
import Leaderboard from "../components/Leaderboard"
import AuthModal from "../components/Auth/AuthModal"
import "../terminal.css"

export default function LeaderboardPage() {
  const { user, isLoading, isGuest, logout } = useAuth()
  const router = useRouter()

  if (!user && !isLoading) {
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
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 md:p-6 bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 border-2 border-matrix-primary/30 text-matrix-primary rounded-md hover:border-matrix-primary hover:bg-matrix-primary/10 transition-all"
              title="Back to Home"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-matrix-primary drop-shadow-glow-lg">
              TerminalType
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-3 px-4 py-2 bg-matrix-primary/10 rounded-md text-sm text-matrix-light">
                <div className="flex items-center gap-2">
                  {user.image && !isGuest && (
                    <img src={user.image} alt={user.name || "User"} className="w-8 h-8 rounded-full" />
                  )}
                  <span className="truncate">{isGuest ? "Guest User" : user.email || user.name}</span>
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
          </div>
        </header>

        {/* Guest Warning */}
        {isGuest && (
          <div className="mb-6 p-4 bg-warning/10 border-2 border-warning rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="font-semibold text-warning mb-1">Guest Mode</div>
                <div className="text-sm text-matrix-light">
                  Sign up to appear on the leaderboard and track your progress!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Component */}
        <Leaderboard />
      </div>
    </div>
  )
}