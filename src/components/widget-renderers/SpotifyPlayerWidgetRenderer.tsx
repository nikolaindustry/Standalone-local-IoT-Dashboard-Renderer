import React, { useState, useEffect } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipForward, SkipBack, Volume2, Shuffle, Repeat, Music } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SpotifyPlayerWidgetRendererProps {
  widget: IoTDashboardWidget;
  commonStyles: React.CSSProperties;
  isDesignMode?: boolean;
  executeAction?: (actionId: string, parameters?: Record<string, any>) => void;
}

export const SpotifyPlayerWidgetRenderer: React.FC<SpotifyPlayerWidgetRendererProps> = ({
  widget,
  commonStyles,
  isDesignMode = false,
  executeAction
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(widget.config.spotifyVolume || 80);
  const [progress, setProgress] = useState(0);
  const [shuffle, setShuffle] = useState(widget.config.spotifyShuffle || false);
  const [repeat, setRepeat] = useState<'off' | 'track' | 'context'>(widget.config.spotifyRepeat || 'off');

  const currentTrack = widget.config.spotifyCurrentTrack || {
    name: 'No Track Selected',
    artist: 'Unknown Artist',
    album: 'Unknown Album',
    albumArt: undefined,
    duration: 0
  };

  // Container styling
  const containerStyle = {
    backgroundColor: widget.config.spotifyBackgroundColor || commonStyles.backgroundColor,
    borderRadius: widget.config.spotifyBorderRadius ? `${widget.config.spotifyBorderRadius}px` : commonStyles.borderRadius,
  };

  const accentColor = widget.config.spotifyAccentColor || '#1DB954'; // Spotify green

  const handlePlayPause = () => {
    if (isDesignMode) return;
    
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    if (newPlayingState && widget.config.spotifyPlayCommandId) {
      executeAction?.('spotify-play', { 
        commandId: widget.config.spotifyPlayCommandId,
        track: currentTrack 
      });
    } else if (!newPlayingState && widget.config.spotifyPauseCommandId) {
      executeAction?.('spotify-pause', { 
        commandId: widget.config.spotifyPauseCommandId 
      });
    }
  };

  const handleNext = () => {
    if (isDesignMode) return;
    
    if (widget.config.spotifyNextCommandId) {
      executeAction?.('spotify-next', { 
        commandId: widget.config.spotifyNextCommandId 
      });
    }
  };

  const handlePrevious = () => {
    if (isDesignMode) return;
    
    if (widget.config.spotifyPreviousCommandId) {
      executeAction?.('spotify-previous', { 
        commandId: widget.config.spotifyPreviousCommandId 
      });
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    if (isDesignMode) return;
    
    setVolume(newVolume[0]);
    
    if (widget.config.spotifyVolumeCommandId) {
      executeAction?.('spotify-volume', { 
        commandId: widget.config.spotifyVolumeCommandId,
        volume: newVolume[0]
      });
    }
  };

  const handleShuffle = () => {
    if (isDesignMode) return;
    setShuffle(!shuffle);
  };

  const handleRepeat = () => {
    if (isDesignMode) return;
    const repeatModes: Array<'off' | 'track' | 'context'> = ['off', 'context', 'track'];
    const currentIndex = repeatModes.indexOf(repeat);
    const nextRepeat = repeatModes[(currentIndex + 1) % repeatModes.length];
    setRepeat(nextRepeat);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate progress for demo (in production, this would come from Spotify API)
  useEffect(() => {
    if (isPlaying && !isDesignMode && currentTrack.duration) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1000;
          return next >= (currentTrack.duration || 0) ? 0 : next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isDesignMode, currentTrack.duration]);

  const showContainer = widget.config.spotifyShowContainer !== false;
  const showControls = widget.config.spotifyShowControls !== false;
  const showArtwork = widget.config.spotifyShowArtwork !== false;

  const playerContent = (
    <div className="flex flex-col h-full space-y-4" style={containerStyle}>
      {/* Album Artwork and Track Info */}
      <div className="flex items-center gap-4">
        {showArtwork && (
          <div className="flex-shrink-0">
            {currentTrack.albumArt ? (
              <img 
                src={currentTrack.albumArt} 
                alt={currentTrack.album}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                <Music className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 
            className="font-semibold text-lg truncate" 
            style={{ color: widget.config.spotifyTextColor }}
          >
            {currentTrack.name}
          </h3>
          <p 
            className="text-sm text-muted-foreground truncate"
            style={{ color: widget.config.spotifyTextColor || 'inherit', opacity: 0.7 }}
          >
            {currentTrack.artist}
          </p>
          <p 
            className="text-xs text-muted-foreground truncate"
            style={{ color: widget.config.spotifyTextColor || 'inherit', opacity: 0.5 }}
          >
            {currentTrack.album}
          </p>
        </div>

        {/* Connection Status */}
        {!widget.config.spotifyAccessToken && (
          <Badge variant="outline" className="text-xs">
            Not Connected
          </Badge>
        )}
      </div>

      {showControls && (
        <>
          {/* Progress Bar */}
          {currentTrack.duration && currentTrack.duration > 0 && (
            <div className="space-y-1">
              <Slider
                value={[progress]}
                max={currentTrack.duration}
                step={1000}
                onValueChange={([value]) => setProgress(value)}
                className="cursor-pointer"
                disabled={isDesignMode}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(currentTrack.duration)}</span>
              </div>
            </div>
          )}

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShuffle}
              disabled={isDesignMode}
              className="h-8 w-8"
              style={{ color: shuffle ? accentColor : 'inherit' }}
            >
              <Shuffle className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              disabled={isDesignMode}
              className="h-8 w-8"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant="default"
              size="icon"
              onClick={handlePlayPause}
              disabled={isDesignMode}
              className="h-10 w-10 rounded-full"
              style={{ backgroundColor: accentColor }}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5" fill="currentColor" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={isDesignMode}
              className="h-8 w-8"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRepeat}
              disabled={isDesignMode}
              className="h-8 w-8"
              style={{ color: repeat !== 'off' ? accentColor : 'inherit' }}
            >
              <Repeat className="w-4 h-4" />
              {repeat === 'track' && (
                <span className="absolute text-[10px] font-bold">1</span>
              )}
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 flex-shrink-0" />
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="flex-1"
              disabled={isDesignMode}
            />
            <span className="text-xs text-muted-foreground w-8 text-right">
              {volume}%
            </span>
          </div>
        </>
      )}
    </div>
  );

  if (!showContainer) {
    return <div className="h-full p-4" style={commonStyles}>{playerContent}</div>;
  }

  return (
    <Card className="h-full" style={commonStyles}>
      {widget.config.showLabel !== false && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>{widget.title}</span>
            <Music className="w-4 h-4" />
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={`${widget.config.showLabel !== false ? 'pt-0' : 'p-4'}`}>
        {playerContent}
      </CardContent>
    </Card>
  );
};
