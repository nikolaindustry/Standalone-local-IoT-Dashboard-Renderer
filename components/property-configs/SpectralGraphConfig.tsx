import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { LineChart, Palette, Settings, Zap } from 'lucide-react';

interface SpectralGraphConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (property: string, value: any) => void;
}

export const SpectralGraphConfig: React.FC<SpectralGraphConfigProps> = ({
  widget,
  onConfigChange
}) => {
  return (
    <>
      <h4 className="text-sm font-medium flex items-center gap-2">
        <LineChart className="w-4 h-4" />
        Spectral Graph Configuration
      </h4>

      {/* Title Settings */}
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Widget Title</Label>
          <Input
            value={widget.config.spectralCustomTitle || 'Spectral Graph'}
            onChange={(e) => onConfigChange('spectralCustomTitle', e.target.value)}
            placeholder="Spectral Graph"
            className="h-8 text-sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Container Card</Label>
          <Switch
            checked={widget.config.spectralShowContainer !== false}
            onCheckedChange={(checked) => onConfigChange('spectralShowContainer', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Wavelength Configuration */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Wavelength Settings
      </h4>

      <div className="space-y-3">
        <div className="bg-muted/50 border rounded-md p-3">
          <p className="text-xs text-muted-foreground mb-2">
            <strong>Important:</strong> Configure the wavelength range to map array indices to wavelengths.
            The first data point = Start wavelength, last data point = End wavelength.
            Settings are saved automatically in the dashboard.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Start Wavelength (nm)</Label>
            <Input
              type="number"
              value={widget.config.spectralStartWavelength || 380}
              onChange={(e) => onConfigChange('spectralStartWavelength', parseFloat(e.target.value) || 380)}
              className="h-8 text-sm"
              placeholder="380"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">End Wavelength (nm)</Label>
            <Input
              type="number"
              value={widget.config.spectralEndWavelength || 780}
              onChange={(e) => onConfigChange('spectralEndWavelength', parseFloat(e.target.value) || 780)}
              className="h-8 text-sm"
              placeholder="780"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Wavelength Unit</Label>
          <Select
            value={widget.config.spectralWavelengthUnit || 'nm'}
            onValueChange={(value) => onConfigChange('spectralWavelengthUnit', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nm">Nanometers (nm)</SelectItem>
              <SelectItem value="μm">Micrometers (μm)</SelectItem>
              <SelectItem value="Å">Angstroms (Å)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Chart Settings */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Zap className="w-4 h-4" />
        Chart Settings
      </h4>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Chart Type</Label>
          <Select
            value={widget.config.spectralChartType || 'line'}
            onValueChange={(value) => onConfigChange('spectralChartType', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="scatter">Scatter Plot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Data Smoothing</Label>
          <Select
            value={widget.config.spectralSmoothing || 'none'}
            onValueChange={(value) => onConfigChange('spectralSmoothing', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="average">Moving Average</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Animation Duration: {widget.config.spectralAnimationDuration || 300}ms</Label>
          <Slider
            value={[widget.config.spectralAnimationDuration || 300]}
            onValueChange={([value]) => onConfigChange('spectralAnimationDuration', value)}
            min={0}
            max={1000}
            step={50}
            className="mt-2"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Grid</Label>
          <Switch
            checked={widget.config.spectralShowGrid !== false}
            onCheckedChange={(checked) => onConfigChange('spectralShowGrid', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Tooltip</Label>
          <Switch
            checked={widget.config.spectralShowTooltip !== false}
            onCheckedChange={(checked) => onConfigChange('spectralShowTooltip', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Legend</Label>
          <Switch
            checked={widget.config.spectralShowLegend !== false}
            onCheckedChange={(checked) => onConfigChange('spectralShowLegend', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Current Value Badge</Label>
          <Switch
            checked={widget.config.spectralShowCurrentValue !== false}
            onCheckedChange={(checked) => onConfigChange('spectralShowCurrentValue', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Scale Settings */}
      <h4 className="text-sm font-medium">Y-Axis Scale</h4>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-xs">Auto Scale</Label>
            <p className="text-xs text-muted-foreground">Automatically adjust Y-axis range</p>
          </div>
          <Switch
            checked={widget.config.spectralAutoScale !== false}
            onCheckedChange={(checked) => onConfigChange('spectralAutoScale', checked)}
          />
        </div>

        {widget.config.spectralAutoScale === false && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Min Value</Label>
              <Input
                type="number"
                value={widget.config.spectralManualMin || 0}
                onChange={(e) => onConfigChange('spectralManualMin', parseFloat(e.target.value) || 0)}
                className="h-8 text-sm"
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max Value</Label>
              <Input
                type="number"
                value={widget.config.spectralManualMax || 100}
                onChange={(e) => onConfigChange('spectralManualMax', parseFloat(e.target.value) || 100)}
                className="h-8 text-sm"
                placeholder="100"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <Label className="text-xs">Max Data Points in History: {widget.config.spectralMaxDataPoints || 100}</Label>
          <Slider
            value={[widget.config.spectralMaxDataPoints || 100]}
            onValueChange={([value]) => onConfigChange('spectralMaxDataPoints', value)}
            min={10}
            max={500}
            step={10}
            className="mt-2"
          />
        </div>
      </div>

      <Separator />

      {/* Color Settings */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Palette className="w-4 h-4" />
        Color Settings
      </h4>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-xs">Use Spectrum Colors</Label>
            <p className="text-xs text-muted-foreground">Color data points by wavelength</p>
          </div>
          <Switch
            checked={widget.config.spectralUseSpectrumColors !== false}
            onCheckedChange={(checked) => onConfigChange('spectralUseSpectrumColors', checked)}
          />
        </div>

        {widget.config.spectralUseSpectrumColors === false && (
          <div className="space-y-1">
            <Label className="text-xs">Data Point Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={widget.config.spectralDataPointColor || '#3b82f6'}
                onChange={(e) => onConfigChange('spectralDataPointColor', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input
                value={widget.config.spectralDataPointColor || '#3b82f6'}
                onChange={(e) => onConfigChange('spectralDataPointColor', e.target.value)}
                placeholder="#3b82f6"
                className="flex-1 h-8 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* WebSocket Data Format Help */}
      <div className="bg-muted/50 border rounded-md p-3">
        <h5 className="text-xs font-semibold mb-2">WebSocket Message Format</h5>
        <pre className="text-xs bg-background p-2 rounded overflow-auto">
{`{
  "from": "device-id",
  "payload": {
    "widgetId": "widget-id",
    "value": [3.22, 24.19, ...]
  }
}`}
        </pre>
        <p className="text-xs text-muted-foreground mt-2">
          The widget will extract the array from <code>payload.value</code> and map each index to a wavelength.
        </p>
      </div>

      <Separator />

      {/* Usage Guide */}
      <div className="bg-muted/50 border rounded-md p-3">
        <h5 className="text-xs font-semibold mb-2">Usage Guide</h5>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Configure wavelength range before collecting data</li>
          <li>Each array index maps to a wavelength between start and end</li>
          <li>Real-time updates as WebSocket messages arrive</li>
          <li>Export data to CSV for analysis</li>
          <li>Enable spectrum colors for visible light visualization</li>
        </ul>
      </div>
    </>
  );
};
