'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

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

export default function PeerProgressClient({ students, userRole }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'score' | 'skills' | 'journeys'>('score');
  const [selectedStudent, setSelectedStudent] = useState<PeerStudent | null>(null);

  // Extract unique departments & roles for dropdowns
  const departments = useMemo(() => {
    const set = new Set(students.map((s) => s.department || 'Computer Science'));
    return Array.from(set).filter(Boolean);
  }, [students]);

  const targetRoles = useMemo(() => {
    const set = new Set(students.map((s) => s.targetRole).filter((r) => r && r !== '-'));
    return Array.from(set);
  }, [students]);

  // Filter and sort students
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

  return (
    <div className="dashboard-content">
        {/* Page Header */}
        <div className="mb-6 border-b border-[#1e2923] pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Campus Peer Progress Hub</h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  Institution Live Directory
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Transparent view of campus cohorts, skill readiness benchmarks, and peer learning progress.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/student/dashboard"
                className="rounded-lg border border-slate-300 bg-[#121815] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-[#1a231d] shadow-subtle"
              >
                My Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Institution Stats Bar */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-[#1e2923] bg-[#121815] p-4 shadow-subtle">
            <div className="text-2xl font-bold text-white">{students.length}</div>
            <div className="text-xs font-medium text-slate-500">Total Enrolled Cohort</div>
          </div>
          <div className="rounded-xl border border-[#1e2923] bg-[#121815] p-4 shadow-subtle">
            <div className="text-2xl font-bold text-[#00D68F]">{avgScore}/100</div>
            <div className="text-xs font-medium text-slate-500">Batch Avg. Readiness</div>
          </div>
          <div className="rounded-xl border border-[#1e2923] bg-[#121815] p-4 shadow-subtle">
            <div className="text-2xl font-bold text-emerald-600">{totalJourneysCompleted}</div>
            <div className="text-xs font-medium text-slate-500">Gaps Resolved via Journeys</div>
          </div>
          <div className="rounded-xl border border-[#1e2923] bg-[#121815] p-4 shadow-subtle">
            <div className="text-2xl font-bold text-amber-600">{departments.length}</div>
            <div className="text-xs font-medium text-slate-500">Active Departments</div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="mb-6 rounded-xl border border-[#1e2923] bg-[#121815] p-4 shadow-card space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            {/* Search Input */}
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Search Students or Skills
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. Rahul, React, Python, Backend..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* Department Filter */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-200 focus:border-indigo-600 focus:outline-none"
              >
                <option value="all">All Departments ({students.length})</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Role Filter */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Target Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-200 focus:border-indigo-600 focus:outline-none"
              >
                <option value="all">All Roles</option>
                {targetRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-200 focus:border-indigo-600 focus:outline-none"
              >
                <option value="score">Readiness Score</option>
                <option value="skills">Total Skills</option>
                <option value="journeys">Gaps Mastered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const scoreColor =
              student.overallScore >= 75
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : student.overallScore >= 50
                ? 'text-[#00e89b] bg-[#00D68F]/10 border-[#00D68F]/20'
                : 'text-amber-700 bg-amber-50 border-amber-200';

            return (
              <div
                key={student.id}
                className="rounded-xl border border-[#1e2923] bg-[#121815] p-5 shadow-card hover:border-[#00D68F]/20 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Student Name & Score */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-white leading-tight">
                        {student.name}
                      </h3>
                      <div className="text-xs text-slate-500 font-medium">
                        {student.department || 'Computer Science'} &bull; {student.batchYear || 2026}
                      </div>
                    </div>

                    <div
                      className={`rounded-lg border px-2.5 py-1 text-center font-bold text-xs ${scoreColor}`}
                    >
                      <div className="text-sm font-extrabold">{student.overallScore}</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500">Score</div>
                    </div>
                  </div>

                  {/* Target Role */}
                  <div className="mb-3">
                    <span className="inline-block rounded-md bg-[#080B09] px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                      🎯 {student.targetRole || 'Software Engineer'}
                    </span>
                  </div>

                  {/* Extracted Skills */}
                  <div className="mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Verified Skill Set ({student.extractedSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-hidden">
                      {student.extractedSkills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-[#080B09] px-2 py-0.5 text-[11px] font-medium text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {student.extractedSkills.length > 5 && (
                        <span className="rounded-md bg-[#1a231d] px-1.5 py-0.5 text-[10px] text-slate-400">
                          +{student.extractedSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skill Journeys in Progress */}
                  {student.recentJourneys && student.recentJourneys.length > 0 && (
                    <div className="mb-3 rounded-lg bg-[#1a231d] p-2.5 border border-[#233028]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Active Gap Learning:
                      </div>
                      <div className="space-y-1">
                        {student.recentJourneys.slice(0, 2).map((j, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-[11px] text-slate-300"
                          >
                            <span className="font-medium truncate max-w-[140px]">{j.skill}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                j.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-[#00D68F]/20 text-[#00D68F]'
                              }`}
                            >
                              {j.status === 'completed'
                                ? 'Mastered'
                                : `${j.completedSteps}/${j.totalSteps || 3}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-[#233028] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {student.uploadedAt
                      ? `Evaluated ${new Date(student.uploadedAt).toLocaleDateString()}`
                      : 'No resume'}
                  </span>
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="rounded-xl border border-[#1e2923] bg-[#121815] p-12 text-center">
            <p className="text-sm text-slate-500 font-medium">
              No students match the current filters. Try changing your search keywords.
            </p>
          </div>
        )}

        {/* Student Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-[#121815] p-6 shadow-2xl border border-[#1e2923] max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-[#233028] pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedStudent.department} &bull; Class of {selectedStudent.batchYear}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-[#080B09] hover:text-slate-300"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-[#1a231d] p-3 border border-[#233028]">
                  <div>
                    <div className="text-xs text-slate-500">Placement Target Role</div>
                    <div className="text-sm font-bold text-slate-200">{selectedStudent.targetRole}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Readiness Score</div>
                    <div className="text-base font-extrabold text-[#00D68F]">
                      {selectedStudent.overallScore} / 100
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Verified Extracted Skills ({selectedStudent.extractedSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.extractedSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-[#00D68F]/10 border border-[#00D68F]/10 px-2.5 py-1 text-xs font-medium text-[#00e89b]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Skill Journeys & Gap Learning Progress
                  </h4>
                  {selectedStudent.recentJourneys && selectedStudent.recentJourneys.length > 0 ? (
                    <div className="space-y-2">
                      {selectedStudent.recentJourneys.map((j, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-[#1e2923] p-2.5 bg-[#1a231d]"
                        >
                          <span className="text-xs font-semibold text-slate-200">{j.skill}</span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              j.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-[#00D68F]/20 text-[#00D68F]'
                            }`}
                          >
                            {j.status === 'completed'
                              ? 'Mastered'
                              : `${j.completedSteps}/${j.totalSteps || 3} steps done`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No active skill journeys recorded yet.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
