// Independent IoT Properties Panel - Advanced Configuration
// Full widget property management with type-specific controls

import React, { useState, useEffect } from 'react';
import { useIoTBuilder } from '../contexts/IoTBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Copy, Settings, ChevronDown, ChevronRight, Italic, Home, User, Bell, Search, File, BarChart, Calendar, Mail, ShoppingCart, Heart, Star, MapPin, Camera, Music, Video, Bookmark, Download, Upload, Share, Plus, Minus, Edit, Trash, Lock, Unlock, Eye, EyeOff, Wifi, Bluetooth, Battery, Sun, Moon, Cloud, Zap, Gift, Award, Trophy, Flag, Tag, Key, Clock, Globe, Phone, MessageCircle, HelpCircle, Info, AlertTriangle, CheckCircle, XCircle, Volume, Droplets, Wind, Type, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getWidgetSupportedEvents, type WidgetEvent, type EventTarget, type EventCommand, type EventAction, type IoTWidgetEventType } from '../types';
import { TextInputConfig } from './property-configs/TextInputConfig';
import { LabelConfig } from './property-configs/LabelConfig';
import { WebRTCViewerConfig } from './property-configs/WebRTCViewerConfig';
import { WebRTCCameraConfig } from './property-configs/WebRTCCameraConfig';
import { ThreeDViewerConfig } from './property-configs/ThreeDViewerConfig';
import { NavigatePageConfig } from './property-configs/NavigatePageConfig';
import { UrlButtonConfig } from './property-configs/UrlButtonConfig';
import { AttitudeConfig } from './property-configs/AttitudeConfig';
import { HeatmapConfig } from './property-configs/HeatmapConfig';
import { HtmlViewerConfig } from './property-configs/HtmlViewerConfig';
import { MapConfig } from './property-configs/MapConfig';
import { JoystickConfig } from './property-configs/JoystickConfig';
import { TextToSpeechConfig } from './property-configs/TextToSpeechConfig';
import { VoiceToTextConfig } from './property-configs/VoiceToTextConfig';
import { MissionPlanningMapConfig } from './property-configs/MissionPlanningMapConfig';
import { VideoPlayerConfig } from './property-configs/VideoPlayerConfig';
import { CountdownTimerConfig } from './property-configs/CountdownTimerConfig';
import { ScheduleConfig } from './property-configs/ScheduleConfig';
import { EMSpectrumConfig } from './property-configs/EMSpectrumConfig';
import { SpectralGraphConfig } from './property-configs/SpectralGraphConfig';
import { VectorPlot3DConfig } from './property-configs/VectorPlot3DConfig';
import { VirtualTwin3DConfig } from './property-configs/VirtualTwin3DConfig';
import { PaymentActionConfig } from './property-configs/PaymentActionConfig';
import { ConnectionConfig } from './property-configs/ConnectionConfig';

// Map of available icons for menu widget customization
const AVAILABLE_ICONS = {
  Home: Home,
  Settings: Settings,
  User: User,
  Bell: Bell,
  Search: Search,
  File: File,
  BarChart: BarChart,
  Calendar: Calendar,
  Mail: Mail,
  ShoppingCart: ShoppingCart,
  Heart: Heart,
  Star: Star,
  MapPin: MapPin,
  Camera: Camera,
  Music: Music,
  Video: Video,
  Bookmark: Bookmark,
  Download: Download,
  Upload: Upload,
  Share: Share,
  Plus: Plus,
  Minus: Minus,
  Edit: Edit,
  Trash: Trash,
  Lock: Lock,
  Unlock: Unlock,
  Eye: Eye,
  EyeOff: EyeOff,
  Wifi: Wifi,
  Bluetooth: Bluetooth,
  Battery: Battery,
  Sun: Sun,
  Moon: Moon,
  Cloud: Cloud,
  Zap: Zap,
  Gift: Gift,
  Award: Award,
  Trophy: Trophy,
  Flag: Flag,
  Tag: Tag,
  Key: Key,
  Clock: Clock,
  Globe: Globe,
  Phone: Phone,
  MessageCircle: MessageCircle,
  HelpCircle: HelpCircle,
  Info: Info,
  AlertTriangle: AlertTriangle,
  CheckCircle: CheckCircle,
  XCircle: XCircle,
  Volume: Volume,
  Droplets: Droplets,
  Wind: Wind
};

