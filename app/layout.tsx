import './globals.css';
import type { Metadata } from 'next';
import NotificationListener from './NotificationListener';

export const metadata: Metadata = {
  title: 'Campus Career Copilot',
  description: 'AI-powered campus placement assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div hidden data-impeccable-contract="abb4a6a6">
          THESIS: Campus placement as a live dispatch board, refusing the old neon bento dashboard.
          OWN-WORLD: ivory paper, navy command ink, signal-yellow actions, coral alerts, mint success, crisp rails, brackets, and dense operations panels.
          STORY: students, TPOs, and recruiters see readiness, act on gaps, and move the campus pipeline forward.
          FIRST VIEWPORT: product identity, live readiness instrumentation, and the primary portal action share the first screen with operational proof visible immediately.
          FORM: grounded candidate 3, seed abb4a6a6. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
        </div>
        <NotificationListener />
        {children}
      </body>
    </html>
  );
}