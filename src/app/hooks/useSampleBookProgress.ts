'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'

interface SampleBookProgress {
  [bookId: string]: number 
}

export function useSampleBookProgress(isGuest: boolean) {
  const [localProgress, setLocalProgress] = useState<SampleBookProgress>({})
  
  // for logged in users, fetch from database
  const dbProgress = useQuery(
    api.books.getSampleBookProgress,
    isGuest ? "skip" : {}
  )
  
  const updateDbProgress = useMutation(api.books.updateSampleBookProgress)

  // load from localStorage on mount for guests and as fallback
  useEffect(() => {
    const stored = localStorage.getItem('terminaltype_sample_progress')
    if (stored) {
      try {
        setLocalProgress(JSON.parse(stored))
      } catch {
        setLocalProgress({})
      }
    }
  }, [])

  const getProgress = (bookId: string): number => {
    if (isGuest) {
      return localProgress[bookId] || 0
    }
    return dbProgress?.[bookId] || 0
  }

  const setProgress = async (bookId: string, passageIndex: number) => {
    if (isGuest) {
      const newProgress = { ...localProgress, [bookId]: passageIndex }
      setLocalProgress(newProgress)
      localStorage.setItem('terminaltype_sample_progress', JSON.stringify(newProgress))
    } else {
      try {
        await updateDbProgress({ bookId, passageIndex })
      } catch (error) {
        console.error('Failed to save progress:', error)
      }
    }
  }

  return {
    getProgress,
    setProgress,
    allProgress: isGuest ? localProgress : (dbProgress || {})
  }
}