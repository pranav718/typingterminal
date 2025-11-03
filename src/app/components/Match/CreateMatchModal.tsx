'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { SAMPLE_BOOKS } from '../../data/sampleBooks'

interface CreateMatchModalProps {
  isOpen: boolean
  onClose: () => void
  onMatchCreated: (matchId: string, inviteCode: string) => void
}

export default function CreateMatchModal({ isOpen, onClose, onMatchCreated }: CreateMatchModalProps) {
  const [selectedBook, setSelectedBook] = useState<string>('')
  const [selectedPassage, setSelectedPassage] = useState<number>(0)
  const [isCreating, setIsCreating] = useState(false)

  const createMatch = useMutation(api.matches.createMatch)

  if (!isOpen) return null

  const handleCreate = async () => {
    if (!selectedBook) {
      alert('Please select a book')
      return
    }

    setIsCreating(true)

    try {
      const book = SAMPLE_BOOKS.find(b => b.id === selectedBook)
      if (!book) return
      const passageText = book.passages[selectedPassage]
      const passageSource = `${book.title} - Passage ${selectedPassage + 1}`
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

          <button
            onClick={handleCreate}
            disabled={!selectedBook || isCreating}
            className="w-full px-6 py-3 bg-matrix-primary text-matrix-bg font-bold rounded-lg hover:shadow-glow-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Match'}
          </button>
        </div>
      </div>
    </div>
  )
}