import { useCallback, useEffect, useMemo } from 'react';
import type { MouseEvent } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Database, Layers, Server, UsersRound, Workflow } from 'lucide-react';

export type LandscapeCanvasEntityType =
  | 'area'
  | 'process'
  | 'process-step'
  | 'system'
  | 'data-object'
  | 'role'
  | 'machine'
  | 'handoff';

export interface LandscapeEntityData extends Record<string, unknown> {
  id: string;
  name: string;
  description?: string;
  type: LandscapeCanvasEntityType;
  ownerRole?: string;
  ownerLabel?: string;
  areaName?: string;
  verificationStatus?: string;
  confidence?: string;
  opportunityCount?: number;
  observationCount?: number;
}

export interface LandscapeRelationshipData {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: string;
  rationale?: string;
  transferMode?: 'manual' | 'automated';
  duplicateDataEntry?: boolean;
}

export interface LandscapeCanvasProps {
  entities: LandscapeEntityData[];
  relationships: LandscapeRelationshipData[];
  onSelectEntity?: (entity: LandscapeEntityData) => void;
  selectedEntityId?: string | null;
  className?: string;
  height?: number | string;
}

type LandscapeNodeKind = 'system' | 'process' | 'area' | 'data-object';
type LandscapeNode = Node<LandscapeEntityData, LandscapeNodeKind>;

