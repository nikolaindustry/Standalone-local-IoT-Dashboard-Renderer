// Standalone WebSocket service for device commands
// No external dependencies - fully self-contained

interface DeviceCommand {
  targetId: string;
  payload: {
    commands: Array<{
      command: string;
      actions: Array<{
        action: string;
        params: Record<string, any>;
      }>;
    }>;
  };
}

// Message callbacks for different message types
type MessageCallback = (data: any) => void;
type ConnectionCallback = (connected: boolean) => void;

class DeviceWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private deviceId: string | null = null;
  private currentConnectionId: string | null = null;
  private isConnecting = false;
  
  // Callback arrays for different message types
  private messageCallbacks: MessageCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  
  // Custom WebSocket URL from standalone config
  private customWsUrl: string | null = null;

  constructor() {
    // Don't auto-connect, wait for explicit connection request
  }

  /**
   * Set custom WebSocket URL for standalone mode
   * This allows users to configure their own WebSocket server
   */
  setCustomWebSocketUrl(url: string) {
    this.customWsUrl = url;
  }

  connect(connectionId?: string): Promise<boolean> {
    const targetId = connectionId || this.deviceId || 'device-service';
    
    // If already connected with same ID, return existing connection
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.currentConnectionId === targetId) {
      console.log(`WebSocket already connected with ID: ${targetId}`);
      return Promise.resolve(true);
    }
    
    // If already connecting with same ID, wait for connection
    if (this.isConnecting && this.currentConnectionId === targetId) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.isConnecting) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);
      });
    }
    
    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        this.currentConnectionId = targetId;
        
        console.log(`Connecting WebSocket with ID: ${targetId}`);
        
        // Close existing socket if it exists
        if (this.ws) {
          this.ws.close();
        }
        
        // Check for standalone config
        const standaloneConfig = (window as any).__STANDALONE_WS_CONFIG__;
        const wsBaseUrl = standaloneConfig?.url || this.customWsUrl || 'wss://nikolaindustry-realtime.onrender.com';
        const wsUrl = `${wsBaseUrl}/?id=${targetId}`;
        
        console.log(`[Standalone] Connecting to WebSocket: ${wsUrl}`);
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('Device WebSocket connected with ID:', targetId);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Notify all connection callbacks
          this.connectionCallbacks.forEach(callback => callback(true));
          resolve(true);
        };

        this.ws.onclose = (event) => {
          console.log('Device WebSocket disconnected', event);
          this.isConnecting = false;
          
          // Notify all connection callbacks
          this.connectionCallbacks.forEach(callback => callback(false));
          
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('Device WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Device WebSocket message received:', data);
            
            // Call all message callbacks
            this.messageCallbacks.forEach(callback => callback(data));
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
      } catch (error) {
        this.isConnecting = false;
        console.error('Failed to connect to WebSocket:', error);
        reject(error);
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.currentConnectionId) {
      this.reconnectAttempts++;
      console.log(`Reconnecting WebSocket... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.currentConnectionId) {
          this.connect(this.currentConnectionId)
            .catch(err => console.error("Reconnect failed:", err));
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  async setUserId(userId: string): Promise<boolean> {
    if (this.currentConnectionId !== userId) {
      this.deviceId = userId;
      return this.connect(userId);
    }
    return Promise.resolve(true);
  }

  async setDeviceId(deviceId: string): Promise<boolean> {
    if (this.currentConnectionId !== deviceId) {
      this.deviceId = deviceId;
      return this.connect(deviceId);
    }
    return Promise.resolve(true);
  }

  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index !== -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index !== -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  sendMessage(data: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      console.log("WebSocket message sent:", data);
      return true;
    } else {
      console.error("WebSocket is not connected, cannot send message:", data);
      return false;
    }
  }

  sendCommand(command: DeviceCommand) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(command));
      console.log('Command sent via WebSocket:', command);
      return true;
    } catch (error) {
      console.error('Error sending command:', error);
      return false;
    }
  }

  sendButtonCommand(deviceId: string, config: any, widgetId?: string) {
    const commandId = config.clickCommandId || config.commandId;
    const actionId = config.clickActionId || config.actionId;
    
    if (!commandId || !actionId) {
      console.warn('Button command not properly configured');
      return;
    }

    const commandName = config.commands?.click?.name || config.command?.name || 'unknown_command';
    const actionName = config.actions?.click?.name || config.action?.name || 'unknown_action';

    const command: DeviceCommand = {
      targetId: deviceId,
      payload: {
        ...(widgetId && { widgetId }),
        commands: [
          {
            command: commandName,
            actions: [
              {
                action: actionName,
                params: {
                  ...(config.clickParameters || config.parameters || {})
                }
              }
            ]
          }
        ]
      }
    };

    this.sendCommand(command);
  }

  sendPushButtonPress(deviceId: string, config: any, widgetId?: string) {
    const commandId = config.pressCommandId || config.commandId;
    const actionId = config.pressActionId || config.actionId;
    
    if (!commandId || !actionId) {
      console.warn('Push button press command not properly configured');
      return;
    }

    const commandName = config.commands?.press?.name || config.pressCommand?.name || config.command?.name || 'unknown_command';
    const actionName = config.actions?.press?.name || config.pressAction?.name || config.action?.name || 'unknown_action';

    const command: DeviceCommand = {
      targetId: deviceId,
      payload: {
        ...(widgetId && { widgetId }),
        commands: [
          {
            command: commandName,
            actions: [
              {
                action: actionName,
                params: {
                  ...(config.pressParameters || config.parameters || {})
                }
              }
            ]
          }
        ]
      }
    };

    this.sendCommand(command);
  }

  sendPushButtonRelease(deviceId: string, config: any, widgetId?: string) {
    if (!config.releaseCommandId || !config.releaseActionId) {
      console.warn('Push button release command not properly configured');
      return;
    }

    const commandName = config.commands?.release?.name || config.releaseCommand?.name || 'unknown_command';
    const actionName = config.actions?.release?.name || config.releaseAction?.name || 'unknown_action';

    const command: DeviceCommand = {
      targetId: deviceId,
      payload: {
        ...(widgetId && { widgetId }),
        commands: [
          {
            command: commandName,
            actions: [
              {
                action: actionName,
                params: {
                  ...(config.releaseParameters || {})
                }
              }
            ]
          }
        ]
      }
    };

    this.sendCommand(command);
  }

  sendSwitchCommand(deviceId: string, config: any, isOn: boolean, widgetId?: string) {
    const commandId = isOn ? (config.onCommandId || config.commandId) : (config.offCommandId || config.commandId);
    const actionId = isOn ? (config.onActionId || config.actionId) : (config.offActionId || config.actionId);
    
    if (!commandId || !actionId) {
      console.warn('Switch command not properly configured');
      return;
    }

    const params = isOn ? (config.onParameters || config.parameters || {}) : (config.offParameters || config.parameters || {});
    if (params.status) {
      params.status = isOn ? 'HIGH' : 'LOW';
    }

    const commandName = isOn 
      ? (config.commands?.on?.name || config.onCommand?.name || config.command?.name || 'unknown_command')
      : (config.commands?.off?.name || config.offCommand?.name || config.command?.name || 'unknown_command');
    
    const actionName = isOn 
      ? (config.actions?.on?.name || config.onAction?.name || config.action?.name || 'unknown_action')
      : (config.actions?.off?.name || config.offAction?.name || config.action?.name || 'unknown_action');

    const command: DeviceCommand = {
      targetId: deviceId,
      payload: {
        ...(widgetId && { widgetId }),
        commands: [
          {
            command: commandName,
            actions: [
              {
                action: actionName,
                params
              }
            ]
          }
        ]
      }
    };

    this.sendCommand(command);
  }

  sendSliderCommand(deviceId: string, config: any, value: number, widgetId?: string) {
    const commandId = config.valueChangeCommandId || config.commandId;
    const actionId = config.valueChangeActionId || config.actionId;
    
    if (!commandId || !actionId) {
      console.warn('Slider command not properly configured');
      return;
    }

    const commandName = config.commands?.valueChange?.name || config.command?.name || 'unknown_command';
    const actionName = config.actions?.valueChange?.name || config.action?.name || 'unknown_action';

    const command: any = {
      targetId: deviceId,
      payload: {
        ...(widgetId && { widgetId }),
        value: value.toString(),
        commands: [
          {
            command: commandName,
            actions: [
              {
                action: actionName,
                params: {
                  ...(config.valueChangeParameters || config.parameters || {})
                }
              }
            ]
          }
        ]
      }
    };

    this.sendCommand(command);
  }

  sendHeatmapCommand(deviceId: string, config: any, data: any, widgetId?: string) {
    const commandId = config.valueChangeCommandId || config.commandId;
    const actionId = config.valueChangeActionId || config.actionId;
    
    if (!commandId || !actionId) {
      console.warn('Heatmap command not properly configured');
      return;
    }

    const commandName = config.commands?.valueChange?.name || config.command?.name || 'unknown_command';
    const actionName = config.actions?.valueChange?.name || config.action?.name || 'unknown_action';

    const command: any = {
      targetId: deviceId,
      payload: {
        ...(widgetId && { widgetId }),
        heatmap_data: data,
        commands: [
          {
            command: commandName,
            actions: [
              {
                action: actionName,
                params: {
                  ...(config.valueChangeParameters || config.parameters || {})
                }
              }
            ]
          }
        ]
      }
    };

    this.sendCommand(command);
  }

  sendColorPickerCommand(deviceId: string, config: any, colorData: any, widgetId?: string) {
    const commandId = config.colorChangeCommandId || config.commandId;
    const actionId = config.colorChangeActionId || config.actionId;
    
    if (!commandId || !actionId) {
      console.warn('Color picker command not properly configured');
      return;
    }

    const commandName = config.commands?.colorChange?.name || config.command?.name || 'unknown_command';
    const actionName = config.actions?.colorChange?.name || config.action?.name || 'unknown_action';

    const command: any = {
      targetId: deviceId,
      payload: {
        ...(widgetId && { widgetId }),
        color_data: colorData,
        commands: [
          {
            command: commandName,
            actions: [
              {
                action: actionName,
                params: {
                  ...(config.colorChangeParameters || config.parameters || {})
                }
              }
            ]
          }
        ]
      }
    };

    this.sendCommand(command);
  }

  sendFormCommand(deviceId: string, config: any, formData: Record<string, any>, widgetId?: string) {
    const commandId = config.submitCommandId || config.commandId;
    const actionId = config.submitActionId || config.actionId;
    
    if (!commandId || !actionId) {
      console.warn('Form command not properly configured');
      return;
    }

    const commandName = config.commands?.submit?.name || config.command?.name || 'unknown_command';
    const actionName = config.actions?.submit?.name || config.action?.name || 'unknown_action';

    const command: any = {
      targetId: deviceId,
      payload: {
        ...(widgetId && { widgetId }),
        form_data: formData,
        commands: [
          {
            command: commandName,
            actions: [
              {
                action: actionName,
                params: {
                  ...(config.submitParameters || config.parameters || {})
                }
              }
            ]
          }
        ]
      }
    };

    this.sendCommand(command);
  }

  sendJoystickCommand(deviceId: string, config: any, position: { x: number; y: number }, widgetId?: string) {
    const commandId = config.positionChangeCommandId || config.commandId;
    const actionId = config.positionChangeActionId || config.actionId;
    
    if (!commandId || !actionId) {
      console.warn('Joystick command not properly configured');
      return;
    }

    const commandName = config.commands?.positionChange?.name || config.command?.name || 'unknown_command';
    const actionName = config.actions?.positionChange?.name || config.action?.name || 'unknown_action';

    const command: any = {
      targetId: deviceId,
      payload: {
        ...(widgetId && { widgetId }),
        position: position,
        commands: [
          {
            command: commandName,
            actions: [
              {
                action: actionName,
                params: {
                  ...(config.positionChangeParameters || config.parameters || {})
                }
              }
            ]
          }
        ]
      }
    };

    this.sendCommand(command);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.currentConnectionId = null;
    this.isConnecting = false;
    
    // Notify all connection callbacks
    this.connectionCallbacks.forEach(callback => callback(false));
  }
}

// Create singleton instance
const deviceWebSocketService = new DeviceWebSocketService();

export default deviceWebSocketService;
