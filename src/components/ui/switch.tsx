
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

export interface SwitchStyleProps {
  // Container styling
  activeColor?: string;
  inactiveColor?: string;
  containerShape?: 'round' | 'pill' | 'square' | 'custom';
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  boxShadow?: string;
  
  // Thumb/knob styling
  thumbSize?: number;
  thumbColor?: string;
  thumbShape?: 'circle' | 'square' | 'rounded-square';
  thumbBorderRadius?: number;
  
  // Size variations
  switchSize?: 'small' | 'medium' | 'large' | 'custom';
  customWidth?: number;
  customHeight?: number;
  
  // Animation
  transitionDuration?: number;
  
  // Labels inside toggle
  showOnLabel?: boolean;
  showOffLabel?: boolean;
  onLabelText?: string;
  offLabelText?: string;
  labelColor?: string;
  labelFontSize?: number;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & SwitchStyleProps
>(({ 
  className,
  activeColor,
  inactiveColor,
  containerShape = 'round',
  borderRadius,
  borderWidth = 2,
  borderColor,
  borderStyle = 'solid',
  boxShadow,
  thumbSize,
  thumbColor = '#ffffff',
  thumbShape = 'circle',
  thumbBorderRadius,
  switchSize = 'medium',
  customWidth,
  customHeight,
  transitionDuration = 200,
  showOnLabel = false,
  showOffLabel = false,
  onLabelText = 'ON',
  offLabelText = 'OFF',
  labelColor = '#ffffff',
  labelFontSize = 10,
  ...props
}, ref) => {
  // Calculate dimensions based on size
  const getSizeDimensions = () => {
    if (switchSize === 'custom' && customWidth && customHeight) {
      return { width: customWidth, height: customHeight };
    }
    
    switch (switchSize) {
      case 'small':
        return { width: 36, height: 20 };
      case 'large':
        return { width: 56, height: 32 };
      case 'medium':
      default:
        return { width: 44, height: 24 };
    }
  };
  
  const dimensions = getSizeDimensions();
  const calculatedThumbSize = thumbSize || (dimensions.height - 4);
  const translateDistance = dimensions.width - calculatedThumbSize - 4;
  
  // Calculate border radius based on shape
  const getContainerBorderRadius = () => {
    if (containerShape === 'custom' && borderRadius !== undefined) {
      return `${borderRadius}px`;
    }
    
    switch (containerShape) {
      case 'round':
      case 'pill':
        return '9999px';
      case 'square':
        return '0px';
      default:
        return '9999px';
    }
  };
  
  // Calculate thumb border radius based on shape
  const getThumbBorderRadius = () => {
    if (thumbShape === 'circle') {
      return '9999px';
    }
    if (thumbShape === 'square') {
      return '0px';
    }
    if (thumbShape === 'rounded-square' && thumbBorderRadius !== undefined) {
      return `${thumbBorderRadius}px`;
    }
    return '9999px';
  };
  
  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 relative",
        className
      )}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        backgroundColor: props.checked ? activeColor : inactiveColor,
        borderRadius: getContainerBorderRadius(),
        borderWidth: `${borderWidth}px`,
        borderStyle: borderStyle,
        borderColor: borderColor || 'transparent',
        boxShadow: boxShadow,
        transitionDuration: `${transitionDuration}ms`,
        // Fallback if custom colors not provided
        ...((!activeColor && props.checked) && { backgroundColor: 'hsl(var(--primary))' }),
        ...((!inactiveColor && !props.checked) && { backgroundColor: 'hsl(var(--input))' })
      }}
      {...props}
      ref={ref}
    >
      {/* ON/OFF Labels */}
      {(showOnLabel || showOffLabel) && (
        <div 
          className="absolute inset-0 flex items-center justify-between px-1"
          style={{
            fontSize: `${labelFontSize}px`,
            color: labelColor,
            fontWeight: 600,
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          {showOnLabel && (
            <span 
              className="transition-opacity"
              style={{
                opacity: props.checked ? 1 : 0,
                marginLeft: '2px'
              }}
            >
              {onLabelText}
            </span>
          )}
          {showOffLabel && (
            <span 
              className="transition-opacity ml-auto"
              style={{
                opacity: props.checked ? 0 : 1,
                marginRight: '2px'
              }}
            >
              {offLabelText}
            </span>
          )}
        </div>
      )}
      
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block shadow-lg ring-0 transition-transform"
        )}
        style={{
          width: `${calculatedThumbSize}px`,
          height: `${calculatedThumbSize}px`,
          backgroundColor: thumbColor,
          borderRadius: getThumbBorderRadius(),
          transform: props.checked 
            ? `translateX(${translateDistance}px)` 
            : 'translateX(0)',
          transitionDuration: `${transitionDuration}ms`
        }}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
