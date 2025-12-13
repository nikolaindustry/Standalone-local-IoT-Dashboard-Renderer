# Standalone IoT Dashboard Renderer

A self-contained, platform-independent dashboard rendering system designed for industrial, air-gapped, and local deployments.

## Overview

The Standalone IoT Dashboard Renderer operates independently from the main Hyperwisor platform. It consumes dashboard JSON configurations created on the platform and connects to local WebSocket endpoints for real-time communication.

## Key Features

- **Full Widget Support**: Renders all widget types (charts, gauges, buttons, switches, maps, 3D viewers, etc.)
- **Local Operation**: No cloud dependencies during runtime
- **WebSocket Configuration**: Manual configuration of WebSocket URL and connection ID
- **No Authentication**: Suitable for isolated/secure networks
- **Portable Dashboards**: Dashboard configurations are portable JSON files
- **Offline Capable**: Works without internet connectivity

## Architecture

```
┌─────────────────────────────────────────┐
│   Standalone Renderer UI                │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Configuration Interface           │ │
│  │  - Load JSON                       │ │
│  │  - Set WebSocket URL               │ │
│  │  - Set Connection ID               │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Dashboard Renderer                │ │
│  │  - IoTPreview                      │ │
│  │  - IoTEnhancedWidgetRenderer       │ │
│  │  - 49 Widget Renderers             │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
           │
           │ WebSocket
           ▼
┌─────────────────────────────────────────┐
│   Local WebSocket Server                │
│   (nikolaindustry-realtime clone)       │
│                                          │
│   - Device connections                  │
│   - Dashboard connections               │
│   - Message routing                     │
└─────────────────────────────────────────┘
```

## Directory Structure

```
StandaloneIoTRenderer/
├── components/               # All rendering components
│   ├── IoTPreview.tsx       # Main preview/runtime component
│   ├── IoTEnhancedWidgetRenderer.tsx  # Widget renderer engine
│   ├── widget-renderers/    # 49 widget type renderers
│   ├── property-configs/    # Widget property configurations
│   └── widgets/             # Special widget containers
├── contexts/                # State management
│   ├── IoTBuilderContext.tsx   # Dashboard state
│   └── StandaloneContext.tsx   # Standalone configuration
├── hooks/                   # React hooks
│   └── useScriptExecution.ts   # Dashboard script execution
├── types/                   # TypeScript definitions
│   └── index.ts
├── utils/                   # Utilities
│   ├── scriptExecutor.ts      # Script runtime
│   ├── customWebSocketService.ts  # WebSocket client
│   ├── iotSensorAPI.ts        # Sensor access
│   ├── iotUsbAPI.ts           # USB/Serial access
│   └── colorUtils.ts          # Color utilities
├── StandaloneRenderer.tsx   # Main component
├── index.ts                 # Module exports
└── README.md                # This file
```

## Usage

### 1. Import the Renderer

```tsx
import { StandaloneRenderer } from '@/components/StandaloneIoTRenderer';

function App() {
  return <StandaloneRenderer />;
}
```

### 2. Load Dashboard JSON

The renderer provides a UI to upload JSON files. Dashboard configurations must follow the `IoTDashboardConfig` schema:

```json
{
  "name": "My Dashboard",
  "description": "Description",
  "pages": [
    {
      "id": "page-1",
      "name": "Main",
      "widgets": [
        {
          "id": "widget-1",
          "type": "gauge",
          "title": "Temperature",
          "position": { "x": 100, "y": 100 },
          "size": { "width": 200, "height": 200 },
          "config": {
            "min": 0,
            "max": 100,
            "value": 25,
            "unit": "°C"
          }
        }
      ],
      "layout": {
        "gridSize": 20,
        "snapToGrid": true
      }
    }
  ],
  "theme": {
    "primaryColor": "#3b82f6",
    "backgroundColor": "#1f2937"
  },
  "settings": {
    "enableWebSocket": true
  }
}
```

### 3. Configure WebSocket

Enter your local WebSocket server details:

- **WebSocket URL**: `wss://localhost:8080` or `wss://your-local-server.com`
- **Connection ID**: Unique identifier (e.g., `dashboard-plant-1`, `control-room-monitor`)

### 4. Start Rendering

Click "Start Renderer" to begin dashboard operation.

## WebSocket Protocol

The renderer uses the same WebSocket message protocol as the main platform:

### Message Format

