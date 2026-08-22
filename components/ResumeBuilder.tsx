'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';

interface ExperienceEntry {
  company: string;
  title: string;
  dates: string;
  location: string;
  responsibilities: string;
  tools: string;
}

interface EducationEntry {
  degree: string;
  university: string;
  date: string;
  gpa: string;
  coursework: string;
  honors: string;
}

interface ProjectEntry {
  name: string;
  description: string;
  tech: string;
  links: string;
  impact: string;
}

function SectionHeading({
  title,
  note,
  onAdd,
  addLabel,
}: {
  title: string;
  note?: string;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-line pb-2">
      <div>
        <h3 className="font-mono text-xxs font-medium uppercase tracking-[0.12em] text-ink-faint">
          {title}
        </h3>
        {note && <p className="mt-0.5 text-xs text-ink-faint">{note}</p>}
      </div>
      {onAdd && (
        <Button type="button" size="sm" variant="outline" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}

function EntryCard({
  label,
  onRemove,
  children,
}: {
  label: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-ink-line bg-white p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-xxs font-medium uppercase tracking-[0.1em] text-ink-faint">
          {label}
        </h4>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-instrument-wash hover:text-instrument-deep"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {children}
    </div>
  );
}

export default function ResumeBuilder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latexOutput, setLatexOutput] = useState('');

  const [personal, setPersonal] = useState({
    fullName: '',
    phone: '',
    email: '',
    linkedin: '',
    github: '',
    location: '',
    website: '',
  });

  const [targetRole, setTargetRole] = useState('');
  const [summary, setSummary] = useState('');

  const [experience, setExperience] = useState<ExperienceEntry[]>([]);

  const [education, setEducation] = useState<EducationEntry[]>([
    { degree: '', university: '', date: '', gpa: '', coursework: '', honors: '' },
  ]);

  const [skills, setSkills] = useState('');

  const [projects, setProjects] = useState<ProjectEntry[]>([
    { name: '', description: '', tech: '', links: '', impact: '' },
  ]);

  const [achievements, setAchievements] = useState('');
  const [additional, setAdditional] = useState('');

  const addExperience = () =>
    setExperience([
      ...experience,
      { company: '', title: '', dates: '', location: '', responsibilities: '', tools: '' },
    ]);
  const addEducation = () =>
    setEducation([
      ...education,
      { degree: '', university: '', date: '', gpa: '', coursework: '', honors: '' },
    ]);
  const addProject = () =>
    setProjects([...projects, { name: '', description: '', tech: '', links: '', impact: '' }]);

  const updateExperience = (index: number, field: keyof ExperienceEntry, value: string) => {
    const next = [...experience];
    next[index][field] = value;
    setExperience(next);
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const next = [...education];
    next[index][field] = value;
    setEducation(next);
  };

  const updateProject = (index: number, field: keyof ProjectEntry, value: string) => {
    const next = [...projects];
    next[index][field] = value;
    setProjects(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLatexOutput('');

    const payload = {
      personal,
      targetRole,
      summary,
      experience: experience.filter((exp) => exp.company || exp.title),
      education: education.filter((edu) => edu.degree || edu.university),
      skills,
      projects: projects.filter((proj) => proj.name || proj.description),
      achievements,
      additional,
    };

    try {
      const res = await fetch('/api/resume/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to generate resume');

      setLatexOutput(data.latex);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(latexOutput);
      toast.success('LaTeX code copied to clipboard');
    } catch {
      toast.error('Could not copy — select the code and copy manually');
    }
  };

  if (latexOutput) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-ink">Generated LaTeX resume</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setLatexOutput('')}>
              Edit details
            </Button>
            <Button size="sm" variant="signal" onClick={handleCopy}>
              Copy LaTeX
            </Button>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-ink-soft">
          Paste this code into{' '}
          <a
            href="https://www.overleaf.com"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-instrument-deep underline-offset-2 hover:underline"
          >
            Overleaf
          </a>{' '}
          to compile and download your PDF, then run it through the analyzer above.
        </p>
        <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-lg border border-ink-edge bg-ink-deep p-4 font-mono text-xs leading-relaxed text-[#C9D6E4]">
          {latexOutput}
        </pre>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-instrument/40 bg-instrument-wash px-3.5 py-2.5 text-sm font-medium text-instrument-deep"
        >
          {error}
        </div>
      )}

      {/* Personal */}
      <section className="space-y-4">
        <SectionHeading title="Personal information" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input placeholder="Full Name *" required aria-label="Full name" value={personal.fullName} onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })} />
          <Input placeholder="Target Role (e.g. Design Engineer)" required aria-label="Target role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
          <Input placeholder="Email *" type="email" required aria-label="Email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} />
          <Input placeholder="Phone" aria-label="Phone" value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} />
          <Input placeholder="Location (City, State)" aria-label="Location" value={personal.location} onChange={(e) => setPersonal({ ...personal, location: e.target.value })} />
          <Input placeholder="LinkedIn URL" aria-label="LinkedIn URL" value={personal.linkedin} onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })} />
          <Input placeholder="GitHub URL" aria-label="GitHub URL" value={personal.github} onChange={(e) => setPersonal({ ...personal, github: e.target.value })} />
          <Input placeholder="Portfolio / Website" aria-label="Portfolio or website" value={personal.website} onChange={(e) => setPersonal({ ...personal, website: e.target.value })} />
        </div>
        <Textarea
          placeholder="Professional Summary (optional but recommended)"
          aria-label="Professional summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </section>

      {/* Experience */}
      <section className="space-y-4">
        <SectionHeading
          title="Work experience"
          note="Optional"
          onAdd={addExperience}
          addLabel="Add position"
        />
        {experience.length === 0 && (
          <div className="rounded-lg border border-dashed border-ink-line-strong bg-white/60 px-4 py-6 text-center text-xs leading-relaxed text-ink-soft">
            No work experience added. Add a position if you have internships or
            jobs to list.
          </div>
        )}
        {experience.map((exp, i) => (
          <EntryCard
            key={i}
            label={`Position ${i + 1}`}
            onRemove={() => setExperience(experience.filter((_, idx) => idx !== i))}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input placeholder="Company Name" aria-label="Company name" value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} />
              <Input placeholder="Job Title" aria-label="Job title" value={exp.title} onChange={(e) => updateExperience(i, 'title', e.target.value)} />
              <Input placeholder="Dates (e.g. Jun 2022 – Aug 2022)" aria-label="Dates" value={exp.dates} onChange={(e) => updateExperience(i, 'dates', e.target.value)} />
              <Input placeholder="Location" aria-label="Location" value={exp.location} onChange={(e) => updateExperience(i, 'location', e.target.value)} />
            </div>
            <Textarea
              placeholder="Key responsibilities and achievements (bullet points)"
              aria-label="Responsibilities"
              value={exp.responsibilities}
              onChange={(e) => updateExperience(i, 'responsibilities', e.target.value)}
            />
            <Input placeholder="Technologies / tools used" aria-label="Tools used" value={exp.tools} onChange={(e) => updateExperience(i, 'tools', e.target.value)} />
          </EntryCard>
        ))}
      </section>

      {/* Projects */}
      <section className="space-y-4">
        <SectionHeading title="Projects" onAdd={addProject} addLabel="Add project" />
        {projects.map((proj, i) => (
          <EntryCard
            key={i}
            label={`Project ${i + 1}`}
            onRemove={() => setProjects(projects.filter((_, idx) => idx !== i))}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input placeholder="Project Name" aria-label="Project name" value={proj.name} onChange={(e) => updateProject(i, 'name', e.target.value)} />
              <Input placeholder="Links (GitHub / Demo)" aria-label="Project links" value={proj.links} onChange={(e) => updateProject(i, 'links', e.target.value)} />
            </div>
            <Input placeholder="Technologies used" aria-label="Technologies" value={proj.tech} onChange={(e) => updateProject(i, 'tech', e.target.value)} />
            <Textarea
              placeholder="Description & impact (bullet points)"
              aria-label="Project description"
              value={proj.impact}
              onChange={(e) => updateProject(i, 'impact', e.target.value)}
            />
          </EntryCard>
        ))}
      </section>

      {/* Education */}
      <section className="space-y-4">
        <SectionHeading title="Education" onAdd={addEducation} addLabel="Add education" />
        {education.map((edu, i) => (
          <EntryCard
            key={i}
            label={`Education ${i + 1}`}
            onRemove={() => setEducation(education.filter((_, idx) => idx !== i))}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input placeholder="University / College" aria-label="University" value={edu.university} onChange={(e) => updateEducation(i, 'university', e.target.value)} />
              <Input placeholder="Degree (e.g. B.S. Computer Science)" aria-label="Degree" value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} />
              <Input placeholder="Graduation Date" aria-label="Graduation date" value={edu.date} onChange={(e) => updateEducation(i, 'date', e.target.value)} />
              <Input placeholder="GPA (optional)" aria-label="GPA" value={edu.gpa} onChange={(e) => updateEducation(i, 'gpa', e.target.value)} />
            </div>
            <Input placeholder="Relevant Coursework" aria-label="Coursework" value={edu.coursework} onChange={(e) => updateEducation(i, 'coursework', e.target.value)} />
          </EntryCard>
        ))}
      </section>

      {/* Skills & extras */}
      <section className="space-y-3">
        <SectionHeading title="Skills & additional" />
        <Textarea
          placeholder="Technical Skills (e.g. Tools: AutoCAD, MATLAB; Languages: Python, C; Frameworks: React, Node.js)"
          aria-label="Technical skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />
        <Textarea
          placeholder="Achievements, Awards, Hackathons, Certifications"
          aria-label="Achievements"
          value={achievements}
          onChange={(e) => setAchievements(e.target.value)}
        />
        <Textarea
          placeholder="Additional (Leadership, Volunteer, Languages spoken)"
          aria-label="Additional information"
          value={additional}
          onChange={(e) => setAdditional(e.target.value)}
        />
      </section>

      <Button
        type="submit"
        variant="signal"
        size="lg"
        loading={loading}
        disabled={!personal.fullName || !personal.email}
        className="w-full"
      >
        {loading ? 'Crafting LaTeX resume…' : 'Generate professional LaTeX resume'}
      </Button>
    </form>
  );
}
