import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateSkillJourney, JourneyStep } from '@/lib/groq/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getAuthContext(req: NextRequest) {
  const sessionCookie = req.cookies.get('session')?.value;
  if (!sessionCookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid, role: decoded.role as string | undefined };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const auth = await getAuthContext(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetUserId = (auth.role === 'tpo' && searchParams.get('userId')) || auth.uid;

  const { data: journeys, error } = await supabaseAdmin
    .from('skill_journeys')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also get the latest resume to identify any unfilled skill gaps
  const { data: resumes } = await supabaseAdmin
    .from('resumes')
    .select('skill_gaps, extracted_skills, overall_score')
    .eq('user_id', targetUserId)
    .eq('status', 'complete')
    .order('uploaded_at', { ascending: false })
    .limit(1);

  const latestResume = resumes?.[0];

  return NextResponse.json({
    journeys: journeys || [],
    availableGaps: latestResume?.skill_gaps || [],
    extractedSkills: latestResume?.extracted_skills || [],
    overallScore: latestResume?.overall_score || 0,
  });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext(req);
  if (!auth || auth.role !== 'student') {
    return NextResponse.json({ error: 'Only students can create and update journeys' }, { status: 403 });
  }

  const body = await req.json();
  const { action } = body;

  if (action === 'generate') {
    const { skill, severity = 'medium' } = body;
    if (!skill) {
      return NextResponse.json({ error: 'Skill is required' }, { status: 400 });
    }

    // Check if journey already exists
    const { data: existing } = await supabaseAdmin
      .from('skill_journeys')
      .select('id')
      .eq('user_id', auth.uid)
      .eq('skill', skill)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'A journey for this skill already exists', journeyId: existing.id }, { status: 400 });
    }

    // Get user's target role
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('target_role')
      .eq('id', auth.uid)
      .single();

    const targetRole = user?.target_role || 'Software Engineer';

    try {
      const generated = await generateSkillJourney(skill, targetRole);

      const { data: created, error: insertErr } = await supabaseAdmin
        .from('skill_journeys')
        .insert({
          user_id: auth.uid,
          skill: generated.skill || skill,
          severity,
          steps: generated.steps,
          completed_steps: 0,
          total_steps: generated.steps.length,
          status: 'in_progress',
        })
        .select()
        .single();

      if (insertErr) throw new Error(insertErr.message);

      return NextResponse.json({ ok: true, journey: created });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'Failed to generate journey' }, { status: 500 });
    }
  }

  if (action === 'toggle_step') {
    const { journeyId, stepNumber, completed } = body;
    if (!journeyId || typeof stepNumber !== 'number') {
      return NextResponse.json({ error: 'journeyId and stepNumber are required' }, { status: 400 });
    }

    const { data: journey, error: fetchErr } = await supabaseAdmin
      .from('skill_journeys')
      .select('*')
      .eq('id', journeyId)
      .eq('user_id', auth.uid)
      .single();

    if (fetchErr || !journey) {
      return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
    }

    const steps = (journey.steps as JourneyStep[]).map((step) => {
      if (step.stepNumber === stepNumber) {
        return { ...step, completed };
      }
      return step;
    });

    const completedCount = steps.filter((s) => s.completed).length;
    const isAllComplete = completedCount === steps.length;

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('skill_journeys')
      .update({
        steps,
        completed_steps: completedCount,
        status: isAllComplete ? 'completed' : 'in_progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', journeyId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, journey: updated });
  }

  if (action === 'verify_quiz') {
    const { journeyId, answers } = body; // answers: { [questionIndex: number]: number }
    if (!journeyId || !answers) {
      return NextResponse.json({ error: 'journeyId and answers required' }, { status: 400 });
    }

    const { data: journey, error: fetchErr } = await supabaseAdmin
      .from('skill_journeys')
      .select('*')
      .eq('id', journeyId)
      .eq('user_id', auth.uid)
      .single();

    if (fetchErr || !journey) {
      return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
    }

    const steps = journey.steps as JourneyStep[];
    const quizStep = steps.find((s) => s.type === 'quiz');

    if (!quizStep || !quizStep.quizQuestions) {
      return NextResponse.json({ error: 'No quiz questions in this journey' }, { status: 400 });
    }

    let allCorrect = true;
    const feedback: { questionIndex: number; isCorrect: boolean; explanation: string }[] = [];

    quizStep.quizQuestions.forEach((q, idx) => {
      const isCorrect = answers[idx] === q.correctIndex;
      if (!isCorrect) allCorrect = false;
      feedback.push({
        questionIndex: idx,
        isCorrect,
        explanation: q.explanation,
      });
    });

    if (allCorrect) {
      // Mark quiz step as completed
      const updatedSteps = steps.map((s) => (s.type === 'quiz' ? { ...s, completed: true } : s));
      const completedCount = updatedSteps.filter((s) => s.completed).length;
      const isAllComplete = completedCount === updatedSteps.length;

      const { data: updated } = await supabaseAdmin
        .from('skill_journeys')
        .update({
          steps: updatedSteps,
          completed_steps: completedCount,
          status: isAllComplete ? 'completed' : 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', journeyId)
        .select()
        .single();

      return NextResponse.json({
        ok: true,
        passed: true,
        feedback,
        journey: updated,
      });
    }

    return NextResponse.json({
      ok: true,
      passed: false,
      feedback,
      journey,
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
