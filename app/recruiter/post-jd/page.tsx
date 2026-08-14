'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Link from 'next/link';

export default function PostJdPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput('');
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (skills.length === 0) {
      setError('Add at least one required skill');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/jds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, requiredSkills: skills }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not post JD');

      router.push(`/recruiter/candidates?jd=${data.jd.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <NavBar label="Recruiter" />

      <main className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Post a Job Opening</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Campus candidate matching will automatically rank students based on skill alignment.
              </p>
            </div>
            <Link
              href="/recruiter/candidates"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Job / Internship Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Graduate Software Engineer (2026 Batch)"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Required Technical Competencies
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Type a skill (e.g. React, Docker, Python) and press Add"
                  className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>

            {skills.length > 0 && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Selected Skills ({skills.length}):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-indigo-400 hover:text-rose-600 font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-card"
              >
                {loading ? 'Publishing & Finding Matches...' : 'Publish Opening & Match Candidates'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
