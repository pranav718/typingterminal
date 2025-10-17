import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

const DEFAULT_TEXTS = [
  'The only real test of intelligence is if you get what you want out of life',
  'I think, therefore I am.',
  'Build a great product and get users and win.',
  'The quick brown fox jumps over the lazy dog.',
];

export function useBookManager(isGuest: boolean) {
  const [currentBookId, setCurrentBookId] = useState<Id<"books"> | null>(null);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [text, setText] = useState(DEFAULT_TEXTS[0]);
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [lastSavedPosition, setLastSavedPosition] = useState(-1);

  const userBooks = useQuery(api.books.getUserBooks);
  const publicBooks = useQuery(api.books.getPublicBooks);
  const currentBookData = useQuery(
    api.books.getBookWithPassages,
    currentBookId ? { bookId: currentBookId } : "skip"
  );
  const updateLastPosition = useMutation(api.books.updateLastPosition);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedUpdatePosition = useCallback((bookId: Id<"books">, position: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (position !== lastSavedPosition) {
        updateLastPosition({ bookId, position })
          .then(() => setLastSavedPosition(position))
          .catch(console.error);
      }
    }, 2000) ;
  }, [lastSavedPosition, updateLastPosition]);

  useEffect(() => {
    if (!currentBookId || currentPassageIndex <= 0 || isLoadingBook || isGuest) return;
    debouncedUpdatePosition(currentBookId, currentPassageIndex);
  }, [currentPassageIndex, currentBookId, isLoadingBook, isGuest, debouncedUpdatePosition]);

  useEffect(() => {
    if (currentBookData && currentBookId) {
      setText(currentBookData.passages[currentBookData.lastReadPosition].content);
      setCurrentPassageIndex(currentBookData.lastReadPosition);
      setLastSavedPosition(currentBookData.lastReadPosition);
      setIsLoadingBook(false);
    }
  }, [currentBookData, currentBookId]);

  const selectBook = (bookId: Id<"books">) => {
    setCurrentBookId(bookId);
    setIsLoadingBook(true);
  };

  const nextPassage = () => {
    if (currentBookData?.passages) {
      const nextIndex = (currentPassageIndex + 1) % currentBookData.passages.length;
      setCurrentPassageIndex(nextIndex);
      setText(currentBookData.passages[nextIndex].content);
    } else {
      setText(DEFAULT_TEXTS[Math.floor(Math.random() * DEFAULT_TEXTS.length)]);
    }
  };

  const skipPassage = () => {
    nextPassage();
  };

  return {
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
  };
}