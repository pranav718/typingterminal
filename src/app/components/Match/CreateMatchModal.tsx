'use client'

import { useMutation } from 'convex/react'
import { useEffect, useRef, useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { SAMPLE_BOOKS } from '../../data/sampleBooks'
import {
  generateRandomWords,
  getRandomPassageSource
} from '../../utils/randomWords'
import InstructionModal from '../InstructionModal'

interface CreateMatchModalProps {
  isOpen: boolean
  onClose: () => void
  onMatchCreated: (matchId: string, inviteCode: string) => void
}

type PassageType = 'book' | 'random-words'

export default function CreateMatchModal({ isOpen, onClose, onMatchCreated }: CreateMatchModalProps) {
  const [passageType, setPassageType] = useState<PassageType>('book')
  const [selectedBook, setSelectedBook] = useState<string>('')
  const [selectedPassage, setSelectedPassage] = useState<number>(0)
  const [wordCount, setWordCount] = useState<number>(50)
  const [isCreating, setIsCreating] = useState(false)

  const [isBookOpen, setIsBookOpen] = useState(false)
  const [isPassageOpen, setIsPassageOpen] = useState(false)

  const [showInstruction, setShowInstruction] = useState(false)

  const createMatch = useMutation(api.matches.createMatch)

  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBookOpen(false)
        setIsPassageOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!isOpen) return null

  const handleBookChange = (bookId: string) => {
    setSelectedBook(bookId)
    setSelectedPassage(0)
    setIsBookOpen(false)
    if (bookId) {
      setShowInstruction(true)
    }
  }

  const handleCreate = async () => {
    setIsCreating(true)

    try {
      let passageText = ''
      let passageSource = ''

      if (passageType === 'book') {
        if (!selectedBook) {
          alert('SELECT A BOOK FIRST')
          setIsCreating(false)
          return
        }

        const book = SAMPLE_BOOKS.find(b => b.id === selectedBook)
        if (!book) {
          setIsCreating(false)
          return
        }

        passageText = book.passages[selectedPassage]
        passageSource = `${book.title} - Passage ${selectedPassage + 1}`
      } else if (passageType === 'random-words') {
        passageText = await generateRandomWords({ wordCount, difficulty: 'easy' })
        passageSource = `${getRandomPassageSource('words')} (${wordCount} words)`
      }

      const result = await createMatch({ passageText, passageSource })
      onMatchCreated(result.matchId, result.inviteCode)
      onClose()
    } catch (error) {
      console.error('Failed to create match:', error)
      alert('ERROR: FAILED TO CREATE MATCH')
    } finally {
      setIsCreating(false)
    }
  }

  const selectedBookData = SAMPLE_BOOKS.find(b => b.id === selectedBook)

  return (
    <>
      <InstructionModal
        isOpen={showInstruction}
        onClose={() => setShowInstruction(false)}
        title="PASSAGE SELECTION ADVISORY"
      />

      <div
        className="fixed inset-0 bg-[#00120b]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="terminal-window max-w-2xl w-full max-h-[90vh] overflow-y-auto border-[#41ff5f]"
          onClick={(e) => e.stopPropagation()}
          ref={dropdownRef}
        >
          <div className="sticky top-0 bg-[#001a0f] border-b border-[#41ff5f40] px-6 py-4 flex justify-between items-center z-10">
            <h2 className="text-xl font-bold text-[#41ff5f] text-shadow-glow tracking-wider">
              CREATE NEW MATCH
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded border border-[#ff5f4180] text-[#ff5f41] hover:bg-[#ff5f4120] transition-all flex items-center justify-center font-bold"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#7bff9a]/80 mb-3 uppercase tracking-wider">
                SELECT PASSAGE TYPE:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPassageType('book')}
                  className={`terminal-tab ${passageType === 'book' ? 'active' : ''}`}
                >
                  <div className="text-sm">BOOK</div>
                </button>

                <button
                  onClick={() => setPassageType('random-words')}
                  className={`terminal-tab ${passageType === 'random-words' ? 'active' : ''}`}
                >
                  <div className="text-sm">RANDOM</div>
                </button>
              </div>
            </div>

            {passageType === 'book' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#7bff9a]/80 mb-2 uppercase tracking-wider">
                    SELECT BOOK:
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBookOpen(!isBookOpen)
                        setIsPassageOpen(false)
                      }}
                      className="w-full px-4 py-3 bg-[#001a0f] border border-[#41ff5f30] text-[#41ff5f] text-left flex justify-between items-center hover:border-[#41ff5f] transition-colors font-mono"
                    >
                      <span className="truncate">
                        {selectedBookData ? `${selectedBookData.title} by ${selectedBookData.author}` : '-- SELECT BOOK --'}
                      </span>
                      <span className="text-xs ml-2">▼</span>
                    </button>

                    {isBookOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-[#00120b] border border-[#41ff5f] max-h-60 overflow-y-auto shadow-[0_0_20px_rgba(0,0,0,0.8)] custom-scrollbar">
                        {SAMPLE_BOOKS.map((book) => (
                          <div
                            key={book.id}
                            onClick={() => handleBookChange(book.id)}
                            className={`px-4 py-2 cursor-pointer text-sm font-mono transition-colors ${selectedBook === book.id
                              ? 'bg-[#41ff5f] text-[#00120b] font-bold'
                              : 'text-[#7bff9a] hover:bg-[#41ff5f20] hover:text-[#41ff5f]'
                              }`}
                          >
                            {book.title} by {book.author}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedBookData && (
                  <div>
                    <label className="block text-xs font-semibold text-[#7bff9a]/80 mb-2 uppercase tracking-wider">
                      SELECT PASSAGE:
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPassageOpen(!isPassageOpen)
                          setIsBookOpen(false)
                        }}
                        className="w-full px-4 py-3 bg-[#001a0f] border border-[#41ff5f30] text-[#41ff5f] text-left flex justify-between items-center hover:border-[#41ff5f] transition-colors font-mono"
                      >
                        <span>PASSAGE {selectedPassage + 1}</span>
                        <span className="text-xs ml-2">▼</span>
                      </button>

                      {isPassageOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-[#00120b] border border-[#41ff5f] max-h-60 overflow-y-auto shadow-[0_0_20px_rgba(0,0,0,0.8)] custom-scrollbar">
                          {selectedBookData.passages.map((_, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedPassage(idx)
                                setIsPassageOpen(false)
                              }}
                              className={`px-4 py-2 cursor-pointer text-sm font-mono transition-colors ${selectedPassage === idx
                                ? 'bg-[#41ff5f] text-[#00120b] font-bold'
                                : 'text-[#7bff9a] hover:bg-[#41ff5f20] hover:text-[#41ff5f]'
                                }`}
                            >
                              PASSAGE {idx + 1}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 p-4 bg-[#00120b] border border-[#41ff5f20] max-h-40 overflow-y-auto custom-scrollbar">
                      <p className="text-sm text-[#7bff9a]/80 font-mono leading-relaxed">
                        {selectedBookData.passages[selectedPassage].substring(0, 200)}...
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {passageType === 'random-words' && (
              <div>
                <label className="block text-xs font-semibold text-[#7bff9a]/80 mb-2 uppercase tracking-wider">
                  WORD COUNT: {wordCount}
                </label>
                <input
                  type="range"
                  min={25}
                  max={100}
                  step={25}
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full h-2 bg-[#41ff5f20] rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-5
                    [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-[#41ff5f]
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-5
                    [&::-moz-range-thumb]:h-5
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-[#41ff5f]
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[#7bff9a]/60 mt-1 font-mono">
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={(passageType === 'book' && !selectedBook) || isCreating}
              className="w-full terminal-btn py-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'CREATING MATCH...' : 'CREATE MATCH'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}