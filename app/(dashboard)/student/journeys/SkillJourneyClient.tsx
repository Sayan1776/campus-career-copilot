'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  studentName,
}: Props) {
  const [journeys, setJourneys] = useState<SkillJourney[]>(initialJourneys);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(
    initialJourneys[0]?.id || null
  );
  const [generatingSkill, setGeneratingSkill] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [qIdx: number]: number }>({});
  const [quizFeedback, setQuizFeedback] = useState<{
    passed: boolean;
    feedback: { questionIndex: number; isCorrect: boolean; explanation: string }[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedJourney = journeys.find((j) => j.id === selectedJourneyId);

  // Skill gaps that don't have an active journey yet
  const unstartedGaps = skillGaps.filter(
    (gap) => !journeys.some((j) => j.skill.toLowerCase() === gap.skill.toLowerCase())
  );

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
      setSelectedJourneyId(data.journey.id);
      setQuizAnswers({});
      setQuizFeedback(null);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setGeneratingSkill(null);
    }
  }

  async function handleToggleStep(journeyId: string, stepNumber: number, currentCompleted: boolean) {
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
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleQuizSubmit(journeyId: string) {
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
    <div className="dashboard-content">
        {/* Header Bar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2923] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Skill Journeys & Gap Resolution</h1>
              <span className="rounded-full bg-[#00D68F]/20 px-2.5 py-0.5 text-xs font-semibold text-[#00D68F]">
                AI Structured
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Interactive 3-stage practical roadmaps designed to systematically eliminate your resume skill gaps.
            </p>
          </div>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-[#121815] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-[#1a231d] transition-colors shadow-subtle"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-lg bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List of Journeys & Unresolved Gaps */}
          <div className="lg:col-span-4 space-y-6">
            {/* Active Journeys */}
            <div className="rounded-xl border border-[#1e2923] bg-[#121815] p-4 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Learning Roadmaps ({journeys.length})
                </h2>
              </div>

              {journeys.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No active journeys yet. Generate one from your skill gaps below!
                </p>
              ) : (
                <div className="space-y-2">
                  {journeys.map((j) => {
                    const isSelected = j.id === selectedJourneyId;
                    const percent = Math.round((j.completed_steps / (j.total_steps || 3)) * 100);
                    return (
                      <button
                        key={j.id}
                        onClick={() => {
                          setSelectedJourneyId(j.id);
                          setQuizAnswers({});
                          setQuizFeedback(null);
                        }}
                        className={`w-full text-left rounded-lg p-3 transition-all border ${
                          isSelected
                            ? 'border-indigo-600 bg-[#00D68F]/10/50 shadow-sm'
                            : 'border-[#233028] hover:border-slate-300 bg-[#1a231d]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-sm text-white">{j.skill}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              j.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {j.status === 'completed' ? 'Mastered' : `${percent}% Done`}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              j.status === 'completed' ? 'bg-emerald-500' : 'bg-[#00D68F]'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                          <span>{j.completed_steps} of {j.total_steps || 3} milestones</span>
                          <span className="capitalize">{j.severity} gap</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Unresolved Skill Gaps from Resume */}
            <div className="rounded-xl border border-[#1e2923] bg-[#121815] p-4 shadow-card">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Detected Resume Gaps ({unstartedGaps.length})
              </h2>

              {unstartedGaps.length === 0 ? (
                <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                  🎉 Great job! You have created learning journeys for all detected skill gaps.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {unstartedGaps.map((gap) => (
                    <div
                      key={gap.skill}
                      className="flex items-center justify-between rounded-lg border border-[#1e2923] p-2.5 bg-[#1a231d]"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{gap.skill}</div>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                            gap.severity === 'high'
                              ? 'bg-rose-100 text-rose-700'
                              : gap.severity === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-200 text-slate-300'
                          }`}
                        >
                          {gap.severity} priority
                        </span>
                      </div>
                      <button
                        onClick={() => handleGenerateJourney(gap)}
                        disabled={generatingSkill === gap.skill}
                        className="rounded-md bg-[#00D68F] px-2.5 py-1.5 text-xs font-semibold text-[#041a12] hover:bg-[#00e89b] disabled:opacity-50 transition-colors shadow-subtle"
                      >
                        {generatingSkill === gap.skill ? 'Creating...' : '+ Start Quest'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Journey Detail View */}
          <div className="lg:col-span-8">
            {selectedJourney ? (
              <div className="rounded-xl border border-[#1e2923] bg-[#121815] p-6 shadow-card space-y-6">
                {/* Journey Title Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#233028] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-white">{selectedJourney.skill}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          selectedJourney.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-[#00D68F]/20 text-[#00D68F]'
                        }`}
                      >
                        {selectedJourney.status === 'completed' ? '✓ Mastered' : 'In Progress'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Step-by-step roadmap to prepare for technical interviews and campus drives.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-500">Milestone Progress</div>
                    <div className="text-sm font-bold text-[#00e89b]">
                      {selectedJourney.completed_steps} / {selectedJourney.total_steps || 3} Completed
                    </div>
                  </div>
                </div>

                {/* 3 Step Flow */}
                <div className="space-y-6">
                  {selectedJourney.steps?.map((step) => {
                    const isStep1 = step.stepNumber === 1;
                    const isStep2 = step.stepNumber === 2;
                    const isStep3 = step.type === 'quiz' || step.stepNumber === 3;

                    return (
                      <div
                        key={step.stepNumber}
                        className={`rounded-xl border transition-all ${
                          step.completed
                            ? 'border-emerald-200 bg-emerald-50/30'
                            : 'border-[#1e2923] bg-[#121815]'
                        } p-5 shadow-subtle`}
                      >
                        {/* Step Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                                step.completed
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#00D68F] text-[#041a12]'
                              }`}
                            >
                              {step.completed ? '✓' : step.stepNumber}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">{step.title}</h3>
                              <p className="text-xs text-slate-500">{step.description}</p>
                            </div>
                          </div>

                          {!isStep3 && (
                            <button
                              onClick={() =>
                                handleToggleStep(selectedJourney.id, step.stepNumber, step.completed)
                              }
                              disabled={actionLoading}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                step.completed
                                  ? 'border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'border border-slate-300 bg-[#080B09] text-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {step.completed ? '✓ Completed' : 'Mark as Done'}
                            </button>
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="mt-3 rounded-lg bg-[#1a231d] p-4 border border-[#233028] text-xs leading-relaxed text-slate-300 whitespace-pre-line">
                          {step.content}
                        </div>

                        {/* Step 1 Resource Links */}
                        {isStep1 && step.resourceLinks && step.resourceLinks.length > 0 && (
                          <div className="mt-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Recommended Documentation & Guides:
                            </span>
                            <div className="mt-1.5 flex flex-wrap gap-2">
                              {step.resourceLinks.map((res, i) => (
                                <a
                                  key={i}
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-md bg-[#00D68F]/10 border border-[#00D68F]/20 px-2.5 py-1 text-xs font-medium text-[#00e89b] hover:bg-[#00D68F]/20"
                                >
                                  🔗 {res.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Step 3 Interactive Quiz */}
                        {isStep3 && step.quizQuestions && (
                          <div className="mt-4 space-y-4">
                            <div className="text-xs font-bold text-slate-300">
                              Answer the verification questions below to test your understanding:
                            </div>

                            {step.quizQuestions.map((q, qIdx) => (
                              <div
                                key={qIdx}
                                className="rounded-lg border border-[#1e2923] bg-[#121815] p-3.5 space-y-2"
                              >
                                <p className="text-xs font-semibold text-white">
                                  {qIdx + 1}. {q.question}
                                </p>
                                <div className="space-y-1.5">
                                  {q.options.map((opt, optIdx) => (
                                    <label
                                      key={optIdx}
                                      className={`flex items-center gap-2.5 rounded-md p-2 text-xs border cursor-pointer transition-colors ${
                                        quizAnswers[qIdx] === optIdx
                                          ? 'border-indigo-600 bg-[#00D68F]/10/70 font-medium text-indigo-900'
                                          : 'border-[#1e2923] hover:bg-[#1a231d] text-slate-300'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`quiz_q_${qIdx}`}
                                        checked={quizAnswers[qIdx] === optIdx}
                                        onChange={() =>
                                          setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })
                                        }
                                        className="text-[#00D68F] focus:ring-indigo-500"
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}

                            {/* Quiz Feedback */}
                            {quizFeedback && (
                              <div
                                className={`rounded-lg p-3.5 text-xs border ${
                                  quizFeedback.passed
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                <div className="font-bold mb-1">
                                  {quizFeedback.passed
                                    ? '🎉 Excellent! All answers correct. Milestone completed!'
                                    : '⚠️ Some answers were incorrect. Review the explanations below and try again:'}
                                </div>
                                <ul className="list-disc pl-4 space-y-1 mt-1">
                                  {quizFeedback.feedback.map((f, i) => (
                                    <li key={i}>
                                      Question {i + 1}: {f.isCorrect ? 'Correct ✓' : 'Incorrect ✗'} —{' '}
                                      {f.explanation}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <button
                              onClick={() => handleQuizSubmit(selectedJourney.id)}
                              disabled={
                                actionLoading ||
                                Object.keys(quizAnswers).length < step.quizQuestions.length
                              }
                              className="rounded-lg bg-[#00D68F] px-4 py-2 text-xs font-semibold text-[#041a12] hover:bg-[#00e89b] disabled:opacity-50 transition-colors shadow-subtle"
                            >
                              {actionLoading ? 'Grading...' : 'Verify Answers & Complete Quest'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-[#121815] p-12 text-center text-slate-500">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#00D68F]/10 text-[#00D68F] text-xl">
                  🚀
                </div>
                <h3 className="text-base font-semibold text-slate-200">Select or Start a Skill Journey</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  Pick a skill from the list on the left to start closing your gaps before campus placement drives.
                </p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
