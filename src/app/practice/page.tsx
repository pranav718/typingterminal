"use client"

import type React from "react"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { processPDFClient } from "../utils/clientPdfProcessor"
import { useAuth } from "../hooks/useAuth"
import { useSettings } from "../hooks/useSettings"
import { useSampleBookProgress } from "../hooks/useSampleBookProgress"
import Settings from "../components/Settings"
import TypingArea from "../components/Typing/TypingArea"
import StatsDisplay from "../components/Typing/StatsDisplay"
import CompletionCard from "../components/Typing/CompletionCard"
import { SAMPLE_BOOKS } from "../data/sampleBooks"
import "../terminal.css"

const FileUpload = dynamic(() => import("../components/FileUpload"), {
  ssr: false,
})

function PracticeContent() {
  const { user, isGuest, logout, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { settings, updateSettings } = useSettings()
  const { getProgress, setProgress } = useSampleBookProgress(isGuest)

  const bookIdFromUrl = searchParams.get("book")
  const uploadedBookIdFromUrl = searchParams.get("uploaded")
  const uploadFromUrl = searchParams.get("upload") === "true"

  const [showSettings, setShowSettings] = useState(false)
  const [showUpload, setShowUpload] = useState(uploadFromUrl)
  const [isProcessing, setIsProcessing] = useState(false)

  const [currentSampleBook, setCurrentSampleBook] = useState<(typeof SAMPLE_BOOKS)[0] | null>(null)
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0)
  const [text, setText] = useState("")

  const [currentBookId, setCurrentBookId] = useState<Id<"books"> | null>(null)
  const [isLoadingBook, setIsLoadingBook] = useState(false)
  const [lastSavedPosition, setLastSavedPosition] = useState<number>(-1)

  const saveBook = useMutation(api.books.saveBook)
  const updateLastPosition = useMutation(api.books.updateLastPosition)
  const saveSession = useMutation(api.sessions.saveSession)

  const currentBookData = useQuery(api.books.getBookWithPassages, currentBookId ? { bookId: currentBookId } : "skip")

  const [userInput, setUserInput] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [errors, setErrors] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [isComplete, setIsComplete] = useState(false)
  const [liveWpm, setLiveWpm] = useState(0)
  const [liveAccuracy, setLiveAccuracy] = useState(100)

  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isLoading) return;
    
    if (bookIdFromUrl && !currentSampleBook && !uploadedBookIdFromUrl) {
      const book = SAMPLE_BOOKS.find((b) => b.id === bookIdFromUrl)
      if (book) {
        const savedProgress = getProgress(bookIdFromUrl)
        setCurrentSampleBook(book)
        setCurrentPassageIndex(savedProgress)
        setText(book.passages[savedProgress])
        setCurrentBookId(null)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }
  }, [bookIdFromUrl, getProgress, uploadedBookIdFromUrl, isLoading, isGuest])

  useEffect(() => {
    if (uploadedBookIdFromUrl && !currentBookId) {
      try {
        const bookId = uploadedBookIdFromUrl as Id<"books">
        setCurrentBookId(bookId)
        setCurrentSampleBook(null)
        setIsLoadingBook(true)
      } catch (error) {
        console.error("Invalid book ID:", error)
        router.push("/")
      }
    }
  }, [uploadedBookIdFromUrl, currentBookId, router])

  useEffect(() => {
    if (currentBookData && currentBookId) {
      setCurrentSampleBook(null)
      setText(currentBookData.passages[currentBookData.lastReadPosition].content)
      setCurrentPassageIndex(currentBookData.lastReadPosition)
      setLastSavedPosition(currentBookData.lastReadPosition)
      setIsLoadingBook(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [currentBookData, currentBookId])

  useEffect(() => {
    if (currentSampleBook && currentPassageIndex !== undefined) {
      if (isInitialMount.current) {
        isInitialMount.current = false
        return
      }
      
      setProgress(currentSampleBook.id, currentPassageIndex)
    }
  }, [currentPassageIndex, currentSampleBook, setProgress])

  useEffect(() => {
    if (currentBookId && currentPassageIndex !== lastSavedPosition && !isLoadingBook && !isGuest) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        updateLastPosition({ bookId: currentBookId, position: currentPassageIndex })
          .then(() => setLastSavedPosition(currentPassageIndex))
          .catch(console.error)
      }, 2000)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [currentPassageIndex, currentBookId, isLoadingBook, isGuest, lastSavedPosition, updateLastPosition])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (startTime && userInput.length > 0) {
      interval = setInterval(() => {
        const now = Date.now()
        const timeElapsed = (now - startTime) / 60000
        const wordsTyped = userInput
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length
        const currentWpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0
        setLiveWpm(currentWpm)
      }, 100)
    } else {
      setLiveWpm(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [startTime, userInput])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isComplete && e.key.length === 1 && !showUpload && !showSettings && !isLoadingBook && user) {
        inputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isComplete, showUpload, showSettings, isLoadingBook, user])

  const resetTypingState = () => {
    setUserInput("")
    setStartTime(null)
    setErrors(0)
    setWpm(0)
    setAccuracy(100)
    setLiveWpm(0)
    setLiveAccuracy(100)
    setIsComplete(false)
  }

  const handleFileUpload = async (file: File) => {
    if (isGuest) {
      alert("Please sign up or log in to upload books.")
      setShowUpload(false)
      return
    }

    resetTypingState()
    setIsProcessing(true)

    try {
      const processedBook = await processPDFClient(file)

      if (processedBook.passages.length > 0 && processedBook.passages[0] !== "No readable text found in this PDF.") {
        const bookId = await saveBook({
          title: processedBook.title,
          passages: processedBook.passages,
          isPublic: false,
        })

        setCurrentBookId(bookId)
        setCurrentSampleBook(null)
        setShowUpload(false)

        router.push(`/practice?uploaded=${bookId}`)
      } else {
        alert("No suitable passages found in this PDF. Please try another book.")
      }
    } catch (error: any) {
      console.error("Error processing PDF:", error)
      alert(error.message || "Error processing PDF. Please try another file.")
    } finally {
      setIsProcessing(false)
    }
  }

  const skipPassage = () => {
    if (currentSampleBook) {
      const nextIndex = (currentPassageIndex + 1) % currentSampleBook.passages.length
      setCurrentPassageIndex(nextIndex)
      setText(currentSampleBook.passages[nextIndex])
    } else if (currentBookData) {
      const nextIndex = (currentPassageIndex + 1) % currentBookData.passages.length
      setCurrentPassageIndex(nextIndex)
      setText(currentBookData.passages[nextIndex].content)
    }

    resetTypingState()
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleNextPassage = () => {
    skipPassage()
  }

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
      const currentAccuracy = Math.round(((input.length - errorCount) / input.length) * 100)
      setLiveAccuracy(currentAccuracy)
    }

    if (input.length === text.length && startTime) {
      const now = Date.now()
      const timeTaken = (now - startTime) / 60000
      const words = text.trim().split(/\s+/).length
      const finalWPM = Math.round(words / timeTaken)
      const finalAccuracy = Math.round(((text.length - errorCount) / text.length) * 100)

      setWpm(finalWPM)
      setAccuracy(finalAccuracy)
      setIsComplete(true)

      if (user) {
        saveSession({
          bookId: currentBookId ?? undefined,
          passageIndex: currentPassageIndex,
          wpm: finalWPM,
          accuracy: finalAccuracy,
          errors: errorCount,
        }).catch(err => {
          console.error('Failed to save session:', err)
        })
      }
    }
  }

  const displayWpm = isComplete ? wpm : liveWpm
  const displayAccuracy = isComplete ? accuracy : liveAccuracy

  const currentBook = currentSampleBook
    ? {
        title: `${currentSampleBook.title} by ${currentSampleBook.author}`,
        totalPassages: currentSampleBook.passages.length,
      }
    : currentBookData
      ? { title: currentBookData.title, totalPassages: currentBookData.totalPassages }
      : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-matrix-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-matrix-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 md:p-5 bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl backdrop-blur-sm">
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
            <h1 className="text-2xl md:text-3xl font-bold text-matrix-primary drop-shadow-glow-lg">TerminalType</h1>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 w-full md:w-auto">
            {user && (
              <div className="flex items-center justify-between gap-3 px-3 py-2 bg-matrix-primary/10 rounded-md text-sm text-matrix-light w-full md:w-auto">
                <div className="flex items-center gap-2">
                  {user.image && !isGuest && (
                    <img src={user.image} alt={user.name || "User"} className="w-6 h-6 rounded-full" />
                  )}
                  <span className="truncate">{isGuest ? "Guest User" : user.email || user.name}</span>
                  {isGuest && <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs rounded">Guest</span>}
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1 text-xs border-2 border-error text-error rounded hover:bg-error hover:text-matrix-bg transition-all min-h-[36px]"
                >
                  Logout
                </button>
              </div>
            )}

            <button
              onClick={() => setShowSettings(true)}
              className="w-full md:w-auto px-4 py-2.5 border-2 border-cyan-500 text-cyan-500 rounded-md hover:bg-cyan-500 hover:text-matrix-bg transition-all font-semibold text-sm min-h-[44px] flex items-center justify-center gap-2"
            >
              ⚙️ Settings
            </button>

            {!isComplete && !showUpload && !isLoadingBook && (
              <button
                onClick={skipPassage}
                className="w-full md:w-auto px-4 py-2.5 border-2 border-warning text-warning rounded-md hover:bg-warning hover:text-matrix-bg transition-all font-semibold text-sm min-h-[44px]"
              >
                Skip Passage
              </button>
            )}
          </div>
        </header>

        <Settings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingsChange={updateSettings}
        />

        {showUpload && !isGuest && <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />}

        {currentBook && !isLoadingBook && !showUpload && (
          <div className="mb-4 p-4 bg-gradient-to-r from-matrix-primary/10 to-matrix-primary/5 border border-matrix-primary/20 rounded-lg backdrop-blur-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{currentBookId ? "📄" : "📖"}</span>
                  <h3 className="text-base md:text-lg font-semibold text-matrix-primary">{currentBook.title}</h3>
                </div>
                <div className="text-sm text-matrix-light">
                  Passage {currentPassageIndex + 1} of {currentBook.totalPassages}
                </div>
              </div>

              <div className="w-full md:w-48">
                <div className="flex justify-between text-xs text-matrix-light mb-1">
                  <span>Progress</span>
                  <span>{Math.round(((currentPassageIndex + 1) / currentBook.totalPassages) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-matrix-primary/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-matrix-primary to-cyan-500 transition-all duration-300"
                    style={{ width: `${((currentPassageIndex + 1) / currentBook.totalPassages) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoadingBook && (
          <div className="mb-8 p-8 bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-matrix-primary border-t-transparent mb-4"></div>
            <p className="text-matrix-primary animate-pulse">Loading book...</p>
          </div>
        )}

        <TypingArea
          text={text}
          userInput={userInput}
          isComplete={isComplete}
          isDisabled={isLoadingBook || !text}
          settings={settings}
        />

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className="hidden-input"
          disabled={isComplete || showUpload || showSettings || isLoadingBook || !user || !text}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        <StatsDisplay wpm={displayWpm} accuracy={displayAccuracy} errors={errors} />

        {isComplete && !isLoadingBook && (
          <CompletionCard wpm={wpm} accuracy={accuracy} errors={errors} onNext={handleNextPassage} />
        )}

        {!isComplete && userInput.length === 0 && !showUpload && !isLoadingBook && user && text && (
          <div className="mt-6 text-center text-sm text-matrix-light/60 animate-pulse">Start typing...</div>
        )}
      </div>
    </div>
  )
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-matrix-primary border-t-transparent mb-4"></div>
            <p className="text-matrix-primary text-xl animate-pulse">Loading...</p>
          </div>
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  )
}