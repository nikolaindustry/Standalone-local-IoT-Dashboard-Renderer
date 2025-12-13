import React, { useState } from 'react';
import { IoTDashboardWidget } from '../../types/index';
import { SvgWidgetRenderer } from './SvgWidgetRenderer';

// Test component to verify SVG resizing behavior
const SvgWidgetResizingTest: React.FC = () => {
  // Test widget with embedded SVG content
  const [widget, setWidget] = useState<IoTDashboardWidget>({
    id: 'test-svg-resizing',
    type: 'svg',
    title: 'Resizing Test',
    position: { x: 0, y: 0 },
    size: { width: 300, height: 200 },
    config: {
      svgContent: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#3b82f6" />
          <circle cx="50" cy="50" r="40" fill="#ffffff" />
          <text x="50" y="55" text-anchor="middle" font-family="Arial" font-size="12" fill="#3b82f6">RESIZE</text>
        </svg>
      `,
      svgFit: 'contain',
      svgAlignment: 'center',
      svgBorderRadius: 8,
      svgOpacity: 1,
      showSvgContainer: true,
      showLabel: true,
    },
    style: {
      backgroundColor: '#f8f9fa',
      borderColor: '#e9ecef',
      borderWidth: 2,
      borderRadius: 8,
    },
  });

  // Common styles for the widget
  const commonStyles = {
    backgroundColor: widget.style?.backgroundColor,
    borderColor: widget.style?.borderColor,
    borderWidth: widget.style?.borderWidth,
    borderRadius: widget.style?.borderRadius,
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">SVG Widget Resizing Test</h1>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Wide Container (400x150) - SVG Should Scale Down to Fit</h2>
        <div 
          style={{ 
            width: 400, 
            height: 150,
            border: '2px dashed blue',
            position: 'relative'
          }}
        >
          <SvgWidgetRenderer 
            widget={widget} 
            commonStyles={commonStyles} 
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Tall Container (150x400) - SVG Should Scale Down to Fit</h2>
        <div 
          style={{ 
            width: 150, 
            height: 400,
            border: '2px dashed green',
            position: 'relative'
          }}
        >
          <SvgWidgetRenderer 
            widget={widget} 
            commonStyles={commonStyles} 
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Square Container (200x200) - SVG Should Scale to Fit</h2>
        <div 
          style={{ 
            width: 200, 
            height: 200,
            border: '2px dashed red',
            position: 'relative'
          }}
        >
          <SvgWidgetRenderer 
            widget={widget} 
            commonStyles={commonStyles} 
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Different Fit Options</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(['contain', 'cover', 'fill', 'scale-down', 'none'] as const).map(fit => (
            <div key={fit} className="border p-2">
              <h3 className="font-medium text-sm mb-2 capitalize">{fit}</h3>
              <div 
                style={{ 
                  width: 100, 
                  height: 80,
                  border: '1px solid #ccc'
                }}
              >
                <SvgWidgetRenderer 
                  widget={{
                    ...widget,
                    config: {
                      ...widget.config,
                      svgFit: fit
                    }
                  }} 
                  commonStyles={commonStyles} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">URL-based SVG Test</h2>
        <div 
          style={{ 
            width: 300, 
            height: 200,
            border: '2px dashed purple',
            position: 'relative'
          }}
        >
          <SvgWidgetRenderer 
            widget={{
              ...widget,
              config: {
                ...widget.config,
                svgContent: undefined,
                svgUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/02/SVG_logo.svg'
              }
            }} 
            commonStyles={commonStyles} 
          />
        </div>
        <p className="text-sm text-gray-600">
          This tests URL-based SVG resizing. The SVG should properly scale to fit the container.
        </p>
      </div>
    </div>
  );
};

export default SvgWidgetResizingTest;