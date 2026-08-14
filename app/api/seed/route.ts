import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const SEED_PREFIX = 'seed_student_';

const FIRST_NAMES = [
  'Arjun Sharma', 'Priya Patel', 'Rohan Gupta', 'Ananya Roy', 'Vikram Singh',
  'Sneha Mukherjee', 'Karan Verma', 'Divya Nair', 'Aditya Joshi', 'Ishita Sen',
  'Rahul Das', 'Meera Iyer', 'Siddharth Rao', 'Pooja Reddy', 'Aryan Kapoor',
  'Kavya Mehta', 'Nikhil Banik', 'Riya Chatterjee',
];

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Comm',
  'Data Science & AI',
];

const TARGET_ROLES = [
  'Software Engineer',
  'Data Analyst',
  'Data Scientist',
  'Frontend Developer',
  'Backend Developer',
];

const SKILL_POOL = [
  'Python', 'JavaScript', 'React', 'Node.js', 'TypeScript', 'SQL', 'Java',
  'Git', 'REST APIs', 'HTML/CSS', 'MongoDB', 'Pandas', 'NumPy', 'Flask',
  'Express.js', 'Tailwind CSS',
];

const GAP_DISTRIBUTION: { skill: string; severity: 'high' | 'medium' | 'low'; count: number }[] = [
  { skill: 'System Design & Architecture', severity: 'high', count: 14 },
  { skill: 'Cloud Deployment (AWS/GCP)', severity: 'high', count: 12 },
  { skill: 'SQL Query Optimization', severity: 'medium', count: 10 },
  { skill: 'Docker & Containerization', severity: 'high', count: 9 },
  { skill: 'Unit & Integration Testing', severity: 'medium', count: 8 },
  { skill: 'CI/CD Pipelines', severity: 'medium', count: 7 },
  { skill: 'Redis & Caching Strategies', severity: 'low', count: 5 },
  { skill: 'Microservices Pattern', severity: 'low', count: 4 },
];

function shuffledIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomSubset<T>(pool: T[], min: number, max: number): T[] {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  return shuffledIndices(pool.length).slice(0, count).map((i) => pool[i]);
}

export async function POST(req: NextRequest) {
  const session = await verifySession(req);
  if (!session) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
  }
  if (session.role !== 'tpo') {
    return NextResponse.json({ error: 'only TPO accounts can seed demo data' }, { status: 403 });
  }

  const studentCount = FIRST_NAMES.length; // 18

  // 1. Clean up any previously seeded data
  const seedIds = Array.from({ length: studentCount }, (_, i) => `${SEED_PREFIX}${i + 1}`);
  await supabaseAdmin.from('skill_journeys').delete().in('user_id', seedIds);
  await supabaseAdmin.from('resumes').delete().in('user_id', seedIds);
  await supabaseAdmin.from('users').delete().in('id', seedIds);

  // 2. Build the per-student skill gap assignment
  const studentGaps: { skill: string; severity: string }[][] = Array.from(
    { length: studentCount },
    () => []
  );

  for (const gap of GAP_DISTRIBUTION) {
    const chosen = shuffledIndices(studentCount).slice(0, gap.count);
    for (const idx of chosen) {
      studentGaps[idx].push({ skill: gap.skill, severity: gap.severity });
    }
  }

  // 3. Build users
  const users = FIRST_NAMES.map((name, i) => ({
    id: `${SEED_PREFIX}${i + 1}`,
    role: 'student' as const,
    name,
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    batch_year: 2026,
    target_role: TARGET_ROLES[i % TARGET_ROLES.length],
    opted_in_recruiter: Math.random() > 0.25,
  }));

  // 4. Build resumes
  const resumes = FIRST_NAMES.map((_, i) => ({
    user_id: `${SEED_PREFIX}${i + 1}`,
    file_url: `seed_resume_${i + 1}.pdf`,
    overall_score: 60 + Math.floor(Math.random() * 35), // 60-95
    extracted_skills: randomSubset(SKILL_POOL, 6, 10),
    skill_gaps: studentGaps[i],
    status: 'complete' as const,
  }));

  const { error: userError } = await supabaseAdmin.from('users').insert(users);
  if (userError) {
    return NextResponse.json({ error: `user seed failed: ${userError.message}` }, { status: 500 });
  }

  const { error: resumeError } = await supabaseAdmin.from('resumes').insert(resumes);
  if (resumeError) {
    return NextResponse.json({ error: `resume seed failed: ${resumeError.message}` }, { status: 500 });
  }

  // 5. Seed sample Skill Journeys
  const sampleJourneys: any[] = [];
  FIRST_NAMES.forEach((_, i) => {
    const studentId = `${SEED_PREFIX}${i + 1}`;
    const gaps = studentGaps[i];
    if (gaps.length > 0) {
      // Create 1 or 2 journeys for this student
      const gapToTake = gaps[0];
      const isCompleted = i % 3 === 0;
      sampleJourneys.push({
        user_id: studentId,
        skill: gapToTake.skill,
        severity: gapToTake.severity,
        steps: [
          {
            stepNumber: 1,
            type: 'concept',
            title: `Foundations of ${gapToTake.skill}`,
            description: 'Core concepts and architecture overview',
            content: `Key concepts regarding ${gapToTake.skill} essential for campus technical placement rounds.`,
            completed: true,
          },
          {
            stepNumber: 2,
            type: 'challenge',
            title: `Hands-on Project on ${gapToTake.skill}`,
            description: 'Practical implementation task',
            content: `Build and run a micro project utilizing ${gapToTake.skill}.`,
            completed: isCompleted,
          },
          {
            stepNumber: 3,
            type: 'quiz',
            title: 'Knowledge Assessment',
            description: 'Verification quiz questions',
            content: 'Self-assessment questions.',
            completed: isCompleted,
          },
        ],
        completed_steps: isCompleted ? 3 : 1,
        total_steps: 3,
        status: isCompleted ? 'completed' : 'in_progress',
      });
    }
  });

  if (sampleJourneys.length > 0) {
    const { error: journeyError } = await supabaseAdmin
      .from('skill_journeys')
      .insert(sampleJourneys);
    if (journeyError) {
      console.warn('Skill journey seed failed (non-fatal):', journeyError.message);
    }
  }

  // 6. Seed company visits
  await supabaseAdmin.from('company_visits').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const companyVisits = [
    { company_name: 'Microsoft Campus Drive', visit_date: '2026-09-15', location_lat: 22.5958, location_lng: 88.4497 },
    { company_name: 'Google Placement Visit', visit_date: '2026-09-22', location_lat: 22.5354, location_lng: 88.3524 },
    { company_name: 'Amazon Placement Drive', visit_date: '2026-10-03', location_lat: 22.6142, location_lng: 88.4340 },
    { company_name: 'TCS Digital Innovation', visit_date: '2026-10-14', location_lat: 22.5726, location_lng: 88.3639 },
  ];
  await supabaseAdmin.from('company_visits').insert(companyVisits);

  return NextResponse.json({ ok: true, seeded: studentCount });
}
