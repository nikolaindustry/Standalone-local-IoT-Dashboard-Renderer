/**
 * WebRTCViewerConfig Component
 * 
 * Independent configuration panel for WebRTC Viewer widgets in the IoT Dashboard Builder.
 * Provides comprehensive property settings with the same functionality as the product dashboard designer.
 * 
 * Features:
 * - Server URL configuration for WebSocket signaling server
 * - Room name for joining specific video streams
 * - Camera ID to identify specific camera sources
 * - Auto-connect toggle for automatic stream initialization
 * - Audio enable/disable control
 * - Video quality and display settings
 * 
 * @component
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Video } from 'lucide-react';
import { IoTDashboardWidget } from '../../types';

interface WebRTCViewerConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (key: string, value: any) => void;
}

export const WebRTCViewerConfig: React.FC<WebRTCViewerConfigProps> = ({
  widget,
  onConfigChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4" />
        <h4 className="text-sm font-semibold">WebRTC Viewer Settings</h4>
      </div>

      {/* Connection Settings */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Connection</Label>
        
        <div className="space-y-1">
          <Label htmlFor="webrtcServerUrl" className="text-xs">Server URL</Label>
          <Input
            id="webrtcServerUrl"
            value={widget.config.webrtcServerUrl || 'wss://nikolaindustry-webrtc.onrender.com'}
            onChange={(e) => onConfigChange('webrtcServerUrl', e.target.value)}
            placeholder="wss://your-server.com"
            className="h-8 text-sm font-mono"
          />
          <p className="text-xs text-muted-foreground">
            WebSocket URL of the signaling server
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="webrtcRoomName" className="text-xs">Room Name</Label>
          <Input
            id="webrtcRoomName"
            value={widget.config.webrtcRoomName || 'cctv'}
            onChange={(e) => onConfigChange('webrtcRoomName', e.target.value)}
            placeholder="Enter room name"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Room to join on the signaling server
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="webrtcCameraId" className="text-xs">Camera ID</Label>
          <Input
            id="webrtcCameraId"
            value={widget.config.webrtcCameraId || ''}
            onChange={(e) => onConfigChange('webrtcCameraId', e.target.value)}
            placeholder="Enter camera ID"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            ID of the camera to view
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="webrtcAutoConnect" className="text-xs">Auto Connect</Label>
          <Switch
            id="webrtcAutoConnect"
            checked={widget.config.webrtcAutoConnect !== false}
            onCheckedChange={(checked) => onConfigChange('webrtcAutoConnect', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Automatically connect to stream on widget load
        </p>
      </div>

      <Separator />

      {/* Media Settings */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Media Settings</Label>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="webrtcEnableAudio" className="text-xs">Enable Audio</Label>
          <Switch
            id="webrtcEnableAudio"
            checked={widget.config.webrtcEnableAudio !== false}
            onCheckedChange={(checked) => onConfigChange('webrtcEnableAudio', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Receive and play audio from the stream
        </p>

        <div className="flex items-center justify-between">
          <Label htmlFor="webrtcEnableVideo" className="text-xs">Enable Video</Label>
          <Switch
            id="webrtcEnableVideo"
            checked={widget.config.webrtcEnableVideo !== false}
            onCheckedChange={(checked) => onConfigChange('webrtcEnableVideo', checked)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="webrtcVideoQuality" className="text-xs">Video Quality</Label>
          <Select
            value={widget.config.webrtcVideoQuality || 'auto'}
            onValueChange={(value) => onConfigChange('webrtcVideoQuality', value)}
          >
            <SelectTrigger id="webrtcVideoQuality" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="high">High (1080p)</SelectItem>
              <SelectItem value="medium">Medium (720p)</SelectItem>
              <SelectItem value="low">Low (480p)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Display Settings */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Display Settings</Label>
        
        <div className="space-y-1">
          <Label htmlFor="webrtcObjectFit" className="text-xs">Object Fit</Label>
          <Select
            value={widget.config.webrtcObjectFit || 'contain'}
            onValueChange={(value) => onConfigChange('webrtcObjectFit', value)}
          >
            <SelectTrigger id="webrtcObjectFit" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contain">Contain (Fit with aspect ratio)</SelectItem>
              <SelectItem value="cover">Cover (Fill entire area)</SelectItem>
              <SelectItem value="fill">Fill (Stretch to fit)</SelectItem>
              <SelectItem value="none">None (Original size)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="webrtcShowControls" className="text-xs">Show Controls</Label>
          <Switch
            id="webrtcShowControls"
            checked={widget.config.webrtcShowControls !== false}
            onCheckedChange={(checked) => onConfigChange('webrtcShowControls', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Display video controls overlay
        </p>

        <div className="flex items-center justify-between">
          <Label htmlFor="webrtcMuted" className="text-xs">Muted by Default</Label>
          <Switch
            id="webrtcMuted"
            checked={widget.config.webrtcMuted || false}
            onCheckedChange={(checked) => onConfigChange('webrtcMuted', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Advanced Settings */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Advanced Settings</Label>
        
        <div className="space-y-1">
          <Label htmlFor="webrtcReconnectInterval" className="text-xs">Reconnect Interval (ms)</Label>
          <Input
            id="webrtcReconnectInterval"
            type="number"
            value={widget.config.webrtcReconnectInterval || 3000}
            onChange={(e) => onConfigChange('webrtcReconnectInterval', parseInt(e.target.value) || 3000)}
            placeholder="3000"
            min="1000"
            max="30000"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Time between reconnection attempts
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="webrtcMaxReconnectAttempts" className="text-xs">Max Reconnect Attempts</Label>
          <Input
            id="webrtcMaxReconnectAttempts"
            type="number"
            value={widget.config.webrtcMaxReconnectAttempts || 5}
            onChange={(e) => onConfigChange('webrtcMaxReconnectAttempts', parseInt(e.target.value) || 5)}
            placeholder="5"
            min="1"
            max="20"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Maximum number of reconnection attempts
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="webrtcShowStats" className="text-xs">Show Connection Stats</Label>
          <Switch
            id="webrtcShowStats"
            checked={widget.config.webrtcShowStats || false}
            onCheckedChange={(checked) => onConfigChange('webrtcShowStats', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Display connection statistics overlay
        </p>

        <div className="flex items-center justify-between">
          <Label htmlFor="webrtcDebugMode" className="text-xs">Debug Mode</Label>
          <Switch
            id="webrtcDebugMode"
            checked={widget.config.webrtcDebugMode || false}
            onCheckedChange={(checked) => onConfigChange('webrtcDebugMode', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Enable console logging for debugging
        </p>
      </div>

      <Separator />

      {/* ICE Servers Configuration */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">ICE Servers (Optional)</Label>
        
        <div className="space-y-1">
          <Label htmlFor="webrtcStunServer" className="text-xs">STUN Server</Label>
          <Input
            id="webrtcStunServer"
            value={widget.config.webrtcStunServer || 'stun:stun.l.google.com:19302'}
            onChange={(e) => onConfigChange('webrtcStunServer', e.target.value)}
            placeholder="stun:stun.l.google.com:19302"
            className="h-8 text-sm font-mono"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="webrtcTurnServer" className="text-xs">TURN Server (Optional)</Label>
          <Input
            id="webrtcTurnServer"
            value={widget.config.webrtcTurnServer || ''}
            onChange={(e) => onConfigChange('webrtcTurnServer', e.target.value)}
            placeholder="turn:your-server.com:3478"
            className="h-8 text-sm font-mono"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="webrtcTurnUsername" className="text-xs">TURN Username</Label>
          <Input
            id="webrtcTurnUsername"
            value={widget.config.webrtcTurnUsername || ''}
            onChange={(e) => onConfigChange('webrtcTurnUsername', e.target.value)}
            placeholder="username"
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="webrtcTurnPassword" className="text-xs">TURN Password</Label>
          <Input
            id="webrtcTurnPassword"
            type="password"
            value={widget.config.webrtcTurnPassword || ''}
            onChange={(e) => onConfigChange('webrtcTurnPassword', e.target.value)}
            placeholder="password"
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
};
