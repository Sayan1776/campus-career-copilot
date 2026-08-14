'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Link from 'next/link';

const TARGET_ROLES = [
  'Software Engineer',
  'Data Analyst',
  'Data Scientist',
  'Frontend Developer',
  'Backend Developer',
  'Product Manager',
];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState(TARGET_ROLES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', targetRole);

      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      router.push('/student/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <NavBar label="Student" />

      <main className="mx-auto max-w-xl px-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Upload Resume for Evaluation</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                AI extracts competencies, generates your radar chart, and identifies gap roadmaps.
              </p>
            </div>
            <Link
              href="/student/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Target Campus Placement Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                {TARGET_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Resume Document (PDF Format)
              </label>
              <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50">
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  id="resume-upload"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  {file ? (
                    <span className="text-slate-800 font-bold">📄 {file.name}</span>
                  ) : (
                    <span>Click to browse and select your PDF resume</span>
                  )}
                </label>
                <div className="mt-1 text-[11px] text-slate-400">Standard text PDF, under 5MB</div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !file}
                className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-card flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Evaluating with AI Model...
                  </>
                ) : (
                  'Analyze Resume & Generate Competency Radar'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
