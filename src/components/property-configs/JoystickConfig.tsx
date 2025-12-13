import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Gamepad2, Move3D, Settings } from 'lucide-react';

interface JoystickConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (property: string, value: any) => void;
}

export const JoystickConfig: React.FC<JoystickConfigProps> = ({
  widget,
  onConfigChange
}) => {
  return (
    <>
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Gamepad2 className="w-4 h-4" />
        Joystick Configuration
      </h4>
      
      {/* Joystick Size Preset */}
      <div className="space-y-1">
        <Label className="text-xs">Joystick Size</Label>
        <Select
          value={widget.config.joystickSize || 'md'}
          onValueChange={(value) => onConfigChange('joystickSize', value)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Joystick Size */}
      <div className="space-y-1">
        <Label className="text-xs">Custom Joystick Size: {widget.config.customJoystickSize || 160}px</Label>
        <Slider
          value={[widget.config.customJoystickSize || 160]}
          onValueChange={([value]) => onConfigChange('customJoystickSize', value)}
          min={80}
          max={300}
          step={10}
          className="mt-1"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>80px</span>
          <span>300px</span>
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <h4 className="text-sm font-medium">Colors</h4>
      
      <div className="space-y-1">
        <Label className="text-xs">Handle Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={widget.config.joystickHandleColor || '#3b82f6'}
            onChange={(e) => onConfigChange('joystickHandleColor', e.target.value)}
            className="w-12 h-8 p-1"
          />
          <Input
            value={widget.config.joystickHandleColor || '#3b82f6'}
            onChange={(e) => onConfigChange('joystickHandleColor', e.target.value)}
            placeholder="#3b82f6"
            className="flex-1 h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Base Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={widget.config.joystickBaseColor || '#e5e7eb'}
            onChange={(e) => onConfigChange('joystickBaseColor', e.target.value)}
            className="w-12 h-8 p-1"
          />
          <Input
            value={widget.config.joystickBaseColor || '#e5e7eb'}
            onChange={(e) => onConfigChange('joystickBaseColor', e.target.value)}
            placeholder="#e5e7eb"
            className="flex-1 h-8 text-sm"
          />
        </div>
      </div>

      <Separator />

      {/* Behavior */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Behavior
      </h4>
      
      <div className="space-y-1">
        <Label className="text-xs">Sensitivity: {widget.config.joystickSensitivity || 1}</Label>
        <Slider
          value={[widget.config.joystickSensitivity || 1]}
          onValueChange={([value]) => onConfigChange('joystickSensitivity', value)}
          min={0.1}
          max={2}
          step={0.1}
          className="mt-1"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low (0.1)</span>
          <span>High (2.0)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Min Value</Label>
          <Input
            type="number"
            value={widget.config.joystickMinValue || -100}
            onChange={(e) => onConfigChange('joystickMinValue', parseFloat(e.target.value) || -100)}
            placeholder="-100"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Max Value</Label>
          <Input
            type="number"
            value={widget.config.joystickMaxValue || 100}
            onChange={(e) => onConfigChange('joystickMaxValue', parseFloat(e.target.value) || 100)}
            placeholder="100"
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Dead Zone: {widget.config.joystickDeadZone || 10}%</Label>
        <Slider
          value={[widget.config.joystickDeadZone || 10]}
          onValueChange={([value]) => onConfigChange('joystickDeadZone', value)}
          min={0}
          max={50}
          step={1}
          className="mt-1"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>None (0%)</span>
          <span>Large (50%)</span>
        </div>
      </div>

      <Separator />

      {/* Display Options */}
      <h4 className="text-sm font-medium">Display Options</h4>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Container</Label>
            <p className="text-xs text-muted-foreground">Display card container around joystick</p>
          </div>
          <Switch
            checked={widget.config.showJoystickContainer !== false}
            onCheckedChange={(checked) => onConfigChange('showJoystickContainer', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Label</Label>
            <p className="text-xs text-muted-foreground">Display title and coordinates</p>
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
