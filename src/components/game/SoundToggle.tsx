import { useState } from 'react';
import AudioManager from '../../lib/AudioManager';

/**
 * Sound Toggle Button (Improvement 4.1)
 * Compact mute/unmute button for the team header.
 */
export default function SoundToggle() {
  const [muted, setMuted] = useState(AudioManager.muted);

  const toggle = () => {
    const newMuted = AudioManager.toggle();
    setMuted(newMuted);
    if (!newMuted) {
      AudioManager.click(); // Play a sound to confirm unmute
    }
  };

  return (
    <button
      onClick={toggle}
      className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white/80 hover:text-white rounded text-xs transition-colors"
      title={muted ? 'Unmute sound effects' : 'Mute sound effects'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
