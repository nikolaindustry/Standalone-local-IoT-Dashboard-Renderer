import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface VectorPlot3DConfigProps {
  config: Record<string, any>;
  onConfigChange: (key: string, value: any) => void;
}

export const VectorPlot3DConfig: React.FC<VectorPlot3DConfigProps> = ({
  config,
  onConfigChange
}) => {
  return (
    <div className="space-y-4">
      {/* Data Source */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Data Source</Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="websocketEnabled" className="text-sm">WebSocket Enabled</Label>
            <Switch
              id="websocketEnabled"
              checked={config.websocketEnabled || false}
              onCheckedChange={(checked) => onConfigChange('websocketEnabled', checked)}
            />
          </div>
          
          {config.websocketEnabled && (
            <div className="space-y-2">
              <Label htmlFor="websocketTopic" className="text-sm">WebSocket Topic</Label>
              <Input
                id="websocketTopic"
                value={config.websocketTopic || ''}
                onChange={(e) => onConfigChange('websocketTopic', e.target.value)}
                placeholder="e.g., vectors/sensor1"
              />
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Vector Display Settings */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Vector Display</Label>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="vectorScale" className="text-sm">Vector Scale</Label>
            <Input
              id="vectorScale"
              type="number"
              step="0.1"
              value={config.vectorScale ?? 1}
              onChange={(e) => onConfigChange('vectorScale', parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="colorMode" className="text-sm">Color Mode</Label>
            <Select
              value={config.colorMode || 'static'}
              onValueChange={(value) => onConfigChange('colorMode', value)}
            >
              <SelectTrigger id="colorMode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">Static Color</SelectItem>
                <SelectItem value="magnitude">By Magnitude</SelectItem>
                <SelectItem value="axis">By Dominant Axis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.colorMode === 'static' && (
            <div className="space-y-2">
              <Label htmlFor="staticColor" className="text-sm">Vector Color</Label>
              <div className="flex gap-2">
                <Input
                  id="staticColor"
                  type="color"
                  value={config.staticColor || '#4f46e5'}
                  onChange={(e) => onConfigChange('staticColor', e.target.value)}
                  className="w-20"
                />
                <Input
                  value={config.staticColor || '#4f46e5'}
                  onChange={(e) => onConfigChange('staticColor', e.target.value)}
                  placeholder="#4f46e5"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="opacity" className="text-sm">Opacity</Label>
            <Input
              id="opacity"
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={config.opacity ?? 1}
              onChange={(e) => onConfigChange('opacity', parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="historyWindow" className="text-sm">History Window (0 = disabled)</Label>
            <Input
              id="historyWindow"
              type="number"
              step="1"
              min="0"
              value={config.historyWindow || 0}
              onChange={(e) => onConfigChange('historyWindow', parseInt(e.target.value))}
              placeholder="Number of vectors to keep"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Arrow Design Settings */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Arrow Design</Label>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="displayMode" className="text-sm">Display Mode</Label>
            <Select
              value={config.displayMode || 'arrows-and-points'}
              onValueChange={(value) => onConfigChange('displayMode', value)}
            >
              <SelectTrigger id="displayMode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arrows-only">Arrows Only</SelectItem>
                <SelectItem value="arrows-and-points">Arrows + Points</SelectItem>
                <SelectItem value="points-only">Points Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(config.displayMode !== 'points-only') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="arrowShaftRadius" className="text-sm">Shaft Thickness</Label>
                <Input
                  id="arrowShaftRadius"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="0.2"
                  value={config.arrowShaftRadius ?? 0.02}
                  onChange={(e) => onConfigChange('arrowShaftRadius', parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrowHeadRadius" className="text-sm">Head Size</Label>
                <Input
                  id="arrowHeadRadius"
                  type="number"
                  step="0.01"
                  min="0.02"
                  max="0.3"
                  value={config.arrowHeadRadius ?? 0.06}
                  onChange={(e) => onConfigChange('arrowHeadRadius', parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrowHeadLength" className="text-sm">Head Length</Label>
                <Input
                  id="arrowHeadLength"
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1"
                  value={config.arrowHeadLength ?? 0.2}
                  onChange={(e) => onConfigChange('arrowHeadLength', parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrowSegments" className="text-sm">Arrow Smoothness (segments)</Label>
                <Select
                  value={String(config.arrowSegments || 8)}
                  onValueChange={(value) => onConfigChange('arrowSegments', parseInt(value))}
                >
                  <SelectTrigger id="arrowSegments">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 (Low)</SelectItem>
                    <SelectItem value="8">8 (Medium)</SelectItem>
                    <SelectItem value="12">12 (High)</SelectItem>
                    <SelectItem value="16">16 (Very High)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {(config.displayMode === 'arrows-and-points' || config.displayMode === 'points-only') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="pointMarkerSize" className="text-sm">Point Marker Size</Label>
                <Input
                  id="pointMarkerSize"
                  type="number"
                  step="0.01"
                  min="0.02"
                  max="0.5"
                  value={config.pointMarkerSize ?? 0.08}
                  onChange={(e) => onConfigChange('pointMarkerSize', parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pointColorMode" className="text-sm">Point Color Mode</Label>
                <Select
                  value={config.pointColorMode || 'static'}
                  onValueChange={(value) => onConfigChange('pointColorMode', value)}
                >
                  <SelectTrigger id="pointColorMode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="static">Static Color</SelectItem>
                    <SelectItem value="zone-octant">Zone: Octant (±X, ±Y, ±Z)</SelectItem>
                    <SelectItem value="zone-radial">Zone: Radial Distance</SelectItem>
                    <SelectItem value="zone-height">Zone: Height (Y-axis)</SelectItem>
                    <SelectItem value="magnitude">By Magnitude</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.pointColorMode === 'static' && (
                <div className="space-y-2">
                  <Label htmlFor="pointMarkerColor" className="text-sm">Point Marker Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="pointMarkerColor"
                      type="color"
                      value={config.pointMarkerColor || '#ff6b6b'}
                      onChange={(e) => onConfigChange('pointMarkerColor', e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={config.pointMarkerColor || '#ff6b6b'}
                      onChange={(e) => onConfigChange('pointMarkerColor', e.target.value)}
                      placeholder="#ff6b6b"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="showPointLabels" className="text-sm">Show Point Labels</Label>
                <Switch
                  id="showPointLabels"
                  checked={config.showPointLabels || false}
                  onCheckedChange={(checked) => onConfigChange('showPointLabels', checked)}
                />
              </div>

              {config.showPointLabels && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="labelFormat" className="text-sm">Label Format</Label>
                    <Select
                      value={config.labelFormat || 'xyz'}
                      onValueChange={(value) => onConfigChange('labelFormat', value)}
                    >
                      <SelectTrigger id="labelFormat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xyz">X:1.5, Y:2.0, Z:0.8</SelectItem>
                        <SelectItem value="compact">(1.5, 2.0, 0.8)</SelectItem>
                        <SelectItem value="array">[1.5, 2.0, 0.8]</SelectItem>
                        <SelectItem value="multiline">Multi-line</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="labelPrecision" className="text-sm">Label Decimal Precision</Label>
                    <Select
                      value={String(config.labelPrecision ?? 2)}
                      onValueChange={(value) => onConfigChange('labelPrecision', parseInt(value))}
                    >
                      <SelectTrigger id="labelPrecision">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 decimals</SelectItem>
                        <SelectItem value="1">1 decimal</SelectItem>
                        <SelectItem value="2">2 decimals</SelectItem>
                        <SelectItem value="3">3 decimals</SelectItem>
                        <SelectItem value="4">4 decimals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="labelSize" className="text-sm">Label Size</Label>
                    <Input
                      id="labelSize"
                      type="number"
                      step="0.05"
                      min="0.1"
                      max="1"
                      value={config.labelSize ?? 0.3}
                      onChange={(e) => onConfigChange('labelSize', parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="labelColor" className="text-sm">Label Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="labelColor"
                        type="color"
                        value={config.labelColor || '#ffffff'}
                        onChange={(e) => onConfigChange('labelColor', e.target.value)}
                        className="w-20"
                      />
                      <Input
                        value={config.labelColor || '#ffffff'}
                        onChange={(e) => onConfigChange('labelColor', e.target.value)}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="labelOffset" className="text-sm">Label Offset Distance</Label>
                    <Input
                      id="labelOffset"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="2"
                      value={config.labelOffset ?? 0.3}
                      onChange={(e) => onConfigChange('labelOffset', parseFloat(e.target.value))}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Legacy Tip Markers (deprecated, replaced by display mode) */}
      {config.showVectorTips && config.displayMode !== 'arrows-and-points' && config.displayMode !== 'points-only' && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Legacy Tip Markers (use Display Mode instead)</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="showVectorTips" className="text-sm">Show Vector Tips (Legacy)</Label>
              <Switch
                id="showVectorTips"
                checked={config.showVectorTips || false}
                onCheckedChange={(checked) => onConfigChange('showVectorTips', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipMarkerSize" className="text-sm">Tip Marker Size</Label>
              <Input
                id="tipMarkerSize"
                type="number"
                step="0.01"
                min="0.02"
                max="0.3"
                value={config.tipMarkerSize ?? 0.08}
                onChange={(e) => onConfigChange('tipMarkerSize', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipMarkerColor" className="text-sm">Tip Marker Color</Label>
              <div className="flex gap-2">
                <Input
                  id="tipMarkerColor"
                  type="color"
                  value={config.tipMarkerColor || '#ff6b6b'}
                  onChange={(e) => onConfigChange('tipMarkerColor', e.target.value)}
                  className="w-20"
                />
                <Input
                  value={config.tipMarkerColor || '#ff6b6b'}
                  onChange={(e) => onConfigChange('tipMarkerColor', e.target.value)}
                  placeholder="#ff6b6b"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Origin Point Settings */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Origin Point</Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="showOrigin" className="text-sm">Show Origin Point</Label>
            <Switch
              id="showOrigin"
              checked={config.showOrigin !== false}
              onCheckedChange={(checked) => onConfigChange('showOrigin', checked)}
            />
          </div>

          {config.showOrigin !== false && (
            <>
              <div className="space-y-2">
                <Label htmlFor="originSize" className="text-sm">Origin Point Size</Label>
                <Input
                  id="originSize"
                  type="number"
                  step="0.01"
                  min="0.02"
                  max="0.3"
                  value={config.originSize ?? 0.05}
                  onChange={(e) => onConfigChange('originSize', parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originColor" className="text-sm">Origin Point Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="originColor"
                    type="color"
                    value={config.originColor || '#ffffff'}
                    onChange={(e) => onConfigChange('originColor', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    value={config.originColor || '#ffffff'}
                    onChange={(e) => onConfigChange('originColor', e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Scene Settings */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Scene Settings</Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="showGrid" className="text-sm">Show Grid</Label>
            <Switch
              id="showGrid"
              checked={config.showGrid !== false}
              onCheckedChange={(checked) => onConfigChange('showGrid', checked)}
            />
          </div>

          {config.showGrid !== false && (
            <>
              <div className="space-y-2">
                <Label htmlFor="gridCellColor" className="text-sm">Grid Cell Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="gridCellColor"
                    type="color"
                    value={config.gridCellColor || '#6b7280'}
                    onChange={(e) => onConfigChange('gridCellColor', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    value={config.gridCellColor || '#6b7280'}
                    onChange={(e) => onConfigChange('gridCellColor', e.target.value)}
                    placeholder="#6b7280"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gridSectionColor" className="text-sm">Grid Section Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="gridSectionColor"
                    type="color"
                    value={config.gridSectionColor || '#374151'}
                    onChange={(e) => onConfigChange('gridSectionColor', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    value={config.gridSectionColor || '#374151'}
                    onChange={(e) => onConfigChange('gridSectionColor', e.target.value)}
                    placeholder="#374151"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gridSize" className="text-sm">Grid Size</Label>
                <Input
                  id="gridSize"
                  type="number"
                  step="1"
                  min="5"
                  max="50"
                  value={config.gridSize ?? 10}
                  onChange={(e) => onConfigChange('gridSize', parseInt(e.target.value))}
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="showAxes" className="text-sm">Show Axes</Label>
            <Switch
              id="showAxes"
              checked={config.showAxes !== false}
              onCheckedChange={(checked) => onConfigChange('showAxes', checked)}
            />
          </div>

          {config.showAxes !== false && (
            <>
              <div className="space-y-2">
                <Label htmlFor="axesSize" className="text-sm">Axes Size</Label>
                <Input
                  id="axesSize"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="10"
                  value={config.axesSize ?? 2}
                  onChange={(e) => onConfigChange('axesSize', parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="xAxisColor" className="text-sm">X-Axis Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="xAxisColor"
                    type="color"
                    value={config.xAxisColor || '#ff0000'}
                    onChange={(e) => onConfigChange('xAxisColor', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    value={config.xAxisColor || '#ff0000'}
                    onChange={(e) => onConfigChange('xAxisColor', e.target.value)}
                    placeholder="#ff0000 (Red)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yAxisColor" className="text-sm">Y-Axis Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="yAxisColor"
                    type="color"
                    value={config.yAxisColor || '#00ff00'}
                    onChange={(e) => onConfigChange('yAxisColor', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    value={config.yAxisColor || '#00ff00'}
                    onChange={(e) => onConfigChange('yAxisColor', e.target.value)}
                    placeholder="#00ff00 (Green)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zAxisColor" className="text-sm">Z-Axis Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="zAxisColor"
                    type="color"
                    value={config.zAxisColor || '#0000ff'}
                    onChange={(e) => onConfigChange('zAxisColor', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    value={config.zAxisColor || '#0000ff'}
                    onChange={(e) => onConfigChange('zAxisColor', e.target.value)}
                    placeholder="#0000ff (Blue)"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="backgroundColor" className="text-sm">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="backgroundColor"
                type="color"
                value={config.backgroundColor || '#1a1a1a'}
                onChange={(e) => onConfigChange('backgroundColor', e.target.value)}
                className="w-20"
              />
              <Input
                value={config.backgroundColor || '#1a1a1a'}
                onChange={(e) => onConfigChange('backgroundColor', e.target.value)}
                placeholder="#1a1a1a"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showContainer" className="text-sm">Show Container</Label>
            <Switch
              id="showContainer"
              checked={config.showContainer !== false}
              onCheckedChange={(checked) => onConfigChange('showContainer', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showLabel" className="text-sm">Show Label</Label>
            <Switch
              id="showLabel"
              checked={config.showLabel !== false}
              onCheckedChange={(checked) => onConfigChange('showLabel', checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Camera Settings */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Camera</Label>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm">Camera Position</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                step="0.1"
                value={config.cameraPosition?.[0] ?? 3}
                onChange={(e) => onConfigChange('cameraPosition', [
                  parseFloat(e.target.value),
                  config.cameraPosition?.[1] ?? 3,
                  config.cameraPosition?.[2] ?? 3
                ])}
                placeholder="X"
              />
              <Input
                type="number"
                step="0.1"
                value={config.cameraPosition?.[1] ?? 3}
                onChange={(e) => onConfigChange('cameraPosition', [
                  config.cameraPosition?.[0] ?? 3,
                  parseFloat(e.target.value),
                  config.cameraPosition?.[2] ?? 3
                ])}
                placeholder="Y"
              />
              <Input
                type="number"
                step="0.1"
                value={config.cameraPosition?.[2] ?? 3}
                onChange={(e) => onConfigChange('cameraPosition', [
                  config.cameraPosition?.[0] ?? 3,
                  config.cameraPosition?.[1] ?? 3,
                  parseFloat(e.target.value)
                ])}
                placeholder="Z"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cameraFov" className="text-sm">Field of View</Label>
            <Input
              id="cameraFov"
              type="number"
              step="1"
              min="30"
              max="120"
              value={config.cameraFov || 75}
              onChange={(e) => onConfigChange('cameraFov', parseInt(e.target.value))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enableControls" className="text-sm">Enable Controls</Label>
            <Switch
              id="enableControls"
              checked={config.enableControls !== false}
              onCheckedChange={(checked) => onConfigChange('enableControls', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enableDamping" className="text-sm">Enable Damping</Label>
            <Switch
              id="enableDamping"
              checked={config.enableDamping !== false}
              onCheckedChange={(checked) => onConfigChange('enableDamping', checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Lighting Settings */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Lighting</Label>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="ambientLightIntensity" className="text-sm">Ambient Light Intensity</Label>
            <Input
              id="ambientLightIntensity"
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={config.ambientLightIntensity ?? 0.5}
              onChange={(e) => onConfigChange('ambientLightIntensity', parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="directionalLightIntensity" className="text-sm">Directional Light Intensity</Label>
            <Input
              id="directionalLightIntensity"
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={config.directionalLightIntensity ?? 1}
              onChange={(e) => onConfigChange('directionalLightIntensity', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Performance Settings */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Performance</Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="enableAntialiasing" className="text-sm">Enable Antialiasing</Label>
            <Switch
              id="enableAntialiasing"
              checked={config.enableAntialiasing !== false}
              onCheckedChange={(checked) => onConfigChange('enableAntialiasing', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pixelRatio" className="text-sm">Pixel Ratio</Label>
            <Select
              value={config.pixelRatio || 'auto'}
              onValueChange={(value) => onConfigChange('pixelRatio', value)}
            >
              <SelectTrigger id="pixelRatio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
