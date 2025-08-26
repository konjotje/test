import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { marked } from 'marked';

interface TypedMessageContentProps {
  fullText: string;
  speed?: number; // Milliseconds per token/word
  onTextUpdate?: () => void;
  onTypingComplete?: () => void;
  className?: string;
}

const TypedMessageContent: React.FC<TypedMessageContentProps> = ({
  fullText,
  speed = 20, // A bit faster for a smoother feel
  onTextUpdate,
  onTypingComplete,
  className,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const tokenIndexRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(0);

  // Split text by space and newlines, keeping the delimiters. This creates an array of words and whitespace.
  const tokens = useMemo(() => fullText.split(/(\s+)/), [fullText]);

  const typeToken = useCallback((timestamp: number) => {
    if (tokenIndexRef.current < tokens.length) {
      if (!lastUpdateTimeRef.current || (timestamp - lastUpdateTimeRef.current) >= speed) {
        lastUpdateTimeRef.current = timestamp;

        tokenIndexRef.current++;

        // Rebuild string from tokens slice instead of appending to previous state.
        // This is more robust and prevents race conditions that merge words.
        const nextText = tokens.slice(0, tokenIndexRef.current).join('');
        setDisplayedText(nextText);

        if (onTextUpdate) {
          onTextUpdate();
        }
      }
      animationFrameIdRef.current = requestAnimationFrame(typeToken);
    } else {
      if (onTypingComplete) {
        onTypingComplete();
      }
    }
  }, [tokens, speed, onTextUpdate, onTypingComplete]);

  useEffect(() => {
    // Reset state for a new typing animation
    setDisplayedText('');
    tokenIndexRef.current = 0;
    lastUpdateTimeRef.current = 0;

    // Start typing animation
    animationFrameIdRef.current = requestAnimationFrame(typeToken);

    return () => {
      // Cleanup on unmount or when fullText changes
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [fullText, typeToken]); // Rerun effect if fullText or typeToken changes

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: marked.parse(displayedText) as string }}
    />
  );
};

export default TypedMessageContent;
