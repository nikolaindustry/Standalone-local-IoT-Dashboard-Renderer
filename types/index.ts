// Independent IoT Dashboard Builder Types
// No dependencies on Product Dashboard Designer

export type IoTWidgetType = 
  | "button" 
  | "switch" 
  | "gauge" 
  | "slider" 
  | "status" 
  | "chart" 
  | "image"
  | "svg"
  | "label"
  | "form"
  | "table"
  | "database-form"
  | "color-picker"
  | "menu"
  | "map"
  | "mission-planning-map"
  | "joystick"
  | "navigate-page"
  | "url-button"
  | "dynamic-repeater"
  | "compass"
  | "heatmap"
  | "attitude"
  | "html-viewer"
  | "3d-viewer"
  | "datetime-weather"
  | "countdown-timer"
  | "schedule"
  | "rule"
  | "text-to-speech"
  | "text-input"
  | "webrtc-viewer"
  | "webrtc-camera"
  | "voice-to-text"
  | "video-player"
  | "spotify-player"
  | "usb-serial"
  | "rectangle"
  | "ellipse"
  | "triangle"
  | "polygon"
  | "star"
  | "line"
  | "arrow"
  | "em-spectrum"
  | "spectral-graph"
  | "vector-plot-3d"
  | "virtual-twin-3d"
  | "payment-action";

export interface IoTWidgetPosition {
  x: number;
  y: number;
}

export interface IoTWidgetSize {
  width: number;
  height: number;
}

// Connection line types and interfaces
export type ConnectionLineStyle = 'solid' | 'dashed' | 'dotted';
export type ConnectionArrowStyle = 'none' | 'arrow' | 'arrowclosed' | 'circle' | 'diamond';
export type ConnectionCurveType = 'straight' | 'bezier' | 'step' | 'smoothstep';

// Flexible connection point - can be absolute position or widget-relative
export interface ConnectionPoint {
  // Absolute canvas position (required)
  x: number;
  y: number;
  // Optional widget association (for automatic adjustment when widget moves)
  widgetId?: string;
  // Optional offset from widget position (only used if widgetId is set)
  offsetX?: number;
  offsetY?: number;
}

// Waypoint for multi-segment routing
export interface ConnectionWaypoint {
  x: number;
  y: number;
  // Optional ID for tracking/editing specific waypoints
  id?: string;
}

export interface ConnectionLabel {
  text: string;
  position?: number; // 0-1, position along the line
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  padding?: number;
}

export interface DashboardConnection {
  id: string;
  source: ConnectionPoint;
  target: ConnectionPoint;
  // Multi-segment routing waypoints
  waypoints?: ConnectionWaypoint[];
  style?: {
    lineStyle?: ConnectionLineStyle;
    color?: string;
    thickness?: number;
    opacity?: number;
    curveType?: ConnectionCurveType;
    sourceArrow?: ConnectionArrowStyle;
    targetArrow?: ConnectionArrowStyle;
    animated?: boolean;
    animationSpeed?: number; // pixels per second
    zIndex?: number;
    // Corner radius for multi-segment paths
    cornerRadius?: number;
  };
  label?: ConnectionLabel;
  metadata?: {
    description?: string;
    dataFlow?: string;
    [key: string]: any;
  };
}

export interface IoTWidgetStyle {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize?: string;
  fontWeight?: string;
  opacity?: number;
  padding?: string;
  zIndex?: number;
  visibility?: string;
  visible?: boolean;
  showContainer?: boolean;
  // Text styling
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: string;
  letterSpacing?: string;
  textDecoration?: string;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontFamily?: string;
  // Custom font support
  customFontData?: string;
  customFontName?: string;
  customFontFamily?: string;
  // Flexbox
  alignItems?: string;
  justifyContent?: string;
  // Card visibility
  cardVisible?: boolean;
  cardFadeTransition?: number;
  // Card transparency
  cardOpacity?: number;
  // Shadow customization
  shadowPreset?: 'none' | 'subtle' | 'medium' | 'strong' | 'custom';
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  shadowSpread?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  boxShadow?: string;
  // Glass effect
  glassEffect?: boolean;
  glassBlur?: number;
  glassOpacity?: number;
  glassBorder?: boolean;
  glassTint?: string;
}

// Gauge threshold type
export interface GaugeThreshold {
  value: number;
  color: string;
  label?: string;
}

// Event configuration types
export interface EventAction {
  action: string;
  params: Record<string, any>;
}

