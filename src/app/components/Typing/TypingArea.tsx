'use client'

import { useRef, useEffect } from 'react';

interface TypingAreaProps {
  text: string;
  userInput: string;
  isComplete: boolean;
  isDisabled: boolean;
}

export default function TypingArea({ text, userInput, isComplete, isDisabled }: TypingAreaProps) {
  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'inline-block transition-all duration-150';
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += ' text-matrix-primary drop-shadow-glow';
        } else {
          className += ' text-error bg-error/20 px-0.5 rounded drop-shadow-error-glow animate-shake-medium';
        }
      } else if (index === userInput.length) {
        className += ' bg-gradient-to-r from-matrix-primary/30 to-matrix-primary/10 rounded px-1 -mx-0.5 scale-110 animate-blink';
      }
      
      const displayChar = char === ' ' ? '\u00A0' : char;
      
      return (
        <span key={index} className={className} style={{ whiteSpace: 'pre' }}>
          {displayChar}
        </span>
      );
    });
  };

  return (
    <div 
      className={`relative text-xl md:text-2xl leading-relaxed min-h-[200px] md:min-h-[240px] mb-8 p-4 md:p-8 bg-matrix-primary/5 border-2 border-matrix-primary/20 rounded-2xl backdrop-blur-sm ${
        isDisabled ? 'opacity-50' : ''
      }`}
      style={{ 
        letterSpacing: '0.3px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-matrix-primary to-transparent opacity-30 rounded-t-2xl" />
      {isDisabled ? (
        <div className="text-matrix-primary animate-pulse flex items-center justify-center h-full">
          Loading passage...
        </div>
      ) : (
        renderText()
      )}
    </div>
  );
}