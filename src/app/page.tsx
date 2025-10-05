'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { processPDFClient, ProcessedBook } from './utils/clientPdfProcessor'
import { useSimpleAuth, LoginModal } from './components/SimpleAuth'
import Settings, { useSettings } from './components/Settings'
import './terminal.css'

const FileUpload = dynamic(() => import('./components/FileUpload'), {
  ssr: false
})

export default function Home() {
  const { user, login, logout } = useSimpleAuth();
  const [showLogin, setShowLogin] = useState(false);
  const { settings, updateSettings } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  
  const dbUser = useQuery(api.users.getCurrentUser, user ? { email: user.email } : "skip");
  const userBooks = useQuery(api.books.getUserBooks, dbUser ? { userId: dbUser._id } : "skip");
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const saveBook = useMutation(api.books.saveBook);
  const updateLastPosition = useMutation(api.books.updateLastPosition);
  const saveSession = useMutation(api.sessions.saveSession);
  
  const [currentBookId, setCurrentBookId] = useState<Id<"books"> | null>(null);
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
  const [showUpload, setShowUpload] = useState(false)
  const [liveWpm, setLiveWpm] = useState(0)
  const [liveAccuracy, setLiveAccuracy] = useState(100)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user && !dbUser) {
      getOrCreateUser({ email: user.email, name: user.name });
    }
  }, [user, dbUser, getOrCreateUser]);

  useEffect(() => {
    if (currentBookData) {
      setBook({
        title: currentBookData.title,
        passages: currentBookData.passages.map(p => p.content),
      });
      setCurrentPassageIndex(currentBookData.lastReadPosition);
      setText(currentBookData.passages[currentBookData.lastReadPosition].content);
    }
  }, [currentBookData]);

  useEffect(() => {
    if (currentBookId && currentPassageIndex > 0) {
      updateLastPosition({ bookId: currentBookId, position: currentPassageIndex });
    }
  }, [currentPassageIndex, currentBookId, updateLastPosition]);

  useEffect(() => {
    if (startTime && userInput.length > 0) {
      const interval = setInterval(() => {
        const now = Date.now()
        const timeElapsed = (now - startTime) / 60000
        const wordsTyped = userInput.trim().split(/\s+/).filter(word => word.length > 0).length
        const currentWpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0
        setLiveWpm(currentWpm)
      }, 100)

      return () => clearInterval(interval)
    } else {
      setLiveWpm(0)
    }
  }, [startTime, userInput])

  const handleFileUpload = async (file: File) => {
    if (!dbUser) {
      setShowLogin(true);
      return;
    }

    setIsProcessing(true)
    try {
      const processedBook = await processPDFClient(file)

      if (processedBook.passages.length > 0 && processedBook.passages[0] !== 'No readable text found in this PDF.') {
        const bookId = await saveBook({
          userId: dbUser._id,
          title: processedBook.title,
          passages: processedBook.passages,
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

  const handleLogin = async (email: string, name?: string) => {
    login(email, name);
    setShowLogin(false);
  };

  const skipPassage = () => {
    if (book && book.passages.length > 0) {
      const nextIndex = (currentPassageIndex + 1) % book.passages.length
      setCurrentPassageIndex(nextIndex)
      setText(book.passages[nextIndex])
    } else {
      const newText = defaultTexts[Math.floor(Math.random() * defaultTexts.length)]
      setText(newText)
    }

    setUserInput('')
    setStartTime(null)
    setErrors(0)
    setWpm(0)
    setAccuracy(100)
    setLiveWpm(0)
    setLiveAccuracy(100)
    setIsComplete(false)

    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  const resetTest = (changeText = true) => {
    if (changeText) {
      if (book && book.passages.length > 0) {
        const nextIndex = (currentPassageIndex + 1) % book.passages.length
        setCurrentPassageIndex(nextIndex)
        setText(book.passages[nextIndex])
      } else {
        const newText = defaultTexts[Math.floor(Math.random() * defaultTexts.length)]
        setText(newText)
      }
    }

    setUserInput('')
    setStartTime(null)
    setErrors(0)
    setWpm(0)
    setAccuracy(100)
    setLiveWpm(0)
    setLiveAccuracy(100)
    setIsComplete(false)

    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isComplete && e.key.length === 1 && !showUpload && !showLogin && !showSettings) {
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isComplete, showUpload, showLogin, showSettings])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComplete) return

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

      if (dbUser) {
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

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'inline-block transition-all duration-150'
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += ' text-matrix-primary drop-shadow-[0_0_8px_rgba(0,255,136,0.3)]'
        } else {
          className += ` text-error bg-error/20 px-0.5 rounded drop-shadow-[0_0_8px_rgba(255,85,85,0.4)] animate-shake-${settings.shakeIntensity}`
        }
      } else if (index === userInput.length) {
        className += ' bg-gradient-to-r from-matrix-primary/30 to-cyan-500/30 rounded px-1 -mx-0.5 scale-110 animate-blink'
      }
      
      const displayChar = char === ' ' ? '\u00A0' : char;
      
      return (
        <span key={index} className={className} style={{ whiteSpace: 'pre' }}>
          {displayChar}
        </span>
      )
    })
  }

  const displayWpm = isComplete ? wpm : liveWpm
  const displayAccuracy = isComplete ? accuracy : liveAccuracy

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg flex items-center justify-center p-4 md:p-8">
        <LoginModal onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-matrix-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 md:p-5 bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl backdrop-blur-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-matrix-primary drop-shadow-[0_0_20px_rgba(0,255,136,0.3)]">
            TerminalType
          </h1>
          
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 w-full md:w-auto">
            {user && (
              <div className="flex items-center justify-between gap-3 px-3 py-2 bg-matrix-primary/10 rounded-md text-sm text-matrix-light w-full md:w-auto">
                <span className="truncate">{user.email}</span>
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
            
            {!isComplete && !showUpload && (
              <button
                onClick={skipPassage}
                className="w-full md:w-auto px-4 py-2.5 border-2 border-warning text-warning rounded-md hover:bg-warning hover:text-matrix-bg transition-all font-semibold text-sm min-h-[44px]"
              >
                Skip Passage
              </button>
            )}
            
            <button
              onClick={() => setShowUpload(!showUpload)}
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

        {showUpload && (
          <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
        )}

        {userBooks && userBooks.length > 0 && !showUpload && (
          <div className="mb-8 p-4 md:p-5 bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-matrix-primary mb-4">Your Books</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {userBooks.map((book) => (
                <button
                  key={book._id}
                  onClick={() => setCurrentBookId(book._id)}
                  className={`flex justify-between items-center p-3 rounded-lg border-2 transition-all text-left min-h-[52px] ${
                    currentBookId === book._id
                      ? 'border-matrix-primary bg-matrix-primary/20 shadow-[0_0_16px_rgba(0,255,136,0.3)] translate-x-1'
                      : 'border-matrix-primary/20 hover:border-matrix-primary hover:bg-matrix-primary/10 hover:translate-x-1'
                  }`}
                >
                  <span className="text-sm font-medium text-matrix-light truncate flex-1">
                    {book.title}
                  </span>
                  <span className="text-xs ml-3 px-2 py-1 bg-matrix-primary/20 rounded font-semibold text-matrix-primary">
                    {book.lastReadPosition + 1}/{book.totalPassages}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {book && (
          <div className="flex flex-col md:flex-row justify-between gap-2 mb-4 px-4 py-3 text-sm font-medium text-matrix-light bg-matrix-primary/10 rounded-lg">
            <span>Book: {book.title}</span>
            <span>Passage {currentPassageIndex + 1} of {book.passages.length}</span>
          </div>
        )}

                <div 
          className="relative text-xl md:text-2xl leading-relaxed min-h-[200px] md:min-h-[240px] mb-8 p-4 md:p-8 bg-matrix-primary/5 border-2 border-matrix-primary/20 rounded-2xl backdrop-blur-sm"
          style={{ 
            color: `rgba(0, 255, 136, ${settings.textOpacity})`,
            letterSpacing: '0.3px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >

        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-matrix-primary to-transparent opacity-30 rounded-t-2xl" />
          {renderText()}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className="hidden-input"
          disabled={isComplete || showUpload || showLogin || showSettings}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl">
          <div className="flex flex-col md:flex-row md:flex-col items-center justify-between md:justify-center gap-2 p-4 md:p-5 bg-gradient-to-br from-matrix-primary/10 to-cyan-500/10 border-2 border-matrix-primary/30 rounded-xl transition-all hover:border-matrix-primary hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,255,136,0.2)]">
            <span className="text-xs uppercase tracking-wider text-matrix-light/80 font-semibold">WPM</span>
            <span className="text-3xl md:text-4xl font-bold text-matrix-primary drop-shadow-[0_0_20px_rgba(0,255,136,0.4)]">
              {displayWpm}
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row md:flex-col items-center justify-between md:justify-center gap-2 p-4 md:p-5 bg-gradient-to-br from-matrix-primary/10 to-cyan-500/10 border-2 border-matrix-primary/30 rounded-xl transition-all hover:border-matrix-primary hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,255,136,0.2)]">
            <span className="text-xs uppercase tracking-wider text-matrix-light/80 font-semibold">Accuracy</span>
            <span className="text-3xl md:text-4xl font-bold text-matrix-primary drop-shadow-[0_0_20px_rgba(0,255,136,0.4)]">
              {displayAccuracy}%
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row md:flex-col items-center justify-between md:justify-center gap-2 p-4 md:p-5 bg-gradient-to-br from-matrix-primary/10 to-cyan-500/10 border-2 border-matrix-primary/30 rounded-xl transition-all hover:border-matrix-primary hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,255,136,0.2)]">
            <span className="text-xs uppercase tracking-wider text-matrix-light/80 font-semibold">Errors</span>
            <span className="text-3xl md:text-4xl font-bold text-matrix-primary drop-shadow-[0_0_20px_rgba(0,255,136,0.4)]">
              {errors}
            </span>
          </div>
        </div>

        {isComplete && (
          <div className="mt-8 p-6 md:p-8 bg-gradient-to-br from-matrix-primary/20 to-cyan-500/20 border-2 border-matrix-primary rounded-2xl text-center animate-slide-up relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-matrix-primary/10 to-transparent opacity-50 animate-pulse-slow" />
            
            <h3 className="text-2xl md:text-3xl font-bold text-matrix-primary mb-6 drop-shadow-[0_0_20px_rgba(0,255,136,0.5)] relative z-10">
              Passage Completed! 
            </h3>
            
            <div className="flex flex-col md:flex-row justify-around gap-4 mb-6 relative z-10">
              <div className="px-4 py-3 bg-matrix-primary/20 border border-matrix-primary/30 rounded-lg">
                <span className="text-base text-matrix-light font-medium">Final WPM: {wpm}</span>
              </div>
              <div className="px-4 py-3 bg-matrix-primary/20 border border-matrix-primary/30 rounded-lg">
                <span className="text-base text-matrix-light font-medium">Final Accuracy: {accuracy}%</span>
              </div>
              <div className="px-4 py-3 bg-matrix-primary/20 border border-matrix-primary/30 rounded-lg">
                <span className="text-base text-matrix-light font-medium">Total Errors: {errors}</span>
              </div>
            </div>
            
            <button
              onClick={() => resetTest()}
              className="px-8 py-3.5 bg-matrix-primary text-matrix-bg font-bold rounded-lg hover:-translate-y-1 hover:shadow-[0_6px_24px_rgba(0,255,136,0.5)] transition-all relative z-10"
            >
              Next Passage (or press Tab then Enter)
            </button>
          </div>
        )}

        {!isComplete && userInput.length === 0 && !showUpload && (
          <div className="mt-6 text-center text-sm text-matrix-light/60 animate-pulse">
            Start typing...
          </div>
        )}
      </div>
    </div>
  )
}