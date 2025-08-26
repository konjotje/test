import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BRAND_PRIMARY_COLOR } from '@/utils/helpers'; // Importeer je merkkleur

interface CustomScrollbarProps {
  scrollableRef: React.RefObject<HTMLDivElement>;
}

const CustomScrollbar: React.FC<CustomScrollbarProps> = ({ scrollableRef }) => {
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbPosition, setThumbPosition] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  // Functie om de positie en grootte van de duim te updaten
  const updateThumb = useCallback(() => {
    if (!scrollableRef.current || !trackRef.current) return;
    const { scrollWidth, clientWidth, scrollLeft } = scrollableRef.current;
    const trackWidth = trackRef.current.clientWidth;

    // Bereken de breedte van de duim
    const newThumbWidth = (clientWidth / scrollWidth) * trackWidth;
    setThumbWidth(newThumbWidth);

    // Bereken de positie van de duim
    const maxScrollLeft = scrollWidth - clientWidth;
    const maxThumbPosition = trackWidth - newThumbWidth;
    const newThumbPosition = (scrollLeft / maxScrollLeft) * maxThumbPosition;
    setThumbPosition(newThumbPosition);
  }, [scrollableRef]);

  // Effect om de thumb te updaten als de content of het venster verandert
  useEffect(() => {
    updateThumb();
    const scrollableElement = scrollableRef.current;
    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', updateThumb);
      window.addEventListener('resize', updateThumb);
    }
    return () => {
      if (scrollableElement) {
        scrollableElement.removeEventListener('scroll', updateThumb);
        window.removeEventListener('resize', updateThumb);
      }
    };
  }, [scrollableRef, updateThumb]);

  // Event handlers voor het slepen van de duim
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollableRef.current) return;
    isDragging.current = true;
    startX.current = e.clientX;
    startScrollLeft.current = scrollableRef.current.scrollLeft;
    document.body.style.cursor = 'grabbing';
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !scrollableRef.current || !trackRef.current) return;
    const dx = e.clientX - startX.current;
    const { scrollWidth, clientWidth } = scrollableRef.current;
    const trackWidth = trackRef.current.clientWidth;
    const scrollDelta = (dx / trackWidth) * scrollWidth;
    scrollableRef.current.scrollLeft = startScrollLeft.current + scrollDelta;
  }, [scrollableRef]);
  
  // Voeg mousemove en mouseup listeners toe aan het hele document
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove]);
  
  // Handlers voor de pijltjesknoppen
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollableRef.current) return;
    const { clientWidth } = scrollableRef.current;
    const scrollAmount = clientWidth * 0.2; // Scroll 20% van de zichtbare breedte
    scrollableRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Verberg de scrollbar als de content niet breder is dan de container
  if (!scrollableRef.current || scrollableRef.current.scrollWidth <= scrollableRef.current.clientWidth) {
    return null;
  }

  return (
    <div className="flex items-center w-full mt-2 px-2">
      {/* Pijl naar links aan het begin van de track */}
      <button onClick={() => handleScroll('left')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
        <ChevronLeft size={18} />
      </button>

      {/* De track van de scrollbar */}
      <div ref={trackRef} className="flex-grow h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-2 relative">
        {/* De versleepbare duim */}
        <div
          className="h-5 -top-[6px] absolute rounded-full flex items-center justify-between px-1 shadow-md"
          style={{
            width: `${thumbWidth}px`,
            transform: `translateX(${thumbPosition}px)`,
            backgroundColor: BRAND_PRIMARY_COLOR,
            cursor: 'grab',
          }}
          onMouseDown={handleMouseDown}
        >
          <ChevronLeft size={14} className="text-white" />
          <ChevronRight size={14} className="text-white" />
        </div>
      </div>
      
      {/* Pijl naar rechts aan het einde van de track */}
      <button onClick={() => handleScroll('right')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default CustomScrollbar;