'use client'

import { useState, useEffect, useRef } from 'react'
import './terminal.css'

export default function Home() {
  const [text, setText] = useState('')
  const [userInput, setUserInput] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [errors, setErrors] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const sampleTexts = [
    "The quick brown fox jumps over the lazy dog. This pangram sentence contains every letter of the alphabet at least once.",
    "In the beginning was the Word, and the Word was with God, and the Word was God. All things were made through him.",
    "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune.",
    "import React from 'react'; const App = () => { return <div>Hello World</div>; }; export default App;",
  ]

  useEffect(() => {
    setText(sampleTexts[0])
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value
    
    if (!startTime && input.length === 1) {
      setStartTime(Date.now())
    }

    setUserInput(input)

    let errorCount = 0
    for (let i = 0; i < input.length; i++) {
      if (input[i] !== text[i]) {
        errorCount++
      }
    }
    setErrors(errorCount)

    if (input === text) {
      const end = Date.now()
      setEndTime(end)
      setIsComplete(true)
      
      const timeInMinutes = (end - startTime!) / 60000
      const words = text.split(' ').length
      const calculatedWpm = Math.round(words / timeInMinutes)
      setWpm(calculatedWpm)
      
      const calculatedAccuracy = Math.round(((text.length - errorCount) / text.length) * 100)
      setAccuracy(calculatedAccuracy)
    }
  }

  const reset = () => {
    setUserInput('')
    setStartTime(null)
    setEndTime(null)
    setErrors(0)
    setIsComplete(false)
    setWpm(0)
    setAccuracy(100)
    inputRef.current?.focus()
  }

  const loadNewText = () => {
    const randomIndex = Math.floor(Math.random() * sampleTexts.length)
    setText(sampleTexts[randomIndex])
    reset()
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
      <div className="terminal">
        <div className="terminal-header">
          <div className="terminal-buttons">
            <span className="terminal-button red"></span>
            <span className="terminal-button yellow"></span>
            <span className="terminal-button green"></span>
          </div>
          <div className="terminal-title">Terminal Typing Test</div>
        </div>
        
        <div className="terminal-body">
          <div className="terminal-prompt">
            <span className="prompt-symbol">$</span>
            <span className="prompt-text">type the following text:</span>
          </div>
          
          <div className="text-display">
            {renderText()}
          </div>
          
          <div className="terminal-prompt">
            <span className="prompt-symbol">$</span>
            <textarea
              ref={inputRef}
              className="terminal-input"
              value={userInput}
              onChange={handleInputChange}
              disabled={isComplete}
              placeholder="Start typing..."
              autoFocus
            />
          </div>
          
          <div className="stats">
            <div className="stat">
              <span className="stat-label">WPM:</span>
              <span className="stat-value">{wpm}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Accuracy:</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
            <div className="stat">
              <span className="stat-label">Errors:</span>
              <span className="stat-value">{errors}</span>
            </div>
          </div>
          
          {isComplete && (
            <div className="completion-message">
              <p>Test completed! Your speed: {wpm} WPM with {accuracy}% accuracy</p>
              <div className="button-group">
                <button onClick={reset} className="terminal-btn">Try Again</button>
                <button onClick={loadNewText} className="terminal-btn">New Text</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}