export interface EventCommand {
  command: string;
  actions: EventAction[];
}

export interface EventTarget {
  targetId: string;
  payload: {
    commands: EventCommand[];
  };
}

export interface WidgetEvent {
  id: string;
  eventType: IoTWidgetEventType;
  targets: EventTarget[];
}

export interface IoTWidgetConfig {
  [key: string]: any;
  deviceId?: string;
  deviceBinding?: {
    deviceId: string;
    deviceName: string;
    productId: string;
    productName: string;
  };
  dataSource?: 'runtime' | 'sensor' | 'websocket' | 'api';
  websocketEnabled?: boolean;
  websocketTopic?: string;
  commandId?: string;
  actionId?: string;
  tableName?: string;
  // New event-based configuration
  widgetEvents?: WidgetEvent[];
  // Button widget custom font properties
  buttonCustomFontData?: string; // Base64 encoded font data for button labels
  buttonCustomFontName?: string; // Original font file name for button labels
  buttonCustomFontFamily?: string; // Generated font family name for button labels
  buttonFontFamily?: string; // Font family to use for button labels (can be custom or standard)
  // Button widget text styling properties
  buttonTextColor?: string; // Text color for button labels
  buttonFontStyle?: 'normal' | 'italic'; // Font style (italic toggle)
  buttonLetterSpacing?: string; // Character spacing (letter spacing) for button labels
  buttonLabelMarginTop?: string; // Top margin for button label
  buttonLabelMarginBottom?: string; // Bottom margin for button label
  buttonLabelMarginLeft?: string; // Left margin for button label
  buttonLabelMarginRight?: string; // Right margin for button label
  
  // Switch widget - Switch Title/Name typography properties
  switchTitleCustomFontData?: string; // Base64 encoded font data for switch title
  switchTitleCustomFontName?: string; // Original font file name for switch title
  switchTitleCustomFontFamily?: string; // Generated font family name for switch title
  switchTitleFontFamily?: string; // Font family to use for switch title
  switchTitleFontSize?: string; // Font size for switch title
  switchTitleFontWeight?: string; // Font weight for switch title
  switchTitleFontStyle?: 'normal' | 'italic'; // Font style for switch title
  switchTitleTextColor?: string; // Text color for switch title
  switchTitleLetterSpacing?: string; // Character spacing for switch title
  switchTitleMarginTop?: string; // Top margin for switch title
  switchTitleMarginBottom?: string; // Bottom margin for switch title
  switchTitleMarginLeft?: string; // Left margin for switch title
  switchTitleMarginRight?: string; // Right margin for switch title
  
  // Switch widget - ON/OFF Status Text typography properties
  switchStatusCustomFontData?: string; // Base64 encoded font data for ON/OFF status text
  switchStatusCustomFontName?: string; // Original font file name for ON/OFF status text
  switchStatusCustomFontFamily?: string; // Generated font family name for ON/OFF status text
  switchStatusFontFamily?: string; // Font family to use for ON/OFF status text
  switchStatusFontSize?: string; // Font size for ON/OFF status text
  switchStatusFontWeight?: string; // Font weight for ON/OFF status text
  switchStatusFontStyle?: 'normal' | 'italic'; // Font style for ON/OFF status text
  switchStatusTextColor?: string; // Text color for ON/OFF status text
  switchStatusLetterSpacing?: string; // Character spacing for ON/OFF status text
  switchStatusMarginTop?: string; // Top margin for ON/OFF status text
  switchStatusMarginBottom?: string; // Bottom margin for ON/OFF status text
  switchStatusMarginLeft?: string; // Left margin for ON/OFF status text
  switchStatusMarginRight?: string; // Right margin for ON/OFF status text
  
  // Switch widget custom font properties (DEPRECATED - Use switchStatusCustomFontData for status text or switchTitleCustomFontData for title)
  switchCustomFontData?: string; // Base64 encoded font data for switch labels
  switchCustomFontName?: string; // Original font file name for switch labels
  switchCustomFontFamily?: string; // Generated font family name for switch labels
  switchFontFamily?: string; // Font family to use for switch labels (can be custom or standard)
  // Switch widget text styling properties (DEPRECATED - Use switchStatusXxx for status text or switchTitleXxx for title)
  switchTextColor?: string; // Text color for switch labels
  switchFontSize?: string; // Font size for switch labels
  switchFontWeight?: string; // Font weight for switch labels
  switchFontStyle?: 'normal' | 'italic'; // Font style (italic toggle)
  switchLetterSpacing?: string; // Character spacing (letter spacing) for switch labels
  switchLabelMarginTop?: string; // Top margin for switch label
  switchLabelMarginBottom?: string; // Bottom margin for switch label
  switchLabelMarginLeft?: string; // Left margin for switch label
  switchLabelMarginRight?: string; // Right margin for switch label
}

