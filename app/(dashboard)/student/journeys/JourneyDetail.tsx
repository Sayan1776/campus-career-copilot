'use client';

import { Check, ExternalLink, Route } from 'lucide-react';
import { Sheet, TitleBlock } from '@/components/ui/Sheet';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import type { SkillJourney } from './SkillJourneyClient';
import { QuizBlock, QuizFeedback } from './QuizBlock';

export function JourneyDetail({
  journey,
  onToggleStep,
  quizAnswers,
  onQuizAnswer,
  quizFeedback,
  onQuizSubmit,
  actionLoading,
}: {
  journey: SkillJourney | undefined;
  onToggleStep: (stepNumber: number, currentCompleted: boolean) => void;
  quizAnswers: { [qIdx: number]: number };
  onQuizAnswer: (qIdx: number, optIdx: number) => void;
  quizFeedback: QuizFeedback | null;
  onQuizSubmit: () => void;
  actionLoading: boolean;
}) {
  if (!journey) {
    return (
      <EmptyState
        icon={<Route className="h-5 w-5" strokeWidth={1.8} />}
        title="Select or start a skill journey"
        body="Pick a skill from the roadmap list to start closing your gaps before campus placement drives."
        className="h-full justify-center py-16"
      />
    );
  }

  const percent = Math.round(
    (journey.completed_steps / (journey.total_steps || 4)) * 100
  );

  return (
    <Sheet className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-ink-line bg-sheet-inset px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-extrabold tracking-[-0.01em] text-ink">
              {journey.skill}
            </h2>
            {journey.status === 'completed' ? (
              <Badge tone="pass">Mastered</Badge>
            ) : (
              <Badge tone="instrument">In progress</Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            Step-by-step roadmap for technical interviews and campus drives.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono text-xxs font-medium uppercase tracking-[0.1em] text-ink-faint">
            Milestones
          </div>
          <div className="tabular mt-0.5 font-mono text-sm font-semibold text-ink">
            {journey.completed_steps} / {journey.total_steps || 4} complete
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        <Progress
          value={percent}
          tone={journey.status === 'completed' ? 'pass' : 'instrument'}
          label={`${journey.skill} overall progress`}
        />

        {journey.steps?.map((step) => {
          const isQuizStep = step.type === 'quiz';
          return (
            <div
              key={step.stepNumber}
              className={cn(
                'rounded-lg border p-4 transition-colors',
                step.completed
                  ? 'border-pass/40 bg-pass-wash/40'
                  : 'border-ink-line bg-white'
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold',
                      step.completed
                        ? 'bg-pass text-white'
                        : 'border border-ink-line bg-sheet-inset text-ink'
                    )}
                  >
                    {step.completed ? <Check className="h-4 w-4" strokeWidth={2.4} /> : step.stepNumber}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-ink">{step.title}</h3>
                    <p className="mt-0.5 text-xs text-ink-soft">{step.description}</p>
                  </div>
                </div>

                {!isQuizStep && (
                  <Button
                    size="sm"
                    variant={step.completed ? 'outline' : 'primary'}
                    onClick={() => onToggleStep(step.stepNumber, step.completed)}
                    loading={actionLoading}
                    className="shrink-0"
                  >
                    {step.completed ? 'Completed' : 'Mark as done'}
                  </Button>
                )}
              </div>

              <div className="whitespace-pre-line rounded-md border border-ink-line bg-sheet-inset px-3.5 py-3 text-xs leading-relaxed text-ink-soft">
                {step.content}
              </div>

              {step.resourceLinks && step.resourceLinks.length > 0 && (
                <div className="mt-3">
                  <span className="font-mono text-xxs font-medium uppercase tracking-[0.1em] text-ink-faint">
                    Recommended resources
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {step.resourceLinks.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-ink-line-strong bg-white px-2.5 py-1 text-xs font-medium text-ink transition-colors hover:border-instrument hover:text-instrument-deep"
                      >
                        <ExternalLink className="h-3 w-3" strokeWidth={1.8} />
                        {res.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {isQuizStep && step.quizQuestions && step.quizQuestions.length > 0 && (
                <QuizBlock
                  step={step}
                  answers={quizAnswers}
                  onAnswer={onQuizAnswer}
                  feedback={quizFeedback}
                  onSubmit={onQuizSubmit}
                  actionLoading={actionLoading}
                />
              )}
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}
