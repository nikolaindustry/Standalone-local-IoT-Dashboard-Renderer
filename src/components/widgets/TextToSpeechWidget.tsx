import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface TextToSpeechWidgetProps {
  value?: string;
  config?: {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    autoPlay?: boolean;
    showControls?: boolean;
    loop?: boolean;
  };
  style?: React.CSSProperties;
  isDesignMode?: boolean;
}

export const TextToSpeechWidget: React.FC<TextToSpeechWidgetProps> = ({
  value,
  config = {},
  style,
  isDesignMode = false
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [localVolume, setLocalVolume] = useState(config.volume || 1);
  const [lastPlayedValue, setLastPlayedValue] = useState('');

  useEffect(() => {
    if (value && !isDesignMode) {
      setCurrentText(value);
      // Play when autoPlay is explicitly enabled
      if (config.autoPlay === true) {
        speakText(value);
        setLastPlayedValue(value);
      }
    }
  }, [value, isDesignMode, config.autoPlay]);

  const speakText = (text: string) => {
    if (!text || isDesignMode) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply configuration
    utterance.rate = config.rate || 1;
    utterance.pitch = config.pitch || 1;
    utterance.volume = localVolume;
    
    if (config.voice) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === config.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      
      // Loop functionality
      if (config.loop && !isDesignMode) {
        setTimeout(() => speakText(text), 100);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayPause = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else if (currentText) {
      speakText(currentText);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleVolumeChange = (values: number[]) => {
    setLocalVolume(values[0]);
  };

  return (
    <Card className="p-4 h-full flex flex-col gap-3" style={style}>
      <div className="flex items-center gap-2">
        {isSpeaking ? (
          <Volume2 className="w-5 h-5 text-primary animate-pulse" />
        ) : (
          <VolumeX className="w-5 h-5 text-muted-foreground" />
        )}
        <span className="font-medium text-sm">Text to Speech</span>
      </div>

      {currentText && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded max-h-20 overflow-y-auto">
          {currentText}
        </div>
      )}

      {config.showControls !== false && (
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePlayPause}
              disabled={!currentText || isDesignMode}
            >
              {isSpeaking && !isPaused ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleStop}
              disabled={!isSpeaking || isDesignMode}
            >
              <VolumeX className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[localVolume]}
              onValueChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.1}
              className="flex-1"
              disabled={isDesignMode}
            />
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      )}

      {isDesignMode && (
        <div className="text-xs text-muted-foreground text-center mt-2">
          Text-to-Speech Widget
        </div>
      )}
    </Card>
  );
};
