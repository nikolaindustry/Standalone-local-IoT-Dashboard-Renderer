import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

interface AttitudeConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (property: string, value: any) => void;
}

export const AttitudeConfig: React.FC<AttitudeConfigProps> = ({
  widget,
  onConfigChange
}) => {
  return (
    <>
      <h4 className="text-sm font-medium">Attitude Indicator Configuration</h4>
      
      {/* Display Type Selection */}
      <div className="space-y-1">
        <Label className="text-xs">Display Type</Label>
        <Select
          value={widget.config.displayType || 'traditional'}
          onValueChange={(value) => onConfigChange('displayType', value)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="traditional">Traditional Indicator</SelectItem>
            <SelectItem value="modern">Modern Indicator</SelectItem>
            <SelectItem value="digital">Digital Display</SelectItem>
            <SelectItem value="numeric">Numeric Readout</SelectItem>
            <SelectItem value="minimal">Minimal Indicator</SelectItem>
            <SelectItem value="compact">Compact Gauge</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Size */}
      <div className="space-y-1">
        <Label className="text-xs">Instrument Size: {widget.config.attitudeSize || 250}px</Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[widget.config.attitudeSize || 250]}
            onValueChange={([value]) => onConfigChange('attitudeSize', value)}
            min={150}
            max={500}
            step={10}
            className="flex-1"
          />
          <Input
            type="number"
            value={widget.config.attitudeSize || 250}
            onChange={(e) => onConfigChange('attitudeSize', parseInt(e.target.value) || 250)}
            className="w-20 h-8 text-sm"
            min="150"
            max="500"
          />
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <h4 className="text-sm font-medium">Colors</h4>
      
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Sky Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={widget.config.attitudeSkyColor || '#87ceeb'}
              onChange={(e) => onConfigChange('attitudeSkyColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={widget.config.attitudeSkyColor || '#87ceeb'}
              onChange={(e) => onConfigChange('attitudeSkyColor', e.target.value)}
              placeholder="#87ceeb"
              className="flex-1 h-8 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Ground Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={widget.config.attitudeGroundColor || '#8b6f47'}
              onChange={(e) => onConfigChange('attitudeGroundColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={widget.config.attitudeGroundColor || '#8b6f47'}
              onChange={(e) => onConfigChange('attitudeGroundColor', e.target.value)}
              placeholder="#8b6f47"
              className="flex-1 h-8 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Aircraft Symbol Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={widget.config.attitudeAircraftColor || '#ffffff'}
              onChange={(e) => onConfigChange('attitudeAircraftColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={widget.config.attitudeAircraftColor || '#ffffff'}
              onChange={(e) => onConfigChange('attitudeAircraftColor', e.target.value)}
              placeholder="#ffffff"
              className="flex-1 h-8 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Background Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={widget.config.attitudeBackgroundColor || '#1f2937'}
              onChange={(e) => onConfigChange('attitudeBackgroundColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={widget.config.attitudeBackgroundColor || '#1f2937'}
              onChange={(e) => onConfigChange('attitudeBackgroundColor', e.target.value)}
              placeholder="#1f2937"
              className="flex-1 h-8 text-sm"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Border Configuration */}
      <h4 className="text-sm font-medium">Border</h4>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Width: {widget.config.attitudeBorderWidth || 2}px</Label>
          <Slider
            value={[widget.config.attitudeBorderWidth || 2]}
            onValueChange={([value]) => onConfigChange('attitudeBorderWidth', value)}
            min={0}
            max={10}
            step={1}
            className="mt-1"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Radius: {widget.config.attitudeBorderRadius || 8}px</Label>
          <Slider
            value={[widget.config.attitudeBorderRadius || 8]}
            onValueChange={([value]) => onConfigChange('attitudeBorderRadius', value)}
            min={0}
            max={50}
            step={1}
            className="mt-1"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Color</Label>
          <Input
            type="color"
            value={widget.config.attitudeBorderColor || '#374151'}
            onChange={(e) => onConfigChange('attitudeBorderColor', e.target.value)}
            className="w-full h-8 p-1"
          />
        </div>
      </div>

      <Separator />

      {/* Animation Speed */}
      <div className="space-y-1">
        <Label className="text-xs">Animation Speed</Label>
        <Select
          value={widget.config.attitudeAnimationSpeed || 'smooth'}
          onValueChange={(value) => onConfigChange('attitudeAnimationSpeed', value)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fast">Fast (200ms)</SelectItem>
            <SelectItem value="smooth">Smooth (500ms)</SelectItem>
            <SelectItem value="slow">Slow (1000ms)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Display Options */}
      <h4 className="text-sm font-medium">Display Options</h4>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Degree Markings</Label>
          <Switch
            checked={widget.config.attitudeShowDegreeMarkings !== false}
            onCheckedChange={(checked) => onConfigChange('attitudeShowDegreeMarkings', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Value Indicators</Label>
          <Switch
            checked={widget.config.attitudeShowValues !== false}
            onCheckedChange={(checked) => onConfigChange('attitudeShowValues', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Container</Label>
          <Switch
            checked={widget.config.attitudeShowContainer !== false}
            onCheckedChange={(checked) => onConfigChange('attitudeShowContainer', checked)}
          />
        </div>
      </div>
    </>
  );
};
