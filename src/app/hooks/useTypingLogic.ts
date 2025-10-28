'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

export function useTypingLogic(
  text: string,
  currentBookId: Id<"books"> | null,
  currentPassageIndex: number,
  isGuest: boolean,
  isLoadingBook: boolean
) {
  const [userInput, setUserInput] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [errors, setErrors] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [isComplete, setIsComplete] = useState(false)
  const [liveWpm, setLiveWpm] = useState(0)
  const [liveAccuracy, setLiveAccuracy] = useState(100)

  const inputRef = useRef<HTMLInputElement>(null)
  const saveSession = useMutation(api.sessions.saveSession)

  useEffect(() => {
    if (!startTime || userInput.length === 0) {
      setLiveWpm(0)
      return
    }

    const interval = setInterval(() => {
      const timeElapsed = (Date.now() - startTime) / 60000
      const wordsTyped = userInput.trim().split(/\s+/).filter(w => w.length > 0).length
      setLiveWpm(timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0)
    }, 100)

    return () => clearInterval(interval)
  }, [startTime, userInput])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isComplete && e.key.length === 1 && !isLoadingBook) {
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isComplete, isLoadingBook])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComplete || isLoadingBook) return

    const input = e.target.value
    if (input.length > text.length) return

    if (!startTime && input.length === 1) {
      setStartTime(Date.now())
    }

    setUserInput(input)

    let errorCount = 0
    for (let i = 0; i < input.length; i++) {
      if (input[i] !== text[i]) errorCount++
    }
    setErrors(errorCount)

    if (input.length > 0) {
      setLiveAccuracy(Math.round(((input.length - errorCount) / input.length) * 100))
    }

    if (input.length === text.length && startTime) {
      const timeTaken = (Date.now() - startTime) / 60000
      const words = text.trim().split(/\s+/).length
      const finalWPM = Math.round(words / timeTaken)
      const finalAccuracy = Math.round(((text.length - errorCount) / text.length) * 100)

      setWpm(finalWPM)
      setAccuracy(finalAccuracy)
      setIsComplete(true)

      if (!isGuest) {
        saveSession({
          bookId: currentBookId ?? undefined,
          passageIndex: currentPassageIndex,
          wpm: finalWPM,
          accuracy: finalAccuracy,
          errors: errorCount,
        }).catch(console.error)
      }
    }
  }

  const resetTypingState = () => {
    setUserInput('')
    setStartTime(null)
    setErrors(0)
    setWpm(0)
    setAccuracy(100)
    setLiveWpm(0)
    setLiveAccuracy(100)
    setIsComplete(false)
  }

  return {
    userInput,
    errors,
    wpm,
    accuracy,
    isComplete,
    liveWpm,
    liveAccuracy,
    inputRef,
    handleInputChange,
    resetTypingState,
    displayWpm: isComplete ? wpm : liveWpm,
    displayAccuracy: isComplete ? accuracy : liveAccuracy,
  }
}