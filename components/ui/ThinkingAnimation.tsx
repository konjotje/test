import React, { useState, useEffect } from 'react';

interface ThinkingAnimationProps {
  texts: string[];
  theme: 'light' | 'dark';
  intervalMs?: number;
}

const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({
  texts,
  theme,
  intervalMs = 2000
}) => {
  const dotColorClass = 'bg-brand-accent'; // Always use brand-accent
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    if (texts.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentTextIndex(prevIndex => {
          if (prevIndex < texts.length - 1) {
            return prevIndex + 1;
          }
          clearInterval(intervalId);
          return prevIndex;
        });
      }, intervalMs);

      return () => clearInterval(intervalId);
    } else {
        setCurrentTextIndex(0);
    }
  }, [texts, intervalMs]);

  const displayText = texts.length > 0 ? texts[currentTextIndex] : "Aan het verwerken...";

  return (
    // The component now only returns its content, not the bubble container.
    // The parent component is responsible for wrapping it in a chat bubble.
    <>
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${dotColorClass} rounded-full animate-pulse-dot-1`}></div>
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${dotColorClass} rounded-full animate-pulse-dot-2`}></div>
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${dotColorClass} rounded-full animate-pulse-dot-3`}></div>
        </div>
        <p className="text-xs font-light text-light-text-secondary dark:text-dark-text-secondary mt-1 sm:mt-1.5 italic">
          {displayText}
        </p>
    </>
  );
};

export default ThinkingAnimation;