export interface IoTDashboardWidget {
  id: string;
  type: IoTWidgetType;
  title: string;
  position: IoTWidgetPosition;
  size: IoTWidgetSize;
  rotation?: number;
  config: IoTWidgetConfig;
  style?: IoTWidgetStyle;
  events?: Record<string, any[]>;
  mobileLayout?: {
    position: IoTWidgetPosition;
    size: IoTWidgetSize;
  };
}

export interface IoTDashboardPage {
  id: string;
  name: string;
  widgets: IoTDashboardWidget[];
  connections?: DashboardConnection[]; // Flow lines between widgets
  layout: {
    gridSize: number;
    snapToGrid: boolean;
    backgroundColor?: string;
    // Enhanced background options
    backgroundType?: 'solid' | 'gradient' | 'image';
    backgroundGradient?: {
      type: 'linear' | 'radial';
      angle?: number;
      colors: Array<{ color: string; position: number }>;
    };
    backgroundImage?: {
      url: string;
      size?: 'cover' | 'contain' | 'auto' | 'custom';
      position?: string;
      repeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';
      opacity?: number;
    };
    backgroundOpacity?: number;
  };
}

export interface IoTDashboardTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  iconName?: string;
}

export interface IoTDashboardSettings {
  isPublic: boolean;
  enableWebSocket: boolean;
  refreshInterval?: number;
  customTargetId?: string; // Custom WebSocket target ID (overrides user ID if set)
}

export interface IoTDashboardConfig {
  id?: string;
  name: string;
  description?: string;
  pages: IoTDashboardPage[];
  theme: IoTDashboardTheme;
  settings: IoTDashboardSettings;
  script?: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IoTDashboardState {
  config: IoTDashboardConfig | null;
  loading: boolean;
  error: string | null;
  mode: 'design' | 'preview' | 'script';
  activeTool: 'select' | 'move' | 'connection' | IoTWidgetType | null;
  selectedWidgets: string[];
  selectedConnections: string[]; // Selected connection IDs
  activePageId: string;
  clipboard: IoTDashboardWidget[];
  history: {
    past: IoTDashboardConfig[];
    future: IoTDashboardConfig[];
    canUndo: boolean;
    canRedo: boolean;
  };
  zoom: number;
  showGrid: boolean;
  editingViewMode: 'desktop' | 'mobile';
  // Connection creation state
  connectionDraft?: {
    sourceWidgetId?: string;
    sourceAnchor?: string;
    sourceX: number;
    sourceY: number;
  };
}

export interface IoTDashboardActions {
  // Dashboard management
  loadDashboard: (dashboardId: string) => Promise<void>;
  saveDashboard: () => Promise<void>;
  createNewDashboard: (name: string, description?: string) => void;
  updateConfig: (config: Partial<IoTDashboardConfig>) => void;
  
  // Widget management
  addWidget: (widget: Omit<IoTDashboardWidget, 'id'>) => void;
  updateWidget: (id: string, updates: Partial<IoTDashboardWidget>) => void;
  deleteWidget: (id: string) => void;
  duplicateWidget: (id: string) => void;
  moveWidget: (id: string, position: IoTWidgetPosition) => void;
  resizeWidget: (id: string, size: IoTWidgetSize) => void;
  rotateWidget: (id: string, rotation: number) => void;
  
  // Connection management
  addConnection: (connection: Omit<DashboardConnection, 'id'>) => void;
  updateConnection: (id: string, updates: Partial<DashboardConnection>) => void;
  deleteConnection: (id: string) => void;
  selectConnection: (id: string, multi?: boolean) => void;
  clearConnectionSelection: () => void;
  startConnectionDraft: (sourceWidgetId: string | undefined, sourceX: number, sourceY: number, sourceAnchor?: string) => void;
  cancelConnectionDraft: () => void;
  
  // Selection
  selectWidget: (id: string, multi?: boolean) => void;
  selectWidgets: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Pages
  addPage: (name: string) => void;
  duplicatePage: (id: string) => void;
  deletePage: (id: string) => void;
  renamePage: (id: string, name: string) => void;
  setActivePage: (id: string) => void;
  updatePageLayout: (id: string, layout: Partial<IoTDashboardPage['layout']>) => void;
  
