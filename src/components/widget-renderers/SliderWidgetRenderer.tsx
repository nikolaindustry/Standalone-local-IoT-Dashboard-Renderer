import React, { useState, useEffect } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getIconComponent } from './iconHelpers';
import { Input } from '@/components/ui/input';

interface SliderWidgetRendererProps {
  widget: IoTDashboardWidget;
  localValue: any;
  handleValueChange: (value: any) => void;
  executeAction: (actionId: string, parameters?: Record<string, any>) => void;
  commonStyles: React.CSSProperties;
}

// Helper function to render different slider types
const renderSliderByType = ({
  widget,
  sliderValue,
  minValue,
  maxValue,
  sliderColor,
  iconSize,
  IconComponent,
  handleValueChange,
  executeAction
}: {
  widget: IoTDashboardWidget;
  sliderValue: number;
  minValue: number;
  maxValue: number;
  sliderColor: string;
  iconSize: number;
  IconComponent: React.ComponentType<any>;
  handleValueChange: (value: number) => void;
  executeAction: (actionId: string, parameters?: Record<string, any>) => void;
}) => {
  const sliderType = widget.config.sliderType || 'linear';
  const range = maxValue - minValue;
  const percentage = ((sliderValue - minValue) / range) * 100;
  
  // Get configured track height and thumb size
  const trackHeight = widget.config.sliderTrackHeight || 4;
  const thumbSize = widget.config.sliderThumbSize || 20;
  const stepValue = widget.config.step || 1;
  
  // Helper function to get slider width class for linear slider
  const getSliderWidthClass = () => {
    switch (widget.config.sliderWidth) {
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
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    handleValueChange(value);
    // Execute action to send value over WebSocket  
    executeAction('slide', { value }); // Use 'slide' event during dragging
  };
  
  const handleSliderStart = () => {
    executeAction('slideStart', { value: sliderValue });
  };
  
  const handleSliderEnd = () => {
    executeAction('slideEnd', { value: sliderValue });
  };
  
  const handleCircularChange = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    const normalizedAngle = (angle + 360) % 360;
    const value = minValue + (normalizedAngle / 360) * range;
    // Apply step rounding
    const stepValue = widget.config.step || 1;
    const steppedValue = Math.round(value / stepValue) * stepValue;
    const clampedValue = Math.max(minValue, Math.min(maxValue, steppedValue));
    handleValueChange(clampedValue);
    // Execute action to send value over WebSocket
    executeAction('slideEnd', { value: clampedValue });
  };
  
  const handleStepChange = (value: number) => {
    handleValueChange(value);
    // Execute action to send value over WebSocket (step change is like slideEnd)
    executeAction('slideEnd', { value });
  };
  
  switch (sliderType) {
    case 'vertical':
      return (
        <div className="flex justify-center">
          <div 
            className="relative w-8 h-48"
            style={{ 
              backgroundColor: '#e5e7eb',
              borderRadius: widget.config.sliderBorderRadius !== undefined ? `${widget.config.sliderBorderRadius}px` : '9999px',
              overflow: 'hidden'
            }}
          >
            <div 
              className="absolute bottom-0 left-0 right-0"
              style={{ 
                backgroundColor: sliderColor,
                height: `${percentage}%`,
                borderRadius: widget.config.sliderBorderRadius !== undefined ? 
                  `0 0 ${widget.config.sliderBorderRadius}px ${widget.config.sliderBorderRadius}px` : '0 0 9999px 9999px'
              }}
            />
            <input
              type="range"
              min={minValue}
              max={maxValue}
              step={stepValue}
              value={sliderValue}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ 
                WebkitAppearance: 'slider-vertical'
              }}
            />
          </div>
        </div>
      );
      
    case 'circular':
      return (
        <div className="flex justify-center items-center h-full">
          <div className="relative w-full max-w-xs aspect-square">
            <svg 
              className="w-full h-full cursor-pointer"
              viewBox="0 0 100 100"
              onClick={handleCircularChange}
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={trackHeight}
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={sliderColor}
                strokeWidth={trackHeight}
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * percentage) / 100}
                transform="rotate(-90 50 50)"
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
                {Math.round(sliderValue)}
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
      return (
        <div className="flex justify-center items-center h-full">
          <div className="relative w-full max-w-xs" style={{ aspectRatio: '2/1' }}>
            <svg 
              className="w-full h-full cursor-pointer"
              viewBox="0 0 100 50"
              onClick={handleCircularChange}
            >
              {/* Background arc */}
              <path
                d="M 10 45 A 40 40 0 0 1 90 45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={trackHeight}
              />
              {/* Progress arc */}
              <path
                d="M 10 45 A 40 40 0 0 1 90 45"
                fill="none"
                stroke={sliderColor}
                strokeWidth={trackHeight}
                strokeLinecap="round"
                strokeDasharray="126"
                strokeDashoffset={126 - (126 * percentage) / 100}
              />
              {/* Center value */}
              <text
                x="50"
                y="35"
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill="currentColor"
              >
                {Math.round(sliderValue)}
              </text>
              {widget.config.unit && (
                <text
                  x="50"
                  y="45"
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
      return (
        <div className="flex justify-center items-center h-full">
          <div className="relative w-full max-w-xs aspect-square">
            <svg 
              className="w-full h-full cursor-pointer"
              viewBox="0 0 100 100"
              onClick={handleCircularChange}
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={trackHeight}
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={sliderColor}
                strokeWidth={trackHeight}
                strokeLinecap="round"
                strokeDasharray="251"
                strokeDashoffset={251 - (251 * percentage) / 100}
                transform="rotate(-90 50 50)"
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
                {Math.round(sliderValue)}
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
            <svg 
              className="w-full h-full cursor-pointer"
              viewBox="0 0 100 100"
              onClick={handleCircularChange}
            >
              {/* Background arc */}
              <path
                d="M 20 80 A 40 40 0 1 1 80 80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={trackHeight}
              />
              {/* Progress arc */}
              <path
                d="M 20 80 A 40 40 0 1 1 80 80"
                fill="none"
                stroke={sliderColor}
                strokeWidth={trackHeight}
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
                {Math.round(sliderValue)}
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
      
    case 'stepped':
      // Use manual configuration if provided, otherwise calculate based on step value
      const stepsCount = widget.config.steppedCount || (Math.floor(range / stepValue) + 1);
      const steppedSteps = Math.min(stepsCount, 20); // Limit to 20 steps for UI clarity
      return (
        <div className="flex justify-center">
          <div className={widget.config.sliderWidth === 'custom' ? widget.config.customSliderWidth || 'w-full' : getSliderWidthClass()}>
            <div className="flex items-center justify-between">
              {[...Array(steppedSteps)].map((_, i) => {
                const stepValue = minValue + (i * range) / (steppedSteps - 1);
                const isActive = sliderValue >= stepValue;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`w-4 h-4 rounded-full cursor-pointer ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`}
                      style={{ backgroundColor: isActive ? sliderColor : '#e5e7eb' }}
                      onClick={() => handleStepChange(stepValue)}
                    />
                    {i < steppedSteps - 1 && (
                      <div 
                        className="h-1 w-8 mt-1"
                        style={{ 
                          backgroundColor: isActive ? sliderColor : '#e5e7eb',
                          borderRadius: widget.config.sliderBorderRadius !== undefined ? `${widget.config.sliderBorderRadius}px` : '9999px'
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
      
    case 'segmented':
      // Use manual configuration if provided, otherwise calculate based on step value  
      const segmentsCount = widget.config.segmentedCount || Math.floor(range / stepValue);
      const segments = Math.min(segmentsCount, 20); // Limit to 20 segments for UI clarity
      return (
        <div className="flex justify-center">
          <div className={widget.config.sliderWidth === 'custom' ? widget.config.customSliderWidth || 'w-full' : getSliderWidthClass()}>
            <div className="flex space-x-1">
              {[...Array(segments)].map((_, i) => {
                const segmentEndValue = minValue + ((i + 1) * range) / segments;
                const segmentStartValue = minValue + (i * range) / segments;
                const segmentMidValue = (segmentStartValue + segmentEndValue) / 2;
                // Segment is active if slider value is within this segment's range
                const isActive = sliderValue >= segmentStartValue && sliderValue <= segmentEndValue;
                return (
                  <div
                    key={i}
                    className="h-8 flex-1 rounded-sm cursor-pointer flex items-center justify-center"
                    style={{
                      backgroundColor: isActive ? sliderColor : '#e5e7eb'
                    }}
                    onClick={() => handleStepChange(segmentEndValue)}
                  >
                    {isActive && (
                      <span className="text-xs font-bold text-white">
                        {Math.round(segmentEndValue)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
      
    case 'dualRange':
      // For dual range, we'll need two values - for now we'll just show a range indicator
      return (
        <div className="flex justify-center">
          <div className={widget.config.sliderWidth === 'custom' ? widget.config.customSliderWidth || 'w-full' : getSliderWidthClass()}>
            <div 
              className="relative"
              style={{ 
                height: `${trackHeight}px`,
                backgroundColor: '#e5e7eb',
                borderRadius: widget.config.sliderBorderRadius !== undefined ? `${widget.config.sliderBorderRadius}px` : '9999px',
                overflow: 'hidden'
              }}
            >
              {/* Range indicator */}
              <div 
                className="absolute h-full"
                style={{ 
                  backgroundColor: sliderColor,
                  left: '25%',
                  width: '50%',
                  borderRadius: widget.config.sliderBorderRadius !== undefined ? `${widget.config.sliderBorderRadius}px` : '9999px'
                }}
              />
              {/* Min thumb */}
              <div 
                className="absolute rounded-full border-2 border-white shadow"
                style={{ 
                  backgroundColor: sliderColor,
                  left: '25%',
                  transform: 'translateX(-50%)',
                  width: `${thumbSize}px`,
                  height: `${thumbSize}px`,
                  top: `-${(thumbSize - trackHeight) / 2}px`
                }}
              />
              {/* Max thumb */}
              <div 
                className="absolute rounded-full border-2 border-white shadow"
                style={{ 
                  backgroundColor: sliderColor,
                  left: '75%',
                  transform: 'translateX(-50%)',
                  width: `${thumbSize}px`,
                  height: `${thumbSize}px`,
                  top: `-${(thumbSize - trackHeight) / 2}px`
                }}
              />
              <input
                type="range"
                min={minValue}
                max={maxValue}
                step={stepValue}
                value={sliderValue}
                onChange={handleSliderChange}
                onMouseDown={handleSliderStart}
                onTouchStart={handleSliderStart}
                onMouseUp={handleSliderEnd}
                onTouchEnd={handleSliderEnd}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      );
      
    case 'cylindrical':
      return (
        <div className="flex justify-center">
          <div className="relative" style={{ width: `${thumbSize}px`, height: '128px' }}>
            {/* 3D-like cylindrical representation */}
            <div 
              className="absolute inset-0 rounded-lg"
              style={{ 
                background: `linear-gradient(to right, #e5e7eb 0%, ${sliderColor} ${percentage}%, #e5e7eb ${percentage}%)`,
                border: '1px solid #d1d5db',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
              }}
            />
            <div 
              className="absolute top-0 left-0 right-0 rounded-t-lg"
              style={{ 
                background: 'linear-gradient(to bottom, #f9fafb, #e5e7eb)',
                height: `${thumbSize / 2}px`
              }}
            />
            <div 
              className="absolute bottom-0 left-0 right-0 rounded-b-lg"
              style={{ 
                background: 'linear-gradient(to top, #f9fafb, #e5e7eb)',
                height: `${thumbSize / 2}px`
              }}
            />
            <input
              type="range"
              min={minValue}
              max={maxValue}
              step={stepValue}
              value={sliderValue}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ 
                WebkitAppearance: 'slider-vertical'
              }}
            />
          </div>
        </div>
      );
      
    case 'linear':
    default:
      // Original linear slider implementation with configurable track height and thumb size
      return (
        <div className="flex justify-center">
          <div className={widget.config.sliderWidth === 'custom' ? widget.config.customSliderWidth || 'w-full' : getSliderWidthClass()}>
            <div 
              className="relative"
              style={{ 
                height: `${trackHeight}px`,
                backgroundColor: '#e5e7eb',
                borderRadius: widget.config.sliderBorderRadius !== undefined ? `${widget.config.sliderBorderRadius}px` : '9999px',
                overflow: 'hidden'
              }}
            >
              <div 
                className="absolute h-full"
                style={{ 
                  backgroundColor: sliderColor,
                  width: `${percentage}%`,
                  borderRadius: widget.config.sliderBorderRadius !== undefined ? `${widget.config.sliderBorderRadius}px` : '9999px'
                }}
              />
              <input
                type="range"
                min={minValue}
                max={maxValue}
                step={stepValue}
                value={sliderValue}
                onChange={handleSliderChange}
                onMouseDown={handleSliderStart}
                onTouchStart={handleSliderStart}
                onMouseUp={handleSliderEnd}
                onTouchEnd={handleSliderEnd}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer slider-input"
              />
              <style>{`
                .slider-input::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: ${thumbSize}px;
                  height: ${thumbSize}px;
                  border-radius: 50%;
                  background: ${sliderColor};
                  cursor: pointer;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  margin-top: -${(thumbSize - trackHeight) / 2}px;
                }
                .slider-input::-moz-range-thumb {
                  width: ${thumbSize}px;
                  height: ${thumbSize}px;
                  border-radius: 50%;
                  background: ${sliderColor};
                  cursor: pointer;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
              `}</style>
            </div>
          </div>
        </div>
      );
  }
};

export const SliderWidgetRenderer: React.FC<SliderWidgetRendererProps> = ({
  widget,
  localValue,
  handleValueChange,
  executeAction,
  commonStyles
}) => {
  const [sliderValue, setSliderValue] = useState(localValue || widget.config.defaultValue || 0);
  const [inputValue, setInputValue] = useState(String(localValue || widget.config.defaultValue || 0));
  const minValue = widget.config.minValue || 0;
  const maxValue = widget.config.maxValue || 100;
  
  useEffect(() => {
    setSliderValue(localValue || widget.config.defaultValue || 0);
    setInputValue(String(localValue || widget.config.defaultValue || 0));
  }, [localValue, widget.config.defaultValue]);
  
  const handleValueUpdate = (value: number) => {
    setSliderValue(value);
    setInputValue(String(value));
    handleValueChange(value);
    // Execute action to send value over WebSocket
    executeAction('valueChange', { value });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numValue = parseFloat(newValue);
    const stepValue = widget.config.step || 1;
    if (!isNaN(numValue) && numValue >= minValue && numValue <= maxValue) {
      // Round to nearest step
      const steppedValue = Math.round(numValue / stepValue) * stepValue;
      setSliderValue(steppedValue);
      handleValueChange(steppedValue);
      executeAction('valueChange', { value: steppedValue });
    }
  };
  
  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < minValue || numValue > maxValue) {
      setInputValue(String(sliderValue));
    }
  };
  
  // Get the icon component based on the sliderIcon config
  const IconComponent = getIconComponent(widget.config.sliderIcon || 'Volume');
  // Get the slider color from config or default to blue
  const sliderColor = widget.config.sliderColor || '#3b82f6';
  
  // Get icon size
  const iconSize = widget.config.sliderIconSize || 20;
  
  // Determine if container should be shown
  const showContainer = widget.config.showSliderContainer !== false;
  
  // If container is hidden, render content without Card wrapper
  if (!showContainer) {
    return (
      <div className="h-full w-full" style={commonStyles}>
        <div className="space-y-3 h-full flex flex-col justify-center">
          {widget.config.showSliderValue !== false && (
            <div className="text-center">
              {widget.config.showSliderInput ? (
                <div className="flex items-center justify-center gap-2">
                  <IconComponent 
                    className="w-5 h-5" 
                    style={{ 
                      color: sliderColor,
                      width: `${iconSize}px`,
                      height: `${iconSize}px`
                    }} 
                  />
                  {widget.config.prefix && <span className="text-lg font-bold">{widget.config.prefix}</span>}
                  <Input
                    type="number"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    min={minValue}
                    max={maxValue}
                    step={widget.config.step || 1}
                    className="w-24 h-10 text-center text-xl font-bold"
                  />
                  {widget.config.unit && (
                    <span className="text-sm text-muted-foreground font-medium">
                      {widget.config.unit}
                    </span>
                  )}
                  {widget.config.suffix && <span className="text-lg font-bold">{widget.config.suffix}</span>}
                </div>
              ) : (
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <IconComponent 
                    className="w-5 h-5" 
                    style={{ 
                      color: sliderColor,
                      width: `${iconSize}px`,
                      height: `${iconSize}px`
                    }} 
                  />
                  {widget.config.prefix && <span>{widget.config.prefix}</span>}
                  {Math.round(sliderValue)}
                  {widget.config.unit && (
                    <span className="text-sm text-muted-foreground">
                      {widget.config.unit}
                    </span>
                  )}
                  {widget.config.suffix && <span>{widget.config.suffix}</span>}
                </div>
              )}
            </div>
          )}
          
          {/* Render slider based on type */}
          {renderSliderByType({
            widget,
            sliderValue,
            minValue,
            maxValue,
            sliderColor,
            iconSize,
            IconComponent,
            handleValueChange: handleValueUpdate,
            executeAction
          })}

          {widget.config.showSliderMinMax !== false && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{minValue}</span>
              <span>{maxValue}</span>
            </div>
          )}
        </div>
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
        <div className="space-y-3">
          {widget.config.showSliderValue !== false && (
            <div className="text-center">
              {widget.config.showSliderInput ? (
                <div className="flex items-center justify-center gap-2">
                  <IconComponent 
                    className="w-5 h-5" 
                    style={{ 
                      color: sliderColor,
                      width: `${iconSize}px`,
                      height: `${iconSize}px`
                    }} 
                  />
                  {widget.config.prefix && <span className="text-lg font-bold">{widget.config.prefix}</span>}
                  <Input
                    type="number"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    min={minValue}
                    max={maxValue}
                    step={widget.config.step || 1}
                    className="w-24 h-10 text-center text-xl font-bold"
                  />
                  {widget.config.unit && (
                    <span className="text-sm text-muted-foreground font-medium">
                      {widget.config.unit}
                    </span>
                  )}
                  {widget.config.suffix && <span className="text-lg font-bold">{widget.config.suffix}</span>}
                </div>
              ) : (
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <IconComponent 
                    className="w-5 h-5" 
                    style={{ 
                      color: sliderColor,
                      width: `${iconSize}px`,
                      height: `${iconSize}px`
                    }} 
                  />
                  {widget.config.prefix && <span>{widget.config.prefix}</span>}
                  {Math.round(sliderValue)}
                  {widget.config.unit && (
                    <span className="text-sm text-muted-foreground">
                      {widget.config.unit}
                    </span>
                  )}
                  {widget.config.suffix && <span>{widget.config.suffix}</span>}
                </div>
              )}
            </div>
          )}
          
          {/* Render slider based on type */}
          {renderSliderByType({
            widget,
            sliderValue,
            minValue,
            maxValue,
            sliderColor,
            iconSize,
            IconComponent,
            handleValueChange: handleValueUpdate,
            executeAction
          })}

          {widget.config.showSliderMinMax !== false && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{minValue}</span>
              <span>{maxValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};