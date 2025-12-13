/**
 * ThreeDViewerConfig Component
 * 
 * Independent configuration panel for 3D Viewer widgets in the IoT Dashboard Builder.
 * Provides comprehensive property settings with the same functionality as the product dashboard designer.
 * 
 * Features:
 * - Model URL configuration for loading 3D models
 * - Support for multiple formats: STL, OBJ, GLTF, GLB
 * - Model and background color customization
 * - Camera position control (X, Y, Z coordinates)
 * - Interactive controls (rotate, zoom, pan)
 * - Auto-rotation toggle
 * - Grid and axes helpers display
 * - Lighting and material settings
 * - Animation controls
 * 
 * @component
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Box } from 'lucide-react';
import { IoTDashboardWidget } from '../../types';

interface ThreeDViewerConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (key: string, value: any) => void;
}

export const ThreeDViewerConfig: React.FC<ThreeDViewerConfigProps> = ({
  widget,
  onConfigChange
}) => {
  const cameraPosition = widget.config.cameraPosition || [5, 5, 5];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Box className="w-4 h-4" />
        <h4 className="text-sm font-semibold">3D Viewer Settings</h4>
      </div>

      {/* Model Configuration */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Model Configuration</Label>
        
        <div className="space-y-1">
          <Label htmlFor="modelUrl" className="text-xs">Model URL</Label>
          <Input
            id="modelUrl"
            value={widget.config.modelUrl || ''}
            onChange={(e) => onConfigChange('modelUrl', e.target.value)}
            placeholder="https://example.com/model.stl"
            className="h-8 text-sm font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Supported formats: STL, OBJ, GLTF, GLB
          </p>
          <p className="text-xs text-amber-600">
            ⚠️ 3MF format requires conversion to STL/OBJ/GLTF
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="modelFormat" className="text-xs">Model Format</Label>
          <Select
            value={widget.config.modelFormat || 'auto'}
            onValueChange={(value) => onConfigChange('modelFormat', value)}
          >
            <SelectTrigger id="modelFormat" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              <SelectItem value="stl">STL (Stereolithography)</SelectItem>
              <SelectItem value="obj">OBJ (Wavefront)</SelectItem>
              <SelectItem value="gltf">GLTF (GL Transmission Format)</SelectItem>
              <SelectItem value="glb">GLB (Binary GLTF)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Color Settings */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Color Settings</Label>
        
        <div className="space-y-1">
          <Label htmlFor="modelColor" className="text-xs">Model Color</Label>
          <div className="flex gap-2">
            <Input
              id="modelColor"
              type="color"
              value={widget.config.modelColor || '#4f46e5'}
              onChange={(e) => onConfigChange('modelColor', e.target.value)}
              className="h-8 w-16"
            />
            <Input
              value={widget.config.modelColor || '#4f46e5'}
              onChange={(e) => onConfigChange('modelColor', e.target.value)}
              placeholder="#4f46e5"
              className="h-8 flex-1 text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="backgroundColor" className="text-xs">Background Color</Label>
          <div className="flex gap-2">
            <Input
              id="backgroundColor"
              type="color"
              value={widget.config.backgroundColor || '#1a1a1a'}
              onChange={(e) => onConfigChange('backgroundColor', e.target.value)}
              className="h-8 w-16"
            />
            <Input
              value={widget.config.backgroundColor || '#1a1a1a'}
              onChange={(e) => onConfigChange('backgroundColor', e.target.value)}
              placeholder="#1a1a1a"
              className="h-8 flex-1 text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="wireframeColor" className="text-xs">Wireframe Color (Optional)</Label>
          <div className="flex gap-2">
            <Input
              id="wireframeColor"
              type="color"
              value={widget.config.wireframeColor || '#ffffff'}
              onChange={(e) => onConfigChange('wireframeColor', e.target.value)}
              className="h-8 w-16"
            />
            <Input
              value={widget.config.wireframeColor || '#ffffff'}
              onChange={(e) => onConfigChange('wireframeColor', e.target.value)}
              placeholder="#ffffff"
              className="h-8 flex-1 text-sm font-mono"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Camera Settings */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Camera Settings</Label>
        
        <div className="space-y-1">
          <Label className="text-xs">Camera Position (X, Y, Z)</Label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="camX" className="text-xs text-muted-foreground">X</Label>
              <Input
                id="camX"
                type="number"
                value={cameraPosition[0]}
                onChange={(e) => onConfigChange('cameraPosition', [
                  parseFloat(e.target.value) || 0,
                  cameraPosition[1],
                  cameraPosition[2]
                ])}
                placeholder="5"
                step="0.5"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="camY" className="text-xs text-muted-foreground">Y</Label>
              <Input
                id="camY"
                type="number"
                value={cameraPosition[1]}
                onChange={(e) => onConfigChange('cameraPosition', [
                  cameraPosition[0],
                  parseFloat(e.target.value) || 0,
                  cameraPosition[2]
                ])}
                placeholder="5"
                step="0.5"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="camZ" className="text-xs text-muted-foreground">Z</Label>
              <Input
                id="camZ"
                type="number"
                value={cameraPosition[2]}
                onChange={(e) => onConfigChange('cameraPosition', [
                  cameraPosition[0],
                  cameraPosition[1],
                  parseFloat(e.target.value) || 0
                ])}
                placeholder="5"
                step="0.5"
                className="h-8 text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Default: [5, 5, 5] - Adjust to change viewing angle
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="cameraFov" className="text-xs">Field of View (FOV)</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="cameraFov"
              value={[widget.config.cameraFov || 75]}
              onValueChange={(value) => onConfigChange('cameraFov', value[0])}
              min={20}
              max={120}
              step={5}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-12 text-right">
              {widget.config.cameraFov || 75}°
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            20° - 120° (Default: 75°)
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="zoomLevel" className="text-xs">Initial Zoom Level</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="zoomLevel"
              value={[widget.config.zoomLevel || 1]}
              onValueChange={(value) => onConfigChange('zoomLevel', value[0])}
              min={0.5}
              max={3}
              step={0.1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-12 text-right">
              {(widget.config.zoomLevel || 1).toFixed(1)}x
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Controls & Interaction */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Controls & Interaction</Label>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="enableControls" className="text-xs">Enable Controls</Label>
          <Switch
            id="enableControls"
            checked={widget.config.enableControls !== false}
            onCheckedChange={(checked) => onConfigChange('enableControls', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Allow rotate, zoom, and pan interactions
        </p>

        <div className="flex items-center justify-between">
          <Label htmlFor="autoRotate" className="text-xs">Auto Rotate</Label>
          <Switch
            id="autoRotate"
            checked={widget.config.autoRotate || false}
            onCheckedChange={(checked) => onConfigChange('autoRotate', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Automatically rotate the model continuously
        </p>

        {widget.config.autoRotate && (
          <div className="space-y-1">
            <Label htmlFor="rotationSpeed" className="text-xs">Rotation Speed</Label>
            <div className="flex items-center gap-2">
              <Slider
                id="rotationSpeed"
                value={[widget.config.rotationSpeed || 1]}
                onValueChange={(value) => onConfigChange('rotationSpeed', value[0])}
                min={0.1}
                max={5}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-12 text-right">
                {(widget.config.rotationSpeed || 1).toFixed(1)}x
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="enableDamping" className="text-xs">Enable Damping</Label>
          <Switch
            id="enableDamping"
            checked={widget.config.enableDamping !== false}
            onCheckedChange={(checked) => onConfigChange('enableDamping', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Smooth inertia effect when rotating
        </p>
      </div>

      <Separator />

      {/* Display Options */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Display Options</Label>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="showGrid" className="text-xs">Show Grid</Label>
          <Switch
            id="showGrid"
            checked={widget.config.showGrid !== false}
            onCheckedChange={(checked) => onConfigChange('showGrid', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showAxes" className="text-xs">Show Axes</Label>
          <Switch
            id="showAxes"
            checked={widget.config.showAxes || false}
            onCheckedChange={(checked) => onConfigChange('showAxes', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="wireframeMode" className="text-xs">Wireframe Mode</Label>
          <Switch
            id="wireframeMode"
            checked={widget.config.wireframeMode || false}
            onCheckedChange={(checked) => onConfigChange('wireframeMode', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showContainer" className="text-xs">Show Container</Label>
          <Switch
            id="showContainer"
            checked={widget.config.showContainer !== false}
            onCheckedChange={(checked) => onConfigChange('showContainer', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showLabel" className="text-xs">Show Label</Label>
          <Switch
            id="showLabel"
            checked={widget.config.showLabel !== false}
            onCheckedChange={(checked) => onConfigChange('showLabel', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Lighting Settings */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Lighting Settings</Label>
        
        <div className="space-y-1">
          <Label htmlFor="ambientLightIntensity" className="text-xs">Ambient Light Intensity</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="ambientLightIntensity"
              value={[widget.config.ambientLightIntensity || 0.5]}
              onValueChange={(value) => onConfigChange('ambientLightIntensity', value[0])}
              min={0}
              max={2}
              step={0.1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-12 text-right">
              {(widget.config.ambientLightIntensity || 0.5).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="directionalLightIntensity" className="text-xs">Directional Light Intensity</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="directionalLightIntensity"
              value={[widget.config.directionalLightIntensity || 1]}
              onValueChange={(value) => onConfigChange('directionalLightIntensity', value[0])}
              min={0}
              max={3}
              step={0.1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-12 text-right">
              {(widget.config.directionalLightIntensity || 1).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="enableShadows" className="text-xs">Enable Shadows</Label>
          <Switch
            id="enableShadows"
            checked={widget.config.enableShadows || false}
            onCheckedChange={(checked) => onConfigChange('enableShadows', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Material Settings */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Material Settings</Label>
        
        <div className="space-y-1">
          <Label htmlFor="materialType" className="text-xs">Material Type</Label>
          <Select
            value={widget.config.materialType || 'standard'}
            onValueChange={(value) => onConfigChange('materialType', value)}
          >
            <SelectTrigger id="materialType" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic (No lighting)</SelectItem>
              <SelectItem value="standard">Standard (PBR)</SelectItem>
              <SelectItem value="phong">Phong (Shiny)</SelectItem>
              <SelectItem value="lambert">Lambert (Matte)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="metalness" className="text-xs">Metalness</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="metalness"
              value={[widget.config.metalness || 0]}
              onValueChange={(value) => onConfigChange('metalness', value[0])}
              min={0}
              max={1}
              step={0.1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-12 text-right">
              {(widget.config.metalness || 0).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="roughness" className="text-xs">Roughness</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="roughness"
              value={[widget.config.roughness || 0.5]}
              onValueChange={(value) => onConfigChange('roughness', value[0])}
              min={0}
              max={1}
              step={0.1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-12 text-right">
              {(widget.config.roughness || 0.5).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="opacity" className="text-xs">Opacity</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="opacity"
              value={[widget.config.modelOpacity || 1]}
              onValueChange={(value) => onConfigChange('modelOpacity', value[0])}
              min={0}
              max={1}
              step={0.05}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-12 text-right">
              {(widget.config.modelOpacity || 1).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Performance Settings */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Performance Settings</Label>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="enableAntialiasing" className="text-xs">Enable Antialiasing</Label>
          <Switch
            id="enableAntialiasing"
            checked={widget.config.enableAntialiasing !== false}
            onCheckedChange={(checked) => onConfigChange('enableAntialiasing', checked)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pixelRatio" className="text-xs">Pixel Ratio</Label>
          <Select
            value={String(widget.config.pixelRatio || 'auto')}
            onValueChange={(value) => onConfigChange('pixelRatio', value === 'auto' ? 'auto' : parseFloat(value))}
          >
            <SelectTrigger id="pixelRatio" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (Device Default)</SelectItem>
              <SelectItem value="1">1x (Best Performance)</SelectItem>
              <SelectItem value="1.5">1.5x (Balanced)</SelectItem>
              <SelectItem value="2">2x (High Quality)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="enableStats" className="text-xs">Show Performance Stats</Label>
          <Switch
            id="enableStats"
            checked={widget.config.enableStats || false}
            onCheckedChange={(checked) => onConfigChange('enableStats', checked)}
          />
        </div>
      </div>
    </div>
  );
};
