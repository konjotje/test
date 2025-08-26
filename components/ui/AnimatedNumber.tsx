import React, { useState, useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  targetValue: number;
  className?: string;
  formatter?: (value: number) => string;
}

const defaultFormatter = (value: number) => String(Math.round(value));

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ 
  targetValue, 
  className,
  formatter = defaultFormatter
}) => {
    const [currentValue, setCurrentValue] = useState(targetValue);
    const valueRef = useRef(targetValue);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const startValue = valueRef.current;
        const endValue = targetValue;
        const duration = 400; // ms
        let startTime: number | null = null;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = progress * (2 - progress); // easeOutQuad
            const nextValue = startValue + (endValue - startValue) * easedProgress;

            setCurrentValue(nextValue);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(step);
            } else {
                setCurrentValue(endValue);
                valueRef.current = endValue;
            }
        };

        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        
        if (startValue !== endValue) {
             frameRef.current = requestAnimationFrame(step);
        } else {
            setCurrentValue(endValue);
            valueRef.current = endValue;
        }

        return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) };
    }, [targetValue]);

    return <span className={className}>{formatter(currentValue)}</span>;
};

export default AnimatedNumber;