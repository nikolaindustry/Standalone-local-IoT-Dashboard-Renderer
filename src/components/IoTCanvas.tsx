// Independent IoT Canvas
// Simplified drag-drop canvas for IoT widgets

import React, { useRef, useState, useCallback } from 'react';
import { useIoTBuilder } from '../contexts/IoTBuilderContext';
import { IoTWidgetRenderer } from './IoTWidgetRenderer';
import { ConnectionRenderer } from './ConnectionRenderer';
import type { IoTDashboardWidget } from '../types';

export const IoTCanvas: React.FC = () => {
  const { state, actions } = useIoTBuilder();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const currentPage = state.config?.pages.find(p => p.id === state.activePageId);

  // Helper function to generate background style
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!currentPage?.layout) return {};

    const { backgroundType, backgroundColor, backgroundGradient, backgroundImage, backgroundOpacity } = currentPage.layout;
    const style: React.CSSProperties = {};

    // Apply opacity if set
    if (backgroundOpacity !== undefined) {
      style.opacity = backgroundOpacity;
    }

    switch (backgroundType) {
      case 'gradient':
        if (backgroundGradient) {
          const { type, angle, colors } = backgroundGradient;
          const colorStops = colors.map(c => `${c.color} ${c.position}%`).join(', ');
          
          if (type === 'linear') {
            style.background = `linear-gradient(${angle || 90}deg, ${colorStops})`;
          } else {
            style.background = `radial-gradient(circle, ${colorStops})`;
          }
        }
        break;

      case 'image':
        if (backgroundImage?.url) {
          style.backgroundImage = `url(${backgroundImage.url})`;
          style.backgroundSize = backgroundImage.size === 'custom' ? '100% 100%' : (backgroundImage.size || 'cover');
          style.backgroundPosition = backgroundImage.position || 'center';
          style.backgroundRepeat = backgroundImage.repeat || 'no-repeat';
          
          // If image has its own opacity, layer it
          if (backgroundImage.opacity !== undefined && backgroundImage.opacity < 1) {
            style.position = 'relative';
          }
        }
        break;

      case 'solid':
      default:
        if (backgroundColor) {
          style.backgroundColor = backgroundColor;
        }
        break;
    }

    return style;
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If connection tool is selected, create connection points
    if (state.activeTool === 'connection') {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / state.zoom;
      const y = (e.clientY - rect.top) / state.zoom;

      // If we have a draft (source point), complete the connection
      if (state.connectionDraft) {
        console.log('[IoTCanvas] Completing connection from draft:', state.connectionDraft, 'to:', { x, y });
        
        actions.addConnection({
          source: {
            x: state.connectionDraft.sourceX || 0,
            y: state.connectionDraft.sourceY || 0,
            widgetId: state.connectionDraft.sourceWidgetId
          },
          target: { x, y },
          style: {
            color: '#3b82f6',
            thickness: 2,
            curveType: 'bezier',
            targetArrow: 'arrowclosed'
          }
        });
        
        actions.cancelConnectionDraft();
        actions.setTool('select'); // Return to select mode after creating connection
      } else {
        // Start a new connection draft
        console.log('[IoTCanvas] Starting connection draft at:', { x, y });
        actions.startConnectionDraft(undefined, x, y);
      }
      return;
    }
    
    // If a widget tool is selected, add widget at click position
    if (state.activeTool && state.activeTool !== 'select' && state.activeTool !== 'move') {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / state.zoom;
      const y = (e.clientY - rect.top) / state.zoom;

      const newWidget: Omit<IoTDashboardWidget, 'id'> = {
        type: state.activeTool as any,
        title: `New ${state.activeTool}`,
        position: { x, y },
        size: { width: 200, height: 100 },
        config: {},
      };

      actions.addWidget(newWidget);
      actions.setTool('select');
    } else if (state.activeTool === 'select') {
      actions.clearSelection();
      actions.clearConnectionSelection();
    }
  };

  const handleWidgetMouseDown = (e: React.MouseEvent, widgetId: string) => {
    e.stopPropagation();
    
    const widget = currentPage?.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    // Always select the widget
    actions.selectWidget(widgetId, e.shiftKey);
    
    // Only enable dragging if in select mode
    if (state.activeTool === 'select') {
      setDraggedWidget(widgetId);
      
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;

    // Track mouse position for connection preview
    if (state.activeTool === 'connection' && state.connectionDraft) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / state.zoom;
      const y = (e.clientY - rect.top) / state.zoom;
      setMousePos({ x, y });
    }

    // Handle widget dragging
    if (draggedWidget) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = Math.max(0, e.clientX - canvasRect.left - dragOffset.x);
      const newY = Math.max(0, e.clientY - canvasRect.top - dragOffset.y);
      actions.moveWidget(draggedWidget, { x: newX, y: newY });
    }
  }, [draggedWidget, dragOffset, actions, state.activeTool, state.connectionDraft, state.zoom]);

  const handleMouseUp = useCallback(() => {
    setDraggedWidget(null);
  }, []);

  React.useEffect(() => {
    if (draggedWidget) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedWidget, handleMouseMove, handleMouseUp]);

  // Track mouse movement for connection preview
  React.useEffect(() => {
    if (state.activeTool === 'connection') {
      document.addEventListener('mousemove', handleMouseMove);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
      };
    } else {
      setMousePos(null); // Clear mouse position when tool changes
    }
  }, [state.activeTool, handleMouseMove]);

  if (!currentPage) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No page selected</p>
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      className={`relative w-full h-full overflow-auto ${
        state.activeTool && state.activeTool !== 'select' && state.activeTool !== 'move'
          ? 'cursor-crosshair'
          : 'cursor-default'
      }`}
      onClick={handleCanvasClick}
      style={{
        ...getBackgroundStyle(),
        backgroundImage: state.showGrid
          ? `radial-gradient(circle, #d1d5db 1px, transparent 1px), ${getBackgroundStyle().backgroundImage || 'none'}`
          : getBackgroundStyle().backgroundImage,
        backgroundSize: state.showGrid
          ? `20px 20px, ${getBackgroundStyle().backgroundSize || 'auto'}`
          : getBackgroundStyle().backgroundSize,
        transform: `scale(${state.zoom})`,
        transformOrigin: 'top left',
      }}
    >
      {/* Helper text when tool is selected */}
      {state.activeTool && state.activeTool !== 'select' && state.activeTool !== 'move' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg z-50 pointer-events-none">
          {state.activeTool === 'connection' ? (
            <p className="text-sm font-medium">
              {state.connectionDraft 
                ? 'Click to set the end point of the connection' 
                : 'Click to set the start point of the connection'}
            </p>
          ) : (
            <p className="text-sm font-medium">Click anywhere on the canvas to add a {state.activeTool} widget</p>
          )}
        </div>
      )}
      
      <div className="relative min-w-[1200px] min-h-[800px]">
        {/* SVG layer for connections */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{
            width: '100%',
            height: '100%',
            minWidth: '1200px',
            minHeight: '800px',
            zIndex: 0
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {(() => {
            if (currentPage.connections && currentPage.connections.length > 0) {
              console.log('[IoTCanvas] Rendering connections:', currentPage.connections.length, currentPage.connections);
              return currentPage.connections.map(connection => (
                <g key={connection.id} className="pointer-events-auto">
                  <ConnectionRenderer
                    connection={connection}
                    widgets={currentPage.widgets}
                    zoom={state.zoom}
                    isSelected={state.selectedConnections.includes(connection.id)}
                    editingViewMode={state.editingViewMode}
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.selectConnection(connection.id, e.shiftKey);
                    }}
                    onWaypointDrag={(waypointIndex, x, y) => {
                      const newWaypoints = [...(connection.waypoints || [])];
                      newWaypoints[waypointIndex] = { 
                        ...newWaypoints[waypointIndex], 
                        x, 
                        y 
                      };
                      actions.updateConnection(connection.id, { waypoints: newWaypoints });
                    }}
                    onSourceDrag={(x, y) => {
                      actions.updateConnection(connection.id, {
                        source: { ...connection.source, x, y }
                      });
                    }}
                    onTargetDrag={(x, y) => {
                      actions.updateConnection(connection.id, {
                        target: { ...connection.target, x, y }
                      });
                    }}
                  />
                </g>
              ));
            } else {
              console.log('[IoTCanvas] No connections to render on page:', currentPage.id);
              return null;
            }
          })()}
          
          {/* Connection draft preview */}
          {state.connectionDraft && mousePos && (
            <g className="pointer-events-none">
              <line
                x1={state.connectionDraft.sourceX}
                y1={state.connectionDraft.sourceY}
                x2={mousePos.x}
                y2={mousePos.y}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5,5"
                opacity={0.6}
              />
              <circle
                cx={state.connectionDraft.sourceX}
                cy={state.connectionDraft.sourceY}
                r={4}
                fill="#3b82f6"
              />
            </g>
          )}
        </svg>

        {/* Widgets layer */}
        {currentPage.widgets.map(widget => {
          // Ensure widget has required position and size data
          if (!widget.position || !widget.size) {
            console.warn('Widget missing position or size:', widget);
            return null;
          }

          // Use mobile layout when in mobile editing mode, fallback to desktop layout
          const isMobileView = state.editingViewMode === 'mobile';
          const position = (isMobileView && widget.mobileLayout?.position) 
            ? widget.mobileLayout.position 
            : widget.position;
          const size = (isMobileView && widget.mobileLayout?.size) 
            ? widget.mobileLayout.size 
            : widget.size;
          
          return (
            <div
              key={widget.id}
              className={`absolute ${
                state.activeTool === 'select' ? 'cursor-move' : 'cursor-default'
              }`}
              style={{
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
                transform: widget.rotation ? `rotate(${widget.rotation}deg)` : undefined,
                zIndex: widget.style?.zIndex !== undefined ? widget.style.zIndex : 'auto',
              }}
              onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
              onClick={(e) => e.stopPropagation()}
            >
              <IoTWidgetRenderer
                widget={widget}
                isSelected={state.selectedWidgets.includes(widget.id)}
                isDesignMode={state.mode === 'design'}
                onUpdate={(id, updates) => actions.updateWidget(id, updates)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
