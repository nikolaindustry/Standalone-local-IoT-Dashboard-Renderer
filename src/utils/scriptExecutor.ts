import deviceWebSocketService from '@/services/deviceWebSocketService';
import { customWebSocketService } from './customWebSocketService';
import { IoTDashboardWidget } from '../types';
import { createIoTSensorAPI } from './iotSensorAPI';
import { createIoTUsbAPI } from './iotUsbAPI';


export interface WidgetAPI {
  get: (widgetId: string) => IoTDashboardWidget | undefined;
  setValue: (widgetId: string, value: any) => void;
  getValue: (widgetId: string) => any;
  setText: (widgetId: string, text: string) => void;
  getText: (widgetId: string) => string | undefined;
  show: (widgetId: string) => void;
  hide: (widgetId: string) => void;
  setPosition: (widgetId: string, x: number, y: number) => void;
  getPosition: (widgetId: string) => { x: number; y: number } | undefined;
  setSize: (widgetId: string, width: number, height: number) => void;
  getSize: (widgetId: string) => { width: number; height: number } | undefined;
  resize: (widgetId: string, width: number, height: number) => void;
  move: (widgetId: string, x: number, y: number) => void;
  setRotation: (widgetId: string, degrees: number) => void;
  getRotation: (widgetId: string) => number | undefined;
  setConfig: (widgetId: string, configKey: string, value: any) => void;
  getConfig: (widgetId: string, configKey?: string) => any;
  on: (widgetId: string, event: string, callback: (value: any) => void) => () => void;
  once: (widgetId: string, event: string, callback: (value: any) => void) => () => void;
  off: (widgetId: string, event?: string, callback?: (value: any) => void) => void;
  emit: (widgetId: string, event: string, value?: any) => void;
}

export interface WebSocketAPI {
  send: (targetId: string, payload: any) => void;
  onMessage: (callback: (message: any) => void) => () => void;
  // Custom WebSocket methods
  connect: (url: string, onMessage?: (data: any) => void) => Promise<boolean>;
  disconnect: (url: string) => void;
  sendTo: (url: string, data: any) => boolean;
  isConnected: (url: string) => boolean;
}

export interface HttpAPI {
  get: (url: string, options?: RequestInit) => Promise<any>;
  post: (url: string, body?: any, options?: RequestInit) => Promise<any>;
  put: (url: string, body?: any, options?: RequestInit) => Promise<any>;
  delete: (url: string, options?: RequestInit) => Promise<any>;
  request: (url: string, options?: RequestInit) => Promise<any>;
}

export interface DeviceAPI {
  getDevices: () => Promise<Array<{id: string; name: string; online: boolean}>>;
  getDeviceData: (deviceId: string, limit?: number) => Promise<any[]>;
  sendCommand: (deviceId: string, command: any) => Promise<void>;
}

export interface StorageAPI {
  set: (key: string, value: any) => void;
  get: (key: string) => any;
  remove: (key: string) => void;
  clear: () => void;
}

export interface DatabaseAPI {
  // Dashboard-specific storage (stored in dashboard config)
  save: (key: string, value: any) => Promise<void>;
  load: (key: string) => Promise<any>;
  remove: (key: string) => Promise<void>;
  list: () => Promise<string[]>;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchEnabled: boolean;
}

export interface LocationAPI {
  getCurrentPosition: (options?: PositionOptions) => Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
    timestamp: number;
  }>;
  watchPosition: (
    callback: (position: {
      latitude: number;
      longitude: number;
      accuracy: number;
      altitude: number | null;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
      timestamp: number;
    }) => void,
    options?: PositionOptions
  ) => () => void;
  isSupported: () => boolean;
}

export interface ContextAPI {
  user: {
    id: string;
    email: string | undefined;
    role: string | undefined;
  } | null;
  device: DeviceInfo;
  dashboardId: string | null;
}

export interface ScriptContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  dashboardId?: string;
}

export type ConsoleLogCallback = (type: 'log' | 'warn' | 'error' | 'info', message: string, args: any[]) => void;

