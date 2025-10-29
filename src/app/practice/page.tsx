'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { processPDFClient } from '../utils/clientPdfProcessor'
import { useAuth } from '../hooks/useAuth'
import { useSettings } from '../hooks/useSettings'
import { useTypingLogic } from '../hooks/useTypingLogic'
import { useBookNavigation } from '../hooks/useBookNavigation'
import Settings from '../components/Settings'
import TypingArea from '../components/Typing/TypingArea'
import StatsDisplay from '../components/Typing/StatsDisplay'
import CompletionCard from '../components/Typing/CompletionCard'
import PracticeHeader from '../components/PracticeHeader'
import BookProgress from '../components/BookProgress'
import PracticeLayout from '../components/PracticeLayout'
import '../terminal.css'

const FileUpload = dynamic(() => import('../components/FileUpload'), { ssr: false })

function PracticeContent() {
  const { user, isGuest, logout, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { settings, updateSettings } = useSettings()

  const bookIdFromUrl = searchParams.get('book')
  const uploadedBookIdFromUrl = searchParams.get('uploaded')
  const uploadFromUrl = searchParams.get('upload') === 'true'

  const [showSettings, setShowSettings] = useState(false)
  const [showUpload, setShowUpload] = useState(uploadFromUrl)
  const [isProcessing, setIsProcessing] = useState(false)

  const saveBook = useMutation(api.books.saveBook)

  const {
    currentSampleBook,
    currentPassageIndex,
    text,
    currentBookId,
    isLoadingBook,
    currentBook,
    skipPassage,
    setCurrentBookId,
    setCurrentSampleBook,
  } = useBookNavigation(bookIdFromUrl, uploadedBookIdFromUrl, isGuest, isLoading)

  const {
    userInput,
    errors,
    wpm,
    accuracy,
    isComplete,
    inputRef,
    handleInputChange,
    resetTypingState,
    displayWpm,
    displayAccuracy,
  } = useTypingLogic(text, currentBookId, currentPassageIndex, isGuest, isLoadingBook)

  const handleFileUpload = async (file: File) => {
    if (isGuest) {
      alert('Please sign up or log in to upload books.')
      setShowUpload(false)
      return
    }

    resetTypingState()
    setIsProcessing(true)

    try {
      const processedBook = await processPDFClient(file)

      if (processedBook.passages.length > 0 && processedBook.passages[0] !== 'No readable text found in this PDF.') {
        const bookId = await saveBook({
          title: processedBook.title,
          passages: processedBook.passages,
          isPublic: false,
        })

        setCurrentBookId(bookId)
        setCurrentSampleBook(null)
        setShowUpload(false)
        router.push(`/practice?uploaded=${bookId}`)
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

  const handleSkipPassage = () => {
    skipPassage()
    resetTypingState()
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleNextPassage = () => {
    skipPassage()
    resetTypingState()
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <PracticeLayout>
      <PracticeHeader
        user={user}
        isGuest={isGuest}
        logout={logout}
        onSettingsClick={() => setShowSettings(true)}
        onSkipClick={handleSkipPassage}
        isComplete={isComplete}
        isLoadingBook={isLoadingBook}
        showUpload={showUpload}
      />

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={updateSettings}
      />

      {showUpload && !isGuest && <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />}

      {currentBook && !isLoadingBook && !showUpload && (
        <BookProgress
          title={currentBook.title}
          currentPassage={currentPassageIndex}
          totalPassages={currentBook.totalPassages}
          isUploaded={!!currentBookId}
        />
      )}

      {isLoadingBook && (
        <div className="mb-8 p-8 bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-matrix-primary border-t-transparent mb-4"></div>
          <p className="text-matrix-primary animate-pulse">Loading book...</p>
        </div>
      )}

      <TypingArea text={text} userInput={userInput} isComplete={isComplete} isDisabled={isLoadingBook || !text} settings={settings} />

      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={handleInputChange}
        className="hidden-input"
        disabled={isComplete || showUpload || showSettings || isLoadingBook || !user || !text}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      <StatsDisplay wpm={displayWpm} accuracy={displayAccuracy} errors={errors} />

      {isComplete && !isLoadingBook && (
        <CompletionCard wpm={wpm} accuracy={accuracy} errors={errors} onNext={handleNextPassage} />
      )}

      {!isComplete && userInput.length === 0 && !showUpload && !isLoadingBook && user && text && (
        <div className="mt-6 text-center text-sm text-matrix-light/60 animate-pulse">Start typing...</div>
      )}
    </PracticeLayout>
  )
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-matrix-primary border-t-transparent mb-4"></div>
            <p className="text-matrix-primary text-xl animate-pulse">Loading...</p>
          </div>
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  )
}