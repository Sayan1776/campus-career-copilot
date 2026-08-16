import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { analyzeResume } from '@/lib/ai/client';
import { sendPushToTokens } from '@/lib/firebase/send-push';

export const runtime = 'nodejs';

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // Lazy-required because pdf-parse touches the filesystem on import in a
  // way that doesn't play well with being top-level in some bundlers.
  const pdfParse = (await import('pdf-parse')).default;
  const result = await pdfParse(buffer);
  return result.text;
}

export async function POST(req: NextRequest) {
  // 1. Auth: identify the caller from the session cookie, don't trust a
  // client-supplied user_id.
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
    return NextResponse.json({ error: 'only students can upload resumes' }, { status: 403 });
  }

  // 2. Parse the multipart form
  const formData = await req.formData();
  const file = formData.get('resume') as File | null;
  const targetRole = (formData.get('targetRole') as string | null) || 'Software Engineer';

  if (!file) {
    return NextResponse.json({ error: 'no file uploaded' }, { status: 400 });
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'only PDF files are supported' }, { status: 400 });
  }

  // 3. Insert a "processing" row up front so the UI can show status even
  // if the Groq call is slow or fails partway.
  const { data: resumeRow, error: insertError } = await supabaseAdmin
    .from('resumes')
    .insert({
      user_id: uid,
      file_url: file.name,
      status: 'processing',
    })
    .select()
    .single();

  if (insertError || !resumeRow) {
    console.error('Resume insert failed:', insertError?.message, insertError?.details, insertError?.hint);
    return NextResponse.json(
      { error: insertError?.message || 'could not create resume record' },
      { status: 500 }
    );
  }

  try {
    // 4. Extract text, then score with Groq
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPdf(buffer);

    if (!text || text.trim().length < 50) {
      throw new Error('Could not extract readable text from this PDF');
    }

    const analysis = await analyzeResume(text, targetRole);

    // 5. Write the result, mark complete
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('resumes')
      .update({
        overall_score: analysis.overall_score,
        extracted_skills: analysis.extracted_skills,
        skill_gaps: analysis.skill_gaps,
        status: 'complete',
      })
      .eq('id', resumeRow.id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    // Fire a push notification if the student has granted permission.
    // Non-blocking in spirit: we don't fail the request if this fails.
    const { data: userRow } = await supabaseAdmin
      .from('users')
      .select('fcm_token')
      .eq('id', uid)
      .single();

    if (userRow?.fcm_token) {
      await sendPushToTokens(
        [userRow.fcm_token],
        'Resume analysis ready',
        `Your resume scored ${analysis.overall_score}/100 for ${targetRole}.`
      );
    }

    return NextResponse.json({ ok: true, resume: updated, summary: analysis.summary });
  } catch (err: any) {
    // Mark the row failed rather than leaving it stuck on "processing" forever
    await supabaseAdmin
      .from('resumes')
      .update({ status: 'failed' })
      .eq('id', resumeRow.id);

    return NextResponse.json(
      { error: err.message || 'analysis failed' },
      { status: 500 }
    );
  }
}
