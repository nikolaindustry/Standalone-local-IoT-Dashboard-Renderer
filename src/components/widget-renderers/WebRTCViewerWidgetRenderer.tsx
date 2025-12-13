import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video, VideoOff, Loader2, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { IoTDashboardWidget } from '../../types';

interface WebRTCViewerWidgetRendererProps {
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

export const WebRTCViewerWidgetRenderer: React.FC<WebRTCViewerWidgetRendererProps> = ({
  widget,
  value,
  onValueChange,
  isDesignMode = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState('Disconnected');
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Use value from WebSocket updates if available, otherwise fall back to config
  const serverUrl = value?.url || widget.config.webrtcServerUrl || 'wss://nikolaindustry-webrtc.onrender.com';
  const roomName = value?.room || widget.config.webrtcRoomName || 'cctv';
  const cameraId = value?.cameraid || widget.config.webrtcCameraId || '';
  const autoConnect = widget.config.webrtcAutoConnect !== false;
  const enableAudio = widget.config.webrtcEnableAudio !== false;

  // Effect to handle runtime updates from WebSocket
  useEffect(() => {
    if (value?.url || value?.room || value?.cameraid) {
      console.log('[WebRTC] Runtime update received:', value);
      // Reconnect with new parameters
      cleanup();
      if (!isDesignMode) {
        setTimeout(() => connectToServer(), 100);
      }
    }
  }, [value?.url, value?.room, value?.cameraid]);

  useEffect(() => {
    if (isDesignMode) return;
    
    if (autoConnect && cameraId) {
      connectToServer();
    }

    return () => {
      cleanup();
    };
  }, [isDesignMode, autoConnect, cameraId, roomName, serverUrl]);

  const cleanup = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsConnected(false);
    setIsStreaming(false);
  };

  const connectToServer = () => {
    console.log('[WebRTC] Starting connection to server:', serverUrl);
    setStatus('Connecting...');
    setError('');
    
    const ws = new WebSocket(serverUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebRTC] WebSocket connected');
      setIsConnected(true);
      setStatus('Connected');
      
      // Join room
      const joinMessage = {
        type: 'join',
        room: roomName
      };
      console.log('[WebRTC] Sending join message:', joinMessage);
      ws.send(JSON.stringify(joinMessage));
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log('[WebRTC] Received message:', message.type, message);
      
      switch (message.type) {
        case 'joined':
          console.log('[WebRTC] Joined room:', message.room);
          setStatus(`Joined room: ${message.room}`);
          if (cameraId) {
            requestStream();
          }
          break;
          
        case 'offer':
          console.log('[WebRTC] Received offer from camera');
          await handleOffer(message);
          break;
          
        case 'answer':
          console.log('[WebRTC] Received answer from camera');
          await handleAnswer(message);
          break;
          
        case 'iceCandidate':
          console.log('[WebRTC] Received ICE candidate');
          await handleIceCandidate(message);
          break;
          
        case 'cameraNotFound':
          console.error('[WebRTC] Camera not found:', cameraId);
          setError(`Camera ${cameraId} not found`);
          break;
      }
    };

    ws.onclose = () => {
      console.log('[WebRTC] WebSocket closed');
      setIsConnected(false);
      setIsStreaming(false);
      setStatus('Disconnected');
    };

    ws.onerror = (err) => {
      console.error('[WebRTC] WebSocket error:', err);
      setError('WebSocket connection error');
      setStatus('Connection failed');
    };
  };

  const requestStream = () => {
    if (!wsRef.current || !cameraId) {
      console.error('[WebRTC] Cannot request stream - missing WebSocket or camera ID');
      return;
    }
    
    console.log('[WebRTC] Requesting stream for camera:', cameraId);
    setStatus('Requesting stream...');
    
    const requestMessage = {
      type: 'requestStream',
      cameraId: cameraId,
      requestId: Date.now().toString()
    };
    console.log('[WebRTC] Sending request:', requestMessage);
    wsRef.current.send(JSON.stringify(requestMessage));

    if (!pcRef.current) {
      createPeerConnection();
    }
  };

