import { useMemo, useState } from 'react';
import { Badge } from './Badge';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Flag,
  TrendingUp,
  User,
  ChevronRight,
  Filter,
} from 'lucide-react';

export interface TimelineInitiative {
  id: string;
  title: string;
  description?: string;
  phase: string;
  priority: string;
  status: string;
  owner?: string;
  targetDate?: string;
  startDate?: string;
  completionPercentage?: number;
  milestones?: {
    id: string;
    title: string;
    status: string;
    dueDate?: string;
  }[];
  benefits?: {
    id: string;
    description: string;
    targetValue?: string;
    unit?: string;
  }[];
}

export interface RoadmapTimelineProps {
  initiatives: TimelineInitiative[];
  phases?: string[];
  onSelectInitiative?: (initiative: TimelineInitiative) => void;
  selectedInitiativeId?: string | null;
  className?: string;
}

const defaultPhases = ['Simplify', 'Connect', 'Optimise', 'Scale'];

export function RoadmapTimeline({
  initiatives,
  phases = defaultPhases,
  onSelectInitiative,
  selectedInitiativeId,
  className = '',
}: RoadmapTimelineProps) {
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');

  const filteredInitiatives = useMemo(() => {
    return initiatives.filter((init) => {
      const matchesPhase =
        selectedPhaseFilter === 'all' ||
        init.phase.toLowerCase() === selectedPhaseFilter.toLowerCase();
      const matchesPriority =
        selectedPriorityFilter === 'all' ||
        init.priority.toLowerCase() === selectedPriorityFilter.toLowerCase();
      return matchesPhase && matchesPriority;
    });
  }, [initiatives, selectedPhaseFilter, selectedPriorityFilter]);

  const initiativesByPhase = useMemo(() => {
    const map = new Map<string, TimelineInitiative[]>();
    phases.forEach((p) => map.set(p.toLowerCase(), []));

    filteredInitiatives.forEach((init) => {
      const key = init.phase.toLowerCase();
      if (map.has(key)) {
        map.get(key)!.push(init);
      } else {
        // Fallback to first phase or dynamic phase
        const fallbackKey = phases[0]?.toLowerCase() || 'default';
        if (!map.has(fallbackKey)) map.set(fallbackKey, []);
        map.get(fallbackKey)!.push(init);
      }
    });

    return map;
  }, [filteredInitiatives, phases]);

  const getPriorityTone = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'danger' as const;
      case 'high':
        return 'warning' as const;
      case 'medium':
        return 'accent' as const;
      default:
        return 'neutral' as const;
    }
  };

  const getStatusTone = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'complete':
        return 'success' as const;
      case 'blocked':
        return 'danger' as const;
      case 'active':
      case 'in-progress':
        return 'accent' as const;
      default:
        return 'neutral' as const;
    }
  };

  return (
    <div className={`fabric-timeline-wrapper ${className}`}>
      {/* Filter toolbar */}
      <div className="fabric-timeline-toolbar">
        <div className="timeline-filter-group">
          <span className="filter-label">Phase:</span>
          <button
            type="button"
            className={`timeline-filter-btn ${selectedPhaseFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setSelectedPhaseFilter('all')}
          >
            All phases
          </button>
          {phases.map((p) => (
            <button
              key={p}
              type="button"
              className={`timeline-filter-btn ${selectedPhaseFilter.toLowerCase() === p.toLowerCase() ? 'is-active' : ''}`}
              onClick={() => setSelectedPhaseFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="timeline-filter-group">
          <span className="filter-label">Priority:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map((pr) => (
            <button
              key={pr}
              type="button"
              className={`timeline-filter-btn ${selectedPriorityFilter === pr ? 'is-active' : ''}`}
              onClick={() => setSelectedPriorityFilter(pr)}
            >
              {pr.charAt(0).toUpperCase() + pr.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Swimlane / Phases Container */}
      <div className="fabric-timeline-lanes">
        {phases.map((phase, idx) => {
          const phaseItems = initiativesByPhase.get(phase.toLowerCase()) || [];
          if (
            selectedPhaseFilter !== 'all' &&
            selectedPhaseFilter.toLowerCase() !== phase.toLowerCase()
          ) {
            return null;
          }

          const completedCount = phaseItems.filter(
            (i) => i.status === 'completed' || i.status === 'complete',
          ).length;

          return (
            <div key={phase} className="fabric-timeline-lane">
              {/* Lane Header */}
              <div className="timeline-lane-header">
                <div className="timeline-lane-title">
                  <span className="timeline-lane-step">Phase 0{idx + 1}</span>
                  <h3>{phase}</h3>
                </div>
                <div className="timeline-lane-metrics">
                  <span className="timeline-lane-count">
                    {completedCount} / {phaseItems.length} complete
                  </span>
                </div>
              </div>

              {/* Lane Content / Initiative Bars */}
              <div className="timeline-lane-content">
                {phaseItems.length === 0 ? (
                  <div className="timeline-empty-lane">
                    No initiatives sequenced in {phase}.
                  </div>
                ) : (
                  phaseItems.map((init) => {
                    const isSelected = selectedInitiativeId === init.id;
                    const milestones = init.milestones || [];
                    const benefits = init.benefits || [];

                    return (
                      <div
                        key={init.id}
                        className={`timeline-initiative-card ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => onSelectInitiative && onSelectInitiative(init)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            onSelectInitiative && onSelectInitiative(init);
                          }
                        }}
                      >
                        <div className="timeline-card-top">
                          <div className="timeline-card-badges">
                            <Badge tone={getPriorityTone(init.priority)}>
                              {init.priority}
                            </Badge>
                            <Badge tone={getStatusTone(init.status)}>
                              {init.status}
                            </Badge>
                          </div>
                          {init.owner && (
                            <div className="timeline-card-owner">
                              <User size={12} />
                              <span>{init.owner}</span>
                            </div>
                          )}
                        </div>

                        <div className="timeline-card-title">{init.title}</div>
                        {init.description && (
                          <div className="timeline-card-desc">{init.description}</div>
                        )}

                        {/* Milestones & Benefits summary */}
                        <div className="timeline-card-meta">
                          {milestones.length > 0 && (
                            <div className="timeline-meta-pill" title={`${milestones.length} Milestones`}>
                              <Flag size={12} />
                              <span>{milestones.length} milestones</span>
                            </div>
                          )}
                          {benefits.length > 0 && (
                            <div className="timeline-meta-pill" title={`${benefits.length} Benefit Measures`}>
                              <TrendingUp size={12} />
                              <span>{benefits.length} benefits</span>
                            </div>
                          )}
                          {init.targetDate && (
                            <div className="timeline-meta-pill" title="Target Completion">
                              <Calendar size={12} />
                              <span>{init.targetDate}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress track */}
                        {typeof init.completionPercentage === 'number' && (
                          <div className="timeline-progress-track">
                            <div
                              className="timeline-progress-bar"
                              style={{ width: `${Math.min(100, Math.max(0, init.completionPercentage))}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
