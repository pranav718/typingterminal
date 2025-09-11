'use client'

import { useState, useRef, useEffect } from 'react'
import './terminal.css'

export default function Home() {
  const sampleTexts = [
    'The only real test of intelligence is if you get what you want out of life',
    'I think, therefore I am.',
    'You can skip all the parties, all the conferences, all the press, all the tweets. Build a great product and get users and win.',
    'The quick brown fox jumps over the lazy dog.'
  ]

  const [text, setText] = useState(sampleTexts[0])
  const [userInput, setUserInput] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [errors, setErrors] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [isComplete, setIsComplete] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)

  const resetTest = () => {
    const newText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
    setText(newText)
    setUserInput('')
    setStartTime(null)
    setErrors(0)
    setWpm(0)
    setAccuracy(100)
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
      if (!isComplete && e.key.length === 1) {
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isComplete])

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

    if (input.length === text.length && startTime) {
      const now = Date.now()
      const timeTaken = (now - startTime) / 60000
      const words = text.trim().split(/\s+/).length
      const calculatedWPM = Math.round(words / timeTaken)
      const calculatedAccuracy = Math.round(((text.length - errorCount) / text.length) * 100)

      setWpm(calculatedWPM)
      setAccuracy(calculatedAccuracy)
      setIsComplete(true)
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

  return (
    <div className="terminal-container">
      <div className="text-display">{renderText()}</div>

      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={handleInputChange}
        className="hidden-input"
        disabled={isComplete}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      <div className="stats">
        <div>WPM: {wpm}</div>
        <div>Accuracy: {accuracy}%</div>
        <div>Errors: {errors}</div>
      </div>

      {isComplete && (
        <button className="terminal-btn reset-btn" onClick={resetTest}>
          Try Again (or press Tab then Enter)
        </button>
      )}
      
      {!isComplete && userInput.length === 0 && (
        <div className="hint">Start typing...</div>
      )}
    </div>
  )
}