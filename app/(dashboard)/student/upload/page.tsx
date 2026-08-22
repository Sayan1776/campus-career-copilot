'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import nextDynamic from 'next/dynamic';
import { FileText, X, UploadCloud } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Sheet, TitleBlock } from '@/components/ui/Sheet';
import { Field, Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { getDefaultRoleForDepartment, getRolesForDepartment } from '@/lib/departments';

const ResumeBuilder = nextDynamic(() => import('@/components/ResumeBuilder'), {
  ssr: false,
  loading: () => <Skeleton className="h-[420px] rounded-lg" />,
});

const CUSTOM_ROLE = '__custom__';

const MAX_SIZE_MB = 5;

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [savedTargetRole, setSavedTargetRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'build'>('upload');

  // Pull the student's department and saved target role so the picker
  // suggests roles their branch actually feeds into.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => {
        if (cancelled || !profile) return;
        setDepartment(profile.department || null);
        const saved = (profile.target_role || '').trim();
        if (saved) setSavedTargetRole(saved);
      })
      .catch(() => {
        // Profile is an enhancement, not a blocker — the picker still
        // works with campus-wide defaults.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const roleOptions = useMemo(() => {
    const roles = [...getRolesForDepartment(department)];
    if (savedTargetRole && !roles.includes(savedTargetRole)) {
      roles.unshift(savedTargetRole);
    }
    return roles;
  }, [department, savedTargetRole]);

  // Once the profile is in (or fails), fall back to a sensible default.
  useEffect(() => {
    if (!targetRole) {
      setTargetRole(savedTargetRole || getDefaultRoleForDepartment(department));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedTargetRole, department]);

  const selectedRole = targetRole === CUSTOM_ROLE ? customRole.trim() : targetRole;

  function acceptFile(candidate: File | undefined | null) {
    if (!candidate) return;
    if (candidate.type !== 'application/pdf') {
      setFileError('Only PDF documents can be measured.');
      return;
    }
    if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File is ${(candidate.size / 1024 / 1024).toFixed(1)}MB — the limit is ${MAX_SIZE_MB}MB.`);
      return;
    }
    setFileError('');
    setFile(candidate);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !selectedRole) return;

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', selectedRole);

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
    <div className="page-canvas">
      <PageHeader
        title="Resume analyzer"
        sub="Upload an existing PDF or build one from scratch — both paths end in a measured readiness score."
        meta="Sheet SU-03"
      />

      <div className="mx-auto w-full max-w-2xl">
        <Sheet className="overflow-hidden">
          <TitleBlock
            title="Provide your resume"
            sub="The instrument accepts standard text PDFs"
            meta="PDF · ≤ 5MB"
          />

          <div className="px-6 py-6">
            <div
              role="tablist"
              aria-label="Resume input method"
              className="mb-6 inline-flex rounded-lg border border-ink-line bg-sheet-inset p-1"
            >
              {(
                [
                  ['upload', 'Upload PDF'],
                  ['build', 'Build from scratch'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={activeTab === key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-xs font-bold transition-colors',
                    activeTab === key
                      ? 'bg-white text-ink shadow-hairline'
                      : 'text-ink-faint hover:text-ink'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'upload' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field
                  label="Target campus placement role"
                  htmlFor="target-role"
                  hint={
                    department
                      ? `Suggested for ${department} — or pick "Custom role…" for anything else`
                      : 'Set your department in Settings to see branch-specific suggestions'
                  }
                >
                  <Select
                    id="target-role"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  >
                    {!roleOptions.includes(targetRole) && targetRole !== CUSTOM_ROLE && (
                      <option value={targetRole}>{targetRole}</option>
                    )}
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                    <option value={CUSTOM_ROLE}>Custom role…</option>
                  </Select>
                </Field>

                {targetRole === CUSTOM_ROLE && (
                  <Field
                    label="Your target role"
                    htmlFor="target-role-custom"
                    hint="Any role you're preparing for — we'll analyze against it"
                  >
                    <Input
                      id="target-role-custom"
                      type="text"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="e.g. Pipeline Integrity Engineer"
                      list="target-role-suggestions"
                      required
                    />
                    <datalist id="target-role-suggestions">
                      {roleOptions.map((r) => (
                        <option key={r} value={r} />
                      ))}
                    </datalist>
                  </Field>
                )}

                <div>
                  <span className="mb-1.5 block font-mono text-xxs font-medium uppercase tracking-[0.08em] text-ink-faint">
                    Resume document
                  </span>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    id="resume-upload"
                    onChange={(e) => acceptFile(e.target.files?.[0])}
                    className="hidden"
                  />

                  {file ? (
                    <div className="flex items-center gap-3 rounded-lg border border-ink-line bg-white px-3.5 py-3">
                      <FileText className="h-5 w-5 shrink-0 text-instrument" strokeWidth={1.8} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-ink">{file.name}</div>
                        <div className="font-mono text-xxs text-ink-faint">
                          {(file.size / 1024).toFixed(0)} KB · ready for measurement
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          if (inputRef.current) inputRef.current.value = '';
                        }}
                        aria-label={`Remove ${file.name}`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-sheet-inset hover:text-instrument-deep"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        acceptFile(e.dataTransfer.files?.[0]);
                      }}
                      className={cn(
                        'flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors',
                        dragging
                          ? 'border-instrument bg-instrument-wash'
                          : 'border-ink-line-strong bg-white hover:border-ink-soft'
                      )}
                    >
                      <UploadCloud className="mb-2.5 h-6 w-6 text-ink-faint" strokeWidth={1.6} />
                      <span className="text-sm font-semibold text-ink">
                        Drop your PDF here, or click to browse
                      </span>
                      <span className="mt-1 font-mono text-xxs text-ink-faint">
                        Standard text PDF · under {MAX_SIZE_MB}MB
                      </span>
                    </button>
                  )}

                  {fileError && (
                    <p role="alert" className="mt-1.5 text-xs font-medium text-instrument-deep">
                      {fileError}
                    </p>
                  )}
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-instrument/40 bg-instrument-wash px-3.5 py-2.5 text-sm font-medium text-instrument-deep"
                  >
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="signal"
                  size="lg"
                  loading={loading}
                  disabled={!file}
                  className="w-full"
                >
                  {loading ? 'Evaluating with AI model…' : 'Analyze resume & generate competency radar'}
                </Button>
              </form>
            ) : (
              <ResumeBuilder />
            )}
          </div>
        </Sheet>
      </div>
    </div>
  );
}
