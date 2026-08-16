import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { generateResumeLatex } from '@/lib/ai/client';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // 1. Auth: identify the caller from the session cookie
  const sessionCookie = req.cookies.get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
  }

  let uid: string;
  let role: string | undefined;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    uid = decoded.uid;
    role = decoded.role as string | undefined;
  } catch {
    return NextResponse.json({ error: 'invalid session' }, { status: 401 });
  }

  if (role !== 'student') {
    return NextResponse.json({ error: 'only students can build resumes' }, { status: 403 });
  }

  try {
    // 2. Parse the JSON body containing resume data
    const resumeData = await req.json();

    if (!resumeData || typeof resumeData !== 'object') {
      return NextResponse.json({ error: 'invalid resume data provided' }, { status: 400 });
    }

    // 3. Generate LaTeX using AI
    const latex = await generateResumeLatex(resumeData);

    // Return the raw LaTeX code
    return NextResponse.json({ ok: true, latex });
  } catch (err: any) {
    console.error('Error generating resume LaTeX:', err);
    return NextResponse.json(
      { error: err.message || 'generation failed' },
      { status: 500 }
    );
  }
}
