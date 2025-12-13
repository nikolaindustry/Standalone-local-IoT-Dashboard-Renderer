import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { getSwitchIconComponent } from './iconHelpers';

interface SwitchWidgetRendererProps {
  widget: IoTDashboardWidget;
  isDesignMode: boolean;
  localValue: any;
  deviceStatus: 'online' | 'offline' | 'connecting';
  handleValueChange: (newValue: any) => void;
  commonStyles: React.CSSProperties;
}

export const SwitchWidgetRenderer: React.FC<SwitchWidgetRendererProps> = ({
  widget,
  isDesignMode,
  localValue,
  deviceStatus,
  handleValueChange,
  commonStyles
}) => {
  // Load custom fonts if provided
  const switchTitleCustomFont = widget.config.switchTitleCustomFontData && widget.config.switchTitleCustomFontFamily ? (
    <style>
      {`
        @font-face {
          font-family: '${widget.config.switchTitleCustomFontFamily}';
          src: url('${widget.config.switchTitleCustomFontData}');
        }
      `}
    </style>
  ) : null;
  
  const switchStatusCustomFont = widget.config.switchStatusCustomFontData && widget.config.switchStatusCustomFontFamily ? (
    <style>
      {`
        @font-face {
          font-family: '${widget.config.switchStatusCustomFontFamily}';
          src: url('${widget.config.switchStatusCustomFontData}');
        }
      `}
    </style>
  ) : (widget.config.switchCustomFontData && widget.config.switchCustomFontFamily ? (
    <style>
      {`
        @font-face {
          font-family: '${widget.config.switchCustomFontFamily}';
          src: url('${widget.config.switchCustomFontData}');
        }
      `}
    </style>
  ) : null);
  
  // Get the icon component based on the switchIcon config
  const SwitchIconComponent = getSwitchIconComponent(widget.config.switchIcon || 'Power');
  const switchColor = widget.config.switchColor || '#3b82f6';
  const showSwitchText = widget.config.showSwitchText !== false;
  const showSwitchIcon = widget.config.showSwitchIcon !== false;
  const switchOnText = widget.config.switchOnText || 'ON';
  const switchOffText = widget.config.switchOffText || 'OFF';
  const switchIconSize = widget.config.switchIconSize || 20;
  
  // Typography customization for Switch Title
  const switchTitleFontFamily = widget.config.switchTitleFontFamily || 'inherit';
  const switchTitleFontSize = widget.config.switchTitleFontSize || '14px';
  const switchTitleFontWeight = widget.config.switchTitleFontWeight || 'medium';
  const switchTitleFontStyle = widget.config.switchTitleFontStyle || 'normal';
  const switchTitleTextColor = widget.config.switchTitleTextColor;
  const switchTitleLetterSpacing = widget.config.switchTitleLetterSpacing;
  
  // Typography customization for Status Text (ON/OFF)
  const switchStatusFontFamily = widget.config.switchStatusFontFamily || widget.config.switchFontFamily || 'inherit';
  const switchStatusFontSize = widget.config.switchStatusFontSize || widget.config.switchFontSize || '14px';
  const switchStatusFontWeight = widget.config.switchStatusFontWeight || widget.config.switchFontWeight || 'medium';
  const switchStatusFontStyle = widget.config.switchStatusFontStyle || widget.config.switchFontStyle || 'normal';
  const switchStatusTextColor = widget.config.switchStatusTextColor || widget.config.switchTextColor;
  const switchStatusLetterSpacing = widget.config.switchStatusLetterSpacing || widget.config.switchLetterSpacing;
  
  // Determine icon size
  const iconSize = typeof switchIconSize === 'number' 
    ? switchIconSize 
    : switchIconSize === 'small' ? 16 : switchIconSize === 'large' ? 24 : 20;
  
  // Enhanced toggle styling options
  const toggleActiveColor = widget.config.toggleActiveColor || switchColor;
  const toggleInactiveColor = widget.config.toggleInactiveColor || '#cccccc';
  const toggleShape = widget.config.toggleShape || 'round';
  const toggleBorderRadius = widget.config.toggleBorderRadius;
  const toggleBorderWidth = widget.config.toggleBorderWidth || 2;
  const toggleBorderColor = widget.config.toggleBorderColor;
  const toggleBorderStyle = widget.config.toggleBorderStyle || 'solid';
  const toggleBoxShadow = widget.config.toggleBoxShadow;
  
  // Thumb styling
  const thumbSize = widget.config.thumbSize;
  const thumbColor = widget.config.thumbColor || '#ffffff';
  const thumbShape = widget.config.thumbShape || 'circle';
  const thumbBorderRadius = widget.config.thumbBorderRadius;
  
  // Size options
  const toggleSize = widget.config.toggleSize || 'medium';
  const toggleCustomWidth = widget.config.toggleCustomWidth;
  const toggleCustomHeight = widget.config.toggleCustomHeight;
  
  // Animation
  const toggleTransitionDuration = widget.config.toggleTransitionDuration || 200;
  
  // Internal labels
  const showToggleOnLabel = widget.config.showToggleOnLabel || false;
  const showToggleOffLabel = widget.config.showToggleOffLabel || false;
  const toggleOnLabelText = widget.config.toggleOnLabelText || 'ON';
  const toggleOffLabelText = widget.config.toggleOffLabelText || 'OFF';
  const toggleLabelColor = widget.config.toggleLabelColor || '#ffffff';
  const toggleLabelFontSize = widget.config.toggleLabelFontSize || 10;
  
  return (
    <Card className="h-full" style={commonStyles}>
      {switchTitleCustomFont}
      {switchStatusCustomFont}
      <CardContent className="p-4 h-full flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showSwitchIcon && (
              <SwitchIconComponent 
                style={{ 
                  color: switchColor,
                  width: `${iconSize}px`,
                  height: `${iconSize}px`
                }} 
              />
            )}
            <div className="flex items-center gap-1">
              <span 
                className="font-medium"
                style={{
                  fontFamily: switchTitleFontFamily,
                  fontSize: switchTitleFontSize,
                  fontWeight: switchTitleFontWeight,
                  fontStyle: switchTitleFontStyle,
                  color: switchTitleTextColor,
                  letterSpacing: switchTitleLetterSpacing
                }}
              >
                {widget.title}
              </span>
            </div>
            {widget.config.showLabel && (
              <div 
                className="text-xs text-muted-foreground"
                style={{
                  fontFamily: switchTitleFontFamily,
                  fontSize: switchTitleFontSize,
                  fontWeight: switchTitleFontWeight,
                  fontStyle: switchTitleFontStyle,
                  color: switchTitleTextColor,
                  letterSpacing: switchTitleLetterSpacing
                }}
              >
                {widget.config.label || 'Switch'}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showSwitchText && (
              <span 
                className="text-sm font-medium" 
                style={{ 
                  color: switchStatusTextColor || (localValue ? switchColor : undefined),
                  fontFamily: switchStatusFontFamily,
                  fontSize: switchStatusFontSize,
                  fontWeight: switchStatusFontWeight,
                  fontStyle: switchStatusFontStyle,
                  letterSpacing: switchStatusLetterSpacing,
                  marginTop: widget.config.switchLabelMarginTop,
                  marginBottom: widget.config.switchLabelMarginBottom,
                  marginLeft: widget.config.switchLabelMarginLeft,
                  marginRight: widget.config.switchLabelMarginRight
                }}
              >
                {localValue ? switchOnText : switchOffText}
              </span>
            )}
            <Switch
              checked={localValue || false}
              onCheckedChange={handleValueChange}
              disabled={isDesignMode || deviceStatus === 'offline'}
              activeColor={toggleActiveColor}
              inactiveColor={toggleInactiveColor}
              containerShape={toggleShape}
              borderRadius={toggleBorderRadius}
              borderWidth={toggleBorderWidth}
              borderColor={toggleBorderColor}
              borderStyle={toggleBorderStyle}
              boxShadow={toggleBoxShadow}
              thumbSize={thumbSize}
              thumbColor={thumbColor}
              thumbShape={thumbShape}
              thumbBorderRadius={thumbBorderRadius}
              switchSize={toggleSize}
              customWidth={toggleCustomWidth}
              customHeight={toggleCustomHeight}
              transitionDuration={toggleTransitionDuration}
              showOnLabel={showToggleOnLabel}
              showOffLabel={showToggleOffLabel}
              onLabelText={toggleOnLabelText}
              offLabelText={toggleOffLabelText}
              labelColor={toggleLabelColor}
              labelFontSize={toggleLabelFontSize}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};