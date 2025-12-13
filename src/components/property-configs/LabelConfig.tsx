import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LabelConfigProps {
  config: Record<string, any>;
  onConfigChange: (property: string, value: any) => void;
  onBatchConfigChange?: (updates: Record<string, any>) => void;
}

export const LabelConfig: React.FC<LabelConfigProps> = ({ config, onConfigChange, onBatchConfigChange }) => {
  const [isUploadingFont, setIsUploadingFont] = useState(false);

  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.ttf', '.otf', '.woff', '.woff2'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(fileExtension)) {
      toast.error('Invalid font file', {
        description: 'Please upload a valid font file (.ttf, .otf, .woff, .woff2)'
      });
      return;
    }

    // Validate file size (max 500KB)
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      toast.error('Font file too large', {
        description: `File size must be less than 500KB. Your file is ${(file.size / 1024).toFixed(0)}KB.`
      });
      return;
    }

    setIsUploadingFont(true);
    try {
      // Convert file to base64 data URL with proper MIME type
      const reader = new FileReader();
      reader.onload = (e) => {
        let fontData = e.target?.result as string;
        
        // Validate font data
        if (!fontData || !fontData.startsWith('data:')) {
          toast.error('Invalid font data', {
            description: 'Font file could not be read correctly'
          });
          setIsUploadingFont(false);
          return;
        }
        
        // Extract and validate base64 data
        const base64Data = fontData.split(',')[1];
        if (!base64Data || base64Data.length < 100) {
          toast.error('Font file appears to be empty or corrupted', {
            description: 'Please try a different font file'
          });
          setIsUploadingFont(false);
          return;
        }
        
        // Check TTF file signature (should start with 0x00010000 or 'OTTO' for OTF)
        const firstBytes = base64Data.substring(0, 16);
        console.log('Font file first bytes (base64):', firstBytes);
        
        // Fix MIME type if it's generic octet-stream
        // Determine correct MIME type based on file extension
        const mimeType = fileExtension === '.woff2' ? 'font/woff2' :
                        fileExtension === '.woff' ? 'font/woff' :
                        fileExtension === '.otf' ? 'font/otf' :
                        'font/ttf';  // Default for .ttf
        
        // Replace octet-stream with correct font MIME type
        if (fontData.startsWith('data:application/octet-stream')) {
          fontData = fontData.replace('data:application/octet-stream', `data:${mimeType}`);
          console.log('Fixed MIME type from octet-stream to:', mimeType);
        }
        
        console.log('Font data length:', fontData.length, 'Base64 length:', base64Data.length);
        console.log('Font data MIME type:', fontData.substring(5, fontData.indexOf(';')));
        
        const fontFamily = `custom-font-${Date.now()}`;
        
        const fontUpdates = {
          customFontData: fontData,
          customFontName: file.name,
          customFontFamily: fontFamily,
          fontFamily: fontFamily
        };
        
        console.log('Font upload - Setting all properties:', {
          customFontData: `${fontData.substring(0, 50)}... (${fontData.length} chars)`,
          customFontName: file.name,
          customFontFamily: fontFamily,
          fontFamily: fontFamily,
          mimeType: fontData.substring(5, fontData.indexOf(';'))  // Extract MIME type
        });
        
        // Use batch update if available, otherwise fall back to individual calls
        if (onBatchConfigChange) {
          console.log('Using batch config change');
          onBatchConfigChange(fontUpdates);
        } else {
          console.log('Using individual config changes');
          onConfigChange('customFontData', fontData);
          onConfigChange('customFontName', file.name);
          onConfigChange('customFontFamily', fontFamily);
          onConfigChange('fontFamily', fontFamily);
        }
        
        // Give a small delay to ensure all updates are processed
        setTimeout(() => {
          toast.success('Custom font uploaded successfully', {
            description: `${file.name} is now available`,
            icon: <CheckCircle className="w-4 h-4" />
          });
          setIsUploadingFont(false);
        }, 100);
      };
      reader.onerror = () => {
        toast.error('Failed to read font file', {
          description: 'Please try again with a different file',
          icon: <AlertCircle className="w-4 h-4" />
        });
        setIsUploadingFont(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading font:', error);
      toast.error('Failed to upload font', {
        description: 'An unexpected error occurred'
      });
      setIsUploadingFont(false);
    }
    
    // Reset input to allow re-uploading the same file
    event.target.value = '';
  };

  const handleRemoveCustomFont = () => {
    onConfigChange('customFontData', undefined);
    onConfigChange('customFontName', undefined);
    onConfigChange('customFontFamily', undefined);
    onConfigChange('fontFamily', 'inherit');
    
    toast.success('Custom font removed', {
      description: 'Reverted to standard font selection'
    });
  };

  return (
    <Tabs defaultValue="content" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="typography">Typography</TabsTrigger>
        <TabsTrigger value="layout">Layout</TabsTrigger>
        <TabsTrigger value="effects">Effects</TabsTrigger>
      </TabsList>

      {/* Content Tab */}
      <TabsContent value="content" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="labelText" className="text-xs">Text Content</Label>
          <Textarea
            id="labelText"
            value={config.labelText || ''}
            onChange={(e) => onConfigChange('labelText', e.target.value)}
            placeholder="Enter text..."
            className="min-h-[80px] text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Supports dynamic data injection via WebSocket messages
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="htmlContent" className="text-xs">HTML Content (Advanced)</Label>
          <Textarea
            id="htmlContent"
            value={config.htmlContent || ''}
            onChange={(e) => onConfigChange('htmlContent', e.target.value)}
            placeholder="<span>Custom HTML</span>"
            className="min-h-[60px] text-sm font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Override with raw HTML (use with caution)
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-xs">Enable HTML Rendering</Label>
            <p className="text-xs text-muted-foreground">Parse HTML tags in content</p>
          </div>
          <Switch
            checked={config.enableHtml === true}
            onCheckedChange={(checked) => onConfigChange('enableHtml', checked)}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="prefix" className="text-xs">Prefix</Label>
          <Input
            id="prefix"
            value={config.prefix || ''}
            onChange={(e) => onConfigChange('prefix', e.target.value)}
            placeholder="e.g., $, #"
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="suffix" className="text-xs">Suffix</Label>
          <Input
            id="suffix"
            value={config.suffix || ''}
            onChange={(e) => onConfigChange('suffix', e.target.value)}
            placeholder="e.g., %, °C, kg"
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="placeholder" className="text-xs">Placeholder (Empty State)</Label>
          <Input
            id="placeholder"
            value={config.placeholder || ''}
            onChange={(e) => onConfigChange('placeholder', e.target.value)}
            placeholder="--"
            className="h-8 text-sm"
          />
        </div>
      </TabsContent>

      {/* Typography Tab */}
      <TabsContent value="typography" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fontFamily" className="text-xs">Font Family</Label>
          
          {/* Show custom font indicator if uploaded */}
          {config.customFontName ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-md">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{config.customFontName}</p>
                  <p className="text-xs text-muted-foreground">Custom font active</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCustomFont}
                  className="h-8 w-8 p-0 flex-shrink-0"
                  title="Remove custom font"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                To use a different font, remove this one first or upload a new one to replace it.
              </p>
            </div>
          ) : (
            <>
              <Select
                value={config.fontFamily || 'inherit'}
                onValueChange={(value) => onConfigChange('fontFamily', value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inherit">System Default</SelectItem>
                  <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                  <SelectItem value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</SelectItem>
                  <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                  <SelectItem value="Georgia, serif">Georgia</SelectItem>
                  <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                  <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                  <SelectItem value="'Trebuchet MS', sans-serif">Trebuchet MS</SelectItem>
                  <SelectItem value="'Comic Sans MS', cursive">Comic Sans MS</SelectItem>
                  <SelectItem value="Impact, fantasy">Impact</SelectItem>
                  <SelectItem value="'Palatino Linotype', serif">Palatino</SelectItem>
                  <SelectItem value="'Lucida Console', monospace">Lucida Console</SelectItem>
                  <SelectItem value="Tahoma, sans-serif">Tahoma</SelectItem>
                  <SelectItem value="'Gill Sans', sans-serif">Gill Sans</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Custom font upload button */}
              <div className="mt-2">
                <Label htmlFor="font-upload" className="cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={isUploadingFont}
                    onClick={() => document.getElementById('font-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploadingFont ? 'Uploading...' : 'Upload Custom Font'}
                  </Button>
                </Label>
                <Input
                  id="font-upload"
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={handleFontUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supports: TTF, OTF, WOFF, WOFF2 (max 500KB)
                </p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Font Size: {config.fontSize || 16}px</Label>
          <Slider
            value={[parseInt(config.fontSize) || 16]}
            onValueChange={([value]) => onConfigChange('fontSize', value)}
            min={8}
            max={120}
            step={1}
            className="mt-2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fontWeight" className="text-xs">Font Weight</Label>
          <Select
            value={config.fontWeight || 'normal'}
            onValueChange={(value) => onConfigChange('fontWeight', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">100 - Thin</SelectItem>
              <SelectItem value="200">200 - Extra Light</SelectItem>
              <SelectItem value="300">300 - Light</SelectItem>
              <SelectItem value="normal">400 - Normal</SelectItem>
              <SelectItem value="500">500 - Medium</SelectItem>
              <SelectItem value="600">600 - Semi Bold</SelectItem>
              <SelectItem value="bold">700 - Bold</SelectItem>
              <SelectItem value="800">800 - Extra Bold</SelectItem>
              <SelectItem value="900">900 - Black</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fontStyle" className="text-xs">Font Style</Label>
          <Select
            value={config.fontStyle || 'normal'}
            onValueChange={(value) => onConfigChange('fontStyle', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="italic">Italic</SelectItem>
              <SelectItem value="oblique">Oblique</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="textDecoration" className="text-xs">Text Decoration</Label>
          <Select
            value={config.textDecoration || 'none'}
            onValueChange={(value) => onConfigChange('textDecoration', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="underline">Underline</SelectItem>
              <SelectItem value="overline">Overline</SelectItem>
              <SelectItem value="line-through">Strike Through</SelectItem>
              <SelectItem value="underline overline">Underline + Overline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="textTransform" className="text-xs">Text Transform</Label>
          <Select
            value={config.textTransform || 'none'}
            onValueChange={(value) => onConfigChange('textTransform', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="uppercase">UPPERCASE</SelectItem>
              <SelectItem value="lowercase">lowercase</SelectItem>
              <SelectItem value="capitalize">Capitalize</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-xs">Line Height: {config.lineHeight || 1.5}</Label>
          <Slider
            value={[(config.lineHeight || 1.5) * 10]}
            onValueChange={([value]) => onConfigChange('lineHeight', value / 10)}
            min={8}
            max={40}
            step={1}
            className="mt-2"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Letter Spacing: {config.letterSpacing || 0}px</Label>
          <Slider
            value={[config.letterSpacing || 0]}
            onValueChange={([value]) => onConfigChange('letterSpacing', value)}
            min={-5}
            max={20}
            step={0.5}
            className="mt-2"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Word Spacing: {config.wordSpacing || 0}px</Label>
          <Slider
            value={[config.wordSpacing || 0]}
            onValueChange={([value]) => onConfigChange('wordSpacing', value)}
            min={-10}
            max={50}
            step={1}
            className="mt-2"
          />
        </div>
      </TabsContent>

      {/* Layout Tab */}
      <TabsContent value="layout" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="textAlign" className="text-xs">Text Alignment</Label>
          <Select
            value={config.textAlign || 'left'}
            onValueChange={(value) => onConfigChange('textAlign', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
              <SelectItem value="justify">Justify</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="verticalAlign" className="text-xs">Vertical Alignment</Label>
          <Select
            value={config.verticalAlign || 'top'}
            onValueChange={(value) => onConfigChange('verticalAlign', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="middle">Middle</SelectItem>
              <SelectItem value="bottom">Bottom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-xs">Padding: {config.padding || 0}px</Label>
          <Slider
            value={[parseInt(config.padding) || 0]}
            onValueChange={([value]) => onConfigChange('padding', value)}
            min={0}
            max={100}
            step={1}
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Padding Top: {config.paddingTop || 0}px</Label>
            <Slider
              value={[parseInt(config.paddingTop) || 0]}
              onValueChange={([value]) => onConfigChange('paddingTop', value)}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Padding Bottom: {config.paddingBottom || 0}px</Label>
            <Slider
              value={[parseInt(config.paddingBottom) || 0]}
              onValueChange={([value]) => onConfigChange('paddingBottom', value)}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Padding Left: {config.paddingLeft || 0}px</Label>
            <Slider
              value={[parseInt(config.paddingLeft) || 0]}
              onValueChange={([value]) => onConfigChange('paddingLeft', value)}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Padding Right: {config.paddingRight || 0}px</Label>
            <Slider
              value={[parseInt(config.paddingRight) || 0]}
              onValueChange={([value]) => onConfigChange('paddingRight', value)}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-xs">Margin: {config.margin || 0}px</Label>
          <Slider
            value={[parseInt(config.margin) || 0]}
            onValueChange={([value]) => onConfigChange('margin', value)}
            min={0}
            max={100}
            step={1}
            className="mt-2"
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="width" className="text-xs">Width</Label>
          <Input
            id="width"
            value={config.width || 'auto'}
            onChange={(e) => onConfigChange('width', e.target.value)}
            placeholder="auto, 100%, 200px"
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="height" className="text-xs">Height</Label>
          <Input
            id="height"
            value={config.height || 'auto'}
            onChange={(e) => onConfigChange('height', e.target.value)}
            placeholder="auto, 100%, 50px"
            className="h-8 text-sm"
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="whiteSpace" className="text-xs">White Space</Label>
          <Select
            value={config.whiteSpace || 'normal'}
            onValueChange={(value) => onConfigChange('whiteSpace', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="nowrap">No Wrap</SelectItem>
              <SelectItem value="pre">Preserve</SelectItem>
              <SelectItem value="pre-wrap">Pre Wrap</SelectItem>
              <SelectItem value="pre-line">Pre Line</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="overflow" className="text-xs">Text Overflow</Label>
          <Select
            value={config.textOverflow || 'clip'}
            onValueChange={(value) => onConfigChange('textOverflow', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clip">Clip</SelectItem>
              <SelectItem value="ellipsis">Ellipsis (...)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="wordBreak" className="text-xs">Word Break</Label>
          <Select
            value={config.wordBreak || 'normal'}
            onValueChange={(value) => onConfigChange('wordBreak', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="break-all">Break All</SelectItem>
              <SelectItem value="keep-all">Keep All</SelectItem>
              <SelectItem value="break-word">Break Word</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TabsContent>

      {/* Effects Tab */}
      <TabsContent value="effects" className="space-y-4">
        <h4 className="text-sm font-medium">Colors</h4>

        <div className="space-y-2">
          <Label htmlFor="textColor" className="text-xs">Text Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={config.textColor || '#000000'}
              onChange={(e) => onConfigChange('textColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={config.textColor || '#000000'}
              onChange={(e) => onConfigChange('textColor', e.target.value)}
              placeholder="#000000"
              className="flex-1 h-8 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="backgroundColor" className="text-xs">Background Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={config.backgroundColor || '#ffffff'}
              onChange={(e) => onConfigChange('backgroundColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={config.backgroundColor || '#ffffff'}
              onChange={(e) => onConfigChange('backgroundColor', e.target.value)}
              placeholder="transparent"
              className="flex-1 h-8 text-sm"
            />
          </div>
        </div>

        <Separator />

        <h4 className="text-sm font-medium">Border</h4>

        <div className="space-y-2">
          <Label className="text-xs">Border Width: {config.borderWidth || 0}px</Label>
          <Slider
            value={[config.borderWidth || 0]}
            onValueChange={([value]) => onConfigChange('borderWidth', value)}
            min={0}
            max={20}
            step={1}
            className="mt-2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="borderStyle" className="text-xs">Border Style</Label>
          <Select
            value={config.borderStyle || 'solid'}
            onValueChange={(value) => onConfigChange('borderStyle', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="dotted">Dotted</SelectItem>
              <SelectItem value="double">Double</SelectItem>
              <SelectItem value="groove">Groove</SelectItem>
              <SelectItem value="ridge">Ridge</SelectItem>
              <SelectItem value="inset">Inset</SelectItem>
              <SelectItem value="outset">Outset</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="borderColor" className="text-xs">Border Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={config.borderColor || '#000000'}
              onChange={(e) => onConfigChange('borderColor', e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input
              value={config.borderColor || '#000000'}
              onChange={(e) => onConfigChange('borderColor', e.target.value)}
              placeholder="#000000"
              className="flex-1 h-8 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Border Radius: {config.borderRadius || 0}px</Label>
          <Slider
            value={[config.borderRadius || 0]}
            onValueChange={([value]) => onConfigChange('borderRadius', value)}
            min={0}
            max={100}
            step={1}
            className="mt-2"
          />
        </div>

        <Separator />

        <h4 className="text-sm font-medium">Shadow Effects</h4>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Enable Text Shadow</Label>
          <Switch
            checked={config.enableTextShadow === true}
            onCheckedChange={(checked) => onConfigChange('enableTextShadow', checked)}
          />
        </div>

        {config.enableTextShadow && (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Shadow Offset X: {config.shadowX || 2}px</Label>
              <Slider
                value={[config.shadowX || 2]}
                onValueChange={([value]) => onConfigChange('shadowX', value)}
                min={-50}
                max={50}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Shadow Offset Y: {config.shadowY || 2}px</Label>
              <Slider
                value={[config.shadowY || 2]}
                onValueChange={([value]) => onConfigChange('shadowY', value)}
                min={-50}
                max={50}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Shadow Blur: {config.shadowBlur || 4}px</Label>
              <Slider
                value={[config.shadowBlur || 4]}
                onValueChange={([value]) => onConfigChange('shadowBlur', value)}
                min={0}
                max={50}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shadowColor" className="text-xs">Shadow Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.shadowColor || '#00000080'}
                  onChange={(e) => onConfigChange('shadowColor', e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={config.shadowColor || '#00000080'}
                  onChange={(e) => onConfigChange('shadowColor', e.target.value)}
                  placeholder="#00000080"
                  className="flex-1 h-8 text-sm"
                />
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <Label className="text-xs">Enable Box Shadow</Label>
          <Switch
            checked={config.enableBoxShadow === true}
            onCheckedChange={(checked) => onConfigChange('enableBoxShadow', checked)}
          />
        </div>

        {config.enableBoxShadow && (
          <div className="space-y-2">
            <Label htmlFor="boxShadow" className="text-xs">Box Shadow CSS</Label>
            <Input
              id="boxShadow"
              value={config.boxShadow || '0 4px 6px rgba(0,0,0,0.1)'}
              onChange={(e) => onConfigChange('boxShadow', e.target.value)}
              placeholder="0 4px 6px rgba(0,0,0,0.1)"
              className="h-8 text-sm"
            />
          </div>
        )}

        <Separator />

        <h4 className="text-sm font-medium">Gradient Background</h4>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Enable Gradient</Label>
          <Switch
            checked={config.enableGradient === true}
            onCheckedChange={(checked) => onConfigChange('enableGradient', checked)}
          />
        </div>

        {config.enableGradient && (
          <>
            <div className="space-y-2">
              <Label htmlFor="gradientType" className="text-xs">Gradient Type</Label>
              <Select
                value={config.gradientType || 'linear'}
                onValueChange={(value) => onConfigChange('gradientType', value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="radial">Radial</SelectItem>
                  <SelectItem value="conic">Conic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Gradient Angle: {config.gradientAngle || 90}°</Label>
              <Slider
                value={[config.gradientAngle || 90]}
                onValueChange={([value]) => onConfigChange('gradientAngle', value)}
                min={0}
                max={360}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradientColor1" className="text-xs">Color 1</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.gradientColor1 || '#3b82f6'}
                  onChange={(e) => onConfigChange('gradientColor1', e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={config.gradientColor1 || '#3b82f6'}
                  onChange={(e) => onConfigChange('gradientColor1', e.target.value)}
                  className="flex-1 h-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradientColor2" className="text-xs">Color 2</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.gradientColor2 || '#8b5cf6'}
                  onChange={(e) => onConfigChange('gradientColor2', e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={config.gradientColor2 || '#8b5cf6'}
                  onChange={(e) => onConfigChange('gradientColor2', e.target.value)}
                  className="flex-1 h-8 text-sm"
                />
              </div>
            </div>
          </>
        )}

        <Separator />

        <h4 className="text-sm font-medium">Advanced Effects</h4>

        <div className="space-y-2">
          <Label className="text-xs">Opacity: {Math.round((config.opacity || 1) * 100)}%</Label>
          <Slider
            value={[(config.opacity || 1) * 100]}
            onValueChange={([value]) => onConfigChange('opacity', value / 100)}
            min={0}
            max={100}
            step={1}
            className="mt-2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter" className="text-xs">CSS Filter</Label>
          <Input
            id="filter"
            value={config.filter || ''}
            onChange={(e) => onConfigChange('filter', e.target.value)}
            placeholder="blur(2px), brightness(1.2)"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            e.g., blur(2px), brightness(1.2), contrast(1.5)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="backdropFilter" className="text-xs">Backdrop Filter</Label>
          <Input
            id="backdropFilter"
            value={config.backdropFilter || ''}
            onChange={(e) => onConfigChange('backdropFilter', e.target.value)}
            placeholder="blur(10px)"
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mixBlendMode" className="text-xs">Blend Mode</Label>
          <Select
            value={config.mixBlendMode || 'normal'}
            onValueChange={(value) => onConfigChange('mixBlendMode', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="multiply">Multiply</SelectItem>
              <SelectItem value="screen">Screen</SelectItem>
              <SelectItem value="overlay">Overlay</SelectItem>
              <SelectItem value="darken">Darken</SelectItem>
              <SelectItem value="lighten">Lighten</SelectItem>
              <SelectItem value="color-dodge">Color Dodge</SelectItem>
              <SelectItem value="color-burn">Color Burn</SelectItem>
              <SelectItem value="difference">Difference</SelectItem>
              <SelectItem value="exclusion">Exclusion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-xs">Animation</Label>
            <p className="text-xs text-muted-foreground">Add entrance animation</p>
          </div>
          <Switch
            checked={config.enableAnimation === true}
            onCheckedChange={(checked) => onConfigChange('enableAnimation', checked)}
          />
        </div>

        {config.enableAnimation && (
          <>
            <div className="space-y-2">
              <Label htmlFor="animationType" className="text-xs">Animation Type</Label>
              <Select
                value={config.animationType || 'fadeIn'}
                onValueChange={(value) => onConfigChange('animationType', value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fadeIn">Fade In</SelectItem>
                  <SelectItem value="slideUp">Slide Up</SelectItem>
                  <SelectItem value="slideDown">Slide Down</SelectItem>
                  <SelectItem value="slideLeft">Slide Left</SelectItem>
                  <SelectItem value="slideRight">Slide Right</SelectItem>
                  <SelectItem value="zoomIn">Zoom In</SelectItem>
                  <SelectItem value="zoomOut">Zoom Out</SelectItem>
                  <SelectItem value="bounce">Bounce</SelectItem>
                  <SelectItem value="pulse">Pulse</SelectItem>
                  <SelectItem value="rotate">Rotate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Animation Duration: {config.animationDuration || 1}s</Label>
              <Slider
                value={[(config.animationDuration || 1) * 10]}
                onValueChange={([value]) => onConfigChange('animationDuration', value / 10)}
                min={1}
                max={50}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Animation Delay: {config.animationDelay || 0}s</Label>
              <Slider
                value={[(config.animationDelay || 0) * 10]}
                onValueChange={([value]) => onConfigChange('animationDelay', value / 10)}
                min={0}
                max={50}
                step={1}
                className="mt-2"
              />
            </div>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
};
