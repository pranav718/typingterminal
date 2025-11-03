'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { SAMPLE_BOOKS } from '../../data/sampleBooks'
import { generateRandomWords, generateRandomLetters, getRandomPassageSource } from '../../utils/randomWords'

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

  const createMatch = useMutation(api.matches.createMatch)

  if (!isOpen) return null

  const handleCreate = async () => {
    setIsCreating(true)

    try {
      let passageText = ''
      let passageSource = ''

      if (passageType === 'book') {
        if (!selectedBook) {
          alert('Please select a book')
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
        passageText = await generateRandomWords(wordCount)
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
      alert('Failed to create match')
    } finally {
      setIsCreating(false)
    }
  }

  const selectedBookData = SAMPLE_BOOKS.find(b => b.id === selectedBook)

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-matrix-bg-darker border-2 border-matrix-primary rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-matrix-bg-darker border-b border-matrix-primary/20 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-matrix-primary">Create Match</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-matrix-bg transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-matrix-primary mb-2">
              Passage Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPassageType('book')}
                className={`px-4 py-4 rounded-lg border-2 transition-all ${
                  passageType === 'book'
                    ? 'border-matrix-primary bg-matrix-primary/20 shadow-glow'
                    : 'border-matrix-primary/30 hover:border-matrix-primary'
                }`}
              >
                <div className="text-3xl mb-2">📖</div>
                <div className="text-sm font-semibold text-matrix-light">Book Passage</div>
              </button>

              <button
                onClick={() => setPassageType('random-words')}
                className={`px-4 py-4 rounded-lg border-2 transition-all ${
                  passageType === 'random-words'
                    ? 'border-matrix-primary bg-matrix-primary/20 shadow-glow'
                    : 'border-matrix-primary/30 hover:border-matrix-primary'
                }`}
              >
                <div className="text-3xl mb-2">🎲</div>
                <div className="text-sm font-semibold text-matrix-light">Random Words</div>
              </button>

              <button
                onClick={() => setPassageType('random-letters')}
                className={`px-4 py-4 rounded-lg border-2 transition-all ${
                  passageType === 'random-letters'
                    ? 'border-matrix-primary bg-matrix-primary/20 shadow-glow'
                    : 'border-matrix-primary/30 hover:border-matrix-primary'
                }`}
              >
                <div className="text-3xl mb-2">🔤</div>
                <div className="text-sm font-semibold text-matrix-light">Random Letters</div>
              </button>
            </div>
          </div>

          {passageType === 'book' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-matrix-primary mb-2">
                  Select Book
                </label>
                <select
                  value={selectedBook}
                  onChange={(e) => {
                    setSelectedBook(e.target.value)
                    setSelectedPassage(0)
                  }}
                  className="w-full px-4 py-3 bg-matrix-primary/5 border-2 border-matrix-primary/30 text-matrix-primary rounded-lg focus:outline-none focus:border-matrix-primary"
                >
                  <option value="">Choose a book...</option>
                  {SAMPLE_BOOKS.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} by {book.author}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBookData && (
                <div>
                  <label className="block text-sm font-semibold text-matrix-primary mb-2">
                    Select Passage
                  </label>
                  <select
                    value={selectedPassage}
                    onChange={(e) => setSelectedPassage(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-matrix-primary/5 border-2 border-matrix-primary/30 text-matrix-primary rounded-lg focus:outline-none focus:border-matrix-primary"
                  >
                    {selectedBookData.passages.map((_, idx) => (
                      <option key={idx} value={idx}>
                        Passage {idx + 1}
                      </option>
                    ))}
                  </select>

                  <div className="mt-4 p-4 bg-matrix-primary/10 border border-matrix-primary/20 rounded-lg max-h-40 overflow-y-auto">
                    <p className="text-sm text-matrix-light">
                      {selectedBookData.passages[selectedPassage].substring(0, 200)}...
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {passageType !== 'book' && (
            <div>
              <label className="block text-sm font-semibold text-matrix-primary mb-2">
                {passageType === 'random-letters' ? 'Character Length' : 'Word Count'}: {passageType === 'random-letters' ? wordCount * 5 : wordCount}
              </label>
              <input
                type="range"
                min={passageType === 'random-letters' ? 20 : 25}
                max={passageType === 'random-letters' ? 100 : 100}
                step={passageType === 'random-letters' ? 20 : 25}
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                className="w-full h-2 bg-matrix-primary/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-matrix-primary
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-5
                  [&::-moz-range-thumb]:h-5
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-matrix-primary
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-matrix-light mt-1">
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

          {passageType !== 'book' && (
            <div className="p-4 bg-matrix-primary/10 border border-matrix-primary/20 rounded-lg">
              <p className="text-xs text-matrix-light mb-2">Preview (example):</p>
              <p className="text-sm text-matrix-light/80 font-mono">
                {passageType === 'random-words' 
                  ? 'the quick brown fox jumps over lazy dog and runs through...'
                  : 'abcd efgh ijkl mnop qrst uvwx yz ab cdef ghij klmn...'
                }
              </p>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={(passageType === 'book' && !selectedBook) || isCreating}
            className="w-full px-6 py-3 bg-matrix-primary text-matrix-bg font-bold rounded-lg hover:shadow-glow-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating Match...' : 'Create Match'}
          </button>
        </div>
      </div>
    </div>
  )
}