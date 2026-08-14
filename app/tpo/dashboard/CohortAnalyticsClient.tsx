'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Link from 'next/link';
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

interface SkillGapDatum {
  skill: string;
  count: number;
  severity: string;
  percentage: number;
}

interface RosterEntry {
  id: string;
  name: string;
  department: string;
  targetRole: string;
  score: number;
  gapCount: number;
  journeysActive: number;
  journeysCompleted: number;
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

const SEVERITY_COLORS: Record<string, string> = {
  high: '#E11D48',
  medium: '#D97706',
  low: '#64748B',
};

type SeverityFilter = 'all' | 'high' | 'medium' | 'low';

export default function CohortAnalyticsClient({
  totalStudents,
  totalEvaluated,
  averageScore,
  criticalGapCount,
  topMissingSkill,
  totalJourneysResolved,
  totalJourneysActive,
  skillGapData,
  roster,
}: Props) {
  const router = useRouter();
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [seeding, setSeeding] = useState(false);
  const [selectedGap, setSelectedGap] = useState<SkillGapDatum | null>(null);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyResult, setNotifyResult] = useState<{
    notifiedCount: number;
    actuallySent: number;
    affectedStudents: string[];
  } | null>(null);
  const [notifying, setNotifying] = useState(false);

  // Departments for filtering
  const departments = useMemo(() => {
    const set = new Set(roster.map((r) => r.department));
    return Array.from(set).filter(Boolean);
  }, [roster]);

  const filteredGaps = useMemo(
    () =>
      severityFilter === 'all'
        ? skillGapData
        : skillGapData.filter((g) => g.severity === severityFilter),
    [skillGapData, severityFilter]
  );

  const filteredRoster = useMemo(() => {
    if (deptFilter === 'all') return roster;
    return roster.filter((r) => r.department === deptFilter);
  }, [roster, deptFilter]);

  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Seed failed');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
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
    } catch (err: any) {
      alert(err.message);
    } finally {
      setNotifying(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <NavBar label="TPO" />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Placement Cell Cohort Analytics</h1>
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                TPO Executive View
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Institutional placement readiness matrix, cohort gap diagnostics, and targeted workshop interventions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/campus/peers"
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle"
            >
              👥 Open Student Directory
            </Link>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-subtle"
            >
              {seeding ? 'Populating Demo Data...' : '⚡ Seed Demo Cohort'}
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="text-2xl font-extrabold text-slate-900">{totalStudents}</div>
            <div className="text-xs font-medium text-slate-500">Registered Students</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="text-2xl font-extrabold text-indigo-600">{totalEvaluated}</div>
            <div className="text-xs font-medium text-slate-500">Resumes Evaluated</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="text-2xl font-extrabold text-slate-900">{averageScore}/100</div>
            <div className="text-xs font-medium text-slate-500">Batch Avg. Score</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="text-2xl font-extrabold text-rose-600">{criticalGapCount}</div>
            <div className="text-xs font-medium text-slate-500">High-Priority Gaps</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="text-2xl font-extrabold text-emerald-600">{totalJourneysResolved}</div>
            <div className="text-xs font-medium text-slate-500">Gaps Resolved by AI Quests</div>
          </div>
        </div>

        {totalEvaluated === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-card">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xl">
              📊
            </div>
            <h3 className="text-base font-bold text-slate-800">No Evaluated Cohort Data Yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Click &quot;Seed Demo Cohort&quot; above to populate 18 realistic student accounts, skill gaps, and journeys.
            </p>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
            >
              {seeding ? 'Populating...' : 'Seed Demo Cohort Now'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Skill Gap Diagnostics Chart & Actions */}
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Cohort Skill Gap Diagnostics
                    </h2>
                    <p className="text-xs text-slate-500">
                      Top missing competency:{' '}
                      <span className="font-semibold text-rose-600">{topMissingSkill}</span>
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {(['all', 'high', 'medium', 'low'] as SeverityFilter[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSeverityFilter(s)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                          severityFilter === s
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={Math.max(220, filteredGaps.length * 36)}>
                  <BarChart data={filteredGaps} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" domain={[0, 100]} unit="%" fontSize={10} stroke="#64748B" />
                    <YAxis
                      type="category"
                      dataKey="skill"
                      width={140}
                      fontSize={11}
                      stroke="#334155"
                    />
                    <Tooltip
                      formatter={(value: number, name, props: any) => [
                        `${props.payload.count} students (${value}%)`,
                        'Affected Students',
                      ]}
                    />
                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                      {filteredGaps.map((g, i) => (
                        <Cell key={i} fill={SEVERITY_COLORS[g.severity] || '#1E40AF'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Gap Intervention Broadcast Trigger */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Direct Targeted Interventions
                  </h3>
                  <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                    {filteredGaps.map((g) => (
                      <div
                        key={g.skill}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: SEVERITY_COLORS[g.severity] }}
                          />
                          <span className="text-xs font-bold text-slate-800">{g.skill}</span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            ({g.count} students &bull; {g.percentage}%)
                          </span>
                        </div>
                        <button
                          onClick={() => openNotifyModal(g)}
                          className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                        >
                          📢 Notify Affected
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Student Placement Readiness Roster */}
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Placement Readiness Roster ({filteredRoster.length})
                    </h2>
                    <p className="text-xs text-slate-500">Ranked by preparation urgency (weakest first)</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(e.target.value)}
                      className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
                    >
                      <option value="all">All Departments</option>
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-2">Student</th>
                        <th className="pb-2">Department</th>
                        <th className="pb-2">Target Role</th>
                        <th className="pb-2">Score</th>
                        <th className="pb-2">Skill Quests</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRoster.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 font-bold text-slate-900">{r.name}</td>
                          <td className="py-2.5 text-slate-500">{r.department}</td>
                          <td className="py-2.5 text-slate-600 font-medium">{r.targetRole}</td>
                          <td className="py-2.5">
                            <span
                              className={`font-extrabold px-1.5 py-0.5 rounded ${
                                r.score >= 75
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : r.score >= 50
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {r.score}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-500">
                            {r.journeysCompleted > 0 ? (
                              <span className="font-semibold text-emerald-700">
                                {r.journeysCompleted} mastered
                              </span>
                            ) : r.journeysActive > 0 ? (
                              <span className="text-indigo-600 font-medium">
                                {r.journeysActive} in progress
                              </span>
                            ) : (
                              <span className="text-slate-400">None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notify Modal */}
        {selectedGap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Notify Students &mdash; {selectedGap.skill}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {selectedGap.count} students ({selectedGap.percentage}% of cohort) have this skill gap.
              </p>

              <textarea
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none mb-4"
              />

              {notifyResult && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                  <div className="font-bold">Targeted {notifyResult.notifiedCount} students:</div>
                  <div className="mt-1 text-emerald-700">{notifyResult.affectedStudents.join(', ')}</div>
                  <div className="mt-1 text-[10px] text-emerald-600">
                    {notifyResult.actuallySent} push notification(s) dispatched to active device tokens.
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedGap(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  onClick={handleNotify}
                  disabled={notifying}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {notifying ? 'Dispatching...' : 'Dispatch Broadcast'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
