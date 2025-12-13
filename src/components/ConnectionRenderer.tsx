// Connection Renderer - Draws flow lines between widgets
import React, { useMemo } from 'react';
import type { DashboardConnection, IoTDashboardWidget } from '../types';

interface ConnectionRendererProps {
  connection: DashboardConnection;
  widgets: IoTDashboardWidget[];
  zoom: number;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  editingViewMode?: 'desktop' | 'mobile';
  onWaypointDrag?: (waypointIndex: number, x: number, y: number) => void;
  onSourceDrag?: (x: number, y: number) => void;
  onTargetDrag?: (x: number, y: number) => void;
}

export const ConnectionRenderer: React.FC<ConnectionRendererProps> = ({
  connection,
  widgets,
  zoom,
  isSelected,
  onClick,
  editingViewMode = 'desktop',
  onWaypointDrag,
  onSourceDrag,
  onTargetDrag,
}) => {
  // Find source and target widgets
  const sourceWidget = widgets.find(w => w.id === connection.source.widgetId);
  const targetWidget = widgets.find(w => w.id === connection.target.widgetId);

  console.log('[ConnectionRenderer] Rendering connection:', {
    connectionId: connection.id,
    source: connection.source,
    target: connection.target,
    sourceWidget: sourceWidget?.id,
    targetWidget: targetWidget?.id
  });

  // Responsive scaling factors based on view mode
  const isMobileView = editingViewMode === 'mobile';
  const mobileScaleFactor = 0.7; // Scale down for mobile screens
  const mobileThicknessReduction = 0.8; // Slightly thinner lines on mobile

  // Calculate connection points
  const points = useMemo(() => {
    // Get absolute positions for source and target
    const getAbsolutePosition = (point: typeof connection.source): { x: number; y: number } => {
      // If point has absolute coordinates, use them
      if (point.x !== undefined && point.y !== undefined) {
        // If associated with a widget, adjust position when widget moves
        if (point.widgetId) {
          const widget = widgets.find(w => w.id === point.widgetId);
          if (widget) {
            const isMobile = editingViewMode === 'mobile';
            const widgetPos = (isMobile && widget.mobileLayout?.position) || widget.position;
            const widgetSize = (isMobile && widget.mobileLayout?.size) || widget.size;
            
            // Apply offset from widget position
            const offsetX = point.offsetX || 0;
            const offsetY = point.offsetY || 0;
            
            return {
              x: widgetPos.x + offsetX,
              y: widgetPos.y + offsetY
            };
          }
        }
        // Use absolute position as-is
        return { x: point.x, y: point.y };
      }
      
      // Fallback to center of screen if no position specified
      return { x: 600, y: 400 };
    };

    const source = getAbsolutePosition(connection.source);
    const target = getAbsolutePosition(connection.target);

    return { source, target };
  }, [widgets, connection.source, connection.target, editingViewMode]);

  if (!points) return null;

  const style = connection.style || {};
  const curveType = style.curveType || 'bezier';
  const color = style.color || '#64748b';
  
  // Responsive thickness - thinner on mobile
  const baseThickness = style.thickness || 2;
  const thickness = isMobileView ? baseThickness * mobileThicknessReduction : baseThickness;
  
  const opacity = style.opacity !== undefined ? style.opacity : 1;
  const lineStyle = style.lineStyle || 'solid';
  
  // Responsive corner radius - smaller on mobile for tighter curves
  const baseCornerRadius = connection.style?.cornerRadius || 0;
  const cornerRadius = isMobileView && baseCornerRadius > 0 
    ? Math.max(baseCornerRadius * 0.6, 5) // Minimum 5px on mobile
    : baseCornerRadius;

  // Generate path based on curve type and waypoints
  const getPath = () => {
    const { source, target } = points;
    let waypoints = connection.waypoints || [];
    
    // Simplify complex paths on mobile - reduce waypoint density
    if (isMobileView && waypoints.length > 3) {
      // Keep every other waypoint for simpler routing on mobile
      waypoints = waypoints.filter((_, index) => index % 2 === 0);
    }

    // Multi-segment path with waypoints
    if (waypoints.length > 0) {
      const allPoints = [source, ...waypoints, target];
      let pathData = `M ${allPoints[0].x} ${allPoints[0].y}`;

      for (let i = 1; i < allPoints.length; i++) {
        const prev = allPoints[i - 1];
        const curr = allPoints[i];
        const next = i < allPoints.length - 1 ? allPoints[i + 1] : null;

        if (cornerRadius > 0 && next) {
          // Calculate rounded corner
          const dx1 = curr.x - prev.x;
          const dy1 = curr.y - prev.y;
          const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
          const dx2 = next.x - curr.x;
          const dy2 = next.y - curr.y;
          const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          const radius = Math.min(cornerRadius, len1 / 2, len2 / 2);

          // Point before corner
          const beforeX = curr.x - (dx1 / len1) * radius;
          const beforeY = curr.y - (dy1 / len1) * radius;

          // Point after corner
          const afterX = curr.x + (dx2 / len2) * radius;
          const afterY = curr.y + (dy2 / len2) * radius;

          // Line to before corner, arc through corner, continue to after
          pathData += ` L ${beforeX} ${beforeY}`;
          pathData += ` Q ${curr.x} ${curr.y}, ${afterX} ${afterY}`;
        } else {
          // Straight line to point
          pathData += ` L ${curr.x} ${curr.y}`;
        }
      }

      return pathData;
    }

    // Single-segment path (original behavior)
    switch (curveType) {
      case 'straight':
        return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;

      case 'step': {
        const midX = (source.x + target.x) / 2;
        return `M ${source.x} ${source.y} L ${midX} ${source.y} L ${midX} ${target.y} L ${target.x} ${target.y}`;
      }

      case 'smoothstep': {
        const midX = (source.x + target.x) / 2;
        const offset = 20;
        return `M ${source.x} ${source.y} C ${source.x + offset} ${source.y}, ${midX - offset} ${source.y}, ${midX} ${source.y} L ${midX} ${target.y} C ${midX + offset} ${target.y}, ${target.x - offset} ${target.y}, ${target.x} ${target.y}`;
      }

      case 'bezier':
      default: {
        // ... existing code ...
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Tighter curves on mobile for better space utilization
        const controlOffset = isMobileView 
          ? Math.max(distance * 0.25, 30) // Tighter control on mobile
          : Math.max(distance * 0.4, 50);  // More relaxed on desktop

        // Determine control point direction based on relative positions
        let cp1x = source.x;
        let cp1y = source.y;
        let cp2x = target.x;
        let cp2y = target.y;

        // If mostly horizontal, extend control points horizontally
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) {
            // Target is to the right
            cp1x += controlOffset;
            cp2x -= controlOffset;
          } else {
            // Target is to the left
            cp1x -= controlOffset;
            cp2x += controlOffset;
          }
        } else {
          // If mostly vertical, extend control points vertically
          if (dy > 0) {
            // Target is below
            cp1y += controlOffset;
            cp2y -= controlOffset;
          } else {
            // Target is above
            cp1y -= controlOffset;
            cp2y += controlOffset;
          }
        }

        return `M ${source.x} ${source.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${target.x} ${target.y}`;
      }
    }
  };

  const path = getPath();

  console.log('[ConnectionRenderer] Path calculated:', {
    connectionId: connection.id,
    points,
    path,
    color,
    thickness,
    opacity
  });

  // Get stroke dash array
  const getDashArray = () => {
    switch (lineStyle) {
      case 'dashed': return `${thickness * 4} ${thickness * 2}`;
      case 'dotted': return `${thickness} ${thickness * 2}`;
      default: return 'none';
    }
  };

  // Arrow markers
  const getArrowMarkerId = (position: 'source' | 'target') => `arrow-${connection.id}-${position}`;

  const renderArrowMarker = (arrowType: string, position: 'source' | 'target') => {
    const markerId = getArrowMarkerId(position);
    // Responsive arrow size - smaller on mobile
    const baseSize = thickness * 3;
    const size = isMobileView ? baseSize * mobileScaleFactor : baseSize;

    if (arrowType === 'arrow') {
      return (
        <marker
          id={markerId}
          markerWidth={size}
          markerHeight={size}
          refX={size / 2}
          refY={size / 2}
          orient="auto"
        >
          <path
            d={`M 0 0 L ${size} ${size / 2} L 0 ${size}`}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
          />
        </marker>
      );
    } else if (arrowType === 'arrowclosed') {
      return (
        <marker
          id={markerId}
          markerWidth={size}
          markerHeight={size}
          refX={size / 2}
          refY={size / 2}
          orient="auto"
        >
          <path
            d={`M 0 0 L ${size} ${size / 2} L 0 ${size} Z`}
            fill={color}
          />
        </marker>
      );
    } else if (arrowType === 'circle') {
      return (
        <marker
          id={markerId}
          markerWidth={size}
          markerHeight={size}
          refX={size / 2}
          refY={size / 2}
          orient="auto"
        >
          <circle cx={size / 2} cy={size / 2} r={size / 3} fill={color} />
        </marker>
      );
    } else if (arrowType === 'diamond') {
      return (
        <marker
          id={markerId}
          markerWidth={size}
          markerHeight={size}
          refX={size / 2}
          refY={size / 2}
          orient="auto"
        >
          <path
            d={`M 0 ${size / 2} L ${size / 2} 0 L ${size} ${size / 2} L ${size / 2} ${size} Z`}
            fill={color}
          />
        </marker>
      );
    }
    return null;
  };

  // Label position calculation
  const getLabelPosition = () => {
    if (!connection.label || !points) return null;

    const { source, target } = points;
    const position = connection.label.position || 0.5;
    
    return {
      x: source.x + (target.x - source.x) * position,
      y: source.y + (target.y - source.y) * position,
    };
  };

  const labelPos = connection.label ? getLabelPosition() : null;
  const sourceArrow = style.sourceArrow || 'none';
  const targetArrow = style.targetArrow || 'arrow';

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <defs>
        {sourceArrow !== 'none' && renderArrowMarker(sourceArrow, 'source')}
        {targetArrow !== 'none' && renderArrowMarker(targetArrow, 'target')}
        {style.animated && (
          <style>
            {`
              @keyframes dashAnimation {
                to {
                  stroke-dashoffset: -${(style.animationSpeed || 10) * 10};
                }
              }
            `}
          </style>
        )}
      </defs>

      {/* Invisible wider path for easier selection */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(thickness * 3, 10)}
        pointerEvents="stroke"
      />

      {/* Actual visible path */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={isSelected ? thickness + 1 : thickness}
        opacity={opacity}
        strokeDasharray={getDashArray()}
        markerStart={sourceArrow !== 'none' ? `url(#${getArrowMarkerId('source')})` : undefined}
        markerEnd={targetArrow !== 'none' ? `url(#${getArrowMarkerId('target')})` : undefined}
        style={{
          animation: style.animated ? 'dashAnimation 1s linear infinite' : undefined,
          filter: isSelected ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.6))' : undefined,
        }}
      />

      {/* Label - responsive sizing */}
      {connection.label && labelPos && (
        <g transform={`translate(${labelPos.x}, ${labelPos.y})`}>
          <rect
            x={isMobileView ? -40 : -50}
            y={isMobileView ? -8 : -10}
            width={isMobileView ? 80 : 100}
            height={isMobileView ? 16 : 20}
            fill={connection.label.backgroundColor || 'white'}
            stroke={color}
            strokeWidth={1}
            rx={4}
          />
          <text
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={connection.label.textColor || '#000'}
            fontSize={isMobileView ? (connection.label.fontSize || 12) * 0.85 : (connection.label.fontSize || 12)}
            fontFamily="sans-serif"
          >
            {connection.label.text}
          </text>
        </g>
      )}

      {/* Waypoint markers (visible when selected) - responsive sizing */}
      {isSelected && connection.waypoints && connection.waypoints.map((waypoint, index) => {
        // Only show waypoints that weren't filtered out on mobile
        const originalWaypoints = connection.waypoints || [];
        if (isMobileView && originalWaypoints.length > 3 && index % 2 !== 0) {
          return null; // Skip filtered waypoints on mobile
        }
        
        return (
          <g 
            key={waypoint.id || `waypoint-${index}`}
            onMouseDown={(e) => {
              if (!onWaypointDrag) return;
              e.stopPropagation();
              
              const svg = e.currentTarget.ownerSVGElement;
              if (!svg) return;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const rect = svg.getBoundingClientRect();
                const x = (moveEvent.clientX - rect.left) / zoom;
                const y = (moveEvent.clientY - rect.top) / zoom;
                onWaypointDrag(index, x, y);
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <circle
              cx={waypoint.x}
              cy={waypoint.y}
              r={isMobileView ? 5 : 6}
              fill="#3b82f6"
              stroke="white"
              strokeWidth={isMobileView ? 1.5 : 2}
              style={{ cursor: 'move' }}
            />
            <text
              x={waypoint.x}
              y={waypoint.y - (isMobileView ? 10 : 12)}
              textAnchor="middle"
              fill="#3b82f6"
              fontSize={isMobileView ? 8 : 10}
              fontWeight="bold"
              style={{ pointerEvents: 'none' }}
            >
              {index + 1}
            </text>
          </g>
        );
      })}

      {/* Source point marker (visible when selected) - responsive sizing */}
      {isSelected && points && (
        <g
          onMouseDown={(e) => {
            if (!onSourceDrag) return;
            e.stopPropagation();
            
            const svg = e.currentTarget.ownerSVGElement;
            if (!svg) return;

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const rect = svg.getBoundingClientRect();
              const x = (moveEvent.clientX - rect.left) / zoom;
              const y = (moveEvent.clientY - rect.top) / zoom;
              onSourceDrag(x, y);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <circle
            cx={points.source.x}
            cy={points.source.y}
            r={isMobileView ? 6 : 7}
            fill="#10b981"
            stroke="white"
            strokeWidth={isMobileView ? 1.5 : 2}
            style={{ cursor: 'move' }}
          />
          <text
            x={points.source.x}
            y={points.source.y + (isMobileView ? 2.5 : 3)}
            textAnchor="middle"
            fill="white"
            fontSize={isMobileView ? 8 : 10}
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
          >
            S
          </text>
        </g>
      )}

      {/* Target point marker (visible when selected) - responsive sizing */}
      {isSelected && points && (
        <g
          onMouseDown={(e) => {
            if (!onTargetDrag) return;
            e.stopPropagation();
            
            const svg = e.currentTarget.ownerSVGElement;
            if (!svg) return;

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const rect = svg.getBoundingClientRect();
              const x = (moveEvent.clientX - rect.left) / zoom;
              const y = (moveEvent.clientY - rect.top) / zoom;
              onTargetDrag(x, y);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <circle
            cx={points.target.x}
            cy={points.target.y}
            r={isMobileView ? 6 : 7}
            fill="#ef4444"
            stroke="white"
            strokeWidth={isMobileView ? 1.5 : 2}
            style={{ cursor: 'move' }}
          />
          <text
            x={points.target.x}
            y={points.target.y + (isMobileView ? 2.5 : 3)}
            textAnchor="middle"
            fill="white"
            fontSize={isMobileView ? 8 : 10}
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
          >
            T
          </text>
        </g>
      )}
    </g>
  );
};
