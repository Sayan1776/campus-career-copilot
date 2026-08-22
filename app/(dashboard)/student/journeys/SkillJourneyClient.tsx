'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { buttonClasses } from '@/components/ui/Button';
import { JourneyList } from './JourneyList';
import { GapList } from './GapList';
import { JourneyDetail } from './JourneyDetail';
import type { QuizFeedback } from './QuizBlock';

export interface JourneyStep {
  stepNumber: number;
  type: 'concept' | 'challenge' | 'quiz';
  title: string;
  description: string;
  content: string;
  resourceLinks?: { title: string; url: string }[];
  quizQuestions?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  completed: boolean;
}

export interface SkillJourney {
  id: string;
  user_id: string;
  skill: string;
  severity: 'low' | 'medium' | 'high';
  steps: JourneyStep[];
  completed_steps: number;
  total_steps: number;
  status: 'in_progress' | 'completed';
  created_at: string;
}

interface SkillGap {
  skill: string;
  severity: 'low' | 'medium' | 'high';
}

interface Props {
  initialJourneys: SkillJourney[];
  skillGaps: SkillGap[];
  studentName: string;
}

export default function SkillJourneyClient({
  initialJourneys,
  skillGaps,
}: Props) {
  const [journeys, setJourneys] = useState<SkillJourney[]>(initialJourneys);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(
    initialJourneys[0]?.id || null
  );
  const [generatingSkill, setGeneratingSkill] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [qIdx: number]: number }>({});
  const [quizFeedback, setQuizFeedback] = useState<QuizFeedback | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedJourney = journeys.find((j) => j.id === selectedJourneyId);

  // Skill gaps that don't have an active journey yet
  const unstartedGaps = skillGaps.filter(
    (gap) => !journeys.some((j) => j.skill.toLowerCase() === gap.skill.toLowerCase())
  );

  function selectJourney(id: string) {
    setSelectedJourneyId(id);
    setQuizAnswers({});
    setQuizFeedback(null);
  }

  async function handleGenerateJourney(gap: SkillGap) {
    setGeneratingSkill(gap.skill);
    setErrorMsg('');
    try {
      const res = await fetch('/api/student/journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          skill: gap.skill,
          severity: gap.severity,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate journey');

      setJourneys([data.journey, ...journeys]);
      selectJourney(data.journey.id);
      toast.success(`Quest opened: ${gap.skill}`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setGeneratingSkill(null);
    }
  }

  async function handleToggleStep(stepNumber: number, currentCompleted: boolean) {
    if (!selectedJourney) return;
    const journeyId = selectedJourney.id;
    setActionLoading(true);
    try {
      const res = await fetch('/api/student/journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_step',
          journeyId,
          stepNumber,
          completed: !currentCompleted,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update step');

      setJourneys(journeys.map((j) => (j.id === journeyId ? data.journey : j)));
    } catch (err: any) {
      toast.error(err.message || 'Could not update the milestone');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleQuizSubmit() {
    if (!selectedJourney) return;
    const journeyId = selectedJourney.id;
    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/student/journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_quiz',
          journeyId,
          answers: quizAnswers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Quiz verification failed');

      setQuizFeedback({
        passed: data.passed,
        feedback: data.feedback,
      });

      if (data.journey) {
        setJourneys(journeys.map((j) => (j.id === journeyId ? data.journey : j)));
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Skill journeys & gap resolution"
        sub="Interactive 4-stage practical roadmaps that systematically eliminate your measured resume gaps."
        meta="Sheet SJ-02 · AI structured"
        actions={
          <Link
            href="/student/dashboard"
            className={buttonClasses({ variant: 'ghost', size: 'sm' })}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </Link>
        }
      />

      {errorMsg && (
        <div
          role="alert"
          className="rounded-lg border border-instrument/40 bg-instrument-wash px-4 py-3 text-sm font-medium text-instrument-deep"
        >
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-4">
          <JourneyList
            journeys={journeys}
            selectedId={selectedJourneyId}
            onSelect={selectJourney}
          />
          <GapList
            gaps={unstartedGaps}
            generatingSkill={generatingSkill}
            onGenerate={handleGenerateJourney}
          />
        </div>

        <div className="lg:col-span-8">
          <JourneyDetail
            journey={selectedJourney}
            onToggleStep={handleToggleStep}
            quizAnswers={quizAnswers}
            onQuizAnswer={(qIdx, optIdx) =>
              setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })
            }
            quizFeedback={quizFeedback}
            onQuizSubmit={handleQuizSubmit}
            actionLoading={actionLoading}
          />
        </div>
      </div>
    </>
  );
}
