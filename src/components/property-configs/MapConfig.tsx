import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { MapPin, Map, Satellite, MapPinned, Database, Activity } from 'lucide-react';

interface MapConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (property: string, value: any) => void;
}

export const MapConfig: React.FC<MapConfigProps> = ({
  widget,
  onConfigChange
}) => {
  return (
    <>
      <h4 className="text-sm font-medium flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Map Configuration
      </h4>
      
      {/* Map Provider */}
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
            <SelectItem value="openstreetmap">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                OpenStreetMap
              </div>
            </SelectItem>
            <SelectItem value="esri">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4" />
                ESRI Satellite
              </div>
            </SelectItem>
            <SelectItem value="carto">
              <div className="flex items-center gap-2">
                <MapPinned className="w-4 h-4" />
                CartoDB
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Latitude</Label>
          <Input
            type="number"
            step="any"
            value={widget.config.latitude || 0}
            onChange={(e) => onConfigChange('latitude', parseFloat(e.target.value) || 0)}
            placeholder="e.g., 40.7128"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Longitude</Label>
          <Input
            type="number"
            step="any"
            value={widget.config.longitude || 0}
            onChange={(e) => onConfigChange('longitude', parseFloat(e.target.value) || 0)}
            placeholder="e.g., -74.0060"
            className="h-8 text-sm"
          />
        </div>
      </div>

      {/* Zoom Level */}
      <div className="space-y-1">
        <Label className="text-xs">Zoom Level: {widget.config.zoomLevel || 10}</Label>
        <Slider
          value={[widget.config.zoomLevel || 10]}
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

      {/* Marker Configuration */}
      <h4 className="text-sm font-medium">Marker</h4>
      
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs">Show Marker</Label>
          <p className="text-xs text-muted-foreground">Display a marker at the specified location</p>
        </div>
        <Switch
          checked={widget.config.showMarker !== false}
          onCheckedChange={(checked) => onConfigChange('showMarker', checked)}
        />
      </div>

      {widget.config.showMarker !== false && (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Marker Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={widget.config.markerColor || '#ff0000'}
                onChange={(e) => onConfigChange('markerColor', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input
                value={widget.config.markerColor || '#ff0000'}
                onChange={(e) => onConfigChange('markerColor', e.target.value)}
                placeholder="#ff0000"
                className="flex-1 h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Marker Type</Label>
            <Select
              value={widget.config.markerType || 'default'}
              onValueChange={(value) => onConfigChange('markerType', value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select marker type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Generic Marker)</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="bike">Bike</SelectItem>
                <SelectItem value="robot">Robot</SelectItem>
                <SelectItem value="tractor">Tractor</SelectItem>
                <SelectItem value="cow">Cow</SelectItem>
                <SelectItem value="person">Person</SelectItem>
                <SelectItem value="drone">Drone</SelectItem>
                <SelectItem value="boat">Boat</SelectItem>
                <SelectItem value="plane">Plane</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <Separator />

      {/* Map Shape */}
      <h4 className="text-sm font-medium">Shape</h4>
      
      <div className="space-y-1">
        <Label className="text-xs">Map Shape</Label>
        <Select
          value={widget.config.mapShape || 'rectangle'}
          onValueChange={(value) => onConfigChange('mapShape', value)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Select map shape" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rectangle">Rectangle (Default)</SelectItem>
            <SelectItem value="circle">Circle</SelectItem>
            <SelectItem value="roundedRectangle">Rounded Rectangle</SelectItem>
            <SelectItem value="ellipse">Ellipse</SelectItem>
            <SelectItem value="customPolygon">Custom Polygon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {widget.config.mapShape === 'customPolygon' && (
        <div className="space-y-1">
          <Label className="text-xs">Number of Sides</Label>
          <Input
            type="number"
            min="3"
            max="20"
            value={widget.config.mapShapeSides || 6}
            onChange={(e) => onConfigChange('mapShapeSides', parseInt(e.target.value) || 6)}
            placeholder="e.g., 6"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Number of sides for the polygon (3-20)
          </p>
        </div>
      )}

      <Separator />

      {/* Display Options */}
      <h4 className="text-sm font-medium">Display Options</h4>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Controls</Label>
            <p className="text-xs text-muted-foreground">Display zoom controls on the map</p>
          </div>
          <Switch
            checked={widget.config.showControls !== false}
            onCheckedChange={(checked) => onConfigChange('showControls', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show User Location</Label>
            <p className="text-xs text-muted-foreground">Display your current location</p>
          </div>
          <Switch
            checked={widget.config.showUserLocation === true}
            onCheckedChange={(checked) => onConfigChange('showUserLocation', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">Show Pin Descriptions</Label>
            <p className="text-xs text-muted-foreground">Display titles on map pins</p>
          </div>
          <Switch
            checked={widget.config.showPinDescriptions === true}
            onCheckedChange={(checked) => onConfigChange('showPinDescriptions', checked)}
          />
        </div>
      </div>

      {widget.config.showPinDescriptions === true && (
        <>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="space-y-1">
              <Label className="text-xs">Title Column</Label>
              <Input
                value={widget.config.pinTitleColumn || 'title'}
                onChange={(e) => onConfigChange('pinTitleColumn', e.target.value)}
                placeholder="e.g., title"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description Column</Label>
              <Input
                value={widget.config.pinDescriptionColumn || 'description'}
                onChange={(e) => onConfigChange('pinDescriptionColumn', e.target.value)}
                placeholder="e.g., description"
                className="h-8 text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Always Show Descriptions</Label>
              <p className="text-xs text-muted-foreground">Display continuously without interaction</p>
            </div>
            <Switch
              checked={widget.config.alwaysShowPinDescriptions === true}
              onCheckedChange={(checked) => onConfigChange('alwaysShowPinDescriptions', checked)}
            />
          </div>
        </>
      )}

      <Separator />

      {/* Database Configuration */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Database className="w-4 h-4" />
        Database Configuration
      </h4>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Latitude Column</Label>
          <Input
            value={widget.config.latitudeColumn || 'latitude'}
            onChange={(e) => onConfigChange('latitudeColumn', e.target.value)}
            placeholder="e.g., latitude"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Longitude Column</Label>
          <Input
            value={widget.config.longitudeColumn || 'longitude'}
            onChange={(e) => onConfigChange('longitudeColumn', e.target.value)}
            placeholder="e.g., longitude"
            className="h-8 text-sm"
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs">Index Column</Label>
        <Input
          value={widget.config.indexColumn || 'index'}
          onChange={(e) => onConfigChange('indexColumn', e.target.value)}
          placeholder="e.g., index, timestamp, id"
          className="h-8 text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Column used to order points for path drawing
        </p>
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs">Refresh Interval (ms)</Label>
        <Input
          type="number"
          value={widget.config.mapRefreshInterval || 5000}
          onChange={(e) => onConfigChange('mapRefreshInterval', parseInt(e.target.value) || 5000)}
          placeholder="e.g., 5000"
          className="h-8 text-sm"
        />
      </div>

      <Separator />

      {/* Path Configuration */}
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Activity className="w-4 h-4" />
        Path Configuration
      </h4>
      
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs">Show Path</Label>
          <p className="text-xs text-muted-foreground">Connect markers with a line</p>
        </div>
        <Switch
          checked={widget.config.showPath !== false}
          onCheckedChange={(checked) => onConfigChange('showPath', checked)}
        />
      </div>
      
      {widget.config.showPath !== false && (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Path Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={widget.config.pathColor || '#3b82f6'}
                onChange={(e) => onConfigChange('pathColor', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input
                value={widget.config.pathColor || '#3b82f6'}
                onChange={(e) => onConfigChange('pathColor', e.target.value)}
                placeholder="#3b82f6"
                className="flex-1 h-8 text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Show Arrows</Label>
              <p className="text-xs text-muted-foreground">Show direction arrows on path</p>
            </div>
            <Switch
              checked={widget.config.showArrows !== false}
              onCheckedChange={(checked) => onConfigChange('showArrows', checked)}
            />
          </div>
          
          {widget.config.showArrows !== false && (
            <div className="space-y-1">
              <Label className="text-xs">Arrow Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={widget.config.arrowColor || '#3b82f6'}
                  onChange={(e) => onConfigChange('arrowColor', e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={widget.config.arrowColor || '#3b82f6'}
                  onChange={(e) => onConfigChange('arrowColor', e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1 h-8 text-sm"
                />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
