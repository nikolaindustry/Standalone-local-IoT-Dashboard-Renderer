import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PaymentActionConfigProps {
  widget: any;
  onConfigChange: (property: string, value: any) => void;
}

export const PaymentActionConfig: React.FC<PaymentActionConfigProps> = ({
  widget,
  onConfigChange
}) => {
  const config = widget.config || {};

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Basic</TabsTrigger>
        <TabsTrigger value="design">Design</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      {/* Basic Tab */}
      <TabsContent value="basic" className="space-y-4 mt-4">
        {/* Payment Settings */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Payment Settings</h4>
          
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={config.amount || 0}
              onChange={(e) => onConfigChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="Enter amount"
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-xs">Currency</Label>
            <Select
              value={config.currency || 'INR'}
              onValueChange={(value) => onConfigChange('currency', value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs">Description</Label>
            <Textarea
              id="description"
              value={config.description || ''}
              onChange={(e) => onConfigChange('description', e.target.value)}
              placeholder="Payment description"
              rows={2}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonLabel" className="text-xs">Button Label</Label>
            <Input
              id="buttonLabel"
              value={config.buttonLabel || 'Pay Now'}
              onChange={(e) => onConfigChange('buttonLabel', e.target.value)}
              placeholder="Pay Now"
              className="h-8 text-sm"
            />
          </div>
        </div>

        <Separator />

        {/* Event Settings */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-green-600">Payment Success</h4>
          
          <div className="space-y-2">
            <Label htmlFor="paymentSuccessMessage" className="text-xs">Success Message</Label>
            <Input
              id="paymentSuccessMessage"
              placeholder="Payment successful!"
              value={config.paymentSuccessMessage || ''}
              onChange={(e) => onConfigChange('paymentSuccessMessage', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-red-600">Payment Failure</h4>
          
          <div className="space-y-2">
            <Label htmlFor="paymentFailureMessage" className="text-xs">Failure Message</Label>
            <Input
              id="paymentFailureMessage"
              placeholder="Payment failed. Please try again."
              value={config.paymentFailureMessage || ''}
              onChange={(e) => onConfigChange('paymentFailureMessage', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </TabsContent>

      {/* Design Tab */}
      <TabsContent value="design" className="space-y-4 mt-4">
        {/* Card Styling */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Card Styling</h4>
          
          <div className="space-y-2">
            <Label htmlFor="cardBackgroundColor" className="text-xs">Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.cardBackgroundColor || '#ffffff'}
                onChange={(e) => onConfigChange('cardBackgroundColor', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input
                value={config.cardBackgroundColor || ''}
                onChange={(e) => onConfigChange('cardBackgroundColor', e.target.value)}
                placeholder="#ffffff"
                className="h-8 flex-1 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardBorderColor" className="text-xs">Border Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.cardBorderColor || '#e5e7eb'}
                onChange={(e) => onConfigChange('cardBorderColor', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input
                value={config.cardBorderColor || ''}
                onChange={(e) => onConfigChange('cardBorderColor', e.target.value)}
                placeholder="#e5e7eb"
                className="h-8 flex-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="cardBorderWidth" className="text-xs">Border Width (px)</Label>
              <Input
                id="cardBorderWidth"
                type="number"
                min="0"
                max="10"
                value={config.cardBorderWidth !== undefined ? config.cardBorderWidth : 1}
                onChange={(e) => onConfigChange('cardBorderWidth', parseInt(e.target.value) || 0)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardBorderRadius" className="text-xs">Border Radius (px)</Label>
              <Input
                id="cardBorderRadius"
                type="number"
                min="0"
                max="50"
                value={config.cardBorderRadius !== undefined ? config.cardBorderRadius : 8}
                onChange={(e) => onConfigChange('cardBorderRadius', parseInt(e.target.value) || 0)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardPadding" className="text-xs">Padding (px)</Label>
            <Input
              id="cardPadding"
              type="number"
              min="0"
              max="100"
              value={config.cardPadding !== undefined ? config.cardPadding : 24}
              onChange={(e) => onConfigChange('cardPadding', parseInt(e.target.value) || 0)}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardShadow" className="text-xs">Box Shadow</Label>
            <Input
              id="cardShadow"
              value={config.cardShadow || ''}
              onChange={(e) => onConfigChange('cardShadow', e.target.value)}
              placeholder="0 1px 3px rgba(0,0,0,0.1)"
              className="h-8 text-sm"
            />
            <p className="text-xs text-muted-foreground">CSS box-shadow value</p>
          </div>
        </div>

        <Separator />

        {/* Icon Styling */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Icon Styling</h4>
          
          <div className="flex items-center justify-between">
            <Label className="text-xs">Hide Icon</Label>
            <Switch
              checked={config.hideIcon === true}
              onCheckedChange={(checked) => onConfigChange('hideIcon', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iconColor" className="text-xs">Icon Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.iconColor || '#3b82f6'}
                onChange={(e) => onConfigChange('iconColor', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input
                value={config.iconColor || ''}
                onChange={(e) => onConfigChange('iconColor', e.target.value)}
                placeholder="#3b82f6"
                className="h-8 flex-1 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="iconSize" className="text-xs">Icon Size (px)</Label>
            <Input
              id="iconSize"
              type="number"
              min="12"
              max="100"
              value={config.iconSize || 32}
              onChange={(e) => onConfigChange('iconSize', parseInt(e.target.value) || 32)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <Separator />

        {/* Text Styling */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Title Styling</h4>
          
          <div className="space-y-2">
            <Label htmlFor="titleColor" className="text-xs">Title Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.titleColor || '#000000'}
                onChange={(e) => onConfigChange('titleColor', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input
                value={config.titleColor || ''}
                onChange={(e) => onConfigChange('titleColor', e.target.value)}
                placeholder="#000000"
                className="h-8 flex-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="titleSize" className="text-xs">Title Size (px)</Label>
              <Input
                id="titleSize"
                type="number"
                min="10"
                max="48"
                value={config.titleSize || 16}
                onChange={(e) => onConfigChange('titleSize', parseInt(e.target.value) || 16)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleWeight" className="text-xs">Font Weight</Label>
              <Select
                value={config.titleWeight || '600'}
                onValueChange={(value) => onConfigChange('titleWeight', value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">Light</SelectItem>
                  <SelectItem value="400">Normal</SelectItem>
                  <SelectItem value="500">Medium</SelectItem>
                  <SelectItem value="600">Semibold</SelectItem>
                  <SelectItem value="700">Bold</SelectItem>
                  <SelectItem value="800">Extra Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titleAlign" className="text-xs">Text Align</Label>
            <Select
              value={config.titleAlign || 'left'}
              onValueChange={(value) => onConfigChange('titleAlign', value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Description Styling */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Description Styling</h4>
          
          <div className="space-y-2">
            <Label htmlFor="descriptionColor" className="text-xs">Description Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.descriptionColor || '#6b7280'}
                onChange={(e) => onConfigChange('descriptionColor', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input
                value={config.descriptionColor || ''}
                onChange={(e) => onConfigChange('descriptionColor', e.target.value)}
                placeholder="#6b7280"
                className="h-8 flex-1 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionSize" className="text-xs">Description Size (px)</Label>
            <Input
              id="descriptionSize"
              type="number"
              min="8"
              max="24"
              value={config.descriptionSize || 14}
              onChange={(e) => onConfigChange('descriptionSize', parseInt(e.target.value) || 14)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <Separator />

        {/* Amount Styling */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Amount Styling</h4>
          
          <div className="space-y-2">
            <Label htmlFor="amountColor" className="text-xs">Amount Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.amountColor || '#000000'}
                onChange={(e) => onConfigChange('amountColor', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input
                value={config.amountColor || ''}
                onChange={(e) => onConfigChange('amountColor', e.target.value)}
                placeholder="#000000"
                className="h-8 flex-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="amountSize" className="text-xs">Amount Size (px)</Label>
              <Input
                id="amountSize"
                type="number"
                min="16"
                max="72"
                value={config.amountSize || 30}
                onChange={(e) => onConfigChange('amountSize', parseInt(e.target.value) || 30)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountWeight" className="text-xs">Font Weight</Label>
              <Select
                value={config.amountWeight || '700'}
                onValueChange={(value) => onConfigChange('amountWeight', value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="400">Normal</SelectItem>
                  <SelectItem value="500">Medium</SelectItem>
                  <SelectItem value="600">Semibold</SelectItem>
                  <SelectItem value="700">Bold</SelectItem>
                  <SelectItem value="800">Extra Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currencyPosition" className="text-xs">Currency Symbol Position</Label>
            <Select
              value={config.currencyPosition || 'before'}
              onValueChange={(value) => onConfigChange('currencyPosition', value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">Before Amount</SelectItem>
                <SelectItem value="after">After Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Show Currency Code</Label>
            <Switch
              checked={config.showCurrencyCode !== false}
              onCheckedChange={(checked) => onConfigChange('showCurrencyCode', checked)}
            />
          </div>
        </div>
      </TabsContent>

      {/* Advanced Tab */}
      <TabsContent value="advanced" className="space-y-4 mt-4">
        {/* Button Styling */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Button Styling</h4>
          
          <div className="space-y-2">
            <Label htmlFor="buttonBackgroundColor" className="text-xs">Button Background</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.buttonBackgroundColor || '#3b82f6'}
                onChange={(e) => onConfigChange('buttonBackgroundColor', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input
                value={config.buttonBackgroundColor || ''}
                onChange={(e) => onConfigChange('buttonBackgroundColor', e.target.value)}
                placeholder="#3b82f6"
                className="h-8 flex-1 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonTextColor" className="text-xs">Button Text Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.buttonTextColor || '#ffffff'}
                onChange={(e) => onConfigChange('buttonTextColor', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input
                value={config.buttonTextColor || ''}
                onChange={(e) => onConfigChange('buttonTextColor', e.target.value)}
                placeholder="#ffffff"
                className="h-8 flex-1 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonBorderColor" className="text-xs">Button Border Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.buttonBorderColor || '#3b82f6'}
                onChange={(e) => onConfigChange('buttonBorderColor', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input
                value={config.buttonBorderColor || ''}
                onChange={(e) => onConfigChange('buttonBorderColor', e.target.value)}
                placeholder="#3b82f6"
                className="h-8 flex-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="buttonBorderWidth" className="text-xs">Border Width (px)</Label>
              <Input
                id="buttonBorderWidth"
                type="number"
                min="0"
                max="10"
                value={config.buttonBorderWidth !== undefined ? config.buttonBorderWidth : 0}
                onChange={(e) => onConfigChange('buttonBorderWidth', parseInt(e.target.value) || 0)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonBorderRadius" className="text-xs">Border Radius (px)</Label>
              <Input
                id="buttonBorderRadius"
                type="number"
                min="0"
                max="50"
                value={config.buttonBorderRadius !== undefined ? config.buttonBorderRadius : 6}
                onChange={(e) => onConfigChange('buttonBorderRadius', parseInt(e.target.value) || 0)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonFontSize" className="text-xs">Button Font Size (px)</Label>
            <Input
              id="buttonFontSize"
              type="number"
              min="10"
              max="24"
              value={config.buttonFontSize || 14}
              onChange={(e) => onConfigChange('buttonFontSize', parseInt(e.target.value) || 14)}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonFontWeight" className="text-xs">Button Font Weight</Label>
            <Select
              value={config.buttonFontWeight || '500'}
              onValueChange={(value) => onConfigChange('buttonFontWeight', value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="400">Normal</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="600">Semibold</SelectItem>
                <SelectItem value="700">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonWidth" className="text-xs">Button Width</Label>
            <Select
              value={config.buttonWidth || 'full'}
              onValueChange={(value) => onConfigChange('buttonWidth', value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Width</SelectItem>
                <SelectItem value="auto">Auto Width</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonPadding" className="text-xs">Button Padding</Label>
            <Input
              id="buttonPadding"
              value={config.buttonPadding || ''}
              onChange={(e) => onConfigChange('buttonPadding', e.target.value)}
              placeholder="8px 16px"
              className="h-8 text-sm"
            />
            <p className="text-xs text-muted-foreground">CSS padding value</p>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Hide Button Icon</Label>
            <Switch
              checked={config.hideButtonIcon === true}
              onCheckedChange={(checked) => onConfigChange('hideButtonIcon', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonIconPosition" className="text-xs">Button Icon Position</Label>
            <Select
              value={config.buttonIconPosition || 'left'}
              onValueChange={(value) => onConfigChange('buttonIconPosition', value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonIconSize" className="text-xs">Button Icon Size (px)</Label>
            <Input
              id="buttonIconSize"
              type="number"
              min="12"
              max="32"
              value={config.buttonIconSize || 16}
              onChange={(e) => onConfigChange('buttonIconSize', parseInt(e.target.value) || 16)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <Separator />

        {/* Success/Error State Styling */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-green-600">Success State Styling</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="successIconColor" className="text-xs">Icon Color</Label>
              <Input
                type="color"
                value={config.successIconColor || '#22c55e'}
                onChange={(e) => onConfigChange('successIconColor', e.target.value)}
                className="w-full h-8 p-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="successIconSize" className="text-xs">Icon Size (px)</Label>
              <Input
                id="successIconSize"
                type="number"
                min="24"
                max="100"
                value={config.successIconSize || 48}
                onChange={(e) => onConfigChange('successIconSize', parseInt(e.target.value) || 48)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="successTitleColor" className="text-xs">Title Color</Label>
              <Input
                type="color"
                value={config.successTitleColor || '#000000'}
                onChange={(e) => onConfigChange('successTitleColor', e.target.value)}
                className="w-full h-8 p-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="successTitleSize" className="text-xs">Title Size (px)</Label>
              <Input
                id="successTitleSize"
                type="number"
                min="12"
                max="32"
                value={config.successTitleSize || 18}
                onChange={(e) => onConfigChange('successTitleSize', parseInt(e.target.value) || 18)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="successMessageColor" className="text-xs">Message Color</Label>
            <Input
              type="color"
              value={config.successMessageColor || '#6b7280'}
              onChange={(e) => onConfigChange('successMessageColor', e.target.value)}
              className="w-full h-8 p-1"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-red-600">Error State Styling</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="errorIconColor" className="text-xs">Icon Color</Label>
              <Input
                type="color"
                value={config.errorIconColor || '#ef4444'}
                onChange={(e) => onConfigChange('errorIconColor', e.target.value)}
                className="w-full h-8 p-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="errorIconSize" className="text-xs">Icon Size (px)</Label>
              <Input
                id="errorIconSize"
                type="number"
                min="24"
                max="100"
                value={config.errorIconSize || 48}
                onChange={(e) => onConfigChange('errorIconSize', parseInt(e.target.value) || 48)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="errorTitleColor" className="text-xs">Title Color</Label>
              <Input
                type="color"
                value={config.errorTitleColor || '#000000'}
                onChange={(e) => onConfigChange('errorTitleColor', e.target.value)}
                className="w-full h-8 p-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="errorTitleSize" className="text-xs">Title Size (px)</Label>
              <Input
                id="errorTitleSize"
                type="number"
                min="12"
                max="32"
                value={config.errorTitleSize || 18}
                onChange={(e) => onConfigChange('errorTitleSize', parseInt(e.target.value) || 18)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="errorMessageColor" className="text-xs">Message Color</Label>
            <Input
              type="color"
              value={config.errorMessageColor || '#6b7280'}
              onChange={(e) => onConfigChange('errorMessageColor', e.target.value)}
              className="w-full h-8 p-1"
            />
          </div>
        </div>

        <Separator />

        {/* Layout Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Layout Options</h4>
          
          <div className="space-y-2">
            <Label htmlFor="layoutDirection" className="text-xs">Layout Direction</Label>
            <Select
              value={config.layoutDirection || 'vertical'}
              onValueChange={(value) => onConfigChange('layoutDirection', value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentAlignment" className="text-xs">Content Alignment</Label>
            <Select
              value={config.contentAlignment || 'start'}
              onValueChange={(value) => onConfigChange('contentAlignment', value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="end">End</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spacing" className="text-xs">Element Spacing (px)</Label>
            <Input
              id="spacing"
              type="number"
              min="0"
              max="50"
              value={config.spacing !== undefined ? config.spacing : 16}
              onChange={(e) => onConfigChange('spacing', parseInt(e.target.value) || 0)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
