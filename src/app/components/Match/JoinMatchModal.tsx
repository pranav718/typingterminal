'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useRouter } from 'next/navigation'

interface JoinMatchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function JoinMatchModal({ isOpen, onClose }: JoinMatchModalProps) {
  const [inviteCode, setInviteCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')

  const joinMatch = useMutation(api.matches.joinMatch)
  const router = useRouter()

  if (!isOpen) return null

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setError('ENTER INVITE CODE')
      return
    }

    setIsJoining(true)
    setError('')

    try {
      const result = await joinMatch({ inviteCode: inviteCode.toUpperCase().trim() })
      router.push(`/match/${result.matchId}`)
      onClose()
    } catch (err: any) {
      setError(err.message || 'INVALID INVITE CODE')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-[#00120b]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="terminal-window max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[#41ff5f40] px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#41ff5f] text-shadow-glow tracking-wider">
            JOIN MATCH
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-[#ff5f4180] text-[#ff5f41] hover:bg-[#ff5f4120] transition-all flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#7bff9a]/80 mb-2 uppercase tracking-wider">
              ENTER INVITE CODE:
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase())
                setError('')
              }}
              placeholder="ABC123"
              maxLength={6}
              className="w-full px-4 py-3 bg-[#003018]/30 border-2 border-[#41ff5f30] text-[#41ff5f] text-center text-2xl font-mono tracking-widest rounded focus:outline-none focus:border-[#41ff5f] uppercase"
            />
          </div>

          {error && (
            <div className="p-3 bg-[#ff5f4110] border border-[#ff5f4180] rounded text-[#ff5f41] text-sm font-mono">
              ERROR: {error}
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={isJoining || !inviteCode.trim()}
            className="w-full terminal-btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? 'JOINING...' : 'JOIN MATCH'}
          </button>

          <div className="text-xs text-[#7bff9a]/60 text-center font-mono">
            PASTE CODE FROM HOST TO JOIN BATTLE
          </div>
        </div>
      </div>
    </div>
  )
}