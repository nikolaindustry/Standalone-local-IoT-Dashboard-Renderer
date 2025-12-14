// Independent IoT Dashboard Preview
// Renders dashboard in view mode without design tools

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useIoTBuilder } from '../contexts/IoTBuilderContext';
import { IoTWidgetRenderer } from './IoTWidgetRenderer';
import { ConnectionRenderer } from './ConnectionRenderer';
import { useScriptExecution } from '../hooks/useScriptExecution';
import { IoTDashboardWidget } from '../types';
import { supabase } from '@/integrations/supabase/client';
import deviceWebSocketService from '@/services/deviceWebSocketService';
import { useToast } from '@/hooks/use-toast';
import { Wifi, WifiOff, Activity } from 'lucide-react';

export const IoTPreview: React.FC = () => {
  const { state, actions } = useIoTBuilder();
  const { toast } = useToast();
  const [widgetStates, setWidgetStates] = useState<Map<string, any>>(new Map());
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [wsUrl, setWsUrl] = useState<string>('');
  const [wsConnectionId, setWsConnectionId] = useState<string>('');

  // Detect mobile viewport size
  useEffect(() => {
    const checkViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Monitor WebSocket connection status
  useEffect(() => {
    const handleConnectionChange = (connected: boolean) => {
      setWsConnected(connected);
      
      if (connected) {
        toast({
          title: 'WebSocket Connected',
          description: `Connected to ${wsUrl || 'server'}`,
          variant: 'default',
        });
        console.log('[IoTPreview] WebSocket connected');
      } else {
        toast({
          title: 'WebSocket Disconnected',
          description: 'Connection to server lost',
          variant: 'destructive',
        });
        console.log('[IoTPreview] WebSocket disconnected');
      }
    };

    const unsubscribe = deviceWebSocketService.onConnectionChange(handleConnectionChange);
    
    // Set initial connection status
    setWsConnected(deviceWebSocketService.isConnected());
    
    return () => {
      unsubscribe();
    };
  }, [toast, wsUrl]);

  // Get current user session and connect to WebSocket with appropriate target ID
  useEffect(() => {
    const initializeConnection = async () => {
      // Check for standalone mode configuration
      const standaloneConfig = (window as any).__STANDALONE_WS_CONFIG__;
      
      if (standaloneConfig) {
        // Standalone mode - use configured connection ID
        const targetId = standaloneConfig.id || 'standalone-dashboard';
        const url = standaloneConfig.url || '';
        
        setWsUrl(url);
        setWsConnectionId(targetId);
        
        console.log('[IoTPreview] Standalone mode detected');
        console.log('[IoTPreview] Connecting to:', url);
        console.log('[IoTPreview] Connection ID:', targetId);
        
        try {
          await deviceWebSocketService.connect(targetId);
          console.log('[IoTPreview] WebSocket connection established in standalone mode');
        } catch (error) {
          console.error('[IoTPreview] Failed to connect WebSocket in standalone mode:', error);
          toast({
            title: 'Connection Failed',
            description: 'Failed to establish WebSocket connection',
            variant: 'destructive',
          });
        }
      } else {
        // Normal mode - use Supabase authentication
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        setCurrentUserId(userId);
        
        if (userId) {
          // Use custom target ID if set, otherwise use user ID
          const targetId = state.config?.settings.customTargetId || userId;
          setWsConnectionId(targetId);
          
          console.log('[IoTPreview] Connecting WebSocket with target ID:', targetId);
          
          try {
            await deviceWebSocketService.connect(targetId);
          } catch (error) {
            console.error('[IoTPreview] Failed to connect WebSocket:', error);
            toast({
              title: 'Connection Failed',
              description: 'Failed to establish WebSocket connection',
              variant: 'destructive',
            });
          }
        }
      }
    };
    
    initializeConnection();
  }, [state.config?.settings.customTargetId, toast]);

  // Handle WebSocket messages and route them to widgets by widgetId
  useEffect(() => {
    const handleWebSocketMessage = (data: any) => {
      try {
        console.log('[IoTPreview] WebSocket message received:', data);

        // Extract widgetId and value from the message
        let widgetId: string | undefined;
        let value: any;

        // Check different message formats
        if (data.payload?.widgetId) {
          widgetId = data.payload.widgetId;
          value = data.payload.value !== undefined ? data.payload.value : data.payload;
        } else if (data.widgetId) {
          widgetId = data.widgetId;
          value = data.value !== undefined ? data.value : data;
        }

        if (widgetId) {
          console.log(`[IoTPreview] Routing data to widget ${widgetId}:`, value);
          
          // Update widget state with the received value
          setWidgetStates(prev => {
            const newStates = new Map(prev);
            const currentState = newStates.get(widgetId!) || {};
            newStates.set(widgetId!, { ...currentState, value });
            return newStates;
          });
          
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('[IoTPreview] Error processing WebSocket message:', error);
      }
    };

    const unsubscribe = deviceWebSocketService.onMessage(handleWebSocketMessage);
    return () => {
      unsubscribe();
    };
  }, []);

  const currentPage = state.config?.pages.find(p => p.id === state.activePageId);

  // Helper function to generate background style
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!currentPage?.layout) return {};

    const { backgroundType, backgroundColor, backgroundGradient, backgroundImage, backgroundOpacity } = currentPage.layout;
    const style: React.CSSProperties = {};

    // Apply opacity if set
    if (backgroundOpacity !== undefined) {
      style.opacity = backgroundOpacity;
    }

    switch (backgroundType) {
      case 'gradient':
        if (backgroundGradient) {
          const { type, angle, colors } = backgroundGradient;
          const colorStops = colors.map(c => `${c.color} ${c.position}%`).join(', ');
          
          if (type === 'linear') {
            style.background = `linear-gradient(${angle || 90}deg, ${colorStops})`;
          } else {
            style.background = `radial-gradient(circle, ${colorStops})`;
          }
        }
        break;

      case 'image':
        if (backgroundImage?.url) {
          style.backgroundImage = `url(${backgroundImage.url})`;
          style.backgroundSize = backgroundImage.size === 'custom' ? '100% 100%' : (backgroundImage.size || 'cover');
          style.backgroundPosition = backgroundImage.position || 'center';
          style.backgroundRepeat = backgroundImage.repeat || 'no-repeat';
          
          // If image has its own opacity, layer it
          if (backgroundImage.opacity !== undefined && backgroundImage.opacity < 1) {
            style.position = 'relative';
          }
        }
        break;

      case 'solid':
      default:
        if (backgroundColor) {
          style.backgroundColor = backgroundColor;
        }
        break;
    }

    return style;
  };

  // Convert IoT widgets to format for script executor
  const dashboardWidgets: IoTDashboardWidget[] = currentPage?.widgets.map(widget => ({
    ...widget,
    position: widget.position,
    size: widget.size,
  })) || [];

  // Handle widget updates from script
  const handleWidgetUpdate = useCallback((widgetId: string, updates: Partial<any>) => {
    setWidgetStates(prev => {
      const newStates = new Map(prev);
      const currentState = newStates.get(widgetId) || {};
      newStates.set(widgetId, { ...currentState, ...updates });
      return newStates;
    });

    // Update the widget in the context if it's a permanent change
    if (updates.title !== undefined || updates.style !== undefined) {
      actions.updateWidget(widgetId, updates);
    }
  }, [actions]);

  // Handle transform updates (position, size, rotation) from script
  const handleTransformUpdate = useCallback((widgetId: string, transform: {
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    rotation?: number;
  }) => {
    if (transform.position) {
      actions.moveWidget(widgetId, transform.position);
    }
    if (transform.size) {
      actions.resizeWidget(widgetId, transform.size);
    }
    if (transform.rotation !== undefined) {
      actions.rotateWidget(widgetId, transform.rotation);
    }
  }, [actions]);

  // Script context - memoized to prevent infinite re-execution
  const scriptContext = useMemo(() => ({
    userId: currentUserId,
    userEmail: undefined,
    userRole: undefined,
    dashboardId: state.config?.id
  }), [currentUserId, state.config?.id]);

  // Execute dashboard script
  const { triggerWidgetEvent } = useScriptExecution(
    state.config?.script,
    dashboardWidgets,
    handleWidgetUpdate,
    true, // enabled
    undefined, // console logging
    scriptContext,
    supabase,
    handleTransformUpdate
  );

  if (!currentPage) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No page selected</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full overflow-auto"
      style={{
        ...getBackgroundStyle(),
      }}
    >
      {/* WebSocket Connection Status Bar - Integrated in Header */}
      <div 
        className={`px-4 py-2 flex items-center justify-between border-b transition-all ${wsConnected 
          ? 'bg-emerald-500/10 border-emerald-500/30 backdrop-blur-sm' 
          : 'bg-red-500/10 border-red-500/30 backdrop-blur-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          {wsConnected ? (
            <>
              <div className="relative">
                <Wifi className="w-4 h-4 text-emerald-500" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <span className="text-xs font-mono text-emerald-600 font-medium uppercase tracking-wider">
                Connected
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-xs font-mono text-red-600 font-medium uppercase tracking-wider">
                Disconnected
              </span>
            </>
          )}
          {wsUrl && (
            <>
              <div className="h-3 w-px bg-gray-300" />
              <span className="text-xs font-mono text-gray-600 truncate max-w-xs">
                {wsUrl}
              </span>
            </>
          )}
          {wsConnectionId && (
            <>
              <div className="h-3 w-px bg-gray-300" />
              <span className="text-xs font-mono text-gray-500">
                ID: {wsConnectionId}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {wsConnected && (
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-emerald-600">LIVE</span>
            </div>
          )}
        </div>
      </div>

      <div 
        className="relative"
        style={{
          // Use editingViewMode if in design mode, otherwise detect viewport
          minWidth: (state.editingViewMode === 'mobile' || (state.mode === 'preview' && isMobileViewport)) ? '375px' : '1200px',
          minHeight: (state.editingViewMode === 'mobile' || (state.mode === 'preview' && isMobileViewport)) ? '667px' : '800px',
          maxWidth: (state.editingViewMode === 'mobile' || (state.mode === 'preview' && isMobileViewport)) ? '375px' : undefined,
        }}
      >
        {/* SVG layer for connections */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{
            width: '100%',
            height: '100%',
            minWidth: (state.editingViewMode === 'mobile' || (state.mode === 'preview' && isMobileViewport)) ? '375px' : '1200px',
            minHeight: (state.editingViewMode === 'mobile' || (state.mode === 'preview' && isMobileViewport)) ? '667px' : '800px',
            zIndex: 0
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {currentPage.connections?.map(connection => (
            <g key={connection.id}>
              <ConnectionRenderer
                connection={connection}
                widgets={currentPage.widgets}
                zoom={1}
                editingViewMode={state.editingViewMode === 'mobile' || (state.mode === 'preview' && isMobileViewport) ? 'mobile' : 'desktop'}
              />
            </g>
          ))}
        </svg>

        {/* Widgets layer */}
        {currentPage.widgets.map(widget => {
          // Merge script state updates with widget config
          const widgetState = widgetStates.get(widget.id);
          const mergedWidget: IoTDashboardWidget = widgetState ? {
            ...widget,
            ...widgetState,
            config: { ...widget.config, ...widgetState.config },
            style: { ...widget.style, ...widgetState.style },
          } : widget;

          // Extract value from widgetState for passing to renderer
          const widgetValue = widgetState?.value;

          // Use mobile layout when in mobile editing mode OR when viewport is mobile size
          const shouldUseMobileLayout = state.editingViewMode === 'mobile' || (state.mode === 'preview' && isMobileViewport);
          const position = shouldUseMobileLayout && mergedWidget.mobileLayout 
            ? mergedWidget.mobileLayout.position 
            : mergedWidget.position;
          const size = shouldUseMobileLayout && mergedWidget.mobileLayout 
            ? mergedWidget.mobileLayout.size 
            : mergedWidget.size;

          // Debug logging for spectral-graph widgets
          if (widget.type === 'spectral-graph') {
            console.log('[IoTPreview] Rendering spectral-graph widget:', {
              widgetId: widget.id,
              hasWidgetState: !!widgetState,
              widgetValue,
              widgetStateKeys: widgetState ? Object.keys(widgetState) : []
            });
          }

          // Debug logging for vector-plot-3d widgets
          if (widget.type === 'vector-plot-3d') {
            console.log('[IoTPreview] Rendering vector-plot-3d widget:', {
              widgetId: widget.id,
              hasWidgetState: !!widgetState,
              widgetValue,
              valueType: typeof widgetValue,
              hasVectors: widgetValue?.vectors ? true : false,
              vectorCount: widgetValue?.vectors?.length || 0
            });
          }

          return (
            <div
              key={widget.id}
              className="absolute"
              style={{
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
                transform: mergedWidget.rotation ? `rotate(${mergedWidget.rotation}deg)` : undefined,
                zIndex: mergedWidget.style?.zIndex !== undefined ? mergedWidget.style.zIndex : 'auto',
              }}
            >
              <IoTWidgetRenderer
                widget={mergedWidget}
                isSelected={false}
                isDesignMode={false}
                value={widgetValue}
                onUpdate={(id, updates) => {
                  // Update local state for immediate UI feedback
                  handleWidgetUpdate(id, updates);
                }}
                onWidgetEvent={triggerWidgetEvent}
                deviceId={currentUserId}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
