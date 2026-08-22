'use client';

import { useState, useEffect, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Sheet, TitleBlock } from '@/components/ui/Sheet';
import { Field, Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { DEPARTMENTS, getRolesForDepartment } from '@/lib/departments';
import { multiFactor } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import nextDynamic from 'next/dynamic';

const TwoFactorSetup = nextDynamic(() => import('@/components/auth/TwoFactorSetup'), { ssr: false });


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
  const [department, setDepartment] = useState('');
  const [batchYear, setBatchYear] = useState<number>(2026);
  const [targetRole, setTargetRole] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isMfaEnrolled, setIsMfaEnrolled] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed to load profile');
        const data: ProfileData = await res.json();
        setName(data.name || '');
        setDepartment(data.department || '');
        setBatchYear(data.batch_year || 2026);
        setTargetRole(data.target_role || '');
        setGithubUrl(data.github_url || '');
        setLinkedinUrl(data.linkedin_url || '');
        // Check Firebase MFA enrollment status
        const user = auth.currentUser;
        if (user) {
          const enrolled = multiFactor(user).enrolledFactors.length > 0;
          setIsMfaEnrolled(enrolled);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const suggestedRoles = useMemo(() => getRolesForDepartment(department), [department]);

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
      <div className="page-canvas" aria-busy="true">
        <div className="border-b border-ink-line pb-5">
          <Skeleton className="h-8 w-48" />
        </div>
        <Sheet className="overflow-hidden">
          <Skeleton className="m-4 h-5 w-40" />
          <div className="grid grid-cols-1 gap-5 px-5 pb-5 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="page-canvas">
      <PageHeader
        title="Settings"
        sub="Manage your profile information — it feeds the directory."
        meta="Sheet ST-06"
      />

      {success && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-pass/40 bg-pass-wash px-4 py-3 text-sm font-medium text-pass-deep"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} />
          Profile updated successfully
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-instrument/40 bg-instrument-wash px-4 py-3 text-sm font-medium text-instrument-deep"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        <Sheet className="overflow-hidden">
          <TitleBlock title="Profile information" meta="Station record" />
          <div className="px-5 py-5 md:px-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Full name" htmlFor="profile-name">
                <Input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </Field>
              <Field label="Department" htmlFor="profile-dept">
                <Select
                  id="profile-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Batch year" htmlFor="profile-batch">
                <Input
                  id="profile-batch"
                  type="number"
                  value={batchYear}
                  onChange={(e) => setBatchYear(parseInt(e.target.value, 10) || 2026)}
                  min={2020}
                  max={2035}
                />
              </Field>
              <Field label="Target career role" htmlFor="profile-role">
                <Input
                  id="profile-role"
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Design Engineer, Process Engineer"
                  list="suggested-roles"
                />
                <datalist id="suggested-roles">
                  {suggestedRoles.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </Field>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="GitHub URL" htmlFor="profile-github">
                <Input
                  id="profile-github"
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                />
              </Field>
              <Field label="LinkedIn URL" htmlFor="profile-linkedin">
                <Input
                  id="profile-linkedin"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </Field>
            </div>

            <div className="mt-7 flex justify-end border-t border-ink-line pt-5">
              <Button type="submit" loading={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </Sheet>
      </form>

      {/* Security section */}
      <Sheet className="overflow-hidden">
        <TitleBlock
          title="Security"
          sub="Protect your account with a second authentication factor"
          meta="2FA"
        />
        <div className="px-5 py-5 md:px-6">
          <TwoFactorSetup
            isEnrolled={isMfaEnrolled}
            onEnrolled={() => setIsMfaEnrolled(true)}
          />
        </div>
      </Sheet>
    </div>
  );
}