// Device detection utility
function detectDevice(): DeviceInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const touchEnabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const orientation = width > height ? 'landscape' : 'portrait';
  
  let type: 'mobile' | 'tablet' | 'desktop';
  
  // Device type detection based on screen width
  if (width < 768) {
    type = 'mobile';
  } else if (width >= 768 && width < 1024) {
    type = 'tablet';
  } else {
    type = 'desktop';
  }
  
  return {
    type,
    isMobile: type === 'mobile',
    isTablet: type === 'tablet',
    isDesktop: type === 'desktop',
    screenWidth: width,
    screenHeight: height,
    orientation,
    touchEnabled
  };
}

export class ScriptExecutor {
  private widgets: IoTDashboardWidget[];
  private widgetUpdateCallbacks: Map<string, (widgetId: string, updates: Partial<IoTDashboardWidget>) => void>;
  private eventListeners: Map<string, Map<string, Set<Function>>>;
  private cleanupFunctions: Set<() => void>;
  private storagePrefix: string = 'dashboard_script_';
  private onConsoleLog?: ConsoleLogCallback;
  private scriptContext: ScriptContext;
  private supabase: any;

  constructor(
    widgets: IoTDashboardWidget[],
    onWidgetUpdate: (widgetId: string, updates: Partial<IoTDashboardWidget>) => void,
    onConsoleLog?: ConsoleLogCallback,
    context?: ScriptContext,
    supabase?: any,
    onTransformUpdate?: (widgetId: string, transform: {
      position?: { x: number; y: number };
      size?: { width: number; height: number };
      rotation?: number;
    }) => void
  ) {
    this.widgets = widgets;
    this.widgetUpdateCallbacks = new Map();
    this.widgetUpdateCallbacks.set('default', onWidgetUpdate);
    if (onTransformUpdate) {
      this.widgetUpdateCallbacks.set('transform', onTransformUpdate as any);
    }
    this.eventListeners = new Map();
    this.cleanupFunctions = new Set();
    this.onConsoleLog = onConsoleLog;
    this.scriptContext = context || {};
    this.supabase = supabase;
    
    // Set console logger for custom WebSocket service
    customWebSocketService.setConsoleLogger(onConsoleLog);
  }

  private createWidgetAPI(): WidgetAPI {
    return {
      get: (widgetId: string) => {
        return this.widgets.find(w => w.id === widgetId);
      },

      setValue: (widgetId: string, value: any) => {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) {
          console.warn(`Widget ${widgetId} not found`);
          return;
        }

        const oldValue = this.createWidgetAPI().getValue(widgetId);
        const updates: Partial<IoTDashboardWidget> & { value?: any } = {};
        
        // Update based on widget type
        switch (widget.type) {
          case 'switch':
          case 'button':
            updates.config = { ...widget.config, state: value };
            updates.value = value; // Set top-level value for renderer
            // Also update the internal widget config for getValue to work
            widget.config.state = value;
            break;
          case 'slider':
          case 'gauge':
            updates.config = { ...widget.config, value: Number(value) };
            updates.value = Number(value); // Set top-level value for renderer
            // Also update the internal widget config for getValue to work
            widget.config.value = Number(value);
            break;
          case 'status':
            updates.config = { ...widget.config, status: value };
            updates.value = value; // Set top-level value for renderer
            // Also update the internal widget config for getValue to work
            widget.config.status = value;
            break;
          case 'text-input':
            updates.config = { ...widget.config, value };
            updates.value = value; // Set top-level value for renderer
            // Also update the internal widget config for getValue to work
            widget.config.value = value;
            break;
          default:
            updates.config = { ...widget.config, value };
            updates.value = value; // Set top-level value for renderer
            // Also update the internal widget config for getValue to work
            widget.config.value = value;
        }

        const callback = this.widgetUpdateCallbacks.get('default');
        if (callback) {
          callback(widgetId, updates);
        }

        // Trigger change and update events
        this.triggerEvent(widgetId, 'change', value);
        this.triggerEvent(widgetId, 'update', value);
        
        // Trigger type-specific events for switches
        if (widget.type === 'switch') {
          this.triggerEvent(widgetId, 'toggle', value);
          if (value === true || value === 'on' || value === 1) {
            this.triggerEvent(widgetId, 'on', value);
          } else if (value === false || value === 'off' || value === 0) {
            this.triggerEvent(widgetId, 'off', value);
          }
        }
        
        // Trigger threshold events for numeric values
        if (widget.type === 'slider' || widget.type === 'gauge') {
          const numValue = Number(value);
          const oldNumValue = Number(oldValue);
          const minValue = widget.config.minValue || 0;
          const maxValue = widget.config.maxValue || 100;
          
          // Check for min/max threshold crossings
          if (numValue <= minValue && oldNumValue > minValue) {
            this.triggerEvent(widgetId, 'min', numValue);
          }
          if (numValue >= maxValue && oldNumValue < maxValue) {
            this.triggerEvent(widgetId, 'max', numValue);
          }
          
          // Check for custom threshold if configured
          if (widget.config.threshold !== undefined) {
            const threshold = Number(widget.config.threshold);
            if ((oldNumValue < threshold && numValue >= threshold) || 
                (oldNumValue >= threshold && numValue < threshold)) {
              this.triggerEvent(widgetId, 'threshold', { value: numValue, threshold });
            }
          }
        }
      },

      getValue: (widgetId: string) => {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) {
          console.warn(`Widget ${widgetId} not found`);
          return undefined;
        }

        switch (widget.type) {
          case 'switch':
          case 'button':
            return widget.config.state;
          case 'slider':
          case 'gauge':
            return widget.config.value;
          case 'status':
            return widget.config.status;
          case 'text-input':
            // For text input widgets, check value first, then default value
            return widget.config.value !== undefined ? widget.config.value : (widget.config.textInputDefaultValue || '');
          default:
            return widget.config.value;
        }
      },

