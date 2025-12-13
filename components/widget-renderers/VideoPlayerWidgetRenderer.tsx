import React, { useRef, useEffect } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';

interface VideoPlayerWidgetRendererProps {
  widget: IoTDashboardWidget;
  commonStyles: React.CSSProperties;
}

export const VideoPlayerWidgetRenderer: React.FC<VideoPlayerWidgetRendererProps> = ({
  widget,
  commonStyles
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video customization styles
  const videoContainerStyle = {
    backgroundColor: widget.config.videoBackgroundColor || commonStyles.backgroundColor,
    borderColor: widget.config.videoBorderColor || commonStyles.borderColor,
    borderWidth: widget.config.videoBorderWidth ? `${widget.config.videoBorderWidth}px` : commonStyles.borderWidth,
    borderRadius: widget.config.videoBorderRadius ? `${widget.config.videoBorderRadius}px` : commonStyles.borderRadius,
    padding: widget.config.videoPadding || commonStyles.padding,
  };

  // Determine container alignment
  const containerAlignment = widget.config.videoAlignment === 'left' ? 'items-start' :
                           widget.config.videoAlignment === 'right' ? 'items-end' :
                           'items-center';

  // Determine whether to show the container
  const showVideoContainer = widget.config.showVideoContainer !== false;

  // Apply playback rate and volume when available
  useEffect(() => {
    if (videoRef.current) {
      if (widget.config.videoPlaybackRate !== undefined) {
        videoRef.current.playbackRate = widget.config.videoPlaybackRate;
      }
      if (widget.config.videoVolume !== undefined) {
        videoRef.current.volume = Math.max(0, Math.min(1, widget.config.videoVolume));
      }
    }
  }, [widget.config.videoPlaybackRate, widget.config.videoVolume]);

  const videoElement = (
    <div className={`h-full w-full flex ${containerAlignment} justify-center`} style={videoContainerStyle}>
      {widget.config.videoUrl ? (
        <video 
          ref={videoRef}
          src={widget.config.videoUrl}
          controls={widget.config.videoControls !== false}
          autoPlay={widget.config.videoAutoplay || false}
          loop={widget.config.videoLoop || false}
          muted={widget.config.videoMuted || false}
          poster={widget.config.videoPoster || undefined}
          style={{
            objectFit: widget.config.videoFit || 'contain',
            borderRadius: widget.config.videoBorderRadius ? `${widget.config.videoBorderRadius}px` : '0.375rem',
            border: widget.config.videoBorderWidth ? `${widget.config.videoBorderWidth}px solid ${widget.config.videoBorderColor || '#00000000'}` : 'none',
            width: widget.config.videoWidth || '100%',
            height: widget.config.videoHeight || '100%',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
          onError={(e) => {
            console.error('Failed to load video:', widget.config.videoUrl);
          }}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full">
          <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No video configured</p>
        </div>
      )}
    </div>
  );

  if (!showVideoContainer) {
    // Render video without container
    return videoElement;
  }

  // Render video with container (default behavior)
  return (
    <Card className="h-full" style={commonStyles}>
      {widget.config.showLabel !== false && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>{widget.title}</span>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={`${widget.config.showLabel !== false ? 'pt-0' : 'p-2'} h-full`}>
        {videoElement}
      </CardContent>
    </Card>
  );
};
