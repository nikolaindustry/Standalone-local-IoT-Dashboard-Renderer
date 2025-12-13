import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Video, Play, Settings, Palette } from 'lucide-react';

interface VideoPlayerConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (property: string, value: any) => void;
}

export const VideoPlayerConfig: React.FC<VideoPlayerConfigProps> = ({
  widget,
  onConfigChange
}) => {
  return (
    <>
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Video className="w-4 h-4" />
        Video Player Configuration
      </h4>
      
      {/* Video URL */}
      <div className="space-y-1">
        <Label className="text-xs">Video URL</Label>
        <Input
          value={widget.config.videoUrl || ''}
          onChange={(e) => onConfigChange('videoUrl', e.target.value)}
          placeholder="https://example.com/video.mp4"
          className="h-8 text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Enter the URL of the video file (MP4, WebM, OGG)
        </p>
      </div>

      <Separator />

      {/* Playback Settings */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Play className="w-4 h-4" />
        Playback Settings
      </h4>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Controls</Label>
            <p className="text-xs text-muted-foreground">Display video controls</p>
          </div>
          <Switch
            checked={widget.config.videoControls !== false}
            onCheckedChange={(checked) => onConfigChange('videoControls', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Autoplay</Label>
            <p className="text-xs text-muted-foreground">Start playing automatically</p>
          </div>
          <Switch
            checked={widget.config.videoAutoplay || false}
            onCheckedChange={(checked) => onConfigChange('videoAutoplay', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Loop</Label>
            <p className="text-xs text-muted-foreground">Repeat video continuously</p>
          </div>
          <Switch
            checked={widget.config.videoLoop || false}
            onCheckedChange={(checked) => onConfigChange('videoLoop', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Muted</Label>
            <p className="text-xs text-muted-foreground">Start with audio muted</p>
          </div>
          <Switch
            checked={widget.config.videoMuted || false}
            onCheckedChange={(checked) => onConfigChange('videoMuted', checked)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Playback Speed: {widget.config.videoPlaybackRate || 1}x</Label>
        <Slider
          value={[widget.config.videoPlaybackRate || 1]}
          onValueChange={([value]) => onConfigChange('videoPlaybackRate', value)}
          min={0.25}
          max={2}
          step={0.25}
          className="mt-1"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0.25x</span>
          <span>2x</span>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">
          Volume: {Math.round((widget.config.videoVolume !== undefined ? widget.config.videoVolume : 1) * 100)}%
        </Label>
        <Slider
          value={[widget.config.videoVolume !== undefined ? widget.config.videoVolume : 1]}
          onValueChange={([value]) => onConfigChange('videoVolume', value)}
          min={0}
          max={1}
          step={0.1}
          className="mt-1"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <Separator />

      {/* Display Settings */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Display Settings
      </h4>
      
      <div className="space-y-1">
        <Label className="text-xs">Poster Image URL (Optional)</Label>
        <Input
          value={widget.config.videoPoster || ''}
          onChange={(e) => onConfigChange('videoPoster', e.target.value)}
          placeholder="https://example.com/poster.jpg"
          className="h-8 text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Image shown before video plays
        </p>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Video Fit</Label>
        <Select
          value={widget.config.videoFit || 'contain'}
          onValueChange={(value) => onConfigChange('videoFit', value)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contain">Contain</SelectItem>
            <SelectItem value="cover">Cover</SelectItem>
            <SelectItem value="fill">Fill</SelectItem>
            <SelectItem value="scale-down">Scale Down</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Alignment</Label>
        <Select
          value={widget.config.videoAlignment || 'center'}
          onValueChange={(value) => onConfigChange('videoAlignment', value)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Styling */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Palette className="w-4 h-4" />
        Styling
      </h4>
      
      <div className="space-y-1">
        <Label className="text-xs">Border Radius: {widget.config.videoBorderRadius || 6}px</Label>
        <Slider
          value={[widget.config.videoBorderRadius || 6]}
          onValueChange={([value]) => onConfigChange('videoBorderRadius', value)}
          min={0}
          max={50}
          step={1}
          className="mt-1"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0px</span>
          <span>50px</span>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Border Width: {widget.config.videoBorderWidth || 0}px</Label>
        <Slider
          value={[widget.config.videoBorderWidth || 0]}
          onValueChange={([value]) => onConfigChange('videoBorderWidth', value)}
          min={0}
          max={20}
          step={1}
          className="mt-1"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0px</span>
          <span>20px</span>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Border Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={widget.config.videoBorderColor || '#00000000'}
            onChange={(e) => onConfigChange('videoBorderColor', e.target.value)}
            className="w-12 h-8 p-1"
          />
          <Input
            value={widget.config.videoBorderColor || '#00000000'}
            onChange={(e) => onConfigChange('videoBorderColor', e.target.value)}
            placeholder="#00000000"
            className="flex-1 h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Background Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={widget.config.videoBackgroundColor || '#00000000'}
            onChange={(e) => onConfigChange('videoBackgroundColor', e.target.value)}
            className="w-12 h-8 p-1"
          />
          <Input
            value={widget.config.videoBackgroundColor || '#00000000'}
            onChange={(e) => onConfigChange('videoBackgroundColor', e.target.value)}
            placeholder="#00000000"
            className="flex-1 h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Padding</Label>
        <Input
          value={widget.config.videoPadding || '0px'}
          onChange={(e) => onConfigChange('videoPadding', e.target.value)}
          placeholder="e.g., 0px, 0.5rem"
          className="h-8 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Video Width</Label>
          <Input
            value={widget.config.videoWidth || '100%'}
            onChange={(e) => onConfigChange('videoWidth', e.target.value)}
            placeholder="e.g., 100%, 640px"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Video Height</Label>
          <Input
            value={widget.config.videoHeight || '100%'}
            onChange={(e) => onConfigChange('videoHeight', e.target.value)}
            placeholder="e.g., 100%, 360px"
            className="h-8 text-sm"
          />
        </div>
      </div>

      <Separator />

      {/* Display Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Container</Label>
            <p className="text-xs text-muted-foreground">Display widget container</p>
          </div>
          <Switch
            checked={widget.config.showVideoContainer !== false}
            onCheckedChange={(checked) => onConfigChange('showVideoContainer', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Widget Label</Label>
            <p className="text-xs text-muted-foreground">Display widget title</p>
          </div>
          <Switch
            checked={widget.config.showLabel !== false}
            onCheckedChange={(checked) => onConfigChange('showLabel', checked)}
          />
        </div>
      </div>
    </>
  );
};
