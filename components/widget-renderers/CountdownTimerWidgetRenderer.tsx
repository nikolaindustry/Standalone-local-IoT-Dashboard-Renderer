import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CountdownTimerWidgetRendererProps {
  widget: IoTDashboardWidget;
  commonStyles: React.CSSProperties;
  isDesignMode?: boolean;
  onAction?: (actionId: string, parameters?: Record<string, any>) => void;
  onWidgetEvent?: (widgetId: string, event: string, value: any) => void;
  value?: any;
}

export const CountdownTimerWidgetRenderer: React.FC<CountdownTimerWidgetRendererProps> = ({
  widget,
  commonStyles,
  isDesignMode = false,
  onAction,
  onWidgetEvent,
  value
}) => {
  const { toast } = useToast();
  
  // Get configuration with defaults
  const initialSeconds = widget.config.initialSeconds || 60;
  const showControls = widget.config.showControls !== false;
  const autoStart = widget.config.autoStart === true;
  const showMilliseconds = widget.config.showMilliseconds === true;
  const playSound = widget.config.playSound === true;
  const showProgressBar = widget.config.showProgressBar !== false;
  const showContainer = widget.config.showContainer !== false;
  const iconColor = widget.config.iconColor || widget.style?.textColor;

  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart && !isDesignMode);
  const [hasCompleted, setHasCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update timeLeft when initialSeconds config changes
  useEffect(() => {
    if (!isRunning && !hasCompleted) {
      setTimeLeft(initialSeconds);
    }
  }, [initialSeconds, isRunning, hasCompleted]);

  // Handle WebSocket control messages
  useEffect(() => {
    if (value && typeof value === 'object') {
      console.log('[CountdownTimer] Received WebSocket control message:', value);
      
      if (value.action === 'start') {
        // Stop any current countdown
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        // If initialSeconds is provided, use it; otherwise use current timeLeft or default
        if (value.initialSeconds !== undefined) {
          setTimeLeft(value.initialSeconds);
        } else if (timeLeft === 0 || hasCompleted) {
          setTimeLeft(initialSeconds);
        }
        
        setHasCompleted(false);
        setIsRunning(true);
        console.log('[CountdownTimer] Started via WebSocket');
      } else if (value.action === 'pause') {
        setIsRunning(false);
        console.log('[CountdownTimer] Paused via WebSocket');
      } else if (value.action === 'reset') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsRunning(false);
        setTimeLeft(value.initialSeconds !== undefined ? value.initialSeconds : initialSeconds);
        setHasCompleted(false);
        console.log('[CountdownTimer] Reset via WebSocket');
      }
    }
  }, [value, initialSeconds, timeLeft, hasCompleted]);

  // Countdown logic
  useEffect(() => {
    if (isDesignMode) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= (showMilliseconds ? 0.01 : 1)) {
            handleCountdownComplete();
            return 0;
          }
          return prevTime - (showMilliseconds ? 0.01 : 1);
        });
      }, showMilliseconds ? 10 : 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, isDesignMode, showMilliseconds]);

  const handleCountdownComplete = useCallback(() => {
    setIsRunning(false);
    setHasCompleted(true);

    console.log('[CountdownTimer] Complete event triggered', widget.id);

    // Play sound if enabled
    if (playSound && audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }

    // Show notification if enabled
    if (widget.config.showNotification) {
      toast({
        title: widget.config.notificationTitle || 'Timer Complete!',
        description: widget.config.notificationMessage || 'The countdown has finished.',
      });
    }

    const timerData = {
      widgetId: widget.id,
      initialSeconds: initialSeconds,
      completedAt: new Date().toISOString()
    };

    // Trigger action to process widgetEvents and send WebSocket messages
    console.log('[CountdownTimer] Calling onAction for complete', timerData);
    onAction?.('complete', timerData);

    // Also trigger widget event for script execution
    console.log('[CountdownTimer] Calling onWidgetEvent', { widgetId: widget.id, event: 'complete', onWidgetEvent: !!onWidgetEvent });
    onWidgetEvent?.(widget.id, 'complete', timerData);
  }, [playSound, widget.config, widget.id, initialSeconds, onAction, onWidgetEvent, toast]);

  const handleStart = () => {
    if (hasCompleted) {
      handleReset();
    }
    setIsRunning(true);
    
    const timerData = {
      widgetId: widget.id,
      timeLeft: timeLeft
    };
    
    console.log('[CountdownTimer] Start event triggered', timerData);
    // Trigger action to process widgetEvents and send WebSocket messages
    onAction?.('start', timerData);
    // Also trigger widget event for script execution
    onWidgetEvent?.(widget.id, 'start', timerData);
  };

  const handlePause = () => {
    setIsRunning(false);
    
    const timerData = {
      widgetId: widget.id,
      timeLeft: timeLeft
    };
    
    console.log('[CountdownTimer] Pause event triggered', timerData);
    // Trigger action to process widgetEvents and send WebSocket messages
    onAction?.('pause', timerData);
    // Also trigger widget event for script execution
    onWidgetEvent?.(widget.id, 'pause', timerData);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialSeconds);
    setHasCompleted(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const timerData = {
      widgetId: widget.id,
      initialSeconds: initialSeconds
    };
    
    console.log('[CountdownTimer] Reset event triggered', timerData);
    // Trigger action to process widgetEvents and send WebSocket messages
    onAction?.('reset', timerData);
    // Also trigger widget event for script execution
    onWidgetEvent?.(widget.id, 'reset', timerData);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (showMilliseconds) {
      const ms = Math.floor((seconds % 1) * 100);
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
      }
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((initialSeconds - timeLeft) / initialSeconds) * 100;

  const content = (
    <div className={`h-full flex flex-col justify-center items-center ${!showContainer ? 'w-full' : 'p-4'}`}>
      {/* Timer Icon */}
      <Clock 
        className="w-8 h-8 mb-3 opacity-70" 
        style={{ color: iconColor }}
      />

      {/* Timer Display */}
      <div 
        className={`font-mono font-bold mb-4 ${hasCompleted ? 'text-destructive' : ''}`}
        style={{
          fontSize: widget.style?.fontSize || '3rem',
          color: hasCompleted ? undefined : widget.style?.textColor
        }}
      >
        {formatTime(timeLeft)}
      </div>

      {/* Progress Bar */}
      {showProgressBar && (
        <div className="w-full max-w-xs mb-4">
          <div 
            className="h-2 rounded-full overflow-hidden"
            style={{
              backgroundColor: widget.style?.borderColor || 'hsl(var(--muted))'
            }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: hasCompleted 
                  ? 'hsl(var(--destructive))' 
                  : widget.config.progressColor || widget.style?.textColor || 'hsl(var(--primary))'
              }}
            />
          </div>
        </div>
      )}

      {/* Controls */}
      {showControls && !isDesignMode && (
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              size="sm"
              variant="default"
              disabled={timeLeft === 0 && !hasCompleted}
            >
              <Play className="w-4 h-4 mr-1" />
              {hasCompleted ? 'Restart' : 'Start'}
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              size="sm"
              variant="secondary"
            >
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
          )}
          <Button
            onClick={handleReset}
            size="sm"
            variant="outline"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      )}

      {/* Completion Message */}
      {hasCompleted && widget.config.completionMessage && (
        <p 
          className="mt-3 text-sm font-medium"
          style={{ color: widget.style?.textColor }}
        >
          {widget.config.completionMessage}
        </p>
      )}

      {/* Hidden audio element */}
      {playSound && (
        <audio
          ref={audioRef}
          src={widget.config.soundUrl || 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LMeSwFJHfH8N2QQAoUXrTp66hVFA==' }
        />
      )}
    </div>
  );

  if (!showContainer) {
    return (
      <div
        className="h-full w-full"
        style={{
          ...commonStyles,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <Card 
      className="h-full w-full overflow-hidden"
      style={{
        ...commonStyles,
        border: widget.style?.borderWidth ? `${widget.style.borderWidth} solid ${widget.style.borderColor || 'hsl(var(--border))'}` : undefined
      }}
    >
      <CardContent className="p-0 h-full">
        {content}
      </CardContent>
    </Card>
  );
};