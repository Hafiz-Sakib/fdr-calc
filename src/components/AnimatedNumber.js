import React, { useEffect, useRef, useState } from 'react';

export default function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const startValRef = useRef(0);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startValRef.current = display;
    startRef.current = null;

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValRef.current + (value - startValRef.current) * eased);
      setDisplay(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]); // eslint-disable-line

  const formatted = display.toLocaleString('en-IN');
  return <span>{prefix}{formatted}{suffix}</span>;
}
