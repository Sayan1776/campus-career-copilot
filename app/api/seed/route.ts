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

// Demo cohort spans every major branch so TPO analytics and peer filters
const DEPARTMENT_SEEDS: {
  department: string;
  slots: number;
  skills: string[];
  gaps: { skill: string; severity: 'high' | 'medium' | 'low' }[];
  roles: string[];
}[] = [
  {
    department: 'CSE',
    slots: 4,
    skills: [
      'Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Java', 'Git',
      'REST APIs', 'MongoDB', 'TypeScript', 'Docker', 'AWS',
    ],
    gaps: [
      { skill: 'System Design & Architecture', severity: 'high' },
      { skill: 'Cloud Deployment (AWS/GCP)', severity: 'medium' },
      { skill: 'SQL Query Optimization', severity: 'low' },
      { skill: 'Docker & Containerization', severity: 'medium' },
      { skill: 'Unit & Integration Testing', severity: 'low' },
    ],
    roles: ['Software Engineer', 'Data Scientist', 'Frontend Developer', 'Backend Developer'],
  },
  {
    department: 'ME',
    slots: 3,
    skills: [
      'AutoCAD', 'SolidWorks', 'CATIA', 'MATLAB', 'ANSYS (FEA)', 'Thermodynamics',
      'Manufacturing Processes', 'GD&T', 'CNC Programming', 'Heat Transfer',
    ],
    gaps: [
      { skill: 'ANSYS Structural Analysis', severity: 'high' },
      { skill: 'CFD Simulation (ANSYS Fluent)', severity: 'high' },
      { skill: 'GD&T & Tolerance Analysis', severity: 'medium' },
      { skill: 'PLC & Industrial Automation', severity: 'medium' },
      { skill: 'Lean Manufacturing (5S/Kaizen)', severity: 'low' },
      { skill: 'CAM Programming (Mastercam)', severity: 'low' },
    ],
    roles: ['Design Engineer', 'Manufacturing Engineer', 'Thermal Engineer', 'CAD/CAM Engineer'],
  },
  {
    department: 'CE',
    slots: 3,
    skills: [
      'AutoCAD', 'STAAD Pro', 'Revit', 'Surveying (Total Station)', 'Concrete Technology',
      'Structural Analysis', 'Estimation & Costing', 'Primavera P6', 'ETABS',
    ],
    gaps: [
      { skill: 'Advanced ETABS Modelling', severity: 'high' },
      { skill: 'Construction Project Management (Primavera)', severity: 'high' },
      { skill: 'Geotechnical Investigation Basics', severity: 'medium' },
      { skill: 'BIM Workflow (Revit + Navisworks)', severity: 'medium' },
      { skill: 'Quantity Surveying (QS)', severity: 'low' },
    ],
    roles: ['Site Engineer', 'Structural Engineer', 'Planning Engineer'],
  },
  {
    department: 'ECE',
    slots: 3,
    skills: [
      'Digital Electronics', 'Verilog', 'Embedded C', 'ARM Cortex-M', 'PCB Design (Altium)',
      'MATLAB & Simulink', 'Communication Systems', 'IoT Protocols (MQTT)', 'Oscilloscope & Debugging',
    ],
    gaps: [
      { skill: 'VLSI Design Flow (Cadence)', severity: 'high' },
      { skill: 'RTOS (FreeRTOS)', severity: 'high' },
      { skill: 'RF & Antenna Design Basics', severity: 'medium' },
      { skill: 'Signal Processing (DSP)', severity: 'medium' },
      { skill: 'Industry PCB DFM Practices', severity: 'low' },
    ],
    roles: ['VLSI Design Engineer', 'Embedded Systems Engineer', 'Telecom Engineer'],
  },
  {
    department: 'EE',
    slots: 2,
    skills: [
      'Power Systems Analysis', 'MATLAB', 'SCADA', 'PLC (Siemens)', 'Electrical CAD (ETAP)',
      'Control Systems', 'Machine Design (Motors/Transformers)', 'Load Flow Studies',
    ],
    gaps: [
      { skill: 'Power System Simulation (PSCAD/ETAP)', severity: 'high' },
      { skill: 'Protection & Relay Coordination', severity: 'high' },
      { skill: 'Solar PV Design & Sizing', severity: 'medium' },
      { skill: 'Industrial Automation (PLC/SCADA Integration)', severity: 'medium' },
      { skill: 'Energy Audit Practices', severity: 'low' },
    ],
    roles: ['Electrical Design Engineer', 'Power Systems Engineer'],
  },
  {
    department: 'Chemical',
    slots: 2,
    skills: [
      'Mass Transfer', 'Heat Transfer', 'Process Calculations', 'Aspen HYSYS', 'MS Project',
      'Process Instrumentation', 'Thermodynamics', 'Safety (HAZOP Awareness)',
    ],
    gaps: [
      { skill: 'Process Simulation (Aspen Plus)', severity: 'high' },
      { skill: 'P&ID Development', severity: 'high' },
      { skill: 'Process Safety & HAZOP', severity: 'medium' },
      { skill: 'Plant Utilities & Utilities Balance', severity: 'low' },
    ],
    roles: ['Process Engineer', 'Petrochemical Engineer'],
  },
  {
    department: 'IT',
    slots: 1,
    skills: [
      'Java', 'Python', 'SQL', 'Linux Administration', 'Computer Networks', 'Cloud Basics (AWS)',
      'Git', 'Bash Scripting',
    ],
    gaps: [
      { skill: 'Network Design (CCNA-level)', severity: 'high' },
      { skill: 'Cloud Deployment (AWS/GCP)', severity: 'medium' },
      { skill: 'ITIL & Ticketing Workflows', severity: 'low' },
    ],
    roles: ['Systems Analyst'],
  },
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

  // 2. Assign each student to a department slot, then draw that
  // department's skills/gaps/roles for them
  const roster = FIRST_NAMES.map((name, i) => {
    let cursor = 0;
    let seed = DEPARTMENT_SEEDS[0];
    for (const deptSeed of DEPARTMENT_SEEDS) {
      if (i < cursor + deptSeed.slots) {
        seed = deptSeed;
        break;
      }
      cursor += deptSeed.slots;
    }
    const deptIndex = i - cursor; // position within the department's students
    return {
      name,
      department: seed.department,
      targetRole: seed.roles[deptIndex % seed.roles.length],
      skills: randomSubset(seed.skills, 6, 10),
      gaps: randomSubset(seed.gaps, 2, 3),
    };
  });

  // 3. Build users
  const users = roster.map((s, i) => ({
    id: `${SEED_PREFIX}${i + 1}`,
    role: 'student' as const,
    name: s.name,
    department: s.department,
    batch_year: 2026,
    target_role: s.targetRole,
    opted_in_recruiter: Math.random() > 0.25,
  }));

  // 4. Build resumes
  const resumes = roster.map((s, i) => ({
    user_id: `${SEED_PREFIX}${i + 1}`,
    file_url: `seed_resume_${i + 1}.pdf`,
    overall_score: 60 + Math.floor(Math.random() * 35), // 60-95
    extracted_skills: s.skills,
    skill_gaps: s.gaps,
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
  roster.forEach((s, i) => {
    const studentId = `${SEED_PREFIX}${i + 1}`;
    if (s.gaps.length > 0) {
      // Create 1 or 2 journeys for this student
      const gapToTake = s.gaps[0];
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
            description: 'Core concepts, industry overview, and GitHub notes',
            content: `Key concepts regarding ${gapToTake.skill} essential for ${s.department} campus placement rounds.`,
            completed: true,
          },
          {
            stepNumber: 2,
            type: 'course',
            title: `Recommended Course`,
            description: `Reputable online course for ${gapToTake.skill}`,
            content: `Complete a foundational course from providers like Coursera or Udemy to solidify your knowledge.`,
            completed: isCompleted,
          },
          {
            stepNumber: 3,
            type: 'challenge',
            title: `Hands-on Project on ${gapToTake.skill}`,
            description: 'Practical implementation task',
            content: `Build and run a mini project utilizing ${gapToTake.skill}.`,
            completed: isCompleted,
          },
          {
            stepNumber: 4,
            type: 'quiz',
            title: 'Knowledge Assessment',
            description: 'Full MCQ Exam',
            content: 'Self-assessment questions to test your proficiency.',
            completed: isCompleted,
          },
        ],
        completed_steps: isCompleted ? 4 : 1,
        total_steps: 4,
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

  // 6. Seed company visits — drives from across sectors, not just tech
  await supabaseAdmin.from('company_visits').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const companyVisits = [
    { company_name: 'Microsoft Campus Drive (CSE/IT)', visit_date: '2026-09-15', location_lat: 22.5958, location_lng: 88.4497 },
    { company_name: 'L&T Construction Drive (Civil/Mech)', visit_date: '2026-09-22', location_lat: 22.5354, location_lng: 88.3524 },
    { company_name: 'Tata Steel Engineering Drive (Mech/Electrical)', visit_date: '2026-10-03', location_lat: 22.6142, location_lng: 88.4340 },
    { company_name: 'Siemens Automation Drive (Electrical/ECE)', visit_date: '2026-10-08', location_lat: 22.5726, location_lng: 88.3639 },
    { company_name: 'Reliance Process Engineer Drive (Chemical)', visit_date: '2026-10-14', location_lat: 22.5244, location_lng: 88.3214 },
    { company_name: 'TCS Digital Innovation (All Branches)', visit_date: '2026-10-20', location_lat: 22.5489, location_lng: 88.3927 },
  ];
  await supabaseAdmin.from('company_visits').insert(companyVisits);

  return NextResponse.json({ ok: true, seeded: studentCount });
}
