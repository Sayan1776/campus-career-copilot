'use client';

/**
 * TwoFactorSetup — Firebase TOTP MFA enrollment UI.
 *
 * Flow:
 *   1. User clicks "Enable 2FA"
 *   2. We call multiFactor(user).getSession() + TotpMultiFactorGenerator.generateSecret()
 *   3. Display the QR code (or manual key) for Google Authenticator / any TOTP app
 *   4. User enters a 6-digit OTP from their app
 *   5. We enroll via multiFactor(user).enroll(assertion, displayName)
 *   6. Show success state
 *
 * Firebase TOTP MFA is GA since Firebase JS SDK v10.
 */

import { useState } from 'react';
import {
  multiFactor,
  TotpMultiFactorGenerator,
  TotpSecret,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { Shield, ShieldCheck, ShieldOff, QrCode } from 'lucide-react';
import { cn } from '@/lib/cn';

type Step = 'idle' | 'generating' | 'qr' | 'verifying' | 'done' | 'error';

interface Props {
  isEnrolled: boolean;
  onEnrolled?: () => void;
}

export default function TwoFactorSetup({ isEnrolled, onEnrolled }: Props) {
  const [step, setStep] = useState<Step>('idle');
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function startEnrollment() {
    const user = auth.currentUser;
    if (!user) return;
    setStep('generating');
    setErrorMsg('');
    try {
      const session = await multiFactor(user).getSession();
      const secret = await TotpMultiFactorGenerator.generateSecret(session);
      const url = secret.generateQrCodeUrl(
        user.email ?? 'user',
        'Campus Career Copilot'
      );
      setTotpSecret(secret);
      setQrUrl(url);
      setStep('qr');
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Failed to generate TOTP secret');
      setStep('error');
    }
  }

  async function verifyAndEnroll() {
    const user = auth.currentUser;
    if (!user || !totpSecret) return;
    if (otp.length < 6) {
      setErrorMsg('Enter the 6-digit code from your authenticator app.');
      return;
    }
    setStep('verifying');
    setErrorMsg('');
    try {
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(totpSecret, otp);
      await multiFactor(user).enroll(assertion, 'Authenticator App');
      setStep('done');
      onEnrolled?.();
    } catch (e: any) {
      setErrorMsg('Invalid code — check your authenticator app and try again.');
      setStep('qr'); // let them retry
    }
  }

  const isVerifying = step === 'verifying';

  if (isEnrolled || step === 'done') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-pass/40 bg-pass-wash px-4 py-4">
        <ShieldCheck className="h-5 w-5 shrink-0 text-pass-deep" strokeWidth={1.8} />
        <div>
          <p className="text-sm font-bold text-pass-deep">2FA is active</p>
          <p className="mt-0.5 text-xs text-ink-soft">
            Your account requires a TOTP code at every sign-in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-ink-line bg-sheet-inset px-4 py-4">
        <Shield className="h-5 w-5 shrink-0 text-ink-soft" strokeWidth={1.8} />
        <div className="flex-1">
          <p className="text-sm font-bold text-ink">Two-factor authentication</p>
          <p className="mt-0.5 text-xs text-ink-soft">
            Use Google Authenticator, Authy, or any TOTP app to add a second layer of protection.
          </p>
        </div>
        {step === 'idle' && (
          <Button variant="outline" size="sm" onClick={startEnrollment}>
            <QrCode className="h-3.5 w-3.5" strokeWidth={1.8} />
            Enable 2FA
          </Button>
        )}
      </div>

      {step === 'generating' && (
        <p className="text-xs text-ink-soft">Generating secret key…</p>
      )}

      {step === 'qr' && totpSecret && (
        <div className="rounded-lg border border-ink-line bg-white p-5 space-y-4">
          <p className="text-sm font-bold text-ink">
            Scan the QR code with your authenticator app
          </p>
          <div className="flex justify-center">
            {/* Use Google Charts API to render the QR code — no extra dependency */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://chart.googleapis.com/chart?cht=qr&chs=220x220&chl=${encodeURIComponent(qrUrl)}`}
              alt="TOTP QR code"
              width={220}
              height={220}
              className="rounded-md border border-ink-line"
            />
          </div>

          <details className="text-xs text-ink-soft">
            <summary className="cursor-pointer font-medium">Can&apos;t scan? Enter manually</summary>
            <code className="mt-2 block break-all rounded bg-sheet-inset px-3 py-2 font-mono text-[11px] text-ink">
              {totpSecret.secretKey}
            </code>
          </details>

          <Field label="Enter 6-digit code from your app" htmlFor="totp-otp">
            <Input
              id="totp-otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              autoComplete="one-time-code"
            />
          </Field>

          {errorMsg && (
            <p role="alert" className="text-xs font-medium text-instrument-deep">
              {errorMsg}
            </p>
          )}

          <Button onClick={verifyAndEnroll} loading={isVerifying} className="w-full">
            {isVerifying ? 'Verifying…' : 'Activate 2FA'}
          </Button>
        </div>
      )}

      {step === 'error' && (
        <div className="flex items-center gap-2 rounded-lg border border-instrument/40 bg-instrument-wash px-4 py-3 text-sm text-instrument-deep">
          <ShieldOff className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          {errorMsg || 'Something went wrong. Please try again.'}
        </div>
      )}
    </div>
  );
}
