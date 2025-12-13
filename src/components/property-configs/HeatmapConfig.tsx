import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

interface HeatmapConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (property: string, value: any) => void;
}

export const HeatmapConfig: React.FC<HeatmapConfigProps> = ({
  widget,
  onConfigChange
}) => {
  return (
    <>
      <h4 className="text-sm font-medium">Heatmap Configuration</h4>
      
      {/* Color Scheme Selection */}
      <div className="space-y-1">
        <Label className="text-xs">Color Scheme</Label>
        <Select
          value={widget.config.heatmapColorScheme || 'blue'}
          onValueChange={(value) => onConfigChange('heatmapColorScheme', value)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blue">Blue Gradient</SelectItem>
            <SelectItem value="red">Red Gradient</SelectItem>
            <SelectItem value="green">Green Gradient</SelectItem>
            <SelectItem value="purple">Purple Gradient</SelectItem>
            <SelectItem value="rainbow">Rainbow</SelectItem>
            <SelectItem value="custom">Custom Colors</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Colors (only shown when custom color scheme is selected) */}
      {widget.config.heatmapColorScheme === 'custom' && (
        <div className="space-y-1">
          <Label className="text-xs">Custom Colors (comma-separated hex values)</Label>
          <Input
            value={widget.config.heatmapCustomColors?.join(', ') || ''}
            onChange={(e) => onConfigChange('heatmapCustomColors', e.target.value.split(',').map(color => color.trim()))}
            placeholder="#ff0000, #00ff00, #0000ff"
            className="h-8 text-sm"
          />
        </div>
      )}

      <Separator />

      {/* Value Range */}
      <h4 className="text-sm font-medium">Value Range</h4>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Min Value: {widget.config.heatmapMinValue || 0}</Label>
          <Slider
            value={[widget.config.heatmapMinValue || 0]}
            onValueChange={([value]) => onConfigChange('heatmapMinValue', value)}
            min={-100}
            max={100}
            step={1}
            className="mt-1"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Max Value: {widget.config.heatmapMaxValue || 100}</Label>
          <Slider
            value={[widget.config.heatmapMaxValue || 100]}
            onValueChange={([value]) => onConfigChange('heatmapMaxValue', value)}
            min={-100}
            max={1000}
            step={1}
            className="mt-1"
          />
        </div>
      </div>

      <Separator />

      {/* Point Configuration */}
      <h4 className="text-sm font-medium">Point Configuration</h4>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Point Size: {widget.config.heatmapPointSize || 10}px</Label>
          <Slider
            value={[widget.config.heatmapPointSize || 10]}
            onValueChange={([value]) => onConfigChange('heatmapPointSize', value)}
            min={2}
            max={50}
            step={1}
            className="mt-1"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Point Shape</Label>
          <Select
            value={widget.config.heatmapPointShape || 'circle'}
            onValueChange={(value) => onConfigChange('heatmapPointShape', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="triangle">Triangle</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Label Configuration */}
      <h4 className="text-sm font-medium">Labels</h4>
      
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Labels</Label>
        <Switch
          checked={widget.config.heatmapShowLabels !== false}
          onCheckedChange={(checked) => onConfigChange('heatmapShowLabels', checked)}
        />
      </div>

      {widget.config.heatmapShowLabels !== false && (
        <div className="space-y-1">
          <Label className="text-xs">Label Font Size: {widget.config.heatmapLabelFontSize || 12}px</Label>
          <Slider
            value={[widget.config.heatmapLabelFontSize || 12]}
            onValueChange={([value]) => onConfigChange('heatmapLabelFontSize', value)}
            min={8}
            max={24}
            step={1}
            className="mt-1"
          />
        </div>
      )}

      <Separator />

      {/* Axis Configuration */}
      <h4 className="text-sm font-medium">Axis</h4>
      
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Axis</Label>
        <Switch
          checked={widget.config.heatmapShowAxis !== false}
          onCheckedChange={(checked) => onConfigChange('heatmapShowAxis', checked)}
        />
      </div>

      {widget.config.heatmapShowAxis !== false && (
        <div className="space-y-1">
          <Label className="text-xs">Axis Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={widget.config.heatmapAxisColor || '#000000'}
              onChange={(e) => onConfigChange('heatmapAxisColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={widget.config.heatmapAxisColor || '#000000'}
              onChange={(e) => onConfigChange('heatmapAxisColor', e.target.value)}
              placeholder="#000000"
              className="flex-1 h-8 text-sm"
            />
          </div>
        </div>
      )}

      <Separator />

      {/* Background and Border Styling */}
      <h4 className="text-sm font-medium">Styling</h4>
      
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Background Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={widget.config.heatmapBackgroundColor || '#ffffff'}
              onChange={(e) => onConfigChange('heatmapBackgroundColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={widget.config.heatmapBackgroundColor || '#ffffff'}
              onChange={(e) => onConfigChange('heatmapBackgroundColor', e.target.value)}
              placeholder="#ffffff"
              className="flex-1 h-8 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Border Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={widget.config.heatmapBorderColor || '#e2e8f0'}
              onChange={(e) => onConfigChange('heatmapBorderColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={widget.config.heatmapBorderColor || '#e2e8f0'}
              onChange={(e) => onConfigChange('heatmapBorderColor', e.target.value)}
              placeholder="#e2e8f0"
              className="flex-1 h-8 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Border Width: {widget.config.heatmapBorderWidth || 1}px</Label>
          <Slider
            value={[widget.config.heatmapBorderWidth || 1]}
            onValueChange={([value]) => onConfigChange('heatmapBorderWidth', value)}
            min={0}
            max={10}
            step={1}
            className="mt-1"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Border Radius: {widget.config.heatmapBorderRadius || 4}px</Label>
          <Slider
            value={[widget.config.heatmapBorderRadius || 4]}
            onValueChange={([value]) => onConfigChange('heatmapBorderRadius', value)}
            min={0}
            max={50}
            step={1}
            className="mt-1"
          />
        </div>
      </div>

      {/* Gradient Mode Options */}
      {widget.config.heatmapPointShape === 'gradient' && (
        <>
          <Separator />
          <h4 className="text-sm font-medium">Gradient Options</h4>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Smoothing Radius: {widget.config.heatmapSmoothingRadius || 30}px</Label>
              <Slider
                value={[widget.config.heatmapSmoothingRadius || 30]}
                onValueChange={([value]) => onConfigChange('heatmapSmoothingRadius', value)}
                min={5}
                max={100}
                step={1}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Contours</Label>
              <Switch
                checked={widget.config.heatmapShowContours === true}
                onCheckedChange={(checked) => onConfigChange('heatmapShowContours', checked)}
              />
            </div>

            {widget.config.heatmapShowContours && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs">Contour Line Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={widget.config.heatmapContourColor || '#000000'}
                      onChange={(e) => onConfigChange('heatmapContourColor', e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={widget.config.heatmapContourColor || '#000000'}
                      onChange={(e) => onConfigChange('heatmapContourColor', e.target.value)}
                      placeholder="#000000"
                      className="flex-1 h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Contour Line Width: {widget.config.heatmapContourWidth || 1}px</Label>
                  <Slider
                    value={[widget.config.heatmapContourWidth || 1]}
                    onValueChange={([value]) => onConfigChange('heatmapContourWidth', value)}
                    min={1}
                    max={5}
                    step={0.5}
                    className="mt-1"
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}

      <Separator />

      {/* Container Options */}
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Container</Label>
        <Switch
          checked={widget.config.heatmapShowContainer !== false}
          onCheckedChange={(checked) => onConfigChange('heatmapShowContainer', checked)}
        />
      </div>
    </>
  );
};
