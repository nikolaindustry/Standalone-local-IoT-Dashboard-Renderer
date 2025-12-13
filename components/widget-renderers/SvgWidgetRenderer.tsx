import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileImage } from 'lucide-react';

interface SvgWidgetRendererProps {
  widget: IoTDashboardWidget;
  commonStyles: React.CSSProperties;
}

export const SvgWidgetRenderer: React.FC<SvgWidgetRendererProps> = ({
  widget,
  commonStyles
}) => {
  // Debug logging
  React.useEffect(() => {
    console.log('SVG Widget Renderer - Config:', {
      svgUrl: widget.config.svgUrl,
      svgContent: widget.config.svgContent ? `${widget.config.svgContent.length} chars` : 'none',
      svgContentPreview: widget.config.svgContent?.substring(0, 100),
      showSvgContainer: widget.config.showSvgContainer,
      showLabel: widget.config.showLabel
    });
  }, [widget.config.svgUrl, widget.config.svgContent, widget.config.showSvgContainer, widget.config.showLabel]);

  // Determine whether to show the container
  const showSvgContainer = widget.config.showSvgContainer !== false;

  // Function to sanitize SVG content
  const sanitizeSvgContent = (content: string): string => {
    // Basic sanitization to prevent XSS - remove script tags
    return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  };

  // The core concept for proper SVG resizing
  const renderSvg = () => {
    // Container that ensures proper containment
    const containerStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: widget.config.svgBackgroundColor || commonStyles.backgroundColor,
      borderColor: widget.config.svgBorderColor || commonStyles.borderColor,
      borderWidth: widget.config.svgBorderWidth ? `${widget.config.svgBorderWidth}px` : commonStyles.borderWidth,
      borderRadius: widget.config.svgBorderRadius ? `${widget.config.svgBorderRadius}px` : commonStyles.borderRadius,
      padding: widget.config.svgPadding || commonStyles.padding,
      opacity: widget.config.svgOpacity || commonStyles.opacity,
      overflow: 'hidden', // Critical: prevents bleeding
      boxSizing: 'border-box',
    };

    // For embedded SVG content - USING IMG TAG WITH DATA URI (DEFINITIVE FIX)
    if (widget.config.svgContent) {
      // Convert SVG content to data URI
      try {
        const sanitizedSvg = sanitizeSvgContent(widget.config.svgContent);
        const svgBlob = new Blob([sanitizedSvg], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const imgStyle: React.CSSProperties = {
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: widget.config.svgFit || 'contain',
          display: 'block',
          borderRadius: widget.config.svgBorderRadius ? `${widget.config.svgBorderRadius}px` : '0px',
          opacity: widget.config.svgOpacity || 1,
          border: widget.config.svgBorderWidth ? `${widget.config.svgBorderWidth}px solid ${widget.config.svgBorderColor || 'transparent'}` : 'none',
          filter: widget.config.svgFilter || 'none',
        };

        return (
          <div style={containerStyle}>
            <img 
              src={svgUrl} 
              alt={widget.config.svgAlt || widget.title || 'Dashboard SVG'} 
              style={imgStyle}
              onError={(e) => {
                console.error('Failed to load embedded SVG');
                e.currentTarget.style.display = 'none';
                // Show error message
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
                      <div style="text-align:center;color:#94a3b8;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px;margin:0 auto 8px;opacity:0.5;">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" x2="8" y1="13" y2="13"/>
                          <line x1="16" x2="8" y1="17" y2="17"/>
                          <line x1="10" x2="8" y1="9" y2="9"/>
                        </svg>
                        <p style="font-size:14px;">Failed to load SVG</p>
                      </div>
                    </div>
                  `;
                }
              }}
            />
          </div>
        );
      } catch (error) {
        console.error('Error processing embedded SVG:', error);
        // Fallback to original approach if data URI fails
        return (
          <div style={containerStyle}>
            <div 
              dangerouslySetInnerHTML={{ 
                __html: sanitizeSvgContent(widget.config.svgContent) 
              }}
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: widget.config.svgFit || 'contain',
              }}
            />
          </div>
        );
      }
    }

    // For URL-based SVGs - this works correctly with objectFit
    if (widget.config.svgUrl) {
      const imgStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: widget.config.svgFit || 'contain',
        display: 'block',
        borderRadius: widget.config.svgBorderRadius ? `${widget.config.svgBorderRadius}px` : '0px',
        opacity: widget.config.svgOpacity || 1,
        border: widget.config.svgBorderWidth ? `${widget.config.svgBorderWidth}px solid ${widget.config.svgBorderColor || 'transparent'}` : 'none',
        filter: widget.config.svgFilter || 'none',
      };

      return (
        <div style={containerStyle}>
          <img 
            src={widget.config.svgUrl} 
            alt={widget.config.svgAlt || widget.title || 'Dashboard SVG'} 
            style={imgStyle}
            onError={(e) => {
              console.error('Failed to load SVG:', widget.config.svgUrl);
              e.currentTarget.style.display = 'none';
              // Show error message
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
                    <div style="text-align:center;color:#94a3b8;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px;margin:0 auto 8px;opacity:0.5;">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" x2="8" y1="13" y2="13"/>
                        <line x1="16" x2="8" y1="17" y2="17"/>
                        <line x1="10" x2="8" y1="9" y2="9"/>
                      </svg>
                      <p style="font-size:14px;">Failed to load SVG</p>
                    </div>
                  </div>
                `;
              }
            }}
          />
        </div>
      );
    }

    // No SVG content configured
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <FileImage style={{ width: '32px', height: '32px', margin: '0 auto 8px', opacity: 0.5 }} />
          <p style={{ fontSize: '14px' }}>No SVG configured</p>
        </div>
      </div>
    );
  };

  // Render without container
  if (!showSvgContainer) {
    return renderSvg();
  }

  // Render with container
  return (
    <Card className="h-full w-full" style={commonStyles}>
      {widget.config.showLabel !== false && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            <span>{widget.title}</span>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={widget.config.showLabel !== false ? 'pt-0' : 'p-2'} style={{ height: 'calc(100% - 20px)' }}>
        {renderSvg()}
      </CardContent>
    </Card>
  );
};