'use client'

import { Book } from '../../types';

interface BookCardProps {
  book: Book;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}

export default function BookCard({ book, isSelected, onSelect, disabled }: BookCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`flex justify-between items-center p-3 rounded-lg border-2 transition-all text-left min-h-[52px] ${
        isSelected
          ? 'border-matrix-primary bg-matrix-primary/20 shadow-glow translate-x-1'
          : 'border-matrix-primary/20 hover:border-matrix-primary hover:bg-matrix-primary/10 hover:translate-x-1'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="text-sm font-medium text-matrix-light truncate flex-1">
        {book.title}
      </span>
      <span className="text-xs ml-3 px-2 py-1 bg-matrix-primary/20 rounded font-semibold text-matrix-primary">
        {book.lastReadPosition + 1}/{book.totalPassages}
      </span>
    </button>
  );
}