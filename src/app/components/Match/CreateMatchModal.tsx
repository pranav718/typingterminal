'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { SAMPLE_BOOKS } from '../../data/sampleBooks'
import InstructionModal from '../InstructionModal' 
import { 
  generateRandomWords, 
  generateRandomLetters, 
  getRandomPassageSource 
} from '../../utils/randomWords'

interface CreateMatchModalProps {
  isOpen: boolean
  onClose: () => void
  onMatchCreated: (matchId: string, inviteCode: string) => void
}

type PassageType = 'book' | 'random-words' | 'random-letters'

export default function CreateMatchModal({ isOpen, onClose, onMatchCreated }: CreateMatchModalProps) {
  const [passageType, setPassageType] = useState<PassageType>('book')
  const [selectedBook, setSelectedBook] = useState<string>('')
  const [selectedPassage, setSelectedPassage] = useState<number>(0)
  const [wordCount, setWordCount] = useState<number>(50)
  const [isCreating, setIsCreating] = useState(false)
  
  const [showInstruction, setShowInstruction] = useState(false)

  const createMatch = useMutation(api.matches.createMatch)

  if (!isOpen) return null

  const handleBookChange = (bookId: string) => {
    setSelectedBook(bookId)
    setSelectedPassage(0)
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
        passageText = await generateRandomWords({ wordCount, difficulty: 'medium' })
        passageSource = `${getRandomPassageSource('words')} (${wordCount} words)`
      } else if (passageType === 'random-letters') {
        passageText = generateRandomLetters(wordCount * 5)
        passageSource = getRandomPassageSource('letters')
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
          className="terminal-window max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-[#001a0f] border-b border-[#41ff5f40] px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#41ff5f] text-shadow-glow tracking-wider">
              CREATE NEW MATCH
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded border border-[#ff5f4180] text-[#ff5f41] hover:bg-[#ff5f4120] transition-all flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#7bff9a]/80 mb-3 uppercase tracking-wider">
                SELECT PASSAGE TYPE:
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPassageType('book')}
                  className={`terminal-tab ${passageType === 'book' ? 'active' : ''}`}
                >
                  <div className="text-2xl mb-1">📖</div>
                  <div className="text-xs">BOOK</div>
                </button>

                <button
                  onClick={() => setPassageType('random-words')}
                  className={`terminal-tab ${passageType === 'random-words' ? 'active' : ''}`}
                >
                  <div className="text-2xl mb-1">🎲</div>
                  <div className="text-xs">RANDOM</div>
                </button>

                <button
                  onClick={() => setPassageType('random-letters')}
                  className={`terminal-tab ${passageType === 'random-letters' ? 'active' : ''}`}
                >
                  <div className="text-2xl mb-1">🔤</div>
                  <div className="text-xs">LETTERS</div>
                </button>
              </div>
            </div>

            {passageType === 'book' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#7bff9a]/80 mb-2 uppercase tracking-wider">
                    SELECT BOOK:
                  </label>
                  <select
                    value={selectedBook}
                    onChange={(e) => handleBookChange(e.target.value)}
                    className="w-full px-4 py-3 bg-[#003018]/30 border border-[#41ff5f30] text-[#41ff5f] rounded focus:outline-none focus:border-[#41ff5f] font-mono"
                  >
                    <option value="">-- SELECT BOOK --</option>
                    {SAMPLE_BOOKS.map(book => (
                      <option key={book.id} value={book.id}>
                        {book.title} by {book.author}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBookData && (
                  <div>
                    <label className="block text-xs font-semibold text-[#7bff9a]/80 mb-2 uppercase tracking-wider">
                      SELECT PASSAGE:
                    </label>
                    <select
                      value={selectedPassage}
                      onChange={(e) => setSelectedPassage(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-[#003018]/30 border border-[#41ff5f30] text-[#41ff5f] rounded focus:outline-none focus:border-[#41ff5f] font-mono"
                    >
                      {selectedBookData.passages.map((_, idx) => (
                        <option key={idx} value={idx}>
                          PASSAGE {idx + 1}
                        </option>
                      ))}
                    </select>

                    <div className="mt-4 p-4 bg-[#003018]/20 border border-[#41ff5f20] rounded max-h-40 overflow-y-auto">
                      <p className="text-sm text-[#7bff9a]/80 font-mono">
                        {selectedBookData.passages[selectedPassage].substring(0, 200)}...
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {passageType !== 'book' && (
              <div>
                <label className="block text-xs font-semibold text-[#7bff9a]/80 mb-2 uppercase tracking-wider">
                  {passageType === 'random-letters' ? 'CHARACTER LENGTH' : 'WORD COUNT'}: {passageType === 'random-letters' ? wordCount * 5 : wordCount}
                </label>
                <input
                  type="range"
                  min={passageType === 'random-letters' ? 20 : 25}
                  max={passageType === 'random-letters' ? 100 : 100}
                  step={passageType === 'random-letters' ? 20 : 25}
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
                  {passageType === 'random-letters' ? (
                    <>
                      <span>100</span>
                      <span>300</span>
                      <span>500</span>
                    </>
                  ) : (
                    <>
                      <span>25</span>
                      <span>50</span>
                      <span>75</span>
                      <span>100</span>
                    </>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={(passageType === 'book' && !selectedBook) || isCreating}
              className="w-full terminal-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'CREATING MATCH...' : 'CREATE MATCH'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}