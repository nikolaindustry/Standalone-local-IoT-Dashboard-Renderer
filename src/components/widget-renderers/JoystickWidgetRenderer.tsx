import React, { useState, useEffect, useRef } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent } from '@/components/ui/card';
import { Gamepad2 } from 'lucide-react';

interface JoystickWidgetRendererProps {
  widget: IoTDashboardWidget;
  isDesignMode: boolean;
  localValue: any;
  deviceStatus: 'online' | 'offline' | 'connecting';
  handleValueChange: (newValue: any) => void;
  commonStyles: React.CSSProperties;
  executeAction: (actionId: string, parameters?: Record<string, any>) => void;
}

export const JoystickWidgetRenderer: React.FC<JoystickWidgetRendererProps> = ({
  widget,
  isDesignMode,
  localValue,
  deviceStatus,
  handleValueChange,
  commonStyles,
  executeAction
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [output, setOutput] = useState({ x: 0, y: 0 });
  
  // Configuration values with defaults
  const joystickSize = widget.config.joystickSize || 'md';
  const handleColor = widget.config.joystickHandleColor || '#3b82f6';
  const baseColor = widget.config.joystickBaseColor || '#e5e7eb';
  const sensitivity = widget.config.joystickSensitivity || 1;
  const minValue = widget.config.joystickMinValue || -100;
  const maxValue = widget.config.joystickMaxValue || 100;
  const deadZone = widget.config.joystickDeadZone || 10;
  const showContainer = widget.config.showJoystickContainer !== false; // Default to true
  const showLabel = widget.config.showLabel !== false; // Default to true
  const customJoystickSize = widget.config.customJoystickSize || 160; // Default size
  
  // Calculate size based on configuration
  const getSize = () => {
    // Use custom size if available, otherwise use preset sizes
    if (widget.config.customJoystickSize) {
      return widget.config.customJoystickSize;
    }
    
    switch (joystickSize) {
      case 'sm': return 120;
      case 'lg': return 200;
      default: return 160;
    }
  };
  
  const size = getSize();
  
  // Calculate output values based on position
  const calculateOutput = (x: number, y: number) => {
    // Apply dead zone
    const distance = Math.sqrt(x * x + y * y);
    const deadZoneRadius = (deadZone / 100) * (size / 2);
    
    if (distance < deadZoneRadius) {
      return { x: 0, y: 0 };
    }
    
    // Normalize position to -1 to 1 range
    const normalizedX = x / (size / 2);
    const normalizedY = y / (size / 2);
    
    // Apply sensitivity
    const sensitiveX = normalizedX * sensitivity;
    const sensitiveY = normalizedY * sensitivity;
    
    // Clamp to -1 to 1 range
    const clampedX = Math.max(-1, Math.min(1, sensitiveX));
    const clampedY = Math.max(-1, Math.min(1, sensitiveY));
    
    // Scale to min/max range
    const outputX = clampedX * ((maxValue - minValue) / 2) + ((maxValue + minValue) / 2);
    const outputY = clampedY * ((maxValue - minValue) / 2) + ((maxValue + minValue) / 2);
    
    return { 
      x: Math.round(outputX), 
      y: Math.round(outputY) 
    };
  };
  
  // Handle mouse/touch events
  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDesignMode || deviceStatus === 'offline') return;
    setIsDragging(true);
    updatePosition(e);
  };
  
  const updatePosition = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !joystickRef.current) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate relative position
    let x = clientX - centerX;
    let y = clientY - centerY;
    
    // Constrain to circular bounds
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = size / 2;
    
    if (distance > maxDistance) {
      x = (x / distance) * maxDistance;
      y = (y / distance) * maxDistance;
    }
    
    setPosition({ x, y });
    const newOutput = calculateOutput(x, y);
    setOutput(newOutput);
    
    // Send value change event
    const positionData = {
      x: newOutput.x,
      y: newOutput.y,
      timestamp: Date.now()
    };
    
    handleValueChange(positionData);
    
    // Send WebSocket command
    if (!isDesignMode && deviceStatus === 'online') {
      executeAction('positionChange', { 
        position: { x: newOutput.x, y: newOutput.y }
      });
    }
  };
  
  const stopDrag = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Reset to center position
    setPosition({ x: 0, y: 0 });
    setOutput({ x: 0, y: 0 });
    
    // Send reset value
    const positionData = {
      x: 0,
      y: 0,
      timestamp: Date.now()
    };
    
    handleValueChange(positionData);
    
    // Send WebSocket command
    if (!isDesignMode && deviceStatus === 'online') {
      executeAction('positionChange', { 
        position: { x: 0, y: 0 }
      });
    }
  };
  
  // Handle mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => updatePosition(e as any);
    const handleMouseUp = () => stopDrag();
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  // Handle touch events
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      updatePosition(e as any);
    };
    const handleTouchEnd = () => stopDrag();
    
    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);
  
  // Update output when config changes
  useEffect(() => {
    const newOutput = calculateOutput(position.x, position.y);
    setOutput(newOutput);
  }, [sensitivity, minValue, maxValue, deadZone, position.x, position.y]);
  
  // Render without container if showContainer is false
  if (!showContainer) {
    return (
      <div className="h-full w-full flex items-center justify-center" style={commonStyles}>
        {showLabel && (
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 className="w-5 h-5" />
            <span className="font-medium">{widget.title}</span>
          </div>
        )}
        
        <div 
          ref={joystickRef}
          className="relative rounded-full cursor-pointer touch-none select-none"
          style={{
            width: size,
            height: size,
            backgroundColor: baseColor,
            border: `2px solid ${handleColor}`,
            touchAction: 'none'
          }}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          {/* Center indicator */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{ backgroundColor: handleColor }}
          />
          
          {/* Handle */}
          <div
            ref={handleRef}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg"
            style={{
              width: size / 3,
              height: size / 3,
              backgroundColor: handleColor,
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              cursor: isDesignMode || deviceStatus === 'offline' ? 'not-allowed' : 'grab',
              opacity: isDesignMode || deviceStatus === 'offline' ? 0.5 : 1
            }}
          />
        </div>
        
        {/* Output display */}
        <div className="text-xs text-muted-foreground mt-2">
          X: {output.x}, Y: {output.y}
        </div>
        
        {isDesignMode && (
          <div className="text-xs text-muted-foreground italic">
            Design Mode - Joystick disabled
          </div>
        )}
        
        {deviceStatus === 'offline' && (
          <div className="text-xs text-destructive">
            Device Offline
          </div>
        )}
      </div>
    );
  }
  
  // Render with container (default behavior)
  return (
    <Card className="h-full flex items-center justify-center" style={commonStyles}>
      <CardContent className="p-4 h-full w-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          {showLabel && (
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              <span className="font-medium">{widget.title}</span>
            </div>
          )}
          
          <div 
            ref={joystickRef}
            className="relative rounded-full cursor-pointer touch-none select-none"
            style={{
              width: size,
              height: size,
              backgroundColor: baseColor,
              border: `2px solid ${handleColor}`,
              touchAction: 'none'
            }}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
          >
            {/* Center indicator */}
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
              style={{ backgroundColor: handleColor }}
            />
            
            {/* Handle */}
            <div
              ref={handleRef}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg"
              style={{
                width: size / 3,
                height: size / 3,
                backgroundColor: handleColor,
                transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                cursor: isDesignMode || deviceStatus === 'offline' ? 'not-allowed' : 'grab',
                opacity: isDesignMode || deviceStatus === 'offline' ? 0.5 : 1
              }}
            />
          </div>
          
          {/* Output display */}
          <div className="text-xs text-muted-foreground mt-2">
            X: {output.x}, Y: {output.y}
          </div>
          
          {isDesignMode && (
            <div className="text-xs text-muted-foreground italic">
              Design Mode - Joystick disabled
            </div>
          )}
          
          {deviceStatus === 'offline' && (
            <div className="text-xs text-destructive">
              Device Offline
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};