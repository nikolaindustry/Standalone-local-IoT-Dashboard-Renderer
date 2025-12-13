/**
 * UrlButtonConfig Component
 * 
 * Independent configuration panel for URL Button widgets in the IoT Dashboard Builder.
 * Provides comprehensive property settings with the same functionality as the product dashboard designer.
 * 
 * Features:
 * - URL type selection (external, internal page, application route)
 * - Button text customization
 * - Icon selection and positioning
 * - Button variant and size options
 * - Typography settings (font size, weight)
 * - Color customization (background, text, border)
 * - Border and spacing controls
 * - Visibility toggles (icon, label, container)
 * 
 * @component
 */

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight, 
  ExternalLink, 
  Link, 
  Home, 
  Settings, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Navigation, 
  MapPin, 
  Send, 
  Download, 
  Upload,
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Minus,
  X, 
  Check, 
  Info, 
  AlertCircle, 
  HelpCircle, 
  Star, 
  Heart, 
  Share,
  Bookmark, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Bell, 
  MessageSquare,
  File, 
  Folder, 
  Image, 
  Video, 
  Music, 
  Zap, 
  Target, 
  TrendingUp,
  TrendingDown, 
  BarChart, 
  PieChart, 
  Activity
} from 'lucide-react';
import { IoTDashboardWidget } from '../../types';

interface UrlButtonConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (key: string, value: any) => void;
  pages?: Array<{ id: string; name: string }>;
}

// Available icon map (independent, not imported)
const AVAILABLE_ICONS = {
  ArrowRight,
  ExternalLink,
  Link,
  Home,
  Settings,
  User,
  Mail,
  Phone,
  Globe,
  Navigation,
  MapPin,
  Send,
  Download,
  Upload,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  X,
  Check,
  Info,
  AlertCircle,
  HelpCircle,
  Star,
  Heart,
  Share,
  Bookmark,
  Search,
  Filter,
  Calendar,
  Clock,
  Bell,
  MessageSquare,
  File,
  Folder,
  Image,
  Video,
  Music,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  Activity
};

