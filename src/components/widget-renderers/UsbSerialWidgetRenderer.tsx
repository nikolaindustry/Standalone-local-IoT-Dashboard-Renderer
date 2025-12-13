import React, { useState, useEffect, useRef } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Usb, Send, Trash2, Cable, WifiOff, AlertCircle } from 'lucide-react';
import { createIoTUsbAPI } from '../../utils/iotUsbAPI';
import { Capacitor } from '@capacitor/core';

interface UsbSerialWidgetRendererProps {
  widget: IoTDashboardWidget;
  value?: any;
  isDesignMode: boolean;
  onValueChange?: (value: any) => void;
  executeAction?: (actionId: string, parameters?: Record<string, any>) => void;
  commonStyles?: React.CSSProperties;
}

export const UsbSerialWidgetRenderer: React.FC<UsbSerialWidgetRendererProps> = ({
  widget,
  value,
  isDesignMode,
  onValueChange,
  executeAction,
  commonStyles
}) => {
  const [inputValue, setInputValue] = useState('');
  const [receivedData, setReceivedData] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const portRef = useRef<any>(null);
  const usbAPIRef = useRef(createIoTUsbAPI((type, message, args) => {
    console[type](message, ...args);
  }));

  // Configuration
  const showTitle = widget.config.usbShowTitle !== false;
  const showInput = widget.config.usbShowInput !== false;
  const showOutput = widget.config.usbShowOutput !== false;
  const showConnectButton = widget.config.usbShowConnectButton !== false;
  const showSendButton = widget.config.usbShowSendButton !== false;
  const showClearButton = widget.config.usbShowClearButton !== false;
  const inputPlaceholder = widget.config.usbInputPlaceholder || 'Enter data to send...';
  const outputHeight = widget.config.usbOutputHeight || 200;
  const autoScroll = widget.config.usbAutoScroll !== false;
  const timestampFormat = widget.config.usbTimestampFormat || 'none'; // 'none', 'time', 'datetime'
  const sendOnEnter = widget.config.usbSendOnEnter !== false;
  const maxLines = widget.config.usbMaxLines || 100;

  // Update connection status from value
  useEffect(() => {
    if (value && typeof value === 'object') {
      if (value.connected !== undefined) {
        setIsConnected(value.connected);
      }
      if (value.data) {
        handleReceivedData(value.data);
      }
    }
  }, [value]);

  const handleReceivedData = (data: string) => {
    const timestamp = getTimestamp();
    const newData = timestamp ? `[${timestamp}] ${data}` : data;
    
    setReceivedData(prev => {
      const updated = [...prev, newData];
      // Limit to maxLines
      if (updated.length > maxLines) {
        return updated.slice(-maxLines);
      }
      return updated;
    });

    // Auto scroll
    if (autoScroll) {
      setTimeout(() => {
        const outputElement = document.getElementById(`usb-output-${widget.id}`);
        if (outputElement) {
          outputElement.scrollTop = outputElement.scrollHeight;
        }
      }, 10);
    }
  };

  const getTimestamp = () => {
    if (timestampFormat === 'none') return '';
    
    const now = new Date();
    if (timestampFormat === 'time') {
      return now.toLocaleTimeString();
    }
    if (timestampFormat === 'datetime') {
      return now.toLocaleString();
    }
    return '';
  };

  const handleConnect = async () => {
    if (isDesignMode) return;
    
    const usbAPI = usbAPIRef.current;
    
    // Check if running on native platform
    if (Capacitor.isNativePlatform()) {
      alert('USB Serial is not yet supported on native mobile apps. This feature requires the Web Serial API which is only available in web browsers. Please use the web version or wait for native USB plugin support.');
      return;
    }
    
    // Check if USB is supported
    if (!usbAPI.isSupported()) {
      alert('USB Serial is not supported in this browser. Please use Chrome, Edge, or Opera.');
      return;
    }
    
    try {
      // Request USB port
      const port = await usbAPI.requestPort();
      if (!port) {
        return; // User cancelled
      }
      
      // Get connection options from widget config
      const baudRate = widget.config.usbBaudRate || 9600;
      const dataBits = widget.config.usbDataBits || 8;
      const stopBits = widget.config.usbStopBits || 1;
      const parity = widget.config.usbParity || 'none';
      
      // Connect to port
      const connected = await usbAPI.connect(port, {
        baudRate,
        dataBits: dataBits as 7 | 8,
        stopBits: stopBits as 1 | 2,
        parity: parity as 'none' | 'even' | 'odd',
      });
      
      if (connected) {
        portRef.current = port;
        setIsConnected(true);
        
        // Start reading data
        usbAPI.startReading(port, (data: Uint8Array) => {
          const text = usbAPI.arrayToString(data);
          handleReceivedData(text);
        });
        
        // Trigger connect action
        executeAction?.('connect');
        onValueChange?.({ action: 'connect', connected: true });
      }
    } catch (error) {
      console.error('USB connection error:', error);
      alert('Failed to connect to USB device');
    }
  };

  const handleDisconnect = async () => {
    if (isDesignMode) return;
    
    const usbAPI = usbAPIRef.current;
    const port = portRef.current;
    
    if (port) {
      // Stop reading
      await usbAPI.stopReading(port);
      
      // Disconnect
      await usbAPI.disconnect(port);
      
      portRef.current = null;
    }
    
    setIsConnected(false);
    
    // Trigger disconnect action
    executeAction?.('disconnect');
    onValueChange?.({ action: 'disconnect', connected: false });
  };

  const handleSend = async () => {
    if (isDesignMode || !inputValue.trim()) return;
    
    const usbAPI = usbAPIRef.current;
    const port = portRef.current;
    
    if (port && isConnected) {
      try {
        // Send data over USB
        await usbAPI.send(port, inputValue);
        
        // Add to output if echo is enabled
        if (widget.config.usbEchoSent) {
          const timestamp = getTimestamp();
          const echoData = timestamp ? `[${timestamp}] TX: ${inputValue}` : `TX: ${inputValue}`;
          setReceivedData(prev => {
            const updated = [...prev, echoData];
            if (updated.length > maxLines) {
              return updated.slice(-maxLines);
            }
            return updated;
          });
        }
        
        // Trigger send action
        executeAction?.('send', { data: inputValue });
        onValueChange?.({ action: 'send', data: inputValue });
        
        setInputValue('');
      } catch (error) {
        console.error('USB send error:', error);
        alert('Failed to send data over USB');
      }
    }
  };

  const handleClear = () => {
    setReceivedData([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (sendOnEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-full flex flex-col" style={commonStyles}>
      {showTitle && (
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Usb className="w-4 h-4" />
              <span>{widget.title}</span>
            </div>
            {showConnectButton && (
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <Badge variant="default" className="bg-green-500">
                      <Cable className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDisconnect}
                      disabled={isDesignMode}
                      className="h-7"
                    >
                      <WifiOff className="w-3 h-3 mr-1" />
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary">
                      <WifiOff className="w-3 h-3 mr-1" />
                      Disconnected
                    </Badge>
                    <Button
                      size="sm"
                      onClick={handleConnect}
                      disabled={isDesignMode}
                      className="h-7"
                    >
                      <Usb className="w-3 h-3 mr-1" />
                      Connect
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="pt-2 flex-1 flex flex-col min-h-0">
        {showOutput && (
          <>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Output</span>
              {showClearButton && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClear}
                  className="h-6 px-2"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <Textarea
              id={`usb-output-${widget.id}`}
              value={receivedData.join('\n')}
              readOnly
              className="font-mono text-xs mb-3 resize-none flex-1"
              style={{ 
                height: showInput ? `${outputHeight}px` : '100%',
                minHeight: '100px'
              }}
              placeholder={isDesignMode ? "USB data will appear here..." : "Waiting for data..."}
            />
          </>
        )}

        {showInput && (
          <>
            <Separator className="my-2" />
            <div className="flex-shrink-0">
              <div className="mb-2">
                <span className="text-xs text-muted-foreground">Input</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={inputPlaceholder}
                  disabled={isDesignMode || !isConnected}
                  className="flex-1"
                />
                {showSendButton && (
                  <Button
                    onClick={handleSend}
                    disabled={isDesignMode || !isConnected || !inputValue.trim()}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                )}
              </div>
              {sendOnEnter && (
                <p className="text-xs text-muted-foreground mt-1">
                  Press Enter to send
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
