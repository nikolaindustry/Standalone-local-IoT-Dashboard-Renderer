import React, { useState, useEffect } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompassWidgetRendererProps {
  widget: IoTDashboardWidget;
  localValue: any;
  handleValueChange: (value: any) => void;
  executeAction: (actionId: string, parameters?: Record<string, any>) => void;
  commonStyles: React.CSSProperties;
}

export const CompassWidgetRenderer: React.FC<CompassWidgetRendererProps> = ({
  widget,
  localValue,
  handleValueChange,
  executeAction,
  commonStyles
}) => {
  const [compassValue, setCompassValue] = useState(() => {
    const val = localValue || widget.config.defaultValue || 0;
    return typeof val === 'string' ? parseFloat(val) || 0 : val;
  });
  
  useEffect(() => {
    const val = localValue || widget.config.defaultValue || 0;
    const numVal = typeof val === 'string' ? parseFloat(val) || 0 : val;
    setCompassValue(numVal);
  }, [localValue, widget.config.defaultValue]);
  
  const handleValueUpdate = (value: number) => {
    setCompassValue(value);
    handleValueChange(value);
    // Execute action to send value over WebSocket
    executeAction('valueChange', { value });
  };
  
  // Get compass configuration with defaults
  const compassSize = widget.config.compassSize || 200;
  const compassColor = widget.config.compassColor || '#3b82f6';
  const compassBackgroundColor = widget.config.compassBackgroundColor || '#f8fafc';
  const compassNeedleColor = widget.config.compassNeedleColor || '#ef4444';
  const showDirectionLabels = widget.config.compassDirectionLabels !== false;
  const showCardinalDirections = widget.config.compassCardinalDirections !== false;
  const showValue = widget.config.compassShowValue !== false;
  const valuePrecision = widget.config.compassValuePrecision || 0;
  const valueUnit = widget.config.compassValueUnit || '°';
  const borderRadius = widget.config.compassBorderRadius || 100;
  const borderWidth = widget.config.compassBorderWidth || 2;
  const borderColor = widget.config.compassBorderColor || '#e2e8f0';
  const showContainer = widget.config.compassShowContainer !== false;
  const needleWidth = widget.config.compassNeedleWidth || 4;
  const needleLength = widget.config.compassNeedleLength || 0.7; // Percentage of radius
  const needleStyle = widget.config.compassNeedleStyle || 'arrow';
  
  // Calculate needle position
  const rotation = (compassValue % 360 + 360) % 360; // Normalize to 0-360
  const centerX = compassSize / 2;
  const centerY = compassSize / 2;
  const radius = compassSize / 2 - 10;
  
  // Determine if container should be shown
  if (!showContainer) {
    return (
      <div className="h-full w-full flex items-center justify-center" style={commonStyles}>
        <CompassDisplay 
          size={compassSize}
          value={compassValue}
          color={compassColor}
          backgroundColor={compassBackgroundColor}
          needleColor={compassNeedleColor}
          showDirectionLabels={showDirectionLabels}
          showCardinalDirections={showCardinalDirections}
          showValue={showValue}
          valuePrecision={valuePrecision}
          valueUnit={valueUnit}
          borderRadius={borderRadius}
          borderWidth={borderWidth}
          borderColor={borderColor}
          needleWidth={needleWidth}
          needleLength={needleLength}
          needleStyle={needleStyle}
        />
      </div>
    );
  }
  
  return (
    <Card className="h-full" style={commonStyles}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{widget.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 p-4 flex items-center justify-center">
        <CompassDisplay 
          size={compassSize}
          value={compassValue}
          color={compassColor}
          backgroundColor={compassBackgroundColor}
          needleColor={compassNeedleColor}
          showDirectionLabels={showDirectionLabels}
          showCardinalDirections={showCardinalDirections}
          showValue={showValue}
          valuePrecision={valuePrecision}
          valueUnit={valueUnit}
          borderRadius={borderRadius}
          borderWidth={borderWidth}
          borderColor={borderColor}
          needleWidth={needleWidth}
          needleLength={needleLength}
          needleStyle={needleStyle}
        />
      </CardContent>
    </Card>
  );
};

interface CompassDisplayProps {
  size: number;
  value: number;
  color: string;
  backgroundColor: string;
  needleColor: string;
  showDirectionLabels: boolean;
  showCardinalDirections: boolean;
  showValue: boolean;
  valuePrecision: number;
  valueUnit: string;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  needleWidth: number;
  needleLength: number;
  needleStyle: string;
}

const CompassDisplay: React.FC<CompassDisplayProps> = ({
  size,
  value,
  color,
  backgroundColor,
  needleColor,
  showDirectionLabels,
  showCardinalDirections,
  showValue,
  valuePrecision,
  valueUnit,
  borderRadius,
  borderWidth,
  borderColor,
  needleWidth,
  needleLength,
  needleStyle
}) => {
  const rotation = (value % 360 + 360) % 360; // Normalize to 0-360
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 10;
  const needleLengthPixels = radius * needleLength;
  
  // Generate tick marks
  const ticks = [];
  for (let i = 0; i < 360; i += 15) {
    const angle = (i * Math.PI) / 180;
    const isMajor = i % 45 === 0;
    const tickLength = isMajor ? 15 : 8;
    const tickWidth = isMajor ? 2 : 1;
    
    const x1 = centerX + (radius - tickLength) * Math.sin(angle);
    const y1 = centerY - (radius - tickLength) * Math.cos(angle);
    const x2 = centerX + radius * Math.sin(angle);
    const y2 = centerY - radius * Math.cos(angle);
    
    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={tickWidth}
      />
    );
  }
  
  // Generate cardinal direction labels
  const cardinalLabels = showCardinalDirections ? (
    <>
      <text x={centerX} y={centerY - radius + 20} textAnchor="middle" fill={color} fontSize="14" fontWeight="bold">N</text>
      <text x={centerX + radius - 15} y={centerY + 5} textAnchor="middle" fill={color} fontSize="14" fontWeight="bold">E</text>
      <text x={centerX} y={centerY + radius - 5} textAnchor="middle" fill={color} fontSize="14" fontWeight="bold">S</text>
      <text x={centerX - radius + 15} y={centerY + 5} textAnchor="middle" fill={color} fontSize="14" fontWeight="bold">W</text>
    </>
  ) : null;
  
  // Generate direction labels (N, NE, E, etc.)
  const directionLabels = showDirectionLabels ? (
    <>
      <text x={centerX} y={centerY - radius + 35} textAnchor="middle" fill={color} fontSize="10">N</text>
      <text x={centerX + radius * 0.7 - 10} y={centerY - radius * 0.7 + 15} textAnchor="middle" fill={color} fontSize="10">NE</text>
      <text x={centerX + radius - 10} y={centerY + 5} textAnchor="middle" fill={color} fontSize="10">E</text>
      <text x={centerX + radius * 0.7 - 10} y={centerY + radius * 0.7 - 5} textAnchor="middle" fill={color} fontSize="10">SE</text>
      <text x={centerX} y={centerY + radius - 15} textAnchor="middle" fill={color} fontSize="10">S</text>
      <text x={centerX - radius * 0.7 + 10} y={centerY + radius * 0.7 - 5} textAnchor="middle" fill={color} fontSize="10">SW</text>
      <text x={centerX - radius + 10} y={centerY + 5} textAnchor="middle" fill={color} fontSize="10">W</text>
      <text x={centerX - radius * 0.7 + 10} y={centerY - radius * 0.7 + 15} textAnchor="middle" fill={color} fontSize="10">NW</text>
    </>
  ) : null;
  
  // Generate value display
  const valueDisplay = showValue ? (
    <text 
      x={centerX} 
      y={centerY + 30} 
      textAnchor="middle" 
      fill={color} 
      fontSize="16" 
      fontWeight="bold"
    >
      {value.toFixed(valuePrecision)}{valueUnit}
    </text>
  ) : null;
  
  // Create needle based on style
  const needle = (
    <g transform={`rotate(${rotation} ${centerX} ${centerY})`}>
      {needleStyle === 'arrow' ? (
        <>
          <line
            x1={centerX}
            y1={centerY}
            x2={centerX}
            y2={centerY - needleLengthPixels}
            stroke={needleColor}
            strokeWidth={needleWidth}
          />
          <polygon
            points={`${centerX - needleWidth},${centerY - needleLengthPixels + 10} ${centerX},${centerY - needleLengthPixels - 5} ${centerX + needleWidth},${centerY - needleLengthPixels + 10}`}
            fill={needleColor}
          />
        </>
      ) : needleStyle === 'pointer' ? (
        <>
          <line
            x1={centerX}
            y1={centerY}
            x2={centerX}
            y2={centerY - needleLengthPixels}
            stroke={needleColor}
            strokeWidth={needleWidth}
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={needleWidth * 1.5}
            fill={needleColor}
          />
        </>
      ) : (
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX}
          y2={centerY - needleLengthPixels}
          stroke={needleColor}
          strokeWidth={needleWidth}
        />
      )}
    </g>
  );
  
  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Compass background */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={borderWidth}
          style={{ borderRadius: `${borderRadius}px` }}
        />
        
        {/* Tick marks */}
        {ticks}
        
        {/* Cardinal direction labels */}
        {cardinalLabels}
        
        {/* Direction labels */}
        {directionLabels}
        
        {/* Needle */}
        {needle}
        
        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={needleWidth * 2}
          fill={needleColor}
        />
        
        {/* Value display */}
        {valueDisplay}
      </svg>
    </div>
  );
};