  const createPeerConnection = () => {
    console.log('[WebRTC] Creating peer connection with config:', config);
    const pc = new RTCPeerConnection(config);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        console.log('[WebRTC] Sending ICE candidate');
        wsRef.current.send(JSON.stringify({
          type: 'iceCandidate',
          candidate: event.candidate
        }));
      }
    };

    pc.ontrack = (event) => {
      console.log('[WebRTC] Received track:', event.track.kind, 'streams:', event.streams.length);
      if (videoRef.current && event.streams.length > 0) {
        const stream = event.streams[0];
        console.log('[WebRTC] Stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState })));
        
        // Force video element to load and play
        videoRef.current.srcObject = stream;
        console.log('[WebRTC] Video srcObject set, attempting play');
        
        // Try to play the video explicitly for mobile
        videoRef.current.play().then(() => {
          console.log('[WebRTC] Video playing successfully');
          setIsStreaming(true);
          setStatus('Streaming');
        }).catch((err) => {
          console.error('[WebRTC] Video play error:', err);
          // Still set streaming to true as the stream is connected
          setIsStreaming(true);
          setStatus('Streaming');
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state changed:', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsStreaming(false);
        setStatus('Connection lost');
      } else if (pc.connectionState === 'connected') {
        console.log('[WebRTC] Peer connection established');
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state:', pc.iceConnectionState);
    };

    pc.onsignalingstatechange = () => {
      console.log('[WebRTC] Signaling state:', pc.signalingState);
    };
  };

  const handleOffer = async (message: any) => {
    try {
      console.log('[WebRTC] Processing offer from:', message.sender);
      if (!pcRef.current) {
        console.log('[WebRTC] Creating new peer connection for offer');
        createPeerConnection();
      }
      
      const pc = pcRef.current!;
      console.log('[WebRTC] Setting remote description');
      await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
      
      console.log('[WebRTC] Creating answer');
      const answer = await pc.createAnswer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: enableAudio
      });
      
      console.log('[WebRTC] Setting local description');
      await pc.setLocalDescription(answer);
      
      if (wsRef.current) {
        const answerMessage = {
          type: 'answer',
          target: message.sender,
          sdp: answer
        };
        console.log('[WebRTC] Sending answer to:', message.sender);
        wsRef.current.send(JSON.stringify(answerMessage));
      }
    } catch (err) {
      console.error('[WebRTC] Error handling offer:', err);
      setError(`Failed to handle offer: ${err}`);
    }
  };

  const handleAnswer = async (message: any) => {
    try {
      if (pcRef.current) {
        console.log('[WebRTC] Setting remote description from answer');
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(message.sdp));
      }
    } catch (err) {
      console.error('[WebRTC] Error handling answer:', err);
    }
  };

  const handleIceCandidate = async (message: any) => {
    try {
      if (pcRef.current && message.candidate) {
        console.log('[WebRTC] Adding ICE candidate');
        await pcRef.current.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    } catch (err) {
      console.error('[WebRTC] Error adding ICE candidate:', err);
    }
  };

  const toggleConnection = () => {
    if (isConnected) {
      cleanup();
    } else {
      connectToServer();
    }
  };

  const toggleAudio = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
      console.log('[WebRTC Viewer] Audio toggled:', !audioEnabled);
    }
  };

  if (isDesignMode) {
    return (
      <Card className="h-full flex items-center justify-center bg-muted">
        <div className="text-center space-y-2">
          <Video className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">WebRTC Viewer</p>
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
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && enableAudio && (
            <Button
              size="sm"
              variant={audioEnabled ? "default" : "secondary"}
              onClick={toggleAudio}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          )}
          <Button
            size="sm"
            variant={isConnected ? "destructive" : "default"}
            onClick={toggleConnection}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
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
        
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            {isConnected ? (
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            ) : (
              <div className="text-center space-y-2">
                <VideoOff className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No stream</p>
              </div>
            )}
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={!enableAudio}
          controls={false}
          className="w-full h-full object-contain"
          style={{ backgroundColor: 'black', display: 'block' }}
          onLoadedMetadata={(e) => {
            console.log('[WebRTC] Video metadata loaded:', {
              videoWidth: e.currentTarget.videoWidth,
              videoHeight: e.currentTarget.videoHeight,
              duration: e.currentTarget.duration
            });
          }}
          onPlay={() => console.log('[WebRTC] Video started playing')}
          onPause={() => console.log('[WebRTC] Video paused')}
          onError={(e) => {
            console.error('[WebRTC] Video element error:', e);
          }}
        />
        
        {isStreaming && cameraId && (
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            Camera {cameraId}
          </div>
        )}
      </div>
    </Card>
  );
};
