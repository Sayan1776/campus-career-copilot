'use client';

import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { JourneyStep } from './SkillJourneyClient';

const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E'];

export interface QuizFeedback {
  passed: boolean;
  feedback: { questionIndex: number; isCorrect: boolean; explanation: string }[];
}

export function QuizBlock({
  step,
  answers,
  onAnswer,
  feedback,
  onSubmit,
  actionLoading,
}: {
  step: JourneyStep;
  answers: { [qIdx: number]: number };
  onAnswer: (qIdx: number, optIdx: number) => void;
  feedback: QuizFeedback | null;
  onSubmit: () => void;
  actionLoading: boolean;
}) {
  const questions = step.quizQuestions || [];
  const allAnswered = Object.keys(answers).length >= questions.length;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-semibold text-ink-soft">
        Answer the verification questions to close this quest:
      </p>

      {questions.map((q, qIdx) => {
        const marked = feedback?.feedback.find((f) => f.questionIndex === qIdx);
        return (
          <fieldset
            key={qIdx}
            className="space-y-1.5 rounded-lg border border-ink-line bg-white p-3.5"
          >
            <legend className="sr-only">{`Question ${qIdx + 1}`}</legend>
            <p className="text-xs font-bold text-ink">
              <span className="mr-1.5 font-mono text-ink-faint">{qIdx + 1}.</span>
              {q.question}
            </p>
            <div className="space-y-1.5">
              {q.options.map((opt, optIdx) => {
                const selected = answers[qIdx] === optIdx;
                const isCorrectOption = marked && optIdx === q.correctIndex;
                const isWrongSelection = marked && selected && !marked.isCorrect;
                return (
                  <label
                    key={optIdx}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-md border p-2 text-xs transition-colors',
                      isCorrectOption
                        ? 'border-pass bg-pass-wash text-ink'
                        : isWrongSelection
                          ? 'border-instrument bg-instrument-wash text-ink'
                          : selected
                            ? 'border-instrument bg-white font-semibold text-ink shadow-hairline'
                            : 'border-ink-line bg-white text-ink-soft hover:border-ink-line-strong hover:text-ink'
                    )}
                  >
                    <input
                      type="radio"
                      name={`quiz_${step.stepNumber}_q_${qIdx}`}
                      checked={selected}
                      onChange={() => onAnswer(qIdx, optIdx)}
                      className="h-3.5 w-3.5 shrink-0 accent-instrument"
                    />
                    <span className="font-mono text-xxs text-ink-faint">
                      {OPTION_KEYS[optIdx]}
                    </span>
                    <span>{opt}</span>
                    {isCorrectOption && (
                      <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-pass" strokeWidth={2.4} />
                    )}
                    {isWrongSelection && (
                      <X className="ml-auto h-3.5 w-3.5 shrink-0 text-instrument-deep" strokeWidth={2.4} />
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {feedback && (
        <div
          role="status"
          className={cn(
            'rounded-lg border p-3.5 text-xs leading-relaxed',
            feedback.passed
              ? 'border-pass/40 bg-pass-wash text-pass-deep'
              : 'border-instrument/40 bg-instrument-wash text-instrument-deep'
          )}
        >
          <div className="mb-1.5 font-bold">
            {feedback.passed
              ? 'All answers correct — milestone completed.'
              : 'Some answers were incorrect. Review the explanations and try again:'}
          </div>
          <ul className="list-disc space-y-1 pl-4">
            {feedback.feedback.map((f, i) => (
              <li key={i}>
                <span className="font-semibold">
                  {f.isCorrect ? 'Correct' : 'Incorrect'} —{' '}
                </span>
                {f.explanation}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button
        variant="signal"
        onClick={onSubmit}
        loading={actionLoading}
        disabled={!allAnswered}
      >
        {actionLoading ? 'Grading…' : 'Verify answers & complete quest'}
      </Button>
    </div>
  );
}
