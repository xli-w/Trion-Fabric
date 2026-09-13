import { useMemo, useState } from 'react';
import { Badge } from './Badge';
import { Zap, Target, Sliders, AlertTriangle, ArrowUpRight, Search, Check } from 'lucide-react';

export interface MatrixOpportunity {
  id: string;
  title: string;
  type?: string;
  businessImpact?: string | number;
  implementationEffort?: string | number;
  priorityCategory?: string;
  priorityScore?: number;
  approvalStatus?: string;
  estimatedSaving?: string;
  rationale?: string;
}

export interface OpportunityMatrixProps {
  opportunities: MatrixOpportunity[];
  onSelectOpportunity?: (opportunity: MatrixOpportunity) => void;
  selectedOpportunityId?: string | null;
  className?: string;
}

export function OpportunityMatrix({
  opportunities,
  onSelectOpportunity,
  selectedOpportunityId,
  className = '',
}: OpportunityMatrixProps) {
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((op) => {
      const matchesSearch =
        !searchQuery ||
        op.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (op.rationale && op.rationale.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [opportunities, searchQuery]);

  // Categorize opportunities into the 4 quadrants based on impact & effort
  const categorized = useMemo(() => {
    const quickWins: MatrixOpportunity[] = [];
    const strategicProjects: MatrixOpportunity[] = [];
    const incrementalGains: MatrixOpportunity[] = [];
    const reconsider: MatrixOpportunity[] = [];

    filteredOpportunities.forEach((op) => {
      const impactStr = String(op.businessImpact || '').toLowerCase();
      const effortStr = String(op.implementationEffort || '').toLowerCase();
      const category = (op.priorityCategory || '').toLowerCase();

      const isHighImpact =
        impactStr === 'high' ||
        impactStr === 'transformational' ||
        impactStr === 'strategic' ||
        category.includes('quick win') ||
        category.includes('strategic');

      const isHighEffort =
        effortStr === 'high' ||
        effortStr === 'complex' ||
        category.includes('strategic') ||
        category.includes('reconsider');

      if (category.includes('quick win') || (isHighImpact && !isHighEffort)) {
        quickWins.push(op);
      } else if (category.includes('strategic') || (isHighImpact && isHighEffort)) {
        strategicProjects.push(op);
      } else if (category.includes('reconsider') || (!isHighImpact && isHighEffort)) {
        reconsider.push(op);
      } else {
        incrementalGains.push(op);
      }
    });

    return { quickWins, strategicProjects, incrementalGains, reconsider };
  }, [filteredOpportunities]);

  const renderOpportunityPill = (op: MatrixOpportunity) => {
    const isSelected = selectedOpportunityId === op.id;

    return (
      <div
        key={op.id}
        className={`matrix-item-pill ${isSelected ? 'is-selected' : ''}`}
        onClick={() => onSelectOpportunity && onSelectOpportunity(op)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onSelectOpportunity && onSelectOpportunity(op);
          }
        }}
      >
        <div className="matrix-pill-header">
          <span className="matrix-pill-title">{op.title}</span>
          {typeof op.priorityScore === 'number' && (
            <span className="matrix-pill-score" title="Priority Score">
              {op.priorityScore}
            </span>
          )}
        </div>
        <div className="matrix-pill-footer">
          {op.type && <span className="matrix-pill-type">{op.type}</span>}
          {op.estimatedSaving && (
            <span className="matrix-pill-saving">{op.estimatedSaving}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`fabric-matrix-wrapper ${className}`}>
      {/* Matrix Controls */}
      <div className="fabric-matrix-toolbar">
        <div className="matrix-search-box">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search opportunities in matrix..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="matrix-quadrant-filters">
          <button
            type="button"
            className={`matrix-filter-pill ${selectedQuadrant === 'all' ? 'is-active' : ''}`}
            onClick={() => setSelectedQuadrant('all')}
          >
            All Quadrants ({opportunities.length})
          </button>
          <button
            type="button"
            className={`matrix-filter-pill ${selectedQuadrant === 'quick-wins' ? 'is-active' : ''}`}
            onClick={() => setSelectedQuadrant('quick-wins')}
          >
            ⚡ Quick Wins ({categorized.quickWins.length})
          </button>
          <button
            type="button"
            className={`matrix-filter-pill ${selectedQuadrant === 'strategic' ? 'is-active' : ''}`}
            onClick={() => setSelectedQuadrant('strategic')}
          >
            🎯 Strategic Projects ({categorized.strategicProjects.length})
          </button>
          <button
            type="button"
            className={`matrix-filter-pill ${selectedQuadrant === 'incremental' ? 'is-active' : ''}`}
            onClick={() => setSelectedQuadrant('incremental')}
          >
            🔧 Incremental ({categorized.incrementalGains.length})
          </button>
          <button
            type="button"
            className={`matrix-filter-pill ${selectedQuadrant === 'reconsider' ? 'is-active' : ''}`}
            onClick={() => setSelectedQuadrant('reconsider')}
          >
            ⏸ Reconsider ({categorized.reconsider.length})
          </button>
        </div>
      </div>

      {/* 2x2 Grid Visualizer */}
      <div className="fabric-matrix-grid-container">
        {/* Y Axis Label */}
        <div className="matrix-y-axis-label">
          <span>▲ HIGH BUSINESS IMPACT</span>
          <span className="axis-mid">IMPACT</span>
          <span>▼ LOW BUSINESS IMPACT</span>
        </div>

        <div className="fabric-matrix-grid">
          {/* Quadrant 1: Quick Wins (High Impact, Low Effort) */}
          {(selectedQuadrant === 'all' || selectedQuadrant === 'quick-wins') && (
            <div className="matrix-quadrant matrix-quadrant--quick-wins">
              <div className="matrix-quadrant-header">
                <div className="quadrant-title-group">
                  <span className="quadrant-icon">
                    <Zap size={16} />
                  </span>
                  <h4>Quick Wins</h4>
                </div>
                <span className="quadrant-tag">High Impact · Low Effort</span>
              </div>
              <div className="matrix-quadrant-items">
                {categorized.quickWins.length === 0 ? (
                  <div className="quadrant-empty">No quick win opportunities</div>
                ) : (
                  categorized.quickWins.map(renderOpportunityPill)
                )}
              </div>
            </div>
          )}

          {/* Quadrant 2: Strategic Projects (High Impact, High Effort) */}
          {(selectedQuadrant === 'all' || selectedQuadrant === 'strategic') && (
            <div className="matrix-quadrant matrix-quadrant--strategic">
              <div className="matrix-quadrant-header">
                <div className="quadrant-title-group">
                  <span className="quadrant-icon">
                    <Target size={16} />
                  </span>
                  <h4>Strategic Projects</h4>
                </div>
                <span className="quadrant-tag">High Impact · High Effort</span>
              </div>
              <div className="matrix-quadrant-items">
                {categorized.strategicProjects.length === 0 ? (
                  <div className="quadrant-empty">No strategic project opportunities</div>
                ) : (
                  categorized.strategicProjects.map(renderOpportunityPill)
                )}
              </div>
            </div>
          )}

          {/* Quadrant 3: Incremental Gains (Low Impact, Low Effort) */}
          {(selectedQuadrant === 'all' || selectedQuadrant === 'incremental') && (
            <div className="matrix-quadrant matrix-quadrant--incremental">
              <div className="matrix-quadrant-header">
                <div className="quadrant-title-group">
                  <span className="quadrant-icon">
                    <Sliders size={16} />
                  </span>
                  <h4>Incremental / Foundational</h4>
                </div>
                <span className="quadrant-tag">Low Impact · Low Effort</span>
              </div>
              <div className="matrix-quadrant-items">
                {categorized.incrementalGains.length === 0 ? (
                  <div className="quadrant-empty">No incremental opportunities</div>
                ) : (
                  categorized.incrementalGains.map(renderOpportunityPill)
                )}
              </div>
            </div>
          )}

          {/* Quadrant 4: Reconsider / Defer (Low Impact, High Effort) */}
          {(selectedQuadrant === 'all' || selectedQuadrant === 'reconsider') && (
            <div className="matrix-quadrant matrix-quadrant--reconsider">
              <div className="matrix-quadrant-header">
                <div className="quadrant-title-group">
                  <span className="quadrant-icon">
                    <AlertTriangle size={16} />
                  </span>
                  <h4>Reconsider / Defer</h4>
                </div>
                <span className="quadrant-tag">Low Impact · High Effort</span>
              </div>
              <div className="matrix-quadrant-items">
                {categorized.reconsider.length === 0 ? (
                  <div className="quadrant-empty">No deferred opportunities</div>
                ) : (
                  categorized.reconsider.map(renderOpportunityPill)
                )}
              </div>
            </div>
          )}
        </div>

        {/* X Axis Label */}
        <div className="matrix-x-axis-label">
          <span>◀ LOW IMPLEMENTATION EFFORT</span>
          <span className="axis-mid">EFFORT</span>
          <span>HIGH IMPLEMENTATION EFFORT ▶</span>
        </div>
      </div>
    </div>
  );
}
