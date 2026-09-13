import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Server,
  Cpu,
  Layers,
  Database,
  Workflow,
  Search,
  Maximize2,
  Filter,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export interface LandscapeEntityData {
  id: string;
  name: string;
  description?: string;
  type: string;
  ownerRole?: string;
  sourceEntityId?: string;
  areaName?: string;
  vendor?: string;
  status?: string;
}

export interface LandscapeRelationshipData {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: string;
  rationale?: string;
  evidenceIds?: string[];
}

export interface LandscapeCanvasProps {
  entities: LandscapeEntityData[];
  relationships: LandscapeRelationshipData[];
  onSelectEntity?: (entity: LandscapeEntityData) => void;
  selectedEntityId?: string | null;
  className?: string;
  height?: number | string;
}

// Custom Node Components
function SystemNodeComponent({ data, selected }: NodeProps) {
  const entity = data as unknown as LandscapeEntityData;
  return (
    <div className={`fabric-flow-node fabric-flow-node--system ${selected ? 'is-selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="fabric-flow-handle" />
      <Handle type="target" position={Position.Left} className="fabric-flow-handle" />
      <div className="fabric-flow-node-header">
        <span className="fabric-flow-node-icon system-icon">
          <Server size={14} />
        </span>
        <span className="fabric-flow-node-type">{entity.type || 'System'}</span>
        {entity.ownerRole && (
          <span className="fabric-flow-node-owner" title={`Owner: ${entity.ownerRole}`}>
            {entity.ownerRole}
          </span>
        )}
      </div>
      <div className="fabric-flow-node-title">{entity.name}</div>
      {entity.description && (
        <div className="fabric-flow-node-desc">{entity.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="fabric-flow-handle" />
      <Handle type="source" position={Position.Right} className="fabric-flow-handle" />
    </div>
  );
}

function ProcessNodeComponent({ data, selected }: NodeProps) {
  const entity = data as unknown as LandscapeEntityData;
  return (
    <div className={`fabric-flow-node fabric-flow-node--process ${selected ? 'is-selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="fabric-flow-handle" />
      <Handle type="target" position={Position.Left} className="fabric-flow-handle" />
      <div className="fabric-flow-node-header">
        <span className="fabric-flow-node-icon process-icon">
          <Workflow size={14} />
        </span>
        <span className="fabric-flow-node-type">Process</span>
        {entity.areaName && (
          <span className="fabric-flow-node-owner">{entity.areaName}</span>
        )}
      </div>
      <div className="fabric-flow-node-title">{entity.name}</div>
      {entity.description && (
        <div className="fabric-flow-node-desc">{entity.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="fabric-flow-handle" />
      <Handle type="source" position={Position.Right} className="fabric-flow-handle" />
    </div>
  );
}

function AreaNodeComponent({ data, selected }: NodeProps) {
  const entity = data as unknown as LandscapeEntityData;
  return (
    <div className={`fabric-flow-node fabric-flow-node--area ${selected ? 'is-selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="fabric-flow-handle" />
      <Handle type="target" position={Position.Left} className="fabric-flow-handle" />
      <div className="fabric-flow-node-header">
        <span className="fabric-flow-node-icon area-icon">
          <Layers size={14} />
        </span>
        <span className="fabric-flow-node-type">Operational Area</span>
      </div>
      <div className="fabric-flow-node-title">{entity.name}</div>
      {entity.description && (
        <div className="fabric-flow-node-desc">{entity.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="fabric-flow-handle" />
      <Handle type="source" position={Position.Right} className="fabric-flow-handle" />
    </div>
  );
}

function DataNodeComponent({ data, selected }: NodeProps) {
  const entity = data as unknown as LandscapeEntityData;
  return (
    <div className={`fabric-flow-node fabric-flow-node--data ${selected ? 'is-selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="fabric-flow-handle" />
      <Handle type="target" position={Position.Left} className="fabric-flow-handle" />
      <div className="fabric-flow-node-header">
        <span className="fabric-flow-node-icon data-icon">
          <Database size={14} />
        </span>
        <span className="fabric-flow-node-type">Data / Entity</span>
      </div>
      <div className="fabric-flow-node-title">{entity.name}</div>
      {entity.description && (
        <div className="fabric-flow-node-desc">{entity.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="fabric-flow-handle" />
      <Handle type="source" position={Position.Right} className="fabric-flow-handle" />
    </div>
  );
}

const nodeTypes = {
  system: SystemNodeComponent,
  process: ProcessNodeComponent,
  area: AreaNodeComponent,
  'data-object': DataNodeComponent,
  'process-step': ProcessNodeComponent,
  machine: SystemNodeComponent,
  role: AreaNodeComponent,
  handoff: ProcessNodeComponent,
};

export function LandscapeCanvas({
  entities,
  relationships,
  onSelectEntity,
  selectedEntityId,
  className = '',
  height = 580,
}: LandscapeCanvasProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEntities = useMemo(() => {
    return entities.filter((entity) => {
      const matchesType = filterType === 'all' || entity.type === filterType;
      const matchesSearch =
        !searchQuery ||
        entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entity.description &&
          entity.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [entities, filterType, searchQuery]);

  // Layout calculations
  const nodes = useMemo<Node[]>(() => {
    const systems = filteredEntities.filter((e) => e.type === 'system' || e.type === 'machine');
    const processes = filteredEntities.filter(
      (e) => e.type === 'process' || e.type === 'process-step' || e.type === 'handoff',
    );
    const areas = filteredEntities.filter((e) => e.type === 'area' || e.type === 'role');
    const dataObjects = filteredEntities.filter((e) => e.type === 'data-object');
    const others = filteredEntities.filter(
      (e) =>
        !['system', 'machine', 'process', 'process-step', 'handoff', 'area', 'role', 'data-object'].includes(
          e.type,
        ),
    );

    const result: Node[] = [];
    const NODE_WIDTH = 240;
    const NODE_GAP_X = 50;
    const LAYER_GAP_Y = 160;

    // Layer 1: Areas (Top)
    areas.forEach((area, i) => {
      result.push({
        id: area.id,
        type: 'area',
        position: { x: i * (NODE_WIDTH + NODE_GAP_X) + 50, y: 40 },
        data: area as unknown as Record<string, unknown>,
        selected: area.id === selectedEntityId,
      });
    });

    // Layer 2: Processes (Middle)
    const startYProcesses = areas.length > 0 ? 40 + LAYER_GAP_Y : 40;
    processes.forEach((proc, i) => {
      result.push({
        id: proc.id,
        type: 'process',
        position: { x: i * (NODE_WIDTH + NODE_GAP_X) + 50, y: startYProcesses },
        data: proc as unknown as Record<string, unknown>,
        selected: proc.id === selectedEntityId,
      });
    });

    // Layer 3: Systems & Data (Bottom)
    const startYSystems = startYProcesses + LAYER_GAP_Y;
    systems.forEach((sys, i) => {
      result.push({
        id: sys.id,
        type: 'system',
        position: { x: i * (NODE_WIDTH + NODE_GAP_X) + 50, y: startYSystems },
        data: sys as unknown as Record<string, unknown>,
        selected: sys.id === selectedEntityId,
      });
    });

    // Layer 4: Data Objects & Others
    const startYData = startYSystems + LAYER_GAP_Y;
    [...dataObjects, ...others].forEach((data, i) => {
      result.push({
        id: data.id,
        type: data.type === 'data-object' ? 'data-object' : 'system',
        position: { x: i * (NODE_WIDTH + NODE_GAP_X) + 50, y: startYData },
        data: data as unknown as Record<string, unknown>,
        selected: data.id === selectedEntityId,
      });
    });

    return result;
  }, [filteredEntities, selectedEntityId]);

  const edges = useMemo<Edge[]>(() => {
    const nodeIds = new Set(nodes.map((n) => n.id));
    return relationships
      .filter((rel) => nodeIds.has(rel.fromEntityId) && nodeIds.has(rel.toEntityId))
      .map((rel) => {
        const isHighlighted =
          selectedEntityId &&
          (rel.fromEntityId === selectedEntityId || rel.toEntityId === selectedEntityId);

        let strokeColor = 'rgba(15, 23, 42, 0.35)';
        if (rel.type === 'uses-system') strokeColor = '#1b7a6e';
        else if (rel.type === 'exchanges-data' || rel.type === 'produces-data')
          strokeColor = '#3b82f6';
        else if (rel.type === 'depends-on-process') strokeColor = '#d97706';

        if (isHighlighted) strokeColor = '#0f766e';

        return {
          id: rel.id,
          source: rel.fromEntityId,
          target: rel.toEntityId,
          label: rel.type.replace(/-/g, ' '),
          type: 'smoothstep',
          animated: isHighlighted || rel.type === 'exchanges-data',
          style: {
            stroke: strokeColor,
            strokeWidth: isHighlighted ? 3 : 1.75,
            opacity: selectedEntityId && !isHighlighted ? 0.35 : 1,
          },
          labelStyle: {
            fontSize: 10,
            fill: '#475569',
            fontWeight: 600,
          },
          labelBgStyle: {
            fill: '#ffffff',
            fillOpacity: 0.9,
            rx: 4,
            ry: 4,
          },
          labelBgPadding: [6, 2] as [number, number],
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: strokeColor,
            width: 14,
            height: 14,
          },
        };
      });
  }, [relationships, nodes, selectedEntityId]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onSelectEntity) {
        onSelectEntity(node.data as unknown as LandscapeEntityData);
      }
    },
    [onSelectEntity],
  );

  return (
    <div className={`fabric-canvas-container ${className}`} style={{ height }}>
      <div className="fabric-canvas-toolbar">
        <div className="fabric-canvas-toolbar-left">
          <div className="fabric-canvas-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search landscape..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="fabric-canvas-filters">
            <button
              type="button"
              className={`canvas-filter-pill ${filterType === 'all' ? 'is-active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All ({entities.length})
            </button>
            <button
              type="button"
              className={`canvas-filter-pill ${filterType === 'area' ? 'is-active' : ''}`}
              onClick={() => setFilterType('area')}
            >
              Areas
            </button>
            <button
              type="button"
              className={`canvas-filter-pill ${filterType === 'process' ? 'is-active' : ''}`}
              onClick={() => setFilterType('process')}
            >
              Processes
            </button>
            <button
              type="button"
              className={`canvas-filter-pill ${filterType === 'system' ? 'is-active' : ''}`}
              onClick={() => setFilterType('system')}
            >
              Systems
            </button>
            <button
              type="button"
              className={`canvas-filter-pill ${filterType === 'data-object' ? 'is-active' : ''}`}
              onClick={() => setFilterType('data-object')}
            >
              Data Objects
            </button>
          </div>
        </div>
        <div className="fabric-canvas-legend">
          <span className="legend-item">
            <span className="legend-dot legend-dot--area" /> Area
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot--process" /> Process
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot--system" /> System
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot--data" /> Data
          </span>
        </div>
      </div>

      <div className="fabric-canvas-viewport">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          attributionPosition="bottom-right"
          minZoom={0.2}
          maxZoom={1.8}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
          <Controls showInteractive={false} className="fabric-flow-controls" />
          <MiniMap
            className="fabric-flow-minimap"
            nodeStrokeColor="#94a3b8"
            nodeColor={(n) => {
              if (n.type === 'system') return '#e0f2fe';
              if (n.type === 'process') return '#fef3c7';
              if (n.type === 'area') return '#dcfce7';
              return '#f1f5f9';
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
