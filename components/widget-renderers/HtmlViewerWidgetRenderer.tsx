import React, { useState, useEffect, useRef } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface HtmlViewerWidgetRendererProps {
  widget: IoTDashboardWidget;
  localValue: any;
  commonStyles: React.CSSProperties;
}

export const HtmlViewerWidgetRenderer: React.FC<HtmlViewerWidgetRendererProps> = ({
  widget,
  localValue,
  commonStyles
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    // Get HTML content from value or config
    const content = localValue || widget.config.htmlContent || '';
    
    try {
      // Basic validation - check if content is a string
      if (typeof content !== 'string') {
        throw new Error('HTML content must be a string');
      }
      
      setHtmlContent(content);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid HTML content');
      setHtmlContent('');
    }
  }, [localValue, widget.config.htmlContent]);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handleReset = () => {
    setHtmlContent(widget.config.htmlContent || '');
    setRefreshKey(prev => prev + 1);
    setError('');
  };
  
  // Get configuration with defaults
  const showContainer = widget.config.htmlShowContainer !== false;
  const backgroundColor = widget.config.htmlBackgroundColor || '#ffffff';
  const borderRadius = widget.config.htmlBorderRadius || 8;
  const borderWidth = widget.config.htmlBorderWidth || 1;
  const borderColor = widget.config.htmlBorderColor || 'hsl(var(--border))';
  const showControls = widget.config.htmlShowControls !== false;
  const sandboxPermissions = widget.config.htmlSandboxPermissions || 
    'allow-scripts allow-same-origin allow-forms';
  
  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-destructive font-medium mb-2">Error Loading HTML</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="mt-4"
          >
            Reset
          </Button>
        </div>
      );
    }
    
    if (!htmlContent) {
      return (
        <div className="flex items-center justify-center h-full p-4 text-center text-muted-foreground">
          <p>No HTML content to display</p>
        </div>
      );
    }
    
    return (
      <iframe
        key={refreshKey}
        ref={iframeRef}
        srcDoc={htmlContent}
        sandbox={sandboxPermissions}
        className="w-full h-full border-0"
        style={{
          backgroundColor,
          borderRadius: showContainer ? 0 : `${borderRadius}px`,
        }}
        title={widget.title || 'HTML Viewer'}
      />
    );
  };
  
  if (!showContainer) {
    return (
      <div 
        className="h-full w-full overflow-hidden" 
        style={{
          ...commonStyles,
          borderRadius: `${borderRadius}px`,
          border: `${borderWidth}px solid ${borderColor}`,
        }}
      >
        {renderContent()}
      </div>
    );
  }
  
  return (
    <Card className="h-full flex flex-col" style={commonStyles}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{widget.title}</span>
          {showControls && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleRefresh}
                title="Refresh"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0 overflow-hidden">
        <div 
          className="h-full w-full overflow-hidden"
          style={{
            borderRadius: `${borderRadius}px`,
            border: `${borderWidth}px solid ${borderColor}`,
          }}
        >
          {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
};
