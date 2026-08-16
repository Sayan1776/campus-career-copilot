'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ResumeBuilder from '@/components/ResumeBuilder';

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
  const [activeTab, setActiveTab] = useState<'upload' | 'build'>('upload');

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
    <div className="dashboard-content">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border border-[#1e2923] bg-[#121815] p-8 shadow-card">
          <div className="flex items-center justify-between border-b border-[#233028] pb-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-white">Provide Your Resume</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload an existing PDF or build one from scratch.
              </p>
            </div>
            <Link
              href="/student/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-slate-200"
            >
              Cancel
            </Link>
          </div>

          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'upload'
                  ? 'bg-[#00D68F] text-[#041a12]'
                  : 'bg-[#1a231d] text-slate-400 hover:text-white'
              }`}
            >
              Upload PDF
            </button>
            <button
              onClick={() => setActiveTab('build')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'build'
                  ? 'bg-[#00D68F] text-[#041a12]'
                  : 'bg-[#1a231d] text-slate-400 hover:text-white'
              }`}
            >
              Build from Scratch
            </button>
          </div>

          {activeTab === 'upload' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Campus Placement Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-transparent px-3.5 py-2.5 text-xs text-white focus:border-indigo-600 focus:outline-none"
                >
                  {TARGET_ROLES.map((r) => (
                    <option key={r} value={r} className="bg-[#121815]">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Resume Document (PDF Format)
                </label>
                <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-indigo-400 transition-colors bg-[#1a231d]">
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
                    className="cursor-pointer text-xs font-semibold text-[#00D68F] hover:text-[#00D68F]"
                  >
                    {file ? (
                      <span className="text-slate-200 font-bold">📄 {file.name}</span>
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
                  className="w-full rounded-xl bg-[#00D68F] py-3 text-xs font-bold text-[#041a12] hover:bg-[#00e89b] disabled:opacity-50 transition-colors shadow-card flex items-center justify-center gap-2"
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
          ) : (
            <ResumeBuilder />
          )}
        </div>
      </div>
    </div>
  );
}
