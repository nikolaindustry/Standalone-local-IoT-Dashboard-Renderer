import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Zap, Palette, Settings } from 'lucide-react';

interface EMSpectrumConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (property: string, value: any) => void;
}

export const EMSpectrumConfig: React.FC<EMSpectrumConfigProps> = ({
  widget,
  onConfigChange
}) => {
  return (
    <>
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Zap className="w-4 h-4" />
        Electromagnetic Spectrum Configuration
      </h4>

      {/* Title Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Title</Label>
          <Switch
            checked={widget.config.emShowTitle !== false}
            onCheckedChange={(checked) => onConfigChange('emShowTitle', checked)}
          />
        </div>

        {widget.config.emShowTitle !== false && (
          <div className="space-y-1">
            <Label className="text-xs">Custom Title</Label>
            <Input
              value={widget.config.emCustomTitle || 'Electromagnetic Spectrum'}
              onChange={(e) => onConfigChange('emCustomTitle', e.target.value)}
              placeholder="Electromagnetic Spectrum"
              className="h-8 text-sm"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Display Settings */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Display Settings
      </h4>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Orientation</Label>
          <Select
            value={widget.config.emOrientation || 'horizontal'}
            onValueChange={(value) => onConfigChange('emOrientation', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal">Horizontal</SelectItem>
              <SelectItem value="vertical">Vertical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Band Height: {widget.config.emBandHeight || 60}px</Label>
          <Slider
            value={[widget.config.emBandHeight || 60]}
            onValueChange={([value]) => onConfigChange('emBandHeight', value)}
            min={30}
            max={200}
            step={10}
            className="mt-2"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Band Spacing: {widget.config.emBandSpacing || 0}px</Label>
          <Slider
            value={[widget.config.emBandSpacing || 0]}
            onValueChange={([value]) => onConfigChange('emBandSpacing', value)}
            min={0}
            max={20}
            step={1}
            className="mt-2"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Border Radius: {widget.config.emBorderRadius || 8}px</Label>
          <Slider
            value={[widget.config.emBorderRadius || 8]}
            onValueChange={([value]) => onConfigChange('emBorderRadius', value)}
            min={0}
            max={50}
            step={1}
            className="mt-2"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Container Card</Label>
          <Switch
            checked={widget.config.emShowContainer !== false}
            onCheckedChange={(checked) => onConfigChange('emShowContainer', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Label Settings */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Palette className="w-4 h-4" />
        Label Settings
      </h4>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Labels</Label>
          <Switch
            checked={widget.config.emShowLabels !== false}
            onCheckedChange={(checked) => onConfigChange('emShowLabels', checked)}
          />
        </div>

        {widget.config.emShowLabels !== false && (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Label Position</Label>
              <Select
                value={widget.config.emLabelPosition || 'inside'}
                onValueChange={(value) => onConfigChange('emLabelPosition', value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inside">Inside Bands</SelectItem>
                  <SelectItem value="outside">Outside Bands</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Label Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={widget.config.emLabelColor || '#ffffff'}
                  onChange={(e) => onConfigChange('emLabelColor', e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={widget.config.emLabelColor || '#ffffff'}
                  onChange={(e) => onConfigChange('emLabelColor', e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1 h-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Label Font Size: {widget.config.emLabelFontSize || 12}px</Label>
              <Slider
                value={[widget.config.emLabelFontSize || 12]}
                onValueChange={([value]) => onConfigChange('emLabelFontSize', value)}
                min={8}
                max={24}
                step={1}
                className="mt-2"
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Wavelengths</Label>
          <Switch
            checked={widget.config.emShowWavelengths !== false}
            onCheckedChange={(checked) => onConfigChange('emShowWavelengths', checked)}
          />
        </div>

        {widget.config.emShowWavelengths !== false && (
          <div className="space-y-1">
            <Label className="text-xs">Wavelength Font Size: {widget.config.emWavelengthFontSize || 10}px</Label>
            <Slider
              value={[widget.config.emWavelengthFontSize || 10]}
              onValueChange={([value]) => onConfigChange('emWavelengthFontSize', value)}
              min={6}
              max={18}
              step={1}
              className="mt-2"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Frequency</Label>
          <Switch
            checked={widget.config.emShowFrequency !== false}
            onCheckedChange={(checked) => onConfigChange('emShowFrequency', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Legend</Label>
          <Switch
            checked={widget.config.emShowLegend !== false}
            onCheckedChange={(checked) => onConfigChange('emShowLegend', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Highlight Settings */}
      <h4 className="text-sm font-medium">Highlight Band</h4>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Highlight Band</Label>
          <Select
            value={widget.config.emHighlightBand || 'none'}
            onValueChange={(value) => onConfigChange('emHighlightBand', value === 'none' ? undefined : value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="Radio">Radio</SelectItem>
              <SelectItem value="Microwave">Microwave</SelectItem>
              <SelectItem value="Infrared">Infrared</SelectItem>
              <SelectItem value="Visible">Visible</SelectItem>
              <SelectItem value="Ultraviolet">Ultraviolet</SelectItem>
              <SelectItem value="X-Ray">X-Ray</SelectItem>
              <SelectItem value="Gamma Ray">Gamma Ray</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Highlight a specific band with glow effect
          </p>
        </div>

        {widget.config.emHighlightBand && (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Highlight Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={widget.config.emHighlightColor || '#FFD700'}
                  onChange={(e) => onConfigChange('emHighlightColor', e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={widget.config.emHighlightColor || '#FFD700'}
                  onChange={(e) => onConfigChange('emHighlightColor', e.target.value)}
                  placeholder="#FFD700"
                  className="flex-1 h-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Highlight Opacity: {((widget.config.emHighlightOpacity || 0.3) * 100).toFixed(0)}%</Label>
              <Slider
                value={[(widget.config.emHighlightOpacity || 0.3) * 100]}
                onValueChange={([value]) => onConfigChange('emHighlightOpacity', value / 100)}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Animate Highlight</Label>
              <Switch
                checked={widget.config.emAnimateHighlight !== false}
                onCheckedChange={(checked) => onConfigChange('emAnimateHighlight', checked)}
              />
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* Usage Hint */}
      <div className="bg-muted/50 border rounded-md p-3">
        <p className="text-xs text-muted-foreground">
          <strong>Usage:</strong> This widget displays the electromagnetic spectrum with customizable visualization.
          You can highlight specific bands, adjust colors, and show wavelength/frequency information.
          Use it for educational purposes or to indicate active frequency bands in your IoT application.
        </p>
      </div>
    </>
  );
};
