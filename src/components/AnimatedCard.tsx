import React, { ReactNode } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface AnimatedCardProps {
  children: ReactNode;
  index?: number;
  className?: string;
  delay?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  index = 0,
  className = '',
  delay = 0,
}) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2, rootMargin: '50px' });
  const staggerDelay = (index * 0.05 + delay) * 1000;

  return (
    <div
      ref={ref}
      className={`
        transition-all duration-500 transform
        ${isVisible ? 'animate-pop' : 'opacity-0 scale-95'}
        ${className}
      `}
      style={{
        transitionDelay: isVisible ? `${staggerDelay}ms` : '0ms',
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