export const UrlButtonConfig: React.FC<UrlButtonConfigProps> = ({
  widget,
  onConfigChange,
  pages = []
}) => {
  const config = widget.config || {};

  // Determine URL type based on current configuration
  const getInitialUrlType = (): 'external' | 'internal' | 'route' => {
    if (pages.some(p => p.id === config.urlButtonTargetUrl)) {
      return 'internal';
    }
    if (config.urlButtonTargetUrl?.startsWith('/')) {
      return 'route';
    }
    return 'external';
  };

  const [urlType, setUrlType] = useState<'external' | 'internal' | 'route'>(getInitialUrlType());

  const handleUrlTypeChange = (type: 'external' | 'internal' | 'route') => {
    setUrlType(type);
    onConfigChange('urlButtonTargetUrl', '');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link className="w-4 h-4" />
        <h4 className="text-sm font-semibold">URL Button Settings</h4>
      </div>

      {/* Button Text */}
      <div className="space-y-1">
        <Label htmlFor="urlButtonText" className="text-xs">Button Text</Label>
        <Input
          id="urlButtonText"
          value={config.urlButtonText || ''}
          onChange={(e) => onConfigChange('urlButtonText', e.target.value)}
          placeholder="Click Here"
          className="h-8 text-sm"
        />
        <p className="text-xs text-muted-foreground">
          The text displayed on the button
        </p>
      </div>

      <Separator />

      {/* URL Type Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Navigation</Label>

        <div className="space-y-1">
          <Label htmlFor="urlType" className="text-xs">Navigation Type</Label>
          <Select 
            value={urlType} 
            onValueChange={handleUrlTypeChange}
          >
            <SelectTrigger id="urlType" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="external">External URL</SelectItem>
              <SelectItem value="internal">Internal Page</SelectItem>
              <SelectItem value="route">Application Route</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Target URL/Page/Route */}
        {urlType === 'external' ? (
          <div className="space-y-1">
            <Label htmlFor="targetUrl" className="text-xs">Target URL</Label>
            <Input
              id="targetUrl"
              value={config.urlButtonTargetUrl || ''}
              onChange={(e) => onConfigChange('urlButtonTargetUrl', e.target.value)}
              placeholder="https://example.com"
              className="h-8 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter a full URL (e.g., https://example.com or www.example.com)
            </p>
          </div>
        ) : urlType === 'route' ? (
          <div className="space-y-1">
            <Label htmlFor="targetRoute" className="text-xs">Application Route</Label>
            <Select 
              value={config.urlButtonTargetUrl || '_none'} 
              onValueChange={(value) => onConfigChange('urlButtonTargetUrl', value === '_none' ? '' : value)}
            >
              <SelectTrigger id="targetRoute" className="h-8 text-sm">
                <SelectValue placeholder="Select a route" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Select a route...</SelectItem>
                <SelectItem value="/user-dashboard">User Dashboard</SelectItem>
                <SelectItem value="/product-management">Product Management</SelectItem>
                <SelectItem value="/account">Account Settings</SelectItem>
                <SelectItem value="/devices">My Devices</SelectItem>
                <SelectItem value="/dashboards">My Dashboards</SelectItem>
                <SelectItem value="/settings">Settings</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Navigate to application pages/tabs
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <Label htmlFor="targetPage" className="text-xs">Target Page</Label>
            <Select 
              value={config.urlButtonTargetUrl || '_none'} 
              onValueChange={(value) => onConfigChange('urlButtonTargetUrl', value === '_none' ? '' : value)}
            >
              <SelectTrigger id="targetPage" className="h-8 text-sm">
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Select a page...</SelectItem>
                {pages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose which page to navigate to when clicked
            </p>
          </div>
        )}

        {/* Open in New Tab - only for external URLs */}
        {urlType === 'external' && (
          <div className="flex items-center justify-between">
            <Label htmlFor="openInNewTab" className="text-xs">Open in New Tab</Label>
            <Switch
              id="openInNewTab"
              checked={config.urlButtonOpenInNewTab || false}
              onCheckedChange={(checked) => onConfigChange('urlButtonOpenInNewTab', checked)}
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Icon Configuration */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Icon</Label>

        <div className="flex items-center justify-between">
          <Label htmlFor="showIcon" className="text-xs">Show Icon</Label>
          <Switch
            id="showIcon"
            checked={config.urlButtonShowIcon !== false}
            onCheckedChange={(checked) => onConfigChange('urlButtonShowIcon', checked)}
          />
        </div>

        {config.urlButtonShowIcon !== false && (
          <>
            <div className="space-y-1">
              <Label htmlFor="icon" className="text-xs">Icon</Label>
              <Select 
                value={config.urlButtonIcon || 'ExternalLink'} 
                onValueChange={(value) => onConfigChange('urlButtonIcon', value)}
              >
                <SelectTrigger id="icon" className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {Object.keys(AVAILABLE_ICONS).map((iconName) => {
                    const IconComponent = AVAILABLE_ICONS[iconName as keyof typeof AVAILABLE_ICONS];
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          <span>{iconName}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="iconPosition" className="text-xs">Icon Position</Label>
              <Select 
                value={config.urlButtonIconPosition || 'left'} 
                onValueChange={(value) => onConfigChange('urlButtonIconPosition', value)}
              >
                <SelectTrigger id="iconPosition" className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="iconSize" className="text-xs">Icon Size</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="iconSize"
                  type="number"
                  value={config.urlButtonIconSize || 18}
                  onChange={(e) => onConfigChange('urlButtonIconSize', parseInt(e.target.value) || 18)}
                  min="8"
                  max="48"
                  className="h-8 text-sm"
                />
                <span className="text-xs text-muted-foreground">px</span>
              </div>
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* Button Styling */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Button Style</Label>

        <div className="space-y-1">
          <Label htmlFor="buttonVariant" className="text-xs">Button Variant</Label>
          <Select 
            value={config.urlButtonVariant || 'default'} 
            onValueChange={(value) => onConfigChange('urlButtonVariant', value)}
          >
            <SelectTrigger id="buttonVariant" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="destructive">Destructive</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
              <SelectItem value="link">Link</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="buttonSize" className="text-xs">Button Size</Label>
          <Select 
            value={config.urlButtonSize || 'default'} 
            onValueChange={(value) => onConfigChange('urlButtonSize', value)}
          >
            <SelectTrigger id="buttonSize" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Typography */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Typography</Label>

        <div className="space-y-1">
          <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
          <div className="flex items-center gap-2">
            <Input
              id="fontSize"
              type="number"
              value={config.urlButtonFontSize || 14}
              onChange={(e) => onConfigChange('urlButtonFontSize', parseInt(e.target.value) || 14)}
              min="8"
              max="72"
              className="h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground">px</span>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="fontWeight" className="text-xs">Font Weight</Label>
          <Select 
            value={config.urlButtonFontWeight || 'normal'} 
            onValueChange={(value) => onConfigChange('urlButtonFontWeight', value)}
          >
            <SelectTrigger id="fontWeight" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light (300)</SelectItem>
              <SelectItem value="normal">Normal (400)</SelectItem>
              <SelectItem value="medium">Medium (500)</SelectItem>
              <SelectItem value="semibold">Semibold (600)</SelectItem>
              <SelectItem value="bold">Bold (700)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showLabel" className="text-xs">Show Label</Label>
          <Switch
            id="showLabel"
            checked={config.urlButtonShowLabel !== false}
            onCheckedChange={(checked) => onConfigChange('urlButtonShowLabel', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Colors</Label>

        <div className="space-y-1">
          <Label htmlFor="bgColor" className="text-xs">Background Color</Label>
          <div className="flex gap-2">
            <Input
              id="bgColor"
              type="color"
              value={config.urlButtonBackgroundColor || '#000000'}
              onChange={(e) => onConfigChange('urlButtonBackgroundColor', e.target.value)}
              className="h-8 w-16"
            />
            <Input
              value={config.urlButtonBackgroundColor || '#000000'}
              onChange={(e) => onConfigChange('urlButtonBackgroundColor', e.target.value)}
              placeholder="#000000"
              className="h-8 flex-1 text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="textColor" className="text-xs">Text Color</Label>
          <div className="flex gap-2">
            <Input
              id="textColor"
              type="color"
              value={config.urlButtonTextColor || '#ffffff'}
              onChange={(e) => onConfigChange('urlButtonTextColor', e.target.value)}
              className="h-8 w-16"
            />
            <Input
              value={config.urlButtonTextColor || '#ffffff'}
              onChange={(e) => onConfigChange('urlButtonTextColor', e.target.value)}
              placeholder="#ffffff"
              className="h-8 flex-1 text-sm font-mono"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Border & Spacing */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Border & Spacing</Label>

        <div className="space-y-1">
          <Label htmlFor="borderRadius" className="text-xs">Border Radius</Label>
          <div className="flex items-center gap-2">
            <Input
              id="borderRadius"
              type="number"
              value={config.urlButtonBorderRadius || 0}
              onChange={(e) => onConfigChange('urlButtonBorderRadius', parseInt(e.target.value) || 0)}
              min="0"
              className="h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground">px</span>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="borderWidth" className="text-xs">Border Width</Label>
          <div className="flex items-center gap-2">
            <Input
              id="borderWidth"
              type="number"
              value={config.urlButtonBorderWidth || 0}
              onChange={(e) => onConfigChange('urlButtonBorderWidth', parseInt(e.target.value) || 0)}
              min="0"
              max="10"
              className="h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground">px</span>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="borderColor" className="text-xs">Border Color</Label>
          <div className="flex gap-2">
            <Input
              id="borderColor"
              type="color"
              value={config.urlButtonBorderColor || '#000000'}
              onChange={(e) => onConfigChange('urlButtonBorderColor', e.target.value)}
              className="h-8 w-16"
            />
            <Input
              value={config.urlButtonBorderColor || '#000000'}
              onChange={(e) => onConfigChange('urlButtonBorderColor', e.target.value)}
              placeholder="#000000"
              className="h-8 flex-1 text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="padding" className="text-xs">Padding</Label>
          <div className="flex items-center gap-2">
            <Input
              id="padding"
              type="number"
              value={config.urlButtonPadding || 16}
              onChange={(e) => onConfigChange('urlButtonPadding', parseInt(e.target.value) || 16)}
              min="0"
              max="50"
              className="h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground">px</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Visibility */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Visibility</Label>

        <div className="flex items-center justify-between">
          <Label htmlFor="showContainer" className="text-xs">Show Container</Label>
          <Switch
            id="showContainer"
            checked={config.showUrlButtonContainer !== false}
            onCheckedChange={(checked) => onConfigChange('showUrlButtonContainer', checked)}
          />
        </div>
      </div>
    </div>
  );
};
