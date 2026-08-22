import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';

// Lazily initialize the Gemini API client so the key is read at call time,
// not at module-load time (when Next.js may not have injected env vars yet).
let _genAI: GoogleGenerativeAI | null = null;
function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    const key = (process.env.GEMINI_API_KEY || '').trim();
    if (!key) throw new Error('GEMINI_API_KEY is not set');
    _genAI = new GoogleGenerativeAI(key);
  }
  return _genAI;
}

let _genAIResumeBuilder: GoogleGenerativeAI | null = null;
function getResumeBuilderGenAI(): GoogleGenerativeAI {
  if (!_genAIResumeBuilder) {
    const key = (process.env.GEMINI_RESUME_BUILDER_API_KEY || process.env.GEMINI_API_KEY || '').trim();
    if (!key) throw new Error('GEMINI_RESUME_BUILDER_API_KEY is not set');
    _genAIResumeBuilder = new GoogleGenerativeAI(key);
  }
  return _genAIResumeBuilder;
}

export interface ResumeAnalysis {
  overall_score: number;
  extracted_skills: string[];
  skill_gaps: { skill: string; severity: 'low' | 'medium' | 'high' }[];
  summary: string;
}

const SYSTEM_PROMPT_RESUME = `You are a resume analysis engine for a campus placement platform.
Given a resume's raw text, the student's engineering department (branch of
study), and a target job role, evaluate the resume and return a JSON object.

Score based on: relevance to target role, clarity, quantified impact,
project depth, and completeness. skill_gaps should list skills expected
for the target role that are missing or weak in the resume, ranked by
severity. Evaluate the student against the standards employers apply when
hiring graduates of the given department for that role — the expected
skills differ sharply by branch (e.g. CAD and FEA tools for Mechanical,
STAAD Pro and site planning for Civil, VLSI and embedded toolchains for
Electronics, SQL and system design for CSE). Be specific
with skill and tool names actually used in that industry, not generic ones.`;

const resumeSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    overall_score: { type: SchemaType.INTEGER, description: 'Score between 0 and 100' },
    extracted_skills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'List of specific technical skills found in the resume',
    },
    skill_gaps: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          skill: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING, description: 'Must be "low", "medium", or "high"' },
        },
        required: ['skill', 'severity'],
      },
      description: 'Skills missing for the target role',
    },
    summary: { type: SchemaType.STRING, description: '2-3 sentence overall summary' },
  },
  required: ['overall_score', 'extracted_skills', 'skill_gaps', 'summary'],
};

export async function analyzeResume(
  resumeText: string,
  targetRole: string,
  department?: string | null
): Promise<ResumeAnalysis> {
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
    systemInstruction: SYSTEM_PROMPT_RESUME,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: resumeSchema,
      temperature: 0.2,
    },
  });

  const prompt = `Department (branch of study): ${department || 'Not specified'}\nTarget role: ${targetRole}\n\nResume text:\n${resumeText.slice(0, 12000)}`;
  
  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  
  if (!raw) throw new Error('Gemini returned an empty response');

  let parsed: ResumeAnalysis;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Gemini response was not valid JSON');
  }

  return parsed;
}

export interface JourneyStep {
  stepNumber: number;
  type: 'concept' | 'challenge' | 'quiz';
  title: string;
  description: string;
  content: string;
  resourceLinks?: { title: string; url: string }[];
  quizQuestions?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  completed: boolean;
}

export interface GeneratedJourney {
  skill: string;
  overview: string;
  estimatedHours: number;
  steps: JourneyStep[];
}

const JOURNEY_SYSTEM_PROMPT = `You are an expert technical mentor and placement coach for college students
across every engineering department (CSE, ME, CE, EE, ECE, Chemical, and others).
Given a target skill, the student's department, and their target career
role, generate a comprehensive 4-step learning journey to help them master
this skill gap. All explanations, examples, and resources must be relevant
to the student's branch and target industry.

The 4 steps MUST strictly follow this structure:
Step 1 ("concept"): Introduction, foundation, and provide notes/links from GitHub about the particular skill.
Step 2 ("course"): Recommend completing one specific course related to the skill from a reputable provider (e.g. Coursera, Udemy, edX). Include a link to the course or provider.
Step 3 ("challenge"): A practical implementation task or project.
Step 4 ("quiz"): A full exam of Multiple Choice Questions (generate 5-10 questions) to thoroughly test the skill.

CRITICAL: For video "resourceLinks", you MUST generate YouTube SEARCH URLs, not direct video links.
Format: https://www.youtube.com/results?search_query=<url-encoded+search+terms>
Do NOT generate direct youtube.com/watch links.
You may generate direct links to official documentation, GitHub repositories, or reputable course providers (e.g. coursera.org, udemy.com).
Ensure the JSON matches the requested schema exactly.`;

const journeySchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    skill: { type: SchemaType.STRING },
    overview: { type: SchemaType.STRING, description: '1-2 sentence overview' },
    estimatedHours: { type: SchemaType.NUMBER, description: 'Between 2 and 10' },
    steps: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          stepNumber: { type: SchemaType.INTEGER },
          type: { type: SchemaType.STRING, description: 'Must be "concept", "course", "challenge", or "quiz"' },
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          content: { type: SchemaType.STRING, description: 'Detailed content, paragraphs' },
          resourceLinks: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING },
                url: { type: SchemaType.STRING, description: 'YouTube search URL (youtube.com/results?search_query=...) or official docs link' },
              },
              required: ['title', 'url'],
            },
          },
          quizQuestions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                question: { type: SchemaType.STRING },
                options: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                },
                correctIndex: { type: SchemaType.INTEGER },
                explanation: { type: SchemaType.STRING },
              },
              required: ['question', 'options', 'correctIndex', 'explanation'],
            },
          },
          completed: { type: SchemaType.BOOLEAN },
        },
        required: ['stepNumber', 'type', 'title', 'description', 'content', 'completed'],
      },
    },
  },
  required: ['skill', 'overview', 'estimatedHours', 'steps'],
};

export async function generateSkillJourney(
  skill: string,
  targetRole: string,
  department?: string | null
): Promise<GeneratedJourney> {
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
    systemInstruction: JOURNEY_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: journeySchema,
      temperature: 0.3,
    },
  });

  const prompt = `Target Skill: ${skill}\nStudent Department: ${department || 'Not specified'}\nTarget Role: ${targetRole}\nGenerate a practical, actionable placement-focused journey for a student of this department, with resource links relevant to this branch and industry.`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  if (!raw) throw new Error('Gemini returned empty response for skill journey');

  let parsed: GeneratedJourney;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Failed to parse skill journey JSON');
  }

  return parsed;
}

const LATEX_RESUME_SYSTEM_PROMPT = `You are an expert resume writer and LaTeX formatter.
Given a JSON payload representing a student's resume data (personal info, experience, education, skills, projects, etc.), generate a complete, standalone, compilable LaTeX document.

Follow these strict constraints:
1. Output ONLY the raw LaTeX code. Do NOT wrap it in markdown code blocks (\`\`\`latex ... \`\`\`). No introductory or concluding text.
2. Use a standard, clean, and professional layout (e.g., standard \`article\` class with \`geometry\` for margins, or a simple custom layout).
3. Ensure all LaTeX special characters (%, &, $, #, _, {, }, ~, ^, \\) in the user's data are properly escaped.
4. Structure the document clearly with sections for Objective, Education, Experience, Projects, Technical Skills, and Achievements.
5. If a section in the JSON is empty or missing, simply omit that section in the LaTeX output.
6. Make it single-page optimized if possible.
`;

export async function generateResumeLatex(resumeData: any): Promise<string> {
  const model = getResumeBuilderGenAI().getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
    systemInstruction: LATEX_RESUME_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.1, // Low temp for structured, predictable output
    },
  });

  const prompt = `Please generate a LaTeX resume using the following data:\n\n${JSON.stringify(resumeData, null, 2)}`;
  
  const result = await model.generateContent(prompt);
  let latex = result.response.text();
  
  // Clean up if Gemini accidentally includes markdown wrappers despite the prompt
  if (latex.startsWith('\`\`\`latex')) {
    latex = latex.replace(/^\`\`\`latex\n/, '').replace(/\n\`\`\`$/, '');
  } else if (latex.startsWith('\`\`\`')) {
    latex = latex.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
  }

  return latex.trim();
}
