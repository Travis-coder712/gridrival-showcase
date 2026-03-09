import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EDUCATION_SLIDES } from '../../data/landingContent';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function formatBody(text: string) {
  // Split on **bold** markers and newlines
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => (
    <span key={lineIdx}>
      {lineIdx > 0 && <br />}
      {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
        j % 2 === 0 ? part : <strong key={j} className="text-electric-300 font-semibold">{part}</strong>
      )}
    </span>
  ));
}

export default function EducationalSlideDeck({ isOpen, onClose }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  }, [currentSlide]);

  const goNext = useCallback(() => {
    if (currentSlide < EDUCATION_SLIDES.length - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    }
  }, [currentSlide]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, goNext, goPrev]);

  // Reset to first slide when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setDirection(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const slide = EDUCATION_SLIDES[currentSlide];

  const variants = {
    enter: (dir: number) => ({
      x: dir >= 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir >= 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-navy-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-navy-950/50 flex-shrink-0">
          <div className="text-sm text-navy-400 font-mono">
            {currentSlide + 1} / {EDUCATION_SLIDES.length}
          </div>
          <h3 className="text-lg font-bold text-white">Learn the NEM</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-navy-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Slide Content */}
        <div className="flex-1 overflow-hidden relative min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0 overflow-y-auto px-6 md:px-10 py-8"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  <div className="text-4xl mb-3">{slide.icon}</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {slide.heading}
                  </h2>
                  <div className="text-navy-200 text-sm md:text-base leading-relaxed space-y-2">
                    {formatBody(slide.body)}
                  </div>
                </div>
                {slide.imageUrl && (
                  <div className="w-full md:w-72 flex-shrink-0 rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={slide.imageUrl}
                      alt={slide.heading}
                      className="w-full h-48 md:h-40 object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-navy-950/50 flex-shrink-0">
          <button
            onClick={goPrev}
            disabled={currentSlide === 0}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {EDUCATION_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlide
                    ? 'bg-electric-400 w-6'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={currentSlide === EDUCATION_SLIDES.length - 1 ? onClose : goNext}
            className="px-4 py-2 rounded-lg bg-electric-500 hover:bg-electric-400 text-white text-sm font-medium transition-all"
          >
            {currentSlide === EDUCATION_SLIDES.length - 1 ? 'Got it!' : 'Next →'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
