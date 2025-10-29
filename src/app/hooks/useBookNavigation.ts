'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { SAMPLE_BOOKS } from '../data/sampleBooks';
import { useSampleBookProgress } from './useSampleBookProgress'

export function useBookNavigation(
  bookIdFromUrl: string | null,
  uploadedBookIdFromUrl: string | null,
  isGuest: boolean,
  isLoading: boolean
) {
  const { getProgress, setProgress } = useSampleBookProgress(isGuest)
  
  const [currentSampleBook, setCurrentSampleBook] = useState<typeof SAMPLE_BOOKS[0] | null>(null)
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0)
  const [text, setText] = useState('')
  const [currentBookId, setCurrentBookId] = useState<Id<"books"> | null>(null)
  const [isLoadingBook, setIsLoadingBook] = useState(false)
  const [lastSavedPosition, setLastSavedPosition] = useState(-1)

  const updateLastPosition = useMutation(api.books.updateLastPosition)
  const currentBookData = useQuery(
    api.books.getBookWithPassages,
    currentBookId ? { bookId: currentBookId } : 'skip'
  )

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isLoading || !bookIdFromUrl || currentSampleBook || uploadedBookIdFromUrl) return

    const book = SAMPLE_BOOKS.find(b => b.id === bookIdFromUrl)
    if (book) {
      const savedProgress = getProgress(bookIdFromUrl)
      setCurrentSampleBook(book)
      setCurrentPassageIndex(savedProgress)
      setText(book.passages[savedProgress])
      setCurrentBookId(null)
    }
  }, [bookIdFromUrl, getProgress, uploadedBookIdFromUrl, isLoading, currentSampleBook])

  // Load uploaded book from URL
  useEffect(() => {
    if (!uploadedBookIdFromUrl || currentBookId) return

    try {
      const bookId = uploadedBookIdFromUrl as Id<"books">
      setCurrentBookId(bookId)
      setCurrentSampleBook(null)
      setIsLoadingBook(true)
    } catch (error) {
      console.error('Invalid book ID:', error)
    }
  }, [uploadedBookIdFromUrl, currentBookId])

  // Update text when book data loads
  useEffect(() => {
    if (!currentBookData || !currentBookId) return

    setCurrentSampleBook(null)
    setText(currentBookData.passages[currentBookData.lastReadPosition].content)
    setCurrentPassageIndex(currentBookData.lastReadPosition)
    setLastSavedPosition(currentBookData.lastReadPosition)
    setIsLoadingBook(false)
  }, [currentBookData, currentBookId])

  // Save sample book progress
  useEffect(() => {
    if (!currentSampleBook || currentPassageIndex === undefined) return
    
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    
    setProgress(currentSampleBook.id, currentPassageIndex)
  }, [currentPassageIndex, currentSampleBook, setProgress])

  useEffect(() => {
    if (!currentBookId || currentPassageIndex === lastSavedPosition || isLoadingBook || isGuest) {
      return
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      updateLastPosition({ bookId: currentBookId, position: currentPassageIndex })
        .then(() => setLastSavedPosition(currentPassageIndex))
        .catch(console.error)
    }, 2000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [currentPassageIndex, currentBookId, isLoadingBook, isGuest, lastSavedPosition, updateLastPosition])

  const skipPassage = () => {
    if (currentSampleBook) {
      const nextIndex = (currentPassageIndex + 1) % currentSampleBook.passages.length
      setCurrentPassageIndex(nextIndex)
      setText(currentSampleBook.passages[nextIndex])
    } else if (currentBookData) {
      const nextIndex = (currentPassageIndex + 1) % currentBookData.passages.length
      setCurrentPassageIndex(nextIndex)
      setText(currentBookData.passages[nextIndex].content)
    }
  }

  const currentBook = currentSampleBook
    ? {
        title: `${currentSampleBook.title} by ${currentSampleBook.author}`,
        totalPassages: currentSampleBook.passages.length,
      }
    : currentBookData
      ? { title: currentBookData.title, totalPassages: currentBookData.totalPassages }
      : null

  return {
    currentSampleBook,
    currentPassageIndex,
    text,
    currentBookId,
    isLoadingBook,
    currentBook,
    skipPassage,
    setCurrentBookId,
    setCurrentSampleBook,
  }
}