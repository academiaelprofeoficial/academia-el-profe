'use client';

import { useEffect, useRef } from 'react';

export function ParticlesBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return;
    loadedRef.current = true;

    // Load tsParticles script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@tsparticles/engine@3.5.0/tsparticles.engine.bundle.min.js';
    script.onload = () => {
      const presetScript = document.createElement('script');
      presetScript.src = 'https://cdn.jsdelivr.net/npm/@tsparticles/preset-firefly@3.1.0/tsparticles.preset.firefly.bundle.min.js';
      presetScript.onload = () => {
        if ((window as any).tsParticles) {
          (window as any).tsParticles.load('tsparticles-container', {
            preset: 'firefly',
            background: { color: 'transparent' },
            particles: {
              color: { value: '#10B981' },
              move: { speed: 1.5, trail: { enable: true, length: 8 } },
              opacity: { value: 0.6 },
              size: { value: 3 },
            },
            interactivity: {
              events: { onHover: { enable: true, mode: 'trail' } },
            },
          });
        }
      };
      document.body.appendChild(presetScript);
    };
    document.body.appendChild(script);

    return () => {
      if ((window as any).tsParticles) {
        (window as any).tsParticles.dom().forEach((d: any) => d.destroy());
      }
    };
  }, []);

  return (
    <div
      id="tsparticles-container"
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
