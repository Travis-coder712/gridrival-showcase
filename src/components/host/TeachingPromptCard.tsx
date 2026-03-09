import { useState } from 'react';

interface TeachingPromptCardProps {
  notes: string[];
  roundNumber: number;
  roundName: string;
}

/**
 * Teaching Prompt Card (Improvement 3.1)
 * Shows the host talking points / teaching notes for the current round.
 * Displayed during briefing phase when hostTeachingNotes exist on the round config.
 */
export default function TeachingPromptCard({ notes, roundNumber, roundName }: TeachingPromptCardProps) {
  const [checkedNotes, setCheckedNotes] = useState<Set<number>>(new Set());
  const [collapsed, setCollapsed] = useState(false);

  const toggleNote = (index: number) => {
    setCheckedNotes(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const allChecked = checkedNotes.size === notes.length;

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="w-full flex items-center justify-between px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/15 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🎓</span>
          <span className="text-sm font-medium text-purple-300">Teaching Notes</span>
          <span className="text-xs text-navy-400">({checkedNotes.size}/{notes.length} covered)</span>
        </div>
        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  }

  return (
    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/10">
        <div className="flex items-center gap-2">
          <span className="text-base">🎓</span>
          <div>
            <span className="text-sm font-semibold text-purple-300">Teaching Notes</span>
            <span className="text-xs text-navy-400 ml-2">Round {roundNumber}: {roundName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {allChecked && (
            <span className="text-xs text-green-400 font-medium">All covered!</span>
          )}
          <button
            onClick={() => setCollapsed(true)}
            className="text-navy-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="p-4 space-y-2">
        {notes.map((note, i) => {
          const isChecked = checkedNotes.has(i);
          return (
            <button
              key={i}
              onClick={() => toggleNote(i)}
              className={`w-full flex items-start gap-3 text-left px-3 py-2.5 rounded-lg transition-all ${
                isChecked
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-white/5 border border-transparent hover:bg-white/10'
              }`}
            >
              {/* Checkbox */}
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                isChecked ? 'bg-green-500 text-white' : 'border-2 border-navy-500'
              }`}>
                {isChecked && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {/* Note text */}
              <span className={`text-sm leading-relaxed ${
                isChecked ? 'text-navy-400 line-through' : 'text-navy-200'
              }`}>
                {note}
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="w-full h-1.5 bg-navy-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${(checkedNotes.size / notes.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
