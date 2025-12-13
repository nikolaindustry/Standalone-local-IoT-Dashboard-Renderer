import React, { useEffect, useState } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Volume2, Settings, Play } from 'lucide-react';

interface TextToSpeechConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (property: string, value: any) => void;
}

export const TextToSpeechConfig: React.FC<TextToSpeechConfigProps> = ({
  widget,
  onConfigChange
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  return (
    <>
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Volume2 className="w-4 h-4" />
        Text-to-Speech Configuration
      </h4>
      
      {/* Voice Selection */}
      <div className="space-y-1">
        <Label className="text-xs">Voice</Label>
        <Select
          value={widget.config.voice || ''}
          onValueChange={(value) => onConfigChange('voice', value)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Select voice" />
          </SelectTrigger>
          <SelectContent>
            {voices.map((voice) => (
              <SelectItem key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Speech Parameters */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Speech Parameters
      </h4>
      
      <div className="space-y-1">
        <Label className="text-xs">Speech Rate</Label>
        <Input
          type="number"
          min="0.1"
          max="10"
          step="0.1"
          value={widget.config.rate || 1}
          onChange={(e) => onConfigChange('rate', parseFloat(e.target.value))}
          className="h-8 text-sm"
        />
        <p className="text-xs text-muted-foreground">Range: 0.1 to 10 (default: 1)</p>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Pitch</Label>
        <Input
          type="number"
          min="0"
          max="2"
          step="0.1"
          value={widget.config.pitch || 1}
          onChange={(e) => onConfigChange('pitch', parseFloat(e.target.value))}
          className="h-8 text-sm"
        />
        <p className="text-xs text-muted-foreground">Range: 0 to 2 (default: 1)</p>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Volume</Label>
        <Input
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={widget.config.volume || 1}
          onChange={(e) => onConfigChange('volume', parseFloat(e.target.value))}
          className="h-8 text-sm"
        />
        <p className="text-xs text-muted-foreground">Range: 0 to 1 (default: 1)</p>
      </div>

      <Separator />

      {/* Playback Options */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Play className="w-4 h-4" />
        Playback Options
      </h4>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Auto Play</Label>
            <p className="text-xs text-muted-foreground">Automatically speak text when received</p>
          </div>
          <Switch
            checked={widget.config.autoPlay !== false}
            onCheckedChange={(checked) => onConfigChange('autoPlay', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Controls</Label>
            <p className="text-xs text-muted-foreground">Display playback controls</p>
          </div>
          <Switch
            checked={widget.config.showControls !== false}
            onCheckedChange={(checked) => onConfigChange('showControls', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Loop Playback</Label>
            <p className="text-xs text-muted-foreground">Repeat text continuously</p>
          </div>
          <Switch
            checked={widget.config.loop === true}
            onCheckedChange={(checked) => onConfigChange('loop', checked)}
          />
        </div>
      </div>
    </>
  );
};
