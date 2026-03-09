import { useState, useEffect, useRef } from 'react';
import { LANDING_STATS } from '../../data/landingContent';

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const start = performance.now();

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuart(progress);
            setDisplay(Math.round(eased * value));

            if (progress < 1) {
              requestAnimationFrame(tick);
            }
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="font-mono text-3xl md:text-4xl font-bold text-electric-400">
      {display}{suffix}
    </div>
  );
}

export default function StatsCounter() {
  return (
    <div className="flex items-center justify-center gap-8 md:gap-16">
      {LANDING_STATS.map((stat, i) => (
        <div key={i} className="text-center">
          <AnimatedNumber value={stat.value} suffix={stat.suffix} />
          <div className="text-xs text-navy-400 mt-1 uppercase tracking-wider">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
