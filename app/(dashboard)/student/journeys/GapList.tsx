'use client';

import { Button } from '@/components/ui/Button';
import { Sheet, TitleBlock } from '@/components/ui/Sheet';
import { SeverityBadge } from '@/components/ui/Badge';
import { PartyPopper } from 'lucide-react';

interface SkillGap {
  skill: string;
  severity: 'low' | 'medium' | 'high';
}

export function GapList({
  gaps,
  generatingSkill,
  onGenerate,
}: {
  gaps: SkillGap[];
  generatingSkill: string | null;
  onGenerate: (gap: SkillGap) => void;
}) {
  return (
    <Sheet className="overflow-hidden">
      <TitleBlock
        title="Detected gaps"
        sub="Measured on your latest resume"
        meta={`${gaps.length} unstarted`}
      />
      <div className="p-4">
        {gaps.length === 0 ? (
          <div className="flex items-start gap-2.5 rounded-lg border border-pass/30 bg-pass-wash px-3.5 py-3 text-xs leading-relaxed text-pass-deep">
            <PartyPopper className="mt-px h-4 w-4 shrink-0" strokeWidth={1.8} />
            <span>
              Great job — learning journeys exist for every detected skill gap.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {gaps.map((gap) => (
              <div
                key={gap.skill}
                className="flex items-center justify-between gap-2.5 rounded-lg border border-ink-line bg-white p-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-ink">{gap.skill}</div>
                  <SeverityBadge severity={gap.severity} className="mt-1" />
                </div>
                <Button
                  size="sm"
                  variant="signal"
                  onClick={() => onGenerate(gap)}
                  loading={generatingSkill === gap.skill}
                >
                  {generatingSkill === gap.skill ? 'Creating…' : '+ Start quest'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  );
}