      setText: (widgetId: string, text: string) => {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) {
          console.warn(`Widget ${widgetId} not found`);
          return;
        }

        const callback = this.widgetUpdateCallbacks.get('default');
        if (callback) {
          callback(widgetId, { title: text });
          this.triggerEvent(widgetId, 'change', text);
          this.triggerEvent(widgetId, 'update', text);
        }
      },

      getText: (widgetId: string) => {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) {
          console.warn(`Widget ${widgetId} not found`);
          return undefined;
        }

        // For label widgets, check value first, then title
        if (widget.type === 'label') {
          // Check config.value first
          if (widget.config?.value !== undefined && widget.config.value !== null) {
            return String(widget.config.value);
          }
          // Fall back to title
          return widget.title || '';
        }

        // For other widgets, return title
        return widget.title || '';
      },

      show: (widgetId: string) => {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) {
          console.warn(`Widget ${widgetId} not found`);
          return;
        }
        const callback = this.widgetUpdateCallbacks.get('default');
        if (callback) {
          callback(widgetId, { 
            style: { ...widget.style, visible: true } 
          });
          this.triggerEvent(widgetId, 'visible', true);
        }
      },

      hide: (widgetId: string) => {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) {
          console.warn(`Widget ${widgetId} not found`);
          return;
        }
        const callback = this.widgetUpdateCallbacks.get('default');
        if (callback) {
          callback(widgetId, { 
            style: { ...widget.style, visible: false } 
          });
          this.triggerEvent(widgetId, 'hidden', true);
        }
      },

      setPosition: (widgetId: string, x: number, y: number) => {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) {
          console.warn(`Widget ${widgetId} not found`);
          return;
        }
        const callback = this.widgetUpdateCallbacks.get('transform');
        if (callback) {
          (callback as any)(widgetId, { position: { x, y } });
        }
      },

      getPosition: (widgetId: string) => {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) {
          console.warn(`Widget ${widgetId} not found`);
          return undefined;
        }
        // Return current position from widget
        return widget.position;
      },

      setSize: (widgetId: string, width: number, height: number) => {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) {
          console.warn(`Widget ${widgetId} not found`);
          return;
        }
        const callback = this.widgetUpdateCallbacks.get('transform');
        if (callback) {
          (callback as any)(widgetId, { size: { width, height } });
        }
      },

      getSize: (widgetId: string) => {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) {
          console.warn(`Widget ${widgetId} not found`);
          return undefined;
        }
        // Return current size from widget
        return widget.size;
      },

      resize: (widgetId: string, width: number, height: number) => {
        // Alias for setSize for more intuitive naming
        this.createWidgetAPI().setSize(widgetId, width, height);
      },

      move: (widgetId: string, x: number, y: number) => {
        // Alias for setPosition for more intuitive naming
        this.createWidgetAPI().setPosition(widgetId, x, y);
      },

      setRotation: (widgetId: string, degrees: number) => {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) {
          console.warn(`Widget ${widgetId} not found`);
          return;
        }
        const callback = this.widgetUpdateCallbacks.get('transform');
        if (callback) {
          (callback as any)(widgetId, { rotation: degrees });
        }
      },

      getRotation: (widgetId: string) => {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) {
          console.warn(`Widget ${widgetId} not found`);
          return undefined;
        }
        return widget.rotation;
      },

      setConfig: (widgetId: string, configKey: string, value: any) => {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) {
          console.warn(`Widget ${widgetId} not found`);
          return;
        }

        // Update the widget's config
        const updatedConfig = { ...widget.config, [configKey]: value };
        widget.config = updatedConfig;

        const callback = this.widgetUpdateCallbacks.get('default');
        if (callback) {
          callback(widgetId, { config: updatedConfig });
          this.triggerEvent(widgetId, 'update', { configKey, value });
        }
      },

      getConfig: (widgetId: string, configKey?: string) => {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) {
          console.warn(`Widget ${widgetId} not found`);
          return undefined;
        }

        // If no configKey provided, return entire config object
        if (configKey === undefined) {
          return widget.config;
        }

        // Return specific config value
        return widget.config?.[configKey];
      },

      on: (widgetId: string, event: string, callback: (value: any) => void) => {
        if (!this.eventListeners.has(widgetId)) {
          this.eventListeners.set(widgetId, new Map());
        }
        
        const widgetEvents = this.eventListeners.get(widgetId)!;
        if (!widgetEvents.has(event)) {
          widgetEvents.set(event, new Set());
        }
        
        widgetEvents.get(event)!.add(callback);

        // Return cleanup function
        const cleanup = () => {
          const callbacks = widgetEvents.get(event);
          if (callbacks) {
            callbacks.delete(callback);
          }
        };
        
        this.cleanupFunctions.add(cleanup);
        return cleanup;
      },

      once: (widgetId: string, event: string, callback: (value: any) => void) => {
        const onceWrapper = (value: any) => {
          callback(value);
          // Auto-cleanup after first trigger
          const widgetEvents = this.eventListeners.get(widgetId);
          if (widgetEvents) {
            const callbacks = widgetEvents.get(event);
            if (callbacks) {
              callbacks.delete(onceWrapper);
            }
          }
        };
        
        // Register the once wrapper directly without creating new API instance
        if (!this.eventListeners.has(widgetId)) {
          this.eventListeners.set(widgetId, new Map());
        }
        
        const widgetEvents = this.eventListeners.get(widgetId)!;
        if (!widgetEvents.has(event)) {
          widgetEvents.set(event, new Set());
        }
        
        widgetEvents.get(event)!.add(onceWrapper);

        // Return cleanup function
        const cleanup = () => {
          const callbacks = widgetEvents.get(event);
          if (callbacks) {
            callbacks.delete(onceWrapper);
          }
        };
        
        this.cleanupFunctions.add(cleanup);
        return cleanup;
      },

      off: (widgetId: string, event?: string, callback?: (value: any) => void) => {
        const widgetEvents = this.eventListeners.get(widgetId);
        if (!widgetEvents) return;

        // Remove all events for widget
        if (!event) {
          this.eventListeners.delete(widgetId);
          return;
        }

        // Remove specific event
        if (!callback) {
          widgetEvents.delete(event);
          return;
        }

        // Remove specific callback
        const callbacks = widgetEvents.get(event);
        if (callbacks) {
          callbacks.delete(callback);
        }
      },

      emit: (widgetId: string, event: string, value?: any) => {
        this.triggerEvent(widgetId, event, value);
      }
    };
  }

  private createWebSocketAPI(): WebSocketAPI {
    return {
      send: (targetId: string, payload: any) => {
        deviceWebSocketService.sendMessage({
          targetId,
          payload
        });
      },

      onMessage: (callback: (message: any) => void) => {
        const unsubscribe = deviceWebSocketService.onMessage((event) => {
          try {
            const data = JSON.parse(event.data);
            callback(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });

        this.cleanupFunctions.add(unsubscribe);
        return unsubscribe;
      },

      // Custom WebSocket connection - uses singleton service
      connect: async (url: string, onMessage?: (data: any) => void): Promise<boolean> => {
        return customWebSocketService.connect(url, onMessage);
      },

      disconnect: (url: string) => {
        customWebSocketService.disconnect(url);
      },

      sendTo: (url: string, data: any): boolean => {
        return customWebSocketService.sendTo(url, data);
      },

      isConnected: (url: string): boolean => {
        return customWebSocketService.isConnected(url);
      }
    };
  }

  private createStorageAPI(): StorageAPI {
    return {
      set: (key: string, value: any) => {
        try {
          const fullKey = this.storagePrefix + key;
          localStorage.setItem(fullKey, JSON.stringify(value));
        } catch (error) {
          console.error('Error storing value:', error);
        }
      },

      get: (key: string) => {
        try {
          const fullKey = this.storagePrefix + key;
          const value = localStorage.getItem(fullKey);
          return value ? JSON.parse(value) : undefined;
        } catch (error) {
          console.error('Error retrieving value:', error);
          return undefined;
        }
      },

      remove: (key: string) => {
        const fullKey = this.storagePrefix + key;
        localStorage.removeItem(fullKey);
      },

      clear: () => {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(this.storagePrefix)) {
            localStorage.removeItem(key);
          }
        });
      }
    };
  }

  private createDatabaseAPI(): DatabaseAPI {
    return {
      save: async (key: string, value: any) => {
        if (!this.supabase) {
          throw new Error('Database not available');
        }
        
        if (!this.scriptContext?.dashboardId) {
          throw new Error('Dashboard ID not available in context');
        }

        try {
          // Get current dashboard config
          const { data: dashboard, error: fetchError } = await this.supabase
            .from('custom_iot_dashboards')
            .select('dashboard_config')
            .eq('id', this.scriptContext.dashboardId)
            .single();

          if (fetchError) throw fetchError;

          // Update dashboard config with new data
          const updatedConfig = {
            ...dashboard.dashboard_config,
            scriptData: {
              ...(dashboard.dashboard_config.scriptData || {}),
              [key]: value
            }
          };

          const { error: updateError } = await this.supabase
            .from('custom_iot_dashboards')
            .update({ 
              dashboard_config: updatedConfig,
              updated_at: new Date().toISOString()
            })
            .eq('id', this.scriptContext.dashboardId);

          if (updateError) throw updateError;

          this.onConsoleLog?.('info', `[Database] Saved key: ${key}`, [value]);
        } catch (error) {
          console.error('[DatabaseAPI] Save failed:', error);
          this.onConsoleLog?.('error', `Database save failed: ${error}`, [error]);
          throw error;
        }
      },

      load: async (key: string) => {
        if (!this.supabase) {
          throw new Error('Database not available');
        }
        
        if (!this.scriptContext?.dashboardId) {
          throw new Error('Dashboard ID not available in context');
        }

        try {
          const { data, error } = await this.supabase
            .from('custom_iot_dashboards')
            .select('dashboard_config')
            .eq('id', this.scriptContext.dashboardId)
            .single();

          if (error) throw error;

          const scriptData = data.dashboard_config?.scriptData || {};
          const value = scriptData[key];
          
          this.onConsoleLog?.('info', `[Database] Loaded key: ${key}`, [value]);
          return value;
        } catch (error) {
          console.error('[DatabaseAPI] Load failed:', error);
          this.onConsoleLog?.('error', `Database load failed: ${error}`, [error]);
          throw error;
        }
      },

      remove: async (key: string) => {
        if (!this.supabase) {
          throw new Error('Database not available');
        }
        
        if (!this.scriptContext?.dashboardId) {
          throw new Error('Dashboard ID not available in context');
        }

        try {
          // Get current dashboard config
          const { data: dashboard, error: fetchError } = await this.supabase
            .from('custom_iot_dashboards')
            .select('dashboard_config')
            .eq('id', this.scriptContext.dashboardId)
            .single();

          if (fetchError) throw fetchError;

          // Remove key from scriptData
          const scriptData = { ...(dashboard.dashboard_config.scriptData || {}) };
          delete scriptData[key];

          const updatedConfig = {
            ...dashboard.dashboard_config,
            scriptData
          };

          const { error: updateError } = await this.supabase
            .from('custom_iot_dashboards')
            .update({ 
              dashboard_config: updatedConfig,
              updated_at: new Date().toISOString()
            })
            .eq('id', this.scriptContext.dashboardId);

          if (updateError) throw updateError;

          this.onConsoleLog?.('info', `[Database] Removed key: ${key}`, []);
        } catch (error) {
          console.error('[DatabaseAPI] Remove failed:', error);
          this.onConsoleLog?.('error', `Database remove failed: ${error}`, [error]);
          throw error;
        }
      },

      list: async () => {
        if (!this.supabase) {
          throw new Error('Database not available');
        }
        
        if (!this.scriptContext?.dashboardId) {
          throw new Error('Dashboard ID not available in context');
        }

        try {
          const { data, error } = await this.supabase
            .from('custom_iot_dashboards')
            .select('dashboard_config')
            .eq('id', this.scriptContext.dashboardId)
            .single();

          if (error) throw error;

          const scriptData = data.dashboard_config?.scriptData || {};
          const keys = Object.keys(scriptData);
          
          this.onConsoleLog?.('info', `[Database] Listed keys`, [keys]);
          return keys;
        } catch (error) {
          console.error('[DatabaseAPI] List failed:', error);
          this.onConsoleLog?.('error', `Database list failed: ${error}`, [error]);
          throw error;
        }
      }
    };
  }

  private createLocationAPI(): LocationAPI {
    return {
      getCurrentPosition: (options?: PositionOptions) => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
          }

          const defaultOptions: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
            ...options
          };

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                speed: position.coords.speed,
                timestamp: position.timestamp
              };
              this.onConsoleLog?.('info', '[Location] Position acquired', [locationData]);
              resolve(locationData);
            },
            (error) => {
              this.onConsoleLog?.('error', `[Location] Error: ${error.message}`, [error]);
              reject(error);
            },
            defaultOptions
          );
        });
      },

      watchPosition: (callback, options?: PositionOptions) => {
        if (!navigator.geolocation) {
          this.onConsoleLog?.('error', '[Location] Geolocation not supported', []);
          return () => {};
        }

        const defaultOptions: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
          ...options
        };

        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
              timestamp: position.timestamp
            };
            this.onConsoleLog?.('info', '[Location] Position updated', [locationData]);
            callback(locationData);
          },
          (error) => {
            this.onConsoleLog?.('error', `[Location] Watch error: ${error.message}`, [error]);
          },
          defaultOptions
        );

        const cleanup = () => {
          navigator.geolocation.clearWatch(watchId);
          this.onConsoleLog?.('info', '[Location] Watch stopped', []);
        };

        this.cleanupFunctions.add(cleanup);
        return cleanup;
      },

      isSupported: () => {
        return 'geolocation' in navigator;
      }
    };
  }

  private createContextAPI(): ContextAPI {
    return {
      user: this.scriptContext.userId ? {
        id: this.scriptContext.userId,
        email: this.scriptContext.userEmail,
        role: this.scriptContext.userRole
      } : null,
      device: detectDevice(),
      dashboardId: this.scriptContext.dashboardId || null
    };
  }

  private createHttpAPI(): HttpAPI {
    return {
      get: async (url: string, options?: RequestInit) => {
        try {
          const response = await fetch(url, { ...options, method: 'GET' });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const data = await response.json();
          this.onConsoleLog?.('info', `[HTTP] GET ${url}`, [data]);
          return data;
        } catch (error) {
          this.onConsoleLog?.('error', `[HTTP] GET ${url} failed`, [error]);
          throw error;
        }
      },

      post: async (url: string, body?: any, options?: RequestInit) => {
        try {
          const response = await fetch(url, {
            ...options,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers
            },
            body: body ? JSON.stringify(body) : undefined
          });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const data = await response.json();
          this.onConsoleLog?.('info', `[HTTP] POST ${url}`, [data]);
          return data;
        } catch (error) {
          this.onConsoleLog?.('error', `[HTTP] POST ${url} failed`, [error]);
          throw error;
        }
      },

      put: async (url: string, body?: any, options?: RequestInit) => {
        try {
          const response = await fetch(url, {
            ...options,
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers
            },
            body: body ? JSON.stringify(body) : undefined
          });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const data = await response.json();
          this.onConsoleLog?.('info', `[HTTP] PUT ${url}`, [data]);
          return data;
        } catch (error) {
          this.onConsoleLog?.('error', `[HTTP] PUT ${url} failed`, [error]);
          throw error;
        }
      },

      delete: async (url: string, options?: RequestInit) => {
        try {
          const response = await fetch(url, { ...options, method: 'DELETE' });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const data = await response.json();
          this.onConsoleLog?.('info', `[HTTP] DELETE ${url}`, [data]);
          return data;
        } catch (error) {
          this.onConsoleLog?.('error', `[HTTP] DELETE ${url} failed`, [error]);
          throw error;
        }
      },

      request: async (url: string, options?: RequestInit) => {
        try {
          const response = await fetch(url, options);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const data = await response.json();
          this.onConsoleLog?.('info', `[HTTP] ${options?.method || 'GET'} ${url}`, [data]);
          return data;
        } catch (error) {
          this.onConsoleLog?.('error', `[HTTP] ${options?.method || 'GET'} ${url} failed`, [error]);
          throw error;
        }
      }
    };
  }

  private createDeviceAPI(): DeviceAPI {
    return {
      getDevices: async () => {
        if (!this.supabase) {
          this.onConsoleLog?.('warn', '[DeviceAPI] Database not available', []);
          return [];
        }
        
        if (!this.scriptContext?.userId) {
          this.onConsoleLog?.('warn', '[DeviceAPI] User not authenticated - returning empty device list', []);
          return [];
        }

        try {
          const { data, error } = await this.supabase
            .from('user_devices')
            .select('id, device_name, product_id')
            .eq('user_id', this.scriptContext.userId);

          if (error) throw error;

          const devices = data?.map((d: any) => ({
            id: d.id,
            name: d.device_name,
            online: true // You can add online status check here
          })) || [];
          
          this.onConsoleLog?.('info', `[DeviceAPI] Found ${devices.length} device(s)`, [devices]);
          return devices;
        } catch (error) {
          console.error('[DeviceAPI] Get devices failed:', error);
          this.onConsoleLog?.('error', 'Failed to get devices', [error]);
          return [];
        }
      },

      getDeviceData: async (deviceId: string, limit: number = 100) => {
        if (!this.supabase) {
          throw new Error('Database not available');
        }

        try {
          const { data, error } = await this.supabase
            .from('sensor_data')
            .select('*')
            .eq('device_id', deviceId)
            .order('timestamp', { ascending: false })
            .limit(limit);

          if (error) throw error;

          return data || [];
        } catch (error) {
          console.error('[DeviceAPI] Get device data failed:', error);
          this.onConsoleLog?.('error', `Failed to get data for device ${deviceId}`, [error]);
          throw error;
        }
      },

      sendCommand: async (deviceId: string, command: any) => {
        deviceWebSocketService.sendMessage({
          targetId: deviceId,
          payload: command
        });
        this.onConsoleLog?.('info', `[DeviceAPI] Command sent to ${deviceId}`, [command]);
      }
    };
  }

  private triggerEvent(widgetId: string, event: string, value: any) {
    const widgetEvents = this.eventListeners.get(widgetId);
    if (!widgetEvents) {
      console.log('[ScriptExecutor] No event listeners for widget', widgetId);
      return;
    }

    const callbacks = widgetEvents.get(event);
    if (!callbacks || callbacks.size === 0) {
      console.log('[ScriptExecutor] No callbacks for event', { widgetId, event, availableEvents: Array.from(widgetEvents.keys()) });
      return;
    }

    console.log('[ScriptExecutor] Triggering event', { widgetId, event, callbackCount: callbacks.size });
    // Log event for debugging (only if callbacks exist)
    this.onConsoleLog?.('info', `[Event] ${widgetId}.${event}`, [value]);

    // Create a copy of callbacks to avoid issues with removal during iteration
    const callbacksCopy = Array.from(callbacks);
    
    callbacksCopy.forEach(callback => {
      try {
        callback(value);
      } catch (error) {
        console.error(`Error in event handler for ${widgetId}.${event}:`, error);
        this.onConsoleLog?.('error', `Error in event handler for ${widgetId}.${event}`, [error]);
      }
    });
  }
  
  // Trigger lifecycle event for widget initialization
  triggerLifecycleEvent(widgetId: string, event: 'load' | 'ready' | 'destroy'): void {
    this.triggerEvent(widgetId, event, { widgetId });
  }

  execute(script: string): void {
    try {
      // Create sandboxed environment
      const widget = this.createWidgetAPI();
      const ws = this.createWebSocketAPI();
      const storage = this.createStorageAPI();
      const db = this.createDatabaseAPI();
      const context = this.createContextAPI();
      const location = this.createLocationAPI();
      const http = this.createHttpAPI();
      const device = this.createDeviceAPI();
      const sensor = createIoTSensorAPI(this.onConsoleLog);
      const usb = createIoTUsbAPI(this.onConsoleLog);

      // Create safe console that captures logging
      const safeConsole = {
        log: (...args: any[]) => {
          console.log('[Dashboard Script]', ...args);
          this.onConsoleLog?.('log', args.join(' '), args);
        },
        warn: (...args: any[]) => {
          console.warn('[Dashboard Script]', ...args);
          this.onConsoleLog?.('warn', args.join(' '), args);
        },
        error: (...args: any[]) => {
          console.error('[Dashboard Script]', ...args);
          this.onConsoleLog?.('error', args.join(' '), args);
        },
        info: (...args: any[]) => {
          console.info('[Dashboard Script]', ...args);
          this.onConsoleLog?.('info', args.join(' '), args);
        }
      };

      // Execute script in controlled context
      const scriptFunction = new Function(
        'widget',
        'ws',
        'storage',
        'db',
        'context',
        'location',
        'http',
        'device',
        'sensor',
        'usb',
        'console',
        'fetch',
        'setTimeout',
        'setInterval',
        script
      );

      scriptFunction(widget, ws, storage, db, context, location, http, device, sensor, usb, safeConsole, fetch, setTimeout, setInterval);
      
      console.log('[Dashboard Script] Script executed successfully');
      this.onConsoleLog?.('info', 'Script executed successfully', []);
    } catch (error: any) {
      console.error('[Dashboard Script] Execution error:', error);
      this.onConsoleLog?.('error', 'Script execution failed', [error]);
      throw error;
    }
  }

  // Trigger widget events from external sources (e.g., UI interactions)
  triggerWidgetEvent(widgetId: string, event: string, value: any): void {
    console.log('[ScriptExecutor] triggerWidgetEvent called', { widgetId, event, value });
    this.triggerEvent(widgetId, event, value);
  }

  // Cleanup all event listeners
  cleanup(): void {
    // Note: We don't close custom WebSocket connections here anymore
    // as they persist across script executions via the singleton service
    
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions.clear();
    this.eventListeners.clear();
  }
}
