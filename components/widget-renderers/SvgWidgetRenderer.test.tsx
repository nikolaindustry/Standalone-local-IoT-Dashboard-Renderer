import React, { useState } from 'react';
import { IoTDashboardWidget } from '../../types/index';
import { SvgWidgetRenderer } from './SvgWidgetRenderer';

// Test component to demonstrate SVG widget resizing behavior
const TestSvgWidgetResizing: React.FC = () => {
  // Test widget with embedded SVG content
  const [widget, setWidget] = useState<IoTDashboardWidget>({
    id: 'test-svg-1',
    type: 'svg',
    title: 'Resizable SVG Test',
    position: { x: 0, y: 0 },
    size: { width: 300, height: 200 },
    config: {
      svgContent: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="#3b82f6" />
          <rect x="30" y="30" width="40" height="40" fill="#ffffff" />
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
      borderWidth: 1,
      borderRadius: 8,
    },
  });

  // Update widget size
  const updateWidgetSize = (width: number, height: number) => {
    setWidget(prev => ({
      ...prev,
      size: { width, height }
    }));
  };

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
        <h2 className="text-lg font-semibold">Controls</h2>
        <div className="flex gap-4">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => updateWidgetSize(200, 150)}
          >
            Small (200x150)
          </button>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => updateWidgetSize(300, 200)}
          >
            Medium (300x200)
          </button>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => updateWidgetSize(400, 300)}
          >
            Large (400x300)
          </button>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => updateWidgetSize(500, 200)}
          >
            Wide (500x200)
          </button>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => updateWidgetSize(200, 400)}
          >
            Tall (200x400)
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          Current Size: {widget.size.width} x {widget.size.height}
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">SVG Widget Preview</h2>
        <div 
          style={{ 
            width: widget.size.width, 
            height: widget.size.height,
            resize: 'both',
            overflow: 'hidden',
            border: '1px solid #ccc',
            padding: '10px'
          }}
        >
          <SvgWidgetRenderer 
            widget={widget} 
            commonStyles={commonStyles} 
          />
        </div>
        <p className="text-sm text-gray-600">
          You can also manually resize the container by dragging the bottom-right corner.
        </p>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Fit Options</h2>
        <div className="flex gap-2 flex-wrap">
          {(['contain', 'cover', 'fill', 'scale-down', 'none'] as const).map(fit => (
            <button
              key={fit}
              className={`px-3 py-1 rounded text-sm ${
                widget.config.svgFit === fit 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
              onClick={() => setWidget(prev => ({
                ...prev,
                config: { ...prev.config, svgFit: fit }
              }))}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestSvgWidgetResizing;