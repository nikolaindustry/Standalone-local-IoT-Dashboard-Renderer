// Independent IoT Dashboard Builder Context
// No dependencies on Product Dashboard Designer

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  IoTDashboardState,
  IoTDashboardActions,
  IoTDashboardConfig,
  IoTDashboardWidget,
  IoTDashboardPage,
  IoTWidgetPosition,
  IoTWidgetSize,
  DashboardConnection
} from '../types';

interface IoTBuilderContextValue {
  state: IoTDashboardState;
  actions: IoTDashboardActions;
}

const IoTBuilderContext = createContext<IoTBuilderContextValue | null>(null);

type Action =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_CONFIG'; config: IoTDashboardConfig }
  | { type: 'UPDATE_CONFIG'; updates: Partial<IoTDashboardConfig> }
  | { type: 'SET_MODE'; mode: 'design' | 'preview' | 'script' }
  | { type: 'SET_TOOL'; tool: IoTDashboardState['activeTool'] }
  | { type: 'SELECT_WIDGET'; id: string; multi: boolean }
  | { type: 'SELECT_WIDGETS'; ids: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'ADD_WIDGET'; widget: IoTDashboardWidget; pageId: string }
  | { type: 'UPDATE_WIDGET'; id: string; updates: Partial<IoTDashboardWidget> }
  | { type: 'DELETE_WIDGET'; id: string }
  | { type: 'MOVE_WIDGET'; id: string; position: IoTWidgetPosition }
  | { type: 'RESIZE_WIDGET'; id: string; size: IoTWidgetSize }
  | { type: 'ROTATE_WIDGET'; id: string; rotation: number }
  | { type: 'SET_CLIPBOARD'; widgets: IoTDashboardWidget[] }
  | { type: 'SET_ACTIVE_PAGE'; pageId: string }
  | { type: 'ADD_PAGE'; page: IoTDashboardPage }
  | { type: 'DUPLICATE_PAGE'; pageId: string }
  | { type: 'DELETE_PAGE'; id: string }
  | { type: 'RENAME_PAGE'; id: string; name: string }
  | { type: 'UPDATE_PAGE_LAYOUT'; id: string; layout: Partial<IoTDashboardPage['layout']> }
  | { type: 'TOGGLE_GRID' }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_EDITING_VIEW_MODE'; mode: 'desktop' | 'mobile' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'UPDATE_WIDGET_VALUE'; id: string; value: any }
  | { type: 'ADD_CONNECTION'; connection: DashboardConnection; pageId: string }
  | { type: 'UPDATE_CONNECTION'; id: string; updates: Partial<DashboardConnection> }
  | { type: 'DELETE_CONNECTION'; id: string }
  | { type: 'SELECT_CONNECTION'; id: string; multi: boolean }
  | { type: 'CLEAR_CONNECTION_SELECTION' }
  | { type: 'START_CONNECTION_DRAFT'; sourceWidgetId?: string; sourceX: number; sourceY: number; sourceAnchor?: string }
  | { type: 'CANCEL_CONNECTION_DRAFT' };

