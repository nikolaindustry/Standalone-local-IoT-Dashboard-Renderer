import React, { useMemo } from 'react';
import { IoTDashboardWidget } from '../../types/index';

interface LabelWidgetRendererProps {
  widget: IoTDashboardWidget;
  value: any;
  commonStyles: React.CSSProperties;
}

export const LabelWidgetRenderer: React.FC<LabelWidgetRendererProps> = ({
  widget,
  value,
  commonStyles
}) => {
  const config = widget.config || {};
  
  // Load custom font if provided - Simple Product Dashboard approach
  const customFontStyle = config.customFontData && config.customFontFamily ? (
    <style>
      {`
        @font-face {
          font-family: '${config.customFontFamily}';
          src: url('${config.customFontData}');
        }
      `}
    </style>
  ) : null;
  
  // Determine the text content to display
  const displayText = useMemo(() => {
    // Priority: value prop > config.value (from setValue) > config.labelText > widget.title
    let text = value !== undefined ? value : 
               (config.value !== undefined ? config.value : 
               (config.labelText || widget.title || ''));
    
    // Convert objects to JSON string for display (e.g., {roll: 10, pitch: 5})
    if (text && typeof text === 'object' && !React.isValidElement(text)) {
      text = JSON.stringify(text);
    }
    
    // Ensure text is a string
    text = String(text || '');
    
    // Add prefix and suffix
    if (config.prefix) text = config.prefix + text;
    if (config.suffix) text = text + config.suffix;
    
    // Show placeholder if empty
    if (!text && config.placeholder) {
      text = config.placeholder;
    }
    
    return text;
  }, [value, config.value, config.labelText, config.prefix, config.suffix, config.placeholder, widget.title]);

  // Determine vertical alignment
  const alignItems = config.verticalAlign === 'top' ? 'flex-start' :
                     config.verticalAlign === 'bottom' ? 'flex-end' :
                     config.verticalAlign === 'middle' ? 'center' :
                     widget.style?.alignItems || 'center';

  // Determine horizontal alignment
  const justifyContent = (config.textAlign || widget.style?.textAlign) === 'left' ? 'flex-start' :
                        (config.textAlign || widget.style?.textAlign) === 'right' ? 'flex-end' :
                        (config.textAlign || widget.style?.textAlign) === 'center' ? 'center' :
                        (config.textAlign || widget.style?.textAlign) === 'justify' ? 'stretch' :
                        widget.style?.justifyContent || 'center';

  // Build gradient background if enabled
  const background = useMemo(() => {
    if (config.enableGradient) {
      const type = config.gradientType || 'linear';
      const angle = config.gradientAngle || 90;
      const color1 = config.gradientColor1 || '#3b82f6';
      const color2 = config.gradientColor2 || '#8b5cf6';
      
      if (type === 'linear') {
        return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
      } else if (type === 'radial') {
        return `radial-gradient(circle, ${color1}, ${color2})`;
      } else if (type === 'conic') {
        return `conic-gradient(from ${angle}deg, ${color1}, ${color2})`;
      }
    }
    return config.backgroundColor || widget.style?.backgroundColor || 'transparent';
  }, [config.enableGradient, config.gradientType, config.gradientAngle, config.gradientColor1, config.gradientColor2, config.backgroundColor, widget.style?.backgroundColor]);

  // Build text shadow if enabled
  const textShadow = config.enableTextShadow
    ? `${config.shadowX || 2}px ${config.shadowY || 2}px ${config.shadowBlur || 4}px ${config.shadowColor || '#00000080'}`
    : 'none';

  // Build box shadow if enabled
  const boxShadow = config.enableBoxShadow
    ? (config.boxShadow || '0 4px 6px rgba(0,0,0,0.1)')
    : 'none';

  // Build border
  const border = config.borderWidth
    ? `${config.borderWidth}px ${config.borderStyle || 'solid'} ${config.borderColor || '#000000'}`
    : 'none';

  // Build animation CSS class or keyframe if enabled
  const animationStyle = useMemo(() => {
    if (!config.enableAnimation) return {};
    
    const duration = config.animationDuration || 1;
    const delay = config.animationDelay || 0;
    const type = config.animationType || 'fadeIn';
    
    const animations: Record<string, string> = {
      fadeIn: `fadeIn ${duration}s ease-in-out ${delay}s`,
      slideUp: `slideUp ${duration}s ease-out ${delay}s`,
      slideDown: `slideDown ${duration}s ease-out ${delay}s`,
      slideLeft: `slideLeft ${duration}s ease-out ${delay}s`,
      slideRight: `slideRight ${duration}s ease-out ${delay}s`,
      zoomIn: `zoomIn ${duration}s ease-out ${delay}s`,
      zoomOut: `zoomOut ${duration}s ease-out ${delay}s`,
      bounce: `bounce ${duration}s ease-in-out ${delay}s`,
      pulse: `pulse ${duration}s ease-in-out ${delay}s infinite`,
      rotate: `rotate ${duration}s linear ${delay}s infinite`,
    };
    
    return {
      animation: animations[type] || animations.fadeIn
    };
  }, [config.enableAnimation, config.animationDuration, config.animationDelay, config.animationType]);

  // Container styles
  const containerStyles: React.CSSProperties = {
    ...commonStyles,
    display: 'flex',
    alignItems,
    justifyContent,
    width: config.width || '100%',
    height: config.height || '100%',
    padding: config.padding ? `${config.padding}px` : undefined,
    paddingTop: config.paddingTop ? `${config.paddingTop}px` : undefined,
    paddingBottom: config.paddingBottom ? `${config.paddingBottom}px` : undefined,
    paddingLeft: config.paddingLeft ? `${config.paddingLeft}px` : undefined,
    paddingRight: config.paddingRight ? `${config.paddingRight}px` : undefined,
    margin: config.margin ? `${config.margin}px` : undefined,
    background,
    border,
    borderRadius: config.borderRadius ? `${config.borderRadius}px` : widget.style?.borderRadius,
    boxShadow,
    opacity: config.opacity !== undefined ? config.opacity : 1,
    filter: config.filter || undefined,
    backdropFilter: config.backdropFilter || undefined,
    mixBlendMode: (config.mixBlendMode as any) || undefined,
    overflow: 'hidden',
    ...animationStyle
  };

  // Text styles with fallback font support
  const textStyles: React.CSSProperties = useMemo(() => {
    console.log('=== TEXT STYLES CALCULATION ===');
    
    const baseStyles = {
      color: config.textColor || widget.style?.color || '#000000',
      fontSize: config.fontSize ? `${config.fontSize}px` : widget.style?.fontSize || '16px',
      fontWeight: config.fontWeight || widget.style?.fontWeight || 'normal',
      fontStyle: config.fontStyle || widget.style?.fontStyle || 'normal',
      lineHeight: config.lineHeight || widget.style?.lineHeight || 1.5,
      letterSpacing: config.letterSpacing ? `${config.letterSpacing}px` : widget.style?.letterSpacing,
      wordSpacing: config.wordSpacing ? `${config.wordSpacing}px` : undefined,
      textDecoration: config.textDecoration || widget.style?.textDecoration || 'none',
      textTransform: (config.textTransform as any) || (widget.style?.textTransform as any) || 'none',
      textAlign: (config.textAlign as any) || (widget.style?.textAlign as any) || 'left',
      textShadow,
      whiteSpace: (config.whiteSpace as any) || 'normal',
      textOverflow: config.textOverflow || 'clip',
      wordBreak: (config.wordBreak as any) || 'normal',
      width: config.textAlign === 'justify' || (widget.style?.textAlign as any) === 'justify' ? '100%' : 'auto',
    };

    // Simple font family application - Product Dashboard approach
    const fontFamily = config.fontFamily || widget.style?.fontFamily || 'inherit';

    const finalStyles = {
      ...baseStyles,
      fontFamily,
    };

    console.log('Final text styles:', finalStyles);
    console.log('=== TEXT STYLES CALCULATION END ===\n');

    return finalStyles;
  }, [
    config.textColor, config.fontSize, config.fontWeight, config.fontStyle,
    config.fontFamily, config.lineHeight,
    config.letterSpacing, config.wordSpacing, config.textDecoration,
    config.textTransform, config.textAlign, config.whiteSpace,
    config.textOverflow, config.wordBreak,
    widget.style?.color, widget.style?.fontSize, widget.style?.fontWeight,
    widget.style?.fontStyle, widget.style?.fontFamily, widget.style?.lineHeight,
    widget.style?.letterSpacing, widget.style?.textDecoration,
    widget.style?.textTransform, widget.style?.textAlign,
    textShadow
  ]);

  // Render HTML content if enabled
  if (config.enableHtml && config.htmlContent) {
    return (
      <div style={containerStyles}>
        <div 
          style={textStyles}
          dangerouslySetInnerHTML={{ __html: config.htmlContent }}
        />
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      {customFontStyle}
      <span style={textStyles}>
        {displayText}
      </span>
      
      {/* Add keyframes for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideRight {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes zoomOut {
          from { transform: scale(1.2); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};