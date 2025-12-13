import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface ScheduleConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (key: string, value: any) => void;
}

export const ScheduleConfig: React.FC<ScheduleConfigProps> = ({
  widget,
  onConfigChange
}) => {
  return (
    <>
      <Separator className="my-4" />
      
      {/* Schedule Configuration */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold">Schedule Configuration</h4>
        
        <div className="space-y-2">
          <Label className="text-xs">Widget Title</Label>
          <Input
            value={widget.config.title || 'Schedules'}
            onChange={(e) => onConfigChange('title', e.target.value)}
            placeholder="Schedules"
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Device ID (Optional)</Label>
          <Input
            value={widget.config.deviceId || ''}
            onChange={(e) => onConfigChange('deviceId', e.target.value)}
            placeholder="Auto-detected from dashboard context"
            className="h-8 text-xs"
          />
          <p className="text-xs text-muted-foreground">
            <strong>🎯 Device-Specific Dashboard:</strong> Leave empty - the device ID will be automatically detected at runtime from the dashboard context.<br/>
            <strong>📊 General Dashboard:</strong> Leave empty to show all schedules with device selection enabled during creation.<br/>
            <strong>⚙️ Manual Override:</strong> Enter a specific device ID to hardcode filtering to that device only.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Max Schedules to Display</Label>
          <Input
            type="number"
            min="1"
            max="20"
            value={widget.config.maxSchedules || 5}
            onChange={(e) => onConfigChange('maxSchedules', parseInt(e.target.value) || 5)}
            className="h-8 text-xs"
          />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Display Settings */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold">Display Settings</h4>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="showContainer" className="text-xs">Show Card Container</Label>
          <Switch
            id="showContainer"
            checked={widget.config.showContainer !== false}
            onCheckedChange={(checked) => onConfigChange('showContainer', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showActions" className="text-xs">Show Action Buttons</Label>
          <Switch
            id="showActions"
            checked={widget.config.showActions !== false}
            onCheckedChange={(checked) => onConfigChange('showActions', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Includes Create, Edit, Delete, and Toggle buttons. Note: Create button only appears when Device ID is configured.
        </p>

        <div className="flex items-center justify-between">
          <Label htmlFor="showStatus" className="text-xs">Show Schedule Status</Label>
          <Switch
            id="showStatus"
            checked={widget.config.showStatus !== false}
            onCheckedChange={(checked) => onConfigChange('showStatus', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showDate" className="text-xs">Show Schedule Date</Label>
          <Switch
            id="showDate"
            checked={widget.config.showDate !== false}
            onCheckedChange={(checked) => onConfigChange('showDate', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showLastExecuted" className="text-xs">Show Last Executed</Label>
          <Switch
            id="showLastExecuted"
            checked={widget.config.showLastExecuted !== false}
            onCheckedChange={(checked) => onConfigChange('showLastExecuted', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showDeviceName" className="text-xs">Show Device Name</Label>
          <Switch
            id="showDeviceName"
            checked={widget.config.showDeviceName !== false}
            onCheckedChange={(checked) => onConfigChange('showDeviceName', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Shows device name badge for each schedule. Useful in general dashboards.
        </p>
      </div>

      <Separator className="my-4" />

      {/* Layout Settings */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold">Layout Settings</h4>
        
        <div className="space-y-2">
          <Label className="text-xs">List Layout</Label>
          <Select
            value={widget.config.listLayout || 'comfortable'}
            onValueChange={(value) => onConfigChange('listLayout', value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="comfortable">Comfortable</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Item Spacing</Label>
          <Input
            value={widget.config.itemSpacing || '0.5rem'}
            onChange={(e) => onConfigChange('itemSpacing', e.target.value)}
            placeholder="0.5rem"
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Border Radius</Label>
          <Input
            value={widget.config.borderRadius || '0.5rem'}
            onChange={(e) => onConfigChange('borderRadius', e.target.value)}
            placeholder="0.5rem"
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Font Size</Label>
          <Select
            value={widget.config.fontSize || 'medium'}
            onValueChange={(value) => onConfigChange('fontSize', value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Color Settings */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold">Color Settings</h4>
        
        <div className="space-y-2">
          <Label className="text-xs">Item Background Color</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={widget.config.itemBackgroundColor || '#ffffff'}
              onChange={(e) => onConfigChange('itemBackgroundColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={widget.config.itemBackgroundColor || '#ffffff'}
              onChange={(e) => onConfigChange('itemBackgroundColor', e.target.value)}
              placeholder="#ffffff"
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Button Color</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={widget.config.buttonColor || '#3b82f6'}
              onChange={(e) => onConfigChange('buttonColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={widget.config.buttonColor || '#3b82f6'}
              onChange={(e) => onConfigChange('buttonColor', e.target.value)}
              placeholder="#3b82f6"
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Active Status Color</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={widget.config.activeColor || '#10b981'}
              onChange={(e) => onConfigChange('activeColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={widget.config.activeColor || '#10b981'}
              onChange={(e) => onConfigChange('activeColor', e.target.value)}
              placeholder="#10b981"
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Inactive Status Color</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={widget.config.inactiveColor || '#9ca3af'}
              onChange={(e) => onConfigChange('inactiveColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={widget.config.inactiveColor || '#9ca3af'}
              onChange={(e) => onConfigChange('inactiveColor', e.target.value)}
              placeholder="#9ca3af"
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-muted rounded-md space-y-2">
        <p className="text-xs font-semibold">How Device ID Works:</p>
        <p className="text-xs text-muted-foreground">
          <strong>✨ Recommended (Auto-detect):</strong> Leave empty - device ID is automatically passed at runtime from dashboard context. Full schedule management enabled.
        </p>
        <p className="text-xs text-muted-foreground">
          <strong>📊 Multi-Device Mode:</strong> If no device ID is available at runtime, users can select devices when creating schedules. View all schedules across devices.
        </p>
        <p className="text-xs text-muted-foreground">
          <strong>🔒 Hardcoded:</strong> Enter a specific device ID to force filtering to that device only, regardless of dashboard context.
        </p>
      </div>
    </>
  );
};
