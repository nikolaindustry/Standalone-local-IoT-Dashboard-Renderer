// Independent IoT Widget Library
// No dependencies on Product Dashboard Designer

import React, { useState } from 'react';
import { useIoTBuilder } from '../contexts/IoTBuilderContext';
import { IoTWidgetType } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, 
  MousePointer2, 
  ToggleLeft, 
  Gauge, 
  Sliders, 
  Activity, 
  BarChart3, 
  FileText, 
  Image as ImageIcon,
  Type,
  Circle,
  Table,
  Palette,
  List,
  MapPin,
  Square,
  Triangle,
  Star,
  Minus,
  ArrowRight,
  Hexagon,
  Monitor,
  Gamepad2,
  FileImage,
  Navigation,
  Database,
  Code,
  Box,
  Clock,
  Timer,
  Calendar,
  Zap,
  ExternalLink,
  Video,
  Keyboard,
  Waves,
  Activity as ActivityIcon,
  CreditCard
} from 'lucide-react';

const iotWidgetTypes: Array<{
  type: IoTWidgetType;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  category: string;
}> = [
  { type: 'button', label: 'Button', icon: MousePointer2, description: 'Interactive button for commands', category: 'Controls' },
  { type: 'switch', label: 'Switch', icon: ToggleLeft, description: 'Toggle switch control', category: 'Controls' },
  { type: 'slider', label: 'Slider', icon: Sliders, description: 'Range input slider', category: 'Controls' },
  { type: 'text-input', label: 'Text Input', icon: Keyboard, description: 'Text input field with validation', category: 'Controls' },
  { type: 'gauge', label: 'Gauge', icon: Gauge, description: 'Circular progress indicator', category: 'Display' },
  { type: 'status', label: 'Status', icon: Activity, description: 'Status indicator', category: 'Display' },
  { type: 'chart', label: 'Chart', icon: BarChart3, description: 'Data visualization chart', category: 'Display' },
  { type: 'form', label: 'Form', icon: FileText, description: 'Interactive form with fields', category: 'Controls' },
  { type: 'image', label: 'Image', icon: ImageIcon, description: 'Display images', category: 'Display' },
  { type: 'svg', label: 'SVG', icon: FileImage, description: 'Display scalable vector graphics', category: 'Display' },
  { type: 'label', label: 'Label', icon: Type, description: 'Text label display', category: 'Display' },
  { type: 'table', label: 'Table', icon: Table, description: 'Display database table data', category: 'Display' },
  { type: 'dynamic-repeater', label: 'Dynamic Repeater', icon: List, description: 'Display data as repeated child widgets', category: 'Display' },
  { type: 'database-form', label: 'Database Form', icon: Database, description: 'Form to submit data to database', category: 'Controls' },
  { type: 'color-picker', label: 'Color Picker', icon: Palette, description: 'Select colors for RGB LED control', category: 'Controls' },
  { type: 'menu', label: 'Menu', icon: List, description: 'Navigation menu for dashboard pages', category: 'Navigation' },
  { type: 'navigate-page', label: 'Navigate Page', icon: Navigation, description: 'Button for navigating to specific pages', category: 'Navigation' },
  { type: 'url-button', label: 'URL Button', icon: ExternalLink, description: 'Navigate to internal pages or external URLs', category: 'Navigation' },
  { type: 'map', label: 'Map', icon: MapPin, description: 'Interactive map widget', category: 'Display' },
  { type: 'mission-planning-map', label: 'Mission Planning Map', icon: Navigation, description: 'Plan and execute drone/rover missions with waypoints, routes, and boundaries', category: 'Display' },
  { type: 'joystick', label: 'Joystick', icon: Gamepad2, description: 'Interactive joystick for directional control', category: 'Controls' },
  { type: 'compass', label: 'Compass', icon: Navigation, description: 'Directional compass for navigation and orientation', category: 'Display' },
  { type: 'heatmap', label: 'Heatmap', icon: Activity, description: 'Visual heatmap for data intensity visualization', category: 'Display' },
  { type: 'attitude', label: 'Attitude Indicator', icon: Gauge, description: 'Aircraft attitude indicator showing roll and pitch', category: 'Display' },
  { type: 'html-viewer', label: 'HTML Viewer', icon: Code, description: 'Display HTML content in a sandboxed viewer', category: 'Display' },
  { type: '3d-viewer', label: '3D Viewer', icon: Box, description: 'Interactive 3D model viewer for 3MF, STL, OBJ, GLTF files', category: 'Display' },
  { type: 'datetime-weather', label: 'Date/Time & Weather', icon: Activity, description: 'Display current date, time and weather information', category: 'Display' },
  { type: 'countdown-timer', label: 'Countdown Timer', icon: Clock, description: 'Configurable countdown timer with start, pause, and reset controls', category: 'Controls' },
  { type: 'schedule', label: 'Schedule Manager', icon: Calendar, description: 'View and manage device schedules with create, edit, and delete capabilities', category: 'Controls' },
  { type: 'rule', label: 'Rule Manager', icon: Zap, description: 'View and manage automation rules with create, edit, and activate/deactivate capabilities', category: 'Controls' },
  { type: 'text-to-speech', label: 'Text to Speech', icon: Monitor, description: 'Converts text from WebSocket messages to speech instantly', category: 'Display' },
  { type: 'webrtc-viewer', label: 'WebRTC Viewer', icon: Video, description: 'Display live video streams from WebRTC cameras', category: 'Display' },
  { type: 'webrtc-camera', label: 'WebRTC Camera', icon: Video, description: 'Stream local camera to WebRTC viewers', category: 'Controls' },
  { type: 'voice-to-text', label: 'Voice to Text', icon: Monitor, description: 'Convert speech to text and send via WebSocket', category: 'Controls' },
  { type: 'video-player', label: 'Video Player', icon: Video, description: 'Play video content from URL with standard controls', category: 'Display' },
  { type: 'spotify-player', label: 'Spotify Player', icon: Activity, description: 'Play music from Spotify and control audio hardware', category: 'Controls' },
  { type: 'payment-action', label: 'Payment Widget', icon: CreditCard, description: 'Accept payments and trigger actions', category: 'Controls' },
  // Geometric shapes
  { type: 'rectangle', label: 'Rectangle', icon: Square, description: 'Rectangle or square shape', category: 'Shapes' },
  { type: 'ellipse', label: 'Ellipse', icon: Circle, description: 'Ellipse or circle shape', category: 'Shapes' },
  { type: 'triangle', label: 'Triangle', icon: Triangle, description: 'Triangle shape (equilateral, right, isosceles)', category: 'Shapes' },
  { type: 'polygon', label: 'Polygon', icon: Hexagon, description: 'Polygon shape (pentagon, hexagon, etc.)', category: 'Shapes' },
  { type: 'star', label: 'Star', icon: Star, description: 'Star shape', category: 'Shapes' },
  { type: 'line', label: 'Line', icon: Minus, description: 'Line shape (straight, diagonal)', category: 'Shapes' },
  { type: 'arrow', label: 'Arrow', icon: ArrowRight, description: 'Arrow shape (single, double, curved)', category: 'Shapes' },
  { type: 'em-spectrum', label: 'EM Spectrum', icon: Waves, description: 'Electromagnetic spectrum visualization with customizable bands', category: 'Display' },
  { type: 'spectral-graph', label: 'Spectral Graph', icon: ActivityIcon, description: 'Real-time graph visualization with wavelength association for WebSocket data', category: 'Display' },
  { type: 'vector-plot-3d', label: '3D Vector Plotter', icon: Box, description: 'Render 3D vectors from real-time data with customizable styling', category: 'Display' },
  { type: 'virtual-twin-3d', label: '3D Virtual Twin', icon: Box, description: 'Virtual cloning platform for hardware processes with 3D model rendering and real-time control', category: 'Display' }
];

export const IoTWidgetLibrary: React.FC = () => {
  const { state, actions } = useIoTBuilder();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWidgets = iotWidgetTypes.filter(widget =>
    widget.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    widget.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(filteredWidgets.map(w => w.category)));

  const handleWidgetSelect = (type: IoTWidgetType) => {
    actions.setTool(type);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">IoT Widget Library</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search widgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto space-y-4">
        {categories.map(category => (
          <div key={category}>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">{category}</h3>
            <div className="grid grid-cols-2 gap-2">
              {filteredWidgets
                .filter(widget => widget.category === category)
                .map(widget => {
                  const Icon = widget.icon;
                  const isActive = state.activeTool === widget.type;
                  
                  return (
                    <Button
                      key={widget.type}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => handleWidgetSelect(widget.type)}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{widget.label}</span>
                    </Button>
                  );
                })}
            </div>
          </div>
        ))}
        
        {filteredWidgets.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No widgets found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
