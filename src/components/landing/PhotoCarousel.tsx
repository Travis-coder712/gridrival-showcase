import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ENERGY_PHOTOS } from '../../data/landingContent';

export default function PhotoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const timerRef = useRef<number>(0);

  // Preload images
  useEffect(() => {
    ENERGY_PHOTOS.forEach((photo, i) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, i]));
      };
      img.onerror = () => {
        // Mark as loaded anyway to skip it gracefully
        setLoadedImages(prev => new Set([...prev, i]));
      };
      img.src = photo.url;
    });
  }, []);

  // Cycle through photos
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % ENERGY_PHOTOS.length);
    }, 8000);

    return () => clearInterval(timerRef.current);
  }, []);

  const currentPhoto = ENERGY_PHOTOS[currentIndex];

  return (
    <div className="fixed inset-0 z-[1] overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{
            backgroundImage: loadedImages.has(currentIndex) ? `url(${currentPhoto.url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </AnimatePresence>

      {/* Dark gradient overlay for readability */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(8,16,28,0.45) 0%, rgba(8,16,28,0.60) 40%, rgba(8,16,28,0.85) 100%)',
        }}
      />
    </div>
  );
}
