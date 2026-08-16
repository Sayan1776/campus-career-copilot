'use client';

import { useState } from 'react';

export default function ResumeBuilder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latexOutput, setLatexOutput] = useState('');

  // Form State
  const [personal, setPersonal] = useState({
    fullName: '',
    phone: '',
    email: '',
    linkedin: '',
    github: '',
    location: '',
    website: '',
  });

  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [summary, setSummary] = useState('');
  
  const [experience, setExperience] = useState<any[]>([]);

  const [education, setEducation] = useState<any[]>([
    { degree: '', university: '', date: '', gpa: '', coursework: '', honors: '' }
  ]);

  const [skills, setSkills] = useState('');
  
  const [projects, setProjects] = useState<any[]>([
    { name: '', description: '', tech: '', links: '', impact: '' }
  ]);

  const [achievements, setAchievements] = useState('');
  const [additional, setAdditional] = useState('');

  const addExperience = () => setExperience([...experience, { company: '', title: '', dates: '', location: '', responsibilities: '', tools: '' }]);
  const addEducation = () => setEducation([...education, { degree: '', university: '', date: '', gpa: '', coursework: '', honors: '' }]);
  const addProject = () => setProjects([...projects, { name: '', description: '', tech: '', links: '', impact: '' }]);

  const updateExperience = (index: number, field: string, value: string) => {
    const newExp = [...experience];
    newExp[index][field] = value;
    setExperience(newExp);
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEdu = [...education];
    newEdu[index][field] = value;
    setEducation(newEdu);
  };

  const updateProject = (index: number, field: string, value: string) => {
    const newProj = [...projects];
    newProj[index][field] = value;
    setProjects(newProj);
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
      experience: experience.filter(exp => exp.company || exp.title),
      education: education.filter(edu => edu.degree || edu.university),
      skills,
      projects: projects.filter(proj => proj.name || proj.description),
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

  const handleCopy = () => {
    navigator.clipboard.writeText(latexOutput);
    alert('LaTeX code copied to clipboard!');
  };

  if (latexOutput) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Your Generated LaTeX Resume</h2>
          <div className="flex gap-2">
            <button onClick={() => setLatexOutput('')} className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded bg-[#1a231d]">
              Edit Details
            </button>
            <button onClick={handleCopy} className="text-xs font-bold text-[#041a12] bg-[#00D68F] hover:bg-[#00e89b] px-4 py-1.5 rounded transition-colors">
              Copy LaTeX
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400">Copy this code and paste it into <a href="https://www.overleaf.com" target="_blank" rel="noreferrer" className="text-[#00D68F] hover:underline">Overleaf</a> to compile and download your PDF resume.</p>
        <pre className="bg-[#121815] border border-[#233028] p-4 rounded-xl text-xs text-slate-300 overflow-x-auto max-h-[500px] overflow-y-auto font-mono whitespace-pre-wrap">
          {latexOutput}
        </pre>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Personal Info */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-[#00D68F] uppercase tracking-wider border-b border-[#233028] pb-2">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <input className="input-field" placeholder="Full Name *" required value={personal.fullName} onChange={e => setPersonal({...personal, fullName: e.target.value})} />
          <input className="input-field" placeholder="Target Role (e.g. SWE)" required value={targetRole} onChange={e => setTargetRole(e.target.value)} />
          <input className="input-field" placeholder="Email *" type="email" required value={personal.email} onChange={e => setPersonal({...personal, email: e.target.value})} />
          <input className="input-field" placeholder="Phone" value={personal.phone} onChange={e => setPersonal({...personal, phone: e.target.value})} />
          <input className="input-field" placeholder="Location (City, State)" value={personal.location} onChange={e => setPersonal({...personal, location: e.target.value})} />
          <input className="input-field" placeholder="LinkedIn URL" value={personal.linkedin} onChange={e => setPersonal({...personal, linkedin: e.target.value})} />
          <input className="input-field" placeholder="GitHub URL" value={personal.github} onChange={e => setPersonal({...personal, github: e.target.value})} />
          <input className="input-field" placeholder="Portfolio/Website" value={personal.website} onChange={e => setPersonal({...personal, website: e.target.value})} />
        </div>
        <textarea className="input-field w-full h-24" placeholder="Professional Summary (Optional but recommended)" value={summary} onChange={e => setSummary(e.target.value)} />
      </section>

      {/* Experience */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-[#233028] pb-2">
          <h3 className="text-sm font-bold text-[#00D68F] uppercase tracking-wider">Work Experience (Optional)</h3>
          <button type="button" onClick={addExperience} className="text-xs text-[#00D68F] hover:text-white">+ Add Position</button>
        </div>

        {experience.length === 0 && (
          <div className="text-center py-6 border border-dashed border-[#233028] rounded-xl text-xs text-slate-500">
            No work experience added. Click "+ Add Position" if you have any internships or jobs to list.
          </div>
        )}

        {experience.map((exp, i) => (
          <div key={i} className="p-4 rounded-xl bg-[#1a231d] border border-[#233028] space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold text-slate-300">Position {i + 1}</h4>
              <button 
                type="button" 
                onClick={() => setExperience(experience.filter((_, idx) => idx !== i))}
                className="text-xs text-rose-500 hover:text-rose-400"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" placeholder="Company Name" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} />
              <input className="input-field" placeholder="Job Title" value={exp.title} onChange={e => updateExperience(i, 'title', e.target.value)} />
              <input className="input-field" placeholder="Dates (e.g. Jun 2022 - Aug 2022)" value={exp.dates} onChange={e => updateExperience(i, 'dates', e.target.value)} />
              <input className="input-field" placeholder="Location" value={exp.location} onChange={e => updateExperience(i, 'location', e.target.value)} />
            </div>
            <textarea className="input-field w-full h-20" placeholder="Key responsibilities and achievements (bullet points)" value={exp.responsibilities} onChange={e => updateExperience(i, 'responsibilities', e.target.value)} />
            <input className="input-field w-full" placeholder="Technologies/tools used" value={exp.tools} onChange={e => updateExperience(i, 'tools', e.target.value)} />
          </div>
        ))}
      </section>

      {/* Projects */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-[#233028] pb-2">
          <h3 className="text-sm font-bold text-[#00D68F] uppercase tracking-wider">Projects</h3>
          <button type="button" onClick={addProject} className="text-xs text-[#00D68F] hover:text-white">+ Add Project</button>
        </div>
        {projects.map((proj, i) => (
          <div key={i} className="p-4 rounded-xl bg-[#1a231d] border border-[#233028] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" placeholder="Project Name" value={proj.name} onChange={e => updateProject(i, 'name', e.target.value)} />
              <input className="input-field" placeholder="Links (GitHub/Demo)" value={proj.links} onChange={e => updateProject(i, 'links', e.target.value)} />
            </div>
            <input className="input-field w-full" placeholder="Technologies used" value={proj.tech} onChange={e => updateProject(i, 'tech', e.target.value)} />
            <textarea className="input-field w-full h-20" placeholder="Description & Impact (bullet points)" value={proj.impact} onChange={e => updateProject(i, 'impact', e.target.value)} />
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-[#233028] pb-2">
          <h3 className="text-sm font-bold text-[#00D68F] uppercase tracking-wider">Education</h3>
          <button type="button" onClick={addEducation} className="text-xs text-[#00D68F] hover:text-white">+ Add Education</button>
        </div>
        {education.map((edu, i) => (
          <div key={i} className="p-4 rounded-xl bg-[#1a231d] border border-[#233028] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" placeholder="University/College" value={edu.university} onChange={e => updateEducation(i, 'university', e.target.value)} />
              <input className="input-field" placeholder="Degree (e.g. B.S. Computer Science)" value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} />
              <input className="input-field" placeholder="Graduation Date" value={edu.date} onChange={e => updateEducation(i, 'date', e.target.value)} />
              <input className="input-field" placeholder="GPA (optional)" value={edu.gpa} onChange={e => updateEducation(i, 'gpa', e.target.value)} />
            </div>
            <input className="input-field w-full" placeholder="Relevant Coursework" value={edu.coursework} onChange={e => updateEducation(i, 'coursework', e.target.value)} />
          </div>
        ))}
      </section>

      {/* Skills & Extras */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-[#00D68F] uppercase tracking-wider border-b border-[#233028] pb-2">Skills & Additional</h3>
        <textarea className="input-field w-full h-20" placeholder="Technical Skills (e.g. Languages: Python, Java; Frameworks: React, Node.js)" value={skills} onChange={e => setSkills(e.target.value)} />
        <textarea className="input-field w-full h-20" placeholder="Achievements, Awards, Hackathons, Certifications" value={achievements} onChange={e => setAchievements(e.target.value)} />
        <textarea className="input-field w-full h-20" placeholder="Additional (Leadership, Volunteer, Languages spoken)" value={additional} onChange={e => setAdditional(e.target.value)} />
      </section>

      <button
        type="submit"
        disabled={loading || !personal.fullName || !personal.email}
        className="w-full rounded-xl bg-[#00D68F] py-3.5 text-sm font-bold text-[#041a12] hover:bg-[#00e89b] disabled:opacity-50 transition-colors shadow-card flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Crafting LaTeX Resume...
          </>
        ) : (
          'Generate Professional LaTeX Resume'
        )}
      </button>

      <style jsx>{`
        .input-field {
          @apply rounded-lg border border-[#233028] bg-[#121815] px-3.5 py-2.5 text-xs text-white focus:border-[#00D68F] focus:outline-none transition-colors;
        }
      `}</style>
    </form>
  );
}
