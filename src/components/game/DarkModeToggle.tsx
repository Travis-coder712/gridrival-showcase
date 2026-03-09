import { useTheme } from '../../contexts/ThemeContext';

/**
 * Dark Mode Toggle (Improvement 5.4)
 * Compact button for the team header bar.
 */
export default function DarkModeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white/80 hover:text-white rounded text-xs transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
