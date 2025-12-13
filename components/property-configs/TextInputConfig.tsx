/**
 * TextInputConfig Component
 * 
 * Independent configuration panel for Text Input widgets in the IoT Dashboard Builder.
 * Provides comprehensive property settings with the same functionality as the product dashboard designer.
 * 
 * Features:
 * - Input Types: text, email, password, tel, url, number
 * - Validation: max length, regex patterns, required field
 * - Action Buttons: submit, clear with customizable labels
 * - Display Options: container card, character counter
 * - Styling: dimensions, padding, border radius, border width
 * - Colors: border, background, text, placeholder
 * 
 * @component
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Type } from 'lucide-react';
import { IoTDashboardWidget } from '../../types';

interface TextInputConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (key: string, value: any) => void;
}

export const TextInputConfig: React.FC<TextInputConfigProps> = ({
  widget,
  onConfigChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4" />
        <h4 className="text-sm font-semibold">Text Input Settings</h4>
      </div>

      {/* Input Type */}
      <div className="space-y-1">
        <Label htmlFor="textInputType" className="text-xs">Input Type</Label>
        <Select
          value={widget.config.textInputType || 'text'}
          onValueChange={(value) => onConfigChange('textInputType', value)}
        >
          <SelectTrigger id="textInputType" className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="password">Password</SelectItem>
            <SelectItem value="tel">Telephone</SelectItem>
            <SelectItem value="url">URL</SelectItem>
            <SelectItem value="number">Number</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {widget.config.textInputType === 'email' && 'Validates email format'}
          {widget.config.textInputType === 'password' && 'Hides input characters'}
          {widget.config.textInputType === 'tel' && 'Optimized for phone numbers'}
          {widget.config.textInputType === 'url' && 'Validates URL format'}
          {widget.config.textInputType === 'number' && 'Only allows numeric input'}
        </p>
      </div>

      {/* Placeholder */}
      <div className="space-y-1">
        <Label htmlFor="textInputPlaceholder" className="text-xs">Placeholder Text</Label>
        <Input
          id="textInputPlaceholder"
          value={widget.config.textInputPlaceholder || ''}
          onChange={(e) => onConfigChange('textInputPlaceholder', e.target.value)}
          placeholder="Enter text..."
          className="h-8 text-sm"
        />
      </div>

      {/* Default Value */}
      <div className="space-y-1">
        <Label htmlFor="textInputDefaultValue" className="text-xs">Default Value</Label>
        <Input
          id="textInputDefaultValue"
          value={widget.config.textInputDefaultValue || ''}
          onChange={(e) => onConfigChange('textInputDefaultValue', e.target.value)}
          placeholder="Default text"
          className="h-8 text-sm"
        />
      </div>

      <Separator />

      {/* Validation */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Validation</Label>
        
        <div className="space-y-1">
          <Label htmlFor="textInputMaxLength" className="text-xs">Max Length</Label>
          <Input
            id="textInputMaxLength"
            type="number"
            value={widget.config.textInputMaxLength || ''}
            onChange={(e) => onConfigChange('textInputMaxLength', parseInt(e.target.value) || undefined)}
            placeholder="No limit"
            min="1"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Maximum number of characters allowed
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="textInputPattern" className="text-xs">Pattern (Regex)</Label>
          <Input
            id="textInputPattern"
            value={widget.config.textInputPattern || ''}
            onChange={(e) => onConfigChange('textInputPattern', e.target.value)}
            placeholder="^[a-zA-Z0-9]*$"
            className="h-8 text-sm font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Regular expression for custom validation
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="textInputRequired" className="text-xs">Required Field</Label>
          <Switch
            id="textInputRequired"
            checked={widget.config.textInputRequired || false}
            onCheckedChange={(checked) => onConfigChange('textInputRequired', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Buttons */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Action Buttons</Label>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="textInputSubmitButton" className="text-xs">Show Submit Button</Label>
          <Switch
            id="textInputSubmitButton"
            checked={widget.config.textInputSubmitButton || false}
            onCheckedChange={(checked) => onConfigChange('textInputSubmitButton', checked)}
          />
        </div>

        {widget.config.textInputSubmitButton && (
          <div className="space-y-1 pl-4">
            <Label htmlFor="textInputSubmitLabel" className="text-xs">Submit Button Label</Label>
            <Input
              id="textInputSubmitLabel"
              value={widget.config.textInputSubmitLabel || ''}
              onChange={(e) => onConfigChange('textInputSubmitLabel', e.target.value)}
              placeholder="Leave empty for icon"
              className="h-8 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Shows Send icon if left empty
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="textInputClearButton" className="text-xs">Show Clear Button</Label>
          <Switch
            id="textInputClearButton"
            checked={widget.config.textInputClearButton || false}
            onCheckedChange={(checked) => onConfigChange('textInputClearButton', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Display Options */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Display Options</Label>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="showTextInputContainer" className="text-xs">Show Container Card</Label>
          <Switch
            id="showTextInputContainer"
            checked={widget.config.showTextInputContainer !== false}
            onCheckedChange={(checked) => onConfigChange('showTextInputContainer', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="textInputShowCharCount" className="text-xs">Show Character Count</Label>
          <Switch
            id="textInputShowCharCount"
            checked={widget.config.textInputShowCharCount || false}
            onCheckedChange={(checked) => onConfigChange('textInputShowCharCount', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Styling */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Input Styling</Label>
        
        <div className="space-y-1">
          <Label htmlFor="textInputFontSize" className="text-xs">Font Size</Label>
          <Input
            id="textInputFontSize"
            value={widget.config.textInputFontSize || ''}
            onChange={(e) => onConfigChange('textInputFontSize', e.target.value)}
            placeholder="14px"
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="textInputHeight" className="text-xs">Input Height (px)</Label>
          <Input
            id="textInputHeight"
            type="number"
            value={widget.config.textInputHeight || ''}
            onChange={(e) => onConfigChange('textInputHeight', parseInt(e.target.value) || undefined)}
            placeholder="40"
            min="24"
            max="200"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Default: 40px (Range: 24-200px)
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="textInputPadding" className="text-xs">Padding</Label>
          <Input
            id="textInputPadding"
            value={widget.config.textInputPadding || ''}
            onChange={(e) => onConfigChange('textInputPadding', e.target.value)}
            placeholder="8px"
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="textInputBorderRadius" className="text-xs">Border Radius (px)</Label>
          <Input
            id="textInputBorderRadius"
            type="number"
            value={widget.config.textInputBorderRadius || ''}
            onChange={(e) => onConfigChange('textInputBorderRadius', parseInt(e.target.value) || undefined)}
            placeholder="4"
            min="0"
            max="50"
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="textInputBorderWidth" className="text-xs">Border Width</Label>
          <Input
            id="textInputBorderWidth"
            value={widget.config.textInputBorderWidth || ''}
            onChange={(e) => onConfigChange('textInputBorderWidth', e.target.value)}
            placeholder="1px"
            className="h-8 text-sm"
          />
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Colors</Label>
        
        <div className="space-y-1">
          <Label htmlFor="textInputBorderColor" className="text-xs">Border Color</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={widget.config.textInputBorderColor || '#cccccc'}
              onChange={(e) => onConfigChange('textInputBorderColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              id="textInputBorderColor"
              value={widget.config.textInputBorderColor || ''}
              onChange={(e) => onConfigChange('textInputBorderColor', e.target.value)}
              placeholder="#cccccc"
              className="h-8 text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="textInputBackgroundColor" className="text-xs">Background Color</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={widget.config.textInputBackgroundColor || '#ffffff'}
              onChange={(e) => onConfigChange('textInputBackgroundColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              id="textInputBackgroundColor"
              value={widget.config.textInputBackgroundColor || ''}
              onChange={(e) => onConfigChange('textInputBackgroundColor', e.target.value)}
              placeholder="#ffffff"
              className="h-8 text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="textInputTextColor" className="text-xs">Text Color</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={widget.config.textInputTextColor || '#000000'}
              onChange={(e) => onConfigChange('textInputTextColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              id="textInputTextColor"
              value={widget.config.textInputTextColor || ''}
              onChange={(e) => onConfigChange('textInputTextColor', e.target.value)}
              placeholder="#000000"
              className="h-8 text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="textInputPlaceholderColor" className="text-xs">Placeholder Color</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={widget.config.textInputPlaceholderColor || '#999999'}
              onChange={(e) => onConfigChange('textInputPlaceholderColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              id="textInputPlaceholderColor"
              value={widget.config.textInputPlaceholderColor || ''}
              onChange={(e) => onConfigChange('textInputPlaceholderColor', e.target.value)}
              placeholder="#999999"
              className="h-8 text-sm font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
