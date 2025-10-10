'use client'

import { Book } from '../../types';
import { Id } from '../../../../convex/_generated/dataModel';
import BookCard from './BookCard';

interface BookListProps {
  books: Book[];
  currentBookId: Id<"books"> | null;
  onBookSelect: (bookId: Id<"books">) => void;
  isLoading: boolean;
  title: string;
}

export default function BookList({
  books,
  currentBookId,
  onBookSelect,
  isLoading,
  title,
}: BookListProps) {
  if (books.length === 0) return null;

  return (
    <div className="mb-8 p-4 md:p-5 bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-matrix-primary mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
        {books.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            isSelected={currentBookId === book._id}
            onSelect={() => onBookSelect(book._id)}
            disabled={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
