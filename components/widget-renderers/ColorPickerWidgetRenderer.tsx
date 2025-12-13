import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '../ColorPicker';
import { CircularColorPicker } from '../CircularColorPicker';
import { parseColor } from '../../utils/colorUtils';

interface ColorPickerWidgetRendererProps {
  widget: IoTDashboardWidget;
  isDesignMode: boolean;
  localValue: any;
  handleValueChange: (newValue: any) => void;
  executeAction: (actionId: string, parameters?: Record<string, any>) => void;
  commonStyles: React.CSSProperties;
}

export const ColorPickerWidgetRenderer: React.FC<ColorPickerWidgetRendererProps> = ({
  widget,
  isDesignMode,
  localValue,
  handleValueChange,
  executeAction,
  commonStyles
}) => {
  const config = widget.config;
  
  // Color Picker Type & Style
  const colorPickerType = config.colorPickerType || 'default';
  const colorPickerSize = config.colorPickerSize || 'md';
  
  // Display Options
  const showColorPreview = config.showColorPreview !== false;
  const showColorValue = config.showColorValue !== false;
  const showColorContainer = config.showColorContainer !== false;
  const showHexInput = config.showHexInput !== false;
  const showRgbSliders = config.showRgbSliders || false;
  const showHslSliders = config.showHslSliders || false;
  const showPresetColors = config.showPresetColors !== false;
  const showEyedropper = config.showEyedropper || false;
  
  // Color Format & Validation
  const colorFormat = config.colorFormat || 'hex';
  const allowAlpha = config.allowAlpha || false;
  const validateHex = config.validateHex !== false;
  
  // Preset Colors
  const presetColors = config.presetColors || [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#000000', '#ffffff', '#64748b'
  ];
  const presetGridColumns = config.presetGridColumns || 5;
  const presetColorSize = config.presetColorSize || 32;
  
  // Layout Configuration
  const pickerOrientation = config.pickerOrientation || 'vertical';
  const componentArrangement = config.componentArrangement || 'default';
  const componentSpacing = config.componentSpacing || 12;
  
  // Container & Styling
  const containerBackgroundColor = config.containerBackgroundColor || '#ffffff';
  const containerBorderColor = config.containerBorderColor || '#e2e8f0';
  const containerBorderWidth = config.containerBorderWidth || 1;
  const containerBorderRadius = config.containerBorderRadius || 8;
  const containerPadding = config.containerPadding || '16px';
  const containerShadow = config.containerShadow || false;
  
  // Advanced Customization
  const pickerLabel = config.pickerLabel || '';
  const showLabelAbove = config.showLabelAbove !== false;
  const labelFontSize = config.labelFontSize || 14;
  const labelFontWeight = config.labelFontWeight || 'normal';
  const labelColor = config.labelColor || '#000000';
  const disabled = config.disabled || false;
  const readOnly = config.readOnly || false;
  
  // Size mapping
  const sizeClasses = {
    xs: 'w-24 h-24',
    sm: 'w-32 h-32',
    md: 'w-40 h-40',
    lg: 'w-48 h-48',
    xl: 'w-56 h-56'
  };
  
  const circularSizeMap = {
    xs: 120,
    sm: 160,
    md: 200,
    lg: 240,
    xl: 280
  };
  
  const defaultColor = config.defaultColor || '#3b82f6';
  const currentColor = localValue || defaultColor;
  
  // Handle color change
  const handleColorChange = (color: string) => {
    if (disabled || readOnly) return;
    
    handleValueChange(color);
    const colorData = parseColor(color);
    if (colorData) {
      executeAction('colorChange', { 
        color: colorData.hex,
        colorData: {
          hex: colorData.hex,
          rgb: colorData.rgb,
          hsl: colorData.hsl,
          hsv: colorData.hsv,
          cmyk: colorData.cmyk
        }
      });
    }
  };
  
  // Container styles
  const containerStyles: React.CSSProperties = {
    backgroundColor: containerBackgroundColor,
    borderColor: containerBorderColor,
    borderWidth: `${containerBorderWidth}px`,
    borderRadius: `${containerBorderRadius}px`,
    padding: containerPadding,
    boxShadow: containerShadow ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : 'none',
    ...commonStyles
  };
  
  // Label styles
  const labelStyles: React.CSSProperties = {
    fontSize: `${labelFontSize}px`,
    fontWeight: labelFontWeight,
    color: labelColor,
    marginBottom: showLabelAbove ? `${componentSpacing}px` : '0'
  };
  
  // Spacing styles
  const spacingClass = componentArrangement === 'compact' ? 'space-y-2' : 
                       componentArrangement === 'expanded' ? 'space-y-6' : 
                       componentArrangement === 'stacked' ? 'space-y-4' : 'space-y-4';
  
  // Render content
  const renderContent = () => (
    <div 
      className={`flex ${pickerOrientation === 'horizontal' ? 'flex-row items-start' : 'flex-col'} ${spacingClass} w-full`}
      style={{ gap: `${componentSpacing}px`, opacity: disabled ? 0.5 : 1 }}
    >
      {/* Label */}
      {pickerLabel && showLabelAbove && (
        <label style={labelStyles}>
          {pickerLabel}
        </label>
      )}
      
      {/* Color Preview */}
      {showColorPreview && (
        <div 
          className={`rounded-lg border-2 flex items-center justify-center ${disabled ? 'cursor-not-allowed' : readOnly ? 'cursor-default' : 'cursor-pointer'} ${sizeClasses[colorPickerSize]}`}
          style={{ 
            backgroundColor: currentColor,
            borderColor: containerBorderColor
          }}
          onClick={() => !isDesignMode && !disabled && !readOnly && executeAction('colorChange', { color: currentColor })}
        >
          {showColorValue && (
            <span className="text-xs font-mono bg-black/50 text-white px-2 py-1 rounded">
              {currentColor}
            </span>
          )}
        </div>
      )}
      
      {/* Color Picker (only in interactive mode) */}
      {!isDesignMode && !readOnly && (
        <div className="flex flex-col items-center w-full" style={{ gap: `${componentSpacing}px` }}>
          {/* Main Picker */}
          {colorPickerType === 'circular' ? (
            <CircularColorPicker
              value={currentColor}
              onChange={handleColorChange}
              size={circularSizeMap[colorPickerSize]}
            />
          ) : (
            <ColorPicker
              value={currentColor}
              onChange={handleColorChange}
            />
          )}
          
          {/* Hex Input */}
          {showHexInput && (
            <div className="w-full">
              <input
                type="text"
                value={currentColor}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!validateHex || /^#[0-9A-Fa-f]{6}$/.test(value)) {
                    handleColorChange(value);
                  }
                }}
                disabled={disabled}
                placeholder="#000000"
                className="w-full px-3 py-2 border rounded text-sm font-mono"
                style={{ borderColor: containerBorderColor }}
              />
            </div>
          )}
          
          {/* RGB Sliders */}
          {showRgbSliders && (
            <div className="w-full space-y-2">
              <div className="text-xs font-medium">RGB</div>
              {/* RGB slider implementation would go here */}
              <div className="text-xs text-muted-foreground">RGB sliders (coming soon)</div>
            </div>
          )}
          
          {/* HSL Sliders */}
          {showHslSliders && (
            <div className="w-full space-y-2">
              <div className="text-xs font-medium">HSL</div>
              {/* HSL slider implementation would go here */}
              <div className="text-xs text-muted-foreground">HSL sliders (coming soon)</div>
            </div>
          )}
          
          {/* Preset Colors */}
          {showPresetColors && presetColors.length > 0 && (
            <div className="w-full">
              <div className="text-xs font-medium mb-2">Presets</div>
              <div 
                className="grid gap-2"
                style={{ 
                  gridTemplateColumns: `repeat(${presetGridColumns}, minmax(0, 1fr))` 
                }}
              >
                {presetColors.map((color, index) => (
                  <button
                    key={index}
                    className={`rounded border-2 transition-all ${
                      disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                    } ${currentColor.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-primary' : ''}`}
                    style={{
                      backgroundColor: color,
                      width: `${presetColorSize}px`,
                      height: `${presetColorSize}px`,
                      borderColor: containerBorderColor
                    }}
                    onClick={() => !disabled && handleColorChange(color)}
                    disabled={disabled}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Eyedropper (placeholder) */}
          {showEyedropper && (
            <button 
              className="text-xs px-3 py-1 border rounded hover:bg-muted"
              disabled={disabled}
              style={{ borderColor: containerBorderColor }}
            >
              🎨 Pick Color
            </button>
          )}
        </div>
      )}
      
      {/* Read-only mode indicator */}
      {!isDesignMode && readOnly && (
        <div className="text-xs text-muted-foreground text-center">
          Read Only
        </div>
      )}
    </div>
  );
  
  // If container is hidden, render content directly
  if (!showColorContainer) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center" style={commonStyles}>
        {renderContent()}
      </div>
    );
  }
  
  // Render with container
  return (
    <Card className="h-full" style={containerStyles}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{widget.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col items-center">
        {renderContent()}
      </CardContent>
    </Card>
  );
};