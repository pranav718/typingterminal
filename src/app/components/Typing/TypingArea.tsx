'use client'

import { SettingsType } from '../../hooks/useSettings';

interface TypingAreaProps {
  text: string;
  userInput: string;
  isComplete: boolean;
  isDisabled: boolean;
  settings?: SettingsType;  
}

export default function TypingArea({ text, userInput, isComplete, isDisabled, settings }: TypingAreaProps) {
  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'inline-block transition-all duration-150';
      let style: React.CSSProperties = { whiteSpace: 'pre' };
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += ' text-matrix-primary drop-shadow-glow';
        } else {
          const shakeClass = settings?.shakeIntensity !== 'off' 
            ? ` animate-shake-${settings?.shakeIntensity || 'medium'}` 
            : '';
          className += ` text-error bg-error/20 px-0.5 rounded drop-shadow-error-glow${shakeClass}`;
        }
      } else if (index === userInput.length) {
        className += ' bg-gradient-to-r from-matrix-primary/30 to-matrix-primary/10 rounded px-1 -mx-0.5 scale-110 animate-blink';
      } else {
        className += ' text-matrix-light';
        style.opacity = settings?.textOpacity ?? 0.3;
      }
      
      const displayChar = char === ' ' ? '\u00A0' : char;
      
      return (
        <span key={index} className={className} style={style}>
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