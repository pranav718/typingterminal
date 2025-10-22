"use client"
import { useState } from "react"
import { useAuthActions } from "../../hooks/useAuth"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"
import GuestButton from "./GuestButton"

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true)
  const { signInWithGoogle, signInWithTwitter } = useAuthActions()

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-matrix-primary/5 border-2 border-matrix-primary/30 rounded-2xl p-8 backdrop-blur-sm shadow-glow-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-matrix-primary drop-shadow-glow-lg mb-2">
            TerminalType
          </h1>
          <p className="text-matrix-light">Master typing with classic literature</p>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-matrix-primary/10 rounded-lg">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
              isLogin
                ? "bg-matrix-primary text-matrix-bg shadow-glow"
                : "text-matrix-light hover:text-matrix-primary"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
              !isLogin
                ? "bg-matrix-primary text-matrix-bg shadow-glow"
                : "text-matrix-light hover:text-matrix-primary"
            }`}
          >
            Sign Up
          </button>
        </div>

        {isLogin ? <LoginForm /> : <SignupForm />}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-matrix-primary/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-matrix-bg text-matrix-light">or</span>
          </div>
        </div>

        <div className="mt-6">
          <GuestButton />
        </div>

        <p className="text-xs text-matrix-light/60 text-center mt-6">
          By continuing, you agree to being our oomf 
        </p>
      </div>
    </div>
  )
}