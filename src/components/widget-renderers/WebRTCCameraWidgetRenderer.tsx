import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Loader2, AlertCircle, Users, Mic, MicOff, SwitchCamera } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IoTDashboardWidget } from '../../types';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

interface WebRTCCameraWidgetRendererProps {
  widget: IoTDashboardWidget;
  value?: any;
  onValueChange?: (value: any) => void;
  onAction?: (action: any) => void;
  isDesignMode?: boolean;
}

const config = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export const WebRTCCameraWidgetRenderer: React.FC<WebRTCCameraWidgetRendererProps> = ({
  widget,
  value,
  onValueChange,
  isDesignMode = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState('Disconnected');
  const [viewerCount, setViewerCount] = useState(0);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  
  // Use value from WebSocket updates if available, otherwise fall back to config
  const serverUrl = value?.url || widget.config.webrtcServerUrl || 'wss://nikolaindustry-webrtc.onrender.com';
  const roomName = value?.room || widget.config.webrtcRoomName || 'cctv';
  const cameraId = value?.cameraid || widget.config.webrtcCameraId || 'CAM-001';
  const autoConnect = widget.config.webrtcAutoConnect !== false;
  const autoStream = widget.config.webrtcAutoStream !== false;
  const enableAudio = widget.config.webrtcEnableAudio === true;

  // Effect to handle runtime updates from WebSocket
  useEffect(() => {
    if (value?.url || value?.room || value?.cameraid) {
      console.log('[WebRTC Camera] Runtime update received:', value);
      cleanup();
      if (!isDesignMode && autoConnect) {
        setTimeout(() => connectToServer(), 100);
      }
    }
  }, [value?.url, value?.room, value?.cameraid]);

  useEffect(() => {
    if (isDesignMode) return;
    
    // Enumerate cameras on mount and set preferred camera if configured
    const initializeCameras = async () => {
      await enumerateCameras();
      
      // Set preferred camera from config if available
      const preferredCamera = widget.config.webrtcPreferredCamera;
      if (preferredCamera && !selectedCameraId) {
        setSelectedCameraId(preferredCamera);
      }
    };
    
    initializeCameras();
    
    if (autoConnect) {
      connectToServer();
    }

    // Handle app state changes for native platforms
    let appStateListener: any = null;
    
    if (Capacitor.isNativePlatform()) {
      App.addListener('appStateChange', (state) => {
        console.log('[WebRTC Camera] App state changed:', state);
        
        // If app becomes active and video stream has ended, reconnect
        if (state.isActive) {
          const hasActiveStream = localStreamRef.current && 
            localStreamRef.current.getTracks().some(track => track.readyState === 'live');
          
          if (!hasActiveStream && autoConnect) {
            console.log('[WebRTC Camera] Reconnecting after app became active');
            cleanup();
            setTimeout(() => connectToServer(), 500);
          }
        }
      }).then(listener => {
        appStateListener = listener;
      });
    }

    return () => {
      cleanup();
      if (appStateListener) {
        appStateListener.remove();
      }
    };
  }, [isDesignMode, autoConnect, roomName, serverUrl, cameraId]);

  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      if (videoDevices.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
      console.log('[WebRTC Camera] Available cameras:', videoDevices.length);
    } catch (err) {
      console.error('[WebRTC Camera] Error enumerating cameras:', err);
    }
  };

  const cleanup = () => {
    // Close all peer connections
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsConnected(false);
    setIsStreaming(false);
    setCurrentRoom(null);
    setViewerCount(0);
  };

  const connectToServer = async () => {
    console.log('[WebRTC Camera] Starting connection to server:', serverUrl);
    setStatus('Connecting...');
    setError('');
    
    try {
      // Get local camera stream with optional audio
      const videoConstraints = selectedCameraId 
        ? { deviceId: { exact: selectedCameraId } }
        : true;
        
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: videoConstraints, 
        audio: enableAudio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      });
      
      localStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      console.log('[WebRTC Camera] Local video stream acquired', { hasAudio: enableAudio });
      
      // Connect to WebSocket server
      const ws = new WebSocket(serverUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebRTC Camera] WebSocket connected');
        setIsConnected(true);
        setStatus('Connected');
        
        // Join room
        const joinMessage = {
          type: 'join',
          room: roomName,
          deviceType: 'camera',
          cameraId: cameraId
        };
        console.log('[WebRTC Camera] Sending join message:', joinMessage);
        ws.send(JSON.stringify(joinMessage));
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        console.log('[WebRTC Camera] Received message:', message.type, message);
        
        switch (message.type) {
          case 'joined':
            console.log('[WebRTC Camera] Joined room:', message.room);
            setCurrentRoom(message.room);
            setStatus(`In room: ${message.room}`);
            if (autoStream) {
              setIsStreaming(true);
            }
            break;
            
          case 'viewerRequest':
            console.log('[WebRTC Camera] Viewer requested stream:', message.viewerId);
            if (isStreaming || autoStream) {
              handleViewerRequest(message);
            }
            break;
            
          case 'answer':
            console.log('[WebRTC Camera] Received answer from viewer');
            await handleAnswer(message);
            break;
            
          case 'iceCandidate':
            console.log('[WebRTC Camera] Received ICE candidate');
            await handleIceCandidate(message);
            break;
        }
      };

      ws.onclose = () => {
        console.log('[WebRTC Camera] WebSocket closed');
        setIsConnected(false);
        setIsStreaming(false);
        setCurrentRoom(null);
        setStatus('Disconnected');
      };

      ws.onerror = (err) => {
        console.error('[WebRTC Camera] WebSocket error:', err);
        setError('WebSocket connection error');
        setStatus('Connection failed');
      };
    } catch (err) {
      console.error('[WebRTC Camera] Error accessing camera:', err);
      setError('Failed to access camera');
      setStatus('Camera access denied');
    }
  };

  const handleViewerRequest = (message: any) => {
    console.log('[WebRTC Camera] Creating connection for viewer:', message.viewerId);
    setViewerCount(prev => prev + 1);
    
    createPeerConnection(message.viewerId);
    createOffer(message.viewerId);
  };

  const createPeerConnection = (viewerId: string) => {
    console.log('[WebRTC Camera] Creating peer connection for viewer:', viewerId);
    const pc = new RTCPeerConnection(config);
    
    // Add media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        console.log('[WebRTC Camera] Adding track to peer connection:', track.kind);
        pc.addTrack(track, localStreamRef.current!);
      });
    }
    
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        console.log('[WebRTC Camera] Sending ICE candidate to viewer:', viewerId);
        wsRef.current.send(JSON.stringify({
          type: 'iceCandidate',
          target: viewerId,
          candidate: event.candidate
        }));
      }
    };
    
    pc.onconnectionstatechange = () => {
      console.log('[WebRTC Camera] Connection state with viewer', viewerId, ':', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        peerConnectionsRef.current.delete(viewerId);
        setViewerCount(prev => Math.max(0, prev - 1));
      }
    };
    
    peerConnectionsRef.current.set(viewerId, pc);
    return pc;
  };

  const createOffer = async (viewerId: string) => {
    try {
      const pc = peerConnectionsRef.current.get(viewerId);
      if (!pc) return;
      
      console.log('[WebRTC Camera] Creating offer for viewer:', viewerId);
      const offer = await pc.createOffer({
        offerToReceiveVideo: false,
        offerToReceiveAudio: false
      });
      
      await pc.setLocalDescription(offer);
      
      if (wsRef.current) {
        console.log('[WebRTC Camera] Sending offer to viewer:', viewerId);
        wsRef.current.send(JSON.stringify({
          type: 'offer',
          target: viewerId,
          sdp: offer
        }));
      }
    } catch (err) {
      console.error('[WebRTC Camera] Error creating offer:', err);
    }
  };

  const handleAnswer = async (message: any) => {
    try {
      console.log('[WebRTC Camera] Processing answer from viewer:', message.sender);
      const pc = peerConnectionsRef.current.get(message.sender);
      if (!pc) {
        console.error('[WebRTC Camera] No peer connection found for viewer:', message.sender);
        return;
      }
      
      await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
      console.log('[WebRTC Camera] Answer processed successfully');
    } catch (err) {
      console.error('[WebRTC Camera] Error handling answer:', err);
    }
  };

  const handleIceCandidate = async (message: any) => {
    try {
      const pc = peerConnectionsRef.current.get(message.sender);
      if (pc && message.candidate) {
        console.log('[WebRTC Camera] Adding ICE candidate from viewer:', message.sender);
        await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    } catch (err) {
      console.error('[WebRTC Camera] Error adding ICE candidate:', err);
    }
  };

  const toggleConnection = () => {
    if (isConnected) {
      cleanup();
    } else {
      connectToServer();
    }
  };

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
      console.log('[WebRTC Camera] Audio toggled:', !audioEnabled);
    }
  };

  const switchCamera = async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    console.log('[WebRTC Camera] Switching to camera:', deviceId);
    
    // Stop current stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Get new stream with selected camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { deviceId: { exact: deviceId } }, 
        audio: enableAudio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      });
      
      localStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Update all peer connections with new tracks
      const videoTrack = stream.getVideoTracks()[0];
      peerConnectionsRef.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });
      
      console.log('[WebRTC Camera] Camera switched successfully');
    } catch (err) {
      console.error('[WebRTC Camera] Error switching camera:', err);
      setError('Failed to switch camera');
    }
  };

  if (isDesignMode) {
    return (
      <Card className="h-full flex items-center justify-center bg-muted">
        <div className="text-center space-y-2">
          <Video className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">WebRTC Camera</p>
          <p className="text-xs text-muted-foreground">Configure in properties panel</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <Video className="w-4 h-4 text-success" />
          ) : (
            <VideoOff className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-xs font-medium">{status}</span>
          {currentRoom && (
            <span className="text-xs text-muted-foreground">| {cameraId}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs">
            <Users className="w-3 h-3" />
            <span>{viewerCount}</span>
          </div>
          {isConnected && enableAudio && (
            <Button
              size="sm"
              variant={audioEnabled ? "default" : "secondary"}
              onClick={toggleAudio}
            >
              {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
          )}
          {availableCameras.length > 0 && (
            <Select value={selectedCameraId} onValueChange={switchCamera}>
              <SelectTrigger className="h-8 w-[180px]">
                <div className="flex items-center gap-2">
                  <SwitchCamera className="w-4 h-4" />
                  <SelectValue placeholder="Select camera" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {availableCameras.map((camera, index) => (
                  <SelectItem key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            size="sm"
            variant={isConnected ? "destructive" : "default"}
            onClick={toggleConnection}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
          {isConnected && (
            <Button
              size="sm"
              variant={isStreaming ? "secondary" : "default"}
              onClick={toggleStreaming}
            >
              {isStreaming ? 'Stop Stream' : 'Start Stream'}
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 relative bg-black">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
              <p className="text-sm text-white">{error}</p>
            </div>
          </div>
        )}
        
        {!localStreamRef.current && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            {isConnected ? (
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            ) : (
              <div className="text-center space-y-2">
                <VideoOff className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No camera</p>
              </div>
            )}
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain"
          style={{ backgroundColor: 'black', display: 'block' }}
        />
        
        {isStreaming && (
          <div className="absolute top-2 left-2 bg-danger/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
      </div>
    </Card>
  );
};
