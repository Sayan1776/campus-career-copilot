'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Crosshair, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Stat } from '@/components/ui/Stat';
import { Sheet, TitleBlock } from '@/components/ui/Sheet';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { buttonClasses } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export interface PeerStudent {
  id: string;
  name: string;
  department: string;
  batchYear: number;
  targetRole: string;
  overallScore: number;
  extractedSkills: string[];
  activeJourneysCount: number;
  completedJourneysCount: number;
  recentJourneys: { skill: string; status: string; completedSteps: number; totalSteps: number }[];
  uploadedAt: string | null;
}

interface Props {
  students: PeerStudent[];
  userRole: string;
}

function scoreTone(score: number): 'pass' | 'ink' | 'warn' {
  if (score >= 75) return 'pass';
  if (score >= 50) return 'ink';
  return 'warn';
}

export default function PeerProgressClient({ students, userRole }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'score' | 'skills' | 'journeys'>('score');

  const departments = useMemo(() => {
    const set = new Set(students.map((s) => s.department).filter(Boolean));
    return Array.from(set) as string[];
  }, [students]);

  const targetRoles = useMemo(() => {
    const set = new Set(students.map((s) => s.targetRole).filter((r) => r && r !== '-'));
    return Array.from(set);
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.extractedSkills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
          s.targetRole.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = deptFilter === 'all' || s.department === deptFilter;
        const matchesRole = roleFilter === 'all' || s.targetRole === roleFilter;

        return matchesSearch && matchesDept && matchesRole;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.overallScore - a.overallScore;
        if (sortBy === 'skills') return b.extractedSkills.length - a.extractedSkills.length;
        if (sortBy === 'journeys') return b.completedJourneysCount - a.completedJourneysCount;
        return 0;
      });
  }, [students, searchTerm, deptFilter, roleFilter, sortBy]);

  const avgScore =
    students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.overallScore, 0) / students.length)
      : 0;

  const totalJourneysCompleted = students.reduce(
    (sum, s) => sum + s.completedJourneysCount,
    0
  );

  // Role-aware station link — a TPO shouldn't bounce off /student.
  const myDashboardHref =
    userRole === 'TPO'
      ? '/tpo/dashboard'
      : '/student/dashboard';

  return (
    <>
      <PageHeader
        title="Peer progress hub"
        sub="Transparent view of campus cohorts, skill readiness benchmarks, and peer learning progress."
        meta="Sheet PH-04 · Live directory"
        actions={
          <Link href={myDashboardHref} className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
            My dashboard
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Enrolled cohort" value={students.length} sub="Students on the sheet" />
        <Stat label="Batch avg readiness" value={avgScore} unit="/100" />
        <Stat label="Gaps resolved" value={totalJourneysCompleted} sub="Via learning journeys" />
        <Stat label="Departments" value={departments.length} sub="Active in this directory" />
      </div>

      <Sheet className="overflow-hidden">
        <TitleBlock title="Directory controls" sub="Search by student, skill, or target role" meta={`${filteredStudents.length} shown`} />
        <div className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-12">
          <div className="relative sm:col-span-5">
            <label htmlFor="peer-search" className="mb-1.5 block font-mono text-xxs font-medium uppercase tracking-[0.08em] text-ink-faint">
              Search students or skills
            </label>
            <Search className="pointer-events-none absolute left-2.5 top-[2.28rem] h-4 w-4 text-ink-faint" strokeWidth={1.8} />
            <Input
              id="peer-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. Rahul, React, Backend…"
              className="pl-8"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="peer-dept" className="mb-1.5 block font-mono text-xxs font-medium uppercase tracking-[0.08em] text-ink-faint">
              Department
            </label>
            <Select id="peer-dept" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="all">All departments ({students.length})</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="peer-role" className="mb-1.5 block font-mono text-xxs font-medium uppercase tracking-[0.08em] text-ink-faint">
              Target role
            </label>
            <Select id="peer-role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All roles</option>
              {targetRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="peer-sort" className="mb-1.5 block font-mono text-xxs font-medium uppercase tracking-[0.08em] text-ink-faint">
              Sort by
            </label>
            <Select id="peer-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
              <option value="score">Readiness score</option>
              <option value="skills">Total skills</option>
              <option value="journeys">Gaps mastered</option>
            </Select>
          </div>
        </div>
      </Sheet>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map((student) => {
          const tone = scoreTone(student.overallScore);
          const toneText = tone === 'pass' ? 'text-pass' : tone === 'warn' ? 'text-warn' : 'text-ink';
          return (
            <Sheet key={student.id} hoverable className="flex flex-col justify-between p-4">
              <div>
                <div className="mb-2 flex items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold leading-tight text-ink">
                      {student.name}
                    </h3>
                    <div className="mt-0.5 font-mono text-xxs text-ink-faint">
                      {student.department || '—'} · {student.batchYear || 2026}
                    </div>
                  </div>

                  <div className="graph-inset shrink-0 rounded-md border border-ink-line px-2.5 py-1.5 text-center">
                    <div className={cn('tabular font-mono text-lg font-semibold leading-none', toneText)}>
                      {student.overallScore}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                      Score
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded border border-ink-line bg-sheet-inset px-2 py-1 text-xs font-medium text-ink-soft">
                    <Crosshair className="h-3 w-3 shrink-0 text-instrument" strokeWidth={1.8} />
                    <span className="truncate">{student.targetRole || '—'}</span>
                  </span>
                </div>

                <div className="mb-3">
                  <div className="mb-1.5 font-mono text-xxs font-medium uppercase tracking-[0.1em] text-ink-faint">
                    Measured skills ({student.extractedSkills.length})
                  </div>
                  <div className="flex max-h-20 flex-wrap gap-1.5 overflow-hidden">
                    {student.extractedSkills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="rounded border border-ink-line bg-white px-1.5 py-0.5 font-mono text-xs font-medium text-ink"
                      >
                        {skill}
                      </span>
                    ))}
                    {student.extractedSkills.length > 5 && (
                      <span className="rounded border border-ink-line bg-sheet-inset px-1.5 py-0.5 font-mono text-xxs text-ink-faint">
                        +{student.extractedSkills.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                {student.recentJourneys && student.recentJourneys.length > 0 && (
                  <div className="rounded-lg border border-ink-line bg-sheet-inset p-2.5">
                    <div className="mb-1 font-mono text-xxs font-medium uppercase tracking-[0.1em] text-ink-faint">
                      Active gap learning
                    </div>
                    <div className="space-y-1">
                      {student.recentJourneys.slice(0, 2).map((j, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-medium text-ink-soft">{j.skill}</span>
                          {j.status === 'completed' ? (
                            <Badge tone="pass">Mastered</Badge>
                          ) : (
                            <span className="tabular shrink-0 font-mono text-xxs text-ink-faint">
                              {j.completedSteps}/{j.totalSteps || 3}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink-line pt-3">
                <span className="font-mono text-xxs text-ink-faint">
                  {student.uploadedAt
                    ? `Measured ${new Date(student.uploadedAt).toLocaleDateString()}`
                    : 'No resume'}
                </span>
                <Link
                  href={`/campus/peers/${student.id}`}
                  className={buttonClasses({ variant: 'outline', size: 'sm' })}
                >
                  View details
                </Link>
              </div>
            </Sheet>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <EmptyState
          icon={<Users className="h-5 w-5" strokeWidth={1.8} />}
          title="No students match these filters"
          body="Try different search keywords, or widen the department and role filters."
          className="border-ink-line bg-sheet-raise"
        />
      )}
    </>
  );
}
