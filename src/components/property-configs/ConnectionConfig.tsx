// Connection Configuration Panel
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import type { DashboardConnection, ConnectionWaypoint } from '../../types';

interface ConnectionConfigProps {
  connection: DashboardConnection;
  onUpdate: (updates: Partial<DashboardConnection>) => void;
}

export const ConnectionConfig: React.FC<ConnectionConfigProps> = ({
  connection,
  onUpdate,
}) => {
  const style = connection.style || {};

  const updateStyle = (updates: Partial<typeof style>) => {
    onUpdate({ style: { ...style, ...updates } });
  };

  const updateLabel = (updates: Partial<typeof connection.label>) => {
    onUpdate({ label: { ...connection.label, ...updates } as any });
  };

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Basic</TabsTrigger>
        <TabsTrigger value="routing">Routing</TabsTrigger>
        <TabsTrigger value="style">Style</TabsTrigger>
        <TabsTrigger value="label">Label</TabsTrigger>
      </TabsList>

      {/* Basic Tab */}
      <TabsContent value="basic" className="space-y-4 mt-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Connection Points</h4>
          
          <div className="space-y-2">
            <Label className="text-xs">Source Position (X, Y)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={connection.source.x || 0}
                onChange={(e) => onUpdate({ 
                  source: { ...connection.source, x: parseFloat(e.target.value) || 0 } 
                })}
                placeholder="X"
                className="flex-1"
              />
              <Input
                type="number"
                value={connection.source.y || 0}
                onChange={(e) => onUpdate({ 
                  source: { ...connection.source, y: parseFloat(e.target.value) || 0 } 
                })}
                placeholder="Y"
                className="flex-1"
              />
            </div>
            {connection.source.widgetId && (
              <p className="text-xs text-muted-foreground">
                Linked to widget: {connection.source.widgetId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Target Position (X, Y)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={connection.target.x || 0}
                onChange={(e) => onUpdate({ 
                  target: { ...connection.target, x: parseFloat(e.target.value) || 0 } 
                })}
                placeholder="X"
                className="flex-1"
              />
              <Input
                type="number"
                value={connection.target.y || 0}
                onChange={(e) => onUpdate({ 
                  target: { ...connection.target, y: parseFloat(e.target.value) || 0 } 
                })}
                placeholder="Y"
                className="flex-1"
              />
            </div>
            {connection.target.widgetId && (
              <p className="text-xs text-muted-foreground">
                Linked to widget: {connection.target.widgetId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Curve Type</Label>
            <Select
              value={style.curveType || 'bezier'}
              onValueChange={(value) => updateStyle({ curveType: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="straight">Straight</SelectItem>
                <SelectItem value="bezier">Bezier</SelectItem>
                <SelectItem value="step">Step</SelectItem>
                <SelectItem value="smoothstep">Smooth Step</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Metadata</h4>
          
          <div className="space-y-2">
            <Label className="text-xs">Description</Label>
            <Input
              value={connection.metadata?.description || ''}
              onChange={(e) => onUpdate({ 
                metadata: { ...connection.metadata, description: e.target.value } 
              })}
              placeholder="Connection description"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Data Flow</Label>
            <Input
              value={connection.metadata?.dataFlow || ''}
              onChange={(e) => onUpdate({ 
                metadata: { ...connection.metadata, dataFlow: e.target.value } 
              })}
              placeholder="e.g., sensor → controller"
            />
          </div>
        </div>
      </TabsContent>

      {/* Routing Tab - Multi-segment waypoints */}
      <TabsContent value="routing" className="space-y-4 mt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Waypoints ({connection.waypoints?.length || 0})</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newWaypoint: ConnectionWaypoint = {
                  x: (connection.source.x + connection.target.x) / 2,
                  y: (connection.source.y + connection.target.y) / 2,
                  id: `wp-${Date.now()}`
                };
                onUpdate({ 
                  waypoints: [...(connection.waypoints || []), newWaypoint] 
                });
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Waypoint
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Waypoints create multi-segment paths with bends, like electrical wiring.
          </p>

          {connection.waypoints && connection.waypoints.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {connection.waypoints.map((waypoint, index) => (
                <div key={waypoint.id || index} className="p-3 border rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Waypoint {index + 1}</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const newWaypoints = connection.waypoints?.filter((_, i) => i !== index);
                        onUpdate({ waypoints: newWaypoints });
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">X</Label>
                      <Input
                        type="number"
                        value={waypoint.x}
                        onChange={(e) => {
                          const newWaypoints = [...(connection.waypoints || [])];
                          newWaypoints[index] = { ...waypoint, x: parseFloat(e.target.value) || 0 };
                          onUpdate({ waypoints: newWaypoints });
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Y</Label>
                      <Input
                        type="number"
                        value={waypoint.y}
                        onChange={(e) => {
                          const newWaypoints = [...(connection.waypoints || [])];
                          newWaypoints[index] = { ...waypoint, y: parseFloat(e.target.value) || 0 };
                          onUpdate({ waypoints: newWaypoints });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-md">
              No waypoints. Add waypoints to create multi-segment routing.
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Corner Radius: {style.cornerRadius || 0}px</Label>
          <Slider
            value={[style.cornerRadius || 0]}
            onValueChange={([value]) => updateStyle({ cornerRadius: value })}
            min={0}
            max={50}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            Rounds corners where line segments meet (0 = sharp corners)
          </p>
        </div>
      </TabsContent>

      {/* Style Tab */}
      <TabsContent value="style" className="space-y-4 mt-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Line Style</h4>
          
          <div className="space-y-2">
            <Label className="text-xs">Line Type</Label>
            <Select
              value={style.lineStyle || 'solid'}
              onValueChange={(value) => updateStyle({ lineStyle: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={style.color || '#64748b'}
                onChange={(e) => updateStyle({ color: e.target.value })}
                className="w-12 h-8 p-1"
              />
              <Input
                value={style.color || '#64748b'}
                onChange={(e) => updateStyle({ color: e.target.value })}
                placeholder="#64748b"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Thickness: {style.thickness || 2}px</Label>
            <Slider
              value={[style.thickness || 2]}
              onValueChange={([value]) => updateStyle({ thickness: value })}
              min={1}
              max={10}
              step={0.5}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Opacity: {((style.opacity || 1) * 100).toFixed(0)}%</Label>
            <Slider
              value={[(style.opacity || 1) * 100]}
              onValueChange={([value]) => updateStyle({ opacity: value / 100 })}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Z-Index</Label>
            <Input
              type="number"
              value={style.zIndex || 0}
              onChange={(e) => updateStyle({ zIndex: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Arrow Heads</h4>
          
          <div className="space-y-2">
            <Label className="text-xs">Source Arrow</Label>
            <Select
              value={style.sourceArrow || 'none'}
              onValueChange={(value) => updateStyle({ sourceArrow: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="arrow">Arrow</SelectItem>
                <SelectItem value="arrowclosed">Arrow (Closed)</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="diamond">Diamond</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Target Arrow</Label>
            <Select
              value={style.targetArrow || 'arrow'}
              onValueChange={(value) => updateStyle({ targetArrow: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="arrow">Arrow</SelectItem>
                <SelectItem value="arrowclosed">Arrow (Closed)</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="diamond">Diamond</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Animation</h4>
          
          <div className="flex items-center justify-between">
            <Label className="text-xs">Animated</Label>
            <Switch
              checked={style.animated || false}
              onCheckedChange={(checked) => updateStyle({ animated: checked })}
            />
          </div>

          {style.animated && (
            <div className="space-y-2">
              <Label className="text-xs">Speed: {style.animationSpeed || 10}px/s</Label>
              <Slider
                value={[style.animationSpeed || 10]}
                onValueChange={([value]) => updateStyle({ animationSpeed: value })}
                min={1}
                max={50}
                step={1}
              />
            </div>
          )}
        </div>
      </TabsContent>

      {/* Label Tab */}
      <TabsContent value="label" className="space-y-4 mt-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Label Settings</h4>
          
          <div className="space-y-2">
            <Label className="text-xs">Label Text</Label>
            <Input
              value={connection.label?.text || ''}
              onChange={(e) => updateLabel({ text: e.target.value })}
              placeholder="Enter label text"
            />
          </div>

          {connection.label?.text && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Position: {((connection.label.position || 0.5) * 100).toFixed(0)}%</Label>
                <Slider
                  value={[(connection.label.position || 0.5) * 100]}
                  onValueChange={([value]) => updateLabel({ position: value / 100 })}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={connection.label.backgroundColor || '#ffffff'}
                    onChange={(e) => updateLabel({ backgroundColor: e.target.value })}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    value={connection.label.backgroundColor || '#ffffff'}
                    onChange={(e) => updateLabel({ backgroundColor: e.target.value })}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={connection.label.textColor || '#000000'}
                    onChange={(e) => updateLabel({ textColor: e.target.value })}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    value={connection.label.textColor || '#000000'}
                    onChange={(e) => updateLabel({ textColor: e.target.value })}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Font Size: {connection.label.fontSize || 12}px</Label>
                <Slider
                  value={[connection.label.fontSize || 12]}
                  onValueChange={([value]) => updateLabel({ fontSize: value })}
                  min={8}
                  max={24}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Padding: {connection.label.padding || 4}px</Label>
                <Slider
                  value={[connection.label.padding || 4]}
                  onValueChange={([value]) => updateLabel({ padding: value })}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>
            </>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
