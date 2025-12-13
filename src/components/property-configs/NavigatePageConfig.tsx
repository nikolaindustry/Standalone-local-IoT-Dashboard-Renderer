/**
 * NavigatePageConfig Component
 * 
 * Independent configuration panel for Navigate Page widgets in the IoT Dashboard Builder.
 * Provides comprehensive property settings with the same functionality as the product dashboard designer.
 * 
 * Features:
 * - Target page selection for navigation
 * - Button text and variant customization
 * - Icon selection and positioning
 * - Text alignment options
 * - Visibility toggles (icon, label, container)
 * - Styling options (border radius, font size, icon size)
 * - Color settings (background, text, border)
 * 
 * @component
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Navigation, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Palette,
  Home, 
  Settings, 
  User, 
  Bell, 
  Search, 
  File, 
  BarChart, 
  Calendar, 
  Mail, 
  ShoppingCart, 
  Heart, 
  Star, 
  MapPin, 
  Camera, 
  Music, 
  Video, 
  Bookmark, 
  Download, 
  Upload, 
  Share, 
  Plus, 
  Minus, 
  Edit, 
  Trash, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Wifi, 
  Bluetooth, 
  Battery, 
  Sun, 
  Moon, 
  Cloud, 
  Zap, 
  Gift, 
  Award, 
  Trophy, 
  Flag, 
  Tag, 
  Key, 
  Clock, 
  Globe, 
  Phone, 
  MessageCircle, 
  HelpCircle, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle
} from 'lucide-react';
import { IoTDashboardWidget } from '../../types';

interface NavigatePageConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (key: string, value: any) => void;
  pages?: Array<{ id: string; name: string }>;
}

// Available icon map (independent, not imported)
const AVAILABLE_ICONS = {
  Navigation,
  Home,
  Settings,
  User,
  Bell,
  Search,
  File,
  BarChart,
  Calendar,
  Mail,
  ShoppingCart,
  Heart,
  Star,
  MapPin,
  Camera,
  Music,
  Video,
  Bookmark,
  Download,
  Upload,
  Share,
  Plus,
  Minus,
  Edit,
  Trash,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Wifi,
  Bluetooth,
  Battery,
  Sun,
  Moon,
  Cloud,
  Zap,
  Gift,
  Award,
  Trophy,
  Flag,
  Tag,
  Key,
  Clock,
  Globe,
  Phone,
  MessageCircle,
  HelpCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle
};

export const NavigatePageConfig: React.FC<NavigatePageConfigProps> = ({
  widget,
  onConfigChange,
  pages = []
}) => {
  const config = widget.config || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Navigation className="w-4 h-4" />
        <h4 className="text-sm font-semibold">Navigate Page Settings</h4>
      </div>

      {/* Basic Navigation Configuration */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Navigation</Label>

        <div className="space-y-1">
          <Label htmlFor="targetPageId" className="text-xs">Target Page</Label>
          <Select
            value={config.targetPageId || ''}
            onValueChange={(value) => onConfigChange('targetPageId', value)}
          >
            <SelectTrigger id="targetPageId" className="h-8 text-sm">
              <SelectValue placeholder="Select a page to navigate to" />
            </SelectTrigger>
            <SelectContent>
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

        <div className="space-y-1">
          <Label htmlFor="buttonText" className="text-xs">Button Text</Label>
          <Input
            id="buttonText"
            value={config.buttonText || ''}
            onChange={(e) => onConfigChange('buttonText', e.target.value)}
            placeholder="Enter button text (optional)"
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="buttonVariant" className="text-xs">Button Variant</Label>
          <Select
            value={config.buttonVariant || 'default'}
            onValueChange={(value) => onConfigChange('buttonVariant', value)}
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

        <div className="flex items-center justify-between">
          <Label htmlFor="showIcon" className="text-xs">Show Navigation Icon</Label>
          <Switch
            id="showIcon"
            checked={config.showIcon !== false}
            onCheckedChange={(checked) => onConfigChange('showIcon', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Advanced Design Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <Label className="text-sm font-semibold">Advanced Design Options</Label>
        </div>

        {/* Icon Selection */}
        <div className="space-y-1">
          <Label htmlFor="buttonIcon" className="text-xs">Button Icon</Label>
          <Select
            value={config.buttonIcon || 'Navigation'}
            onValueChange={(value) => onConfigChange('buttonIcon', value)}
          >
            <SelectTrigger id="buttonIcon" className="h-8 text-sm">
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

        {/* Icon Position */}
        <div className="space-y-1">
          <Label htmlFor="iconPosition" className="text-xs">Icon Position</Label>
          <Select
            value={config.iconPosition || 'left'}
            onValueChange={(value) => onConfigChange('iconPosition', value)}
          >
            <SelectTrigger id="iconPosition" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4" />
                  Left
                </div>
              </SelectItem>
              <SelectItem value="right">
                <div className="flex items-center gap-2">
                  <AlignRight className="w-4 h-4" />
                  Right
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Alignment */}
        <div className="space-y-1">
          <Label htmlFor="textAlign" className="text-xs">Text Alignment</Label>
          <Select
            value={config.textAlign || 'center'}
            onValueChange={(value) => onConfigChange('textAlign', value)}
          >
            <SelectTrigger id="textAlign" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4" />
                  Left
                </div>
              </SelectItem>
              <SelectItem value="center">
                <div className="flex items-center gap-2">
                  <AlignCenter className="w-4 h-4" />
                  Center
                </div>
              </SelectItem>
              <SelectItem value="right">
                <div className="flex items-center gap-2">
                  <AlignRight className="w-4 h-4" />
                  Right
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Visibility Toggles */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Visibility</Label>

        <div className="flex items-center justify-between">
          <Label htmlFor="showLabel" className="text-xs">Show Label</Label>
          <Switch
            id="showLabel"
            checked={config.showLabel !== false}
            onCheckedChange={(checked) => onConfigChange('showLabel', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showContainer" className="text-xs">Show Container</Label>
          <Switch
            id="showContainer"
            checked={config.showContainer !== false}
            onCheckedChange={(checked) => onConfigChange('showContainer', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Styling Options */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Styling</Label>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="buttonBorderRadius" className="text-xs">Corner Radius</Label>
            <span className="text-xs text-muted-foreground">{config.buttonBorderRadius || 6}px</span>
          </div>
          <Slider
            id="buttonBorderRadius"
            value={[config.buttonBorderRadius || 6]}
            onValueChange={([value]) => onConfigChange('buttonBorderRadius', value)}
            min={0}
            max={50}
            step={1}
            className="flex-1"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="buttonFontSize" className="text-xs">Font Size</Label>
            <span className="text-xs text-muted-foreground">{parseInt(config.buttonFontSize) || 14}px</span>
          </div>
          <Slider
            id="buttonFontSize"
            value={[parseInt(config.buttonFontSize) || 14]}
            onValueChange={([value]) => onConfigChange('buttonFontSize', `${value}px`)}
            min={8}
            max={32}
            step={1}
            className="flex-1"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="buttonIconSize" className="text-xs">Icon Size</Label>
            <span className="text-xs text-muted-foreground">{config.buttonIconSize || 16}px</span>
          </div>
          <Slider
            id="buttonIconSize"
            value={[config.buttonIconSize || 16]}
            onValueChange={([value]) => onConfigChange('buttonIconSize', value)}
            min={8}
            max={48}
            step={1}
            className="flex-1"
          />
        </div>
      </div>

      <Separator />

      {/* Color Settings */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Colors</Label>

        <div className="space-y-1">
          <Label htmlFor="buttonBackgroundColor" className="text-xs">Background Color</Label>
          <div className="flex gap-2">
            <Input
              id="buttonBackgroundColor"
              type="color"
              value={config.buttonBackgroundColor || '#ffffff'}
              onChange={(e) => onConfigChange('buttonBackgroundColor', e.target.value)}
              className="h-8 w-16"
            />
            <Input
              value={config.buttonBackgroundColor || '#ffffff'}
              onChange={(e) => onConfigChange('buttonBackgroundColor', e.target.value)}
              placeholder="#ffffff"
              className="h-8 flex-1 text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="buttonTextColor" className="text-xs">Text Color</Label>
          <div className="flex gap-2">
            <Input
              id="buttonTextColor"
              type="color"
              value={config.buttonTextColor || '#000000'}
              onChange={(e) => onConfigChange('buttonTextColor', e.target.value)}
              className="h-8 w-16"
            />
            <Input
              value={config.buttonTextColor || '#000000'}
              onChange={(e) => onConfigChange('buttonTextColor', e.target.value)}
              placeholder="#000000"
              className="h-8 flex-1 text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="buttonBorderColor" className="text-xs">Border Color</Label>
          <div className="flex gap-2">
            <Input
              id="buttonBorderColor"
              type="color"
              value={config.buttonBorderColor || '#cccccc'}
              onChange={(e) => onConfigChange('buttonBorderColor', e.target.value)}
              className="h-8 w-16"
            />
            <Input
              value={config.buttonBorderColor || '#cccccc'}
              onChange={(e) => onConfigChange('buttonBorderColor', e.target.value)}
              placeholder="#cccccc"
              className="h-8 flex-1 text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="buttonBorderWidth" className="text-xs">Border Width</Label>
            <span className="text-xs text-muted-foreground">{parseInt(config.buttonBorderWidth) || 1}px</span>
          </div>
          <Slider
            id="buttonBorderWidth"
            value={[parseInt(config.buttonBorderWidth) || 1]}
            onValueChange={([value]) => onConfigChange('buttonBorderWidth', `${value}px`)}
            min={0}
            max={10}
            step={1}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};
