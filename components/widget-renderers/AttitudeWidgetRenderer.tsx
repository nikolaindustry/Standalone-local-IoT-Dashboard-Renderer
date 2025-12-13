import React, { useState, useEffect } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AttitudeWidgetRendererProps {
  widget: IoTDashboardWidget;
  localValue: any;
  handleValueChange: (value: any) => void;
  executeAction: (actionId: string, parameters?: Record<string, any>) => void;
  commonStyles: React.CSSProperties;
}

export const AttitudeWidgetRenderer: React.FC<AttitudeWidgetRendererProps> = ({
  widget,
  localValue,
  handleValueChange,
  executeAction,
  commonStyles
}) => {
  const [roll, setRoll] = useState(0);
  const [pitch, setPitch] = useState(0);
  
  useEffect(() => {
    if (localValue && typeof localValue === 'object') {
      setRoll(localValue.roll || 0);
      setPitch(localValue.pitch || 0);
    }
  }, [localValue]);
  
  const handleValueUpdate = (newRoll: number, newPitch: number) => {
    setRoll(newRoll);
    setPitch(newPitch);
    const value = { roll: newRoll, pitch: newPitch };
    handleValueChange(value);
    executeAction('valueChange', { value });
  };
  
  // Get attitude configuration with defaults
  const displayType = widget.config.displayType || 'traditional';
  const attitudeSize = widget.config.attitudeSize || 250;
  const skyColor = widget.config.attitudeSkyColor || '#87ceeb';
  const groundColor = widget.config.attitudeGroundColor || '#8b6f47';
  const aircraftColor = widget.config.attitudeAircraftColor || '#ffffff';
  const backgroundColor = widget.config.attitudeBackgroundColor || '#1f2937';
  const showValues = widget.config.attitudeShowValues !== false;
  const showDegreeMarkings = widget.config.attitudeShowDegreeMarkings !== false;
  const borderRadius = widget.config.attitudeBorderRadius || 8;
  const borderWidth = widget.config.attitudeBorderWidth || 2;
  const borderColor = widget.config.attitudeBorderColor || '#374151';
  const showContainer = widget.config.attitudeShowContainer !== false;
  const animationSpeed = widget.config.attitudeAnimationSpeed || 'smooth';
  
  if (!showContainer) {
    return (
      <div className="h-full w-full flex items-center justify-center" style={commonStyles}>
        <AttitudeDisplay 
          displayType={displayType}
          size={attitudeSize}
          roll={roll}
          pitch={pitch}
          skyColor={skyColor}
          groundColor={groundColor}
          aircraftColor={aircraftColor}
          backgroundColor={backgroundColor}
          showValues={showValues}
          showDegreeMarkings={showDegreeMarkings}
          borderRadius={borderRadius}
          borderWidth={borderWidth}
          borderColor={borderColor}
          animationSpeed={animationSpeed}
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
        <AttitudeDisplay 
          displayType={displayType}
          size={attitudeSize}
          roll={roll}
          pitch={pitch}
          skyColor={skyColor}
          groundColor={groundColor}
          aircraftColor={aircraftColor}
          backgroundColor={backgroundColor}
          showValues={showValues}
          showDegreeMarkings={showDegreeMarkings}
          borderRadius={borderRadius}
          borderWidth={borderWidth}
          borderColor={borderColor}
          animationSpeed={animationSpeed}
        />
      </CardContent>
    </Card>
  );
};

interface AttitudeDisplayProps {
  displayType: string;
  size: number;
  roll: number;
  pitch: number;
  skyColor: string;
  groundColor: string;
  aircraftColor: string;
  backgroundColor: string;
  showValues: boolean;
  showDegreeMarkings: boolean;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  animationSpeed: string;
}

const AttitudeDisplay: React.FC<AttitudeDisplayProps> = ({
  displayType,
  size,
  roll,
  pitch,
  skyColor,
  groundColor,
  aircraftColor,
  backgroundColor,
  showValues,
  showDegreeMarkings,
  borderRadius,
  borderWidth,
  borderColor,
  animationSpeed
}) => {
  // Render different display types
  switch (displayType) {
    case 'digital':
      return <DigitalAttitudeDisplay roll={roll} pitch={pitch} size={size} backgroundColor={backgroundColor} aircraftColor={aircraftColor} animationSpeed={animationSpeed} />;
    case 'numeric':
      return <NumericAttitudeDisplay roll={roll} pitch={pitch} size={size} backgroundColor={backgroundColor} aircraftColor={aircraftColor} animationSpeed={animationSpeed} />;
    case 'minimal':
      return <MinimalAttitudeDisplay roll={roll} pitch={pitch} size={size} skyColor={skyColor} groundColor={groundColor} aircraftColor={aircraftColor} backgroundColor={backgroundColor} animationSpeed={animationSpeed} />;
    case 'compact':
      return <CompactAttitudeDisplay roll={roll} pitch={pitch} size={size} skyColor={skyColor} groundColor={groundColor} aircraftColor={aircraftColor} animationSpeed={animationSpeed} />;
    case 'modern':
      return <ModernAttitudeDisplay roll={roll} pitch={pitch} size={size} skyColor={skyColor} groundColor={groundColor} aircraftColor={aircraftColor} backgroundColor={backgroundColor} showValues={showValues} animationSpeed={animationSpeed} />;
    case 'traditional':
    default:
      return <TraditionalAttitudeDisplay 
        size={size}
        roll={roll}
        pitch={pitch}
        skyColor={skyColor}
        groundColor={groundColor}
        aircraftColor={aircraftColor}
        backgroundColor={backgroundColor}
        showValues={showValues}
        showDegreeMarkings={showDegreeMarkings}
        borderRadius={borderRadius}
        borderWidth={borderWidth}
        borderColor={borderColor}
        animationSpeed={animationSpeed}
      />;
  }
};

// Traditional Attitude Indicator (original implementation)
const TraditionalAttitudeDisplay: React.FC<Omit<AttitudeDisplayProps, 'displayType'>> = ({
  size,
  roll,
  pitch,
  skyColor,
  groundColor,
  aircraftColor,
  backgroundColor,
  showValues,
  showDegreeMarkings,
  borderRadius,
  borderWidth,
  borderColor,
  animationSpeed
}) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const instrumentRadius = size / 2 - 20;
  
  // Clamp pitch to reasonable values (-90 to 90 degrees)
  const clampedPitch = Math.max(-90, Math.min(90, pitch));
  
  // Calculate pitch displacement (pixels per degree)
  const pitchScale = instrumentRadius / 45; // 45 degrees fills half the instrument
  const pitchOffset = clampedPitch * pitchScale;
  
  // Animation transition class
  const transitionClass = animationSpeed === 'fast' ? 'transition-all duration-200' 
    : animationSpeed === 'slow' ? 'transition-all duration-1000'
    : 'transition-all duration-500';
  
  // Generate pitch ladder lines
  const pitchLines = [];
  for (let deg = -90; deg <= 90; deg += 10) {
    const y = centerY - (deg * pitchScale) + pitchOffset;
    const lineLength = deg === 0 ? 60 : deg % 30 === 0 ? 40 : 30;
    const lineWidth = deg === 0 ? 3 : 2;
    
    if (y > 10 && y < size - 10) {
      pitchLines.push(
        <g key={deg}>
          <line
            x1={centerX - lineLength / 2}
            y1={y}
            x2={centerX + lineLength / 2}
            y2={y}
            stroke="white"
            strokeWidth={lineWidth}
            opacity={0.9}
          />
          {showDegreeMarkings && deg !== 0 && deg % 30 === 0 && (
            <>
              <text
                x={centerX - lineLength / 2 - 15}
                y={y + 4}
                fill="white"
                fontSize="11"
                fontWeight="bold"
                textAnchor="end"
              >
                {Math.abs(deg)}
              </text>
              <text
                x={centerX + lineLength / 2 + 15}
                y={y + 4}
                fill="white"
                fontSize="11"
                fontWeight="bold"
                textAnchor="start"
              >
                {Math.abs(deg)}
              </text>
            </>
          )}
        </g>
      );
    }
  }
  
  // Generate roll markings
  const rollMarkings = [];
  const rollAngles = [0, 10, 20, 30, 45, 60, 90];
  rollAngles.forEach(angle => {
    [-angle, angle].forEach(deg => {
      if (deg === 0) {
        rollMarkings.push(
          <polygon
            key={deg}
            points={`${centerX},${centerY - instrumentRadius + 10} ${centerX - 6},${centerY - instrumentRadius + 20} ${centerX + 6},${centerY - instrumentRadius + 20}`}
            fill={aircraftColor}
          />
        );
      } else {
        const rad = (deg * Math.PI) / 180;
        const x = centerX + (instrumentRadius - 15) * Math.sin(rad);
        const y = centerY - (instrumentRadius - 15) * Math.cos(rad);
        const isMajor = deg % 30 === 0 || Math.abs(deg) === 45;
        
        rollMarkings.push(
          <line
            key={deg}
            x1={centerX + (instrumentRadius - (isMajor ? 15 : 10)) * Math.sin(rad)}
            y1={centerY - (instrumentRadius - (isMajor ? 15 : 10)) * Math.cos(rad)}
            x2={centerX + (instrumentRadius - 5) * Math.sin(rad)}
            y2={centerY - (instrumentRadius - 5) * Math.cos(rad)}
            stroke={aircraftColor}
            strokeWidth={isMajor ? 2 : 1}
          />
        );
      }
    });
  });
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        style={{
          borderRadius: `${borderRadius}px`,
          border: `${borderWidth}px solid ${borderColor}`,
          background: backgroundColor
        }}
      >
        <defs>
          <clipPath id="instrument-clip">
            <circle cx={centerX} cy={centerY} r={instrumentRadius} />
          </clipPath>
        </defs>
        
        {/* Outer housing background */}
        <circle
          cx={centerX}
          cy={centerY}
          r={instrumentRadius + 5}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={2}
        />
        
        {/* Rotating horizon group */}
        <g clipPath="url(#instrument-clip)">
          <g 
            transform={`rotate(${-roll} ${centerX} ${centerY})`}
            className={transitionClass}
          >
            {/* Sky */}
            <rect
              x={0}
              y={0}
              width={size}
              height={centerY + pitchOffset}
              fill={skyColor}
            />
            
            {/* Ground */}
            <rect
              x={0}
              y={centerY + pitchOffset}
              width={size}
              height={size}
              fill={groundColor}
            />
            
            {/* Pitch ladder */}
            <g className={transitionClass}>
              {pitchLines}
            </g>
            
            {/* Horizon line */}
            <line
              x1={0}
              y1={centerY + pitchOffset}
              x2={size}
              y2={centerY + pitchOffset}
              stroke="white"
              strokeWidth={3}
            />
          </g>
        </g>
        
        {/* Aircraft symbol (fixed) */}
        <g>
          {/* Center dot */}
          <circle
            cx={centerX}
            cy={centerY}
            r={4}
            fill={aircraftColor}
          />
          
          {/* Wings */}
          <line
            x1={centerX - 50}
            y1={centerY}
            x2={centerX - 15}
            y2={centerY}
            stroke={aircraftColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <line
            x1={centerX + 15}
            y1={centerY}
            x2={centerX + 50}
            y2={centerY}
            stroke={aircraftColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
          
          {/* Wing tips */}
          <line
            x1={centerX - 50}
            y1={centerY}
            x2={centerX - 50}
            y2={centerY + 8}
            stroke={aircraftColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <line
            x1={centerX + 50}
            y1={centerY}
            x2={centerX + 50}
            y2={centerY + 8}
            stroke={aircraftColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
        
        {/* Roll markings (fixed) */}
        {showDegreeMarkings && rollMarkings}
        
        {/* Roll indicator triangle */}
        <g transform={`rotate(${-roll} ${centerX} ${centerY})`} className={transitionClass}>
          <polygon
            points={`${centerX},${centerY - instrumentRadius + 2} ${centerX - 6},${centerY - instrumentRadius + 12} ${centerX + 6},${centerY - instrumentRadius + 12}`}
            fill="#ef4444"
          />
        </g>
        
        {/* Instrument border */}
        <circle
          cx={centerX}
          cy={centerY}
          r={instrumentRadius}
          fill="none"
          stroke={borderColor}
          strokeWidth={3}
        />
      </svg>
      
      {/* Value displays */}
      {showValues && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-around text-xs font-mono">
          <div className="bg-black/70 text-white px-2 py-1 rounded">
            Roll: {roll.toFixed(1)}°
          </div>
          <div className="bg-black/70 text-white px-2 py-1 rounded">
            Pitch: {pitch.toFixed(1)}°
          </div>
        </div>
      )}
    </div>
  );
};

// Digital Display Type
const DigitalAttitudeDisplay: React.FC<{
  roll: number;
  pitch: number;
  size: number;
  backgroundColor: string;
  aircraftColor: string;
  animationSpeed: string;
}> = ({ roll, pitch, size, backgroundColor, aircraftColor, animationSpeed }) => {
  const transitionClass = animationSpeed === 'fast' ? 'transition-all duration-200' 
    : animationSpeed === 'slow' ? 'transition-all duration-1000'
    : 'transition-all duration-500';

  return (
    <div 
      className={`relative ${transitionClass}`}
      style={{ 
        width: size,
        height: size,
        backgroundColor,
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}
    >
      <div className="text-center">
        <div className="text-sm text-muted-foreground mb-2">ROLL</div>
        <div className="text-5xl font-mono font-bold" style={{ color: aircraftColor }}>
          {roll.toFixed(1)}°
        </div>
        <div className="w-full mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full ${transitionClass}`}
            style={{ 
              width: `${Math.abs(roll / 180 * 100)}%`,
              backgroundColor: roll < 0 ? '#ef4444' : '#22c55e',
              marginLeft: roll < 0 ? '0' : `${50 - Math.abs(roll / 180 * 50)}%`
            }}
          />
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-sm text-muted-foreground mb-2">PITCH</div>
        <div className="text-5xl font-mono font-bold" style={{ color: aircraftColor }}>
          {pitch.toFixed(1)}°
        </div>
        <div className="w-full mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full ${transitionClass}`}
            style={{ 
              width: `${Math.abs(pitch / 90 * 100)}%`,
              backgroundColor: pitch < 0 ? '#3b82f6' : '#f97316',
              marginLeft: pitch < 0 ? '0' : `${50 - Math.abs(pitch / 90 * 50)}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Numeric Readout Type
const NumericAttitudeDisplay: React.FC<{
  roll: number;
  pitch: number;
  size: number;
  backgroundColor: string;
  aircraftColor: string;
  animationSpeed: string;
}> = ({ roll, pitch, size, backgroundColor, aircraftColor, animationSpeed }) => {
  const transitionClass = animationSpeed === 'fast' ? 'transition-all duration-200' 
    : animationSpeed === 'slow' ? 'transition-all duration-1000'
    : 'transition-all duration-500';

  return (
    <div 
      className={`grid grid-cols-2 gap-4 p-6 ${transitionClass}`}
      style={{ 
        width: size,
        height: size,
        backgroundColor,
        borderRadius: '8px'
      }}
    >
      <div className="flex flex-col items-center justify-center border-r border-muted">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Roll</div>
        <div className="text-6xl font-bold font-mono" style={{ color: aircraftColor }}>
          {Math.abs(roll).toFixed(0)}
        </div>
        <div className="text-lg font-medium text-muted-foreground mt-1">
          {roll < 0 ? 'L' : roll > 0 ? 'R' : '-'}
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Pitch</div>
        <div className="text-6xl font-bold font-mono" style={{ color: aircraftColor }}>
          {Math.abs(pitch).toFixed(0)}
        </div>
        <div className="text-lg font-medium text-muted-foreground mt-1">
          {pitch < 0 ? 'D' : pitch > 0 ? 'U' : '-'}
        </div>
      </div>
    </div>
  );
};

// Minimal Indicator Type
const MinimalAttitudeDisplay: React.FC<{
  roll: number;
  pitch: number;
  size: number;
  skyColor: string;
  groundColor: string;
  aircraftColor: string;
  backgroundColor: string;
  animationSpeed: string;
}> = ({ roll, pitch, size, skyColor, groundColor, aircraftColor, backgroundColor, animationSpeed }) => {
  const transitionClass = animationSpeed === 'fast' ? 'transition-all duration-200' 
    : animationSpeed === 'slow' ? 'transition-all duration-1000'
    : 'transition-all duration-500';
  
  const centerX = size / 2;
  const centerY = size / 2;
  const pitchScale = 2;
  const pitchOffset = pitch * pitchScale;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-hidden" style={{ borderRadius: '8px', backgroundColor }}>
        <defs>
          <clipPath id="minimal-clip">
            <circle cx={centerX} cy={centerY} r={size / 2 - 10} />
          </clipPath>
        </defs>
        
        <g clipPath="url(#minimal-clip)" transform={`rotate(${-roll} ${centerX} ${centerY})`} className={transitionClass}>
          {/* Sky */}
          <rect x="0" y={centerY - pitchOffset - size} width={size} height={size} fill={skyColor} />
          {/* Ground */}
          <rect x="0" y={centerY - pitchOffset} width={size} height={size} fill={groundColor} />
          {/* Horizon line */}
          <line
            x1="0"
            y1={centerY - pitchOffset}
            x2={size}
            y2={centerY - pitchOffset}
            stroke={aircraftColor}
            strokeWidth={2}
          />
        </g>
        
        {/* Aircraft symbol */}
        <g>
          <line x1={centerX - 40} y1={centerY} x2={centerX - 10} y2={centerY} stroke={aircraftColor} strokeWidth={3} />
          <line x1={centerX + 10} y1={centerY} x2={centerX + 40} y2={centerY} stroke={aircraftColor} strokeWidth={3} />
          <circle cx={centerX} cy={centerY} r={3} fill={aircraftColor} />
        </g>
      </svg>
    </div>
  );
};

// Compact Gauge Type
const CompactAttitudeDisplay: React.FC<{
  roll: number;
  pitch: number;
  size: number;
  skyColor: string;
  groundColor: string;
  aircraftColor: string;
  animationSpeed: string;
}> = ({ roll, pitch, size, skyColor, groundColor, aircraftColor, animationSpeed }) => {
  const transitionClass = animationSpeed === 'fast' ? 'transition-all duration-200' 
    : animationSpeed === 'slow' ? 'transition-all duration-1000'
    : 'transition-all duration-500';

  return (
    <div className="flex flex-col items-center justify-center gap-4" style={{ width: size, height: size }}>
      {/* Roll gauge */}
      <div className="w-full px-4">
        <div className="text-xs text-center mb-1 text-muted-foreground">ROLL</div>
        <div className="relative h-8 bg-muted rounded-full overflow-hidden">
          <div 
            className={`absolute h-full w-1 bg-red-500 ${transitionClass}`}
            style={{ left: `${50 + (roll / 180 * 50)}%`, transform: 'translateX(-50%)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs font-mono font-bold">{roll.toFixed(0)}°</div>
          </div>
        </div>
      </div>
      
      {/* Pitch gauge */}
      <div className="w-full px-4">
        <div className="text-xs text-center mb-1 text-muted-foreground">PITCH</div>
        <div className="relative h-8 bg-muted rounded-full overflow-hidden">
          <div 
            className={`absolute h-full w-1 bg-blue-500 ${transitionClass}`}
            style={{ left: `${50 + (pitch / 90 * 50)}%`, transform: 'translateX(-50%)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs font-mono font-bold">{pitch.toFixed(0)}°</div>
          </div>
        </div>
      </div>
      
      {/* Mini horizon */}
      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2" style={{ borderColor: aircraftColor }}>
        <svg width="80" height="80" className="overflow-hidden">
          <g transform={`rotate(${-roll} 40 40)`} className={transitionClass}>
            <rect x="0" y={40 - pitch} width="80" height="40" fill={skyColor} />
            <rect x="0" y={40 - pitch + 40} width="80" height="40" fill={groundColor} />
            <line x1="0" y1={40 - pitch} x2="80" y2={40 - pitch} stroke={aircraftColor} strokeWidth={1} />
          </g>
          <line x1="30" y1="40" x2="50" y2="40" stroke={aircraftColor} strokeWidth={2} />
        </svg>
      </div>
    </div>
  );
};

// Modern Indicator Type
const ModernAttitudeDisplay: React.FC<{
  roll: number;
  pitch: number;
  size: number;
  skyColor: string;
  groundColor: string;
  aircraftColor: string;
  backgroundColor: string;
  showValues: boolean;
  animationSpeed: string;
}> = ({ roll, pitch, size, skyColor, groundColor, aircraftColor, backgroundColor, showValues, animationSpeed }) => {
  const transitionClass = animationSpeed === 'fast' ? 'transition-all duration-200' 
    : animationSpeed === 'slow' ? 'transition-all duration-1000'
    : 'transition-all duration-500';
  
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 30;
  const pitchScale = radius / 45;
  const pitchOffset = pitch * pitchScale;

  return (
    <div className="relative" style={{ width: size, height: size, backgroundColor, borderRadius: '12px', padding: '20px' }}>
      <svg width={size - 40} height={size - 40} className="overflow-hidden" style={{ borderRadius: '50%' }}>
        <defs>
          <linearGradient id="sky-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: skyColor, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: skyColor, stopOpacity: 0.6 }} />
          </linearGradient>
          <linearGradient id="ground-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: groundColor, stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: groundColor, stopOpacity: 1 }} />
          </linearGradient>
          <clipPath id="modern-clip">
            <circle cx={centerX - 20} cy={centerY - 20} r={radius} />
          </clipPath>
        </defs>
        
        <g clipPath="url(#modern-clip)" transform={`rotate(${-roll} ${centerX - 20} ${centerY - 20})`} className={transitionClass}>
          <rect x="0" y={centerY - 20 - pitchOffset - size} width={size} height={size} fill="url(#sky-gradient)" />
          <rect x="0" y={centerY - 20 - pitchOffset} width={size} height={size} fill="url(#ground-gradient)" />
          <line
            x1="0"
            y1={centerY - 20 - pitchOffset}
            x2={size}
            y2={centerY - 20 - pitchOffset}
            stroke={aircraftColor}
            strokeWidth={3}
          />
          {/* Pitch ladder */}
          {[-30, -20, -10, 10, 20, 30].map(deg => (
            <g key={deg}>
              <line
                x1={centerX - 30}
                y1={centerY - 20 - pitchOffset - deg * pitchScale}
                x2={centerX + 10}
                y2={centerY - 20 - pitchOffset - deg * pitchScale}
                stroke={aircraftColor}
                strokeWidth={deg % 20 === 0 ? 2 : 1}
                opacity={0.7}
              />
            </g>
          ))}
        </g>
        
        {/* Aircraft symbol */}
        <g>
          <line x1={centerX - 60} y1={centerY - 20} x2={centerX - 30} y2={centerY - 20} stroke={aircraftColor} strokeWidth={4} strokeLinecap="round" />
          <line x1={centerX - 10} y1={centerY - 20} x2={centerX + 20} y2={centerY - 20} stroke={aircraftColor} strokeWidth={4} strokeLinecap="round" />
          <circle cx={centerX - 20} cy={centerY - 20} r={4} fill={aircraftColor} />
        </g>
        
        {/* Border circle */}
        <circle cx={centerX - 20} cy={centerY - 20} r={radius} fill="none" stroke={aircraftColor} strokeWidth={2} opacity={0.5} />
      </svg>
      
      {showValues && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 text-xs font-mono">
          <div className="bg-black/50 text-white px-3 py-1 rounded-full">
            R: {roll.toFixed(1)}°
          </div>
          <div className="bg-black/50 text-white px-3 py-1 rounded-full">
            P: {pitch.toFixed(1)}°
          </div>
        </div>
      )}
    </div>
  );
};
