'use client';

import { useEffect, useRef } from 'react';
import Typed from 'typed.js';

interface HeroTypedProps {
  strings: string[];
  typeSpeed?: number;
  backSpeed?: number;
  backDelay?: number;
  loop?: boolean;
}

export default function HeroTyped({
  strings,
  typeSpeed = 40,
  backSpeed = 60,
  backDelay = 1500,
  loop = true,
}: HeroTypedProps) {
  const el = useRef<HTMLSpanElement>(null);
  const typed = useRef<Typed | null>(null);

  useEffect(() => {
    if (!el.current) return;

    typed.current = new Typed(el.current, {
      strings,
      typeSpeed,
      backSpeed,
      backDelay,
      loop,
      showCursor: true,
      cursorChar: '|',
    });

    return () => {
      if (typed.current) {
        typed.current.destroy();
      }
    };
  }, [strings, typeSpeed, backSpeed, backDelay, loop]);

  return (
    <span
      ref={el}
      className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 font-bold"
    />
  );
}
