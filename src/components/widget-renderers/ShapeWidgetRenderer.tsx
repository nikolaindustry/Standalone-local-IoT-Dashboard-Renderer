import React from 'react';
import { IoTDashboardWidget } from '../../types';

interface ShapeWidgetRendererProps {
  widget: IoTDashboardWidget;
  isDesignMode?: boolean;
  commonStyles?: React.CSSProperties;
}

export const ShapeWidgetRenderer: React.FC<ShapeWidgetRendererProps> = ({
  widget,
  isDesignMode = false,
  commonStyles = {}
}) => {
  const { type, config } = widget;
  
  // Merge common styles with any shape-specific styles
  const shapeStyles: React.CSSProperties = {
    ...commonStyles,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box'
  };

  // Apply shape-specific styles
  switch (type) {
    case 'rectangle':
      return (
        <div 
          style={{
            ...shapeStyles,
            backgroundColor: config.backgroundColor || 'transparent',
            border: `${config.borderWidth !== undefined ? config.borderWidth : (commonStyles.borderWidth !== undefined ? commonStyles.borderWidth : 2)}px ${config.borderStyle || 'solid'} ${config.borderColor || commonStyles.borderColor || '#000000'}`,
            borderRadius: config.borderRadius !== undefined ? config.borderRadius : (commonStyles.borderRadius || 0)
          }}
        >
          {config.showLabel !== false && widget.title && (
            <span style={{ 
              color: config.textColor || '#000000',
              fontSize: config.fontSize || '14px',
              fontWeight: config.fontWeight || 'normal'
            }}>
              {widget.title}
            </span>
          )}
        </div>
      );

    case 'ellipse':
      return (
        <div 
          style={{
            ...shapeStyles,
            backgroundColor: config.backgroundColor || 'transparent',
            border: `${config.borderWidth !== undefined ? config.borderWidth : (commonStyles.borderWidth !== undefined ? commonStyles.borderWidth : 2)}px ${config.borderStyle || 'solid'} ${config.borderColor || commonStyles.borderColor || '#000000'}`,
            borderRadius: '50%'
          }}
        >
          {config.showLabel !== false && widget.title && (
            <span style={{ 
              color: config.textColor || '#000000',
              fontSize: config.fontSize || '14px',
              fontWeight: config.fontWeight || 'normal'
            }}>
              {widget.title}
            </span>
          )}
        </div>
      );

    case 'triangle':
      const triangleType = config.triangleType || 'equilateral';
      let triangleStyles: React.CSSProperties = {
        ...shapeStyles,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        border: 'none'
      };

      switch (triangleType) {
        case 'equilateral':
          triangleStyles = {
            ...triangleStyles,
            borderLeft: `${(widget.size?.width || 100) / 2}px solid transparent`,
            borderRight: `${(widget.size?.width || 100) / 2}px solid transparent`,
            borderBottom: `${widget.size?.height || 100}px solid ${config.borderColor || '#000000'}`
          };
          break;
        case 'right':
          triangleStyles = {
            ...triangleStyles,
            borderRight: `${widget.size?.width || 100}px solid ${config.borderColor || '#000000'}`,
            borderTop: `${widget.size?.height || 100}px solid transparent`
          };
          break;
        case 'isosceles':
          triangleStyles = {
            ...triangleStyles,
            borderLeft: `${(widget.size?.width || 100) / 4}px solid transparent`,
            borderRight: `${(widget.size?.width || 100) / 4}px solid transparent`,
            borderBottom: `${widget.size?.height || 100}px solid ${config.borderColor || '#000000'}`
          };
          break;
      }

      return (
        <div style={shapeStyles}>
          <div style={triangleStyles}>
            {config.showLabel !== false && widget.title && (
              <span style={{ 
                position: 'absolute',
                color: config.textColor || '#000000',
                fontSize: config.fontSize || '14px',
                fontWeight: config.fontWeight || 'normal'
              }}>
                {widget.title}
              </span>
            )}
          </div>
        </div>
      );

    case 'polygon':
      const sides = config.sides || 5; // Default to pentagon
      const polygonSize = Math.min(widget.size?.width || 100, widget.size?.height || 100);
      const radius = polygonSize / 2;
      const centerX = polygonSize / 2;
      const centerY = polygonSize / 2;
      
      // Generate points for polygon
      let points = '';
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        points += `${x},${y} `;
      }
      
      return (
        <div style={shapeStyles}>
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${polygonSize} ${polygonSize}`}
          >
            <polygon
              points={points.trim()}
              fill={config.backgroundColor || 'transparent'}
              stroke={config.borderColor || commonStyles.borderColor || '#000000'}
              strokeWidth={config.borderWidth !== undefined ? config.borderWidth : (commonStyles.borderWidth !== undefined ? commonStyles.borderWidth : 2)}
            />
            {config.showLabel !== false && widget.title && (
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={config.textColor || '#000000'}
                fontSize={config.fontSize || '14px'}
                fontWeight={config.fontWeight || 'normal'}
              >
                {widget.title}
              </text>
            )}
          </svg>
        </div>
      );

    case 'star':
      const starPoints = config.points || 5;
      const outerRadius = Math.min(widget.size?.width || 100, widget.size?.height || 100) / 2;
      const innerRadius = outerRadius * (config.innerRadiusRatio || 0.5);
      const starCenterX = outerRadius;
      const starCenterY = outerRadius;
      
      // Generate points for star
      let starPath = '';
      for (let i = 0; i < starPoints * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / starPoints - Math.PI / 2;
        const x = starCenterX + radius * Math.cos(angle);
        const y = starCenterY + radius * Math.sin(angle);
        if (i === 0) {
          starPath = `M ${x} ${y} `;
        } else {
          starPath += `L ${x} ${y} `;
        }
      }
      starPath += 'Z';
      
      return (
        <div style={shapeStyles}>
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${outerRadius * 2} ${outerRadius * 2}`}
          >
            <path
              d={starPath}
              fill={config.backgroundColor || 'transparent'}
              stroke={config.borderColor || commonStyles.borderColor || '#000000'}
              strokeWidth={config.borderWidth !== undefined ? config.borderWidth : (commonStyles.borderWidth !== undefined ? commonStyles.borderWidth : 2)}
            />
            {config.showLabel !== false && widget.title && (
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={config.textColor || '#000000'}
                fontSize={config.fontSize || '14px'}
                fontWeight={config.fontWeight || 'normal'}
              >
                {widget.title}
              </text>
            )}
          </svg>
        </div>
      );

    case 'line':
      const lineType = config.lineType || 'straight';
      return (
        <div style={shapeStyles}>
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {lineType === 'straight' && (
              <line
                x1="0"
                y1="50"
                x2="100"
                y2="50"
                stroke={config.borderColor || commonStyles.borderColor || '#000000'}
                strokeWidth={config.borderWidth !== undefined ? config.borderWidth : (commonStyles.borderWidth !== undefined ? commonStyles.borderWidth : 2)}
                strokeDasharray={config.dashArray || ''}
              />
            )}
            {lineType === 'diagonal' && (
              <line
                x1="0"
                y1="0"
                x2="100"
                y2="100"
                stroke={config.borderColor || commonStyles.borderColor || '#000000'}
                strokeWidth={config.borderWidth !== undefined ? config.borderWidth : (commonStyles.borderWidth !== undefined ? commonStyles.borderWidth : 2)}
                strokeDasharray={config.dashArray || ''}
              />
            )}
            {config.showLabel !== false && widget.title && (
              <text
                x="50%"
                y="30%"
                textAnchor="middle"
                fill={config.textColor || '#000000'}
                fontSize={config.fontSize || '14px'}
                fontWeight={config.fontWeight || 'normal'}
              >
                {widget.title}
              </text>
            )}
          </svg>
        </div>
      );

    case 'arrow':
      const arrowType = config.arrowType || 'single';
      return (
        <div style={shapeStyles}>
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Arrow shaft */}
            <line
              x1="10"
              y1="50"
              x2="90"
              y2="50"
              stroke={config.borderColor || commonStyles.borderColor || '#000000'}
              strokeWidth={config.borderWidth !== undefined ? config.borderWidth : (commonStyles.borderWidth !== undefined ? commonStyles.borderWidth : 2)}
            />
            
            {/* Arrowheads based on type */}
            {arrowType === 'single' && (
              <polygon
                points="90,50 80,45 80,55"
                fill={config.borderColor || commonStyles.borderColor || '#000000'}
              />
            )}
            
            {arrowType === 'double' && (
              <>
                <polygon
                  points="90,50 80,45 80,55"
                  fill={config.borderColor || commonStyles.borderColor || '#000000'}
                />
                <polygon
                  points="10,50 20,45 20,55"
                  fill={config.borderColor || commonStyles.borderColor || '#000000'}
                />
              </>
            )}
            
            {arrowType === 'curved' && (
              <>
                <path
                  d="M 10 50 Q 50 30, 90 50"
                  fill="none"
                  stroke={config.borderColor || commonStyles.borderColor || '#000000'}
                  strokeWidth={config.borderWidth !== undefined ? config.borderWidth : (commonStyles.borderWidth !== undefined ? commonStyles.borderWidth : 2)}
                />
                <polygon
                  points="90,50 85,45 85,55"
                  fill={config.borderColor || commonStyles.borderColor || '#000000'}
                />
              </>
            )}
            
            {config.showLabel !== false && widget.title && (
              <text
                x="50%"
                y="30%"
                textAnchor="middle"
                fill={config.textColor || '#000000'}
                fontSize={config.fontSize || '14px'}
                fontWeight={config.fontWeight || 'normal'}
              >
                {widget.title}
              </text>
            )}
          </svg>
        </div>
      );

    default:
      return (
        <div style={shapeStyles}>
          <div>Unknown shape type: {type}</div>
        </div>
      );
  }
};