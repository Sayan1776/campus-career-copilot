'use client';

import { useState } from 'react';

interface Props {
  skills: string[];
}

export default function CompetencyList({ skills }: Props) {
  const [showAll, setShowAll] = useState(false);
  const displayLimit = 5;

  if (!skills || skills.length === 0) {
    return (
      <div className="text-sm italic text-ink-faint">
        No technical competencies measured yet.
      </div>
    );
  }

  const displayedSkills = showAll ? skills : skills.slice(0, displayLimit);
  const hiddenCount = skills.length - displayLimit;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {displayedSkills.map((skill) => (
          <span
            key={skill}
            className="rounded border border-ink-line bg-white px-2 py-1 font-mono text-xs font-medium text-ink"
          >
            {skill}
          </span>
        ))}
      </div>

      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 font-mono text-xs font-medium text-instrument-deep underline-offset-2 hover:underline"
        >
          + Show {hiddenCount} more
        </button>
      )}

      {showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-3 font-mono text-xs font-medium text-instrument-deep underline-offset-2 hover:underline"
        >
          Show less
        </button>
      )}
    </div>
  );
}