export const IoTPropertiesPanel: React.FC = () => {
  const { state, actions } = useIoTBuilder();
  const [activeTab, setActiveTab] = useState('general');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    layout: true,
    style: false,
    config: false,
    events: false,
  });
  const [devices, setDevices] = useState<Array<{ id: string; name: string; product_id: string }>>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [deviceCommands, setDeviceCommands] = useState<Record<string, any[]>>({});
  const [loadingCommands, setLoadingCommands] = useState<Record<string, boolean>>({});
  const [isUploadingFont, setIsUploadingFont] = useState(false);

  const selectedWidget = state.selectedWidgets.length === 1
    ? state.config?.pages
        .find(p => p.id === state.activePageId)
        ?.widgets.find(w => w.id === state.selectedWidgets[0])
    : null;

  const selectedConnection = state.selectedConnections.length === 1
    ? state.config?.pages
        .find(p => p.id === state.activePageId)
        ?.connections?.find(c => c.id === state.selectedConnections[0])
    : null;

  // Load devices when Config tab is active
  useEffect(() => {
    if (activeTab === 'config') {
      loadUserDevices();
    }
  }, [activeTab]);

  const loadUserDevices = async () => {
    setLoadingDevices(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      
      if (!user) {
        console.log('No user logged in');
        return;
      }

      const { data, error } = await supabase
        .from('user_devices')
        .select('id, device_name, product_id')
        .eq('user_id', user.id)
        .order('device_name');

      console.log('Devices query result:', { data, error, count: data?.length });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Map device_name to name for consistency
      const mappedDevices = (data || []).map(d => ({
        id: d.id,
        name: d.device_name,
        product_id: d.product_id
      }));
      
      setDevices(mappedDevices);
      console.log('Devices set in state:', mappedDevices.length);
    } catch (error) {
      console.error('Error loading devices:', error);
      setDevices([]);
    } finally {
      setLoadingDevices(false);
    }
  };

  const loadCommandsForDevice = async (deviceId: string, productId: string) => {
    // Check if already loading or loaded
    if (loadingCommands[deviceId] || deviceCommands[deviceId]) return;
    
    setLoadingCommands(prev => ({ ...prev, [deviceId]: true }));
    
    try {
      console.log(`Loading commands for device ${deviceId}, product ${productId}`);
      
      // Get product commands
      const { data: commands, error: commandsError } = await supabase
        .from('product_commands')
        .select('*')
        .eq('product_id', productId);
      
      if (commandsError) throw commandsError;
      
      const formattedCommands = [];
      
      // For each command, get its actions
      for (const command of commands || []) {
        const { data: actions, error: actionsError } = await supabase
          .from('command_actions')
          .select('*')
          .eq('command_id', command.id);
        
        if (actionsError) {
          console.error('Error fetching actions:', actionsError);
          continue;
        }
        
        const formattedActions = [];
        
        // For each action, get its parameters
        for (const action of actions || []) {
          const { data: parameters, error: paramsError } = await supabase
            .from('action_parameters')
            .select('*')
            .eq('action_id', action.id);
          
          if (paramsError) {
            console.error('Error fetching parameters:', paramsError);
            continue;
          }
          
          formattedActions.push({
            id: action.id,
            name: action.name,
            description: action.description,
            parameters: (parameters || []).map(param => ({
              id: param.id,
              name: param.name,
              description: param.description,
              type: param.type,
              required: param.required,
              default_value: param.default_value
            }))
          });
        }
        
        formattedCommands.push({
          id: command.id,
          name: command.name,
          description: command.description,
          actions: formattedActions
        });
      }
      
      console.log(`Loaded ${formattedCommands.length} commands for device ${deviceId}`);
      setDeviceCommands(prev => ({ ...prev, [deviceId]: formattedCommands }));
    } catch (error) {
      console.error('Error loading commands:', error);
      setDeviceCommands(prev => ({ ...prev, [deviceId]: [] }));
    } finally {
      setLoadingCommands(prev => ({ ...prev, [deviceId]: false }));
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePropertyChange = (property: string, value: any) => {
    if (!selectedWidget) return;
    actions.updateWidget(selectedWidget.id, { [property]: value });
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    if (!selectedWidget) return;
    // The reducer will handle updating the correct layout based on editingViewMode
    const isMobileView = state.editingViewMode === 'mobile';
    const currentSize = isMobileView && selectedWidget.mobileLayout 
      ? selectedWidget.mobileLayout.size 
      : selectedWidget.size;
    
    actions.resizeWidget(selectedWidget.id, { ...currentSize, [dimension]: value });
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    if (!selectedWidget) return;
    // The reducer will handle updating the correct layout based on editingViewMode
    const isMobileView = state.editingViewMode === 'mobile';
    const currentPosition = isMobileView && selectedWidget.mobileLayout 
      ? selectedWidget.mobileLayout.position 
      : selectedWidget.position;
    
    actions.moveWidget(selectedWidget.id, { ...currentPosition, [axis]: value });
  };

  const handleStyleChange = (styleProperty: string, value: any) => {
    if (!selectedWidget) return;
    actions.updateWidget(selectedWidget.id, {
      style: { ...selectedWidget.style, [styleProperty]: value }
    });
  };

  const handleConfigChange = (configProperty: string, value: any) => {
    if (!selectedWidget) return;
    console.log(`handleConfigChange: ${configProperty} =`, value);
    actions.updateWidget(selectedWidget.id, {
      config: { ...selectedWidget.config, [configProperty]: value }
    });
  };

  // Batch multiple config changes at once (for custom font upload)
  const handleBatchConfigChange = (updates: Record<string, any>) => {
    if (!selectedWidget) return;
    console.log('handleBatchConfigChange:', updates);
    actions.updateWidget(selectedWidget.id, {
      config: { ...selectedWidget.config, ...updates }
    });
  };

  // Handle custom font upload for button widgets
  const handleButtonFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        
        // Determine correct MIME type based on file extension
        const mimeType = fileExtension === '.woff2' ? 'font/woff2' :
                        fileExtension === '.woff' ? 'font/woff' :
                        fileExtension === '.otf' ? 'font/otf' :
                        'font/ttf';  // Default for .ttf
        
        // Replace octet-stream with correct font MIME type
        if (fontData.startsWith('data:application/octet-stream')) {
          fontData = fontData.replace('data:application/octet-stream', `data:${mimeType}`);
        }
        
        const fontFamily = `button-custom-font-${Date.now()}`;
        
        const fontUpdates = {
          buttonCustomFontData: fontData,
          buttonCustomFontName: file.name,
          buttonCustomFontFamily: fontFamily,
          buttonFontFamily: fontFamily
        };
        
        console.log('Button font upload - Setting all properties:', {
          buttonCustomFontData: `${fontData.substring(0, 50)}... (${fontData.length} chars)`,
          buttonCustomFontName: file.name,
          buttonCustomFontFamily: fontFamily,
          buttonFontFamily: fontFamily
        });
        
        // Use batch update
        handleBatchConfigChange(fontUpdates);
        
        // Give a small delay to ensure all updates are processed
        setTimeout(() => {
          toast.success('Custom font uploaded successfully', {
            description: `${file.name} is now available for button labels`
          });
          setIsUploadingFont(false);
        }, 100);
      };
      reader.onerror = () => {
        toast.error('Failed to read font file', {
          description: 'Please try again with a different file'
        });
        setIsUploadingFont(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading button font:', error);
      toast.error('Failed to upload font', {
        description: 'An unexpected error occurred'
      });
      setIsUploadingFont(false);
    }
    
    // Reset input to allow re-uploading the same file
    event.target.value = '';
  };

  const handleRemoveButtonCustomFont = () => {
    handleBatchConfigChange({
      buttonCustomFontData: undefined,
      buttonCustomFontName: undefined,
      buttonCustomFontFamily: undefined,
      buttonFontFamily: 'inherit'
    });
    
    toast.success('Custom font removed', {
      description: 'Reverted to standard font selection'
    });
  };

  // Handle custom font upload for switch widgets
  const handleSwitchFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        
        // Determine correct MIME type based on file extension
        const mimeType = fileExtension === '.woff2' ? 'font/woff2' :
                        fileExtension === '.woff' ? 'font/woff' :
                        fileExtension === '.otf' ? 'font/otf' :
                        'font/ttf';  // Default for .ttf
        
        // Replace octet-stream with correct font MIME type
        if (fontData.startsWith('data:application/octet-stream')) {
          fontData = fontData.replace('data:application/octet-stream', `data:${mimeType}`);
        }
        
        const fontFamily = `switch-custom-font-${Date.now()}`;
        
        const fontUpdates = {
          switchCustomFontData: fontData,
          switchCustomFontName: file.name,
          switchCustomFontFamily: fontFamily,
          switchFontFamily: fontFamily
        };
        
        console.log('Switch font upload - Setting all properties:', {
          switchCustomFontData: `${fontData.substring(0, 50)}... (${fontData.length} chars)`,
          switchCustomFontName: file.name,
          switchCustomFontFamily: fontFamily,
          switchFontFamily: fontFamily
        });
        
        // Use batch update
        handleBatchConfigChange(fontUpdates);
        
        // Give a small delay to ensure all updates are processed
        setTimeout(() => {
          toast.success('Custom font uploaded successfully', {
            description: `${file.name} is now available for switch labels`
          });
          setIsUploadingFont(false);
        }, 100);
      };
      reader.onerror = () => {
        toast.error('Failed to read font file', {
          description: 'Please try again with a different file'
        });
        setIsUploadingFont(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading switch font:', error);
      toast.error('Failed to upload font', {
        description: 'An unexpected error occurred'
      });
      setIsUploadingFont(false);
    }
    
    // Reset input to allow re-uploading the same file
    event.target.value = '';
  };

  const handleRemoveSwitchCustomFont = () => {
    handleBatchConfigChange({
      switchCustomFontData: undefined,
      switchCustomFontName: undefined,
      switchCustomFontFamily: undefined,
      switchFontFamily: 'inherit'
    });
    
    toast.success('Custom font removed', {
      description: 'Reverted to standard font selection'
    });
  };

  // Helper function to update custom shadow from component values
  const updateCustomShadow = () => {
    if (!selectedWidget) return;
    const offsetX = selectedWidget.style?.shadowOffsetX || 0;
    const offsetY = selectedWidget.style?.shadowOffsetY || 4;
    const blur = selectedWidget.style?.shadowBlur || 6;
    const spread = selectedWidget.style?.shadowSpread || 0;
    const color = selectedWidget.style?.shadowColor || '#000000';
    const opacity = selectedWidget.style?.shadowOpacity !== undefined ? selectedWidget.style.shadowOpacity : 0.1;
    
    // Convert hex color to rgba
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    const rgbaColor = hexToRgba(color, opacity);
    const boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${rgbaColor}`;
    
    handleStyleChange('boxShadow', boxShadow);
  };

  // Menu widget specific functions
  const toggleMenuItemVisibility = (pageId: string) => {
    if (!selectedWidget) return;
    const hiddenMenuItems = selectedWidget.config.hiddenMenuItems || [];
    let newHiddenMenuItems: string[];
    
    if (hiddenMenuItems.includes(pageId)) {
      newHiddenMenuItems = hiddenMenuItems.filter(id => id !== pageId);
    } else {
      newHiddenMenuItems = [...hiddenMenuItems, pageId];
    }
    
    handleConfigChange('hiddenMenuItems', newHiddenMenuItems);
  };

  const toggleMenuItemLabelVisibility = (pageId: string) => {
    if (!selectedWidget) return;
    const menuItemLabelVisibility = selectedWidget.config.menuItemLabelVisibility || {};
    const currentVisibility = menuItemLabelVisibility[pageId] !== false;
    
    handleConfigChange('menuItemLabelVisibility', {
      ...menuItemLabelVisibility,
      [pageId]: !currentVisibility
    });
  };

  const updateMenuItemIcon = (pageId: string, iconName: string) => {
    if (!selectedWidget) return;
    const menuItemIcons = selectedWidget.config.menuItemIcons || {};
    
    handleConfigChange('menuItemIcons', {
      ...menuItemIcons,
      [pageId]: iconName
    });
  };

  const copyWidgetId = () => {
    if (!selectedWidget) return;
    
    navigator.clipboard.writeText(selectedWidget.id)
      .then(() => {
        toast.success('Widget ID copied to clipboard');
      })
      .catch(() => {
        // Fallback for older browsers
        try {
          const textArea = document.createElement('textarea');
          textArea.value = selectedWidget.id;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          toast.success('Widget ID copied to clipboard');
        } catch (err) {
          toast.error('Failed to copy Widget ID');
        }
      });
  };

  if (!selectedWidget && !selectedConnection) {
    const currentPage = state.config?.pages.find(p => p.id === state.activePageId);
    
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Page Settings
          </CardTitle>
          {currentPage && (
            <div className="text-xs text-muted-foreground mt-1">
              {currentPage.name}
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4 space-y-4">
          {currentPage ? (
            <>
              <h4 className="text-sm font-medium">Page Background</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Customize the background appearance of this page
              </p>

              {/* Background Type Selector */}
              <div className="space-y-1">
                <Label htmlFor="backgroundType" className="text-xs">Background Type</Label>
                <Select
                  value={currentPage.layout.backgroundType || 'solid'}
                  onValueChange={(value: 'solid' | 'gradient' | 'image') => {
                    actions.updatePageLayout(currentPage.id, {
                      ...currentPage.layout,
                      backgroundType: value
                    });
                  }}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid Color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Solid Color Options */}
              {(!currentPage.layout.backgroundType || currentPage.layout.backgroundType === 'solid') && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="backgroundColor" className="text-xs">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={currentPage.layout.backgroundColor || '#ffffff'}
                        onChange={(e) => {
                          actions.updatePageLayout(currentPage.id, {
                            ...currentPage.layout,
                            backgroundColor: e.target.value
                          });
                        }}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={currentPage.layout.backgroundColor || '#ffffff'}
                        onChange={(e) => {
                          actions.updatePageLayout(currentPage.id, {
                            ...currentPage.layout,
                            backgroundColor: e.target.value
                          });
                        }}
                        placeholder="#ffffff"
                        className="h-8 flex-1 text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Gradient Options */}
              {currentPage.layout.backgroundType === 'gradient' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="gradientType" className="text-xs">Gradient Type</Label>
                    <Select
                      value={currentPage.layout.backgroundGradient?.type || 'linear'}
                      onValueChange={(value: 'linear' | 'radial') => {
                        actions.updatePageLayout(currentPage.id, {
                          ...currentPage.layout,
                          backgroundGradient: {
                            type: value,
                            angle: currentPage.layout.backgroundGradient?.angle || 90,
                            colors: currentPage.layout.backgroundGradient?.colors || [
                              { color: '#3b82f6', position: 0 },
                              { color: '#8b5cf6', position: 100 }
                            ]
                          }
                        });
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="radial">Radial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {currentPage.layout.backgroundGradient?.type === 'linear' && (
                    <div className="space-y-1">
                      <Label htmlFor="gradientAngle" className="text-xs">
                        Angle: {currentPage.layout.backgroundGradient?.angle || 90}°
                      </Label>
                      <Slider
                        value={[currentPage.layout.backgroundGradient?.angle || 90]}
                        onValueChange={([value]) => {
                          actions.updatePageLayout(currentPage.id, {
                            ...currentPage.layout,
                            backgroundGradient: {
                              ...currentPage.layout.backgroundGradient!,
                              angle: value
                            }
                          });
                        }}
                        max={360}
                        min={0}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  )}

                  {/* Gradient Color 1 */}
                  <div className="space-y-1">
                    <Label className="text-xs">Start Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={currentPage.layout.backgroundGradient?.colors?.[0]?.color || '#3b82f6'}
                        onChange={(e) => {
                          const colors = currentPage.layout.backgroundGradient?.colors || [
                            { color: '#3b82f6', position: 0 },
                            { color: '#8b5cf6', position: 100 }
                          ];
                          colors[0] = { ...colors[0], color: e.target.value };
                          actions.updatePageLayout(currentPage.id, {
                            ...currentPage.layout,
                            backgroundGradient: {
                              ...currentPage.layout.backgroundGradient!,
                              colors
                            }
                          });
                        }}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={currentPage.layout.backgroundGradient?.colors?.[0]?.color || '#3b82f6'}
                        onChange={(e) => {
                          const colors = currentPage.layout.backgroundGradient?.colors || [
                            { color: '#3b82f6', position: 0 },
                            { color: '#8b5cf6', position: 100 }
                          ];
                          colors[0] = { ...colors[0], color: e.target.value };
                          actions.updatePageLayout(currentPage.id, {
                            ...currentPage.layout,
                            backgroundGradient: {
                              ...currentPage.layout.backgroundGradient!,
                              colors
                            }
                          });
                        }}
                        placeholder="#3b82f6"
                        className="h-8 flex-1 text-sm"
                      />
                    </div>
                  </div>

                  {/* Gradient Color 2 */}
                  <div className="space-y-1">
                    <Label className="text-xs">End Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={currentPage.layout.backgroundGradient?.colors?.[1]?.color || '#8b5cf6'}
                        onChange={(e) => {
                          const colors = currentPage.layout.backgroundGradient?.colors || [
                            { color: '#3b82f6', position: 0 },
                            { color: '#8b5cf6', position: 100 }
                          ];
                          colors[1] = { ...colors[1], color: e.target.value };
                          actions.updatePageLayout(currentPage.id, {
                            ...currentPage.layout,
                            backgroundGradient: {
                              ...currentPage.layout.backgroundGradient!,
                              colors
                            }
                          });
                        }}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={currentPage.layout.backgroundGradient?.colors?.[1]?.color || '#8b5cf6'}
                        onChange={(e) => {
                          const colors = currentPage.layout.backgroundGradient?.colors || [
                            { color: '#3b82f6', position: 0 },
                            { color: '#8b5cf6', position: 100 }
                          ];
                          colors[1] = { ...colors[1], color: e.target.value };
                          actions.updatePageLayout(currentPage.id, {
                            ...currentPage.layout,
                            backgroundGradient: {
                              ...currentPage.layout.backgroundGradient!,
                              colors
                            }
                          });
                        }}
                        placeholder="#8b5cf6"
                        className="h-8 flex-1 text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Image Options */}
              {currentPage.layout.backgroundType === 'image' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="backgroundImageUrl" className="text-xs">Image URL</Label>
                    <Input
                      id="backgroundImageUrl"
                      value={currentPage.layout.backgroundImage?.url || ''}
                      onChange={(e) => {
                        actions.updatePageLayout(currentPage.id, {
                          ...currentPage.layout,
                          backgroundImage: {
                            ...currentPage.layout.backgroundImage!,
                            url: e.target.value,
                            size: currentPage.layout.backgroundImage?.size || 'cover',
                            position: currentPage.layout.backgroundImage?.position || 'center',
                            repeat: currentPage.layout.backgroundImage?.repeat || 'no-repeat',
                            opacity: currentPage.layout.backgroundImage?.opacity || 1
                          }
                        });
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="backgroundImageSize" className="text-xs">Image Size</Label>
                    <Select
                      value={currentPage.layout.backgroundImage?.size || 'cover'}
                      onValueChange={(value: 'cover' | 'contain' | 'auto' | 'custom') => {
                        actions.updatePageLayout(currentPage.id, {
                          ...currentPage.layout,
                          backgroundImage: {
                            ...currentPage.layout.backgroundImage!,
                            size: value
                          }
                        });
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover</SelectItem>
                        <SelectItem value="contain">Contain</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="custom">Custom (100%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="backgroundImagePosition" className="text-xs">Image Position</Label>
                    <Select
                      value={currentPage.layout.backgroundImage?.position || 'center'}
                      onValueChange={(value) => {
                        actions.updatePageLayout(currentPage.id, {
                          ...currentPage.layout,
                          backgroundImage: {
                            ...currentPage.layout.backgroundImage!,
                            position: value
                          }
                        });
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="top left">Top Left</SelectItem>
                        <SelectItem value="top right">Top Right</SelectItem>
                        <SelectItem value="bottom left">Bottom Left</SelectItem>
                        <SelectItem value="bottom right">Bottom Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="backgroundImageRepeat" className="text-xs">Image Repeat</Label>
                    <Select
                      value={currentPage.layout.backgroundImage?.repeat || 'no-repeat'}
                      onValueChange={(value: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y') => {
                        actions.updatePageLayout(currentPage.id, {
                          ...currentPage.layout,
                          backgroundImage: {
                            ...currentPage.layout.backgroundImage!,
                            repeat: value
                          }
                        });
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-repeat">No Repeat</SelectItem>
                        <SelectItem value="repeat">Repeat</SelectItem>
                        <SelectItem value="repeat-x">Repeat X</SelectItem>
                        <SelectItem value="repeat-y">Repeat Y</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">
                      Image Opacity: {Math.round((currentPage.layout.backgroundImage?.opacity || 1) * 100)}%
                    </Label>
                    <Slider
                      value={[currentPage.layout.backgroundImage?.opacity || 1]}
                      onValueChange={([value]) => {
                        actions.updatePageLayout(currentPage.id, {
                          ...currentPage.layout,
                          backgroundImage: {
                            ...currentPage.layout.backgroundImage!,
                            opacity: value
                          }
                        });
                      }}
                      max={1}
                      min={0}
                      step={0.05}
                      className="mt-2"
                    />
                  </div>
                </>
              )}

              <Separator />

              {/* Overall Opacity Control */}
              <div className="space-y-1">
                <Label className="text-xs">
                  Background Opacity: {Math.round((currentPage.layout.backgroundOpacity !== undefined ? currentPage.layout.backgroundOpacity : 1) * 100)}%
                </Label>
                <Slider
                  value={[currentPage.layout.backgroundOpacity !== undefined ? currentPage.layout.backgroundOpacity : 1]}
                  onValueChange={([value]) => {
                    actions.updatePageLayout(currentPage.id, {
                      ...currentPage.layout,
                      backgroundOpacity: value
                    });
                  }}
                  max={1}
                  min={0}
                  step={0.05}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground">
                  Controls overall background opacity
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No page selected
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // If a connection is selected, show connection properties
  if (selectedConnection) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Connection Properties
          </CardTitle>
          <div className="text-xs text-muted-foreground mt-1">
            {selectedConnection.id}
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                actions.deleteConnection(selectedConnection.id);
                actions.clearConnectionSelection();
              }}
              className="flex-1"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete Connection
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4">
          <ConnectionConfig
            connection={selectedConnection}
            onUpdate={(updates) => {
              actions.updateConnection(selectedConnection.id, updates);
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Widget Properties
        </CardTitle>
        <div className="text-xs text-muted-foreground mt-1">
          {selectedWidget.type} • {selectedWidget.title}
        </div>
        <div className="space-y-2 mt-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyWidgetId}
              className="p-2"
              title="Copy Widget ID"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate" title={selectedWidget.id}>
              {selectedWidget.id}
            </code>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.duplicateWidget(selectedWidget.id)}
              className="flex-1"
            >
              <Copy className="w-3 h-3 mr-1" />
              Duplicate
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => actions.deleteWidget(selectedWidget.id)}
              className="flex-1"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
          <TabsTrigger value="config" className="text-xs">Config</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="general" className="m-0 p-4 space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-medium">Title</Label>
              <Input
                id="title"
                value={selectedWidget.title}
                onChange={(e) => handlePropertyChange('title', e.target.value)}
                placeholder="Widget title"
                className="h-8 text-sm"
              />
            </div>

            {/* Layout Section */}
            <Collapsible open={expandedSections.layout} onOpenChange={() => toggleSection('layout')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                <span className="text-sm font-medium">Layout & Position</span>
                {expandedSections.layout ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                {/* Viewport Indicator */}
                <div className="bg-muted/50 border rounded-md p-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Editing: <span className="text-foreground font-semibold">
                      {state.editingViewMode === 'mobile' ? 'Mobile' : 'Desktop'} Layout
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Changes will only affect {state.editingViewMode} view
                  </p>
                </div>

                {/* Size */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="width" className="text-xs">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      value={(state.editingViewMode === 'mobile' && selectedWidget.mobileLayout) 
                        ? selectedWidget.mobileLayout.size.width 
                        : selectedWidget.size.width}
                      onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 50)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="height" className="text-xs">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      value={(state.editingViewMode === 'mobile' && selectedWidget.mobileLayout) 
                        ? selectedWidget.mobileLayout.size.height 
                        : selectedWidget.size.height}
                      onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 50)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Position */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="x" className="text-xs">X Position</Label>
                    <Input
                      id="x"
                      type="number"
                      value={(state.editingViewMode === 'mobile' && selectedWidget.mobileLayout) 
                        ? selectedWidget.mobileLayout.position.x 
                        : selectedWidget.position.x}
                      onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="y" className="text-xs">Y Position</Label>
                    <Input
                      id="y"
                      type="number"
                      value={(state.editingViewMode === 'mobile' && selectedWidget.mobileLayout) 
                        ? selectedWidget.mobileLayout.position.y 
                        : selectedWidget.position.y}
                      onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Rotation */}
                <div className="space-y-1">
                  <Label htmlFor="rotation" className="text-xs">Rotation (degrees)</Label>
                  <Input
                    id="rotation"
                    type="number"
                    value={selectedWidget.rotation || 0}
                    onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value) || 0)}
                    className="h-8 text-sm"
                    min="0"
                    max="360"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Widget Type Specific Settings */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Widget Settings</h4>
              
              {/* Common: Show Container */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showContainer" className="text-xs font-medium">Show Container Card</Label>
                  <p className="text-xs text-muted-foreground">Wrap widget in a card with padding</p>
                </div>
                <Switch
                  id="showContainer"
                  checked={selectedWidget.style?.showContainer !== false}
                  onCheckedChange={(checked) => handleStyleChange('showContainer', checked)}
                />
              </div>

              <Separator />
              
              {/* Common: Visibility */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="visible" className="text-xs font-medium">Widget Visible</Label>
                  <p className="text-xs text-muted-foreground">Show or hide this widget</p>
                </div>
                <Switch
                  id="visible"
                  checked={selectedWidget.style?.visible !== false}
                  onCheckedChange={(checked) => handleStyleChange('visible', checked)}
                />
              </div>

              <Separator />
              
              {/* Common: Show Label */}
              <div className="flex items-center justify-between">
                <Label htmlFor="showLabel" className="text-xs">Show Label</Label>
                <Switch
                  id="showLabel"
                  checked={selectedWidget.config.showLabel !== false}
                  onCheckedChange={(checked) => handleConfigChange('showLabel', checked)}
                />
              </div>

              {/* Gauge Widget */}
              {selectedWidget.type === 'gauge' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="maxValue" className="text-xs">Max Value</Label>
                    <Input
                      id="maxValue"
                      type="number"
                      value={selectedWidget.config.maxValue || 100}
                      onChange={(e) => handleConfigChange('maxValue', parseInt(e.target.value) || 100)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="unit" className="text-xs">Unit</Label>
                    <Input
                      id="unit"
                      value={selectedWidget.config.unit || ''}
                      onChange={(e) => handleConfigChange('unit', e.target.value)}
                      placeholder="e.g., %, °C, V"
                      className="h-8 text-sm"
                    />
                  </div>
                </>
              )}

              {/* Slider Widget */}
              {selectedWidget.type === 'slider' && (
                <>
                  {/* Slider Type Selection */}
                  <div className="space-y-1">
                    <Label htmlFor="sliderType" className="text-xs">Slider Type</Label>
                    <Select
                      value={selectedWidget.config.sliderType || 'linear'}
                      onValueChange={(value) => handleConfigChange('sliderType', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear Slider</SelectItem>
                        <SelectItem value="vertical">Vertical Slider</SelectItem>
                        <SelectItem value="circular">Rotary Knob (Circular)</SelectItem>
                        <SelectItem value="semiCircular">Semi-Circular Slider</SelectItem>
                        <SelectItem value="donut">Donut Ring Slider</SelectItem>
                        <SelectItem value="arc">Arc Shape Slider</SelectItem>
                        <SelectItem value="stepped">Stepped Slider</SelectItem>
                        <SelectItem value="segmented">Segmented Slider</SelectItem>
                        <SelectItem value="dualRange">Dual Range Slider</SelectItem>
                        <SelectItem value="cylindrical">3D Cylindrical Slider</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Stepped Slider Configuration */}
                  {selectedWidget.config.sliderType === 'stepped' && (
                    <div className="space-y-1">
                      <Label htmlFor="steppedCount" className="text-xs">Number of Steps: {selectedWidget.config.steppedCount || 11}</Label>
                      <Slider
                        value={[selectedWidget.config.steppedCount || 11]}
                        onValueChange={([value]) => handleConfigChange('steppedCount', value)}
                        min={2}
                        max={20}
                        step={1}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        Controls the number of step dots displayed (2-20)
                      </p>
                    </div>
                  )}

                  {/* Segmented Slider Configuration */}
                  {selectedWidget.config.sliderType === 'segmented' && (
                    <div className="space-y-1">
                      <Label htmlFor="segmentedCount" className="text-xs">Number of Segments: {selectedWidget.config.segmentedCount || 10}</Label>
                      <Slider
                        value={[selectedWidget.config.segmentedCount || 10]}
                        onValueChange={([value]) => handleConfigChange('segmentedCount', value)}
                        min={2}
                        max={20}
                        step={1}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        Controls the number of segments displayed (2-20)
                      </p>
                    </div>
                  )}

                  {/* Min/Max Values */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="minValue" className="text-xs">Min Value: {selectedWidget.config.minValue || 0}</Label>
                      <Slider
                        value={[selectedWidget.config.minValue || 0]}
                        onValueChange={([value]) => handleConfigChange('minValue', value)}
                        max={100}
                        min={0}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="maxValue" className="text-xs">Max Value: {selectedWidget.config.maxValue || 100}</Label>
                      <Slider
                        value={[selectedWidget.config.maxValue || 100]}
                        onValueChange={([value]) => handleConfigChange('maxValue', value)}
                        max={1000}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Step */}
                  <div className="space-y-1">
                    <Label htmlFor="step" className="text-xs">Step</Label>
                    <Input
                      id="step"
                      type="number"
                      value={selectedWidget.config.step || 1}
                      onChange={(e) => handleConfigChange('step', parseInt(e.target.value) || 1)}
                      className="h-8 text-sm"
                    />
                  </div>

                  {/* Unit, Prefix, Suffix */}
                  <div className="space-y-1">
                    <Label htmlFor="unit" className="text-xs">Unit</Label>
                    <Input
                      id="unit"
                      value={selectedWidget.config.unit || ''}
                      onChange={(e) => handleConfigChange('unit', e.target.value)}
                      placeholder="e.g., %, °C, RPM"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="prefix" className="text-xs">Prefix</Label>
                    <Input
                      id="prefix"
                      value={selectedWidget.config.prefix || ''}
                      onChange={(e) => handleConfigChange('prefix', e.target.value)}
                      placeholder="e.g., $, #"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="suffix" className="text-xs">Suffix</Label>
                    <Input
                      id="suffix"
                      value={selectedWidget.config.suffix || ''}
                      onChange={(e) => handleConfigChange('suffix', e.target.value)}
                      placeholder="e.g., kg, mph"
                      className="h-8 text-sm"
                    />
                  </div>

                  <Separator />

                  {/* Slider Icon */}
                  <div className="space-y-1">
                    <Label htmlFor="sliderIcon" className="text-xs">Slider Icon</Label>
                    <Select
                      value={selectedWidget.config.sliderIcon || 'Volume'}
                      onValueChange={(value) => handleConfigChange('sliderIcon', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Volume">Volume</SelectItem>
                        <SelectItem value="Wifi">Wifi</SelectItem>
                        <SelectItem value="Cloud">Cloud</SelectItem>
                        <SelectItem value="Droplets">Droplets</SelectItem>
                        <SelectItem value="Sun">Sun</SelectItem>
                        <SelectItem value="Wind">Wind</SelectItem>
                        <SelectItem value="Zap">Zap</SelectItem>
                        <SelectItem value="Battery">Battery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Slider Color */}
                  <div className="space-y-1">
                    <Label htmlFor="sliderColor" className="text-xs">Slider Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.sliderColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('sliderColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.sliderColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('sliderColor', e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Display Options */}
                  <h4 className="text-sm font-medium">Display Options</h4>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Value</Label>
                    <Switch
                      checked={selectedWidget.config.showSliderValue !== false}
                      onCheckedChange={(checked) => handleConfigChange('showSliderValue', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Input Field</Label>
                    <Switch
                      checked={selectedWidget.config.showSliderInput === true}
                      onCheckedChange={(checked) => handleConfigChange('showSliderInput', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Min/Max Values</Label>
                    <Switch
                      checked={selectedWidget.config.showSliderMinMax !== false}
                      onCheckedChange={(checked) => handleConfigChange('showSliderMinMax', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Sizing Controls */}
                  <h4 className="text-sm font-medium">Sizing Controls</h4>

                  {/* Icon Size Slider */}
                  <div className="space-y-1">
                    <Label className="text-xs">Icon Size: {selectedWidget.config.sliderIconSize || 20}px</Label>
                    <Slider
                      value={[selectedWidget.config.sliderIconSize || 20]}
                      onValueChange={([value]) => handleConfigChange('sliderIconSize', value)}
                      min={5}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  {/* Slider Width */}
                  <div className="space-y-1">
                    <Label htmlFor="sliderWidth" className="text-xs">Slider Width</Label>
                    <Select
                      value={selectedWidget.config.sliderWidth || 'full'}
                      onValueChange={(value) => handleConfigChange('sliderWidth', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Width</SelectItem>
                        <SelectItem value="narrow">Narrow (70%)</SelectItem>
                        <SelectItem value="compact">Compact (50%)</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedWidget.config.sliderWidth === 'custom' && (
                      <Input
                        value={selectedWidget.config.customSliderWidth || '300px'}
                        onChange={(e) => handleConfigChange('customSliderWidth', e.target.value)}
                        placeholder="e.g., 200px, 50%"
                        className="h-8 text-sm mt-2"
                      />
                    )}
                  </div>

                  {/* Track Height */}
                  <div className="space-y-1">
                    <Label className="text-xs">Track Height: {selectedWidget.config.sliderTrackHeight || 4}px</Label>
                    <Slider
                      value={[selectedWidget.config.sliderTrackHeight || 4]}
                      onValueChange={([value]) => handleConfigChange('sliderTrackHeight', value)}
                      min={1}
                      max={50}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  {/* Thumb Size */}
                  <div className="space-y-1">
                    <Label className="text-xs">Thumb Size: {selectedWidget.config.sliderThumbSize || 20}px</Label>
                    <Slider
                      value={[selectedWidget.config.sliderThumbSize || 20]}
                      onValueChange={([value]) => handleConfigChange('sliderThumbSize', value)}
                      min={5}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  {/* Track Border Radius */}
                  <div className="space-y-1">
                    <Label className="text-xs">Track Border Radius: {selectedWidget.config.sliderBorderRadius === 9999 ? '∞' : `${selectedWidget.config.sliderBorderRadius || 9999}px`}</Label>
                    <Slider
                      value={[selectedWidget.config.sliderBorderRadius === 9999 ? 50 : (selectedWidget.config.sliderBorderRadius || 50)]}
                      onValueChange={([value]) => handleConfigChange('sliderBorderRadius', value === 50 ? 9999 : value)}
                      min={0}
                      max={50}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <Separator />

                  {/* Container Options */}
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Container</Label>
                    <Switch
                      checked={selectedWidget.config.showSliderContainer !== false}
                      onCheckedChange={(checked) => handleConfigChange('showSliderContainer', checked)}
                    />
                  </div>
                </>
              )}

              {/* Form Widget */}
              {selectedWidget.type === 'form' && (
                <>
                  {/* Submit Button Label */}
                  <div className="space-y-1">
                    <Label htmlFor="submitLabel" className="text-xs">Submit Button Label</Label>
                    <Input
                      id="submitLabel"
                      value={selectedWidget.config.submitLabel || 'Submit'}
                      onChange={(e) => handleConfigChange('submitLabel', e.target.value)}
                      placeholder="Submit"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Reset After Submit</Label>
                    <Switch
                      checked={selectedWidget.config.resetAfterSubmit !== false}
                      onCheckedChange={(checked) => handleConfigChange('resetAfterSubmit', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Form Container</Label>
                    <Switch
                      checked={selectedWidget.config.showFormContainer !== false}
                      onCheckedChange={(checked) => handleConfigChange('showFormContainer', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Form Container Styling */}
                  <h4 className="text-sm font-medium">Form Container</h4>

                  <div className="space-y-1">
                    <Label htmlFor="formBackgroundColor" className="text-xs">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.formBackgroundColor || '#ffffff'}
                        onChange={(e) => handleConfigChange('formBackgroundColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.formBackgroundColor || '#ffffff'}
                        onChange={(e) => handleConfigChange('formBackgroundColor', e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="formTextColor" className="text-xs">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.formTextColor || '#000000'}
                        onChange={(e) => handleConfigChange('formTextColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.formTextColor || '#000000'}
                        onChange={(e) => handleConfigChange('formTextColor', e.target.value)}
                        placeholder="#000000"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="formBorderColor" className="text-xs">Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.formBorderColor || '#e2e8f0'}
                        onChange={(e) => handleConfigChange('formBorderColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.formBorderColor || '#e2e8f0'}
                        onChange={(e) => handleConfigChange('formBorderColor', e.target.value)}
                        placeholder="#e2e8f0"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Border Width: {selectedWidget.config.formBorderWidth || 1}px</Label>
                    <Slider
                      value={[selectedWidget.config.formBorderWidth || 1]}
                      onValueChange={([value]) => handleConfigChange('formBorderWidth', value)}
                      max={10}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Border Radius: {selectedWidget.config.formBorderRadius || 6}px</Label>
                    <Slider
                      value={[selectedWidget.config.formBorderRadius || 6]}
                      onValueChange={([value]) => handleConfigChange('formBorderRadius', value)}
                      max={20}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="formPadding" className="text-xs">Padding</Label>
                    <Input
                      id="formPadding"
                      value={selectedWidget.config.formPadding || '16px'}
                      onChange={(e) => handleConfigChange('formPadding', e.target.value)}
                      placeholder="e.g., 16px, 1rem"
                      className="h-8 text-sm"
                    />
                  </div>

                  <Separator />

                  {/* Label Styling */}
                  <h4 className="text-sm font-medium">Labels</h4>

                  <div className="space-y-1">
                    <Label htmlFor="labelFontFamily" className="text-xs">Font Family</Label>
                    <Select
                      value={selectedWidget.config.labelFontFamily || 'inherit'}
                      onValueChange={(value) => handleConfigChange('labelFontFamily', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inherit">Default</SelectItem>
                        <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                        <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                        <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                        <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="labelFontSize" className="text-xs">Font Size</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="labelFontSize"
                        type="number"
                        value={selectedWidget.config.labelFontSize ? parseInt(selectedWidget.config.labelFontSize) : 14}
                        onChange={(e) => handleConfigChange('labelFontSize', `${e.target.value}px`)}
                        className="h-8 text-sm w-20"
                        min="8"
                        max="32"
                      />
                      <span className="text-xs">px</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="labelFontWeight" className="text-xs">Font Weight</Label>
                    <Select
                      value={selectedWidget.config.labelFontWeight || 'normal'}
                      onValueChange={(value) => handleConfigChange('labelFontWeight', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="lighter">Lighter</SelectItem>
                        <SelectItem value="bolder">Bolder</SelectItem>
                        <SelectItem value="100">100 (Thin)</SelectItem>
                        <SelectItem value="200">200 (Extra Light)</SelectItem>
                        <SelectItem value="300">300 (Light)</SelectItem>
                        <SelectItem value="400">400 (Normal)</SelectItem>
                        <SelectItem value="500">500 (Medium)</SelectItem>
                        <SelectItem value="600">600 (Semi Bold)</SelectItem>
                        <SelectItem value="700">700 (Bold)</SelectItem>
                        <SelectItem value="800">800 (Extra Bold)</SelectItem>
                        <SelectItem value="900">900 (Black)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="labelTextColor" className="text-xs">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.labelTextColor || '#000000'}
                        onChange={(e) => handleConfigChange('labelTextColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.labelTextColor || '#000000'}
                        onChange={(e) => handleConfigChange('labelTextColor', e.target.value)}
                        placeholder="#000000"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="labelBackgroundColor" className="text-xs">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.labelBackgroundColor || 'transparent'}
                        onChange={(e) => handleConfigChange('labelBackgroundColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.labelBackgroundColor || 'transparent'}
                        onChange={(e) => handleConfigChange('labelBackgroundColor', e.target.value)}
                        placeholder="transparent"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-xs">
                      <Italic className="w-4 h-4" />
                      Italic
                    </Label>
                    <Switch
                      checked={selectedWidget.config.labelFontStyle === 'italic'}
                      onCheckedChange={(checked) => handleConfigChange('labelFontStyle', checked ? 'italic' : 'normal')}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="labelMarginBottom" className="text-xs">Margin Bottom</Label>
                    <Input
                      id="labelMarginBottom"
                      value={selectedWidget.config.labelMarginBottom || '0.5rem'}
                      onChange={(e) => handleConfigChange('labelMarginBottom', e.target.value)}
                      placeholder="e.g., 0.5rem, 8px"
                      className="h-8 text-sm"
                    />
                  </div>

                  <Separator />

                  {/* Layout Options */}
                  <h4 className="text-sm font-medium">Layout Options</h4>

                  <div className="space-y-1">
                    <Label htmlFor="formLayout" className="text-xs">Form Direction</Label>
                    <Select
                      value={selectedWidget.config.formLayout || 'vertical'}
                      onValueChange={(value) => handleConfigChange('formLayout', value)}
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

                  <div className="space-y-1">
                    <Label className="text-xs">Field Spacing: {selectedWidget.config.fieldSpacing || 16}px</Label>
                    <Slider
                      value={[selectedWidget.config.fieldSpacing || 16]}
                      onValueChange={([value]) => handleConfigChange('fieldSpacing', value)}
                      max={40}
                      min={0}
                      step={4}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="formAlignment" className="text-xs">Form Alignment</Label>
                    <Select
                      value={selectedWidget.config.formAlignment || 'left'}
                      onValueChange={(value) => handleConfigChange('formAlignment', value)}
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

                  <Separator />

                  {/* Form Fields Management */}
                  <h4 className="text-sm font-medium">Form Fields Management</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Add and configure form fields
                  </p>

                  {/* Current Fields List */}
                  {selectedWidget.config.formFields && selectedWidget.config.formFields.length > 0 && (
                    <div className="space-y-2 border rounded-md p-3 bg-muted/30 mb-2">
                      {selectedWidget.config.formFields.map((field: any, index: number) => (
                        <div key={field.id || index} className="flex items-center justify-between p-2 bg-background rounded border">
                          <div className="flex-1">
                            <div className="text-xs font-medium">{field.label || 'Unnamed Field'}</div>
                            <div className="text-xs text-muted-foreground">
                              Type: {field.type} {field.required && '(Required)'}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                const fields = [...(selectedWidget.config.formFields || [])];
                                fields.splice(index, 1);
                                handleConfigChange('formFields', fields);
                              }}
                            >
                              <Trash className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Field Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs"
                    onClick={() => {
                      const newField = {
                        id: `field_${Date.now()}`,
                        type: 'text',
                        label: 'New Field',
                        placeholder: '',
                        required: false,
                        defaultValue: ''
                      };
                      const fields = [...(selectedWidget.config.formFields || []), newField];
                      handleConfigChange('formFields', fields);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Field
                  </Button>

                  {/* Field Editor - Edit selected field */}
                  {selectedWidget.config.formFields && selectedWidget.config.formFields.length > 0 && (
                    <>
                      <Separator className="my-3" />
                      <h4 className="text-sm font-medium mb-2">Edit Field</h4>
                      
                      {/* Field Selector */}
                      <div className="space-y-1 mb-3">
                        <Label className="text-xs">Select Field to Edit</Label>
                        <Select
                          value={selectedWidget.config._selectedFieldIndex?.toString() || '0'}
                          onValueChange={(value) => handleConfigChange('_selectedFieldIndex', parseInt(value))}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedWidget.config.formFields.map((field: any, index: number) => (
                              <SelectItem key={index} value={index.toString()}>
                                {field.label || `Field ${index + 1}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {(() => {
                        const fieldIndex = selectedWidget.config._selectedFieldIndex || 0;
                        const currentField = selectedWidget.config.formFields[fieldIndex];
                        
                        const updateField = (property: string, value: any) => {
                          const fields = [...selectedWidget.config.formFields];
                          fields[fieldIndex] = { ...fields[fieldIndex], [property]: value };
                          handleConfigChange('formFields', fields);
                        };

                        return currentField ? (
                          <div className="space-y-2 p-3 border rounded-md bg-muted/20">
                            {/* Field Label */}
                            <div className="space-y-1">
                              <Label className="text-xs">Field Label</Label>
                              <Input
                                value={currentField.label || ''}
                                onChange={(e) => updateField('label', e.target.value)}
                                placeholder="Enter field label"
                                className="h-8 text-sm"
                              />
                            </div>

                            {/* Field Type */}
                            <div className="space-y-1">
                              <Label className="text-xs">Field Type</Label>
                              <Select
                                value={currentField.type || 'text'}
                                onValueChange={(value) => updateField('type', value)}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="password">Password</SelectItem>
                                  <SelectItem value="textarea">Textarea</SelectItem>
                                  <SelectItem value="select">Select Dropdown</SelectItem>
                                  <SelectItem value="checkbox">Checkbox</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Placeholder */}
                            <div className="space-y-1">
                              <Label className="text-xs">Placeholder</Label>
                              <Input
                                value={currentField.placeholder || ''}
                                onChange={(e) => updateField('placeholder', e.target.value)}
                                placeholder="Enter placeholder text"
                                className="h-8 text-sm"
                              />
                            </div>

                            {/* Default Value */}
                            <div className="space-y-1">
                              <Label className="text-xs">Default Value</Label>
                              <Input
                                value={currentField.defaultValue || ''}
                                onChange={(e) => updateField('defaultValue', e.target.value)}
                                placeholder="Enter default value"
                                className="h-8 text-sm"
                              />
                            </div>

                            {/* Required Toggle */}
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Required Field</Label>
                              <Switch
                                checked={currentField.required || false}
                                onCheckedChange={(checked) => updateField('required', checked)}
                              />
                            </div>

                            {/* Validation Rules for Text */}
                            {(currentField.type === 'text' || currentField.type === 'textarea') && (
                              <>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Min Length</Label>
                                    <Input
                                      type="number"
                                      value={currentField.validation?.minLength || ''}
                                      onChange={(e) => updateField('validation', {
                                        ...currentField.validation,
                                        minLength: parseInt(e.target.value) || undefined
                                      })}
                                      placeholder="0"
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Max Length</Label>
                                    <Input
                                      type="number"
                                      value={currentField.validation?.maxLength || ''}
                                      onChange={(e) => updateField('validation', {
                                        ...currentField.validation,
                                        maxLength: parseInt(e.target.value) || undefined
                                      })}
                                      placeholder="∞"
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Validation Rules for Number */}
                            {currentField.type === 'number' && (
                              <>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Min Value</Label>
                                    <Input
                                      type="number"
                                      value={currentField.validation?.min || ''}
                                      onChange={(e) => updateField('validation', {
                                        ...currentField.validation,
                                        min: parseFloat(e.target.value) || undefined
                                      })}
                                      placeholder="-∞"
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Max Value</Label>
                                    <Input
                                      type="number"
                                      value={currentField.validation?.max || ''}
                                      onChange={(e) => updateField('validation', {
                                        ...currentField.validation,
                                        max: parseFloat(e.target.value) || undefined
                                      })}
                                      placeholder="∞"
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Options for Select/Checkbox */}
                            {(currentField.type === 'select' || currentField.type === 'checkbox') && (
                              <>
                                <div className="space-y-1">
                                  <Label className="text-xs">Options (one per line)</Label>
                                  <Textarea
                                    value={(currentField.options || []).map((opt: any) => `${opt.value}:${opt.label}`).join('\n')}
                                    onChange={(e) => {
                                      const lines = e.target.value.split('\n').filter(line => line.trim());
                                      const options = lines.map(line => {
                                        const [value, label] = line.split(':').map(s => s.trim());
                                        return {
                                          value: value || label || '',
                                          label: label || value || ''
                                        };
                                      });
                                      updateField('options', options);
                                    }}
                                    placeholder="value:Label\nvalue2:Label 2"
                                    className="h-20 text-xs font-mono"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Format: value:Label (e.g., us:United States)
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        ) : null;
                      })()}
                    </>
                  )}

                  <Separator />

                  {/* Field Styling */}
                  <h4 className="text-sm font-medium">Form Fields</h4>

                  <div className="space-y-1">
                    <Label htmlFor="fieldFontFamily" className="text-xs">Font Family</Label>
                    <Select
                      value={selectedWidget.config.fieldFontFamily || 'inherit'}
                      onValueChange={(value) => handleConfigChange('fieldFontFamily', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inherit">Default</SelectItem>
                        <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                        <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                        <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                        <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="fieldFontSize" className="text-xs">Font Size</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="fieldFontSize"
                        type="number"
                        value={selectedWidget.config.fieldFontSize ? parseInt(selectedWidget.config.fieldFontSize) : 14}
                        onChange={(e) => handleConfigChange('fieldFontSize', `${e.target.value}px`)}
                        className="h-8 text-sm w-20"
                        min="8"
                        max="32"
                      />
                      <span className="text-xs">px</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="fieldFontWeight" className="text-xs">Font Weight</Label>
                    <Select
                      value={selectedWidget.config.fieldFontWeight || 'normal'}
                      onValueChange={(value) => handleConfigChange('fieldFontWeight', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="lighter">Lighter</SelectItem>
                        <SelectItem value="bolder">Bolder</SelectItem>
                        <SelectItem value="100">100 (Thin)</SelectItem>
                        <SelectItem value="200">200 (Extra Light)</SelectItem>
                        <SelectItem value="300">300 (Light)</SelectItem>
                        <SelectItem value="400">400 (Normal)</SelectItem>
                        <SelectItem value="500">500 (Medium)</SelectItem>
                        <SelectItem value="600">600 (Semi Bold)</SelectItem>
                        <SelectItem value="700">700 (Bold)</SelectItem>
                        <SelectItem value="800">800 (Extra Bold)</SelectItem>
                        <SelectItem value="900">900 (Black)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="fieldBackgroundColor" className="text-xs">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.fieldBackgroundColor || '#ffffff'}
                        onChange={(e) => handleConfigChange('fieldBackgroundColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.fieldBackgroundColor || '#ffffff'}
                        onChange={(e) => handleConfigChange('fieldBackgroundColor', e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="fieldTextColor" className="text-xs">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.fieldTextColor || '#000000'}
                        onChange={(e) => handleConfigChange('fieldTextColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.fieldTextColor || '#000000'}
                        onChange={(e) => handleConfigChange('fieldTextColor', e.target.value)}
                        placeholder="#000000"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="fieldPlaceholderColor" className="text-xs">Placeholder Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.fieldPlaceholderColor || '#94a3b8'}
                        onChange={(e) => handleConfigChange('fieldPlaceholderColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.fieldPlaceholderColor || '#94a3b8'}
                        onChange={(e) => handleConfigChange('fieldPlaceholderColor', e.target.value)}
                        placeholder="#94a3b8"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="fieldBorderColor" className="text-xs">Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.fieldBorderColor || '#e2e8f0'}
                        onChange={(e) => handleConfigChange('fieldBorderColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.fieldBorderColor || '#e2e8f0'}
                        onChange={(e) => handleConfigChange('fieldBorderColor', e.target.value)}
                        placeholder="#e2e8f0"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="fieldFocusBorderColor" className="text-xs">Focus Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.fieldFocusBorderColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('fieldFocusBorderColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.fieldFocusBorderColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('fieldFocusBorderColor', e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="fieldErrorBorderColor" className="text-xs">Error Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.fieldErrorBorderColor || '#ef4444'}
                        onChange={(e) => handleConfigChange('fieldErrorBorderColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.fieldErrorBorderColor || '#ef4444'}
                        onChange={(e) => handleConfigChange('fieldErrorBorderColor', e.target.value)}
                        placeholder="#ef4444"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Border Width: {selectedWidget.config.fieldBorderWidth || 1}px</Label>
                    <Slider
                      value={[selectedWidget.config.fieldBorderWidth || 1]}
                      onValueChange={([value]) => handleConfigChange('fieldBorderWidth', value)}
                      max={5}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Border Radius: {selectedWidget.config.fieldBorderRadius || 4}px</Label>
                    <Slider
                      value={[selectedWidget.config.fieldBorderRadius || 4]}
                      onValueChange={([value]) => handleConfigChange('fieldBorderRadius', value)}
                      max={20}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="fieldPadding" className="text-xs">Padding</Label>
                    <Input
                      id="fieldPadding"
                      value={selectedWidget.config.fieldPadding || '8px 12px'}
                      onChange={(e) => handleConfigChange('fieldPadding', e.target.value)}
                      placeholder="e.g., 8px 12px"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="fieldHeight" className="text-xs">Height</Label>
                    <Input
                      id="fieldHeight"
                      value={selectedWidget.config.fieldHeight || 'auto'}
                      onChange={(e) => handleConfigChange('fieldHeight', e.target.value)}
                      placeholder="e.g., auto, 40px, 2.5rem"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="fieldMarginBottom" className="text-xs">Margin Bottom</Label>
                    <Input
                      id="fieldMarginBottom"
                      value={selectedWidget.config.fieldMarginBottom || '1rem'}
                      onChange={(e) => handleConfigChange('fieldMarginBottom', e.target.value)}
                      placeholder="e.g., 1rem, 16px"
                      className="h-8 text-sm"
                    />
                  </div>

                  <Separator />

                  {/* Button Styling */}
                  <h4 className="text-sm font-medium">Buttons</h4>

                  <div className="space-y-1">
                    <Label htmlFor="buttonFontFamily" className="text-xs">Font Family</Label>
                    <Select
                      value={selectedWidget.config.buttonFontFamily || 'inherit'}
                      onValueChange={(value) => handleConfigChange('buttonFontFamily', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inherit">Default</SelectItem>
                        <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                        <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                        <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                        <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="buttonFontSize" className="text-xs">Font Size</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="buttonFontSize"
                        type="number"
                        value={selectedWidget.config.buttonFontSize ? parseInt(selectedWidget.config.buttonFontSize) : 14}
                        onChange={(e) => handleConfigChange('buttonFontSize', `${e.target.value}px`)}
                        className="h-8 text-sm w-20"
                        min="8"
                        max="32"
                      />
                      <span className="text-xs">px</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="buttonFontWeight" className="text-xs">Font Weight</Label>
                    <Select
                      value={selectedWidget.config.buttonFontWeight || 'normal'}
                      onValueChange={(value) => handleConfigChange('buttonFontWeight', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="lighter">Lighter</SelectItem>
                        <SelectItem value="bolder">Bolder</SelectItem>
                        <SelectItem value="100">100 (Thin)</SelectItem>
                        <SelectItem value="200">200 (Extra Light)</SelectItem>
                        <SelectItem value="300">300 (Light)</SelectItem>
                        <SelectItem value="400">400 (Normal)</SelectItem>
                        <SelectItem value="500">500 (Medium)</SelectItem>
                        <SelectItem value="600">600 (Semi Bold)</SelectItem>
                        <SelectItem value="700">700 (Bold)</SelectItem>
                        <SelectItem value="800">800 (Extra Bold)</SelectItem>
                        <SelectItem value="900">900 (Black)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="buttonBackgroundColor" className="text-xs">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.buttonBackgroundColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('buttonBackgroundColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.buttonBackgroundColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('buttonBackgroundColor', e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="buttonTextColor" className="text-xs">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.buttonTextColor || '#ffffff'}
                        onChange={(e) => handleConfigChange('buttonTextColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.buttonTextColor || '#ffffff'}
                        onChange={(e) => handleConfigChange('buttonTextColor', e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="buttonBorderColor" className="text-xs">Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.buttonBorderColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('buttonBorderColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.buttonBorderColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('buttonBorderColor', e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Border Width: {parseInt((selectedWidget.config.buttonBorderWidth || '1px').toString().replace('px', ''))}px</Label>
                    <Slider
                      value={[parseInt((selectedWidget.config.buttonBorderWidth || '1px').toString().replace('px', ''))]}
                      onValueChange={([value]) => handleConfigChange('buttonBorderWidth', `${value}px`)}
                      max={5}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Border Radius: {Number(selectedWidget.config.buttonBorderRadius) || 6}px</Label>
                    <Slider
                      value={[Number(selectedWidget.config.buttonBorderRadius) || 6]}
                      onValueChange={([value]) => handleConfigChange('buttonBorderRadius', value)}
                      max={20}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="buttonPadding" className="text-xs">Padding</Label>
                    <Input
                      id="buttonPadding"
                      value={selectedWidget.config.buttonPadding || '0.5rem 1rem'}
                      onChange={(e) => handleConfigChange('buttonPadding', e.target.value)}
                      placeholder="e.g., 0.5rem 1rem"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="buttonHeight" className="text-xs">Height</Label>
                    <Input
                      id="buttonHeight"
                      value={selectedWidget.config.buttonHeight || 'auto'}
                      onChange={(e) => handleConfigChange('buttonHeight', e.target.value)}
                      placeholder="e.g., auto, 40px, 2.5rem"
                      className="h-8 text-sm"
                    />
                  </div>
                </>
              )}

              {/* Color Picker Widget */}
              {selectedWidget.type === 'color-picker' && (
                <>
                  <h4 className="text-sm font-medium">Color Picker Configuration</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Configure color selection widget settings
                  </p>

                  {/* Default Color */}
                  <div className="space-y-1">
                    <Label htmlFor="defaultColor" className="text-xs">Default Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.defaultColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('defaultColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.defaultColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('defaultColor', e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Color Picker Type */}
                  <h4 className="text-sm font-medium">Picker Type & Style</h4>

                  <div className="space-y-1">
                    <Label htmlFor="colorPickerType" className="text-xs">Picker Type</Label>
                    <Select
                      value={selectedWidget.config.colorPickerType || 'default'}
                      onValueChange={(value) => handleConfigChange('colorPickerType', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default (Square)</SelectItem>
                        <SelectItem value="circular">Circular</SelectItem>
                        <SelectItem value="wheel">Color Wheel</SelectItem>
                        <SelectItem value="gradient">Gradient Bar</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="colorPickerSize" className="text-xs">Picker Size</Label>
                    <Select
                      value={selectedWidget.config.colorPickerSize || 'md'}
                      onValueChange={(value) => handleConfigChange('colorPickerSize', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xs">Extra Small</SelectItem>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="md">Medium</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                        <SelectItem value="xl">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Display Options */}
                  <h4 className="text-sm font-medium">Display Options</h4>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Color Value</Label>
                    <Switch
                      checked={selectedWidget.config.showColorValue !== false}
                      onCheckedChange={(checked) => handleConfigChange('showColorValue', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Color Preview</Label>
                    <Switch
                      checked={selectedWidget.config.showColorPreview !== false}
                      onCheckedChange={(checked) => handleConfigChange('showColorPreview', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Hex Input</Label>
                    <Switch
                      checked={selectedWidget.config.showHexInput !== false}
                      onCheckedChange={(checked) => handleConfigChange('showHexInput', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show RGB Sliders</Label>
                    <Switch
                      checked={selectedWidget.config.showRgbSliders || false}
                      onCheckedChange={(checked) => handleConfigChange('showRgbSliders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show HSL Sliders</Label>
                    <Switch
                      checked={selectedWidget.config.showHslSliders || false}
                      onCheckedChange={(checked) => handleConfigChange('showHslSliders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Preset Colors</Label>
                    <Switch
                      checked={selectedWidget.config.showPresetColors !== false}
                      onCheckedChange={(checked) => handleConfigChange('showPresetColors', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Eyedropper</Label>
                    <Switch
                      checked={selectedWidget.config.showEyedropper || false}
                      onCheckedChange={(checked) => handleConfigChange('showEyedropper', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Color Format & Validation */}
                  <h4 className="text-sm font-medium">Color Format & Validation</h4>

                  <div className="space-y-1">
                    <Label htmlFor="colorFormat" className="text-xs">Output Format</Label>
                    <Select
                      value={selectedWidget.config.colorFormat || 'hex'}
                      onValueChange={(value) => handleConfigChange('colorFormat', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hex">HEX (#RRGGBB)</SelectItem>
                        <SelectItem value="rgb">RGB (r, g, b)</SelectItem>
                        <SelectItem value="rgba">RGBA (r, g, b, a)</SelectItem>
                        <SelectItem value="hsl">HSL (h, s, l)</SelectItem>
                        <SelectItem value="hsla">HSLA (h, s, l, a)</SelectItem>
                        <SelectItem value="hsv">HSV (h, s, v)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Allow Alpha/Opacity</Label>
                    <Switch
                      checked={selectedWidget.config.allowAlpha || false}
                      onCheckedChange={(checked) => handleConfigChange('allowAlpha', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Validate Hex Format</Label>
                    <Switch
                      checked={selectedWidget.config.validateHex !== false}
                      onCheckedChange={(checked) => handleConfigChange('validateHex', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Preset Colors Configuration */}
                  {selectedWidget.config.showPresetColors !== false && (
                    <>
                      <h4 className="text-sm font-medium">Preset Colors</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        Enter preset colors (one per line)
                      </p>

                      <div className="space-y-1">
                        <Label htmlFor="presetColors" className="text-xs">Color Presets (Hex format)</Label>
                        <Textarea
                          id="presetColors"
                          value={(selectedWidget.config.presetColors || [
                            '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
                            '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
                            '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
                            '#ec4899', '#f43f5e', '#000000', '#ffffff', '#64748b'
                          ]).join('\n')}
                          onChange={(e) => {
                            const colors = e.target.value.split('\n').filter(c => c.trim()).map(c => c.trim());
                            handleConfigChange('presetColors', colors);
                          }}
                          placeholder="#ff0000\n#00ff00\n#0000ff"
                          className="h-32 text-xs font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                          Format: One hex color per line (e.g., #ff0000)
                        </p>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Preset Grid Columns: {selectedWidget.config.presetGridColumns || 5}</Label>
                        <Slider
                          value={[selectedWidget.config.presetGridColumns || 5]}
                          onValueChange={([value]) => handleConfigChange('presetGridColumns', value)}
                          max={10}
                          min={3}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Preset Color Size: {selectedWidget.config.presetColorSize || 32}px</Label>
                        <Slider
                          value={[selectedWidget.config.presetColorSize || 32]}
                          onValueChange={([value]) => handleConfigChange('presetColorSize', value)}
                          max={64}
                          min={16}
                          step={4}
                          className="mt-2"
                        />
                      </div>

                      <Separator />
                    </>
                  )}

                  {/* Layout Configuration */}
                  <h4 className="text-sm font-medium">Layout Configuration</h4>

                  <div className="space-y-1">
                    <Label htmlFor="pickerOrientation" className="text-xs">Picker Orientation</Label>
                    <Select
                      value={selectedWidget.config.pickerOrientation || 'vertical'}
                      onValueChange={(value) => handleConfigChange('pickerOrientation', value)}
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

                  <div className="space-y-1">
                    <Label htmlFor="componentArrangement" className="text-xs">Component Arrangement</Label>
                    <Select
                      value={selectedWidget.config.componentArrangement || 'default'}
                      onValueChange={(value) => handleConfigChange('componentArrangement', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="expanded">Expanded</SelectItem>
                        <SelectItem value="stacked">Stacked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Component Spacing: {selectedWidget.config.componentSpacing || 12}px</Label>
                    <Slider
                      value={[selectedWidget.config.componentSpacing || 12]}
                      onValueChange={([value]) => handleConfigChange('componentSpacing', value)}
                      max={40}
                      min={0}
                      step={4}
                      className="mt-2"
                    />
                  </div>

                  <Separator />

                  {/* Container & Styling */}
                  <h4 className="text-sm font-medium">Container & Styling</h4>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Container</Label>
                    <Switch
                      checked={selectedWidget.config.showColorContainer !== false}
                      onCheckedChange={(checked) => handleConfigChange('showColorContainer', checked)}
                    />
                  </div>

                  {selectedWidget.config.showColorContainer !== false && (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor="containerBackgroundColor" className="text-xs">Container Background</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={selectedWidget.config.containerBackgroundColor || '#ffffff'}
                            onChange={(e) => handleConfigChange('containerBackgroundColor', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            value={selectedWidget.config.containerBackgroundColor || '#ffffff'}
                            onChange={(e) => handleConfigChange('containerBackgroundColor', e.target.value)}
                            placeholder="#ffffff"
                            className="flex-1 h-8 text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="containerBorderColor" className="text-xs">Container Border Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={selectedWidget.config.containerBorderColor || '#e2e8f0'}
                            onChange={(e) => handleConfigChange('containerBorderColor', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            value={selectedWidget.config.containerBorderColor || '#e2e8f0'}
                            onChange={(e) => handleConfigChange('containerBorderColor', e.target.value)}
                            placeholder="#e2e8f0"
                            className="flex-1 h-8 text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Container Border Width: {selectedWidget.config.containerBorderWidth || 1}px</Label>
                        <Slider
                          value={[selectedWidget.config.containerBorderWidth || 1]}
                          onValueChange={([value]) => handleConfigChange('containerBorderWidth', value)}
                          max={10}
                          min={0}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Container Border Radius: {selectedWidget.config.containerBorderRadius || 8}px</Label>
                        <Slider
                          value={[selectedWidget.config.containerBorderRadius || 8]}
                          onValueChange={([value]) => handleConfigChange('containerBorderRadius', value)}
                          max={24}
                          min={0}
                          step={2}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="containerPadding" className="text-xs">Container Padding</Label>
                        <Input
                          id="containerPadding"
                          value={selectedWidget.config.containerPadding || '16px'}
                          onChange={(e) => handleConfigChange('containerPadding', e.target.value)}
                          placeholder="e.g., 16px, 1rem"
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Container Shadow</Label>
                        <Switch
                          checked={selectedWidget.config.containerShadow || false}
                          onCheckedChange={(checked) => handleConfigChange('containerShadow', checked)}
                        />
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Advanced Customization */}
                  <h4 className="text-sm font-medium">Advanced Customization</h4>

                  <div className="space-y-1">
                    <Label htmlFor="pickerLabel" className="text-xs">Picker Label</Label>
                    <Input
                      id="pickerLabel"
                      value={selectedWidget.config.pickerLabel || ''}
                      onChange={(e) => handleConfigChange('pickerLabel', e.target.value)}
                      placeholder="e.g., Choose Color"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Label Above Picker</Label>
                    <Switch
                      checked={selectedWidget.config.showLabelAbove !== false}
                      onCheckedChange={(checked) => handleConfigChange('showLabelAbove', checked)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Label Font Size: {selectedWidget.config.labelFontSize || 14}px</Label>
                    <Slider
                      value={[selectedWidget.config.labelFontSize || 14]}
                      onValueChange={([value]) => handleConfigChange('labelFontSize', value)}
                      max={24}
                      min={10}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="labelFontWeight" className="text-xs">Label Font Weight</Label>
                    <Select
                      value={selectedWidget.config.labelFontWeight || 'normal'}
                      onValueChange={(value) => handleConfigChange('labelFontWeight', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="500">Medium (500)</SelectItem>
                        <SelectItem value="600">Semi Bold (600)</SelectItem>
                        <SelectItem value="700">Bold (700)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="labelColor" className="text-xs">Label Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.labelColor || '#000000'}
                        onChange={(e) => handleConfigChange('labelColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.labelColor || '#000000'}
                        onChange={(e) => handleConfigChange('labelColor', e.target.value)}
                        placeholder="#000000"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Disabled State</Label>
                    <Switch
                      checked={selectedWidget.config.disabled || false}
                      onCheckedChange={(checked) => handleConfigChange('disabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Read Only Mode</Label>
                    <Switch
                      checked={selectedWidget.config.readOnly || false}
                      onCheckedChange={(checked) => handleConfigChange('readOnly', checked)}
                    />
                  </div>
                </>
              )}

              {/* Gauge Widget */}
              {selectedWidget.type === 'gauge' && (
                <>
                  <h4 className="text-sm font-medium">Gauge Configuration</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Configure gauge display settings and appearance
                  </p>

                  {/* Gauge Type Selection */}
                  <div className="space-y-1">
                    <Label htmlFor="gaugeType" className="text-xs">Gauge Type</Label>
                    <Select
                      value={selectedWidget.config.gaugeType || 'linear'}
                      onValueChange={(value) => handleConfigChange('gaugeType', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear Progress</SelectItem>
                        <SelectItem value="circular">Circular Gauge</SelectItem>
                        <SelectItem value="semiCircular">Semi-Circular</SelectItem>
                        <SelectItem value="donut">Donut Chart</SelectItem>
                        <SelectItem value="arc">Arc Gauge</SelectItem>
                        <SelectItem value="thermometer">Thermometer</SelectItem>
                        <SelectItem value="digital">Digital Display</SelectItem>
                        <SelectItem value="segmented">Segmented Bar</SelectItem>
                        <SelectItem value="dial">Dial/Needle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Value Range */}
                  <h4 className="text-sm font-medium">Value Range</h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Min Value: {selectedWidget.config.min || 0}</Label>
                      <Slider
                        value={[selectedWidget.config.min || 0]}
                        onValueChange={([value]) => handleConfigChange('min', value)}
                        max={100}
                        min={0}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max Value: {selectedWidget.config.max || 100}</Label>
                      <Slider
                        value={[selectedWidget.config.max || 100]}
                        onValueChange={([value]) => handleConfigChange('max', value)}
                        max={1000}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Labels & Units */}
                  <h4 className="text-sm font-medium">Labels & Units</h4>

                  <div className="space-y-1">
                    <Label htmlFor="gaugeUnit" className="text-xs">Unit</Label>
                    <Input
                      id="gaugeUnit"
                      value={selectedWidget.config.unit || ''}
                      onChange={(e) => handleConfigChange('unit', e.target.value)}
                      placeholder="e.g., %, °C, RPM, km/h"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="gaugePrefix" className="text-xs">Prefix</Label>
                    <Input
                      id="gaugePrefix"
                      value={selectedWidget.config.prefix || ''}
                      onChange={(e) => handleConfigChange('prefix', e.target.value)}
                      placeholder="e.g., $, #, +"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="gaugeSuffix" className="text-xs">Suffix</Label>
                    <Input
                      id="gaugeSuffix"
                      value={selectedWidget.config.suffix || ''}
                      onChange={(e) => handleConfigChange('suffix', e.target.value)}
                      placeholder="e.g., kg, mph, kW"
                      className="h-8 text-sm"
                    />
                  </div>

                  <Separator />

                  {/* Icon Configuration */}
                  <h4 className="text-sm font-medium">Icon Configuration</h4>

                  <div className="space-y-1">
                    <Label htmlFor="gaugeIcon" className="text-xs">Gauge Icon</Label>
                    <Select
                      value={selectedWidget.config.gaugeIcon || 'Thermometer'}
                      onValueChange={(value) => handleConfigChange('gaugeIcon', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Thermometer">Thermometer</SelectItem>
                        <SelectItem value="Battery">Battery</SelectItem>
                        <SelectItem value="Volume">Volume</SelectItem>
                        <SelectItem value="Wifi">Wifi</SelectItem>
                        <SelectItem value="Cloud">Cloud</SelectItem>
                        <SelectItem value="Droplets">Droplets</SelectItem>
                        <SelectItem value="Sun">Sun</SelectItem>
                        <SelectItem value="Wind">Wind</SelectItem>
                        <SelectItem value="Zap">Zap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Icon Size: {selectedWidget.config.gaugeIconSize || 20}px</Label>
                    <Slider
                      value={[selectedWidget.config.gaugeIconSize || 20]}
                      onValueChange={([value]) => handleConfigChange('gaugeIconSize', value)}
                      max={100}
                      min={5}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Icon</Label>
                    <Switch
                      checked={selectedWidget.config.showGaugeIcon !== false}
                      onCheckedChange={(checked) => handleConfigChange('showGaugeIcon', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Color Configuration */}
                  <h4 className="text-sm font-medium">Color Configuration</h4>

                  <div className="space-y-1">
                    <Label htmlFor="progressColor" className="text-xs">Progress Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.progressColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('progressColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.progressColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('progressColor', e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Use Threshold Colors</Label>
                    <Switch
                      checked={selectedWidget.config.useThresholdColors || false}
                      onCheckedChange={(checked) => handleConfigChange('useThresholdColors', checked)}
                    />
                  </div>

                  {/* Threshold Management */}
                  {selectedWidget.config.useThresholdColors && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs">Color Thresholds</Label>
                        <p className="text-xs text-muted-foreground">
                          Define value thresholds for dynamic color changes
                        </p>

                        {/* Current Thresholds */}
                        {selectedWidget.config.thresholds && selectedWidget.config.thresholds.length > 0 && (
                          <div className="space-y-2 border rounded-md p-3 bg-muted/30">
                            {selectedWidget.config.thresholds.map((threshold: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-background rounded border">
                                <Input
                                  type="number"
                                  value={threshold.value}
                                  onChange={(e) => {
                                    const thresholds = [...selectedWidget.config.thresholds];
                                    thresholds[index] = { ...thresholds[index], value: Number(e.target.value) };
                                    handleConfigChange('thresholds', thresholds);
                                  }}
                                  className="w-20 h-7 text-xs"
                                />
                                <Input
                                  type="color"
                                  value={threshold.color}
                                  onChange={(e) => {
                                    const thresholds = [...selectedWidget.config.thresholds];
                                    thresholds[index] = { ...thresholds[index], color: e.target.value };
                                    handleConfigChange('thresholds', thresholds);
                                  }}
                                  className="w-12 h-7 p-1"
                                />
                                <div 
                                  className="w-6 h-6 rounded-full border-2" 
                                  style={{ backgroundColor: threshold.color }}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 ml-auto"
                                  onClick={() => {
                                    const thresholds = selectedWidget.config.thresholds.filter((_: any, i: number) => i !== index);
                                    handleConfigChange('thresholds', thresholds);
                                  }}
                                >
                                  <Trash className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Threshold Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-8 text-xs"
                          onClick={() => {
                            const newThreshold = {
                              value: 50,
                              color: '#3b82f6',
                              label: `Threshold ${(selectedWidget.config.thresholds?.length || 0) + 1}`
                            };
                            const thresholds = [...(selectedWidget.config.thresholds || []), newThreshold];
                            handleConfigChange('thresholds', thresholds);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Threshold
                        </Button>
                      </div>

                      <Separator />
                    </>
                  )}

                  {/* Display Options */}
                  <h4 className="text-sm font-medium">Display Options</h4>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Value</Label>
                    <Switch
                      checked={selectedWidget.config.showGaugeValue !== false}
                      onCheckedChange={(checked) => handleConfigChange('showGaugeValue', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Percentage</Label>
                    <Switch
                      checked={selectedWidget.config.showPercentage !== false}
                      onCheckedChange={(checked) => handleConfigChange('showPercentage', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Min/Max Values</Label>
                    <Switch
                      checked={selectedWidget.config.showMinMax !== false}
                      onCheckedChange={(checked) => handleConfigChange('showMinMax', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Update Time</Label>
                    <Switch
                      checked={selectedWidget.config.showGaugeUpdateTime !== false}
                      onCheckedChange={(checked) => handleConfigChange('showGaugeUpdateTime', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Sizing Controls */}
                  <h4 className="text-sm font-medium">Sizing Controls</h4>

                  <div className="space-y-1">
                    <Label htmlFor="gaugeWidth" className="text-xs">Gauge Width</Label>
                    <Select
                      value={selectedWidget.config.gaugeWidth || 'full'}
                      onValueChange={(value) => handleConfigChange('gaugeWidth', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Width (100%)</SelectItem>
                        <SelectItem value="narrow">Narrow (70%)</SelectItem>
                        <SelectItem value="compact">Compact (50%)</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedWidget.config.gaugeWidth === 'custom' && (
                    <div className="space-y-1">
                      <Label htmlFor="customGaugeWidth" className="text-xs">Custom Width</Label>
                      <Input
                        id="customGaugeWidth"
                        value={selectedWidget.config.customGaugeWidth || '300px'}
                        onChange={(e) => handleConfigChange('customGaugeWidth', e.target.value)}
                        placeholder="e.g., 200px, 50%, 20rem"
                        className="h-8 text-sm"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-xs">Track Height: {selectedWidget.config.gaugeTrackHeight || 4}px</Label>
                    <Slider
                      value={[selectedWidget.config.gaugeTrackHeight || 4]}
                      onValueChange={([value]) => handleConfigChange('gaugeTrackHeight', value)}
                      max={50}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Thumb/Needle Size: {selectedWidget.config.gaugeThumbSize || 20}px</Label>
                    <Slider
                      value={[selectedWidget.config.gaugeThumbSize || 20]}
                      onValueChange={([value]) => handleConfigChange('gaugeThumbSize', value)}
                      max={100}
                      min={5}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Border Radius: {selectedWidget.config.gaugeBorderRadius === 9999 ? 'Full' : `${selectedWidget.config.gaugeBorderRadius || 0}px`}</Label>
                    <Slider
                      value={[selectedWidget.config.gaugeBorderRadius === 9999 ? 50 : (selectedWidget.config.gaugeBorderRadius || 0)]}
                      onValueChange={([value]) => handleConfigChange('gaugeBorderRadius', value === 50 ? 9999 : value)}
                      max={50}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <Separator />

                  {/* Arc & Needle Configuration */}
                  {(selectedWidget.config.gaugeType === 'circular' || 
                    selectedWidget.config.gaugeType === 'semiCircular' || 
                    selectedWidget.config.gaugeType === 'arc' ||
                    selectedWidget.config.gaugeType === 'dial') && (
                    <>
                      <h4 className="text-sm font-medium">Arc & Needle Settings</h4>

                      <div className="space-y-1">
                        <Label className="text-xs">Arc Start Angle: {selectedWidget.config.arcStartAngle || 135}°</Label>
                        <Slider
                          value={[selectedWidget.config.arcStartAngle || 135]}
                          onValueChange={([value]) => handleConfigChange('arcStartAngle', value)}
                          max={360}
                          min={0}
                          step={5}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Arc End Angle: {selectedWidget.config.arcEndAngle || 405}°</Label>
                        <Slider
                          value={[selectedWidget.config.arcEndAngle || 405]}
                          onValueChange={([value]) => handleConfigChange('arcEndAngle', value)}
                          max={450}
                          min={0}
                          step={5}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Arc Width: {selectedWidget.config.arcWidth || 10}px</Label>
                        <Slider
                          value={[selectedWidget.config.arcWidth || 10]}
                          onValueChange={([value]) => handleConfigChange('arcWidth', value)}
                          max={50}
                          min={2}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="needleStyle" className="text-xs">Needle Style</Label>
                        <Select
                          value={selectedWidget.config.needleStyle || 'classic'}
                          onValueChange={(value) => handleConfigChange('needleStyle', value)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="classic">Classic</SelectItem>
                            <SelectItem value="arrow">Arrow</SelectItem>
                            <SelectItem value="triangle">Triangle</SelectItem>
                            <SelectItem value="line">Line</SelectItem>
                            <SelectItem value="modern">Modern</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="needleColor" className="text-xs">Needle Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={selectedWidget.config.needleColor || '#ef4444'}
                            onChange={(e) => handleConfigChange('needleColor', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            value={selectedWidget.config.needleColor || '#ef4444'}
                            onChange={(e) => handleConfigChange('needleColor', e.target.value)}
                            placeholder="#ef4444"
                            className="flex-1 h-8 text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Show Center Pivot</Label>
                        <Switch
                          checked={selectedWidget.config.showCenterPivot !== false}
                          onCheckedChange={(checked) => handleConfigChange('showCenterPivot', checked)}
                        />
                      </div>

                      <Separator />
                    </>
                  )}

                  {/* Animation Settings */}
                  <h4 className="text-sm font-medium">Animation Settings</h4>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Enable Animations</Label>
                    <Switch
                      checked={selectedWidget.config.enableAnimations !== false}
                      onCheckedChange={(checked) => handleConfigChange('enableAnimations', checked)}
                    />
                  </div>

                  {selectedWidget.config.enableAnimations !== false && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs">Animation Duration: {selectedWidget.config.animationDuration || 500}ms</Label>
                        <Slider
                          value={[selectedWidget.config.animationDuration || 500]}
                          onValueChange={([value]) => handleConfigChange('animationDuration', value)}
                          max={2000}
                          min={100}
                          step={100}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="animationEasing" className="text-xs">Animation Easing</Label>
                        <Select
                          value={selectedWidget.config.animationEasing || 'ease-in-out'}
                          onValueChange={(value) => handleConfigChange('animationEasing', value)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="linear">Linear</SelectItem>
                            <SelectItem value="ease">Ease</SelectItem>
                            <SelectItem value="ease-in">Ease In</SelectItem>
                            <SelectItem value="ease-out">Ease Out</SelectItem>
                            <SelectItem value="ease-in-out">Ease In-Out</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Container Options */}
                  <h4 className="text-sm font-medium">Container Options</h4>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Container</Label>
                    <Switch
                      checked={selectedWidget.config.showGaugeContainer !== false}
                      onCheckedChange={(checked) => handleConfigChange('showGaugeContainer', checked)}
                    />
                  </div>
                </>
              )}

              {/* Menu Widget */}
              {selectedWidget.type === 'menu' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="menuTitle" className="text-xs">Menu Title</Label>
                    <Input
                      id="menuTitle"
                      value={selectedWidget.config.menuTitle || 'Navigation'}
                      onChange={(e) => handleConfigChange('menuTitle', e.target.value)}
                      placeholder="Navigation"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="menuLayout" className="text-xs">Layout</Label>
                    <Select
                      value={selectedWidget.config.layout || 'vertical'}
                      onValueChange={(value) => handleConfigChange('layout', value)}
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

                  <div className="space-y-1">
                    <Label htmlFor="textAlignment" className="text-xs">Text Alignment</Label>
                    <Select
                      value={selectedWidget.config.textAlignment || 'left'}
                      onValueChange={(value) => handleConfigChange('textAlignment', value)}
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

                  <Separator />

                  <h4 className="text-sm font-medium">Font Settings</h4>
                  
                  <div className="space-y-1">
                    <Label htmlFor="fontFamily" className="text-xs">Font Family</Label>
                    <Select
                      value={selectedWidget.config.fontFamily || 'inherit'}
                      onValueChange={(value) => handleConfigChange('fontFamily', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inherit">Default</SelectItem>
                        <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                        <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                        <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                        <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                        <SelectItem value="Tahoma, sans-serif">Tahoma</SelectItem>
                        <SelectItem value="'Trebuchet MS', sans-serif">Trebuchet MS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
                      <Select
                        value={selectedWidget.config.fontSize || '14'}
                        onValueChange={(value) => handleConfigChange('fontSize', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10px</SelectItem>
                          <SelectItem value="12">12px</SelectItem>
                          <SelectItem value="14">14px</SelectItem>
                          <SelectItem value="16">16px</SelectItem>
                          <SelectItem value="18">18px</SelectItem>
                          <SelectItem value="20">20px</SelectItem>
                          <SelectItem value="24">24px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="fontWeight" className="text-xs">Font Weight</Label>
                      <Select
                        value={selectedWidget.config.fontWeight || 'normal'}
                        onValueChange={(value) => handleConfigChange('fontWeight', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="lighter">Lighter</SelectItem>
                          <SelectItem value="bolder">Bolder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-xs">
                      <Italic className="w-4 h-4" />
                      Italic
                    </Label>
                    <Switch
                      checked={selectedWidget.config.fontStyle === 'italic'}
                      onCheckedChange={(checked) => handleConfigChange('fontStyle', checked ? 'italic' : 'normal')}
                    />
                  </div>

                  <Separator />

                  <h4 className="text-sm font-medium">Color Settings</h4>
                  
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="menuTextColor" className="text-xs">Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={selectedWidget.config.textColor || '#000000'}
                          onChange={(e) => handleConfigChange('textColor', e.target.value)}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          value={selectedWidget.config.textColor || '#000000'}
                          onChange={(e) => handleConfigChange('textColor', e.target.value)}
                          placeholder="#000000"
                          className="flex-1 h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="menuBgColor" className="text-xs">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={selectedWidget.config.backgroundColor || '#ffffff'}
                          onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          value={selectedWidget.config.backgroundColor || '#ffffff'}
                          onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                          placeholder="#ffffff"
                          className="flex-1 h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="activeBackgroundColor" className="text-xs">Active Background</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={selectedWidget.config.activeBackgroundColor || '#007bff'}
                          onChange={(e) => handleConfigChange('activeBackgroundColor', e.target.value)}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          value={selectedWidget.config.activeBackgroundColor || '#007bff'}
                          onChange={(e) => handleConfigChange('activeBackgroundColor', e.target.value)}
                          placeholder="#007bff"
                          className="flex-1 h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="activeTextColor" className="text-xs">Active Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={selectedWidget.config.activeTextColor || '#ffffff'}
                          onChange={(e) => handleConfigChange('activeTextColor', e.target.value)}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          value={selectedWidget.config.activeTextColor || '#ffffff'}
                          onChange={(e) => handleConfigChange('activeTextColor', e.target.value)}
                          placeholder="#ffffff"
                          className="flex-1 h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="borderColor" className="text-xs">Border Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={selectedWidget.config.borderColor || '#e5e7eb'}
                          onChange={(e) => handleConfigChange('borderColor', e.target.value)}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          value={selectedWidget.config.borderColor || '#e5e7eb'}
                          onChange={(e) => handleConfigChange('borderColor', e.target.value)}
                          placeholder="#e5e7eb"
                          className="flex-1 h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <h4 className="text-sm font-medium">Border Radius</h4>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Menu Border Radius: {selectedWidget.config.menuBorderRadius || 0}px</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[selectedWidget.config.menuBorderRadius || 0]}
                        onValueChange={([value]) => handleConfigChange('menuBorderRadius', value)}
                        min={0}
                        max={50}
                        step={1}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={selectedWidget.config.menuBorderRadius || 0}
                        onChange={(e) => handleConfigChange('menuBorderRadius', parseInt(e.target.value) || 0)}
                        className="w-16 h-8 text-sm"
                        min="0"
                        max="50"
                      />
                    </div>
                  </div>

                  <Separator />

                  <h4 className="text-sm font-medium">Menu Item Height</h4>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Item Height: {selectedWidget.config.menu_item_height || 32}px</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[selectedWidget.config.menu_item_height || 32]}
                        onValueChange={([value]) => handleConfigChange('menu_item_height', value)}
                        min={20}
                        max={80}
                        step={1}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={selectedWidget.config.menu_item_height || 32}
                        onChange={(e) => handleConfigChange('menu_item_height', parseInt(e.target.value) || 32)}
                        className="w-16 h-8 text-sm"
                        min="20"
                        max="80"
                      />
                    </div>
                  </div>

                  <Separator />

                  <h4 className="text-sm font-medium">Text & Icon Sizing</h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Icon Size: {selectedWidget.config.menuIconSize || 16}px</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[selectedWidget.config.menuIconSize || 16]}
                          onValueChange={([value]) => handleConfigChange('menuIconSize', value)}
                          min={12}
                          max={32}
                          step={1}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={selectedWidget.config.menuIconSize || 16}
                          onChange={(e) => handleConfigChange('menuIconSize', parseInt(e.target.value) || 16)}
                          className="w-16 h-8 text-sm"
                          min="12"
                          max="32"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Font Size: {selectedWidget.config.menuFontSize || 14}px</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[selectedWidget.config.menuFontSize || 14]}
                          onValueChange={([value]) => handleConfigChange('menuFontSize', value)}
                          min={10}
                          max={24}
                          step={1}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={selectedWidget.config.menuFontSize || 14}
                          onChange={(e) => handleConfigChange('menuFontSize', parseInt(e.target.value) || 14)}
                          className="w-16 h-8 text-sm"
                          min="10"
                          max="24"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <h4 className="text-sm font-medium">Menu Options</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showIcons" className="text-xs">Show Icons</Label>
                    <Switch
                      id="showIcons"
                      checked={selectedWidget.config.showIcons !== false}
                      onCheckedChange={(checked) => handleConfigChange('showIcons', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="collapsible" className="text-xs">Collapsible</Label>
                    <Switch
                      id="collapsible"
                      checked={selectedWidget.config.collapsible === true}
                      onCheckedChange={(checked) => handleConfigChange('collapsible', checked)}
                    />
                  </div>

                  {selectedWidget.config.collapsible && (
                    <div className="flex items-center justify-between">
                      <Label htmlFor="startCollapsed" className="text-xs">Start Collapsed</Label>
                      <Switch
                        id="startCollapsed"
                        checked={selectedWidget.config.startCollapsed === true}
                        onCheckedChange={(checked) => handleConfigChange('startCollapsed', checked)}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="highlightActive" className="text-xs">Highlight Active Page</Label>
                    <Switch
                      id="highlightActive"
                      checked={selectedWidget.config.highlightActive !== false}
                      onCheckedChange={(checked) => handleConfigChange('highlightActive', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showContainer" className="text-xs">Show Container</Label>
                    <Switch
                      id="showContainer"
                      checked={selectedWidget.config.showContainer !== false}
                      onCheckedChange={(checked) => handleConfigChange('showContainer', checked)}
                    />
                  </div>

                  {/* Menu Item Visibility Management */}
                  {state.config?.pages && state.config.pages.length > 0 && (
                    <>
                      <Separator />
                      <h4 className="text-sm font-medium">Menu Item Visibility</h4>
                      <p className="text-xs text-muted-foreground">
                        Toggle visibility of individual menu items
                      </p>
                      <div className="space-y-2 border rounded-md p-3">
                        {state.config.pages.map((page) => {
                          const isHidden = (selectedWidget.config.hiddenMenuItems || []).includes(page.id);
                          return (
                            <div key={page.id} className="flex items-center justify-between">
                              <Label className="text-xs font-medium">{page.name}</Label>
                              <Switch
                                checked={!isHidden}
                                onCheckedChange={() => toggleMenuItemVisibility(page.id)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Menu Item Customization */}
                  {state.config?.pages && state.config.pages.length > 0 && (
                    <>
                      <Separator />
                      <h4 className="text-sm font-medium">Menu Item Customization</h4>
                      <p className="text-xs text-muted-foreground">
                        Customize individual menu items
                      </p>
                      <div className="space-y-3">
                        {state.config.pages.map((page) => {
                          const labelVisible = selectedWidget.config.menuItemLabelVisibility?.[page.id] !== false;
                          const iconType = selectedWidget.config.menuItemIcons?.[page.id] || 'Home';
                          const IconComponent = AVAILABLE_ICONS[iconType as keyof typeof AVAILABLE_ICONS] || Home;
                          
                          return (
                            <div key={`custom-${page.id}`} className="space-y-2 p-3 border rounded-md bg-muted/30">
                              <div className="font-medium text-xs">{page.name}</div>
                              
                              <div className="flex items-center justify-between">
                                <Label className="text-xs">Show Label</Label>
                                <Switch
                                  checked={labelVisible}
                                  onCheckedChange={() => toggleMenuItemLabelVisibility(page.id)}
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <Label className="text-xs">Icon</Label>
                                <Select 
                                  value={iconType} 
                                  onValueChange={(value) => updateMenuItemIcon(page.id, value)}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select icon" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-60">
                                    {Object.entries(AVAILABLE_ICONS).map(([name, Icon]) => (
                                      <SelectItem key={name} value={name}>
                                        <div className="flex items-center gap-2">
                                          <Icon className="w-3 h-3" />
                                          <span className="text-xs">{name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                                <span>Preview:</span>
                                <div className="flex items-center gap-1 border rounded px-2 py-1 bg-background">
                                  <IconComponent className="w-3 h-3" />
                                  {labelVisible && <span>{page.name}</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Image Widget */}
              {selectedWidget.type === 'image' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="imageUrl" className="text-xs">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={selectedWidget.config.imageUrl || ''}
                      onChange={(e) => handleConfigChange('imageUrl', e.target.value)}
                      placeholder="https://... or data:image/..."
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="imageUpload" className="text-xs">Upload Image</Label>
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            handleConfigChange('imageUrl', event.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </>
              )}

              {/* Button Widget - Complete Design Capabilities */}
              {selectedWidget.type === 'button' && (
                <>
                  {/* Button Type */}
                  <div className="space-y-1">
                    <Label htmlFor="buttonType" className="text-xs">Button Type</Label>
                    <Select
                      value={selectedWidget.config.deviceCommand?.buttonType || selectedWidget.config.buttonType || 'normal'}
                      onValueChange={(value) => handleConfigChange('deviceCommand', {
                        ...selectedWidget.config.deviceCommand,
                        buttonType: value
                      })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="push">Push (Press/Release)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(selectedWidget.config.deviceCommand?.buttonType || selectedWidget.config.buttonType) === 'push'
                        ? 'Triggers press and release events when held'
                        : 'Triggers click event when pressed'}
                    </p>
                  </div>

                  {/* Button Variant */}
                  <div className="space-y-1">
                    <Label htmlFor="buttonVariant" className="text-xs">Button Variant</Label>
                    <Select
                      value={selectedWidget.config.buttonStyle || 'default'}
                      onValueChange={(value) => handleConfigChange('buttonStyle', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
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

                  {/* Button Size & Shape */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="buttonSize" className="text-xs">Button Size</Label>
                      <Select
                        value={selectedWidget.config.buttonSize || 'default'}
                        onValueChange={(value) => handleConfigChange('buttonSize', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sm">Small</SelectItem>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="lg">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="buttonShape" className="text-xs">Button Shape</Label>
                      <Select
                        value={selectedWidget.config.buttonShape || 'rounded'}
                        onValueChange={(value) => handleConfigChange('buttonShape', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rectangle">Rectangle</SelectItem>
                          <SelectItem value="rounded">Rounded</SelectItem>
                          <SelectItem value="pill">Pill</SelectItem>
                          <SelectItem value="circle">Circle</SelectItem>
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="stadium">Stadium</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Custom Border Radius */}
                  {selectedWidget.config.buttonShape === 'custom' && (
                    <div className="space-y-1">
                      <Label htmlFor="buttonBorderRadius" className="text-xs">Border Radius (px)</Label>
                      <Input
                        id="buttonBorderRadius"
                        type="number"
                        value={selectedWidget.config.buttonBorderRadius || 6}
                        onChange={(e) => handleConfigChange('buttonBorderRadius', parseInt(e.target.value) || 6)}
                        className="h-8 text-sm"
                      />
                    </div>
                  )}

                  {/* Icon Controls */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showIcon" className="text-xs">Show Icon</Label>
                    <Switch
                      id="showIcon"
                      checked={selectedWidget.config.showIcon !== false}
                      onCheckedChange={(checked) => handleConfigChange('showIcon', checked)}
                    />
                  </div>

                  {selectedWidget.config.showIcon !== false && (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor="buttonIcon" className="text-xs">Icon</Label>
                        <Select
                          value={selectedWidget.config.buttonIcon || 'Power'}
                          onValueChange={(value) => handleConfigChange('buttonIcon', value)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Play">Play</SelectItem>
                            <SelectItem value="Power">Power</SelectItem>
                            <SelectItem value="Settings">Settings</SelectItem>
                            <SelectItem value="Thermometer">Thermometer</SelectItem>
                            <SelectItem value="Zap">Zap</SelectItem>
                            <SelectItem value="Wifi">Wifi</SelectItem>
                            <SelectItem value="Clock">Clock</SelectItem>
                            <SelectItem value="AlertTriangle">Alert Triangle</SelectItem>
                            <SelectItem value="CheckCircle">Check Circle</SelectItem>
                            <SelectItem value="Camera">Camera</SelectItem>
                            <SelectItem value="Battery">Battery</SelectItem>
                            <SelectItem value="Sun">Sun</SelectItem>
                            <SelectItem value="Cloud">Cloud</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="iconPosition" className="text-xs">Icon Position</Label>
                          <Select
                            value={selectedWidget.config.iconPosition || 'left'}
                            onValueChange={(value) => handleConfigChange('iconPosition', value)}
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
                        <div className="space-y-1">
                          <Label htmlFor="buttonIconSize" className="text-xs">Icon Size (px)</Label>
                          <Input
                            id="buttonIconSize"
                            type="number"
                            value={selectedWidget.config.buttonIconSize || 16}
                            onChange={(e) => handleConfigChange('buttonIconSize', parseInt(e.target.value) || 16)}
                            min={8}
                            max={48}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Show Label Toggle */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showButtonLabel" className="text-xs">Show Label</Label>
                    <Switch
                      id="showButtonLabel"
                      checked={selectedWidget.config.showButtonLabel !== false}
                      onCheckedChange={(checked) => handleConfigChange('showButtonLabel', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Button State Text */}
                  <h4 className="text-sm font-medium">Button State Labels</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="buttonNormalText" className="text-xs">Normal Text</Label>
                      <Input
                        id="buttonNormalText"
                        value={selectedWidget.config.buttonNormalText || selectedWidget.title}
                        onChange={(e) => handleConfigChange('buttonNormalText', e.target.value)}
                        placeholder="Button"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="buttonPressedText" className="text-xs">Pressed Text</Label>
                      <Input
                        id="buttonPressedText"
                        value={selectedWidget.config.buttonPressedText || selectedWidget.title}
                        onChange={(e) => handleConfigChange('buttonPressedText', e.target.value)}
                        placeholder="Button"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Button State Colors */}
                  <h4 className="text-sm font-medium">Button State Colors</h4>
                  
                  {/* Normal State Colors */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Normal State</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="buttonNormalBg" className="text-xs">Background</Label>
                        <div className="flex gap-1">
                          <Input
                            id="buttonNormalBg"
                            type="color"
                            value={selectedWidget.config.buttonNormalBackgroundColor || '#ffffff'}
                            onChange={(e) => handleConfigChange('buttonNormalBackgroundColor', e.target.value)}
                            className="w-8 h-8 p-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="buttonNormalText" className="text-xs">Text</Label>
                        <div className="flex gap-1">
                          <Input
                            id="buttonNormalText"
                            type="color"
                            value={selectedWidget.config.buttonNormalTextColor || '#000000'}
                            onChange={(e) => handleConfigChange('buttonNormalTextColor', e.target.value)}
                            className="w-8 h-8 p-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="buttonNormalBorder" className="text-xs">Border</Label>
                        <div className="flex gap-1">
                          <Input
                            id="buttonNormalBorder"
                            type="color"
                            value={selectedWidget.config.buttonNormalBorderColor || '#000000'}
                            onChange={(e) => handleConfigChange('buttonNormalBorderColor', e.target.value)}
                            className="w-8 h-8 p-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pressed State Colors */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Pressed State</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="buttonPressedBg" className="text-xs">Background</Label>
                        <div className="flex gap-1">
                          <Input
                            id="buttonPressedBg"
                            type="color"
                            value={selectedWidget.config.buttonPressedBackgroundColor || '#000000'}
                            onChange={(e) => handleConfigChange('buttonPressedBackgroundColor', e.target.value)}
                            className="w-8 h-8 p-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="buttonPressedTextColor" className="text-xs">Text</Label>
                        <div className="flex gap-1">
                          <Input
                            id="buttonPressedTextColor"
                            type="color"
                            value={selectedWidget.config.buttonPressedTextColor || '#ffffff'}
                            onChange={(e) => handleConfigChange('buttonPressedTextColor', e.target.value)}
                            className="w-8 h-8 p-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="buttonPressedBorderColor" className="text-xs">Border</Label>
                        <div className="flex gap-1">
                          <Input
                            id="buttonPressedBorderColor"
                            type="color"
                            value={selectedWidget.config.buttonPressedBorderColor || '#000000'}
                            onChange={(e) => handleConfigChange('buttonPressedBorderColor', e.target.value)}
                            className="w-8 h-8 p-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Typography & Spacing */}
                  <h4 className="text-sm font-medium">Typography & Spacing</h4>
                  
                  {/* Font Family - Show custom font if uploaded, else show selector */}
                  <div className="space-y-2">
                    <Label className="text-xs">Font Family</Label>
                    {selectedWidget.config.buttonCustomFontName ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                          <Type className="w-4 h-4" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{selectedWidget.config.buttonCustomFontName}</p>
                            <p className="text-xs text-muted-foreground">Custom font active</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveButtonCustomFont}
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
                          value={selectedWidget.config.buttonFontFamily || 'inherit'}
                          onValueChange={(value) => handleConfigChange('buttonFontFamily', value)}
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
                          </SelectContent>
                        </Select>
                        
                        {/* Custom font upload button */}
                        <div className="mt-2">
                          <Label htmlFor="button-font-upload" className="cursor-pointer">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              disabled={isUploadingFont}
                              onClick={() => document.getElementById('button-font-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {isUploadingFont ? 'Uploading...' : 'Upload Custom Font'}
                            </Button>
                          </Label>
                          <Input
                            id="button-font-upload"
                            type="file"
                            accept=".ttf,.otf,.woff,.woff2"
                            onChange={handleButtonFontUpload}
                            className="hidden"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Supports: TTF, OTF, WOFF, WOFF2 (max 500KB)
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="buttonFontSize" className="text-xs">Font Size</Label>
                      <Input
                        id="buttonFontSize"
                        value={selectedWidget.config.buttonFontSize || '14px'}
                        onChange={(e) => handleConfigChange('buttonFontSize', e.target.value)}
                        placeholder="14px"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="buttonFontWeight" className="text-xs">Font Weight</Label>
                      <Select
                        value={selectedWidget.config.buttonFontWeight || 'normal'}
                        onValueChange={(value) => handleConfigChange('buttonFontWeight', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="lighter">Lighter</SelectItem>
                          <SelectItem value="bolder">Bolder</SelectItem>
                          <SelectItem value="100">100 (Thin)</SelectItem>
                          <SelectItem value="200">200 (Extra Light)</SelectItem>
                          <SelectItem value="300">300 (Light)</SelectItem>
                          <SelectItem value="400">400 (Normal)</SelectItem>
                          <SelectItem value="500">500 (Medium)</SelectItem>
                          <SelectItem value="600">600 (Semi Bold)</SelectItem>
                          <SelectItem value="700">700 (Bold)</SelectItem>
                          <SelectItem value="800">800 (Extra Bold)</SelectItem>
                          <SelectItem value="900">900 (Black)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Text Color with Italic Toggle */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="buttonTextColor" className="text-xs">Text Color</Label>
                      <div className="flex gap-1">
                        <Input
                          id="buttonTextColor"
                          type="color"
                          value={selectedWidget.config.buttonTextColor || '#000000'}
                          onChange={(e) => handleConfigChange('buttonTextColor', e.target.value)}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          value={selectedWidget.config.buttonTextColor || '#000000'}
                          onChange={(e) => handleConfigChange('buttonTextColor', e.target.value)}
                          placeholder="#000000"
                          className="h-8 text-sm flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="buttonFontStyle" className="text-xs">Font Style</Label>
                      <div className="flex items-center justify-between h-8 px-3 border rounded-md">
                        <span className="text-sm">Italic</span>
                        <Switch
                          id="buttonFontStyle"
                          checked={selectedWidget.config.buttonFontStyle === 'italic'}
                          onCheckedChange={(checked) => handleConfigChange('buttonFontStyle', checked ? 'italic' : 'normal')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Character Spacing (Letter Spacing) */}
                  <div className="space-y-2">
                    <Label className="text-xs">
                      Character Spacing: {selectedWidget.config.buttonLetterSpacing ? parseFloat(selectedWidget.config.buttonLetterSpacing) : 0}px
                    </Label>
                    <Slider
                      value={[selectedWidget.config.buttonLetterSpacing ? parseFloat(selectedWidget.config.buttonLetterSpacing) : 0]}
                      onValueChange={([value]) => handleConfigChange('buttonLetterSpacing', `${value}px`)}
                      min={-5}
                      max={20}
                      step={0.5}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">Adjust spacing between characters</p>
                  </div>

                  {/* Label Margins */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Label Margins</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="buttonLabelMarginTop" className="text-xs">Top</Label>
                        <Input
                          id="buttonLabelMarginTop"
                          value={selectedWidget.config.buttonLabelMarginTop || '0px'}
                          onChange={(e) => handleConfigChange('buttonLabelMarginTop', e.target.value)}
                          placeholder="0px"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="buttonLabelMarginBottom" className="text-xs">Bottom</Label>
                        <Input
                          id="buttonLabelMarginBottom"
                          value={selectedWidget.config.buttonLabelMarginBottom || '0px'}
                          onChange={(e) => handleConfigChange('buttonLabelMarginBottom', e.target.value)}
                          placeholder="0px"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="buttonLabelMarginLeft" className="text-xs">Left</Label>
                        <Input
                          id="buttonLabelMarginLeft"
                          value={selectedWidget.config.buttonLabelMarginLeft || '0px'}
                          onChange={(e) => handleConfigChange('buttonLabelMarginLeft', e.target.value)}
                          placeholder="0px"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="buttonLabelMarginRight" className="text-xs">Right</Label>
                        <Input
                          id="buttonLabelMarginRight"
                          value={selectedWidget.config.buttonLabelMarginRight || '0px'}
                          onChange={(e) => handleConfigChange('buttonLabelMarginRight', e.target.value)}
                          placeholder="0px"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Button Spacing & Border */}
                  <h4 className="text-sm font-medium">Button Spacing & Border</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="buttonPadding" className="text-xs">Padding</Label>
                      <Input
                        id="buttonPadding"
                        value={selectedWidget.config.buttonPadding || '8px 16px'}
                        onChange={(e) => handleConfigChange('buttonPadding', e.target.value)}
                        placeholder="8px 16px"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="buttonBorderWidth" className="text-xs">Border Width</Label>
                      <Input
                        id="buttonBorderWidth"
                        value={selectedWidget.config.buttonBorderWidth || '1px'}
                        onChange={(e) => handleConfigChange('buttonBorderWidth', e.target.value)}
                        placeholder="1px"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="buttonTextAlign" className="text-xs">Text Alignment</Label>
                    <Select
                      value={selectedWidget.config.textAlign || 'center'}
                      onValueChange={(value) => handleConfigChange('textAlign', value)}
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
                </>
              )}

              {/* Switch Widget */}
              {selectedWidget.type === 'switch' && (
                <>
                  <h4 className="text-sm font-medium">Switch Configuration</h4>
                  
                  <div className="space-y-1">
                    <Label htmlFor="switchLabel" className="text-xs">Switch Label</Label>
                    <Input
                      id="switchLabel"
                      value={selectedWidget.config.label || ''}
                      onChange={(e) => handleConfigChange('label', e.target.value)}
                      placeholder="Switch label"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="initialState" className="text-xs">Initial State</Label>
                    <Switch
                      id="initialState"
                      checked={selectedWidget.config.initialState === true}
                      onCheckedChange={(checked) => handleConfigChange('initialState', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Icon Settings */}
                  <h4 className="text-sm font-medium">Icon Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showSwitchIcon" className="text-xs">Show Icon</Label>
                    <Switch
                      id="showSwitchIcon"
                      checked={selectedWidget.config.showSwitchIcon !== false}
                      onCheckedChange={(checked) => handleConfigChange('showSwitchIcon', checked)}
                    />
                  </div>

                  {selectedWidget.config.showSwitchIcon !== false && (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor="switchIcon" className="text-xs">Switch Icon</Label>
                        <Select
                          value={selectedWidget.config.switchIcon || 'Power'}
                          onValueChange={(value) => handleConfigChange('switchIcon', value)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Power">Power</SelectItem>
                            <SelectItem value="ToggleLeft">Toggle</SelectItem>
                            <SelectItem value="Zap">Lightning</SelectItem>
                            <SelectItem value="Wifi">Wifi</SelectItem>
                            <SelectItem value="Bluetooth">Bluetooth</SelectItem>
                            <SelectItem value="Battery">Battery</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="switchIconSize" className="text-xs">Icon Size</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="switchIconSize"
                            type="number"
                            value={selectedWidget.config.switchIconSize || 20}
                            onChange={(e) => handleConfigChange('switchIconSize', parseInt(e.target.value) || 20)}
                            className="h-8 text-sm"
                            min="12"
                            max="64"
                          />
                          <span className="text-xs text-muted-foreground">px</span>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Toggle Styling */}
                  <h4 className="text-sm font-medium">Toggle Styling</h4>
                  
                  {/* Toggle Size */}
                  <div className="space-y-1">
                    <Label htmlFor="toggleSize" className="text-xs">Toggle Size</Label>
                    <Select
                      value={selectedWidget.config.toggleSize || 'medium'}
                      onValueChange={(value) => handleConfigChange('toggleSize', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (36x20)</SelectItem>
                        <SelectItem value="medium">Medium (44x24)</SelectItem>
                        <SelectItem value="large">Large (56x32)</SelectItem>
                        <SelectItem value="custom">Custom Size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedWidget.config.toggleSize === 'custom' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="toggleCustomWidth" className="text-xs">Width</Label>
                        <div className="flex items-center gap-1">
                          <Input
                            id="toggleCustomWidth"
                            type="number"
                            value={selectedWidget.config.toggleCustomWidth || 44}
                            onChange={(e) => handleConfigChange('toggleCustomWidth', parseInt(e.target.value) || 44)}
                            className="h-8 text-sm"
                            min="30"
                            max="100"
                          />
                          <span className="text-xs text-muted-foreground">px</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="toggleCustomHeight" className="text-xs">Height</Label>
                        <div className="flex items-center gap-1">
                          <Input
                            id="toggleCustomHeight"
                            type="number"
                            value={selectedWidget.config.toggleCustomHeight || 24}
                            onChange={(e) => handleConfigChange('toggleCustomHeight', parseInt(e.target.value) || 24)}
                            className="h-8 text-sm"
                            min="16"
                            max="60"
                          />
                          <span className="text-xs text-muted-foreground">px</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Toggle Shape */}
                  <div className="space-y-1">
                    <Label htmlFor="toggleShape" className="text-xs">Container Shape</Label>
                    <Select
                      value={selectedWidget.config.toggleShape || 'round'}
                      onValueChange={(value) => handleConfigChange('toggleShape', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round">Round/Pill</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="custom">Custom Radius</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedWidget.config.toggleShape === 'custom' && (
                    <div className="space-y-1">
                      <Label htmlFor="toggleBorderRadius" className="text-xs">Border Radius</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="toggleBorderRadius"
                          type="number"
                          value={selectedWidget.config.toggleBorderRadius || 12}
                          onChange={(e) => handleConfigChange('toggleBorderRadius', parseInt(e.target.value) || 0)}
                          className="h-8 text-sm"
                          min="0"
                          max="50"
                        />
                        <span className="text-xs text-muted-foreground">px</span>
                      </div>
                    </div>
                  )}

                  {/* Toggle Colors */}
                  <div className="space-y-1">
                    <Label htmlFor="toggleActiveColor" className="text-xs">Active Color (ON)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.toggleActiveColor || selectedWidget.config.switchColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('toggleActiveColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.toggleActiveColor || selectedWidget.config.switchColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('toggleActiveColor', e.target.value)}
                        placeholder="#3b82f6"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="toggleInactiveColor" className="text-xs">Inactive Color (OFF)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.toggleInactiveColor || '#cccccc'}
                        onChange={(e) => handleConfigChange('toggleInactiveColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.toggleInactiveColor || '#cccccc'}
                        onChange={(e) => handleConfigChange('toggleInactiveColor', e.target.value)}
                        placeholder="#cccccc"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  {/* Toggle Border */}
                  <div className="space-y-1">
                    <Label htmlFor="toggleBorderWidth" className="text-xs">Border Width</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="toggleBorderWidth"
                        type="number"
                        value={selectedWidget.config.toggleBorderWidth || 2}
                        onChange={(e) => handleConfigChange('toggleBorderWidth', parseInt(e.target.value) || 0)}
                        className="h-8 text-sm"
                        min="0"
                        max="10"
                      />
                      <span className="text-xs text-muted-foreground">px</span>
                    </div>
                  </div>

                  {(selectedWidget.config.toggleBorderWidth || 2) > 0 && (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor="toggleBorderColor" className="text-xs">Border Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={selectedWidget.config.toggleBorderColor || '#000000'}
                            onChange={(e) => handleConfigChange('toggleBorderColor', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            value={selectedWidget.config.toggleBorderColor || '#000000'}
                            onChange={(e) => handleConfigChange('toggleBorderColor', e.target.value)}
                            placeholder="#000000"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="toggleBorderStyle" className="text-xs">Border Style</Label>
                        <Select
                          value={selectedWidget.config.toggleBorderStyle || 'solid'}
                          onValueChange={(value) => handleConfigChange('toggleBorderStyle', value)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solid">Solid</SelectItem>
                            <SelectItem value="dashed">Dashed</SelectItem>
                            <SelectItem value="dotted">Dotted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Box Shadow */}
                  <div className="space-y-1">
                    <Label htmlFor="toggleBoxShadow" className="text-xs">Box Shadow</Label>
                    <Input
                      id="toggleBoxShadow"
                      value={selectedWidget.config.toggleBoxShadow || ''}
                      onChange={(e) => handleConfigChange('toggleBoxShadow', e.target.value)}
                      placeholder="0 2px 4px rgba(0,0,0,0.1)"
                      className="h-8 text-sm"
                    />
                    <p className="text-xs text-muted-foreground">CSS box-shadow value</p>
                  </div>

                  <Separator />

                  {/* Thumb Styling */}
                  <h4 className="text-sm font-medium">Thumb/Knob Styling</h4>

                  <div className="space-y-1">
                    <Label htmlFor="thumbShape" className="text-xs">Thumb Shape</Label>
                    <Select
                      value={selectedWidget.config.thumbShape || 'circle'}
                      onValueChange={(value) => handleConfigChange('thumbShape', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="circle">Circle</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="rounded-square">Rounded Square</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedWidget.config.thumbShape === 'rounded-square' && (
                    <div className="space-y-1">
                      <Label htmlFor="thumbBorderRadius" className="text-xs">Thumb Border Radius</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="thumbBorderRadius"
                          type="number"
                          value={selectedWidget.config.thumbBorderRadius || 4}
                          onChange={(e) => handleConfigChange('thumbBorderRadius', parseInt(e.target.value) || 0)}
                          className="h-8 text-sm"
                          min="0"
                          max="20"
                        />
                        <span className="text-xs text-muted-foreground">px</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="thumbSize" className="text-xs">Thumb Size</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="thumbSize"
                        type="number"
                        value={selectedWidget.config.thumbSize || ''}
                        onChange={(e) => handleConfigChange('thumbSize', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Auto"
                        className="h-8 text-sm"
                        min="12"
                        max="50"
                      />
                      <span className="text-xs text-muted-foreground">px</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Leave empty for auto</p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="thumbColor" className="text-xs">Thumb Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.thumbColor || '#ffffff'}
                        onChange={(e) => handleConfigChange('thumbColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.thumbColor || '#ffffff'}
                        onChange={(e) => handleConfigChange('thumbColor', e.target.value)}
                        placeholder="#ffffff"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Animation */}
                  <h4 className="text-sm font-medium">Animation</h4>

                  <div className="space-y-1">
                    <Label htmlFor="toggleTransitionDuration" className="text-xs">Transition Duration</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="toggleTransitionDuration"
                        type="number"
                        value={selectedWidget.config.toggleTransitionDuration || 200}
                        onChange={(e) => handleConfigChange('toggleTransitionDuration', parseInt(e.target.value) || 200)}
                        className="h-8 text-sm"
                        min="50"
                        max="1000"
                        step="50"
                      />
                      <span className="text-xs text-muted-foreground">ms</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Internal Toggle Labels */}
                  <h4 className="text-sm font-medium">Internal Toggle Labels</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Show ON/OFF text inside the toggle
                  </p>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showToggleOnLabel" className="text-xs">Show ON Label</Label>
                    <Switch
                      id="showToggleOnLabel"
                      checked={selectedWidget.config.showToggleOnLabel || false}
                      onCheckedChange={(checked) => handleConfigChange('showToggleOnLabel', checked)}
                    />
                  </div>

                  {selectedWidget.config.showToggleOnLabel && (
                    <div className="space-y-1">
                      <Label htmlFor="toggleOnLabelText" className="text-xs">ON Label Text</Label>
                      <Input
                        id="toggleOnLabelText"
                        value={selectedWidget.config.toggleOnLabelText || 'ON'}
                        onChange={(e) => handleConfigChange('toggleOnLabelText', e.target.value)}
                        placeholder="ON"
                        className="h-8 text-sm"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showToggleOffLabel" className="text-xs">Show OFF Label</Label>
                    <Switch
                      id="showToggleOffLabel"
                      checked={selectedWidget.config.showToggleOffLabel || false}
                      onCheckedChange={(checked) => handleConfigChange('showToggleOffLabel', checked)}
                    />
                  </div>

                  {selectedWidget.config.showToggleOffLabel && (
                    <div className="space-y-1">
                      <Label htmlFor="toggleOffLabelText" className="text-xs">OFF Label Text</Label>
                      <Input
                        id="toggleOffLabelText"
                        value={selectedWidget.config.toggleOffLabelText || 'OFF'}
                        onChange={(e) => handleConfigChange('toggleOffLabelText', e.target.value)}
                        placeholder="OFF"
                        className="h-8 text-sm"
                      />
                    </div>
                  )}

                  {(selectedWidget.config.showToggleOnLabel || selectedWidget.config.showToggleOffLabel) && (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor="toggleLabelColor" className="text-xs">Label Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={selectedWidget.config.toggleLabelColor || '#ffffff'}
                            onChange={(e) => handleConfigChange('toggleLabelColor', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            value={selectedWidget.config.toggleLabelColor || '#ffffff'}
                            onChange={(e) => handleConfigChange('toggleLabelColor', e.target.value)}
                            placeholder="#ffffff"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="toggleLabelFontSize" className="text-xs">Label Font Size</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="toggleLabelFontSize"
                            type="number"
                            value={selectedWidget.config.toggleLabelFontSize || 10}
                            onChange={(e) => handleConfigChange('toggleLabelFontSize', parseInt(e.target.value) || 10)}
                            className="h-8 text-sm"
                            min="6"
                            max="16"
                          />
                          <span className="text-xs text-muted-foreground">px</span>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Color Settings (Legacy - keep for compatibility) */}
                  <h4 className="text-sm font-medium">Legacy Color Settings</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    These settings affect the icon and external text colors
                  </p>
                  
                  <div className="space-y-1">
                    <Label htmlFor="switchColor" className="text-xs">Switch Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.switchColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('switchColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.switchColor || '#3b82f6'}
                        onChange={(e) => handleConfigChange('switchColor', e.target.value)}
                        placeholder="#3b82f6"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Text Labels (External) */}
                  <h4 className="text-sm font-medium">External Text Labels</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showSwitchText" className="text-xs">Show Text Labels</Label>
                    <Switch
                      id="showSwitchText"
                      checked={selectedWidget.config.showSwitchText !== false}
                      onCheckedChange={(checked) => handleConfigChange('showSwitchText', checked)}
                    />
                  </div>

                  {selectedWidget.config.showSwitchText !== false && (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor="switchOnText" className="text-xs">ON Text</Label>
                        <Input
                          id="switchOnText"
                          value={selectedWidget.config.switchOnText || 'ON'}
                          onChange={(e) => handleConfigChange('switchOnText', e.target.value)}
                          placeholder="ON"
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="switchOffText" className="text-xs">OFF Text</Label>
                        <Input
                          id="switchOffText"
                          value={selectedWidget.config.switchOffText || 'OFF'}
                          onChange={(e) => handleConfigChange('switchOffText', e.target.value)}
                          placeholder="OFF"
                          className="h-8 text-sm"
                        />
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Typography & Spacing for Switch Title/Name */}
                  <h4 className="text-sm font-medium">Switch Title Typography</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Customize the appearance of the switch name/title
                  </p>
                  
                  {/* Font Family for Title - Show custom font if uploaded, else show selector */}
                  <div className="space-y-2">
                    <Label className="text-xs">Font Family</Label>
                    {selectedWidget.config.switchTitleCustomFontName ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                          <Type className="w-4 h-4" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{selectedWidget.config.switchTitleCustomFontName}</p>
                            <p className="text-xs text-muted-foreground">Custom font active</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleBatchConfigChange({
                                switchTitleCustomFontData: undefined,
                                switchTitleCustomFontName: undefined,
                                switchTitleCustomFontFamily: undefined,
                                switchTitleFontFamily: 'inherit'
                              });
                              toast.success('Custom font removed');
                            }}
                            className="h-8 w-8 p-0 flex-shrink-0"
                            title="Remove custom font"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Select
                          value={selectedWidget.config.switchTitleFontFamily || 'inherit'}
                          onValueChange={(value) => handleConfigChange('switchTitleFontFamily', value)}
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
                          </SelectContent>
                        </Select>
                        
                        {/* Custom font upload button for switch title */}
                        <div className="mt-2">
                          <Label htmlFor="switch-title-font-upload" className="cursor-pointer">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              disabled={isUploadingFont}
                              onClick={() => document.getElementById('switch-title-font-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {isUploadingFont ? 'Uploading...' : 'Upload Custom Font'}
                            </Button>
                          </Label>
                          <Input
                            id="switch-title-font-upload"
                            type="file"
                            accept=".ttf,.otf,.woff,.woff2"
                            onChange={async (event) => {
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
                              const maxSize = 500 * 1024;
                              if (file.size > maxSize) {
                                toast.error('Font file too large', {
                                  description: `File size must be less than 500KB. Your file is ${(file.size / 1024).toFixed(0)}KB.`
                                });
                                return;
                              }

                              setIsUploadingFont(true);

                              // Convert to base64 with MIME type correction
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                let fontData = e.target?.result as string;
                                const mimeType = fileExtension === '.woff2' ? 'font/woff2' :
                                                fileExtension === '.woff' ? 'font/woff' :
                                                fileExtension === '.otf' ? 'font/otf' : 'font/ttf';
                                
                                if (fontData.startsWith('data:application/octet-stream')) {
                                  fontData = fontData.replace('data:application/octet-stream', `data:${mimeType}`);
                                }
                                
                                const fontFamily = `switch-title-custom-font-${Date.now()}`;
                                
                                handleBatchConfigChange({
                                  switchTitleCustomFontData: fontData,
                                  switchTitleCustomFontName: file.name,
                                  switchTitleCustomFontFamily: fontFamily,
                                  switchTitleFontFamily: fontFamily
                                });
                                
                                setIsUploadingFont(false);
                                toast.success('Custom font uploaded', {
                                  description: `${file.name} is now active for switch title`
                                });
                              };
                              reader.onerror = () => {
                                setIsUploadingFont(false);
                                toast.error('Failed to read font file');
                              };
                              reader.readAsDataURL(file);
                              
                              // Reset input
                              event.target.value = '';
                            }}
                            className="hidden"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Supports: TTF, OTF, WOFF, WOFF2 (max 500KB)
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="switchTitleFontSize" className="text-xs">Font Size</Label>
                      <Input
                        id="switchTitleFontSize"
                        value={selectedWidget.config.switchTitleFontSize || '14px'}
                        onChange={(e) => handleConfigChange('switchTitleFontSize', e.target.value)}
                        placeholder="14px"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="switchTitleFontWeight" className="text-xs">Font Weight</Label>
                      <Select
                        value={selectedWidget.config.switchTitleFontWeight || 'medium'}
                        onValueChange={(value) => handleConfigChange('switchTitleFontWeight', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="600">600 (Semi Bold)</SelectItem>
                          <SelectItem value="700">700 (Bold)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="switchTitleTextColor" className="text-xs">Text Color</Label>
                      <div className="flex gap-1">
                        <Input
                          id="switchTitleTextColor"
                          type="color"
                          value={selectedWidget.config.switchTitleTextColor || '#000000'}
                          onChange={(e) => handleConfigChange('switchTitleTextColor', e.target.value)}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          value={selectedWidget.config.switchTitleTextColor || '#000000'}
                          onChange={(e) => handleConfigChange('switchTitleTextColor', e.target.value)}
                          placeholder="#000000"
                          className="h-8 text-sm flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="switchTitleFontStyle" className="text-xs">Font Style</Label>
                      <div className="flex items-center justify-between h-8 px-3 border rounded-md">
                        <span className="text-sm">Italic</span>
                        <Switch
                          id="switchTitleFontStyle"
                          checked={selectedWidget.config.switchTitleFontStyle === 'italic'}
                          onCheckedChange={(checked) => handleConfigChange('switchTitleFontStyle', checked ? 'italic' : 'normal')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">
                      Character Spacing: {selectedWidget.config.switchTitleLetterSpacing ? parseFloat(selectedWidget.config.switchTitleLetterSpacing) : 0}px
                    </Label>
                    <Slider
                      value={[selectedWidget.config.switchTitleLetterSpacing ? parseFloat(selectedWidget.config.switchTitleLetterSpacing) : 0]}
                      onValueChange={([value]) => handleConfigChange('switchTitleLetterSpacing', `${value}px`)}
                      min={-5}
                      max={20}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>

                  <Separator />

                  {/* Typography & Spacing for ON/OFF Status Text */}
                  <h4 className="text-sm font-medium">ON/OFF Status Text Typography</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Customize the appearance of external ON/OFF text labels
                  </p>
                  
                  {/* Font Family for Status Text - Show custom font if uploaded, else show selector */}
                  <div className="space-y-2">
                    <Label className="text-xs">Font Family</Label>
                    {selectedWidget.config.switchStatusCustomFontName ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                          <Type className="w-4 h-4" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{selectedWidget.config.switchStatusCustomFontName}</p>
                            <p className="text-xs text-muted-foreground">Custom font active</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleBatchConfigChange({
                                switchStatusCustomFontData: undefined,
                                switchStatusCustomFontName: undefined,
                                switchStatusCustomFontFamily: undefined,
                                switchStatusFontFamily: 'inherit'
                              });
                              toast.success('Custom font removed');
                            }}
                            className="h-8 w-8 p-0 flex-shrink-0"
                            title="Remove custom font"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Select
                          value={selectedWidget.config.switchStatusFontFamily || selectedWidget.config.switchFontFamily || 'inherit'}
                          onValueChange={(value) => handleConfigChange('switchStatusFontFamily', value)}
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
                          </SelectContent>
                        </Select>
                        
                        {/* Custom font upload button for ON/OFF status text */}
                        <div className="mt-2">
                          <Label htmlFor="switch-status-font-upload" className="cursor-pointer">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              disabled={isUploadingFont}
                              onClick={() => document.getElementById('switch-status-font-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {isUploadingFont ? 'Uploading...' : 'Upload Custom Font'}
                            </Button>
                          </Label>
                          <Input
                            id="switch-status-font-upload"
                            type="file"
                            accept=".ttf,.otf,.woff,.woff2"
                            onChange={async (event) => {
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
                              const maxSize = 500 * 1024;
                              if (file.size > maxSize) {
                                toast.error('Font file too large', {
                                  description: `File size must be less than 500KB. Your file is ${(file.size / 1024).toFixed(0)}KB.`
                                });
                                return;
                              }

                              setIsUploadingFont(true);

                              // Convert to base64 with MIME type correction
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                let fontData = e.target?.result as string;
                                const mimeType = fileExtension === '.woff2' ? 'font/woff2' :
                                                fileExtension === '.woff' ? 'font/woff' :
                                                fileExtension === '.otf' ? 'font/otf' : 'font/ttf';
                                
                                if (fontData.startsWith('data:application/octet-stream')) {
                                  fontData = fontData.replace('data:application/octet-stream', `data:${mimeType}`);
                                }
                                
                                const fontFamily = `switch-status-custom-font-${Date.now()}`;
                                
                                handleBatchConfigChange({
                                  switchStatusCustomFontData: fontData,
                                  switchStatusCustomFontName: file.name,
                                  switchStatusCustomFontFamily: fontFamily,
                                  switchStatusFontFamily: fontFamily
                                });
                                
                                setIsUploadingFont(false);
                                toast.success('Custom font uploaded', {
                                  description: `${file.name} is now active for ON/OFF status text`
                                });
                              };
                              reader.onerror = () => {
                                setIsUploadingFont(false);
                                toast.error('Failed to read font file');
                              };
                              reader.readAsDataURL(file);
                              
                              // Reset input
                              event.target.value = '';
                            }}
                            className="hidden"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Supports: TTF, OTF, WOFF, WOFF2 (max 500KB)
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="switchStatusFontSize" className="text-xs">Font Size</Label>
                      <Input
                        id="switchStatusFontSize"
                        value={selectedWidget.config.switchStatusFontSize || selectedWidget.config.switchFontSize || '14px'}
                        onChange={(e) => handleConfigChange('switchStatusFontSize', e.target.value)}
                        placeholder="14px"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="switchStatusFontWeight" className="text-xs">Font Weight</Label>
                      <Select
                        value={selectedWidget.config.switchStatusFontWeight || selectedWidget.config.switchFontWeight || 'medium'}
                        onValueChange={(value) => handleConfigChange('switchStatusFontWeight', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="600">600 (Semi Bold)</SelectItem>
                          <SelectItem value="700">700 (Bold)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="switchStatusTextColor" className="text-xs">Text Color</Label>
                      <div className="flex gap-1">
                        <Input
                          id="switchStatusTextColor"
                          type="color"
                          value={selectedWidget.config.switchStatusTextColor || selectedWidget.config.switchTextColor || '#000000'}
                          onChange={(e) => handleConfigChange('switchStatusTextColor', e.target.value)}
                          className="w-12 h-8 p-1"
                        />
                        <Input
                          value={selectedWidget.config.switchStatusTextColor || selectedWidget.config.switchTextColor || '#000000'}
                          onChange={(e) => handleConfigChange('switchStatusTextColor', e.target.value)}
                          placeholder="#000000"
                          className="h-8 text-sm flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="switchStatusFontStyle" className="text-xs">Font Style</Label>
                      <div className="flex items-center justify-between h-8 px-3 border rounded-md">
                        <span className="text-sm">Italic</span>
                        <Switch
                          id="switchStatusFontStyle"
                          checked={(selectedWidget.config.switchStatusFontStyle || selectedWidget.config.switchFontStyle) === 'italic'}
                          onCheckedChange={(checked) => handleConfigChange('switchStatusFontStyle', checked ? 'italic' : 'normal')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">
                      Character Spacing: {(selectedWidget.config.switchStatusLetterSpacing || selectedWidget.config.switchLetterSpacing) ? parseFloat(selectedWidget.config.switchStatusLetterSpacing || selectedWidget.config.switchLetterSpacing) : 0}px
                    </Label>
                    <Slider
                      value={[(selectedWidget.config.switchStatusLetterSpacing || selectedWidget.config.switchLetterSpacing) ? parseFloat(selectedWidget.config.switchStatusLetterSpacing || selectedWidget.config.switchLetterSpacing) : 0]}
                      onValueChange={([value]) => handleConfigChange('switchStatusLetterSpacing', `${value}px`)}
                      min={-5}
                      max={20}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>

                </>
              )}

              {/* Label Widget */}
              {selectedWidget.type === 'label' && (
                <LabelConfig 
                  config={selectedWidget.config}
                  onConfigChange={handleConfigChange}
                  onBatchConfigChange={handleBatchConfigChange}
                />
              )}

              {/* Chart Widget */}
              {selectedWidget.type === 'chart' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="chartType" className="text-xs">Chart Type</Label>
                    <Select
                      value={selectedWidget.config.chartType || 'line'}
                      onValueChange={(value) => handleConfigChange('chartType', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line</SelectItem>
                        <SelectItem value="bar">Bar</SelectItem>
                        <SelectItem value="area">Area</SelectItem>
                        <SelectItem value="pie">Pie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="dataPoints" className="text-xs">Max Data Points</Label>
                    <Input
                      id="dataPoints"
                      type="number"
                      value={selectedWidget.config.maxDataPoints || 50}
                      onChange={(e) => handleConfigChange('maxDataPoints', parseInt(e.target.value) || 50)}
                      className="h-8 text-sm"
                    />
                  </div>
                </>
              )}

              {/* Image Widget */}
              {selectedWidget.type === 'image' && (
                <>
                  <h4 className="text-sm font-medium">Image Configuration</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Configure image display and styling
                  </p>

                  <div className="space-y-1">
                    <Label htmlFor="imageUrl" className="text-xs">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={selectedWidget.config.imageUrl || ''}
                      onChange={(e) => handleConfigChange('imageUrl', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="imageFile" className="text-xs">Upload Image</Label>
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const base64 = event.target?.result as string;
                            handleConfigChange('imageUrl', base64);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="h-8 text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload an image to automatically convert to base64
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <Label htmlFor="imageAlt" className="text-xs">Alt Text</Label>
                    <Input
                      id="imageAlt"
                      value={selectedWidget.config.alt || ''}
                      onChange={(e) => handleConfigChange('alt', e.target.value)}
                      placeholder="Alternative text for accessibility"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="imageFit" className="text-xs">Image Fit</Label>
                    <Select
                      value={selectedWidget.config.fit || 'contain'}
                      onValueChange={(value) => handleConfigChange('fit', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contain">Contain</SelectItem>
                        <SelectItem value="cover">Cover</SelectItem>
                        <SelectItem value="fill">Fill</SelectItem>
                        <SelectItem value="scale-down">Scale Down</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="imageAlignment" className="text-xs">Alignment</Label>
                    <Select
                      value={selectedWidget.config.imageAlignment || 'center'}
                      onValueChange={(value) => handleConfigChange('imageAlignment', value)}
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

                  <Separator />

                  <h4 className="text-sm font-medium">Image Styling</h4>

                  <div className="space-y-1">
                    <Label className="text-xs">Border Radius: {selectedWidget.config.imageBorderRadius || 6}px</Label>
                    <Slider
                      value={[selectedWidget.config.imageBorderRadius || 6]}
                      onValueChange={([value]) => handleConfigChange('imageBorderRadius', value)}
                      max={50}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Border Width: {selectedWidget.config.imageBorderWidth || 0}px</Label>
                    <Slider
                      value={[selectedWidget.config.imageBorderWidth || 0]}
                      onValueChange={([value]) => handleConfigChange('imageBorderWidth', value)}
                      max={20}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="imageBorderColor" className="text-xs">Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.imageBorderColor || '#00000000'}
                        onChange={(e) => handleConfigChange('imageBorderColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.imageBorderColor || '#00000000'}
                        onChange={(e) => handleConfigChange('imageBorderColor', e.target.value)}
                        placeholder="#00000000"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="imageBackgroundColor" className="text-xs">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.imageBackgroundColor || '#00000000'}
                        onChange={(e) => handleConfigChange('imageBackgroundColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.imageBackgroundColor || '#00000000'}
                        onChange={(e) => handleConfigChange('imageBackgroundColor', e.target.value)}
                        placeholder="#00000000"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Opacity: {Math.round((selectedWidget.config.opacity || 1) * 100)}%</Label>
                    <Slider
                      value={[selectedWidget.config.opacity || 1]}
                      onValueChange={([value]) => handleConfigChange('opacity', value)}
                      max={1}
                      min={0}
                      step={0.05}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="imagePadding" className="text-xs">Padding</Label>
                    <Input
                      id="imagePadding"
                      value={selectedWidget.config.imagePadding || '0px'}
                      onChange={(e) => handleConfigChange('imagePadding', e.target.value)}
                      placeholder="e.g., 0px, 0.5rem"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="imageWidth" className="text-xs">Image Width</Label>
                      <Input
                        id="imageWidth"
                        value={selectedWidget.config.imageWidth || 'auto'}
                        onChange={(e) => handleConfigChange('imageWidth', e.target.value)}
                        placeholder="auto, 100%, 200px"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="imageHeight" className="text-xs">Image Height</Label>
                      <Input
                        id="imageHeight"
                        value={selectedWidget.config.imageHeight || 'auto'}
                        onChange={(e) => handleConfigChange('imageHeight', e.target.value)}
                        placeholder="auto, 100%, 200px"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="imageFilter" className="text-xs">Image Filter</Label>
                    <Input
                      id="imageFilter"
                      value={selectedWidget.config.imageFilter || ''}
                      onChange={(e) => handleConfigChange('imageFilter', e.target.value)}
                      placeholder="e.g., grayscale(100%), blur(2px)"
                      className="h-8 text-sm"
                    />
                  </div>
                </>
              )}

              {/* SVG Widget */}
              {selectedWidget.type === 'svg' && (
                <>
                  <h4 className="text-sm font-medium">SVG Configuration</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Configure scalable vector graphics display and styling
                  </p>

                  <div className="space-y-1">
                    <Label htmlFor="svgUrl" className="text-xs">SVG URL</Label>
                    <Input
                      id="svgUrl"
                      value={selectedWidget.config.svgUrl || ''}
                      onChange={(e) => handleConfigChange('svgUrl', e.target.value)}
                      placeholder="https://example.com/image.svg"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="svgFile" className="text-xs">Upload SVG File</Label>
                    <Input
                      id="svgFile"
                      type="file"
                      accept=".svg,image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          console.log('SVG file selected:', file.name, file.type);
                          // Check if it's an SVG file
                          if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) {
                            console.error('Invalid file type:', file.type);
                            alert('Please upload a valid SVG file');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const content = event.target?.result as string;
                            console.log('SVG content loaded, length:', content?.length);
                            console.log('SVG content preview:', content?.substring(0, 200));
                            // Update both config properties in a single call
                            handleConfigChange('svgContent', content);
                            // Clear svgUrl when uploading content
                            if (selectedWidget.config.svgUrl) {
                              handleConfigChange('svgUrl', '');
                            }
                            console.log('SVG config updated');
                          };
                          reader.onerror = (error) => {
                            console.error('Error reading SVG file:', error);
                            alert('Failed to read SVG file');
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className="h-8 text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload an SVG file to embed directly in the widget
                    </p>
                    {selectedWidget.config.svgContent && (
                      <p className="text-xs text-green-600">
                        ✓ SVG content loaded ({selectedWidget.config.svgContent.length} characters)
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <Label htmlFor="svgAlt" className="text-xs">Alt Text</Label>
                    <Input
                      id="svgAlt"
                      value={selectedWidget.config.svgAlt || ''}
                      onChange={(e) => handleConfigChange('svgAlt', e.target.value)}
                      placeholder="Alternative text for accessibility"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="svgFit" className="text-xs">SVG Fit</Label>
                    <Select
                      value={selectedWidget.config.svgFit || 'contain'}
                      onValueChange={(value) => handleConfigChange('svgFit', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contain">Contain (Maintain aspect ratio, fit within container)</SelectItem>
                        <SelectItem value="cover">Cover (Maintain aspect ratio, fill container)</SelectItem>
                        <SelectItem value="fill">Fill (Stretch to fill container)</SelectItem>
                        <SelectItem value="scale-down">Scale Down (Like contain, but won't scale up)</SelectItem>
                        <SelectItem value="none">None (Keep original size)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="svgAlignment" className="text-xs">Alignment</Label>
                    <Select
                      value={selectedWidget.config.svgAlignment || 'center'}
                      onValueChange={(value) => handleConfigChange('svgAlignment', value)}
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

                  <Separator />

                  <h4 className="text-sm font-medium">SVG Styling</h4>

                  <div className="space-y-1">
                    <Label className="text-xs">Border Radius: {selectedWidget.config.svgBorderRadius || 0}px</Label>
                    <Slider
                      value={[selectedWidget.config.svgBorderRadius || 0]}
                      onValueChange={([value]) => handleConfigChange('svgBorderRadius', value)}
                      max={50}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Border Width: {selectedWidget.config.svgBorderWidth || 0}px</Label>
                    <Slider
                      value={[selectedWidget.config.svgBorderWidth || 0]}
                      onValueChange={([value]) => handleConfigChange('svgBorderWidth', value)}
                      max={20}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="svgBorderColor" className="text-xs">Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.svgBorderColor || '#00000000'}
                        onChange={(e) => handleConfigChange('svgBorderColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.svgBorderColor || '#00000000'}
                        onChange={(e) => handleConfigChange('svgBorderColor', e.target.value)}
                        placeholder="#00000000"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="svgBackgroundColor" className="text-xs">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.config.svgBackgroundColor || '#00000000'}
                        onChange={(e) => handleConfigChange('svgBackgroundColor', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.config.svgBackgroundColor || '#00000000'}
                        onChange={(e) => handleConfigChange('svgBackgroundColor', e.target.value)}
                        placeholder="#00000000"
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Opacity: {Math.round((selectedWidget.config.svgOpacity || 1) * 100)}%</Label>
                    <Slider
                      value={[selectedWidget.config.svgOpacity || 1]}
                      onValueChange={([value]) => handleConfigChange('svgOpacity', value)}
                      max={1}
                      min={0}
                      step={0.05}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="svgPadding" className="text-xs">Padding</Label>
                    <Input
                      id="svgPadding"
                      value={selectedWidget.config.svgPadding || '0px'}
                      onChange={(e) => handleConfigChange('svgPadding', e.target.value)}
                      placeholder="e.g., 0px, 0.5rem"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="svgFilter" className="text-xs">SVG Filter</Label>
                    <Input
                      id="svgFilter"
                      value={selectedWidget.config.svgFilter || ''}
                      onChange={(e) => handleConfigChange('svgFilter', e.target.value)}
                      placeholder="e.g., grayscale(100%), blur(2px)"
                      className="h-8 text-sm"
                    />
                  </div>

                  <Separator />

                  <h4 className="text-sm font-medium">SVG Color Customization</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Detect and customize SVG colors dynamically
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-medium">Enable Color Detection</Label>
                      <p className="text-xs text-muted-foreground">Auto-detect colors in SVG paths</p>
                    </div>
                    <Switch
                      checked={selectedWidget.config.enableSvgColorDetection !== false}
                      onCheckedChange={(checked) => handleConfigChange('enableSvgColorDetection', checked)}
                    />
                  </div>

                  {selectedWidget.config.enableSvgColorDetection !== false && (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor="svgFillColor" className="text-xs">Primary Fill Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={selectedWidget.config.svgFillColor || '#000000'}
                            onChange={(e) => handleConfigChange('svgFillColor', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            value={selectedWidget.config.svgFillColor || '#000000'}
                            onChange={(e) => handleConfigChange('svgFillColor', e.target.value)}
                            placeholder="#000000"
                            className="flex-1 h-8 text-sm"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Override fill color for SVG paths
                        </p>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="svgStrokeColor" className="text-xs">Stroke Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={selectedWidget.config.svgStrokeColor || '#000000'}
                            onChange={(e) => handleConfigChange('svgStrokeColor', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            value={selectedWidget.config.svgStrokeColor || '#000000'}
                            onChange={(e) => handleConfigChange('svgStrokeColor', e.target.value)}
                            placeholder="#000000"
                            className="flex-1 h-8 text-sm"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Override stroke color for SVG paths
                        </p>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Stroke Width: {selectedWidget.config.svgStrokeWidth || 1}px</Label>
                        <Slider
                          value={[selectedWidget.config.svgStrokeWidth || 1]}
                          onValueChange={([value]) => handleConfigChange('svgStrokeWidth', value)}
                          max={10}
                          min={0}
                          step={0.5}
                          className="mt-2"
                        />
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show SVG Container</Label>
                    <Switch
                      checked={selectedWidget.config.showSvgContainer !== false}
                      onCheckedChange={(checked) => handleConfigChange('showSvgContainer', checked)}
                    />
                  </div>
                </>
              )}

              {/* Text Input Widget */}
              {selectedWidget.type === 'text-input' && (
                <TextInputConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* Payment Action Widget */}
              {selectedWidget.type === 'payment-action' && (
                <PaymentActionConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* WebRTC Viewer Widget */}
              {selectedWidget.type === 'webrtc-viewer' && (
                <WebRTCViewerConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* WebRTC Camera Widget */}
              {selectedWidget.type === 'webrtc-camera' && (
                <WebRTCCameraConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* 3D Viewer Widget */}
              {selectedWidget.type === '3d-viewer' && (
                <ThreeDViewerConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* Navigate Page Widget */}
              {selectedWidget.type === 'navigate-page' && (
                <NavigatePageConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                  pages={state.config?.pages || []}
                />
              )}

              {/* URL Button Widget */}
              {selectedWidget.type === 'url-button' && (
                <UrlButtonConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                  pages={state.config?.pages || []}
                />
              )}

              {/* Attitude Widget */}
              {selectedWidget.type === 'attitude' && (
                <AttitudeConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* Heatmap Widget */}
              {selectedWidget.type === 'heatmap' && (
                <HeatmapConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* HTML Viewer Widget */}
              {selectedWidget.type === 'html-viewer' && (
                <HtmlViewerConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* Map Widget */}
              {selectedWidget.type === 'map' && (
                <MapConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* Joystick Widget */}
              {selectedWidget.type === 'joystick' && (
                <JoystickConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* Text-to-Speech Widget */}
              {selectedWidget.type === 'text-to-speech' && (
                <TextToSpeechConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* Voice-to-Text Widget */}
              {selectedWidget.type === 'voice-to-text' && (
                <VoiceToTextConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* Mission Planning Map Widget */}
              {selectedWidget.type === 'mission-planning-map' && (
                <MissionPlanningMapConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* Video Player Widget */}
              {selectedWidget.type === 'video-player' && (
                <VideoPlayerConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* Countdown Timer Widget */}
              {selectedWidget.type === 'countdown-timer' && (
                <CountdownTimerConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* Schedule Widget */}
              {selectedWidget.type === 'schedule' && (
                <ScheduleConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* EM Spectrum Widget */}
              {selectedWidget.type === 'em-spectrum' && (
                <EMSpectrumConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* Spectral Graph Widget */}
              {selectedWidget.type === 'spectral-graph' && (
                <SpectralGraphConfig
                  widget={selectedWidget}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* 3D Vector Plotter Widget */}
              {selectedWidget.type === 'vector-plot-3d' && (
                <VectorPlot3DConfig
                  config={selectedWidget.config}
                  onConfigChange={handleConfigChange}
                />
              )}

              {/* 3D Virtual Twin Widget */}
              {selectedWidget.type === 'virtual-twin-3d' && (
                <VirtualTwin3DConfig
                  config={selectedWidget.config}
                  onConfigChange={handleConfigChange}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="style" className="m-0 p-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Appearance</h4>
              
              {/* Background Color */}
              <div className="space-y-1">
                <Label htmlFor="backgroundColor" className="text-xs">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={selectedWidget.style?.backgroundColor || '#ffffff'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="h-8 w-16"
                  />
                  <Input
                    value={selectedWidget.style?.backgroundColor || '#ffffff'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    placeholder="#ffffff"
                    className="h-8 flex-1 text-sm"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-1">
                <Label htmlFor="textColor" className="text-xs">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={selectedWidget.style?.textColor || '#000000'}
                    onChange={(e) => handleStyleChange('textColor', e.target.value)}
                    className="h-8 w-16"
                  />
                  <Input
                    value={selectedWidget.style?.textColor || '#000000'}
                    onChange={(e) => handleStyleChange('textColor', e.target.value)}
                    placeholder="#000000"
                    className="h-8 flex-1 text-sm"
                  />
                </div>
              </div>

              <Separator />

              {/* Border */}
              <h4 className="text-sm font-medium">Border</h4>
              
              <div className="space-y-1">
                <Label htmlFor="borderColor" className="text-xs">Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="borderColor"
                    type="color"
                    value={selectedWidget.style?.borderColor || '#e5e7eb'}
                    onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                    className="h-8 w-16"
                  />
                  <Input
                    value={selectedWidget.style?.borderColor || '#e5e7eb'}
                    onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                    placeholder="#e5e7eb"
                    className="h-8 flex-1 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="borderWidth" className="text-xs">Border Width</Label>
                  <Input
                    id="borderWidth"
                    type="number"
                    min="0"
                    max="20"
                    value={selectedWidget.style?.borderWidth !== undefined ? selectedWidget.style.borderWidth : 1}
                    onChange={(e) => handleStyleChange('borderWidth', parseInt(e.target.value) || 0)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="borderRadius" className="text-xs">Border Radius</Label>
                  <Input
                    id="borderRadius"
                    type="number"
                    min="0"
                    max="100"
                    value={selectedWidget.style?.borderRadius || 0}
                    onChange={(e) => handleStyleChange('borderRadius', parseInt(e.target.value) || 0)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <Separator />

              {/* Typography */}
              <h4 className="text-sm font-medium">Typography</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
                  <Input
                    id="fontSize"
                    value={selectedWidget.style?.fontSize || '14px'}
                    onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                    placeholder="14px"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fontWeight" className="text-xs">Font Weight</Label>
                  <Select
                    value={selectedWidget.style?.fontWeight || 'normal'}
                    onValueChange={(value) => handleStyleChange('fontWeight', value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="600">Semi-bold</SelectItem>
                      <SelectItem value="300">Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Advanced */}
              <h4 className="text-sm font-medium">Advanced</h4>
              
              <div className="space-y-1">
                <Label htmlFor="opacity" className="text-xs">Opacity</Label>
                <Input
                  id="opacity"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedWidget.style?.opacity || 1}
                  onChange={(e) => handleStyleChange('opacity', parseFloat(e.target.value) || 1)}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="padding" className="text-xs">Padding</Label>
                <Input
                  id="padding"
                  value={selectedWidget.style?.padding || '0px'}
                  onChange={(e) => handleStyleChange('padding', e.target.value)}
                  placeholder="0px"
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="zIndex" className="text-xs">Z-Index</Label>
                <Input
                  id="zIndex"
                  type="number"
                  value={selectedWidget.style?.zIndex || 0}
                  onChange={(e) => handleStyleChange('zIndex', parseInt(e.target.value) || 0)}
                  className="h-8 text-sm"
                />
              </div>

              <Separator />

              {/* Card Visibility */}
              <h4 className="text-sm font-medium">Card Visibility</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Control widget card visibility with smooth animations
              </p>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Show Card</Label>
                  <p className="text-xs text-muted-foreground">Hide/show the widget card</p>
                </div>
                <Switch
                  checked={selectedWidget.style?.cardVisible !== false}
                  onCheckedChange={(checked) => handleStyleChange('cardVisible', checked)}
                />
              </div>

              {selectedWidget.style?.cardVisible !== false && (
                <div className="space-y-1">
                  <Label htmlFor="cardFadeTransition" className="text-xs">Fade Transition Duration</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cardFadeTransition"
                      type="number"
                      value={selectedWidget.style?.cardFadeTransition || 300}
                      onChange={(e) => handleStyleChange('cardFadeTransition', parseInt(e.target.value) || 300)}
                      className="h-8 text-sm"
                      min="100"
                      max="1000"
                      step="50"
                    />
                    <span className="text-xs text-muted-foreground">ms</span>
                  </div>
                </div>
              )}

              <Separator />

              {/* Card Transparency */}
              <h4 className="text-sm font-medium">Card Transparency</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Adjust card background opacity (0-100%)
              </p>
              
              <div className="space-y-1">
                <Label className="text-xs">Card Opacity: {Math.round((selectedWidget.style?.cardOpacity !== undefined ? selectedWidget.style.cardOpacity : 1) * 100)}%</Label>
                <Slider
                  value={[selectedWidget.style?.cardOpacity !== undefined ? selectedWidget.style.cardOpacity : 1]}
                  onValueChange={([value]) => handleStyleChange('cardOpacity', value)}
                  max={1}
                  min={0}
                  step={0.05}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground">
                  Applies to card background only, text remains readable
                </p>
              </div>

              <Separator />

              {/* Shadow Customization */}
              <h4 className="text-sm font-medium">Shadow Effects</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Customize card shadow for depth and elevation
              </p>
              
              <div className="space-y-1">
                <Label htmlFor="shadowPreset" className="text-xs">Shadow Preset</Label>
                <Select
                  value={selectedWidget.style?.shadowPreset || 'medium'}
                  onValueChange={(value) => {
                    handleStyleChange('shadowPreset', value);
                    // Apply preset shadow values
                    if (value === 'none') {
                      handleStyleChange('boxShadow', 'none');
                    } else if (value === 'subtle') {
                      handleStyleChange('boxShadow', '0 1px 2px 0 rgba(0, 0, 0, 0.05)');
                    } else if (value === 'medium') {
                      handleStyleChange('boxShadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)');
                    } else if (value === 'strong') {
                      handleStyleChange('boxShadow', '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)');
                    }
                    // For custom, keep current boxShadow value
                  }}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="subtle">Subtle</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="strong">Strong</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedWidget.style?.shadowPreset === 'custom' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="shadowOffsetX" className="text-xs">Horizontal Offset</Label>
                      <div className="flex items-center gap-1">
                        <Input
                          id="shadowOffsetX"
                          type="number"
                          value={selectedWidget.style?.shadowOffsetX || 0}
                          onChange={(e) => {
                            handleStyleChange('shadowOffsetX', parseInt(e.target.value) || 0);
                            updateCustomShadow();
                          }}
                          className="h-8 text-sm"
                          min="-50"
                          max="50"
                        />
                        <span className="text-xs text-muted-foreground">px</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="shadowOffsetY" className="text-xs">Vertical Offset</Label>
                      <div className="flex items-center gap-1">
                        <Input
                          id="shadowOffsetY"
                          type="number"
                          value={selectedWidget.style?.shadowOffsetY || 4}
                          onChange={(e) => {
                            handleStyleChange('shadowOffsetY', parseInt(e.target.value) || 0);
                            updateCustomShadow();
                          }}
                          className="h-8 text-sm"
                          min="-50"
                          max="50"
                        />
                        <span className="text-xs text-muted-foreground">px</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="shadowBlur" className="text-xs">Blur Radius</Label>
                      <div className="flex items-center gap-1">
                        <Input
                          id="shadowBlur"
                          type="number"
                          value={selectedWidget.style?.shadowBlur || 6}
                          onChange={(e) => {
                            handleStyleChange('shadowBlur', parseInt(e.target.value) || 0);
                            updateCustomShadow();
                          }}
                          className="h-8 text-sm"
                          min="0"
                          max="100"
                        />
                        <span className="text-xs text-muted-foreground">px</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="shadowSpread" className="text-xs">Spread Radius</Label>
                      <div className="flex items-center gap-1">
                        <Input
                          id="shadowSpread"
                          type="number"
                          value={selectedWidget.style?.shadowSpread || 0}
                          onChange={(e) => {
                            handleStyleChange('shadowSpread', parseInt(e.target.value) || 0);
                            updateCustomShadow();
                          }}
                          className="h-8 text-sm"
                          min="-50"
                          max="50"
                        />
                        <span className="text-xs text-muted-foreground">px</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="shadowColor" className="text-xs">Shadow Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.style?.shadowColor || '#000000'}
                        onChange={(e) => {
                          handleStyleChange('shadowColor', e.target.value);
                          updateCustomShadow();
                        }}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.style?.shadowColor || '#000000'}
                        onChange={(e) => {
                          handleStyleChange('shadowColor', e.target.value);
                          updateCustomShadow();
                        }}
                        placeholder="#000000"
                        className="h-8 flex-1 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Shadow Opacity: {Math.round((selectedWidget.style?.shadowOpacity !== undefined ? selectedWidget.style.shadowOpacity : 0.1) * 100)}%</Label>
                    <Slider
                      value={[selectedWidget.style?.shadowOpacity !== undefined ? selectedWidget.style.shadowOpacity : 0.1]}
                      onValueChange={([value]) => {
                        handleStyleChange('shadowOpacity', value);
                        updateCustomShadow();
                      }}
                      max={1}
                      min={0}
                      step={0.05}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="customBoxShadow" className="text-xs">Computed Shadow (CSS)</Label>
                    <Input
                      id="customBoxShadow"
                      value={selectedWidget.style?.boxShadow || ''}
                      onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
                      placeholder="0 4px 6px rgba(0,0,0,0.1)"
                      className="h-8 text-sm font-mono text-xs"
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-computed from values above
                    </p>
                  </div>
                </>
              )}

              <Separator />

              {/* Glass Effect */}
              <h4 className="text-sm font-medium">Glass Effect</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Apply frosted glass appearance with backdrop blur
              </p>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Enable Glass Effect</Label>
                  <p className="text-xs text-muted-foreground">Modern translucent appearance</p>
                </div>
                <Switch
                  checked={selectedWidget.style?.glassEffect === true}
                  onCheckedChange={(checked) => {
                    // Use batch update for better state management
                    if (checked) {
                      // Set default glass effect values when enabling
                      const updates = {
                        glassEffect: true,
                        glassBlur: selectedWidget.style?.glassBlur || 10,
                        glassOpacity: selectedWidget.style?.glassOpacity || 0.7,
                        glassBorder: selectedWidget.style?.glassBorder !== false ? true : false,
                        glassTint: selectedWidget.style?.glassTint || '#ffffff'
                      };
                      // Update all at once
                      if (selectedWidget) {
                        actions.updateWidget(selectedWidget.id, {
                          style: { ...selectedWidget.style, ...updates }
                        });
                      }
                    } else {
                      // Just disable glass effect
                      handleStyleChange('glassEffect', false);
                    }
                  }}
                />
              </div>

              {selectedWidget.style?.glassEffect === true && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Background Blur: {selectedWidget.style?.glassBlur || 10}px</Label>
                    <Slider
                      value={[selectedWidget.style?.glassBlur || 10]}
                      onValueChange={([value]) => handleStyleChange('glassBlur', value)}
                      max={20}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Backdrop filter blur amount (0-20px)
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Glass Opacity: {Math.round((selectedWidget.style?.glassOpacity || 0.7) * 100)}%</Label>
                    <Slider
                      value={[selectedWidget.style?.glassOpacity || 0.7]}
                      onValueChange={([value]) => handleStyleChange('glassOpacity', value)}
                      max={0.8}
                      min={0.2}
                      step={0.05}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Semi-transparent background (20-80%)
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-medium">Light Border Highlight</Label>
                      <p className="text-xs text-muted-foreground">Subtle border glow</p>
                    </div>
                    <Switch
                      checked={selectedWidget.style?.glassBorder !== false}
                      onCheckedChange={(checked) => handleStyleChange('glassBorder', checked)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="glassTint" className="text-xs">Glass Tint Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedWidget.style?.glassTint || '#ffffff'}
                        onChange={(e) => handleStyleChange('glassTint', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={selectedWidget.style?.glassTint || '#ffffff'}
                        onChange={(e) => handleStyleChange('glassTint', e.target.value)}
                        placeholder="#ffffff"
                        className="h-8 flex-1 text-sm"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Base color for the frosted effect
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> Glass effect uses backdrop-filter which is supported in modern browsers (Chrome 76+, Safari 9+, Edge 79+). A fallback style is automatically applied for older browsers.
                    </p>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="config" className="m-0 p-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Widget Events</h4>
              <p className="text-xs text-muted-foreground">
                Configure events to trigger actions on target devices
              </p>
              
              {/* Event List */}
              <div className="space-y-2">
                {(selectedWidget.config.widgetEvents || []).map((event: WidgetEvent, eventIndex: number) => (
                  <Card key={event.id} className="border-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {event.eventType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.targets.length} target{event.targets.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const events = selectedWidget.config.widgetEvents.filter((e: WidgetEvent) => e.id !== event.id);
                            handleConfigChange('widgetEvents', events);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Event Type Selector */}
                      <div className="space-y-1">
                        <Label className="text-xs">Event Type</Label>
                        <Select
                          value={event.eventType}
                          onValueChange={(value: IoTWidgetEventType) => {
                            const events = [...selectedWidget.config.widgetEvents];
                            events[eventIndex] = { ...events[eventIndex], eventType: value };
                            handleConfigChange('widgetEvents', events);
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getWidgetSupportedEvents(selectedWidget.type).map((eventType) => (
                              <SelectItem key={eventType} value={eventType} className="text-xs">
                                {eventType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      {/* Targets */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Target Devices</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const events = [...selectedWidget.config.widgetEvents];
                              events[eventIndex] = {
                                ...events[eventIndex],
                                targets: [
                                  ...events[eventIndex].targets,
                                  {
                                    targetId: '',
                                    payload: { commands: [] }
                                  }
                                ]
                              };
                              handleConfigChange('widgetEvents', events);
                            }}
                            className="h-6 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Target
                          </Button>
                        </div>

                        {event.targets.map((target: EventTarget, targetIndex: number) => (
                          <Card key={targetIndex} className="bg-muted/30">
                            <CardContent className="pt-3 space-y-2">
                              {/* Target Device Selection */}
                              <div className="flex items-center gap-2">
                                <div className="flex-1 space-y-1">
                                  <Label className="text-xs">Device ID</Label>
                                  <Select
                                    value={target.targetId}
                                    onValueChange={(value) => {
                                      const events = [...selectedWidget.config.widgetEvents];
                                      events[eventIndex].targets[targetIndex].targetId = value;
                                      handleConfigChange('widgetEvents', events);
                                      
                                      // Load commands for this device
                                      const device = devices.find(d => d.id === value);
                                      if (device) {
                                        loadCommandsForDevice(device.id, device.product_id);
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="h-7 text-xs">
                                      <SelectValue placeholder="Select device" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {loadingDevices ? (
                                        <div className="p-2 text-xs text-muted-foreground">Loading...</div>
                                      ) : devices.length === 0 ? (
                                        <div className="p-2 text-xs text-muted-foreground">No devices found</div>
                                      ) : (
                                        devices.map((device) => (
                                          <SelectItem key={device.id} value={device.id} className="text-xs">
                                            {device.name}
                                          </SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const events = [...selectedWidget.config.widgetEvents];
                                    events[eventIndex].targets.splice(targetIndex, 1);
                                    handleConfigChange('widgetEvents', events);
                                  }}
                                  className="h-7 w-7 p-0 mt-5"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>

                              {/* Manual Device ID Input */}
                              <div className="space-y-1">
                                <Label className="text-xs">Or enter manually</Label>
                                <Input
                                  value={target.targetId}
                                  onChange={(e) => {
                                    const events = [...selectedWidget.config.widgetEvents];
                                    events[eventIndex].targets[targetIndex].targetId = e.target.value;
                                    handleConfigChange('widgetEvents', events);
                                  }}
                                  placeholder="device-id"
                                  className="h-7 text-xs"
                                />
                              </div>

                              <Separator />

                              {/* Commands */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs font-medium">Commands</Label>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const events = [...selectedWidget.config.widgetEvents];
                                      events[eventIndex].targets[targetIndex].payload.commands.push({
                                        command: '',
                                        actions: []
                                      });
                                      handleConfigChange('widgetEvents', events);
                                    }}
                                    className="h-6 text-xs"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Command
                                  </Button>
                                </div>

                                {target.payload.commands.map((command: EventCommand, commandIndex: number) => {
                                  const availableCommands = target.targetId && deviceCommands[target.targetId] ? deviceCommands[target.targetId] : [];
                                  const selectedCommand = availableCommands.find((cmd: any) => cmd.name === command.command);
                                  
                                  return (
                                  <Card key={commandIndex} className="bg-background">
                                    <CardContent className="pt-2 space-y-2">
                                      {/* Command Name */}
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 space-y-1">
                                          <Label className="text-xs">Command</Label>
                                          {availableCommands.length > 0 ? (
                                            <div className="space-y-1">
                                              <Select
                                                value={command.command}
                                                onValueChange={(value) => {
                                                  const events = [...selectedWidget.config.widgetEvents];
                                                  events[eventIndex].targets[targetIndex].payload.commands[commandIndex].command = value;
                                                  handleConfigChange('widgetEvents', events);
                                                }}
                                              >
                                                <SelectTrigger className="h-7 text-xs">
                                                  <SelectValue placeholder="Select command" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {loadingCommands[target.targetId] ? (
                                                    <div className="p-2 text-xs text-muted-foreground">Loading...</div>
                                                  ) : (
                                                    availableCommands.map((cmd: any) => (
                                                      <SelectItem key={cmd.id} value={cmd.name} className="text-xs">
                                                        <div>
                                                          <div className="font-medium">{cmd.name}</div>
                                                          {cmd.description && (
                                                            <div className="text-xs text-muted-foreground">{cmd.description}</div>
                                                          )}
                                                        </div>
                                                      </SelectItem>
                                                    ))
                                                  )}
                                                </SelectContent>
                                              </Select>
                                              <Input
                                                value={command.command}
                                                onChange={(e) => {
                                                  const events = [...selectedWidget.config.widgetEvents];
                                                  events[eventIndex].targets[targetIndex].payload.commands[commandIndex].command = e.target.value;
                                                  handleConfigChange('widgetEvents', events);
                                                }}
                                                placeholder="Or enter manually"
                                                className="h-6 text-xs"
                                              />
                                            </div>
                                          ) : (
                                            <Input
                                              value={command.command}
                                              onChange={(e) => {
                                                const events = [...selectedWidget.config.widgetEvents];
                                                events[eventIndex].targets[targetIndex].payload.commands[commandIndex].command = e.target.value;
                                                handleConfigChange('widgetEvents', events);
                                              }}
                                              placeholder="e.g., setSpeed, setDirection"
                                              className="h-7 text-xs"
                                            />
                                          )}
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            const events = [...selectedWidget.config.widgetEvents];
                                            events[eventIndex].targets[targetIndex].payload.commands.splice(commandIndex, 1);
                                            handleConfigChange('widgetEvents', events);
                                          }}
                                          className="h-7 w-7 p-0 mt-5"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>

                                      {/* Actions */}
                                      <div className="space-y-2 pl-2 border-l-2 border-muted">
                                        <div className="flex items-center justify-between">
                                          <Label className="text-xs font-medium">Actions</Label>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              const events = [...selectedWidget.config.widgetEvents];
                                              events[eventIndex].targets[targetIndex].payload.commands[commandIndex].actions.push({
                                                action: '',
                                                params: {}
                                              });
                                              handleConfigChange('widgetEvents', events);
                                            }}
                                            className="h-5 text-xs px-2"
                                          >
                                            <Plus className="w-2 h-2 mr-1" />
                                            Action
                                          </Button>
                                        </div>

                                        {command.actions.map((action: EventAction, actionIndex: number) => {
                                          const availableActions = selectedCommand?.actions || [];
                                          const selectedAction = availableActions.find((act: any) => act.name === action.action);
                                          
                                          return (
                                          <div key={actionIndex} className="space-y-2 bg-muted/30 p-2 rounded">
                                            {/* Action Name */}
                                            <div className="flex items-center gap-2">
                                              <div className="flex-1 space-y-1">
                                                <Label className="text-xs">Action</Label>
                                                {availableActions.length > 0 ? (
                                                  <div className="space-y-1">
                                                    <Select
                                                      value={action.action}
                                                      onValueChange={(value) => {
                                                        const events = [...selectedWidget.config.widgetEvents];
                                                        events[eventIndex].targets[targetIndex].payload.commands[commandIndex].actions[actionIndex].action = value;
                                                        
                                                        // Auto-fill parameters with defaults if available
                                                        const selectedAct = availableActions.find((act: any) => act.name === value);
                                                        if (selectedAct?.parameters) {
                                                          const defaultParams: Record<string, any> = {};
                                                          selectedAct.parameters.forEach((param: any) => {
                                                            if (param.default_value !== null && param.default_value !== undefined) {
                                                              defaultParams[param.name] = param.default_value;
                                                            }
                                                          });
                                                          if (Object.keys(defaultParams).length > 0) {
                                                            events[eventIndex].targets[targetIndex].payload.commands[commandIndex].actions[actionIndex].params = defaultParams;
                                                          }
                                                        }
                                                        
                                                        handleConfigChange('widgetEvents', events);
                                                      }}
                                                    >
                                                      <SelectTrigger className="h-6 text-xs">
                                                        <SelectValue placeholder="Select action" />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        {availableActions.map((act: any) => (
                                                          <SelectItem key={act.id} value={act.name} className="text-xs">
                                                            <div>
                                                              <div className="font-medium">{act.name}</div>
                                                              {act.description && (
                                                                <div className="text-xs text-muted-foreground">{act.description}</div>
                                                              )}
                                                            </div>
                                                          </SelectItem>
                                                        ))}
                                                      </SelectContent>
                                                    </Select>
                                                    <Input
                                                      value={action.action}
                                                      onChange={(e) => {
                                                        const events = [...selectedWidget.config.widgetEvents];
                                                        events[eventIndex].targets[targetIndex].payload.commands[commandIndex].actions[actionIndex].action = e.target.value;
                                                        handleConfigChange('widgetEvents', events);
                                                      }}
                                                      placeholder="Or enter manually"
                                                      className="h-6 text-xs"
                                                    />
                                                  </div>
                                                ) : (
                                                  <Input
                                                    value={action.action}
                                                    onChange={(e) => {
                                                      const events = [...selectedWidget.config.widgetEvents];
                                                      events[eventIndex].targets[targetIndex].payload.commands[commandIndex].actions[actionIndex].action = e.target.value;
                                                      handleConfigChange('widgetEvents', events);
                                                    }}
                                                    placeholder="e.g., updateMotorSpeed"
                                                    className="h-6 text-xs"
                                                  />
                                                )}
                                              </div>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                  const events = [...selectedWidget.config.widgetEvents];
                                                  events[eventIndex].targets[targetIndex].payload.commands[commandIndex].actions.splice(actionIndex, 1);
                                                  handleConfigChange('widgetEvents', events);
                                                }}
                                                className="h-6 w-6 p-0 mt-5"
                                              >
                                                <Trash2 className="w-2 h-2" />
                                              </Button>
                                            </div>

                                            {/* Parameters */}
                                            <div className="space-y-1">
                                              <Label className="text-xs">Parameters{selectedAction?.parameters && selectedAction.parameters.length > 0 && ' (JSON)'}  </Label>
                                              {selectedAction?.parameters && selectedAction.parameters.length > 0 && (
                                                <div className="text-xs text-muted-foreground mb-1 bg-muted p-2 rounded">
                                                  <p className="font-medium mb-1">Available parameters:</p>
                                                  {selectedAction.parameters.map((param: any) => (
                                                    <div key={param.id} className="flex items-center gap-1 text-xs">
                                                      <code className="bg-background px-1 rounded">{param.name}</code>
                                                      <span className="text-muted-foreground">({param.type})</span>
                                                      {param.required && <Badge variant="destructive" className="h-3 text-[10px]">Required</Badge>}
                                                      {param.default_value && <span className="text-muted-foreground">= {JSON.stringify(param.default_value)}</span>}
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                              <Textarea
                                                key={`params-${eventIndex}-${targetIndex}-${commandIndex}-${actionIndex}`}
                                                defaultValue={JSON.stringify(action.params || {}, null, 2)}
                                                onChange={(e) => {
                                                  // Debounced update - allow typing freely
                                                  const rawValue = e.target.value;
                                                  try {
                                                    const params = JSON.parse(rawValue);
                                                    const events = [...selectedWidget.config.widgetEvents];
                                                    events[eventIndex].targets[targetIndex].payload.commands[commandIndex].actions[actionIndex].params = params;
                                                    handleConfigChange('widgetEvents', events);
                                                  } catch (err) {
                                                    // Invalid JSON - allow continued typing
                                                  }
                                                }}
                                                placeholder='{"value": "text from input"}'
                                                className="h-16 text-xs font-mono"
                                              />
                                              <p className="text-xs text-muted-foreground">
                                                💡 For text-input: The typed text auto-replaces empty "" values when submitted!
                                              </p>
                                            </div>
                                          </div>
                                          );
                                        })}
                                      </div>
                                    </CardContent>
                                  </Card>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add Event Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const supportedEvents = getWidgetSupportedEvents(selectedWidget.type);
                    const newEvent: WidgetEvent = {
                      id: `event_${Date.now()}`,
                      eventType: supportedEvents[0] || 'click',
                      targets: []
                    };
                    const events = [...(selectedWidget.config.widgetEvents || []), newEvent];
                    handleConfigChange('widgetEvents', events);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>

              <Separator className="my-4" />

              {/* Example Output Preview */}
              {selectedWidget.config.widgetEvents && selectedWidget.config.widgetEvents.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">WebSocket Message Preview</Label>
                  <div className="bg-muted/50 rounded p-2 text-xs font-mono overflow-auto max-h-64">
                    <pre className="text-xs">
                      {JSON.stringify(
                        selectedWidget.config.widgetEvents.map((event: WidgetEvent) => ({
                          eventType: event.eventType,
                          targets: event.targets
                        })),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All configured events and their WebSocket targets. Each event will send its targets when triggered.
                  </p>
                </div>
              )}

              <div className="pt-4">
                <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3">
                  <p className="font-medium mb-1">💡 Event Configuration</p>
                  <p>Configure events to trigger commands on target devices when widget interactions occur.</p>
                  <p className="mt-2">Available events depend on the widget type. Each event can target multiple devices with multiple commands and actions.</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};
