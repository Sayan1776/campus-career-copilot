'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Users, Zap, Megaphone, BarChart3 } from 'lucide-react';
import { chart, severityColor } from '@/lib/charts';
import { PageHeader } from '@/components/ui/PageHeader';
import { Stat } from '@/components/ui/Stat';
import { Sheet, TitleBlock } from '@/components/ui/Sheet';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';

interface SkillGapDatum {
  skill: string;
  count: number;
  severity: string;
  percentage: number;
}

interface SkillGap {
  skill: string;
  severity: string;
}

interface RosterEntry {
  id: string;
  name: string;
  department: string;
  targetRole: string;
  batchYear: number | null;
  score: number;
  gapCount: number;
  journeysActive: number;
  journeysCompleted: number;
  gaps: SkillGap[];
}

interface Props {
  totalStudents: number;
  totalEvaluated: number;
  averageScore: number;
  criticalGapCount: number;
  topMissingSkill: string;
  totalJourneysResolved: number;
  totalJourneysActive: number;
  skillGapData: SkillGapDatum[];
  roster: RosterEntry[];
}

type SeverityFilter = 'all' | 'high' | 'medium' | 'low';

export default function CohortAnalyticsClient({
  totalStudents,
  totalEvaluated,
  averageScore,
  criticalGapCount,
  topMissingSkill,
  totalJourneysResolved,
  totalJourneysActive,
  skillGapData, // Initial un-filtered data (or fallback)
  roster,
}: Props) {
  const router = useRouter();
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [gapDeptFilter, setGapDeptFilter] = useState('all');
  const [gapYearFilter, setGapYearFilter] = useState('all');
  const [seeding, setSeeding] = useState(false);
  const [selectedGap, setSelectedGap] = useState<SkillGapDatum | null>(null);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyResult, setNotifyResult] = useState<{
    notifiedCount: number;
    actuallySent: number;
    affectedStudents: string[];
  } | null>(null);
  const [notifying, setNotifying] = useState(false);

  const departments = useMemo(() => {
    const set = new Set(roster.map((r) => r.department));
    return Array.from(set).filter(Boolean);
  }, [roster]);

  const years = useMemo(() => {
    const validYears = roster.map((r) => r.batchYear).filter((y): y is number => y !== null && y !== undefined);
    const set = new Set(validYears);
    return Array.from(set).sort();
  }, [roster]);

  const filteredGaps = useMemo(() => {
    // 1. Filter the roster based on gap dept/year filters
    const validRoster = roster.filter((r) => {
      const matchDept = gapDeptFilter === 'all' || r.department === gapDeptFilter;
      const matchYear = gapYearFilter === 'all' || r.batchYear?.toString() === gapYearFilter;
      return matchDept && matchYear;
    });

    // 2. Re-aggregate the gaps from the filtered roster
    const gapCounts = new Map<string, { count: number; severity: string }>();
    for (const student of validRoster) {
      for (const gap of student.gaps || []) {
        const existing = gapCounts.get(gap.skill);
        if (existing) {
          existing.count += 1;
        } else {
          gapCounts.set(gap.skill, { count: 1, severity: gap.severity });
        }
      }
    }

    // 3. Convert to array and calculate percentage relative to the valid cohort size
    const cohortSize = validRoster.length;
    let computedData = Array.from(gapCounts.entries()).map(([skill, { count, severity }]) => ({
      skill,
      count,
      severity,
      percentage: cohortSize > 0 ? Math.round((count / cohortSize) * 100) : 0,
    }));

    // 4. Apply severity filter
    if (severityFilter !== 'all') {
      computedData = computedData.filter((g) => g.severity === severityFilter);
    }

    return computedData.sort((a, b) => b.count - a.count);
  }, [roster, gapDeptFilter, gapYearFilter, severityFilter]);

  const filteredRoster = useMemo(() => {
    let result = roster;
    if (deptFilter !== 'all') result = result.filter((r) => r.department === deptFilter);
    if (yearFilter !== 'all') result = result.filter((r) => r.batchYear?.toString() === yearFilter);
    return result;
  }, [roster, deptFilter, yearFilter]);

  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Seed failed');
      toast.success('Demo cohort populated');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Seeding the demo cohort failed');
    } finally {
      setSeeding(false);
    }
  }

  function openNotifyModal(gap: SkillGapDatum) {
    setSelectedGap(gap);
    setNotifyMessage(
      `Placement Cell Alert: Special Training Workshop on "${gap.skill}" scheduled this week. Recommended for students with this gap.`
    );
    setNotifyResult(null);
  }

  async function handleNotify() {
    if (!selectedGap) return;
    setNotifying(true);
    try {
      const res = await fetch('/api/tpo/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: selectedGap.skill, message: notifyMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Notify failed');
      setNotifyResult(data);
      toast.success(`Broadcast dispatched to ${data.notifiedCount} students`);
    } catch (err: any) {
      toast.error(err.message || 'Dispatching the broadcast failed');
    } finally {
      setNotifying(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Cohort analytics"
        sub="Institutional placement readiness matrix, cohort gap diagnostics, and targeted workshop interventions."
        meta="Sheet TD-07 · TPO view"
        actions={
          <>
            <Link href="/campus/peers" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
              <Users className="h-3.5 w-3.5" strokeWidth={1.8} />
              Student directory
            </Link>
            <Button size="sm" variant="outline" onClick={handleSeed} loading={seeding}>
              <Zap className="h-3.5 w-3.5" strokeWidth={1.8} />
              {seeding ? 'Populating…' : 'Seed demo cohort'}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Registered students" value={totalStudents} />
        <Stat label="Resumes evaluated" value={totalEvaluated} />
        <Stat label="Batch avg score" value={averageScore} unit="/100" />
        <Stat label="High-priority gaps" value={criticalGapCount} sub={`Top missing: ${topMissingSkill}`} />
        <Stat
          label="Gaps resolved"
          value={totalJourneysResolved}
          sub={`${totalJourneysActive} journeys in progress`}
        />
      </div>

      {totalEvaluated === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-5 w-5" strokeWidth={1.8} />}
          title="No evaluated cohort data yet"
          body="Seed the demo cohort to populate 18 realistic student accounts, skill gaps, and journeys — or wait for the first student resume to be measured."
          action={
            <Button variant="signal" onClick={handleSeed} loading={seeding}>
              {seeding ? 'Populating…' : 'Seed demo cohort now'}
            </Button>
          }
          className="bg-sheet-raise"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Left: gap diagnostics instrument */}
          <Sheet className="overflow-hidden">
            <TitleBlock
              title="Cohort skill gap diagnostics"
              sub={`Top missing competency: ${topMissingSkill}`}
              meta={`${filteredGaps.length} gaps`}
            />
            <div className="px-4 py-4">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div
                  role="group"
                  aria-label="Filter gaps by severity"
                  className="inline-flex rounded-lg border border-ink-line bg-sheet-inset p-1"
                >
                  {(['all', 'high', 'medium', 'low'] as SeverityFilter[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeverityFilter(s)}
                      aria-pressed={severityFilter === s}
                      className={cn(
                        'rounded-md px-3 py-1 font-mono text-xxs font-medium uppercase tracking-[0.06em] transition-colors',
                        severityFilter === s
                          ? 'bg-white text-ink shadow-hairline'
                          : 'text-ink-faint hover:text-ink'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={gapDeptFilter}
                    onChange={(e) => setGapDeptFilter(e.target.value)}
                    className="w-28 py-1.5 text-xs font-medium"
                    aria-label="Filter gaps by department"
                  >
                    <option value="all">All Depts</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>

                  <Select
                    value={gapYearFilter}
                    onChange={(e) => setGapYearFilter(e.target.value)}
                    className="w-28 py-1.5 text-xs font-medium"
                    aria-label="Filter gaps by batch year"
                  >
                    <option value="all">All Years</option>
                    {years.map((y) => (
                      <option key={y} value={y.toString()}>
                        Class of {y}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={Math.max(220, filteredGaps.length * 36)}>
                <BarChart data={filteredGaps} layout="vertical" margin={{ left: 8, right: 12 }}>
                  <CartesianGrid strokeDasharray="1 4" horizontal={false} stroke={chart.grid} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    unit="%"
                    fontSize={10}
                    stroke={chart.axis}
                    fontFamily="var(--font-mono), ui-monospace, monospace"
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="skill"
                    width={130}
                    fontSize={10}
                    stroke={chart.axis}
                    fontFamily="var(--font-mono), ui-monospace, monospace"
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(22, 35, 59, 0.04)' }}
                    contentStyle={{
                      background: chart.sheet,
                      border: `1px solid ${chart.grid}`,
                      borderRadius: 8,
                      fontSize: 12,
                      color: chart.ink,
                      boxShadow:
                        '0 4px 8px rgba(22,35,59,.08), 0 14px 36px rgba(22,35,59,.12)',
                    }}
                    formatter={(value: number, _name, props: any) => [
                      `${props.payload.count} students (${value}%)`,
                      'Affected',
                    ]}
                  />
                  <Bar dataKey="percentage" radius={[0, 3, 3, 0]} isAnimationActive>
                    {filteredGaps.map((g, i) => (
                      <Cell key={i} fill={severityColor(g.severity)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-1.5 border-t border-ink-line pt-4">
                <h3 className="mb-2 font-mono text-xxs font-medium uppercase tracking-[0.12em] text-ink-faint">
                  Direct targeted interventions
                </h3>
                <div className="scrollbar-thin max-h-52 space-y-1.5 overflow-y-auto pr-1">
                  {filteredGaps.map((g) => (
                    <div
                      key={g.skill}
                      className="flex items-center justify-between gap-2.5 rounded-lg border border-ink-line bg-white p-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          aria-hidden
                          className="h-2 w-2 shrink-0 rounded-[1px]"
                          style={{ backgroundColor: severityColor(g.severity) }}
                        />
                        <span className="truncate text-xs font-bold text-ink">{g.skill}</span>
                        <span className="tabular shrink-0 font-mono text-xxs text-ink-faint">
                          {g.count} · {g.percentage}%
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openNotifyModal(g)}
                        className="shrink-0"
                      >
                        <Megaphone className="h-3.5 w-3.5" strokeWidth={1.8} />
                        Notify affected
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Sheet>

          {/* Right: roster */}
          <Sheet className="overflow-hidden">
            <div className="flex flex-col gap-2 border-b border-ink-line bg-sheet-inset px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink">
                  Placement readiness roster ({filteredRoster.length})
                </h2>
                <p className="mt-0.5 text-xs text-ink-faint">
                  Ranked by preparation urgency — weakest first
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  aria-label="Filter roster by department"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-auto py-1 text-xs font-medium"
                >
                  <option value="all">All depts</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
                <Select
                  aria-label="Filter roster by year"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-auto py-1 text-xs font-medium"
                >
                  <option value="all">All years</option>
                  {years.map((y) => (
                    <option key={y} value={y.toString()}>
                      Class of {y}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-ink-line font-mono text-xxs font-medium uppercase tracking-[0.08em] text-ink-faint">
                    <th scope="col" className="px-4 py-2.5">Student</th>
                    <th scope="col" className="px-4 py-2.5">Department</th>
                    <th scope="col" className="px-4 py-2.5">Target role</th>
                    <th scope="col" className="px-4 py-2.5">Score</th>
                    <th scope="col" className="px-4 py-2.5">Skill quests</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-line">
                  {filteredRoster.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-sheet-inset/60">
                      <td className="px-4 py-2.5 font-bold text-ink">{r.name}</td>
                      <td className="px-4 py-2.5 text-ink-soft">{r.department}</td>
                      <td className="px-4 py-2.5 font-medium text-ink-soft">{r.targetRole}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            'tabular font-mono text-xs font-semibold',
                            r.score >= 75 ? 'text-pass' : r.score >= 50 ? 'text-ink' : 'text-instrument-deep'
                          )}
                        >
                          {r.score}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-ink-soft">
                        {r.journeysCompleted > 0 ? (
                          <span className="font-semibold text-pass-deep">
                            {r.journeysCompleted} mastered
                          </span>
                        ) : r.journeysActive > 0 ? (
                          <span className="font-medium">{r.journeysActive} in progress</span>
                        ) : (
                          <span className="text-ink-faint">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Sheet>
        </div>
      )}

      <Modal
        open={selectedGap !== null}
        onClose={() => setSelectedGap(null)}
        title={`Notify students — ${selectedGap?.skill ?? ''}`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setSelectedGap(null)}>
              Close
            </Button>
            <Button variant="signal" size="sm" onClick={handleNotify} loading={notifying}>
              <Megaphone className="h-3.5 w-3.5" strokeWidth={1.8} />
              {notifying ? 'Dispatching…' : 'Dispatch broadcast'}
            </Button>
          </>
        }
      >
        {selectedGap && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-ink-soft">
              <span className="tabular font-mono font-semibold text-ink">
                {selectedGap.count} students
              </span>{' '}
              ({selectedGap.percentage}% of the cohort) carry this skill gap.
            </p>
            <Textarea
              aria-label="Broadcast message"
              value={notifyMessage}
              onChange={(e) => setNotifyMessage(e.target.value)}
              rows={4}
            />
            {notifyResult && (
              <div
                role="status"
                className="rounded-lg border border-pass/40 bg-pass-wash p-3.5 text-xs leading-relaxed text-pass-deep"
              >
                <div className="font-bold">
                  Targeted {notifyResult.notifiedCount} students:
                </div>
                <div className="mt-1">{notifyResult.affectedStudents.join(', ')}</div>
                <div className="mt-1 font-mono text-xxs">
                  {notifyResult.actuallySent} push notification(s) dispatched to active
                  device tokens.
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
