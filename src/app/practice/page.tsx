"use client"

import type React from "react"
import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { processBookFile } from "../utils/fileProcessor"
import { useAuth } from "../hooks/useAuth"
import { useSettings } from "../hooks/useSettings"
import { useSampleBookProgress } from "../hooks/useSampleBookProgress"
import Settings from "../components/Settings"
import { SAMPLE_BOOKS } from "../data/sampleBooks"
import PracticeHeader from "../components/PracticeHeader"
import BookProgress from "../components/BookProgress"
import PracticeLayout from "../components/PracticeLayout"
import InstructionModal from "../components/InstructionModal"
import { 
generateRandomWords, 
type DifficultyLevel 
} from "../utils/randomWords"
import "../terminal.css"

const FileUpload = dynamic(() => import("../components/FileUpload"), { ssr: false })

type PracticeMode = 'BOOKS' | 'RANDOM'

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

  const [showInstruction, setShowInstruction] = useState(false)
  const [pendingBook, setPendingBook] = useState<(typeof SAMPLE_BOOKS)[0] | null>(null)

  const [showSelectionScreen, setShowSelectionScreen] = useState(true)
  const [selectionMode, setSelectionMode] = useState<PracticeMode>('BOOKS')
  const [wordCount, setWordCount] = useState(50)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium')
  const [isGenerating, setIsGenerating] = useState(false)

  const [currentSampleBook, setCurrentSampleBook] = useState<(typeof SAMPLE_BOOKS)[0] | null>(null)
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0)
  const [text, setText] = useState("")
  const [passageSource, setPassageSource] = useState("")

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

    if (bookIdFromUrl && !uploadedBookIdFromUrl) {
      const book = SAMPLE_BOOKS.find((b) => b.id === bookIdFromUrl)
      if (book) {
        setPendingBook(book)
        setShowInstruction(true)
      }
    } else if (uploadedBookIdFromUrl) {
      setShowSelectionScreen(false)
    } else {
      setShowSelectionScreen(true)
    }
  }, [bookIdFromUrl, uploadedBookIdFromUrl, isLoading])

  const handleBookClick = (book: typeof SAMPLE_BOOKS[0]) => {
    setPendingBook(book)
    setShowInstruction(true)
  }

  const handleInstructionConfirm = () => {
    setShowInstruction(false)
    if (pendingBook) {
      loadSampleBook(pendingBook)
      setPendingBook(null)
    }
  }

  const loadSampleBook = (book: typeof SAMPLE_BOOKS[0]) => {
    const savedProgress = getProgress(book.id)
    setCurrentSampleBook(book)
    setCurrentPassageIndex(savedProgress)
    setText(book.passages[savedProgress])
    setPassageSource(`${book.title} - Passage ${savedProgress + 1}`)
    setCurrentBookId(null)
    setShowSelectionScreen(false)
    resetTypingState()
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const startRandomPractice = async () => {
    setIsGenerating(true)
    try {
      let newText = ""
      let source = ""

      if (selectionMode === 'RANDOM') {
        newText = await generateRandomWords({ wordCount, difficulty })
        source = `Random Words (${wordCount}, ${difficulty})`
      } 

      setText(newText)
      setPassageSource(source)
      setCurrentSampleBook(null)
      setCurrentBookId(null)
      setCurrentPassageIndex(0)
      setShowSelectionScreen(false)
      resetTypingState()
      setTimeout(() => inputRef.current?.focus(), 100)
    } catch (error) {
      console.error("Generation failed", error)
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (uploadedBookIdFromUrl && !currentBookId) {
      try {
        const bookId = uploadedBookIdFromUrl as Id<"books">
        setCurrentBookId(bookId)
        setCurrentSampleBook(null)
        setIsLoadingBook(true)
        setShowSelectionScreen(false)
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
      setPassageSource(currentBookData.title)
      setCurrentPassageIndex(currentBookData.lastReadPosition)
      setLastSavedPosition(currentBookData.lastReadPosition)
      setIsLoadingBook(false)
      setShowSelectionScreen(false)
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
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        updateLastPosition({ bookId: currentBookId, position: currentPassageIndex })
          .then(() => setLastSavedPosition(currentPassageIndex))
          .catch(console.error)
      }, 2000)
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [currentPassageIndex, currentBookId, isLoadingBook, isGuest, lastSavedPosition, updateLastPosition])

  const skipPassage = async () => {
    if (currentSampleBook) {
      const nextIndex = (currentPassageIndex + 1) % currentSampleBook.passages.length
      setCurrentPassageIndex(nextIndex)
      setText(currentSampleBook.passages[nextIndex])
      setPassageSource(`${currentSampleBook.title} - Passage ${nextIndex + 1}`)
    } else if (currentBookData) {
      const nextIndex = (currentPassageIndex + 1) % currentBookData.passages.length
      setCurrentPassageIndex(nextIndex)
      setText(currentBookData.passages[nextIndex].content)
    } else {
      startRandomPractice()
      return
    }
    resetTypingState()
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleNextPassage = () => {
    skipPassage()
  }

  const countCorrectWords = (input: string, reference: string): number => {
    if (!input || !reference) return 0
    let correctChars = 0
    const minLength = Math.min(input.length, reference.length)
    for (let i = 0; i < minLength; i++) {
      if (input[i] === reference[i]) correctChars++
    }
    return correctChars / 5
  }

  useEffect(() => {
    if (!startTime || isComplete) return

    const interval = setInterval(() => {
      const timeElapsed = (Date.now() - startTime) / 60000
      if (timeElapsed > 0) {
        const correctWords = countCorrectWords(userInput, text)
        setLiveWpm(Math.round(correctWords / timeElapsed))
      }
    }, 100)

    return () => clearInterval(interval)
  }, [startTime, userInput, text, isComplete])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComplete || isLoadingBook) return
    const input = e.target.value
    if (input.length > text.length) return

    if (!startTime && input.length === 1) setStartTime(Date.now())
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
      const correctChars = text.length - errorCount
      const finalWPM = timeTaken > 0 ? Math.round((correctChars / 5) / timeTaken) : 0
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
        }).catch(console.error)
      }
    }
  }

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
      const processedBook = await processBookFile(file)
      if (processedBook.passages.length > 0) {
        const bookId = await saveBook({
          title: processedBook.title,
          passages: processedBook.passages,
          isPublic: false,
        })
        setCurrentBookId(bookId)
        setCurrentSampleBook(null)
        setShowUpload(false)
        setShowSelectionScreen(false)
        router.push(`/practice?uploaded=${bookId}`)
      } else {
        alert("No suitable passages found.")
      }
    } catch (error: any) {
      alert(error.message || "Error processing book.")
    } finally {
      setIsProcessing(false)
    }
  }

  const renderText = () => {
    return text.split("").map((char, index) => {
      let className = "inline-block transition-all duration-150"
      let style: React.CSSProperties = { whiteSpace: "pre" }
      if (index < userInput.length) {
        if (userInput[index] === char) className += " text-[#41ff5f] drop-shadow-glow"
        else className += ` text-[#ff5f41] bg-[#ff5f4120] px-0.5 rounded`
      } else if (index === userInput.length) {
        className += " bg-[#41ff5f40] rounded px-1 -mx-0.5 scale-110 animate-pulse"
      } else {
        className += " text-[#7bff9a]"
        style.opacity = settings?.textOpacity ?? 0.3
      }
      return <span key={index} className={className} style={style}>{char === " " ? "\u00A0" : char}</span>
    })
  }

  const currentBook = currentSampleBook
    ? { title: `${currentSampleBook.title}`, totalPassages: currentSampleBook.passages.length }
    : currentBookData
      ? { title: currentBookData.title, totalPassages: currentBookData.totalPassages }
      : null

  const displayWpm = isComplete ? wpm : liveWpm
  const displayAccuracy = isComplete ? accuracy : liveAccuracy

  return (
    <PracticeLayout>
      <PracticeHeader
        user={user}
        isGuest={isGuest}
        logout={logout}
        onSettingsClick={() => setShowSettings(true)}
        onSkipClick={skipPassage}
        showUpload={showUpload}
        isComplete={isComplete}
        isLoadingBook={isLoadingBook}
        showSelectionScreen={showSelectionScreen}
        onBackClick={() => {
          if (!showSelectionScreen) {
            setShowSelectionScreen(true)
            resetTypingState()
            window.history.replaceState(null, '', '/practice')
          } else {
            router.push('/')
          }
        }}
      />

      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} onSettingsChange={updateSettings} />

      <InstructionModal 
        isOpen={showInstruction}
        onClose={() => setShowInstruction(false)}
        onConfirm={handleInstructionConfirm}
      />

      {showSelectionScreen && !showUpload ? (
        <div className="terminal-window p-6 animate-fade-in">
          <h2 className="text-xl font-bold text-[#41ff5f] text-shadow-glow mb-6 tracking-widest border-b border-[#41ff5f40] pb-2">
            INITIATE PRACTICE SESSION
          </h2>

          <div className="flex gap-2 mb-6">
            {(['BOOKS', 'RANDOM'] as PracticeMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectionMode(mode)}
                className={`flex-1 py-2 border-2 rounded text-sm font-bold transition-all ${
                  selectionMode === mode 
                    ? 'bg-[#41ff5f] text-[#00120b] border-[#41ff5f]' 
                    : 'bg-transparent text-[#7bff9a] border-[#41ff5f30] hover:border-[#41ff5f]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {selectionMode === 'BOOKS' && (
            <div className="space-y-4">
              {!isGuest && (
                <button
                  onClick={() => router.push("/practice?upload=true")}
                  className="w-full py-3 border border-dashed border-[#41ff5f] text-[#41ff5f] hover:bg-[#41ff5f10] transition-all text-sm"
                >
                  + UPLOAD BOOK (PDF / EPUB)
                </button>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {SAMPLE_BOOKS.map((book) => {
                  const prog = getProgress(book.id)
                  return (
                    <div
                      key={book.id}
                      onClick={() => handleBookClick(book)}
                      className="p-3 border border-[#41ff5f30] rounded hover:bg-[#003018] cursor-pointer group transition-all"
                    >
                      <h3 className="font-bold text-[#41ff5f] text-sm truncate group-hover:text-shadow-glow">{book.title}</h3>
                      <p className="text-xs text-[#7bff9a]/60 truncate">{book.author}</p>
                      {prog > 0 && (
                        <div className="mt-2 h-1 bg-[#41ff5f20] rounded-full overflow-hidden">
                          <div className="h-full bg-[#41ff5f]" style={{ width: `${(prog / book.passages.length) * 100}%` }} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {selectionMode === 'RANDOM' && (
            <div className="space-y-6 p-4 border border-[#41ff5f20] rounded bg-[#003018]/20">
              
              <p className="text-xs text-[#7bff9a]/80 italic mb-2">
                (suggestion: start with easy difficulty and 20 words)
              </p>

              <div>
                <label className="text-xs text-[#7bff9a]/60 mb-2 block uppercase">Word Count: {wordCount}</label>
                <input 
                  type="range" min="10" max="100" step="10" value={wordCount} 
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full h-2 bg-[#41ff5f20] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#41ff5f]"
                />
              </div>

              <div>
                <label className="text-xs text-[#7bff9a]/60 mb-2 block uppercase">DIFFICULTY: {difficulty}</label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setDifficulty(lvl)}
                      className={`flex-1 py-2 border rounded text-xs font-bold uppercase transition-all ${
                        difficulty === lvl
                          ? 'bg-[#41ff5f] text-[#00120b] border-[#41ff5f]'
                          : 'bg-transparent text-[#7bff9a] border-[#41ff5f30] hover:border-[#41ff5f]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={startRandomPractice} 
                disabled={isGenerating}
                className="w-full terminal-btn py-3 text-lg font-bold"
              >
                {isGenerating ? 'GENERATING...' : 'START PRACTICE >'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {showUpload && !isGuest && <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />}

          {currentBook && !isLoadingBook && !showUpload && (
            <BookProgress
              title={currentBook.title}
              currentPassage={currentPassageIndex}
              totalPassages={currentBook.totalPassages}
              isUploaded={!!currentBookId}
            />
          )}

          {!currentBook && !isLoadingBook && !showUpload && text && (
            <div className="terminal-window p-3 mb-4 flex justify-between items-center">
              <span className="text-xs text-[#7bff9a]/60">MODE: RANDOM</span>
              <span className="text-sm text-[#41ff5f] font-bold">{passageSource}</span>
            </div>
          )}

          {isLoadingBook && (
            <div className="terminal-window p-8 text-center mb-6">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#41ff5f] border-t-transparent mb-4"></div>
              <p className="text-[#41ff5f] animate-pulse">LOADING DATA...</p>
            </div>
          )}

          <div className={`terminal-window p-6 mb-6 min-h-[300px] ${isLoadingBook || !text ? "opacity-50" : ""}`}>
            <div className="text-xs text-[#7bff9a]/60 mb-3 uppercase tracking-wider">TEXT BUFFER:</div>
            <div className="text-lg md:text-xl leading-relaxed font-mono">
              {isLoadingBook || !text ? (
                <div className="text-[#41ff5f] animate-pulse">LOADING...</div>
              ) : (
                renderText()
              )}
            </div>
          </div>

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

          {isComplete && !isLoadingBook && (
            <div className="terminal-window p-6 text-center animate-slide-up">
              <h3 className="text-2xl md:text-3xl font-bold text-[#41ff5f] mb-4 text-shadow-glow">SESSION COMPLETE</h3>
              <div className="flex flex-col md:flex-row justify-around gap-4 mb-6">
                <div className="px-4 py-2 bg-[#003018]/30 border border-[#41ff5f20] rounded">
                  <span className="text-sm text-[#7bff9a]/80">FINAL WPM: {wpm}</span>
                </div>
                <div className="px-4 py-2 bg-[#003018]/30 border border-[#41ff5f20] rounded">
                  <span className="text-sm text-[#7bff9a]/80">ACCURACY: {accuracy}%</span>
                </div>
              </div>
              <button onClick={handleNextPassage} className="terminal-btn text-lg px-8 py-3">
                NEXT SEQUENCE
              </button>
            </div>
          )}

          {!isComplete && userInput.length === 0 && !showUpload && !isLoadingBook && user && text && (
            <div className="text-center text-sm text-[#7bff9a]/60 animate-pulse">START TYPING TO BEGIN...</div>
          )}
        </>
      )}
    </PracticeLayout>
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