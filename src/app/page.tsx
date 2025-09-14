'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { processPDFClient, ProcessedBook } from './utils/clientPdfProcessor'
import { useSimpleAuth, LoginModal } from './components/SimpleAuth'
import './terminal.css'

const FileUpload = dynamic(() => import('./components/FileUpload'), {
  ssr: false
})

export default function Home() {
  const { user, login, logout } = useSimpleAuth();
  const [showLogin, setShowLogin] = useState(false);
  
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
      if (!isComplete && e.key.length === 1 && !showUpload && !showLogin) {
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isComplete, showUpload, showLogin])

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
      let className = 'char'
      if (index < userInput.length) {
        className += userInput[index] === char ? ' correct' : ' incorrect'
      } else if (index === userInput.length) {
        className += ' current'
      }
      return (
        <span key={index} className={className}>
          {char}
        </span>
      )
    })
  }

  const displayWpm = isComplete ? wpm : liveWpm
  const displayAccuracy = isComplete ? accuracy : liveAccuracy

  if (!user) {
    return (
      <div className="terminal-container">
        <LoginModal onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div className="terminal-container">
      <div className="header">
        <h1 className="title">Terminal Typing Test</h1>
        <div className="header-buttons">
          {user && (
            <div className="user-info">
              <span>{user.email}</span>
              <button className="terminal-btn logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          )}
          {!isComplete && !showUpload && (
            <button className="terminal-btn skip-btn" onClick={skipPassage}>
              Skip Passage
            </button>
          )}
          <button
            className="terminal-btn upload-btn"
            onClick={() => setShowUpload(!showUpload)}
          >
            {showUpload ? 'Close' : 'Upload Book PDF'}
          </button>
        </div>
      </div>

      {showUpload && (
        <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
      )}

      {userBooks && userBooks.length > 0 && !showUpload && (
        <div className="book-library">
          <h3>Your Books</h3>
          <div className="book-list">
            {userBooks.map((book) => (
              <button
                key={book._id}
                className={`book-item ${currentBookId === book._id ? 'active' : ''}`}
                onClick={() => setCurrentBookId(book._id)}
              >
                <span className="book-title">{book.title}</span>
                <span className="book-progress">
                  {book.lastReadPosition + 1}/{book.totalPassages}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {book && (
        <div className="book-info">
          <span>Book: {book.title}</span>
          <span>Passage {currentPassageIndex + 1} of {book.passages.length}</span>
        </div>
      )}

      <div className="text-display">{renderText()}</div>

      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={handleInputChange}
        className="hidden-input"
        disabled={isComplete || showUpload || showLogin}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      <div className="stats">
        <div className="stat-item">
          <span className="stat-label">WPM</span>
          <span className="stat-value">{displayWpm}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Accuracy</span>
          <span className="stat-value">{displayAccuracy}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Errors</span>
          <span className="stat-value">{errors}</span>
        </div>
      </div>

      {isComplete && (
        <div className="completion-stats">
          <h3>Passage Complete!</h3>
          <div className="final-stats">
            <div>Final WPM: {wpm}</div>
            <div>Final Accuracy: {accuracy}%</div>
            <div>Total Errors: {errors}</div>
          </div>
          <button className="terminal-btn reset-btn" onClick={() => resetTest()}>
            Next Passage (or press Tab then Enter)
          </button>
        </div>
      )}
      
      {!isComplete && userInput.length === 0 && !showUpload && (
        <div className="hint">Start typing...</div>
      )}
    </div>
  )
}