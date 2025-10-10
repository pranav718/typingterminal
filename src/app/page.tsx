'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { processPDFClient, ProcessedBook } from './utils/clientPdfProcessor'
import { useAuth } from './hooks/useAuth'
import { useSettings } from './hooks/useSettings'
import AuthModal from './components/Auth/AuthModal'
import Settings from './components/Settings'
import BookList from './components/Books/BookList'
import TypingArea from './components/Typing/TypingArea'
import StatsDisplay from './components/Typing/StatsDisplay'
import CompletionCard from './components/Typing/CompletionCard'
import './terminal.css'

const FileUpload = dynamic(() => import('./components/FileUpload'), {
  ssr: false
})

function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

export default function Home() {
  const { user, dbUser, isLoading: authLoading, isGuest, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Convex queries and mutations
  const userBooks = useQuery(
    api.books.getUserBooks, 
    dbUser ? { userId: dbUser._id } : "skip"
  );
  const publicBooks = useQuery(api.books.getPublicBooks);
  const saveBook = useMutation(api.books.saveBook);
  const updateLastPosition = useMutation(api.books.updateLastPosition);
  const saveSession = useMutation(api.sessions.saveSession);

  // State
  const [currentBookId, setCurrentBookId] = useState<Id<"books"> | null>(null);
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [lastSavedPosition, setLastSavedPosition] = useState<number>(-1);
  
  const currentBookData = useQuery(
    api.books.getBookWithPassages,
    currentBookId ? { bookId: currentBookId } : "skip"
  );

  const defaultTexts = [
    'The only real test of intelligence is if you get what you want out of life',
    'I think, therefore I am.',
    'You can skip all the parties, all the conferences, all the press, all the tweets. Build a great product and get users and win.',
    'The quick brown fox jumps over the lazy dog.'
  ]

  const [book, setBook] = useState<ProcessedBook | null>(null)
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0)
  const [text, setText] = useState(defaultTexts[0])
  const [userInput, setUserInput] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [errors, setErrors] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [isComplete, setIsComplete] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [liveWpm, setLiveWpm] = useState(0)
  const [liveAccuracy, setLiveAccuracy] = useState(100)

  const inputRef = useRef<HTMLInputElement>(null)

  // Load book data
  useEffect(() => {
    if (currentBookData && currentBookId) {
      setBook({
        title: currentBookData.title,
        passages: currentBookData.passages.map(p => p.content),
      });
      setCurrentPassageIndex(currentBookData.lastReadPosition);
      setLastSavedPosition(currentBookData.lastReadPosition);
      setText(currentBookData.passages[currentBookData.lastReadPosition].content);
      
      setIsLoadingBook(false);
      
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [currentBookData, currentBookId]);

  // Reset on book change
  useEffect(() => {
    if (currentBookId) {
      setIsLoadingBook(true);
      resetTypingState();
    }
  }, [currentBookId]);

  // Debounced position save
  const debouncedUpdatePosition = useDebounce((bookId: Id<"books">, position: number) => {
    if (bookId && position !== lastSavedPosition) {
      updateLastPosition({ bookId, position })
        .then(() => setLastSavedPosition(position))
        .catch(console.error);
    }
  }, 2000);

  useEffect(() => {
    if (currentBookId && currentPassageIndex > 0 && !isLoadingBook && !isGuest) {
      debouncedUpdatePosition(currentBookId, currentPassageIndex);
    }
  }, [currentPassageIndex, currentBookId, isLoadingBook, isGuest]);

  // Live WPM calculation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (startTime && userInput.length > 0) {
      interval = setInterval(() => {
        const now = Date.now()
        const timeElapsed = (now - startTime) / 60000
        const wordsTyped = userInput.trim().split(/\s+/).filter(word => word.length > 0).length
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

  // Auto-focus on mount and key press
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isComplete && e.key.length === 1 && !showUpload && !showSettings && !isLoadingBook && user) {
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isComplete, showUpload, showSettings, isLoadingBook, user])

  // Helper functions
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

  const handleFileUpload = async (file: File) => {
    if (isGuest) {
      alert('Please sign up or log in to upload books. Guest users can only practice with sample books.');
      setShowUpload(false);
      return;
    }

    if (!dbUser) {
      alert('Please wait for authentication to complete');
      return;
    }

    resetTypingState();
    setIsProcessing(true)

    try {
      const processedBook = await processPDFClient(file)

      if (processedBook.passages.length > 0 && processedBook.passages[0] !== 'No readable text found in this PDF.') {
        const bookId = await saveBook({
          userId: dbUser._id,
          title: processedBook.title,
          passages: processedBook.passages,
          isPublic: false,
        });
        
        setCurrentBookId(bookId);
        setShowUpload(false)
      } else {
        alert('No suitable passages found in this PDF. Please try another book.')
      }
    } catch (error: any) {
      console.error('Error processing PDF:', error)
      alert(error.message || 'Error processing PDF. Please try another file.')
    } finally {
      setIsProcessing(false)
    }
  }

  const skipPassage = () => {
    if (book && book.passages.length > 0) {
      const nextIndex = (currentPassageIndex + 1) % book.passages.length
      setCurrentPassageIndex(nextIndex)
      setText(book.passages[nextIndex])
    } else {
      const newText = defaultTexts[Math.floor(Math.random() * defaultTexts.length)]
      setText(newText)
    }

    resetTypingState()
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleNextPassage = () => {
    if (book && book.passages.length > 0) {
      const nextIndex = (currentPassageIndex + 1) % book.passages.length
      setCurrentPassageIndex(nextIndex)
      setText(book.passages[nextIndex])
    } else {
      const newText = defaultTexts[Math.floor(Math.random() * defaultTexts.length)]
      setText(newText)
    }

    resetTypingState()
    setTimeout(() => inputRef.current?.focus(), 0)
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

      if (dbUser && !isGuest) {
        saveSession({
          userId: dbUser._id,
          bookId: currentBookId ?? undefined,
          passageIndex: currentPassageIndex,
          wpm: finalWPM,
          accuracy: finalAccuracy,
          errors: errorCount,
        })
      }
    }
  }

  const displayWpm = isComplete ? wpm : liveWpm
  const displayAccuracy = isComplete ? accuracy : liveAccuracy

  // Show auth modal if not logged in
  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Background blur with sample books preview */}
        <div className="fixed inset-0 pointer-events-none opacity-30 blur-sm">
          <div className="max-w-4xl mx-auto mt-20 px-4">
            <h1 className="text-3xl font-bold text-matrix-primary text-center mb-8">
              TerminalType
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-matrix-primary/10 border border-matrix-primary/20 rounded-lg"
                >
                  <div className="h-4 bg-matrix-primary/20 rounded mb-2"></div>
                  <div className="h-3 bg-matrix-primary/10 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AuthModal />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-matrix-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-matrix-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 md:p-5 bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl backdrop-blur-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-matrix-primary drop-shadow-glow-lg">
            TerminalType
          </h1>
          
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 w-full md:w-auto">
            {user && (
              <div className="flex items-center justify-between gap-3 px-3 py-2 bg-matrix-primary/10 rounded-md text-sm text-matrix-light w-full md:w-auto">
                <div className="flex items-center gap-2">
                  {user.image && (
                    <img 
                      src={user.image} 
                      alt={user.name || 'User'} 
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="truncate">
                    {isGuest ? 'Guest User' : user.email}
                  </span>
                  {isGuest && (
                    <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs rounded">
                      Guest
                    </span>
                  )}
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
            
            <button
              onClick={() => {
                if (isGuest && !showUpload) {
                  alert('Please sign up or log in to upload books');
                  return;
                }
                if (!showUpload) {
                  resetTypingState();
                }
                setShowUpload(!showUpload)
              }}
              className="w-full md:w-auto px-4 py-2.5 border-2 border-matrix-primary text-matrix-primary rounded-md hover:bg-matrix-primary hover:text-matrix-bg transition-all font-semibold text-sm min-h-[44px]"
            >
              {showUpload ? 'Close' : 'Upload Book PDF'}
            </button>
          </div>
        </header>

        <Settings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingsChange={updateSettings}
        />

        {showUpload && !isGuest && (
          <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
        )}

        {/* Public/Sample Books */}
        {publicBooks && publicBooks.length > 0 && !showUpload && (
          <BookList
            books={publicBooks}
            currentBookId={currentBookId}
            onBookSelect={setCurrentBookId}
            isLoading={isLoadingBook}
            title="Sample Books"
          />
        )}

        {/* User Books (only for non-guest users) */}
        {!isGuest && userBooks && userBooks.length > 0 && !showUpload && (
          <BookList
            books={userBooks}
            currentBookId={currentBookId}
            onBookSelect={setCurrentBookId}
            isLoading={isLoadingBook}
            title="Your Books"
          />
        )}

        {/* Current Book Info */}
        {book && !isLoadingBook && (
          <div className="flex flex-col md:flex-row justify-between gap-2 mb-4 px-4 py-3 text-sm font-medium text-matrix-light bg-matrix-primary/10 rounded-lg">
            <span>Book: {book.title}</span>
            <span>Passage {currentPassageIndex + 1} of {book.passages.length}</span>
          </div>
        )}

        {/* Typing Area */}
        <TypingArea
          text={text}
          userInput={userInput}
          isComplete={isComplete}
          isDisabled={isLoadingBook}
        />

        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className="hidden-input"
          disabled={isComplete || showUpload || showSettings || isLoadingBook || !user}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {/* Stats Display */}
        <StatsDisplay
          wpm={displayWpm}
          accuracy={displayAccuracy}
          errors={errors}
        />

        {/* Completion Card */}
        {isComplete && !isLoadingBook && (
          <CompletionCard
            wpm={wpm}
            accuracy={accuracy}
            errors={errors}
            onNext={handleNextPassage}
          />
        )}

        {/* Start typing prompt */}
        {!isComplete && userInput.length === 0 && !showUpload && !isLoadingBook && user && (
          <div className="mt-6 text-center text-sm text-matrix-light/60 animate-pulse">
            Start typing...
          </div>
        )}
      </div>
    </div>
  )
}
