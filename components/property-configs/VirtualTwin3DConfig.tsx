import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

interface VirtualTwin3DConfigProps {
  config: Record<string, any>;
  onConfigChange: (key: string, value: any) => void;
}

export const VirtualTwin3DConfig: React.FC<VirtualTwin3DConfigProps> = ({
  config,
  onConfigChange
}) => {
  const [selectedModelIndex, setSelectedModelIndex] = useState<number>(0);
  const initialModels = config.initialModels || [];

  const addModel = () => {
    const newModel = {
      id: `model-${Date.now()}`,
      url: '',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true
    };
    onConfigChange('initialModels', [...initialModels, newModel]);
    setSelectedModelIndex(initialModels.length);
  };

  const removeModel = (index: number) => {
    const updated = initialModels.filter((_: any, i: number) => i !== index);
    onConfigChange('initialModels', updated);
    setSelectedModelIndex(Math.max(0, index - 1));
  };

  const updateModel = (index: number, key: string, value: any) => {
    const updated = [...initialModels];
    updated[index] = { ...updated[index], [key]: value };
    onConfigChange('initialModels', updated);
  };

  const toggleModelVisibility = (index: number) => {
    const updated = [...initialModels];
    updated[index] = { ...updated[index], visible: !updated[index].visible };
    onConfigChange('initialModels', updated);
  };

  const selectedModel = initialModels[selectedModelIndex];

  return (
    <div className="space-y-4">
      {/* 3D Models Management */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground">3D Models</Label>
          <Button size="sm" variant="outline" onClick={addModel}>
            <Plus className="w-3 h-3 mr-1" />
            Add Model
          </Button>
        </div>

        {initialModels.length > 0 && (
          <div className="space-y-2">
            <div className="flex gap-1 flex-wrap">
              {initialModels.map((model: any, index: number) => (
                <div key={index} className="relative">
                  <Button
                    size="sm"
                    variant={selectedModelIndex === index ? 'default' : 'outline'}
                    onClick={() => setSelectedModelIndex(index)}
                    className="pr-8"
                  >
                    {model.id || `Model ${index + 1}`}
                  </Button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleModelVisibility(index);
                    }}
                    className="absolute right-6 top-1/2 -translate-y-1/2"
                  >
                    {model.visible ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3 opacity-50" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeModel(index);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              ))}
            </div>

            {selectedModel && (
              <div className="space-y-3 p-3 border rounded-md">
                <div className="space-y-2">
                  <Label htmlFor="modelId" className="text-sm">Model ID</Label>
                  <Input
                    id="modelId"
                    value={selectedModel.id || ''}
                    onChange={(e) => updateModel(selectedModelIndex, 'id', e.target.value)}
                    placeholder="model-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelUrl" className="text-sm">Model URL (glTF/GLB/STL)</Label>
                  <Input
                    id="modelUrl"
                    value={selectedModel.url || ''}
                    onChange={(e) => updateModel(selectedModelIndex, 'url', e.target.value)}
                    placeholder="https://example.com/model.glb"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Position [X, Y, Z]</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedModel.position?.[0] ?? 0}
                      onChange={(e) => updateModel(selectedModelIndex, 'position', [
                        parseFloat(e.target.value),
                        selectedModel.position?.[1] ?? 0,
                        selectedModel.position?.[2] ?? 0
                      ])}
                      placeholder="X"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedModel.position?.[1] ?? 0}
                      onChange={(e) => updateModel(selectedModelIndex, 'position', [
                        selectedModel.position?.[0] ?? 0,
                        parseFloat(e.target.value),
                        selectedModel.position?.[2] ?? 0
                      ])}
                      placeholder="Y"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedModel.position?.[2] ?? 0}
                      onChange={(e) => updateModel(selectedModelIndex, 'position', [
                        selectedModel.position?.[0] ?? 0,
                        selectedModel.position?.[1] ?? 0,
                        parseFloat(e.target.value)
                      ])}
                      placeholder="Z"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Rotation [X, Y, Z] (radians)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedModel.rotation?.[0] ?? 0}
                      onChange={(e) => updateModel(selectedModelIndex, 'rotation', [
                        parseFloat(e.target.value),
                        selectedModel.rotation?.[1] ?? 0,
                        selectedModel.rotation?.[2] ?? 0
                      ])}
                      placeholder="X"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedModel.rotation?.[1] ?? 0}
                      onChange={(e) => updateModel(selectedModelIndex, 'rotation', [
                        selectedModel.rotation?.[0] ?? 0,
                        parseFloat(e.target.value),
                        selectedModel.rotation?.[2] ?? 0
                      ])}
                      placeholder="Y"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedModel.rotation?.[2] ?? 0}
                      onChange={(e) => updateModel(selectedModelIndex, 'rotation', [
                        selectedModel.rotation?.[0] ?? 0,
                        selectedModel.rotation?.[1] ?? 0,
                        parseFloat(e.target.value)
                      ])}
                      placeholder="Z"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Scale [X, Y, Z]</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedModel.scale?.[0] ?? 1}
                      onChange={(e) => updateModel(selectedModelIndex, 'scale', [
                        parseFloat(e.target.value),
                        selectedModel.scale?.[1] ?? 1,
                        selectedModel.scale?.[2] ?? 1
                      ])}
                      placeholder="X"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedModel.scale?.[1] ?? 1}
                      onChange={(e) => updateModel(selectedModelIndex, 'scale', [
                        selectedModel.scale?.[0] ?? 1,
                        parseFloat(e.target.value),
                        selectedModel.scale?.[2] ?? 1
                      ])}
                      placeholder="Y"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedModel.scale?.[2] ?? 1}
                      onChange={(e) => updateModel(selectedModelIndex, 'scale', [
                        selectedModel.scale?.[0] ?? 1,
                        selectedModel.scale?.[1] ?? 1,
                        parseFloat(e.target.value)
                      ])}
                      placeholder="Z"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="modelColor" className="text-sm">Material Color (override)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="modelColor"
                      type="color"
                      value={selectedModel.color || '#ffffff'}
                      onChange={(e) => updateModel(selectedModelIndex, 'color', e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={selectedModel.color || ''}
                      onChange={(e) => updateModel(selectedModelIndex, 'color', e.target.value)}
                      placeholder="#ffffff or leave empty"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelMetalness" className="text-sm">Metalness (0-1)</Label>
                  <Input
                    id="modelMetalness"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={selectedModel.metalness ?? ''}
                    onChange={(e) => updateModel(selectedModelIndex, 'metalness', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Leave empty for default"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelRoughness" className="text-sm">Roughness (0-1)</Label>
                  <Input
                    id="modelRoughness"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={selectedModel.roughness ?? ''}
                    onChange={(e) => updateModel(selectedModelIndex, 'roughness', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Leave empty for default"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelOpacity" className="text-sm">Opacity (0-1)</Label>
                  <Input
                    id="modelOpacity"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={selectedModel.opacity ?? ''}
                    onChange={(e) => updateModel(selectedModelIndex, 'opacity', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Leave empty for default"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="modelWireframe" className="text-sm">Wireframe Mode</Label>
                  <Switch
                    id="modelWireframe"
                    checked={selectedModel.wireframe || false}
                    onCheckedChange={(checked) => updateModel(selectedModelIndex, 'wireframe', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="animationIndex" className="text-sm">Animation Index</Label>
                  <Input
                    id="animationIndex"
                    type="number"
                    step="1"
                    min="0"
                    value={selectedModel.animationIndex ?? ''}
                    onChange={(e) => updateModel(selectedModelIndex, 'animationIndex', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Leave empty for no animation"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animationSpeed" className="text-sm">Animation Speed</Label>
                  <Input
                    id="animationSpeed"
                    type="number"
                    step="0.1"
                    value={selectedModel.animationSpeed ?? 1}
                    onChange={(e) => updateModel(selectedModelIndex, 'animationSpeed', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {initialModels.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No models added. Click "Add Model" to start.
          </p>
        )}
      </div>

      <Separator />

      {/* Scene Settings */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Scene Settings</Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="useStaging" className="text-sm">Use Stage (Auto Lighting & Shadows)</Label>
            <Switch
              id="useStaging"
              checked={config.useStaging || false}
              onCheckedChange={(checked) => onConfigChange('useStaging', checked)}
            />
          </div>

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
            <div className="space-y-2">
              <Label htmlFor="axesSize" className="text-sm">Axes Size</Label>
              <Input
                id="axesSize"
                type="number"
                step="0.5"
                min="1"
                max="20"
                value={config.axesSize ?? 5}
                onChange={(e) => onConfigChange('axesSize', parseFloat(e.target.value))}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="useEnvironment" className="text-sm">Use Environment Lighting</Label>
            <Switch
              id="useEnvironment"
              checked={config.useEnvironment !== false}
              onCheckedChange={(checked) => onConfigChange('useEnvironment', checked)}
            />
          </div>

          {config.useEnvironment !== false && (
            <div className="space-y-2">
              <Label htmlFor="environmentPreset" className="text-sm">Environment Preset</Label>
              <Select
                value={config.environmentPreset || 'city'}
                onValueChange={(value) => onConfigChange('environmentPreset', value)}
              >
                <SelectTrigger id="environmentPreset">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunset">Sunset</SelectItem>
                  <SelectItem value="dawn">Dawn</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="forest">Forest</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="city">City</SelectItem>
                  <SelectItem value="park">Park</SelectItem>
                  <SelectItem value="lobby">Lobby</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <Label className="text-sm">Camera Position [X, Y, Z]</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                step="0.5"
                value={config.cameraPosition?.[0] ?? 5}
                onChange={(e) => onConfigChange('cameraPosition', [
                  parseFloat(e.target.value),
                  config.cameraPosition?.[1] ?? 5,
                  config.cameraPosition?.[2] ?? 5
                ])}
                placeholder="X"
              />
              <Input
                type="number"
                step="0.5"
                value={config.cameraPosition?.[1] ?? 5}
                onChange={(e) => onConfigChange('cameraPosition', [
                  config.cameraPosition?.[0] ?? 5,
                  parseFloat(e.target.value),
                  config.cameraPosition?.[2] ?? 5
                ])}
                placeholder="Y"
              />
              <Input
                type="number"
                step="0.5"
                value={config.cameraPosition?.[2] ?? 5}
                onChange={(e) => onConfigChange('cameraPosition', [
                  config.cameraPosition?.[0] ?? 5,
                  config.cameraPosition?.[1] ?? 5,
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
              value={config.cameraFov || 50}
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
        <Label className="text-xs font-medium text-muted-foreground">Lighting (when not using Stage)</Label>
        
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

          <div className="flex items-center justify-between">
            <Label htmlFor="enableShadows" className="text-sm">Enable Shadows</Label>
            <Switch
              id="enableShadows"
              checked={config.enableShadows || false}
              onCheckedChange={(checked) => onConfigChange('enableShadows', checked)}
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
