'use client';

import { useState, useEffect } from 'react';

const DEPARTMENTS = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Information Technology',
  'Electrical',
  'Other',
];

interface ProfileData {
  name: string;
  department: string;
  batch_year: number | null;
  target_role: string;
  github_url: string;
  linkedin_url: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [batchYear, setBatchYear] = useState<number>(2026);
  const [targetRole, setTargetRole] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed to load profile');
        const data: ProfileData = await res.json();
        setName(data.name || '');
        setDepartment(data.department || 'Computer Science');
        setBatchYear(data.batch_year || 2026);
        setTargetRole(data.target_role || '');
        setGithubUrl(data.github_url || '');
        setLinkedinUrl(data.linkedin_url || '');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          department,
          batch_year: batchYear,
          target_role: targetRole,
          github_url: githubUrl,
          linkedin_url: linkedinUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your profile information</p>
        </div>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 flex items-center gap-2">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Profile updated successfully
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="bento-card">
        <h2 className="text-sm font-bold text-white mb-6 pb-4 border-b border-[#233028]">
          Profile Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="profile-name" className="form-label">Full Name</label>
            <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="form-input" />
          </div>
          <div>
            <label htmlFor="profile-dept" className="form-label">Department</label>
            <select id="profile-dept" value={department} onChange={(e) => setDepartment(e.target.value)} className="form-select">
              {DEPARTMENTS.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="profile-batch" className="form-label">Batch Year</label>
            <input id="profile-batch" type="number" value={batchYear} onChange={(e) => setBatchYear(parseInt(e.target.value, 10) || 2026)} min={2020} max={2035} className="form-input" />
          </div>
          <div>
            <label htmlFor="profile-role" className="form-label">Target Career Role</label>
            <input id="profile-role" type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Software Engineer" className="form-input" />
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="profile-github" className="form-label">GitHub URL</label>
            <input id="profile-github" type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" className="form-input" />
          </div>
          <div>
            <label htmlFor="profile-linkedin" className="form-label">LinkedIn URL</label>
            <input id="profile-linkedin" type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" className="form-input" />
          </div>
        </div>

        <div className="mt-8 flex justify-end border-t border-[#233028] pt-5">
          <button type="submit" disabled={saving} className="rounded-xl bg-[#00D68F] px-6 py-2.5 text-sm font-bold text-[#041a12] hover:bg-[#00e89b] disabled:opacity-50 transition-colors shadow-sm">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
