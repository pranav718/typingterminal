"use client"
import { useState } from "react"
import { useAuthActions } from "../../hooks/useAuth"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"
import GuestButton from "./GuestButton"

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="terminal-window p-8 border-[#41ff5f80]">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#41ff5f] text-shadow-glow mb-2 tracking-widest">
            TYPINGTERMINAL
          </h1>
          <p className="text-sm text-[#7bff9a]/80 font-mono">v2.4.00 • AUTHENTICATION REQUIRED</p>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-[#003018]/30 rounded border border-[#41ff5f20]">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded font-semibold transition-all text-sm font-mono uppercase tracking-wider ${
              isLogin
                ? "bg-[#41ff5f] text-[#00120b] shadow-[0_0_20px_rgba(65,255,95,0.5)]"
                : "text-[#7bff9a] hover:text-[#41ff5f]"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded font-semibold transition-all text-sm font-mono uppercase tracking-wider ${
              !isLogin
                ? "bg-[#41ff5f] text-[#00120b] shadow-[0_0_20px_rgba(65,255,95,0.5)]"
                : "text-[#7bff9a] hover:text-[#41ff5f]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {isLogin ? <LoginForm /> : <SignupForm />}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#41ff5f20]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#001a0f] text-[#7bff9a]/60 font-mono">OR</span>
          </div>
        </div>

        <div className="mt-6">
          <GuestButton />
        </div>

        <p className="text-xs text-[#7bff9a]/40 text-center mt-6 font-mono">
          SECURED CONNECTION • DATA ENCRYPTED
        </p>
      </div>
    </div>
  )
}