function NodeFrame({
  entity,
  selected,
  variant,
}: {
  entity: LandscapeEntityData;
  selected: boolean;
  variant: LandscapeNodeKind;
}) {
  const Icon =
    variant === 'system'
      ? Server
      : variant === 'process'
        ? Workflow
        : variant === 'data-object'
          ? Database
          : entity.type === 'role'
            ? UsersRound
            : Layers;

  return (
    <div
      className={`fabric-flow-node fabric-flow-node--${variant} ${
        selected ? 'is-selected' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="fabric-flow-handle"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="fabric-flow-handle"
      />
      <div className="fabric-flow-node-header">
        <span className={`fabric-flow-node-icon ${variant}-icon`}>
          <Icon size={14} />
        </span>
        <span className="fabric-flow-node-type">
          {entity.type.replace(/-/g, ' ')}
        </span>
        {(entity.ownerLabel ?? entity.ownerRole) ? (
          <span
            className="fabric-flow-node-owner"
            title={`Owner: ${entity.ownerLabel ?? entity.ownerRole}`}
          >
            {entity.ownerLabel ?? entity.ownerRole}
          </span>
        ) : null}
      </div>
      <div className="fabric-flow-node-title">{entity.name}</div>
      {entity.description ? (
        <div className="fabric-flow-node-desc">{entity.description}</div>
      ) : null}
      {entity.opportunityCount || entity.observationCount ? (
        <div className="fabric-flow-node-signals">
          {entity.observationCount ? (
            <span>
              {entity.observationCount} observation
              {entity.observationCount === 1 ? '' : 's'}
            </span>
          ) : null}
          {entity.opportunityCount ? (
            <span>
              {entity.opportunityCount} opportunit
              {entity.opportunityCount === 1 ? 'y' : 'ies'}
            </span>
          ) : null}
        </div>
      ) : null}
      <Handle
        type="source"
        position={Position.Bottom}
        className="fabric-flow-handle"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="fabric-flow-handle"
      />
    </div>
  );
}

function SystemNodeComponent({ data, selected }: NodeProps<LandscapeNode>) {
  return <NodeFrame entity={data} selected={selected} variant="system" />;
}

function ProcessNodeComponent({ data, selected }: NodeProps<LandscapeNode>) {
  return <NodeFrame entity={data} selected={selected} variant="process" />;
}

function AreaNodeComponent({ data, selected }: NodeProps<LandscapeNode>) {
  return <NodeFrame entity={data} selected={selected} variant="area" />;
}

function DataNodeComponent({ data, selected }: NodeProps<LandscapeNode>) {
  return <NodeFrame entity={data} selected={selected} variant="data-object" />;
}

const nodeTypes = {
  system: SystemNodeComponent,
  process: ProcessNodeComponent,
  area: AreaNodeComponent,
  'data-object': DataNodeComponent,
};

function FitViewOnGraphChange({ graphKey }: { graphKey: string }) {
  const { fitView } = useReactFlow<LandscapeNode, Edge>();

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      void fitView({ padding: 0.16, maxZoom: 1 });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [fitView, graphKey]);

  return null;
}

function nodeKindFor(entity: LandscapeEntityData): LandscapeNodeKind {
  if (entity.type === 'system' || entity.type === 'machine') {
    return 'system';
  }
  if (entity.type === 'data-object') {
    return 'data-object';
  }
  if (
    entity.type === 'process' ||
    entity.type === 'process-step' ||
    entity.type === 'handoff'
  ) {
    return 'process';
  }
  return 'area';
}

function edgeColour(relationship: LandscapeRelationshipData) {
  if (relationship.transferMode === 'manual') {
    return '#d97706';
  }
  if (
    relationship.type === 'exchanges-data' ||
    relationship.type === 'produces-data' ||
    relationship.type === 'consumes-data' ||
    relationship.type === 'produces-machine-data'
  ) {
    return '#2563eb';
  }
  if (relationship.type === 'performs-process') {
    return '#7c3aed';
  }
  if (
    relationship.type === 'contains-process' ||
    relationship.type === 'contains-process-step'
  ) {
    return '#64748b';
  }
  if (relationship.type === 'opportunity-improves') {
    return '#15803d';
  }
  return '#1b7a6e';
}

export function LandscapeCanvas({
  entities,
  relationships,
  onSelectEntity,
  selectedEntityId,
  className = '',
  height = 580,
}: LandscapeCanvasProps) {
  const nodes = useMemo<LandscapeNode[]>(() => {
    const areas = entities.filter(
      (entity) => entity.type === 'area' || entity.type === 'role',
    );
    const processes = entities.filter(
      (entity) =>
        entity.type === 'process' ||
        entity.type === 'process-step' ||
        entity.type === 'handoff',
    );
    const systems = entities.filter(
      (entity) => entity.type === 'system' || entity.type === 'machine',
    );
    const dataObjects = entities.filter(
      (entity) => entity.type === 'data-object',
    );
    const layers = [areas, processes, systems, dataObjects];
    const nodeWidth = 244;
    const nodeGap = 32;
    const nodeHeight = 118;
    const layerGap = 48;
    const columns = 3;
    let nextLayerY = 36;

    return layers.flatMap((layer) => {
      const nodesForLayer = layer.map((entity, index) => ({
        id: entity.id,
        type: nodeKindFor(entity),
        position: {
          x: 48 + (index % columns) * (nodeWidth + nodeGap),
          y: nextLayerY + Math.floor(index / columns) * (nodeHeight + nodeGap),
        },
        data: entity,
        selected: entity.id === selectedEntityId,
      }));
      nextLayerY +=
        Math.max(1, Math.ceil(layer.length / columns)) *
          (nodeHeight + nodeGap) +
        layerGap;

      return nodesForLayer;
    });
  }, [entities, selectedEntityId]);

  const edges = useMemo<Edge[]>(() => {
    const visibleNodeIds = new Set(nodes.map((node) => node.id));

    return relationships
      .filter(
        (relationship) =>
          visibleNodeIds.has(relationship.fromEntityId) &&
          visibleNodeIds.has(relationship.toEntityId),
      )
      .map((relationship) => {
        const isHighlighted =
          Boolean(selectedEntityId) &&
          (relationship.fromEntityId === selectedEntityId ||
            relationship.toEntityId === selectedEntityId);
        const colour = isHighlighted ? '#0f766e' : edgeColour(relationship);

        return {
          id: relationship.id,
          source: relationship.fromEntityId,
          target: relationship.toEntityId,
          label: relationship.type.replace(/-/g, ' '),
          type: 'smoothstep',
          animated: isHighlighted || relationship.transferMode === 'automated',
          style: {
            stroke: colour,
            strokeWidth: isHighlighted ? 3 : 1.75,
            opacity: selectedEntityId && !isHighlighted ? 0.3 : 1,
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
            color: colour,
            width: 14,
            height: 14,
          },
        };
      });
  }, [relationships, nodes, selectedEntityId]);

  const handleNodeClick = useCallback(
    (_event: MouseEvent, node: LandscapeNode) => {
      onSelectEntity?.(node.data);
    },
    [onSelectEntity],
  );
  const graphKey = useMemo(
    () =>
      `${entities.map((entity) => entity.id).join(',')}:${relationships
        .map((relationship) => relationship.id)
        .join(',')}`,
    [entities, relationships],
  );

  return (
    <div
      className={`fabric-canvas-container ${className}`}
      style={{ height }}
      aria-label="Digital landscape visualisation"
    >
      <div className="fabric-canvas-toolbar">
        <span className="body-copy body-copy--small">
          {entities.length} item{entities.length === 1 ? '' : 's'} and{' '}
          {edges.length} visible relationship{edges.length === 1 ? '' : 's'}.
        </span>
        <div className="fabric-canvas-legend" aria-label="Landscape legend">
          <span className="legend-item">
            <span className="legend-dot legend-dot--area" /> Area / role
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot--process" /> Process
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot--system" /> System / machine
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot--data" /> Data
          </span>
        </div>
      </div>
      <div className="fabric-canvas-viewport">
        <ReactFlow<LandscapeNode, Edge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          attributionPosition="bottom-right"
          minZoom={0.2}
          maxZoom={1.8}
          fitViewOptions={{ padding: 0.16, maxZoom: 1 }}
        >
          <FitViewOnGraphChange graphKey={graphKey} />
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#cbd5e1"
          />
          <Controls showInteractive={false} className="fabric-flow-controls" />
        </ReactFlow>
      </div>
    </div>
  );
}
