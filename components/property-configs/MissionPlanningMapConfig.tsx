import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Navigation, Map, Settings, Palette } from 'lucide-react';

interface MissionPlanningMapConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (property: string, value: any) => void;
}

export const MissionPlanningMapConfig: React.FC<MissionPlanningMapConfigProps> = ({
  widget,
  onConfigChange
}) => {
  return (
    <>
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Navigation className="w-4 h-4" />
        Mission Planning Map Configuration
      </h4>
      
      {/* Mission Configuration */}
      <div className="space-y-1">
        <Label className="text-xs">Mission Type</Label>
        <Select
          value={widget.config.missionType || 'mapping'}
          onValueChange={(value) => onConfigChange('missionType', value)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Select mission type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mapping">Area Mapping</SelectItem>
            <SelectItem value="navigation">Navigation Route</SelectItem>
            <SelectItem value="survey">Survey Path</SelectItem>
            <SelectItem value="inspection">Inspection</SelectItem>
            <SelectItem value="delivery">Delivery Route</SelectItem>
            <SelectItem value="custom">Custom Mission</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Define the primary purpose of this mission plan
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Default Speed (m/s)</Label>
          <Input
            type="number"
            min="0"
            step="0.1"
            value={widget.config.defaultSpeed || 10}
            onChange={(e) => onConfigChange('defaultSpeed', parseFloat(e.target.value) || 10)}
            placeholder="e.g., 10"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Default Altitude (m)</Label>
          <Input
            type="number"
            min="0"
            step="1"
            value={widget.config.defaultAltitude || 100}
            onChange={(e) => onConfigChange('defaultAltitude', parseFloat(e.target.value) || 100)}
            placeholder="e.g., 100"
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Return to Home</Label>
            <p className="text-xs text-muted-foreground">Automatically return to start after mission</p>
          </div>
          <Switch
            checked={widget.config.returnToHome === true}
            onCheckedChange={(checked) => onConfigChange('returnToHome', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Loop Mission</Label>
            <p className="text-xs text-muted-foreground">Repeat mission continuously</p>
          </div>
          <Switch
            checked={widget.config.loopMission === true}
            onCheckedChange={(checked) => onConfigChange('loopMission', checked)}
          />
        </div>
      </div>

      {widget.config.missionType === 'mapping' && (
        <div className="space-y-1">
          <Label className="text-xs">Overlap Percentage: {widget.config.overlapPercentage || 60}%</Label>
          <Slider
            value={[widget.config.overlapPercentage || 60]}
            onValueChange={([value]) => onConfigChange('overlapPercentage', value)}
            min={0}
            max={100}
            step={5}
            className="mt-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      <Separator />

      {/* Map Display */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Map className="w-4 h-4" />
        Map Display
      </h4>
      
      <div className="space-y-1">
        <Label className="text-xs">Map Provider</Label>
        <Select
          value={widget.config.mapProvider || 'openstreetmap'}
          onValueChange={(value) => onConfigChange('mapProvider', value)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Select map provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openstreetmap">OpenStreetMap</SelectItem>
            <SelectItem value="esri">ESRI Satellite</SelectItem>
            <SelectItem value="carto">CartoDB</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Center Latitude</Label>
          <Input
            type="number"
            step="any"
            value={widget.config.centerLat || 40.7128}
            onChange={(e) => onConfigChange('centerLat', parseFloat(e.target.value) || 40.7128)}
            placeholder="e.g., 40.7128"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Center Longitude</Label>
          <Input
            type="number"
            step="any"
            value={widget.config.centerLng || -74.0060}
            onChange={(e) => onConfigChange('centerLng', parseFloat(e.target.value) || -74.0060)}
            placeholder="e.g., -74.0060"
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Zoom Level: {widget.config.zoomLevel || 13}</Label>
        <Slider
          value={[widget.config.zoomLevel || 13]}
          onValueChange={([value]) => onConfigChange('zoomLevel', value)}
          min={1}
          max={18}
          step={1}
          className="mt-1"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>18</span>
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Palette className="w-4 h-4" />
        Colors
      </h4>
      
      <div className="space-y-1">
        <Label className="text-xs">Waypoint Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={widget.config.waypointColor || '#ef4444'}
            onChange={(e) => onConfigChange('waypointColor', e.target.value)}
            className="w-12 h-8 p-1"
          />
          <Input
            value={widget.config.waypointColor || '#ef4444'}
            onChange={(e) => onConfigChange('waypointColor', e.target.value)}
            placeholder="#ef4444"
            className="flex-1 h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Route Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={widget.config.routeColor || '#3b82f6'}
            onChange={(e) => onConfigChange('routeColor', e.target.value)}
            className="w-12 h-8 p-1"
          />
          <Input
            value={widget.config.routeColor || '#3b82f6'}
            onChange={(e) => onConfigChange('routeColor', e.target.value)}
            placeholder="#3b82f6"
            className="flex-1 h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Boundary Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={widget.config.boundaryColor || '#10b981'}
            onChange={(e) => onConfigChange('boundaryColor', e.target.value)}
            className="w-12 h-8 p-1"
          />
          <Input
            value={widget.config.boundaryColor || '#10b981'}
            onChange={(e) => onConfigChange('boundaryColor', e.target.value)}
            placeholder="#10b981"
            className="flex-1 h-8 text-sm"
          />
        </div>
      </div>

      <Separator />

      {/* Features */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Features
      </h4>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Toolbar</Label>
            <p className="text-xs text-muted-foreground">Display mission planning toolbar</p>
          </div>
          <Switch
            checked={widget.config.showToolbar !== false}
            onCheckedChange={(checked) => onConfigChange('showToolbar', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Enable Editing</Label>
            <p className="text-xs text-muted-foreground">Allow waypoint and boundary editing</p>
          </div>
          <Switch
            checked={widget.config.enableEditing !== false}
            onCheckedChange={(checked) => onConfigChange('enableEditing', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Coordinates</Label>
            <p className="text-xs text-muted-foreground">Display lat/lng coordinates</p>
          </div>
          <Switch
            checked={widget.config.showCoordinates !== false}
            onCheckedChange={(checked) => onConfigChange('showCoordinates', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Altitude</Label>
            <p className="text-xs text-muted-foreground">Display altitude information</p>
          </div>
          <Switch
            checked={widget.config.showAltitude !== false}
            onCheckedChange={(checked) => onConfigChange('showAltitude', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Auto-Save</Label>
            <p className="text-xs text-muted-foreground">Automatically save mission changes</p>
          </div>
          <Switch
            checked={widget.config.enableAutoSave === true}
            onCheckedChange={(checked) => onConfigChange('enableAutoSave', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Information */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 dark:bg-blue-950 dark:border-blue-800">
        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <p className="font-medium">Mission Data Storage:</p>
          <p>• Mission data is stored in product_runtime_data table</p>
          <p>• Product ID and Device ID are auto-populated from context</p>
          <p>• Supports waypoints, routes, and boundaries</p>
        </div>
      </div>
    </>
  );
};
