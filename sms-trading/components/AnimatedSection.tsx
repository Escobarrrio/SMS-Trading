'use client';

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: string;
  duration?: number;
  delay?: number;
  className?: string;
}

export default function AnimatedSection({
  children,
  animation = 'fade-up',
  duration = 800,
  delay = 0,
  className = '',
}: AnimatedSectionProps) {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);

  return (
    <div
      data-aos={animation}
      data-aos-duration={duration}
      data-aos-delay={delay}
      className={className}
    >
      {children}
    </div>
  );
}
