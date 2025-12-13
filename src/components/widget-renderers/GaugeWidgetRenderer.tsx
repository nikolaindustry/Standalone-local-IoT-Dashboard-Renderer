import React from 'react';
import { IoTDashboardWidget, GaugeThreshold } from '../../types/index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getIconComponent } from './iconHelpers';

interface GaugeWidgetRendererProps {
  widget: IoTDashboardWidget;
  localValue: any;
  lastUpdate?: Date;
  commonStyles: React.CSSProperties;
}

// Helper function to get the appropriate color based on thresholds
const getThresholdColor = (value: number, thresholds: GaugeThreshold[], defaultColor: string): string => {
  // Sort thresholds by value
  const sortedThresholds = [...thresholds].sort((a, b) => a.value - b.value);
  
  // Find the appropriate color based on the value
  for (let i = sortedThresholds.length - 1; i >= 0; i--) {
    if (value >= sortedThresholds[i].value) {
      return sortedThresholds[i].color;
    }
  }
  
  // If no threshold is met, return the default color
  return defaultColor;
};

// Helper function to render different gauge types
const renderGaugeByType = ({
  widget,
  gaugeValue,
  percentage,
  minValue,
  maxValue,
  progressColor,
  iconSize,
  IconComponent,
  enableAnimations = true,
  animationDuration = 500,
  animationEasing = 'ease-in-out',
  arcStartAngle = 135,
  arcEndAngle = 405,
  arcWidth = 10,
  needleStyle = 'classic',
  needleColor = '#ef4444',
  showCenterPivot = true
}: {
  widget: IoTDashboardWidget;
  gaugeValue: number;
  percentage: number;
  minValue: number;
  maxValue: number;
  progressColor: string;
  iconSize: number;
  IconComponent: React.ComponentType<any>;
  enableAnimations?: boolean;
  animationDuration?: number;
  animationEasing?: string;
  arcStartAngle?: number;
  arcEndAngle?: number;
  arcWidth?: number;
  needleStyle?: string;
  needleColor?: string;
  showCenterPivot?: boolean;
}) => {
  const gaugeType = widget.config.gaugeType || 'linear';
  
  // Determine the color to use based on thresholds or default
  const effectiveColor = widget.config.useThresholdColors && widget.config.thresholds
    ? getThresholdColor(gaugeValue, widget.config.thresholds, progressColor)
    : progressColor;
  
  // Helper function to get gauge width class for linear gauge
  const getGaugeWidthClass = () => {
    switch (widget.config.gaugeWidth) {
      case 'narrow':
        return 'w-[70%]';
      case 'compact':
        return 'w-1/2';
      case 'custom':
        return '';
      default: // full
        return 'w-full';
    }
  };
  
  switch (gaugeType) {
    case 'circular':
      // Calculate arc parameters
      const circularRadius = 45;
      const circularCircumference = 2 * Math.PI * circularRadius;
      const arcSpan = arcEndAngle - arcStartAngle;
      const arcLength = (arcSpan / 360) * circularCircumference;
      const arcOffset = arcLength - (arcLength * percentage) / 100;
      
      // Calculate needle angle for dial mode
      const needleAngle = arcStartAngle + (arcSpan * percentage / 100);
      const needleLength = circularRadius - 5;
      const needleX = 50 + needleLength * Math.cos((needleAngle - 90) * Math.PI / 180);
      const needleY = 50 + needleLength * Math.sin((needleAngle - 90) * Math.PI / 180);
      
      return (
        <div className="flex justify-center items-center h-full">
          <div className="relative w-full max-w-xs aspect-square">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background arc */}
              <circle
                cx="50"
                cy="50"
                r={circularRadius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={arcWidth}
                strokeDasharray={arcLength}
                strokeDashoffset={0}
                transform={`rotate(${arcStartAngle - 90} 50 50)`}
                style={{
                  transition: enableAnimations ? `all ${animationDuration}ms ${animationEasing}` : 'none'
                }}
              />
              {/* Progress arc */}
              <circle
                cx="50"
                cy="50"
                r={circularRadius}
                fill="none"
                stroke={effectiveColor}
                strokeWidth={arcWidth}
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={arcOffset}
                transform={`rotate(${arcStartAngle - 90} 50 50)`}
                style={{
                  transition: enableAnimations ? `all ${animationDuration}ms ${animationEasing}` : 'none'
                }}
              />
              {/* Needle */}
              {needleStyle !== 'none' && (
                <>
                  <line
                    x1="50"
                    y1="50"
                    x2={needleX}
                    y2={needleY}
                    stroke={needleColor}
                    strokeWidth={widget.config.gaugeThumbSize ? widget.config.gaugeThumbSize / 10 : 2}
                    strokeLinecap="round"
                    style={{
                      transition: enableAnimations ? `all ${animationDuration}ms ${animationEasing}` : 'none'
                    }}
                  />
                  {showCenterPivot && (
                    <circle
                      cx="50"
                      cy="50"
                      r="3"
                      fill={needleColor}
                    />
                  )}
                </>
              )}
              {/* Center value */}
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dy="0.3em"
                fontSize="20"
                fontWeight="bold"
                fill="currentColor"
              >
                {gaugeValue}
              </text>
              {widget.config.unit && (
                <text
                  x="50"
                  y="65"
                  textAnchor="middle"
                  fontSize="10"
                  fill="currentColor"
                  className="text-muted-foreground"
                >
                  {widget.config.unit}
                </text>
              )}
            </svg>
          </div>
        </div>
      );
      
    case 'semiCircular':
      // Calculate semi-circular arc parameters
      const semiRadius = 40;
      const semiCircumference = Math.PI * semiRadius; // Half circle
      const semiArcSpan = arcEndAngle - arcStartAngle;
      const semiArcLength = (semiArcSpan / 180) * semiCircumference;
      const semiArcOffset = semiArcLength - (semiArcLength * percentage) / 100;
      
      // Calculate needle for semi-circular
      const semiNeedleAngle = arcStartAngle + (semiArcSpan * percentage / 100);
      const semiNeedleLength = semiRadius - 5;
      const semiNeedleX = 50 + semiNeedleLength * Math.cos((semiNeedleAngle - 90) * Math.PI / 180);
      const semiNeedleY = 50 + semiNeedleLength * Math.sin((semiNeedleAngle - 90) * Math.PI / 180);
      
      return (
        <div className="flex justify-center items-center h-full">
          <div className="relative w-full max-w-xs" style={{ aspectRatio: '2/1' }}>
            <svg className="w-full h-full" viewBox="0 0 100 60">
              {/* Background arc */}
              <path
                d={`M ${50 - semiRadius} 50 A ${semiRadius} ${semiRadius} 0 0 1 ${50 + semiRadius} 50`}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={arcWidth}
              />
              {/* Progress arc */}
              <path
                d={`M ${50 - semiRadius} 50 A ${semiRadius} ${semiRadius} 0 0 1 ${50 + semiRadius} 50`}
                fill="none"
                stroke={effectiveColor}
                strokeWidth={arcWidth}
                strokeLinecap="round"
                strokeDasharray={semiArcLength}
                strokeDashoffset={semiArcOffset}
                style={{
                  transition: enableAnimations ? `all ${animationDuration}ms ${animationEasing}` : 'none'
                }}
              />
              {/* Needle */}
              {needleStyle !== 'none' && (
                <>
                  <line
                    x1="50"
                    y1="50"
                    x2={semiNeedleX}
                    y2={semiNeedleY}
                    stroke={needleColor}
                    strokeWidth={widget.config.gaugeThumbSize ? widget.config.gaugeThumbSize / 10 : 2}
                    strokeLinecap="round"
                    style={{
                      transition: enableAnimations ? `all ${animationDuration}ms ${animationEasing}` : 'none'
                    }}
                  />
                  {showCenterPivot && (
                    <circle
                      cx="50"
                      cy="50"
                      r="3"
                      fill={needleColor}
                    />
                  )}
                </>
              )}
              {/* Center value */}
              <text
                x="50"
                y="42"
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill="currentColor"
              >
                {gaugeValue}
              </text>
              {widget.config.unit && (
                <text
                  x="50"
                  y="54"
                  textAnchor="middle"
                  fontSize="8"
                  fill="currentColor"
                  className="text-muted-foreground"
                >
                  {widget.config.unit}
                </text>
              )}
            </svg>
          </div>
        </div>
      );
      
    case 'donut':
      const donutRadius = 40;
      const donutCircumference = 2 * Math.PI * donutRadius;
      const donutOffset = donutCircumference - (donutCircumference * percentage) / 100;
      
      return (
        <div className="flex justify-center items-center h-full">
          <div className="relative w-full max-w-xs aspect-square">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={donutRadius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={arcWidth}
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={donutRadius}
                fill="none"
                stroke={effectiveColor}
                strokeWidth={arcWidth}
                strokeLinecap="round"
                strokeDasharray={donutCircumference}
                strokeDashoffset={donutOffset}
                transform="rotate(-90 50 50)"
                style={{
                  transition: enableAnimations ? `all ${animationDuration}ms ${animationEasing}` : 'none'
                }}
              />
              {/* Center value */}
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dy="0.3em"
                fontSize="20"
                fontWeight="bold"
                fill="currentColor"
              >
                {gaugeValue}
              </text>
              {widget.config.unit && (
                <text
                  x="50"
                  y="65"
                  textAnchor="middle"
                  fontSize="10"
                  fill="currentColor"
                  className="text-muted-foreground"
                >
                  {widget.config.unit}
                </text>
              )}
            </svg>
          </div>
        </div>
      );
      
    case 'arc':
      return (
        <div className="flex justify-center items-center h-full">
          <div className="relative w-full max-w-xs aspect-square">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background arc */}
              <path
                d="M 20 80 A 40 40 0 1 1 80 80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Progress arc */}
              <path
                d="M 20 80 A 40 40 0 1 1 80 80"
                fill="none"
                stroke={effectiveColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="188"
                strokeDashoffset={188 - (188 * percentage) / 100}
              />
              {/* Center value */}
              <text
                x="50"
                y="60"
                textAnchor="middle"
                fontSize="20"
                fontWeight="bold"
                fill="currentColor"
              >
                {gaugeValue}
              </text>
              {widget.config.unit && (
                <text
                  x="50"
                  y="70"
                  textAnchor="middle"
                  fontSize="10"
                  fill="currentColor"
                  className="text-muted-foreground"
                >
                  {widget.config.unit}
                </text>
              )}
            </svg>
          </div>
        </div>
      );
      
    case 'thermometer':
      return (
        <div className="flex justify-center">
          <div className="relative w-8 h-32">
            {/* Thermometer container */}
            <div 
              className="absolute inset-0 rounded-full rounded-t-none"
              style={{ 
                backgroundColor: '#e5e7eb',
                borderRadius: '0 0 16px 16px'
              }}
            />
            {/* Progress fill */}
            <div 
              className="absolute bottom-0 left-0 right-0 rounded-full rounded-t-none"
              style={{ 
                backgroundColor: effectiveColor,
                height: `${percentage}%`,
                borderRadius: '0 0 16px 16px'
              }}
            />
            {/* Thermometer bulb */}
            <div 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full"
              style={{ 
                backgroundColor: effectiveColor
              }}
            />
          </div>
        </div>
      );
      
    case 'digital':
      return (
        <div className="flex justify-center">
          <div className="text-center">
            <div className="text-3xl font-mono font-bold" style={{ color: effectiveColor }}>
              {gaugeValue}
              {widget.config.unit && (
                <span className="text-lg text-muted-foreground ml-1">
                  {widget.config.unit}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Digital Display
            </div>
          </div>
        </div>
      );
      
    case 'segmented':
      return (
        <div className="flex justify-center">
          <div className="flex space-x-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-8 rounded-sm"
                style={{
                  backgroundColor: i < percentage / 10 ? effectiveColor : '#e5e7eb'
                }}
              />
            ))}
          </div>
        </div>
      );
      
    case 'dial':
      // Calculate dial parameters using arc settings
      const dialNeedleAngle = arcStartAngle + ((arcEndAngle - arcStartAngle) * percentage / 100);
      const dialNeedleLength = 35;
      const dialNeedleX = 50 + dialNeedleLength * Math.cos((dialNeedleAngle - 90) * Math.PI / 180);
      const dialNeedleY = 50 + dialNeedleLength * Math.sin((dialNeedleAngle - 90) * Math.PI / 180);
      
      return (
        <div className="flex justify-center items-center h-full">
          <div className="relative w-full max-w-xs aspect-square">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Dial background */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="#f3f4f6"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              {/* Dial arc range indicator */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#d1d5db"
                strokeWidth={arcWidth / 2}
                strokeDasharray={`${(arcEndAngle - arcStartAngle) / 360 * 264} ${264}`}
                transform={`rotate(${arcStartAngle - 90} 50 50)`}
              />
              {/* Dial ticks */}
              {[...Array(12)].map((_, i) => {
                const tickAngle = arcStartAngle + ((arcEndAngle - arcStartAngle) / 11) * i;
                const x1 = 50 + 38 * Math.cos((tickAngle - 90) * Math.PI / 180);
                const y1 = 50 + 38 * Math.sin((tickAngle - 90) * Math.PI / 180);
                const x2 = 50 + 42 * Math.cos((tickAngle - 90) * Math.PI / 180);
                const y2 = 50 + 42 * Math.sin((tickAngle - 90) * Math.PI / 180);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#9ca3af"
                    strokeWidth="1"
                  />
                );
              })}
              {/* Dial needle based on style */}
              {needleStyle === 'arrow' ? (
                <polygon
                  points={`50,50 ${dialNeedleX},${dialNeedleY} ${50 + 5 * Math.cos((dialNeedleAngle) * Math.PI / 180)},${50 + 5 * Math.sin((dialNeedleAngle) * Math.PI / 180)}`}
                  fill={needleColor}
                  style={{
                    transition: enableAnimations ? `all ${animationDuration}ms ${animationEasing}` : 'none'
                  }}
                />
              ) : needleStyle === 'triangle' ? (
                <polygon
                  points={`50,50 ${dialNeedleX},${dialNeedleY} ${50 - 3 * Math.sin((dialNeedleAngle - 90) * Math.PI / 180)},${50 + 3 * Math.cos((dialNeedleAngle - 90) * Math.PI / 180)}`}
                  fill={needleColor}
                  style={{
                    transition: enableAnimations ? `all ${animationDuration}ms ${animationEasing}` : 'none'
                  }}
                />
              ) : (
                <line
                  x1="50"
                  y1="50"
                  x2={dialNeedleX}
                  y2={dialNeedleY}
                  stroke={needleColor}
                  strokeWidth={widget.config.gaugeThumbSize ? widget.config.gaugeThumbSize / 10 : 2}
                  strokeLinecap="round"
                  style={{
                    transition: enableAnimations ? `all ${animationDuration}ms ${animationEasing}` : 'none'
                  }}
                />
              )}
              {/* Center pivot */}
              {showCenterPivot && (
                <circle
                  cx="50"
                  cy="50"
                  r={widget.config.gaugeThumbSize ? widget.config.gaugeThumbSize / 4 : 3}
                  fill={needleColor}
                />
              )}
              {/* Value display */}
              <text
                x="50"
                y="85"
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="currentColor"
              >
                {gaugeValue}
              </text>
              {widget.config.unit && (
                <text
                  x="50"
                  y="95"
                  textAnchor="middle"
                  fontSize="8"
                  fill="currentColor"
                  className="text-muted-foreground"
                >
                  {widget.config.unit}
                </text>
              )}
            </svg>
          </div>
        </div>
      );
      
    case 'linear':
    default:
      // Original linear gauge implementation with animation support
      return (
        <div className="relative flex justify-center">
          <div className={widget.config.gaugeWidth === 'custom' ? widget.config.customGaugeWidth || 'w-full' : getGaugeWidthClass()}>
            <div 
              className="h-full"
              style={{ 
                width: '100%',
                backgroundColor: '#e5e7eb',
                borderRadius: widget.config.gaugeBorderRadius !== undefined ? `${widget.config.gaugeBorderRadius}px` : '9999px',
                height: `${widget.config.gaugeTrackHeight || 4}px`,
                overflow: 'hidden'
              }}
            >
              <div 
                className="h-full"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: effectiveColor,
                  transition: enableAnimations ? `width ${animationDuration}ms ${animationEasing}` : 'none',
                  borderRadius: widget.config.gaugeBorderRadius !== undefined ? `${widget.config.gaugeBorderRadius}px` : '9999px'
                }}
              />
              {widget.config.showPercentage !== false && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {Math.round(percentage)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
  }
};

export const GaugeWidgetRenderer: React.FC<GaugeWidgetRendererProps> = ({
  widget,
  localValue,
  lastUpdate,
  commonStyles
}) => {
  const config = widget.config;
  const gaugeValue = localValue || config.defaultValue || 0;
  const minValue = config.min || config.minValue || 0;
  const maxValue = config.max || config.maxValue || 100;
  const percentage = Math.min(100, Math.max(0, ((gaugeValue - minValue) / (maxValue - minValue)) * 100));
  
  // Get the icon component based on the gaugeIcon config
  const IconComponent = getIconComponent(config.gaugeIcon || 'Thermometer');
  // Get the progress color from config or default to blue
  const progressColor = config.progressColor || '#3b82f6';
  
  // Get icon size
  const iconSize = config.gaugeIconSize || 20;
  
  // Determine if container should be shown
  const showContainer = config.showGaugeContainer !== false;
  
  // Animation settings
  const enableAnimations = config.enableAnimations !== false;
  const animationDuration = config.animationDuration || 500;
  const animationEasing = config.animationEasing || 'ease-in-out';
  
  // Arc settings for circular gauges
  const arcStartAngle = config.arcStartAngle || 135;
  const arcEndAngle = config.arcEndAngle || 405;
  const arcWidth = config.arcWidth || 10;
  const needleStyle = config.needleStyle || 'classic';
  const needleColor = config.needleColor || '#ef4444';
  const showCenterPivot = config.showCenterPivot !== false;
  
  // Render the content
  const renderContent = () => (
    <div className="space-y-3">
      {config.showGaugeValue !== false && (
        <div className="text-center">
          <div className="text-2xl font-bold flex items-center justify-center gap-1">
            {config.showGaugeIcon !== false && (
              <IconComponent 
                className="w-5 h-5" 
                style={{ 
                  color: progressColor,
                  width: `${iconSize}px`,
                  height: `${iconSize}px`,
                  transition: enableAnimations ? `all ${animationDuration}ms ${animationEasing}` : 'none'
                }} 
              />
            )}
            {config.prefix && <span>{config.prefix}</span>}
            {gaugeValue}
            {config.unit && (
              <span className="text-sm text-muted-foreground">
                {config.unit}
              </span>
            )}
            {config.suffix && <span>{config.suffix}</span>}
          </div>
        </div>
      )}
      
      {/* Render gauge based on type */}
      {renderGaugeByType({
        widget,
        gaugeValue,
        percentage,
        minValue,
        maxValue,
        progressColor,
        iconSize,
        IconComponent,
        enableAnimations,
        animationDuration,
        animationEasing,
        arcStartAngle,
        arcEndAngle,
        arcWidth,
        needleStyle,
        needleColor,
        showCenterPivot
      })}

      {config.showMinMax !== false && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{minValue}</span>
          <span>{maxValue}</span>
        </div>
      )}

      {config.showGaugeUpdateTime !== false && lastUpdate && (
        <div className="text-xs text-muted-foreground text-center">
          Updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
  
  // If container is hidden, render content without Card wrapper
  if (!showContainer) {
    return (
      <div className="h-full w-full flex items-center justify-center" style={commonStyles}>
        {renderContent()}
      </div>
    );
  }
  
  // If container is shown, render with Card wrapper
  return (
    <Card className="h-full" style={commonStyles}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{widget.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
};