// Independent IoT Widget Renderer with Selection and Resize Handles
// No dependencies on Product Dashboard Designer

import React, { useState, useCallback } from 'react';
import { IoTEnhancedWidgetRenderer } from './IoTEnhancedWidgetRenderer';
import { useIoTBuilder } from '../contexts/IoTBuilderContext';
import type { IoTDashboardWidget } from '../types';

interface IoTWidgetRendererProps {
  widget: IoTDashboardWidget;
  isSelected?: boolean;
  isDesignMode?: boolean;
  deviceId?: string;
  value?: any;
  onUpdate?: (id: string, updates: Partial<IoTDashboardWidget>) => void;
  onWidgetEvent?: (widgetId: string, event: string, value: any) => void;
}

export const IoTWidgetRenderer: React.FC<IoTWidgetRendererProps> = ({
  widget,
  isSelected,
  isDesignMode,
  deviceId,
  value,
  onUpdate,
  onWidgetEvent
}) => {
  const { state, actions } = useIoTBuilder();
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    if (!isDesignMode || !isSelected) return;
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);

    // Get the correct size and position based on viewport mode
    const isMobileView = state.editingViewMode === 'mobile';
    const currentSize = isMobileView && widget.mobileLayout 
      ? widget.mobileLayout.size 
      : widget.size;
    const currentPosition = isMobileView && widget.mobileLayout 
      ? widget.mobileLayout.position 
      : widget.position;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = currentSize.width;
    const startHeight = currentSize.height;
    const startPosX = currentPosition.x;
    const startPosY = currentPosition.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;

      // Calculate new dimensions based on handle
      switch (handle) {
        case 'se': // bottom-right
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = Math.max(50, startHeight + deltaY);
          break;
        case 'sw': // bottom-left
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = Math.max(50, startHeight + deltaY);
          newX = startPosX + (startWidth - newWidth);
          break;
        case 'ne': // top-right
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = Math.max(50, startHeight - deltaY);
          newY = startPosY + (startHeight - newHeight);
          break;
        case 'nw': // top-left
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = Math.max(50, startHeight - deltaY);
          newX = startPosX + (startWidth - newWidth);
          newY = startPosY + (startHeight - newHeight);
          break;
        case 'e': // right
          newWidth = Math.max(50, startWidth + deltaX);
          break;
        case 'w': // left
          newWidth = Math.max(50, startWidth - deltaX);
          newX = startPosX + (startWidth - newWidth);
          break;
        case 'n': // top
          newHeight = Math.max(50, startHeight - deltaY);
          newY = startPosY + (startHeight - newHeight);
          break;
        case 's': // bottom
          newHeight = Math.max(50, startHeight + deltaY);
          break;
      }

      // Use the actions methods which handle viewport-specific updates
      actions.resizeWidget(widget.id, { width: newWidth, height: newHeight });
      if (newX !== startPosX || newY !== startPosY) {
        actions.moveWidget(widget.id, { x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="relative w-full h-full group">
      {/* Selection Border */}
      {isSelected && isDesignMode && (
        <div className="absolute inset-0 border-2 border-primary rounded pointer-events-none z-10">
          <div className="absolute -top-6 left-0 bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-medium">
            {widget.title || widget.type}
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className="w-full h-full">
        <IoTEnhancedWidgetRenderer
          widget={widget}
          isSelected={isSelected}
          isDesignMode={isDesignMode}
          deviceId={deviceId}
          value={value}
          onUpdate={onUpdate}
          onWidgetEvent={onWidgetEvent}
          pages={state.config?.pages.map(page => ({
            id: page.id,
            name: page.name
          }))}
          activePageId={state.activePageId}
          onNavigateToPage={(pageId) => actions.setActivePage(pageId)}
        />
      </div>

      {/* Resize Handles */}
      {isSelected && isDesignMode && (
        <>
          {/* Corner Handles */}
          <div
            className="absolute -top-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full cursor-nw-resize z-20"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            className="absolute -top-1 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-ne-resize z-20"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full cursor-sw-resize z-20"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-se-resize z-20"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />

          {/* Edge Handles */}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border border-white rounded-full cursor-n-resize z-20"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border border-white rounded-full cursor-s-resize z-20"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-primary border border-white rounded-full cursor-w-resize z-20"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-e-resize z-20"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
        </>
      )}
    </div>
  );
};
