import React from 'react';
import { IoTDashboardWidget } from '../../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface HtmlViewerConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (property: string, value: any) => void;
}

export const HtmlViewerConfig: React.FC<HtmlViewerConfigProps> = ({
  widget,
  onConfigChange
}) => {
  // Default HTML template for iframe
  const defaultHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website in iFrame</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    iframe {
      width: 100vw;
      height: 100vh;
      border: none;
    }
  </style>
</head>
<body>
  <iframe src="https://nikolaindustry.com" title="Embedded Website"></iframe>
</body>
</html>`;

  return (
    <>
      <h4 className="text-sm font-medium">HTML Viewer Configuration</h4>
      
      {/* HTML Content */}
      <div className="space-y-1">
        <Label className="text-xs">HTML Content</Label>
        <Textarea
          value={widget.config.htmlContent || defaultHtmlContent}
          onChange={(e) => onConfigChange('htmlContent', e.target.value)}
          placeholder="Enter HTML code here..."
          className="font-mono text-xs min-h-[200px]"
        />
        <p className="text-xs text-muted-foreground">
          Enter HTML code to display in the viewer. Content is sandboxed for security.
        </p>
      </div>

      <Separator />

      {/* Sandbox Permissions */}
      <h4 className="text-sm font-medium">Security</h4>
      
      <div className="space-y-1">
        <Label className="text-xs">Sandbox Permissions</Label>
        <Input
          value={widget.config.htmlSandboxPermissions || 'allow-scripts allow-same-origin allow-forms'}
          onChange={(e) => onConfigChange('htmlSandboxPermissions', e.target.value)}
          placeholder="allow-scripts allow-same-origin"
          className="h-8 text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Space-separated sandbox permissions (e.g., allow-scripts, allow-forms, allow-same-origin)
        </p>
      </div>

      <Separator />

      {/* Styling */}
      <h4 className="text-sm font-medium">Styling</h4>
      
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Background Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={widget.config.htmlBackgroundColor || '#ffffff'}
              onChange={(e) => onConfigChange('htmlBackgroundColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={widget.config.htmlBackgroundColor || '#ffffff'}
              onChange={(e) => onConfigChange('htmlBackgroundColor', e.target.value)}
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
              value={widget.config.htmlBorderColor || '#e5e7eb'}
              onChange={(e) => onConfigChange('htmlBorderColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={widget.config.htmlBorderColor || '#e5e7eb'}
              onChange={(e) => onConfigChange('htmlBorderColor', e.target.value)}
              placeholder="#e5e7eb"
              className="flex-1 h-8 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Border Width (px)</Label>
            <Input
              type="number"
              value={widget.config.htmlBorderWidth || 1}
              onChange={(e) => onConfigChange('htmlBorderWidth', parseInt(e.target.value) || 1)}
              min={0}
              max={10}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Border Radius (px)</Label>
            <Input
              type="number"
              value={widget.config.htmlBorderRadius || 8}
              onChange={(e) => onConfigChange('htmlBorderRadius', parseInt(e.target.value) || 8)}
              min={0}
              max={50}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Display Options */}
      <h4 className="text-sm font-medium">Display Options</h4>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Container</Label>
          <Switch
            checked={widget.config.htmlShowContainer !== false}
            onCheckedChange={(checked) => onConfigChange('htmlShowContainer', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Show Controls</Label>
          <Switch
            checked={widget.config.htmlShowControls !== false}
            onCheckedChange={(checked) => onConfigChange('htmlShowControls', checked)}
          />
        </div>
      </div>
    </>
  );
};
