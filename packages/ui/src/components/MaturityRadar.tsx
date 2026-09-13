import { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Badge } from './Badge';
import { useTheme } from '../theme/ThemeContext';

export interface MaturityDimensionScore {

  id: string;
  name: string;
  shortName?: string;
  score?: number;
  targetScore?: number;
  level?: string;
  confidence?: string;
  reviewStatus?: string;
  rationale?: string;
  evidenceCount?: number;
}

export interface MaturityRadarProps {
  dimensions: MaturityDimensionScore[];
  onSelectDimension?: (dimension: MaturityDimensionScore) => void;
  selectedDimensionId?: string | null;
  height?: number;
  showTargetBenchmark?: boolean;
}

interface MaturityRadarDatum {
  id: string;
  dimension: string;
  fullName: string;
  currentScore: number;
  targetScore: number;
  level: string;
  confidence: string;
  reviewStatus: string;
  rationale?: string;
  raw: MaturityDimensionScore;
}

interface MaturityTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: MaturityRadarDatum }>;
}

interface MaturityRadarClickEvent {
  activePayload?: Array<{ payload?: { raw?: MaturityDimensionScore } }>;
}

const levelNames = ['Reactive', 'Developing', 'Controlled', 'Integrated', 'Optimised'];

function isMaturityRadarClickEvent(
  event: unknown,
): event is MaturityRadarClickEvent {
  return typeof event === 'object' && event !== null && 'activePayload' in event;
}

export function MaturityRadar({
  dimensions,
  onSelectDimension,
  height = 380,
  showTargetBenchmark = true,
}: MaturityRadarProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const chartData = useMemo<MaturityRadarDatum[]>(() => {
    return dimensions.map((d) => {
      // Shorten name if very long for radar axis
      const shortLabel =
        d.shortName ||
        (d.name.length > 18 ? `${d.name.slice(0, 16)}...` : d.name);

      return {
        id: d.id,
        dimension: shortLabel,
        fullName: d.name,
        currentScore: d.score ?? 0,
        targetScore: d.targetScore ?? 4,
        level: d.level ?? (d.score ? levelNames[d.score - 1] : 'Unscored'),
        confidence: d.confidence ?? 'medium',
        reviewStatus: d.reviewStatus ?? 'draft',
        rationale: d.rationale,
        raw: d,
      };
    });
  }, [dimensions]);

  const CustomTooltip = ({ active, payload }: MaturityTooltipProps) => {
    const data = payload?.[0]?.payload;
    if (active && data) {
      return (
        <div className="fabric-radar-tooltip">
          <div className="radar-tooltip-title">{data.fullName}</div>
          <div className="radar-tooltip-metric">
            <span className="radar-tooltip-label">Current Score:</span>
            <strong>{data.currentScore > 0 ? `${data.currentScore} / 5` : 'Unscored'}</strong>
          </div>
          {data.currentScore > 0 && (
            <div className="radar-tooltip-metric">
              <span className="radar-tooltip-label">Maturity Level:</span>
              <span className="radar-tooltip-badge">{data.level}</span>
            </div>
          )}
          {showTargetBenchmark && (
            <div className="radar-tooltip-metric">
              <span className="radar-tooltip-label">Target State:</span>
              <span>{data.targetScore} / 5</span>
            </div>
          )}
          {data.rationale && (
            <div className="radar-tooltip-rationale">{data.rationale}</div>
          )}
        </div>
      );
    }
    return null;
  };

  const gridColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(16, 22, 29, 0.12)';
  const labelColor = isDark ? '#e2e8f0' : '#334155';
  const radiusStroke = isDark ? 'rgba(255, 255, 255, 0.25)' : '#94a3b8';
  const radiusTick = isDark ? '#94a3b8' : '#64748b';
  const accentColor = isDark ? '#8b5cf6' : '#1d7f73';
  const accentHover = isDark ? '#a78bfa' : '#16695f';

  return (
    <div className="fabric-radar-wrapper">
      <div className="fabric-radar-container" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={chartData}
            margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
            onClick={(event: unknown) => {
              if (!onSelectDimension || !isMaturityRadarClickEvent(event)) {
                return;
              }

              const dimension = event.activePayload?.[0]?.payload?.raw;
              if (dimension) {
                onSelectDimension(dimension);
              }
            }}
          >
            <PolarGrid stroke={gridColor} strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: labelColor, fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              tickCount={6}
              stroke={radiusStroke}
              tick={{ fill: radiusTick, fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 10, fontSize: 12, fontWeight: 600 }}
            />
            {showTargetBenchmark && (
              <Radar
                name="Target Benchmark"
                dataKey="targetScore"
                stroke="#94a3b8"
                fill="#94a3b8"
                fillOpacity={isDark ? 0.2 : 0.15}
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
            )}
            <Radar
              name="Assessed Maturity"
              dataKey="currentScore"
              stroke={accentColor}
              fill={accentColor}
              fillOpacity={0.4}
              strokeWidth={2.5}
              dot={{ r: 4, fill: accentColor, stroke: isDark ? '#000000' : '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: accentHover, stroke: isDark ? '#000000' : '#ffffff', strokeWidth: 2 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MaturityScorecardVisualizer({
  dimensions,
  onSelectDimension,
  selectedDimensionId,
}: {
  dimensions: MaturityDimensionScore[];
  onSelectDimension?: (dim: MaturityDimensionScore) => void;
  selectedDimensionId?: string | null;
}) {
  return (
    <div className="maturity-scorecard-grid">
      {dimensions.map((dim) => {
        const isSelected = selectedDimensionId === dim.id;
        const currentScore = dim.score ?? 0;

        return (
          <div
            key={dim.id}
            className={`maturity-score-card ${isSelected ? 'is-selected' : ''}`}
            onClick={() => onSelectDimension && onSelectDimension(dim)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectDimension && onSelectDimension(dim);
              }
            }}
          >
            <div className="maturity-score-card-header">
              <div className="maturity-score-card-title">{dim.name}</div>
              {dim.level ? (
                <Badge tone={currentScore >= 4 ? 'success' : currentScore >= 2 ? 'accent' : 'warning'}>
                  {dim.level}
                </Badge>
              ) : (
                <Badge tone="neutral">Unscored</Badge>
              )}
            </div>

            <div className="maturity-bar-track">
              {[1, 2, 3, 4, 5].map((lvl) => {
                const isFilled = lvl <= currentScore;
                const isTarget = lvl === (dim.targetScore ?? 4);

                let fillClass = '';
                if (isFilled) {
                  if (currentScore >= 4) fillClass = 'is-high';
                  else if (currentScore >= 3) fillClass = 'is-medium';
                  else fillClass = 'is-low';
                }

                return (
                  <div
                    key={lvl}
                    className={`maturity-bar-segment ${fillClass} ${isTarget ? 'is-target' : ''}`}
                    title={`Level ${lvl}: ${levelNames[lvl - 1]}`}
                  >
                    <span className="maturity-segment-label">{lvl}</span>
                  </div>
                );
              })}
            </div>

            <div className="maturity-card-footer">
              <span className="maturity-confidence">
                Confidence: <strong>{dim.confidence || 'medium'}</strong>
              </span>
              <span className="maturity-review-badge">
                {dim.reviewStatus || 'draft'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
