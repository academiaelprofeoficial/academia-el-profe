'use client';

import React, { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Direction → Framer Motion initial + animate values                 */
/* ------------------------------------------------------------------ */

const getDirectionVariants = (
  direction: 'up' | 'left' | 'right' | 'scale',
  delay: number
): Variants => {
  const base = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1], // cubic-bezier approximation of power3.out
      },
    },
  };

  switch (direction) {
    case 'up':
      return {
        hidden: { ...base.hidden, y: 40 },
        visible: { ...base.visible, y: 0 },
      };
    case 'left':
      return {
        hidden: { ...base.hidden, x: -40 },
        visible: { ...base.visible, x: 0 },
      };
    case 'right':
      return {
        hidden: { ...base.hidden, x: 40 },
        visible: { ...base.visible, x: 0 },
      };
    case 'scale':
      return {
        hidden: { ...base.hidden, scale: 0.92 },
        visible: { ...base.visible, scale: 1 },
      };
    default:
      return {
        hidden: { ...base.hidden, y: 40 },
        visible: { ...base.visible, y: 0 },
      };
  }
};

/* ------------------------------------------------------------------ */
/*  AnimatedSection Component                                          */
/* ------------------------------------------------------------------ */

interface AnimatedSectionProps {
  children: ReactNode;
  /** Delay in seconds before animation starts (default: 0) */
  delay?: number;
  /** Direction of the reveal animation (default: 'up') */
  direction?: 'up' | 'left' | 'right' | 'scale';
  /** Additional CSS classes */
  className?: string;
  /** Intersection threshold (default: 0.15) */
  threshold?: number;
  /** Only trigger once (default: true) */
  once?: boolean;
  /** HTML tag to render (default: 'div') */
  as?: 'div' | 'section' | 'article' | 'span';
}

export function AnimatedSection({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  threshold = 0.15,
  once = true,
  as = 'div',
}: AnimatedSectionProps) {
  const variants = getDirectionVariants(direction, delay);

  const MotionTag = motion.create(as);

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
    >
      {children}
    </MotionTag>
  );
}