```typescript
interface WebSocketMessage {
  targetId: string;
  payload: {
    commands?: Array<{
      command: string;
      actions: Array<{
        action: string;
        params: Record<string, any>;
      }>;
    }>;
    // ... other payload types
  };
}
```

### Connection Pattern

```
wss://your-server.com/?id=<connection-id>
```

### Example Messages

**Button Click (Device Command)**:
```json
{
  "targetId": "device-123",
  "payload": {
    "commands": [{
      "command": "set_led",
      "actions": [{
        "action": "toggle",
        "params": { "state": "on" }
      }]
    }]
  }
}
```

**Sensor Data Update**:
```json
{
  "targetId": "dashboard-plant-1",
  "payload": {
    "type": "sensor_data",
    "sensorType": "temperature",
    "value": 25.3
  }
}
```

## Widget Support

All 49+ widget types are fully supported:

### Data Visualization
- Chart, Gauge, Spectral Graph, EM Spectrum
- Heatmap, Vector Plot 3D
- Map, Mission Planning Map

### Controls
- Button, Switch, Slider, Joystick
- Color Picker, Menu, Text Input

### 3D & Media
- 3D Viewer, Virtual Twin 3D
- Video Player, WebRTC Camera/Viewer
- Spotify Player

### Advanced
- Form, Table, Database Form
- Rule Widget, Schedule Widget
- QR Scanner, Voice to Text, Text to Speech
- USB Serial, HTML Viewer
- SVG Renderer, Shape, Label

## Local WebSocket Server Requirements

For the standalone renderer to function, you need a local WebSocket server that:

1. **Accepts connections** with `?id=<connection-id>` query parameter
2. **Routes messages** based on `targetId` field
3. **Supports bidirectional** communication
4. **Handles multiple clients** (devices + dashboards)

You can use the `nikolaindustry-realtime` server or create a compatible implementation.

### Minimal WebSocket Server Example (Node.js)

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();

wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.split('?')[1]);
  const id = params.get('id');
  
  clients.set(id, ws);
  console.log(`Client connected: ${id}`);
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    const target = clients.get(data.targetId);
    
    if (target && target.readyState === WebSocket.OPEN) {
      target.send(message);
    }
  });
  
  ws.on('close', () => {
    clients.delete(id);
  });
});
```

## Configuration Persistence

WebSocket configuration is automatically saved to localStorage:

- `standalone_ws_url`: Last used WebSocket URL
- `standalone_conn_id`: Last used connection ID

## Security Considerations

⚠️ **Important**: This renderer is designed for isolated, secure networks.

- **No authentication**: Suitable for plant LANs, not public internet
- **No encryption** (unless using WSS with valid certs)
- **Trust boundary**: Assumes network-level security
- **Device access**: Has direct USB/Serial/Sensor access

For production industrial use:

1. Deploy on isolated network segment
2. Use firewall rules to restrict access
3. Enable TLS/WSS with proper certificates
4. Implement network-level authentication (VPN, 802.1X)
5. Audit dashboard JSON files before deployment

## Use Cases

### Industrial Plant Control
- Local HMI displays
- Real-time monitoring
- Equipment control
- Process visualization

### Air-Gapped Deployments
- Defense/military installations
- Critical infrastructure
- Research facilities
- Secure manufacturing

### Edge Computing
- Factory floor gateways
- Remote site monitoring
- Distributed control systems
- IoT edge devices

### Development & Testing
- Dashboard development
- Device simulation
- Protocol testing
- Training environments

## Limitations

- **No cloud sync**: Changes to dashboards require re-uploading JSON
- **No collaboration**: Single-user per instance
- **No cloud services**: Payment, SMS, external APIs unavailable
- **Manual updates**: Dashboard updates require file distribution

## Future Enhancements

Potential additions:

- [ ] Dashboard hot-reload from file system
- [ ] Multiple dashboard loading
- [ ] Dashboard switching without reconfiguration
- [ ] Local storage for dashboard library
- [ ] Connection status indicators
- [ ] Message debugging tools
- [ ] Performance metrics dashboard
- [ ] WebSocket message logging
- [ ] Offline mode with replay

## License

Same as main Hyperwisor platform (MIT).

## Support

For issues or questions:
1. Check main platform documentation
2. Review widget renderer implementations
3. Test with sample dashboards
4. Verify WebSocket server compatibility
#   S t a n d a l o n e - l o c a l - I o T - D a s h b o a r d - R e n d e r e r  
 