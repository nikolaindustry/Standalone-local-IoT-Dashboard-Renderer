import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getIconComponent } from './iconHelpers';

interface ButtonWidgetRendererProps {
  widget: IoTDashboardWidget;
  isDesignMode: boolean;
  isPressed: boolean;
  deviceStatus: 'online' | 'offline' | 'connecting';
  executeAction: (actionId: string, parameters?: Record<string, any>) => void;
  commonStyles: React.CSSProperties;
}

export const ButtonWidgetRenderer: React.FC<ButtonWidgetRendererProps> = ({
  widget,
  isDesignMode,
  isPressed,
  deviceStatus,
  executeAction,
  commonStyles
}) => {
  const isPush = widget.config?.deviceCommand?.buttonType === 'push';
  
  // Load custom font if provided
  const customFontStyle = widget.config.buttonCustomFontData && widget.config.buttonCustomFontFamily ? (
    <style>
      {`
        @font-face {
          font-family: '${widget.config.buttonCustomFontFamily}';
          src: url('${widget.config.buttonCustomFontData}');
        }
      `}
    </style>
  ) : null;
  
  // Get button customization properties
  const customButtonStyle = widget.config.buttonStyle || 'default';
  const customButtonSize = widget.config.buttonSize || 'default';
  const showButtonIcon = widget.config.showIcon !== false;
  const showButtonLabel = widget.config.showButtonLabel !== false;
  const buttonIconPosition = widget.config.iconPosition || 'left';
  const customButtonIcon = widget.config.buttonIcon || '';
  const buttonTextAlign = widget.config.textAlign || 'center';
  const buttonShape = widget.config.buttonShape || 'rounded';
  
  // Determine font family - use custom font if available
  const buttonFontFamily = widget.config.buttonFontFamily || 'inherit';
  
  // Calculate border radius based on button shape
  const getShapeBorderRadius = (): string => {
    switch (buttonShape) {
      case 'rectangle':
        return '0px';
      case 'rounded':
        return '6px';
      case 'pill':
        return '9999px';
      case 'circle':
        return '50%';
      case 'square':
        return '0px';
      case 'stadium':
        return '100px';
      case 'custom':
        return widget.config.buttonBorderRadius ? `${widget.config.buttonBorderRadius}px` : '6px';
      default:
        return '6px';
    }
  };
  
  // Get button text for each state
  const normalButtonText = widget.config.buttonNormalText || widget.config.label || widget.title || 'Button';
  const pressedButtonText = widget.config.buttonPressedText || widget.config.label || widget.title || 'Button';
  const currentButtonText = isPressed ? pressedButtonText : normalButtonText;
  
  // Get styling properties for normal state
  const buttonNormalStyles: React.CSSProperties = {
    backgroundColor: widget.config.buttonNormalBackgroundColor || widget.config.buttonBackgroundColor,
    color: widget.config.buttonTextColor || widget.config.buttonNormalTextColor || widget.config.buttonTextColor,
    borderColor: widget.config.buttonNormalBorderColor || widget.config.buttonBorderColor,
    borderWidth: widget.config.buttonBorderWidth,
    borderRadius: getShapeBorderRadius(),
    padding: widget.config.buttonPadding,
    fontSize: widget.config.buttonFontSize,
    fontWeight: widget.config.buttonFontWeight,
    fontFamily: buttonFontFamily,
    fontStyle: widget.config.buttonFontStyle || 'normal',
    letterSpacing: widget.config.buttonLetterSpacing,
    textAlign: buttonTextAlign as React.CSSProperties['textAlign'],
    aspectRatio: (buttonShape === 'circle' || buttonShape === 'square') ? '1 / 1' : undefined,
  };
  
  // Get styling properties for pressed state
  const buttonPressedStyles: React.CSSProperties = {
    backgroundColor: widget.config.buttonPressedBackgroundColor || widget.config.buttonNormalBackgroundColor || widget.config.buttonBackgroundColor,
    color: widget.config.buttonTextColor || widget.config.buttonPressedTextColor || widget.config.buttonNormalTextColor || widget.config.buttonTextColor,
    borderColor: widget.config.buttonPressedBorderColor || widget.config.buttonNormalBorderColor || widget.config.buttonBorderColor,
    borderWidth: widget.config.buttonBorderWidth,
    borderRadius: getShapeBorderRadius(),
    padding: widget.config.buttonPadding,
    fontSize: widget.config.buttonFontSize,
    fontWeight: widget.config.buttonFontWeight,
    fontFamily: buttonFontFamily,
    fontStyle: widget.config.buttonFontStyle || 'normal',
    letterSpacing: widget.config.buttonLetterSpacing,
    textAlign: buttonTextAlign as React.CSSProperties['textAlign'],
    aspectRatio: (buttonShape === 'circle' || buttonShape === 'square') ? '1 / 1' : undefined,
  };
  
  // Filter out undefined styles for normal state
  Object.keys(buttonNormalStyles).forEach(key => {
    if (buttonNormalStyles[key as keyof React.CSSProperties] === undefined) {
      delete buttonNormalStyles[key as keyof React.CSSProperties];
    }
  });
  
  // Filter out undefined styles for pressed state
  Object.keys(buttonPressedStyles).forEach(key => {
    if (buttonPressedStyles[key as keyof React.CSSProperties] === undefined) {
      delete buttonPressedStyles[key as keyof React.CSSProperties];
    }
  });
  
  // Get icon component if needed
  const ButtonIconComponent = showButtonIcon && customButtonIcon ? getIconComponent(customButtonIcon) : null;
  
  const buttonElement = (
    <Button
      variant={customButtonStyle as any}
      size={customButtonSize as any}
      className={`w-full h-full push-button ${
        isPressed 
          ? 'push-button-pressed' 
          : ''
      }`}
      onClick={() => executeAction('click')}
      onMouseDown={() => {
        if (!isDesignMode && isPush) {
          executeAction('press');
        }
      }}
      onMouseUp={() => {
        if (!isDesignMode && isPush) {
          executeAction('release');
        }
      }}
      onMouseLeave={() => {
        if (!isDesignMode && isPush && isPressed) {
          executeAction('release');
        }
      }}
      onTouchStart={() => {
        if (!isDesignMode && isPush) {
          executeAction('press');
        }
      }}
      onTouchEnd={() => {
        if (!isDesignMode && isPush) {
          executeAction('release');
        }
      }}
      disabled={isDesignMode || deviceStatus === 'offline'}
      style={isPressed ? buttonPressedStyles : buttonNormalStyles}
    >
      <div className="flex items-center justify-center" style={{ 
        justifyContent: buttonTextAlign === 'left' ? 'flex-start' : 
                      buttonTextAlign === 'right' ? 'flex-end' : 'center',
        width: '100%',
        gap: '8px'
      }}>
        {showButtonIcon && ButtonIconComponent && buttonIconPosition === 'left' && (
          <ButtonIconComponent className="w-4 h-4" style={{ width: `${widget.config.buttonIconSize || 16}px`, height: `${widget.config.buttonIconSize || 16}px` }} />
        )}
        {showButtonLabel && (
          <span style={{
            marginTop: widget.config.buttonLabelMarginTop,
            marginBottom: widget.config.buttonLabelMarginBottom,
            marginLeft: widget.config.buttonLabelMarginLeft,
            marginRight: widget.config.buttonLabelMarginRight
          }}>
            {currentButtonText}
          </span>
        )}
        {showButtonIcon && ButtonIconComponent && buttonIconPosition === 'right' && (
          <ButtonIconComponent className="w-4 h-4" style={{ width: `${widget.config.buttonIconSize || 16}px`, height: `${widget.config.buttonIconSize || 16}px` }} />
        )}
      </div>
    </Button>
  );

  if (widget.style?.showContainer !== false) {
    return (
      <Card className="h-full" style={commonStyles}>
        {customFontStyle}
        <CardContent className="p-4 h-full flex flex-col justify-center">
          {buttonElement}
        </CardContent>
      </Card>
    );
  }
  return (
    <>
      {customFontStyle}
      {buttonElement}
    </>
  );
};