const generateId = () => `iot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to normalize widget data from database
// Handles both old format (x, y, width, height) and new format (position, size)
const normalizeWidget = (widget: any): IoTDashboardWidget => {
  const normalized: any = {
    id: widget.id || generateId(),
    type: widget.type,
    title: widget.title || `New ${widget.type}`,
    config: widget.config || {},
  };

  // Normalize position - handle both formats
  if (widget.position && typeof widget.position === 'object' && 'x' in widget.position) {
    normalized.position = widget.position;
  } else if (typeof widget.x === 'number' && typeof widget.y === 'number') {
    normalized.position = { x: widget.x, y: widget.y };
  } else {
    normalized.position = { x: 50, y: 50 }; // Default position
  }

  // Normalize size - handle both formats
  if (widget.size && typeof widget.size === 'object' && 'width' in widget.size) {
    normalized.size = widget.size;
  } else if (typeof widget.width === 'number' && typeof widget.height === 'number') {
    normalized.size = { width: widget.width, height: widget.height };
  } else {
    normalized.size = { width: 200, height: 200 }; // Default size
  }

  // Copy other optional properties
  if (widget.rotation !== undefined) normalized.rotation = widget.rotation;
  if (widget.style) normalized.style = widget.style;
  if (widget.mobileLayout) normalized.mobileLayout = widget.mobileLayout;
  if (widget.value !== undefined) normalized.value = widget.value;

  return normalized as IoTDashboardWidget;
};

const initialState: IoTDashboardState = {
  config: null,
  loading: false,
  error: null,
  mode: 'design',
  activeTool: 'select',
  selectedWidgets: [],
  selectedConnections: [],
  activePageId: '',
  clipboard: [],
  history: {
    past: [],
    future: [],
    canUndo: false,
    canRedo: false,
  },
  zoom: 1,
  showGrid: true,
  editingViewMode: 'desktop',
};

// Helper to add state to history
const addToHistory = (state: IoTDashboardState): IoTDashboardState => {
  if (!state.config) return state;
  
  const newPast = [...state.history.past, state.config];
  // Limit history to last 50 states to prevent memory issues
  const limitedPast = newPast.slice(-50);
  
  return {
    ...state,
    history: {
      past: limitedPast,
      future: [], // Clear future when new action is performed
      canUndo: true,
      canRedo: false,
    },
  };
};

// Helper to update history flags
const updateHistoryFlags = (state: IoTDashboardState): IoTDashboardState => {
  return {
    ...state,
    history: {
      ...state.history,
      canUndo: state.history.past.length > 0,
      canRedo: state.history.future.length > 0,
    },
  };
};

function iotBuilderReducer(state: IoTDashboardState, action: Action): IoTDashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
      
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false };
      
    case 'SET_CONFIG':
      return { 
        ...state, 
        config: action.config,
        activePageId: action.config.pages[0]?.id || '',
        loading: false,
        error: null,
      };
      
    case 'UPDATE_CONFIG':
      if (!state.config) return state;
      return { 
        ...state, 
        config: { ...state.config, ...action.updates },
      };
      
    case 'SET_MODE':
      return { ...state, mode: action.mode };
      
    case 'SET_TOOL':
      return { ...state, activeTool: action.tool };
      
    case 'SELECT_WIDGET':
      return {
        ...state,
        selectedWidgets: action.multi
          ? [...state.selectedWidgets, action.id]
          : [action.id],
      };
      
    case 'SELECT_WIDGETS':
      return { ...state, selectedWidgets: action.ids };
      
    case 'CLEAR_SELECTION':
      return { ...state, selectedWidgets: [] };
      
    case 'ADD_WIDGET':
      if (!state.config) return state;
      const stateWithWidget = {
        ...state,
        config: {
          ...state.config,
          pages: state.config.pages.map(page =>
            page.id === action.pageId
              ? { ...page, widgets: [...page.widgets, action.widget] }
              : page
          ),
        },
      };
      return addToHistory(stateWithWidget);
      
    case 'UPDATE_WIDGET':
      if (!state.config) return state;
      const stateWithUpdatedWidget = {
        ...state,
        config: {
          ...state.config,
          pages: state.config.pages.map(page => ({
            ...page,
            widgets: page.widgets.map(w =>
              w.id === action.id ? { ...w, ...action.updates } : w
            ),
          })),
        },
      };
      return addToHistory(stateWithUpdatedWidget);
      
    case 'DELETE_WIDGET':
      if (!state.config) return state;
      const stateWithDeletedWidget = {
        ...state,
        config: {
          ...state.config,
          pages: state.config.pages.map(page => ({
            ...page,
            widgets: page.widgets.filter(w => w.id !== action.id),
          })),
        },
        selectedWidgets: state.selectedWidgets.filter(id => id !== action.id),
      };
      return addToHistory(stateWithDeletedWidget);
      
    case 'MOVE_WIDGET':
      if (!state.config) return state;
      const isMobileViewMove = state.editingViewMode === 'mobile';
      return {
        ...state,
        config: {
          ...state.config,
          pages: state.config.pages.map(page => ({
            ...page,
            widgets: page.widgets.map(w => {
              if (w.id === action.id) {
                if (isMobileViewMove) {
                  // Update mobile layout, create it if it doesn't exist
                  return {
                    ...w,
                    mobileLayout: {
                      position: action.position,
                      size: w.mobileLayout?.size || w.size,
                    },
                  };
                } else {
                  // Update desktop layout
                  return { ...w, position: action.position };
                }
              }
              return w;
            }),
          })),
        },
      };
      
    case 'RESIZE_WIDGET':
      if (!state.config) return state;
      const isMobileViewResize = state.editingViewMode === 'mobile';
      return {
        ...state,
        config: {
          ...state.config,
          pages: state.config.pages.map(page => ({
            ...page,
            widgets: page.widgets.map(w => {
              if (w.id === action.id) {
                if (isMobileViewResize) {
                  // Update mobile layout, create it if it doesn't exist
                  return {
                    ...w,
                    mobileLayout: {
                      position: w.mobileLayout?.position || w.position,
                      size: action.size,
                    },
                  };
                } else {
                  // Update desktop layout
                  return { ...w, size: action.size };
                }
              }
              return w;
            }),
          })),
        },
      };
      
    case 'ROTATE_WIDGET':
      if (!state.config) return state;
      return {
        ...state,
        config: {
          ...state.config,
          pages: state.config.pages.map(page => ({
            ...page,
            widgets: page.widgets.map(w =>
              w.id === action.id ? { ...w, rotation: action.rotation } : w
            ),
          })),
        },
      };
      
    case 'SET_CLIPBOARD':
      return { ...state, clipboard: action.widgets };
      
    case 'SET_ACTIVE_PAGE':
      return { 
        ...state, 
        activePageId: action.pageId,
        selectedWidgets: [], // Clear selection when switching pages
      };
      
    case 'ADD_PAGE':
      if (!state.config) return state;
      return {
        ...state,
        config: {
          ...state.config,
          pages: [...state.config.pages, action.page],
        },
        activePageId: action.page.id, // Automatically switch to new page
        selectedWidgets: [], // Clear selection when switching pages
      };
      
    case 'DUPLICATE_PAGE':
      if (!state.config) return state;
      const pageToDuplicate = state.config.pages.find(p => p.id === action.pageId);
      if (!pageToDuplicate) return state;
      
      const duplicatedPage: IoTDashboardPage = {
        id: generateId(),
        name: `${pageToDuplicate.name} (Copy)`,
        layout: { ...pageToDuplicate.layout },
        widgets: pageToDuplicate.widgets.map(widget => ({
          ...widget,
          id: generateId(),
        })),
      };
      
      return {
        ...state,
        config: {
          ...state.config,
          pages: [...state.config.pages, duplicatedPage],
        },
        activePageId: duplicatedPage.id,
        selectedWidgets: [],
      };

    case 'DELETE_PAGE':
      if (!state.config || state.config.pages.length <= 1) return state;
      const newPages = state.config.pages.filter(p => p.id !== action.id);
      const newActivePageId = state.activePageId === action.id 
        ? newPages[0]?.id || ''
        : state.activePageId;
      return {
        ...state,
        config: {
          ...state.config,
          pages: newPages,
        },
        activePageId: newActivePageId,
        selectedWidgets: state.activePageId === action.id ? [] : state.selectedWidgets,
      };
      
    case 'RENAME_PAGE':
      if (!state.config) return state;
      return {
        ...state,
        config: {
          ...state.config,
          pages: state.config.pages.map(p =>
            p.id === action.id ? { ...p, name: action.name } : p
          ),
        },
      };
      
    case 'UPDATE_PAGE_LAYOUT':
      if (!state.config) return state;
      return {
        ...state,
        config: {
          ...state.config,
          pages: state.config.pages.map(p =>
            p.id === action.id ? { ...p, layout: { ...p.layout, ...action.layout } } : p
          ),
        },
      };
      
    case 'TOGGLE_GRID':
      return { ...state, showGrid: !state.showGrid };
      
    case 'SET_ZOOM':
      return { ...state, zoom: action.zoom };
      
    case 'SET_EDITING_VIEW_MODE':
      return { ...state, editingViewMode: action.mode };
      
    case 'UPDATE_WIDGET_VALUE':
      // Handle runtime value updates
      return state;
    
    case 'ADD_CONNECTION':
      if (!state.config) return state;
      const stateWithConnection = {
        ...state,
        config: {
          ...state.config,
          pages: state.config.pages.map(page =>
            page.id === action.pageId
              ? { ...page, connections: [...(page.connections || []), action.connection] }
              : page
          ),
        },
      };
      return addToHistory(stateWithConnection);
      
    case 'UPDATE_CONNECTION':
      if (!state.config) return state;
      const stateWithUpdatedConnection = {
        ...state,
        config: {
          ...state.config,
          pages: state.config.pages.map(page => ({
            ...page,
            connections: page.connections?.map(conn =>
              conn.id === action.id ? { ...conn, ...action.updates } : conn
            ),
          })),
        },
      };
      return addToHistory(stateWithUpdatedConnection);
      
    case 'DELETE_CONNECTION':
      if (!state.config) return state;
      const stateWithDeletedConnection = {
        ...state,
        config: {
          ...state.config,
          pages: state.config.pages.map(page => ({
            ...page,
            connections: page.connections?.filter(conn => conn.id !== action.id),
          })),
        },
        selectedConnections: state.selectedConnections.filter(id => id !== action.id),
      };
      return addToHistory(stateWithDeletedConnection);
      
    case 'SELECT_CONNECTION':
      return {
        ...state,
        selectedConnections: action.multi
          ? [...state.selectedConnections, action.id]
          : [action.id],
        selectedWidgets: [], // Clear widget selection when selecting connection
      };
      
    case 'CLEAR_CONNECTION_SELECTION':
      return { ...state, selectedConnections: [] };
      
    case 'START_CONNECTION_DRAFT':
      return {
        ...state,
        connectionDraft: {
          sourceWidgetId: action.sourceWidgetId,
          sourceAnchor: action.sourceAnchor,
          sourceX: action.sourceX,
          sourceY: action.sourceY,
        },
      };
      
    case 'CANCEL_CONNECTION_DRAFT':
      return {
        ...state,
        connectionDraft: undefined,
      };
    
    case 'UNDO':
      if (state.history.past.length === 0) return state;
      
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      
      return updateHistoryFlags({
        ...state,
        config: previous,
        history: {
          past: newPast,
          future: state.config ? [state.config, ...state.history.future] : state.history.future,
          canUndo: newPast.length > 0,
          canRedo: true,
        },
      });
    
    case 'REDO':
      if (state.history.future.length === 0) return state;
      
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      
      return updateHistoryFlags({
        ...state,
        config: next,
        history: {
          past: state.config ? [...state.history.past, state.config] : state.history.past,
          future: newFuture,
          canUndo: true,
          canRedo: newFuture.length > 0,
        },
      });
      
    default:
      return state;
  }
}

interface IoTBuilderProviderProps {
  children: React.ReactNode;
  dashboardId?: string;
  mode?: 'design' | 'preview' | 'script';
}

export const IoTBuilderProvider: React.FC<IoTBuilderProviderProps> = ({
  children,
  dashboardId,
  mode = 'design',
}) => {
  const [state, dispatch] = useReducer(iotBuilderReducer, {
    ...initialState,
    mode,
  });

  const loadDashboard = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    
    try {
      const { data, error } = await supabase
        .from('custom_iot_dashboards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data?.dashboard_config && typeof data.dashboard_config === 'object') {
        const rawConfig = data.dashboard_config as any;
        
        // Normalize all widgets in all pages
        const normalizedPages = (rawConfig.pages || []).map((page: any) => ({
          ...page,
          widgets: (page.widgets || []).map(normalizeWidget),
        }));
        
        const config: IoTDashboardConfig = {
          ...rawConfig,
          pages: normalizedPages,
          id: data.id,
        };
        
        console.log('Loaded and normalized dashboard config:', config);
        dispatch({ type: 'SET_CONFIG', config });
      } else {
        throw new Error('Invalid dashboard configuration');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      dispatch({ type: 'SET_ERROR', error: 'Failed to load dashboard' });
      toast.error('Failed to load dashboard');
    }
  }, []);

  const saveDashboard = useCallback(async () => {
    if (!state.config) return;

    // Don't set loading state - save in background

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const dashboardData = {
        user_id: user.id,
        name: state.config.name,
        description: state.config.description || '',
        dashboard_config: state.config,
        is_public: state.config.settings.isPublic,
      };

      if (state.config.id) {
        const { error } = await supabase
          .from('custom_iot_dashboards')
          .update(dashboardData)
          .eq('id', state.config.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('custom_iot_dashboards')
          .insert(dashboardData)
          .select()
          .single();

        if (error) throw error;
        
        dispatch({ 
          type: 'UPDATE_CONFIG', 
          updates: { id: data.id } 
        });
      }

      toast.success('Dashboard saved successfully');
    } catch (error) {
      console.error('Error saving dashboard:', error);
      dispatch({ type: 'SET_ERROR', error: 'Failed to save dashboard' });
      toast.error('Failed to save dashboard');
    }
    // No finally block - don't clear loading state
  }, [state.config]);

  const createNewDashboard = useCallback((name: string, description?: string) => {
    const newConfig: IoTDashboardConfig = {
      name,
      description,
      pages: [{
        id: generateId(),
        name: 'Main',
        widgets: [],
        layout: {
          gridSize: 20,
          snapToGrid: true,
        },
      }],
      theme: {
        primaryColor: 'hsl(var(--primary))',
        secondaryColor: 'hsl(var(--secondary))',
        backgroundColor: 'hsl(var(--background))',
        textColor: 'hsl(var(--foreground))',
      },
      settings: {
        isPublic: false,
        enableWebSocket: true,
      },
    };
    
    dispatch({ type: 'SET_CONFIG', config: newConfig });
  }, []);

  // Load dashboard on mount if dashboardId provided
  React.useEffect(() => {
    if (dashboardId) {
      loadDashboard(dashboardId);
    }
  }, [dashboardId, loadDashboard]);

  const actions: IoTDashboardActions = {
    loadDashboard,
    saveDashboard,
    createNewDashboard,
    updateConfig: (updates) => dispatch({ type: 'UPDATE_CONFIG', updates }),
    setConfig: (config) => dispatch({ type: 'SET_CONFIG', config }),
    
    addWidget: (widget) => {
      // Set default config for html-viewer widgets
      let config = widget.config || {};
      
      if (widget.type === 'html-viewer' && !config.htmlContent) {
        config = {
          ...config,
          htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website in iFrame</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    iframe {
      width: 100vw;
      height: 100vh;
      border: none;
    }
  </style>
</head>
<body>
  <iframe src="https://nikolaindustry.com" title="Embedded Website"></iframe>
</body>
</html>`
        };
      }
      
      const newWidget: IoTDashboardWidget = { 
        ...widget,
        config,
        id: generateId() 
      };
      dispatch({ type: 'ADD_WIDGET', widget: newWidget, pageId: state.activePageId });
    },
    
    updateWidget: (id, updates) => dispatch({ type: 'UPDATE_WIDGET', id, updates }),
    deleteWidget: (id) => dispatch({ type: 'DELETE_WIDGET', id }),
    
    duplicateWidget: (id) => {
      const page = state.config?.pages.find(p => p.id === state.activePageId);
      const widget = page?.widgets.find(w => w.id === id);
      if (widget) {
        const newWidget: IoTDashboardWidget = { 
          ...widget, 
          id: generateId(),
          position: {
            x: widget.position.x + 20,
            y: widget.position.y + 20,
          },
        };
        dispatch({ type: 'ADD_WIDGET', widget: newWidget, pageId: state.activePageId });
      }
    },
    
    moveWidget: (id, position) => dispatch({ type: 'MOVE_WIDGET', id, position }),
    resizeWidget: (id, size) => dispatch({ type: 'RESIZE_WIDGET', id, size }),
    rotateWidget: (id, rotation) => dispatch({ type: 'ROTATE_WIDGET', id, rotation }),
    
    selectWidget: (id, multi = false) => dispatch({ type: 'SELECT_WIDGET', id, multi }),
    selectWidgets: (ids) => dispatch({ type: 'SELECT_WIDGETS', ids }),
    clearSelection: () => dispatch({ type: 'CLEAR_SELECTION' }),
    
    copyWidgets: () => {
      const page = state.config?.pages.find(p => p.id === state.activePageId);
      const widgets = page?.widgets.filter(w => state.selectedWidgets.includes(w.id)) || [];
      dispatch({ type: 'SET_CLIPBOARD', widgets });
    },
    
    pasteWidgets: () => {
      state.clipboard.forEach(widget => {
        const newWidget: IoTDashboardWidget = { 
          ...widget, 
          id: generateId(),
          position: {
            x: widget.position.x + 20,
            y: widget.position.y + 20,
          },
        };
        dispatch({ type: 'ADD_WIDGET', widget: newWidget, pageId: state.activePageId });
      });
    },
    
    addPage: (name) => {
      const newPage: IoTDashboardPage = {
        id: generateId(),
        name,
        widgets: [],
        layout: { gridSize: 20, snapToGrid: true },
      };
      dispatch({ type: 'ADD_PAGE', page: newPage });
    },
    
    duplicatePage: (id) => {
      dispatch({ type: 'DUPLICATE_PAGE', pageId: id });
    },
    
    deletePage: (id) => dispatch({ type: 'DELETE_PAGE', id }),
    renamePage: (id, name) => dispatch({ type: 'RENAME_PAGE', id, name }),
    setActivePage: (id) => dispatch({ type: 'SET_ACTIVE_PAGE', pageId: id }),
    updatePageLayout: (id, layout) => dispatch({ type: 'UPDATE_PAGE_LAYOUT', id, layout }),
    
    undo: () => dispatch({ type: 'UNDO' }),
    redo: () => dispatch({ type: 'REDO' }),
    
    setMode: (mode) => dispatch({ type: 'SET_MODE', mode }),
    setTool: (tool) => dispatch({ type: 'SET_TOOL', tool: tool as any }),
    
    zoomIn: () => dispatch({ type: 'SET_ZOOM', zoom: Math.min(state.zoom + 0.1, 2) }),
    zoomOut: () => dispatch({ type: 'SET_ZOOM', zoom: Math.max(state.zoom - 0.1, 0.5) }),
    setZoom: (zoom) => dispatch({ type: 'SET_ZOOM', zoom }),
    toggleGrid: () => dispatch({ type: 'TOGGLE_GRID' }),
    setEditingViewMode: (mode) => dispatch({ type: 'SET_EDITING_VIEW_MODE', mode }),
    
    updateWidgetValue: (id, value) => dispatch({ type: 'UPDATE_WIDGET_VALUE', id, value }),
    
    // Connection management
    addConnection: (connection) => {
      const newConnection: DashboardConnection = {
        ...connection,
        id: generateId(),
      };
      dispatch({ type: 'ADD_CONNECTION', connection: newConnection, pageId: state.activePageId });
    },
    
    updateConnection: (id, updates) => dispatch({ type: 'UPDATE_CONNECTION', id, updates }),
    deleteConnection: (id) => dispatch({ type: 'DELETE_CONNECTION', id }),
    selectConnection: (id, multi = false) => dispatch({ type: 'SELECT_CONNECTION', id, multi }),
    clearConnectionSelection: () => dispatch({ type: 'CLEAR_CONNECTION_SELECTION' }),
    startConnectionDraft: (sourceWidgetId, sourceX, sourceY, sourceAnchor) => 
      dispatch({ type: 'START_CONNECTION_DRAFT', sourceWidgetId, sourceX, sourceY, sourceAnchor }),
    cancelConnectionDraft: () => dispatch({ type: 'CANCEL_CONNECTION_DRAFT' }),
  };

  return (
    <IoTBuilderContext.Provider value={{ state, actions }}>
      {children}
    </IoTBuilderContext.Provider>
  );
};

export const useIoTBuilder = () => {
  const context = useContext(IoTBuilderContext);
  if (!context) {
    throw new Error('useIoTBuilder must be used within IoTBuilderProvider');
  }
  return context;
};
