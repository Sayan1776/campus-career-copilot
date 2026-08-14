import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface ResumeAnalysis {
  overall_score: number;
  extracted_skills: string[];
  skill_gaps: { skill: string; severity: 'low' | 'medium' | 'high' }[];
  summary: string;
}

const SYSTEM_PROMPT = `You are a resume analysis engine for a campus placement platform.
Given a resume's raw text and a target job role, evaluate the resume and
return ONLY a JSON object with this exact shape, no markdown, no preamble:

{
  "overall_score": <integer 0-100>,
  "extracted_skills": [<string>, ...],
  "skill_gaps": [{ "skill": <string>, "severity": "low" | "medium" | "high" }, ...],
  "summary": <string, 2-3 sentences>
}

Score based on: relevance to target role, clarity, quantified impact,
project depth, and completeness. skill_gaps should list skills expected
for the target role that are missing or weak in the resume, ranked by
severity. Be specific with skill names (e.g. "System Design", "SQL
optimization"), not generic ones.`;

export async function analyzeResume(
  resumeText: string,
  targetRole: string
): Promise<ResumeAnalysis> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Target role: ${targetRole}\n\nResume text:\n${resumeText.slice(0, 12000)}`,
      },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('Groq returned an empty response');

  let parsed: ResumeAnalysis;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Groq response was not valid JSON');
  }

  // Minimal shape validation so a malformed response fails loudly instead
  // of silently corrupting the resumes table.
  if (
    typeof parsed.overall_score !== 'number' ||
    !Array.isArray(parsed.extracted_skills) ||
    !Array.isArray(parsed.skill_gaps)
  ) {
    throw new Error('Groq response did not match expected schema');
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

const JOURNEY_SYSTEM_PROMPT = `You are an expert technical mentor and placement coach for college students.
Given a target skill and the student's target career role, generate a comprehensive 3-step learning journey to help them master this skill gap.
Return ONLY a JSON object matching this schema, no markdown code fence, no preamble:

{
  "skill": "<string>",
  "overview": "<string, 1-2 sentence overview of why this skill is vital for the target role>",
  "estimatedHours": <number between 2 and 10>,
  "steps": [
    {
      "stepNumber": 1,
      "type": "concept",
      "title": "<Concise step title>",
      "description": "<What they will learn>",
      "content": "<Detailed key concepts, foundational principles, and best practices explained clearly in 2-3 paragraphs>",
      "resourceLinks": [
        { "title": "<Resource or Documentation Title>", "url": "<clean URL e.g. official docs / free tutorials>" }
      ],
      "completed": false
    },
    {
      "stepNumber": 2,
      "type": "challenge",
      "title": "<Hands-on Project Challenge Title>",
      "description": "<Practical implementation task description>",
      "content": "<Step-by-step implementation guide or code challenge specification to build a mini-project showcasing this skill>",
      "completed": false
    },
    {
      "stepNumber": 3,
      "type": "quiz",
      "title": "<Interactive Knowledge Check>",
      "description": "<2 scenario-based quiz questions to verify concept mastery>",
      "content": "<Brief quiz intro>",
      "quizQuestions": [
        {
          "question": "<Practical technical question 1>",
          "options": ["<Option A>", "<Option B>", "<Option C>", "<Option D>"],
          "correctIndex": <0, 1, 2, or 3>,
          "explanation": "<Why this answer is correct>"
        },
        {
          "question": "<Practical technical question 2>",
          "options": ["<Option A>", "<Option B>", "<Option C>", "<Option D>"],
          "correctIndex": <0, 1, 2, or 3>,
          "explanation": "<Why this answer is correct>"
        }
      ],
      "completed": false
    }
  ]
}`;

export async function generateSkillJourney(
  skill: string,
  targetRole: string = 'Software Engineer'
): Promise<GeneratedJourney> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: JOURNEY_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Target Skill: ${skill}\nTarget Role: ${targetRole}\nGenerate a practical, actionable placement-focused journey.`,
      },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('Groq returned empty response for skill journey');

  let parsed: GeneratedJourney;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Failed to parse skill journey JSON');
  }

  if (!parsed.steps || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
    throw new Error('Generated journey missing required steps array');
  }

  return parsed;
}
