// Single source of truth for engineering departments and the campus
// placement roles each branch can target. Every picker, fallback, and AI
// prompt in the app reads from here so no branch is second-class.

export const DEPARTMENTS = [
  'CSE',
  'IT',
  'ECE',
  'EE',
  'ME',
  'CE',
  'Chemical',
  'Data Science & AI',
  'Production & Industrial',
  'Biotechnology',
  'Other',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

// Roles open to graduates of any branch (management, analytics, consulting,
// and generic trainee tracks that recruiters run campus-wide).
export const CROSS_DISCIPLINARY_ROLES = [
  'Graduate Engineer Trainee',
  'Product Manager',
  'Data Analyst',
  'Business Analyst',
  'Consultant',
  'Technical Sales Engineer',
  'Operations Analyst',
  'Project Engineer',
] as const;

export const ROLES_BY_DEPARTMENT: Record<string, string[]> = {
  'CSE': [
    'Software Engineer',
    'Data Scientist',
    'Machine Learning Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Cybersecurity Analyst',
  ],
  'IT': [
    'Software Engineer',
    'Systems Analyst',
    'Network Engineer',
    'Cloud Support Engineer',
    'Full Stack Developer',
    'Database Administrator',
    'DevOps Engineer',
    'Data Analyst',
  ],
  'ECE': [
    'Electronics Design Engineer',
    'VLSI Design Engineer',
    'Embedded Systems Engineer',
    'Telecom Engineer',
    'PCB Design Engineer',
    'Signal Processing Engineer',
    'IoT Engineer',
    'Test & Validation Engineer',
  ],
  EE: [
    'Electrical Design Engineer',
    'Power Systems Engineer',
    'Control Systems Engineer',
    'Electrical Maintenance Engineer',
    'Automation Engineer',
    'Renewable Energy Engineer',
    'Protection & Relay Engineer',
    'Solar PV Design Engineer',
  ],
  ME: [
    'Design Engineer',
    'Manufacturing Engineer',
    'Thermal Engineer',
    'CAD/CAM Engineer',
    'Quality Engineer',
    'Automotive Engineer',
    'Maintenance Engineer',
    'Product Design Engineer',
  ],
  CE: [
    'Site Engineer',
    'Structural Engineer',
    'Construction Manager',
    'Geotechnical Engineer',
    'Transportation Engineer',
    'Planning Engineer',
    'Surveying Engineer',
    'Estimation & Costing Engineer',
  ],
  Chemical: [
    'Process Engineer',
    'Petrochemical Engineer',
    'Quality Control Engineer',
    'Process Safety Engineer',
    'Plant Operations Engineer',
    'Polymer Engineer',
    'Environmental Engineer',
    'Refinery Engineer',
  ],
  'Data Science & AI': [
    'Data Scientist',
    'Machine Learning Engineer',
    'Data Analyst',
    'AI Research Engineer',
    'NLP Engineer',
    'Computer Vision Engineer',
    'Business Intelligence Analyst',
    'MLOps Engineer',
  ],
  'Production & Industrial': [
    'Industrial Engineer',
    'Production Engineer',
    'Manufacturing Engineer',
    'Supply Chain Analyst',
    'Operations Engineer',
    'Lean/Six Sigma Engineer',
    'Quality Assurance Engineer',
    'Plant Planning Engineer',
  ],
  Biotechnology: [
    'Biotech Research Associate',
    'Bioinformatics Analyst',
    'Quality Control Analyst',
    'Clinical Research Associate',
    'Regulatory Affairs Associate',
    'Bioprocess Engineer',
    'Microbiologist',
    'Medical Writing Associate',
  ],
  Other: [],
};

// Department roles first, then campus-wide roles, de-duplicated.
export function getRolesForDepartment(department?: string | null): string[] {
  const deptRoles = ROLES_BY_DEPARTMENT[department || ''] || [];
  return [...deptRoles, ...CROSS_DISCIPLINARY_ROLES.filter((r) => !deptRoles.includes(r))];
}

// Sensible default when a student has not picked a target yet.
export function getDefaultRoleForDepartment(department?: string | null): string {
  return ROLES_BY_DEPARTMENT[department || '']?.[0] || 'Graduate Engineer Trainee';
}
