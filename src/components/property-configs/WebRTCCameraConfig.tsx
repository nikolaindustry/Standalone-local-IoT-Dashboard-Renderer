/**
 * WebRTCCameraConfig Component
 * 
 * Independent configuration panel for WebRTC Camera widgets in the IoT Dashboard Builder.
 * Provides comprehensive property settings with the same functionality as the product dashboard designer.
 * 
 * Features:
 * - Server URL configuration for WebSocket signaling server
 * - Room name for streaming to specific rooms
 * - Camera ID to identify this camera source
 * - Camera selection from available devices
 * - Auto-connect and auto-stream toggles
 * - Audio enable/disable control
 * - Video quality and resolution settings
 * - Recording and snapshot capabilities
 * 
 * @component
 */

import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Camera } from 'lucide-react';
import { IoTDashboardWidget } from '../../types';

interface WebRTCCameraConfigProps {
  widget: IoTDashboardWidget;
  onConfigChange: (key: string, value: any) => void;
}

export const WebRTCCameraConfig: React.FC<WebRTCCameraConfigProps> = ({
  widget,
  onConfigChange
}) => {
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    // Enumerate available cameras
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(videoDevices);
      } catch (err) {
        console.error('Error enumerating cameras:', err);
      }
    };
    getCameras();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Camera className="w-4 h-4" />
        <h4 className="text-sm font-semibold">WebRTC Camera Settings</h4>
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
            WebSocket server URL for WebRTC signaling
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="webrtcRoomName" className="text-xs">Room Name</Label>
          <Input
            id="webrtcRoomName"
            value={widget.config.webrtcRoomName || 'cctv'}
            onChange={(e) => onConfigChange('webrtcRoomName', e.target.value)}
            placeholder="room-name"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Room to join for streaming
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="webrtcCameraId" className="text-xs">Camera ID</Label>
          <Input
            id="webrtcCameraId"
            value={widget.config.webrtcCameraId || 'CAM-001'}
            onChange={(e) => onConfigChange('webrtcCameraId', e.target.value)}
            placeholder="CAM-001"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Unique identifier for this camera
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
          Connect automatically to signaling server on load
        </p>

        <div className="flex items-center justify-between">
          <Label htmlFor="webrtcAutoStream" className="text-xs">Auto Stream</Label>
          <Switch
            id="webrtcAutoStream"
            checked={widget.config.webrtcAutoStream !== false}
            onCheckedChange={(checked) => onConfigChange('webrtcAutoStream', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Start streaming automatically when viewers join
        </p>
      </div>

      <Separator />

      {/* Camera Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Camera Selection</Label>
        
        {availableCameras.length > 0 ? (
          <div className="space-y-1">
            <Label htmlFor="webrtcPreferredCamera" className="text-xs">Preferred Camera</Label>
            <Select
              value={widget.config.webrtcPreferredCamera || 'default'}
              onValueChange={(value) => onConfigChange('webrtcPreferredCamera', value === 'default' ? undefined : value)}
            >
              <SelectTrigger id="webrtcPreferredCamera" className="h-8 text-sm">
                <SelectValue placeholder="Use default camera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Use default camera</SelectItem>
                {availableCameras.map((camera, index) => (
                  <SelectItem key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {availableCameras.length} camera(s) detected
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No cameras detected. Grant camera permissions to see available devices.
          </p>
        )}

        <div className="space-y-1">
          <Label htmlFor="webrtcFacingMode" className="text-xs">Camera Facing Mode</Label>
          <Select
            value={widget.config.webrtcFacingMode || 'user'}
            onValueChange={(value) => onConfigChange('webrtcFacingMode', value)}
          >
            <SelectTrigger id="webrtcFacingMode" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Front Camera (User)</SelectItem>
              <SelectItem value="environment">Back Camera (Environment)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Preferred camera direction (for mobile devices)
          </p>
        </div>
      </div>

      <Separator />

      {/* Media Settings */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Media Settings</Label>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="webrtcEnableAudio" className="text-xs">Enable Audio</Label>
          <Switch
            id="webrtcEnableAudio"
            checked={widget.config.webrtcEnableAudio === true}
            onCheckedChange={(checked) => onConfigChange('webrtcEnableAudio', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Stream audio along with video
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
            value={widget.config.webrtcVideoQuality || 'medium'}
            onValueChange={(value) => onConfigChange('webrtcVideoQuality', value)}
          >
            <SelectTrigger id="webrtcVideoQuality" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High (1080p)</SelectItem>
              <SelectItem value="medium">Medium (720p)</SelectItem>
              <SelectItem value="low">Low (480p)</SelectItem>
              <SelectItem value="verylow">Very Low (360p)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="webrtcFrameRate" className="text-xs">Frame Rate (FPS)</Label>
          <Input
            id="webrtcFrameRate"
            type="number"
            value={widget.config.webrtcFrameRate || 30}
            onChange={(e) => onConfigChange('webrtcFrameRate', parseInt(e.target.value) || 30)}
            placeholder="30"
            min="10"
            max="60"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Target frames per second (10-60)
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="webrtcBitrate" className="text-xs">Video Bitrate (kbps)</Label>
          <Input
            id="webrtcBitrate"
            type="number"
            value={widget.config.webrtcBitrate || 1500}
            onChange={(e) => onConfigChange('webrtcBitrate', parseInt(e.target.value) || 1500)}
            placeholder="1500"
            min="500"
            max="5000"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Target video bitrate (500-5000 kbps)
          </p>
        </div>
      </div>

      <Separator />

      {/* Display Settings */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Display Settings</Label>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="webrtcMirrorVideo" className="text-xs">Mirror Video</Label>
          <Switch
            id="webrtcMirrorVideo"
            checked={widget.config.webrtcMirrorVideo || false}
            onCheckedChange={(checked) => onConfigChange('webrtcMirrorVideo', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Flip video horizontally (useful for front-facing cameras)
        </p>

        <div className="flex items-center justify-between">
          <Label htmlFor="webrtcShowPreview" className="text-xs">Show Preview</Label>
          <Switch
            id="webrtcShowPreview"
            checked={widget.config.webrtcShowPreview !== false}
            onCheckedChange={(checked) => onConfigChange('webrtcShowPreview', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Display local camera preview
        </p>

        <div className="flex items-center justify-between">
          <Label htmlFor="webrtcShowControls" className="text-xs">Show Controls</Label>
          <Switch
            id="webrtcShowControls"
            checked={widget.config.webrtcShowControls !== false}
            onCheckedChange={(checked) => onConfigChange('webrtcShowControls', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Display camera control buttons
        </p>
      </div>

      <Separator />

      {/* Recording Settings */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Recording & Snapshots</Label>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="webrtcEnableRecording" className="text-xs">Enable Recording</Label>
          <Switch
            id="webrtcEnableRecording"
            checked={widget.config.webrtcEnableRecording || false}
            onCheckedChange={(checked) => onConfigChange('webrtcEnableRecording', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Allow recording video to local storage
        </p>

        <div className="flex items-center justify-between">
          <Label htmlFor="webrtcEnableSnapshot" className="text-xs">Enable Snapshot</Label>
          <Switch
            id="webrtcEnableSnapshot"
            checked={widget.config.webrtcEnableSnapshot || false}
            onCheckedChange={(checked) => onConfigChange('webrtcEnableSnapshot', checked)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Allow taking snapshots/screenshots
        </p>
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
          Display streaming statistics overlay
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
