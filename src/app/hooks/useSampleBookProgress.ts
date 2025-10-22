'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'

interface SampleBookProgress {
  [bookId: string]: number 
}

export function useSampleBookProgress(isGuest: boolean) {
  const [localProgress, setLocalProgress] = useState<SampleBookProgress>({})
  const localProgressRef = useRef<SampleBookProgress>({})

  useEffect(() => {
    const guestFlag = localStorage.getItem('terminaltype_guest');
    const savedProgress = localStorage.getItem('terminaltype_sample_progress');
  }, [isGuest]);
  
  const dbProgress = useQuery(
    api.books.getSampleBookProgress,
    isGuest ? "skip" : {}
  )
  
  const updateDbProgress = useMutation(api.books.updateSampleBookProgress)

  useEffect(() => {
    const stored = localStorage.getItem('terminaltype_sample_progress')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setLocalProgress(parsed)
        localProgressRef.current = parsed
      } catch {
        setLocalProgress({})
        localProgressRef.current = {}
      }
    }
  }, [])
  useEffect(() => {
    localProgressRef.current = localProgress
  }, [localProgress])

  const getProgress = useCallback((bookId: string): number => {
    const progress = isGuest ? (localProgress[bookId] || 0) : (dbProgress?.[bookId] || 0)
    return progress
  }, [isGuest, localProgress, dbProgress])

  const setProgress = useCallback(async (bookId: string, passageIndex: number) => {

    if (isGuest) {
      if (localProgressRef.current[bookId] === passageIndex) {
        return;
      }
      
      setLocalProgress(prev => {
        const newProgress = { ...prev, [bookId]: passageIndex }
        localStorage.setItem('terminaltype_sample_progress', JSON.stringify(newProgress))
        return newProgress;
      })
    } else {
      try {
        await updateDbProgress({ bookId, passageIndex })
      } catch (error) {
        console.error('Failed to save progress:', error)
      }
    }
  }, [isGuest, updateDbProgress])

  return {
    getProgress,
    setProgress,
    allProgress: isGuest ? localProgress : (dbProgress || {})
  }
}