  // Clipboard
  copyWidgets: () => void;
  pasteWidgets: () => void;
  
  // History
  undo: () => void;
  redo: () => void;
  
  // Mode
  setMode: (mode: 'design' | 'preview' | 'script') => void;
  setTool: (tool: string) => void;
  
  // View controls
  toggleGrid: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (zoom: number) => void;
  setEditingViewMode: (mode: 'desktop' | 'mobile') => void;
  
  // Runtime
  updateWidgetValue: (id: string, value: any) => void;
}

export type IoTWidgetEventType = 
  | 'click' | 'doubleclick' | 'longpress' | 'hover' | 'focus' | 'blur'
  | 'push' | 'release'
  | 'change' | 'input' | 'submit' | 'clear' | 'keydown' | 'keyup' | 'keypress'
  | 'slideStart' | 'slide' | 'slideEnd'
  | 'toggle' | 'on' | 'off'
  | 'load' | 'ready' | 'destroy' | 'update'
  | 'error' | 'success' | 'loading' | 'loaded'
  | 'select' | 'deselect' | 'optionchange'
  | 'touchstart' | 'touchend' | 'swipeleft' | 'swiperight' | 'swipeup' | 'swipedown' | 'pinch' | 'zoom'
  | 'dragstart' | 'drag' | 'dragend'
  | 'timeout' | 'interval' | 'animationstart' | 'animationend'
  | 'dataload' | 'datafail' | 'refresh'
  | 'visible' | 'hidden'
  | 'threshold' | 'min' | 'max'
  | 'complete' | 'start' | 'pause' | 'reset'
  | 'speechStart' | 'speechEnd' | 'speechResult'
  | 'paymentSuccess' | 'paymentFailed'
  | 'payment.success' | 'payment.failure';

// Helper to get available events for each widget type
export const getWidgetSupportedEvents = (widgetType: IoTWidgetType): IoTWidgetEventType[] => {
  const commonEvents: IoTWidgetEventType[] = ['load', 'ready', 'destroy', 'update', 'visible', 'hidden'];
  
  switch (widgetType) {
    case 'button':
      return [...commonEvents, 'click', 'doubleclick', 'longpress', 'push', 'release', 'hover'];
    
    case 'switch':
      return [...commonEvents, 'toggle', 'on', 'off', 'change', 'click'];
    
    case 'slider':
      return [...commonEvents, 'slideStart', 'slide', 'slideEnd', 'change', 'min', 'max'];
    
    case 'gauge':
      return [...commonEvents, 'threshold', 'min', 'max', 'change'];
    
    case 'form':
    case 'database-form':
      return [...commonEvents, 'submit', 'input', 'change', 'focus', 'blur'];
    
    case 'text-input':
      return [...commonEvents, 'input', 'change', 'submit', 'clear', 'focus', 'blur', 'keydown', 'keyup', 'keypress'];
    
    case 'color-picker':
      return [...commonEvents, 'change', 'select'];
    
    case 'chart':
    case 'table':
      return [...commonEvents, 'dataload', 'datafail', 'refresh', 'select'];
    
    case 'joystick':
      return [...commonEvents, 'change', 'touchstart', 'touchend'];
    
    case 'map':
    case 'mission-planning-map':
      return [...commonEvents, 'click', 'select', 'zoom', 'dragstart', 'drag', 'dragend'];
    
    case 'image':
    case 'svg':
    case 'label':
    case 'status':
      return [...commonEvents, 'click', 'hover'];
    
    case 'menu':
    case 'navigate-page':
    case 'url-button':
      return [...commonEvents, 'click', 'select'];
    
    case 'video-player':
    case 'spotify-player':
    case 'webrtc-viewer':
    case 'webrtc-camera':
      return [...commonEvents, 'click', 'change', 'loading', 'loaded', 'error'];
    
    case 'countdown-timer':
      return [...commonEvents, 'timeout', 'interval', 'change', 'complete', 'start', 'pause', 'reset'];
    
    case 'schedule':
      return [...commonEvents, 'timeout', 'interval', 'change'];
    
    case 'voice-to-text':
      return [...commonEvents, 'speechStart', 'speechEnd', 'speechResult', 'change', 'submit', 'clear'];
    
    case 'payment-action':
      return [...commonEvents, 'click', 'payment.success', 'payment.failure', 'paymentSuccess', 'paymentFailed'];
    
    default:
      return [...commonEvents, 'click', 'change'];
  }
};
