'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { processPDFClient } from './utils/clientPdfProcessor';
import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import { useTypingSession } from './hooks/useTypingSession';
import { useBookManager } from './hooks/useBookManager';

import AuthModal from './components/Auth/AuthModal';
import Settings from './components/Settings';
import Header from './components/Header';
import BookList from './components/Books/BookList';
import TypingArea from './components/Typing/TypingArea';
import StatsDisplay from './components/Typing/StatsDisplay';
import CompletionCard from './components/Typing/CompletionCard';
import './terminal.css';

const FileUpload = dynamic(() => import('./components/FileUpload'), { ssr: false });

export default function Home() {
  const { user, isLoading: authLoading, isGuest, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const saveBook = useMutation(api.books.saveBook);

  const {
    currentBookId,
    currentPassageIndex,
    text,
    isLoadingBook,
    userBooks,
    publicBooks,
    currentBookData,
    selectBook,
    nextPassage,
    skipPassage,
  } = useBookManager(isGuest);

  const {
    userInput,
    errors,
    isComplete,
    inputRef,
    handleInputChange,
    resetSession,
    displayWpm,
    displayAccuracy,
  } = useTypingSession(text, currentBookId, currentPassageIndex, isGuest);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isComplete && e.key.length === 1 && !showUpload && !showSettings && !isLoadingBook && user) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isComplete, showUpload, showSettings, isLoadingBook, user, inputRef]);

  const handleFileUpload = async (file: File) => {
    if (isGuest) {
      alert('Please sign up or log in to upload books.');
      setShowUpload(false);
      return;
    }

    resetSession();
    setIsProcessing(true);

    try {
      const processedBook = await processPDFClient(file);
      if (processedBook.passages[0] !== 'No readable text found in this PDF.') {
        const bookId = await saveBook({
          title: processedBook.title,
          passages: processedBook.passages,
          isPublic: false,
        });
        selectBook(bookId);
        setShowUpload(false);
      } else {
        alert('No suitable passages found in this PDF. Please try another book.');
      }
    } catch (error: any) {
      console.error('Error processing PDF:', error);
      alert(error.message || 'Error processing PDF. Please try another file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextPassage = () => {
    nextPassage();
    resetSession();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSkipPassage = () => {
    skipPassage();
    resetSession();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleUploadToggle = () => {
    if (isGuest && !showUpload) {
      alert('Please sign up or log in to upload books');
      return;
    }
    if (!showUpload) resetSession();
    setShowUpload(!showUpload);
  };

  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none opacity-30 blur-sm">
          <div className="max-w-4xl mx-auto mt-20 px-4">
            <h1 className="text-3xl font-bold text-matrix-primary text-center mb-8">
              TerminalType
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-matrix-primary/10 border border-matrix-primary/20 rounded-lg"
                >
                  <div className="h-4 bg-matrix-primary/20 rounded mb-2"></div>
                  <div className="h-3 bg-matrix-primary/10 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-matrix-bg-darker to-matrix-bg flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-matrix-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-matrix-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <Header
          user={user}
          isGuest={isGuest}
          logout={logout}
          onSettingsClick={() => setShowSettings(true)}
          onSkipClick={handleSkipPassage}
          onUploadClick={handleUploadToggle}
          showUpload={showUpload}
          isComplete={isComplete}
          isLoadingBook={isLoadingBook}
        />

        <Settings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingsChange={updateSettings}
        />

        {showUpload && !isGuest && (
          <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
        )}

        {publicBooks && publicBooks.length > 0 && !showUpload && (
          <BookList
            books={publicBooks}
            currentBookId={currentBookId}
            onBookSelect={selectBook}
            isLoading={isLoadingBook}
            title="Sample Books"
          />
        )}

        {!isGuest && userBooks && userBooks.length > 0 && !showUpload && (
          <BookList
            books={userBooks}
            currentBookId={currentBookId}
            onBookSelect={selectBook}
            isLoading={isLoadingBook}
            title="Your Books"
          />
        )}

        {currentBookData && !isLoadingBook && (
          <div className="flex flex-col md:flex-row justify-between gap-2 mb-4 px-4 py-3 text-sm font-medium text-matrix-light bg-matrix-primary/10 rounded-lg">
            <span>Book: {currentBookData.title}</span>
            <span>Passage {currentPassageIndex + 1} of {currentBookData.totalPassages}</span>
          </div>
        )}

        <TypingArea
          text={text}
          userInput={userInput}
          isComplete={isComplete}
          isDisabled={isLoadingBook}
          settings={settings}
        />

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className="hidden-input"
          disabled={isComplete || showUpload || showSettings || isLoadingBook || !user}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        <StatsDisplay
          wpm={displayWpm}
          accuracy={displayAccuracy}
          errors={errors}
        />

        {isComplete && !isLoadingBook && (
          <CompletionCard
            wpm={displayWpm}
            accuracy={displayAccuracy}
            errors={errors}
            onNext={handleNextPassage}
          />
        )}

        {!isComplete && userInput.length === 0 && !showUpload && !isLoadingBook && user && (
          <div className="mt-6 text-center text-sm text-matrix-light/60 animate-pulse">
            Start typing...
          </div>
        )}
      </div>
    </div>
  );
}