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
import { SAMPLE_BOOKS } from "../data/sampleBooks"
import "../terminal.css"

const FileUpload = dynamic(() => import("../components/FileUpload"), { ssr: false })

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
    if (isLoading) return
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

  // Save uploaded book progress
  useEffect(() => {
    if (currentBookId && currentPassageIndex !== lastSavedPosition && !isLoadingBook && !isGuest) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(() => {
        updateLastPosition({ bookId: currentBookId, position: currentPassageIndex })
          .then(() => setLastSavedPosition(currentPassageIndex))
          .catch(console.error)
      }, 2000)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [currentPassageIndex, currentBookId, isLoadingBook, isGuest, lastSavedPosition, updateLastPosition])

  // Count correct words
  const countCorrectWords = (input: string, reference: string): number => {
    if (!input || !reference) return 0
    let correctChars = 0
    const minLength = Math.min(input.length, reference.length)
    for (let i = 0; i < minLength; i++) {
      if (input[i] === reference[i]) correctChars++
    }
    return correctChars / 5
  }

  // Calculate live WPM
  useEffect(() => {
    if (!startTime || userInput.length === 0) {
      setLiveWpm(0)
      return
    }

    const interval = setInterval(() => {
      const timeElapsed = (Date.now() - startTime) / 60000
      if (timeElapsed > 0) {
        const correctWords = countCorrectWords(userInput, text)
        setLiveWpm(Math.round(correctWords / timeElapsed))
      }
    }, 100)

    return () => clearInterval(interval)
  }, [startTime, userInput, text])

  // Auto-focus
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Global keydown
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
      const timeTaken = (Date.now() - startTime) / 60000
      const correctWords = countCorrectWords(input, text)
      const finalWPM = timeTaken > 0 ? Math.round(correctWords / timeTaken) : 0
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
        }).catch((err) => {
          console.error("Failed to save session:", err)
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

  const renderText = () => {
    return text.split("").map((char, index) => {
      let className = "inline-block transition-all duration-150"
      let style: React.CSSProperties = { whiteSpace: "pre" }

      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += " text-[#41ff5f] drop-shadow-[0_0_8px_rgba(65,255,95,0.6)]"
        } else {
          const shakeClass = settings?.shakeIntensity !== "off" ? ` animate-shake-${settings?.shakeIntensity || "medium"}` : ""
          className += ` text-[#ff5f41] bg-[#ff5f4120] px-0.5 rounded drop-shadow-[0_0_8px_rgba(255,95,65,0.6)]${shakeClass}`
        }
      } else if (index === userInput.length) {
        className += " bg-[#41ff5f40] rounded px-1 -mx-0.5 scale-110 animate-pulse"
      } else {
        className += " text-[#7bff9a]"
        style.opacity = settings?.textOpacity ?? 0.3
      }

      const displayChar = char === " " ? "\u00A0" : char

      return (
        <span key={index} className={className} style={style}>
          {displayChar}
        </span>
      )
    })
  }

  return (
    <div className="min-h-screen bg-[#00120b] text-[#41ff5f] font-mono relative overflow-hidden">
      {/* Scanline */}
      <div className="scanline" />

      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="grid-lines absolute inset-0" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 p-4 md:p-6">
        {/* HEADER */}
        <header className="terminal-window p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="terminal-btn text-sm"
                title="Back to Home"
              >
                ← HOME
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-widest text-shadow-glow">
                  PRACTICE TERMINAL
                </h1>
                <p className="text-[#7bff9a]/70 text-xs">SYSTEM ACTIVE • READY FOR INPUT</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {user && (
                <div className="text-xs px-3 py-1 bg-[#003018]/50 border border-[#41ff5f30] rounded">
                  {isGuest ? "GUEST" : user.email}
                </div>
              )}

              <button onClick={() => setShowSettings(true)} className="terminal-btn text-xs">
                 SETTINGS
              </button>

              {!isComplete && !showUpload && !isLoadingBook && (
                <button onClick={skipPassage} className="terminal-btn text-xs">
                  SKIP →
                </button>
              )}

              <button onClick={logout} className="px-3 py-1 border border-[#ff5f4180] text-[#ff5f41] rounded hover:bg-[#ff5f4120] text-xs">
                LOGOUT
              </button>
            </div>
          </div>
        </header>

        {/* Settings Modal */}
        <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} onSettingsChange={updateSettings} />

        {/* Upload Section */}
        {showUpload && !isGuest && <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />}

        {/* Book Progress */}
        {currentBook && !isLoadingBook && !showUpload && (
          <div className="terminal-window p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <div className="text-xs text-[#7bff9a]/60 mb-1">CURRENT BOOK:</div>
                <div className="font-bold text-[#41ff5f] text-shadow-glow">{currentBook.title}</div>
                <div className="text-sm text-[#7bff9a]/80 mt-1">
                  Passage {currentPassageIndex + 1} / {currentBook.totalPassages}
                </div>
              </div>

              <div className="w-full md:w-64">
                <div className="flex justify-between text-xs text-[#7bff9a]/60 mb-1">
                  <span>PROGRESS</span>
                  <span>{Math.round(((currentPassageIndex + 1) / currentBook.totalPassages) * 100)}%</span>
                </div>
                <div className="h-2 bg-[#41ff5f20] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#41ff5f] transition-all duration-300"
                    style={{ width: `${((currentPassageIndex + 1) / currentBook.totalPassages) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoadingBook && (
          <div className="terminal-window p-8 text-center mb-6">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#41ff5f] border-t-transparent mb-4"></div>
            <p className="text-[#41ff5f] animate-pulse">LOADING BOOK DATA...</p>
          </div>
        )}

        {/* Typing Area */}
        <div className={`terminal-window p-6 mb-6 min-h-[300px] ${isLoadingBook || !text ? "opacity-50" : ""}`}>
          <div className="text-xs text-[#7bff9a]/60 mb-3 uppercase tracking-wider">TEXT BUFFER:</div>
          <div className="text-lg md:text-xl leading-relaxed font-mono">
            {isLoadingBook || !text ? (
              <div className="text-[#41ff5f] animate-pulse">LOADING PASSAGE...</div>
            ) : (
              renderText()
            )}
          </div>
        </div>

        {/* Hidden Input */}
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

        {/* Stats Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="terminal-window p-4 text-center">
            <div className="text-xs text-[#7bff9a]/60 mb-1">WPM</div>
            <div className="text-3xl md:text-4xl font-bold text-[#41ff5f] text-shadow-glow">{displayWpm}</div>
          </div>

          <div className="terminal-window p-4 text-center">
            <div className="text-xs text-[#7bff9a]/60 mb-1">ACCURACY</div>
            <div className="text-3xl md:text-4xl font-bold text-[#41ff5f] text-shadow-glow">{displayAccuracy}%</div>
          </div>

          <div className="terminal-window p-4 text-center">
            <div className="text-xs text-[#7bff9a]/60 mb-1">ERRORS</div>
            <div className="text-3xl md:text-4xl font-bold text-[#41ff5f] text-shadow-glow">{errors}</div>
          </div>
        </div>

        {/* Completion Card */}
        {isComplete && !isLoadingBook && (
          <div className="terminal-window p-6 text-center animate-slide-up">
            <h3 className="text-2xl md:text-3xl font-bold text-[#41ff5f] mb-4 text-shadow-glow">PASSAGE COMPLETED ✓</h3>

            <div className="flex flex-col md:flex-row justify-around gap-4 mb-6">
              <div className="px-4 py-2 bg-[#003018]/30 border border-[#41ff5f20] rounded">
                <span className="text-sm text-[#7bff9a]/80">FINAL WPM: {wpm}</span>
              </div>
              <div className="px-4 py-2 bg-[#003018]/30 border border-[#41ff5f20] rounded">
                <span className="text-sm text-[#7bff9a]/80">FINAL ACCURACY: {accuracy}%</span>
              </div>
              <div className="px-4 py-2 bg-[#003018]/30 border border-[#41ff5f20] rounded">
                <span className="text-sm text-[#7bff9a]/80">TOTAL ERRORS: {errors}</span>
              </div>
            </div>

            <button onClick={handleNextPassage} className="terminal-btn text-lg px-8 py-3">
              NEXT PASSAGE →
            </button>
          </div>
        )}

        {/* Start Prompt */}
        {!isComplete && userInput.length === 0 && !showUpload && !isLoadingBook && user && text && (
          <div className="text-center text-sm text-[#7bff9a]/60 animate-pulse">START TYPING TO BEGIN...</div>
        )}
      </div>
    </div>
  )
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#00120b] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#41ff5f] border-t-transparent mb-4"></div>
            <p className="text-[#41ff5f] text-xl animate-pulse">LOADING PRACTICE TERMINAL...</p>
          </div>
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  )
}