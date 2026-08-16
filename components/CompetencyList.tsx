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
      <div className="text-sm text-slate-500 italic">No technical competencies found.</div>
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
            className="rounded-lg border border-[#00D68F]/10 bg-[#00D68F]/10/70 px-2.5 py-1 text-xs font-medium text-[#00e89b]"
          >
            {skill}
          </span>
        ))}
      </div>
      
      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 text-xs font-semibold text-slate-400 hover:text-[#00e89b] transition-colors"
        >
          + Show {hiddenCount} more
        </button>
      )}

      {showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-3 text-xs font-semibold text-slate-400 hover:text-[#00e89b] transition-colors"
        >
          Show less
        </button>
      )}
    </div>
  );
}
