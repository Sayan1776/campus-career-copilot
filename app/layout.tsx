import './globals.css';
import type { Metadata } from 'next';
import { sans, mono } from '@/lib/fonts';
import { Providers } from '@/components/ui/Providers';

export const metadata: Metadata = {
  title: {
    default: 'Campus Career Copilot',
    template: '%s · Campus Career Copilot',
  },
  description:
    'AI-powered campus placement readiness — resume diagnosis, skill journeys, and cohort analytics on one instrument sheet.',
};

const directionContract = `
THESIS: Placement readiness as calibrated measurement on engineering instrument sheets — refusing both the neon bento dashboard and the generic SaaS admin.
OWN-WORLD: fine graph-paper ground (8px minor / 40px major grid), white instruments with hairline ink edges, ink navy #16233B, one instrument red #E8501A for measurement and action, pass green, mono readings and serial numbers, tick-marked progress, title blocks.
STORY: students read readiness like an instrument, TPOs watch a bank of gauges; diagnosis always resolves into a next action.
FIRST VIEWPORT: student dashboard opens as an instrument panel — title block, large mono readiness reading, radar instrument on the grid, measured gap list with severity marks.
FORM: Instrument Sheet, first of a four-direction hand (Registry, Notice Board, Answer Sheet declined), user-selected; seed ins-84d2. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <div
          hidden
          style={{ display: 'none' }}
          dangerouslySetInnerHTML={{ __html: `<!--${directionContract}-->` }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
