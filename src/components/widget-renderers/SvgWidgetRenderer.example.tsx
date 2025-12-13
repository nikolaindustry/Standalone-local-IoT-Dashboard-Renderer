import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { SvgWidgetRenderer } from './SvgWidgetRenderer';

// Example usage of the SVG widget renderer
const ExampleSvgWidget: React.FC = () => {
  // Example widget configuration with SVG URL
  const widgetWithUrl: IoTDashboardWidget = {
    id: 'svg-example-1',
    type: 'svg',
    title: 'Company Logo',
    position: { x: 0, y: 0 },
    size: { width: 200, height: 100 },
    config: {
      svgUrl: 'https://example.com/logo.svg',
      svgAlt: 'Company Logo',
      svgFit: 'contain',
      svgAlignment: 'center',
      svgBorderRadius: 8,
      svgOpacity: 1,
      showSvgContainer: true,
      showLabel: true,
      svgBackgroundColor: '#f0f0f0',
      svgBorderColor: '#cccccc',
      svgBorderWidth: 1,
      svgWidth: '100%',
      svgHeight: '100%',
    },
    style: {
      backgroundColor: '#ffffff',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      borderRadius: 8,
    },
  };

  // Example widget configuration with embedded SVG content
  const widgetWithContent: IoTDashboardWidget = {
    id: 'svg-example-2',
    type: 'svg',
    title: 'Embedded SVG',
    position: { x: 0, y: 0 },
    size: { width: 150, height: 150 },
    config: {
      svgContent: `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="#3b82f6" />
          <rect x="30" y="30" width="40" height="40" fill="#ffffff" />
        </svg>
      `,
      svgFit: 'contain',
      svgAlignment: 'center',
      svgBorderRadius: 12,
      svgOpacity: 0.9,
      showSvgContainer: true,
      showLabel: true,
      svgWidth: '100%',
      svgHeight: '100%',
    },
    style: {
      backgroundColor: '#f8f9fa',
      borderColor: '#e9ecef',
      borderWidth: 1,
      borderRadius: 12,
    },
  };

  // Example widget configuration with no SVG (shows placeholder)
  const widgetWithoutSvg: IoTDashboardWidget = {
    id: 'svg-example-3',
    type: 'svg',
    title: 'Empty SVG Widget',
    position: { x: 0, y: 0 },
    size: { width: 200, height: 100 },
    config: {
      showSvgContainer: true,
      showLabel: true,
      svgWidth: '100%',
      svgHeight: '100%',
    },
    style: {
      backgroundColor: '#ffffff',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      borderRadius: 8,
    },
  };

  const commonStyles = {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderWidth: '1px',
    borderRadius: '8px',
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">SVG Widget Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">SVG from URL</h2>
          <SvgWidgetRenderer 
            widget={widgetWithUrl} 
            commonStyles={commonStyles} 
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Embedded SVG Content</h2>
          <SvgWidgetRenderer 
            widget={widgetWithContent} 
            commonStyles={commonStyles} 
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">No SVG (Placeholder)</h2>
          <SvgWidgetRenderer 
            widget={widgetWithoutSvg} 
            commonStyles={commonStyles} 
          />
        </div>
      </div>
    </div>
  );
};

export default ExampleSvgWidget;