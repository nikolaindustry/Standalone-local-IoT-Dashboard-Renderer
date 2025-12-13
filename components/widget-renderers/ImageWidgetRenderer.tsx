import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';

interface ImageWidgetRendererProps {
  widget: IoTDashboardWidget;
  commonStyles: React.CSSProperties;
}

export const ImageWidgetRenderer: React.FC<ImageWidgetRendererProps> = ({
  widget,
  commonStyles
}) => {
  // Check if widget should be visible
  if (widget.style?.visible === false) {
    return null;
  }

  // Image customization styles
  const imageContainerStyle = {
    backgroundColor: widget.config.imageBackgroundColor || commonStyles.backgroundColor,
    borderColor: widget.config.imageBorderColor || commonStyles.borderColor,
    borderWidth: widget.config.imageBorderWidth ? `${widget.config.imageBorderWidth}px` : commonStyles.borderWidth,
    borderRadius: widget.config.imageBorderRadius ? `${widget.config.imageBorderRadius}px` : commonStyles.borderRadius,
    padding: widget.config.imagePadding || commonStyles.padding,
    opacity: widget.config.opacity || commonStyles.opacity,
  };

  // Determine container alignment
  const containerAlignment = widget.config.imageAlignment === 'left' ? 'items-start' :
                           widget.config.imageAlignment === 'right' ? 'items-end' :
                           'items-center';

  // Determine whether to show the container - check style.showContainer first
  const showImageContainer = widget.style?.showContainer !== false;

  if (!showImageContainer) {
    // Render image without container
    return (
      <div className={`h-full w-full flex ${containerAlignment} justify-center`} style={imageContainerStyle}>
        {widget.config.imageUrl ? (
          <img 
            src={widget.config.imageUrl} 
            alt={widget.config.alt || widget.title || 'Dashboard image'} 
            style={{
              objectFit: widget.config.fit || 'contain',
              borderRadius: widget.config.imageBorderRadius ? `${widget.config.imageBorderRadius}px` : '0.375rem',
              opacity: widget.config.opacity || 1,
              border: widget.config.imageBorderWidth ? `${widget.config.imageBorderWidth}px solid ${widget.config.imageBorderColor || '#00000000'}` : 'none',
              width: widget.config.imageWidth || 'auto',
              height: widget.config.imageHeight || 'auto',
              filter: widget.config.imageFilter || 'none',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            onError={(e) => {
              console.error('Failed to load image:', widget.config.imageUrl);
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML += `
                <div class="text-center text-muted-foreground flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 mx-auto mb-2 opacity-50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                  <p class="text-sm">Failed to load image</p>
                </div>
              `;
            }}
          />
        ) : (
          <div className="text-center text-muted-foreground flex flex-col items-center justify-center">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No image configured</p>
          </div>
        )}
      </div>
    );
  }

  // Render image with container (default behavior)
  return (
    <Card className="h-full" style={commonStyles}>
      {widget.config.showLabel !== false && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>{widget.title}</span>
            {/* Removed getStatusIcon() from image widget */}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={`${widget.config.showLabel !== false ? 'pt-0' : 'p-2'} h-full flex ${containerAlignment} justify-center`} style={imageContainerStyle}>
        {widget.config.imageUrl ? (
          <img 
            src={widget.config.imageUrl} 
            alt={widget.config.alt || widget.title || 'Dashboard image'} 
            style={{
              objectFit: widget.config.fit || 'contain',
              borderRadius: widget.config.imageBorderRadius ? `${widget.config.imageBorderRadius}px` : '0.375rem',
              opacity: widget.config.opacity || 1,
              border: widget.config.imageBorderWidth ? `${widget.config.imageBorderWidth}px solid ${widget.config.imageBorderColor || '#00000000'}` : 'none',
              width: widget.config.imageWidth || 'auto',
              height: widget.config.imageHeight || 'auto',
              filter: widget.config.imageFilter || 'none',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            onError={(e) => {
              console.error('Failed to load image:', widget.config.imageUrl);
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex');
            }}
          />
        ) : null}
        <div 
          className="text-center text-muted-foreground flex flex-col items-center justify-center"
          style={{ display: widget.config.imageUrl ? 'none' : 'flex' }}
        >
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {widget.config.imageUrl ? 'Failed to load image' : 'No image configured'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};