'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { chart } from '@/lib/charts';

interface SkillGap {
  skill: string;
  severity: 'high' | 'medium' | 'low';
}

interface Props {
  extractedSkills: string[];
  skillGaps: SkillGap[];
}

const SEVERITY_SCORE: Record<string, number> = { high: 20, medium: 50, low: 75 };

export default function SkillRadarChart({ extractedSkills, skillGaps }: Props) {
  // Build one combined axis: strong skills score high, gaps score low
  // proportional to severity. A single 360-degree shape shows both strengths
  // and weaknesses at a glance — more legible on a projector than two lists.
  const strongData = extractedSkills.slice(0, 6).map((skill) => ({
    skill,
    value: 90,
  }));
  const gapData = skillGaps.map((g) => ({
    skill: g.skill,
    value: SEVERITY_SCORE[g.severity] ?? 50,
  }));

  const data = [...strongData, ...gapData];

  if (data.length < 3) {
    // RadarChart needs at least 3 axes to render meaningfully
    return (
      <p className="px-2 py-8 text-center text-sm text-ink-soft">
        Not enough data yet for a radar view — upload another resume to see
        your competency shape.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} outerRadius={110}>
        <PolarGrid stroke={chart.grid} />
        <PolarAngleAxis
          dataKey="skill"
          tick={{
            fontSize: 10,
            fill: chart.axis,
            fontFamily: 'var(--font-mono), ui-monospace, monospace',
          }}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={{
            fontSize: 9,
            fill: chart.axis,
            fontFamily: 'var(--font-mono), ui-monospace, monospace',
          }}
          axisLine={{ stroke: chart.grid }}
        />
        <Tooltip
          contentStyle={{
            background: chart.sheet,
            border: `1px solid ${chart.grid}`,
            borderRadius: 8,
            fontSize: 12,
            color: chart.ink,
            boxShadow: '0 4px 8px rgba(22,35,59,.08), 0 14px 36px rgba(22,35,59,.12)',
          }}
          formatter={(value: number) => [`${value}`, 'Reading']}
        />
        <Radar
          dataKey="value"
          stroke={chart.instrument}
          strokeWidth={1.75}
          fill={chart.instrument}
          fillOpacity={0.12}
          isAnimationActive
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
