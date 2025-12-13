import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Timer, Settings, Palette, Bell } from 'lucide-react';

interface CountdownTimerConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (property: string, value: any) => void;
}

export const CountdownTimerConfig: React.FC<CountdownTimerConfigProps> = ({
  widget,
  onConfigChange
}) => {
  const formatSecondsToTime = (seconds: number): { hours: number; minutes: number; seconds: number } => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return { hours, minutes, seconds: secs };
  };

  const timeToSeconds = (hours: number, minutes: number, seconds: number): number => {
    return hours * 3600 + minutes * 60 + seconds;
  };

  const currentTime = formatSecondsToTime(widget.config.initialSeconds || 60);

  return (
    <>
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Timer className="w-4 h-4" />
        Timer Configuration
      </h4>
      
      {/* Initial Duration */}
      <div className="space-y-1">
        <Label className="text-xs">Initial Duration</Label>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hours</Label>
            <Input
              type="number"
              min="0"
              max="23"
              value={currentTime.hours}
              onChange={(e) => {
                const hours = parseInt(e.target.value) || 0;
                const totalSeconds = timeToSeconds(hours, currentTime.minutes, currentTime.seconds);
                onConfigChange('initialSeconds', totalSeconds);
              }}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Minutes</Label>
            <Input
              type="number"
              min="0"
              max="59"
              value={currentTime.minutes}
              onChange={(e) => {
                const minutes = parseInt(e.target.value) || 0;
                const totalSeconds = timeToSeconds(currentTime.hours, minutes, currentTime.seconds);
                onConfigChange('initialSeconds', totalSeconds);
              }}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Seconds</Label>
            <Input
              type="number"
              min="0"
              max="59"
              value={currentTime.seconds}
              onChange={(e) => {
                const seconds = parseInt(e.target.value) || 0;
                const totalSeconds = timeToSeconds(currentTime.hours, currentTime.minutes, seconds);
                onConfigChange('initialSeconds', totalSeconds);
              }}
              className="h-8 text-sm"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Total: {widget.config.initialSeconds || 60} seconds
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Auto Start</Label>
            <p className="text-xs text-muted-foreground">Start countdown automatically</p>
          </div>
          <Switch
            checked={widget.config.autoStart === true}
            onCheckedChange={(checked) => onConfigChange('autoStart', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Milliseconds</Label>
            <p className="text-xs text-muted-foreground">Display milliseconds precision</p>
          </div>
          <Switch
            checked={widget.config.showMilliseconds === true}
            onCheckedChange={(checked) => onConfigChange('showMilliseconds', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Display Settings */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Display Settings
      </h4>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Controls</Label>
            <p className="text-xs text-muted-foreground">Display start/pause/reset buttons</p>
          </div>
          <Switch
            checked={widget.config.showControls !== false}
            onCheckedChange={(checked) => onConfigChange('showControls', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Progress Bar</Label>
            <p className="text-xs text-muted-foreground">Display visual progress bar</p>
          </div>
          <Switch
            checked={widget.config.showProgressBar !== false}
            onCheckedChange={(checked) => onConfigChange('showProgressBar', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Card Container</Label>
            <p className="text-xs text-muted-foreground">Wrap in container card</p>
          </div>
          <Switch
            checked={widget.config.showContainer !== false}
            onCheckedChange={(checked) => onConfigChange('showContainer', checked)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Completion Message</Label>
        <Input
          value={widget.config.completionMessage || ''}
          onChange={(e) => onConfigChange('completionMessage', e.target.value)}
          placeholder="Time's up!"
          className="h-8 text-sm"
        />
      </div>

      <Separator />

      {/* Notifications */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Bell className="w-4 h-4" />
        Notifications
      </h4>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Notification</Label>
            <p className="text-xs text-muted-foreground">Display notification on complete</p>
          </div>
          <Switch
            checked={widget.config.showNotification === true}
            onCheckedChange={(checked) => onConfigChange('showNotification', checked)}
          />
        </div>

        {widget.config.showNotification && (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Notification Title</Label>
              <Input
                value={widget.config.notificationTitle || ''}
                onChange={(e) => onConfigChange('notificationTitle', e.target.value)}
                placeholder="Timer Complete!"
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Notification Message</Label>
              <Textarea
                value={widget.config.notificationMessage || ''}
                onChange={(e) => onConfigChange('notificationMessage', e.target.value)}
                placeholder="The countdown has finished."
                rows={2}
                className="text-sm"
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Play Sound</Label>
            <p className="text-xs text-muted-foreground">Play audio on complete</p>
          </div>
          <Switch
            checked={widget.config.playSound === true}
            onCheckedChange={(checked) => onConfigChange('playSound', checked)}
          />
        </div>

        {widget.config.playSound && (
          <div className="space-y-1">
            <Label className="text-xs">Sound URL (Optional)</Label>
            <Input
              value={widget.config.soundUrl || ''}
              onChange={(e) => onConfigChange('soundUrl', e.target.value)}
              placeholder="https://example.com/sound.mp3"
              className="h-8 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use default beep sound
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Execute Action on Complete</Label>
            <p className="text-xs text-muted-foreground">Trigger action when timer ends</p>
          </div>
          <Switch
            checked={widget.config.onCompleteAction === true}
            onCheckedChange={(checked) => onConfigChange('onCompleteAction', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Appearance Settings */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Palette className="w-4 h-4" />
        Appearance Settings
      </h4>
      
      <div className="space-y-1">
        <Label className="text-xs">Progress Bar Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={widget.config.progressColor || '#000000'}
            onChange={(e) => onConfigChange('progressColor', e.target.value)}
            className="w-12 h-8 p-1"
          />
          <Input
            value={widget.config.progressColor || '#000000'}
            onChange={(e) => onConfigChange('progressColor', e.target.value)}
            placeholder="#000000"
            className="flex-1 h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Icon Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={widget.config.iconColor || '#000000'}
            onChange={(e) => onConfigChange('iconColor', e.target.value)}
            className="w-12 h-8 p-1"
          />
          <Input
            value={widget.config.iconColor || '#000000'}
            onChange={(e) => onConfigChange('iconColor', e.target.value)}
            placeholder="#000000"
            className="flex-1 h-8 text-sm"
          />
        </div>
      </div>
    </>
  );
};
