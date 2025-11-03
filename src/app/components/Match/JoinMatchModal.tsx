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
      setError('Please enter an invite code')
      return
    }

    setIsJoining(true)
    setError('')

    try {
      const result = await joinMatch({ inviteCode: inviteCode.toUpperCase().trim() })
      router.push(`/match/${result.matchId}`)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Invalid invite code')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-matrix-bg-darker border-2 border-matrix-primary rounded-2xl max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-matrix-primary/20 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-matrix-primary">Join Match</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-matrix-bg transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-matrix-primary mb-2">
              Enter Invite Code
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
              className="w-full px-4 py-3 bg-matrix-primary/5 border-2 border-matrix-primary/30 text-matrix-primary text-center text-2xl font-mono tracking-widest rounded-lg focus:outline-none focus:border-matrix-primary uppercase"
            />
          </div>

          {error && (
            <div className="p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={isJoining || !inviteCode.trim()}
            className="w-full px-6 py-3 bg-matrix-primary text-matrix-bg font-bold rounded-lg hover:shadow-glow-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? 'Joining...' : 'Join Match'}
          </button>
        </div>
      </div>
    </div>
  )
}