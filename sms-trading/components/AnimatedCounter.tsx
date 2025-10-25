'use client';

import { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export default function AnimatedCounter({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.querySelector(`[data-counter="${end}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [end, hasAnimated]);

  useEffect(() => {
    if (!isVisible) return;

    let startValue = 0;
    const increment = end / (duration / 16);
    let currentValue = startValue;

    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(currentValue));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  const displayValue = count.toFixed(decimals);

  return (
    <span data-counter={end}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
