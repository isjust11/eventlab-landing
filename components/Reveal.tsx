'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  align = 'center',
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  align?: 'center' | 'left';
  light?: boolean;
}) {
  return (
    <Reveal className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className={`mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl ${light ? 'text-white' : 'text-ink'}`}>
        {title}
      </h2>
      {text ? <p className={`mt-4 text-base leading-relaxed ${light ? 'text-white/70' : 'text-ink/65'}`}>{text}</p> : null}
    </Reveal>
  );
}
