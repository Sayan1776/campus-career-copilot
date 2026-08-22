'use client';

import { Progress } from '@/components/ui/Progress';
import { Sheet, TitleBlock } from '@/components/ui/Sheet';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import type { SkillJourney } from './SkillJourneyClient';

export function JourneyList({
  journeys,
  selectedId,
  onSelect,
}: {
  journeys: SkillJourney[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <Sheet className="overflow-hidden">
      <TitleBlock
        title="Active roadmaps"
        sub="Your open learning journeys"
        meta={`${journeys.length} on file`}
      />
      <div className="p-4">
        {journeys.length === 0 ? (
          <p className="py-4 text-center text-xs leading-relaxed text-ink-soft">
            No active journeys yet. Generate one from your detected gaps below.
          </p>
        ) : (
          <div className="space-y-2">
            {journeys.map((j) => {
              const isSelected = j.id === selectedId;
              const percent = Math.round(
                (j.completed_steps / (j.total_steps || 4)) * 100
              );
              return (
                <button
                  key={j.id}
                  onClick={() => onSelect(j.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'w-full rounded-lg border p-3 text-left transition-colors',
                    isSelected
                      ? 'border-instrument bg-white shadow-hairline'
                      : 'border-ink-line bg-white hover:border-ink-line-strong'
                  )}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-sm font-bold text-ink">
                      {j.skill}
                    </span>
                    {j.status === 'completed' ? (
                      <Badge tone="pass">Mastered</Badge>
                    ) : (
                      <span className="tabular shrink-0 font-mono text-xxs text-ink-faint">
                        {percent}%
                      </span>
                    )}
                  </div>
                  <Progress
                    value={percent}
                    tone={j.status === 'completed' ? 'pass' : isSelected ? 'instrument' : 'ink'}
                    label={`${j.skill} progress`}
                  />
                  <div className="mt-1.5 flex items-center justify-between font-mono text-xxs text-ink-faint">
                    <span>
                      {j.completed_steps}/{j.total_steps || 4} milestones
                    </span>
                    <span className="uppercase tracking-[0.06em]">{j.severity} gap</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Sheet>
  );
}
