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
  // proportional to severity. This gives a single 360-degree shape showing
  // both strengths and weaknesses at a glance, which is more useful on a
  // projector than two separate lists.
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
      <p className="text-sm text-gray-500">
        Not enough data yet for a radar view — upload another resume to see
        your competency shape.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} outerRadius={110}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: '#374151' }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
        <Tooltip />
        <Radar
          dataKey="value"
          stroke="#0B3D91"
          fill="#0B3D91"
          fillOpacity={0.35}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
