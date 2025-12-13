# Standalone IoT Dashboard Renderer

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A self-contained, enterprise-grade IoT dashboard renderer designed for air-gapped industrial systems. This standalone application consumes JSON dashboard configurations and connects to local WebSocket endpoints for real-time data visualization and control.

![Industrial Dashboard](https://img.shields.io/badge/Industrial-Ready-success)
![Offline Capable](https://img.shields.io/badge/Offline-Capable-orange)
![49+ Widgets](https://img.shields.io/badge/Widgets-49+-brightgreen)

## 🎯 Key Features

- **🔒 Air-Gapped Operation**: Designed for secure, isolated industrial networks without cloud dependencies
- **📊 49+ Widget Types**: Comprehensive widget library including charts, gauges, maps, 3D viewers, and control elements
- **💾 Persistent Storage**: Dashboard configurations stored locally using browser localStorage
- **🔄 Real-Time Updates**: WebSocket connectivity for live data streaming and bidirectional communication
- **🎨 Industrial UI**: Professional light theme with enterprise design language
- **📱 Responsive Design**: Works seamlessly across desktop and tablet devices
- **⚙️ Multi-Dashboard Management**: Create, import, export, and switch between multiple dashboards
- **🚀 Zero Configuration**: No server setup required - runs entirely in the browser

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Usage](#-usage)
- [Dashboard Configuration](#-dashboard-configuration)
- [Widget Types](#-widget-types)
- [WebSocket Integration](#-websocket-integration)
- [Architecture](#-architecture)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Optional: Local WebSocket server for real-time data

### Installation

```bash
# Clone the repository
git clone https://github.com/nikolaindustry/Standalone-local-IoT-Dashboard-Renderer.git

# Navigate to project directory
cd Standalone-local-IoT-Dashboard-Renderer

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

The application will be available at `http://localhost:8081`

### First Launch

1. **Import a Dashboard**: Click "Show Configuration Panel" and upload a JSON dashboard configuration
2. **Configure WebSocket** (Optional): Enter your WebSocket server URL and connection ID
3. **Launch Dashboard**: Click "Initialize Dashboard" to start the renderer

## 💻 Installation

### Development Environment

```bash
# Install all dependencies with legacy peer deps flag
npm install --legacy-peer-deps

# Required dependencies will be installed:
# - React 18.3 + React DOM
# - TypeScript 5.5
# - Vite 5.4
# - TailwindCSS
# - Radix UI components
# - Recharts for data visualization
# - Leaflet & Mapbox for mapping
# - Three.js for 3D rendering
# - And more...
```

### Production Build

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview

# Output will be in /dist directory
```

## 📖 Usage

### Dashboard Management Interface

The main interface provides:

- **Dashboard List**: View all saved dashboards with search and filtering
- **Grid/List Toggle**: Switch between grid and list view modes
- **Import/Export**: Upload JSON configurations or export existing dashboards
- **Configuration Panel**: Collapsible settings for WebSocket and dashboard import

### Loading a Dashboard

**Method 1: Import JSON File**
```
1. Click "Show Configuration Panel"
2. Click "Choose File" under "Dashboard Import"
3. Select your JSON dashboard configuration
4. Dashboard will be automatically saved to localStorage
```

**Method 2: Use Stored Dashboard**
```
1. View the dashboard list on the main screen
2. Click on any dashboard card to select it
3. Click the "VIEW" button or "Initialize Dashboard"
```

### WebSocket Configuration

```
# WebSocket URL format
wss://your-server.com:port

# Or for local development
ws://localhost:8080

# Connection ID: Unique identifier for this dashboard instance
standalone-dashboard-001
```

## 📄 Dashboard Configuration

### JSON Structure

```json
{
  "id": "unique-dashboard-id",
  "name": "Production Monitor",
  "description": "Real-time production monitoring",
  "pages": [
    {
      "id": "page-1",
      "name": "Overview",
      "widgets": [
        {
          "id": "widget-1",
          "type": "gauge",
          "x": 0,
          "y": 0,
          "width": 300,
          "height": 300,
          "properties": {
            "title": "Temperature",
            "min": 0,
            "max": 100,
            "unit": "°C",
            "dataKey": "temperature"
          }
        }
      ]
    }
  ],
  "theme": {
    "primaryColor": "#263347",
    "backgroundColor": "#E6E8EA"
  },
  "script": "console.log('Dashboard initialized');"
}
```

### Sample Dashboards

Two sample dashboards are included:
- `sample-dashboard-temperature.json` - Temperature monitoring example
- `sample-dashboard-controls.json` - Device control panel example

## 🎨 Widget Types

### Data Visualization
- **Charts**: Line, Bar, Area, Pie, Scatter, Radar
- **Gauges**: Circular, Linear, Radial
- **Maps**: Leaflet, Mapbox, Mission Planning
- **3D Viewers**: Model viewer, Virtual Twin, Vector Plot
- **Heatmaps**: 2D and 3D heat visualization

### Controls & Input
- **Buttons**: Standard, URL, Navigate Page
- **Sliders**: Linear and circular
- **Switches**: Toggle switches
- **Joysticks**: 2D joystick control
- **Color Pickers**: RGB, HSL color selection
- **Text Input**: Single and multi-line
- **Forms**: Dynamic form builder

### Media & Display
- **Video Player**: Local and streaming video
- **Image**: Static and dynamic images
- **HTML Viewer**: Embedded HTML content
- **WebRTC**: Camera and viewer widgets
- **Spotify Player**: Music playback

### Advanced Features
- **Database Forms**: CRUD operations
- **Dynamic Repeater**: Template-based repetition
- **Rules Engine**: Conditional logic
- **Schedule**: Time-based automation
- **Text-to-Speech**: Voice output
- **Voice-to-Text**: Speech recognition
- **USB Serial**: Direct USB device communication
- **QR Scanner**: Barcode/QR code reading

### Industrial Specific
- **Compass**: Directional display
- **Attitude Indicator**: Pitch/roll display
- **EM Spectrum**: Electromagnetic spectrum analyzer
- **Spectral Graph**: Frequency analysis
- **Countdown Timer**: Event countdown
- **Status Indicators**: Multi-state status display

## 🔌 WebSocket Integration

### Connection Setup

```typescript
// WebSocket URL with query parameters
const wsUrl = 'wss://your-server.com:8080/?id=dashboard-001';

// Connection is established automatically when dashboard loads
// Messages are JSON formatted
```

### Message Format

```json
// Incoming data message
{
  "type": "data",
  "key": "temperature",
  "value": 25.5,
  "timestamp": 1702512000000
}

// Outgoing command message
{
  "type": "command",
  "action": "setTemperature",
  "value": 30,
  "dashboardId": "dashboard-001"
}
```

### Data Binding

Widgets automatically update when WebSocket data arrives:

```json
{
  "type": "gauge",
  "properties": {
    "dataKey": "temperature",  // Binds to WebSocket data
    "title": "Room Temperature"
  }
}
```

## 🏗️ Architecture

### Project Structure

```
StandaloneIoTRenderer/
├── src/
│   ├── components/           # React components
│   │   ├── widget-renderers/ # 49+ widget implementations
│   │   ├── property-configs/ # Widget property panels
│   │   ├── ui/              # Reusable UI components
│   │   ├── IoTPreview.tsx   # Runtime dashboard renderer
│   │   └── ...
│   ├── contexts/            # React Context providers
│   │   ├── IoTBuilderContext.tsx
│   │   └── StandaloneContext.tsx
│   ├── utils/               # Utility functions
│   │   ├── dashboardStorage.ts    # localStorage operations
│   │   ├── customWebSocketService.ts
│   │   ├── scriptExecutor.ts
│   │   └── ...
│   ├── types/               # TypeScript definitions
│   ├── StandaloneRenderer.tsx  # Main entry component
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── sample-dashboard-*.json  # Example configurations
└── package.json            # Dependencies
```

### Core Components

- **StandaloneRenderer**: Main UI for dashboard management
- **IoTPreview**: Runtime dashboard display component
- **IoTEnhancedWidgetRenderer**: Widget rendering engine
- **StandaloneContext**: State management for standalone mode
- **dashboardStorage**: localStorage persistence layer

### Tech Stack

- **Frontend**: React 18.3 + TypeScript 5.5
- **Build Tool**: Vite 5.4 with SWC
- **Styling**: TailwindCSS + Radix UI
- **Charts**: Recharts
- **Maps**: Leaflet + Mapbox GL
- **3D**: Three.js + React Three Fiber
- **State**: React Context API

## 🛠️ Development

### Available Scripts

```bash
# Start development server (port 8081)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### Environment Setup

```bash
# Development server runs on port 8081
# Configured in vite.config.ts

# For custom port:
vite --port 3000
```

### Adding New Widgets

1. Create widget renderer in `src/components/widget-renderers/`
2. Add property config in `src/components/property-configs/`
3. Register in widget type definitions
4. Update widget library catalog

### Debugging

```javascript
// Enable debug logging in dashboard script
console.log('Dashboard loaded:', state.config);

// Check WebSocket connection
console.log('WebSocket state:', state.websocket);

// Inspect widget data
console.log('Widget data:', state.data);
```

## 🚢 Deployment

### Static Hosting

```bash
# Build production bundle
npm run build

# Deploy /dist folder to:
# - Nginx
# - Apache
# - AWS S3 + CloudFront
# - Netlify
# - Vercel
```

### Docker Deployment

```dockerfile
# Example Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Industrial Deployment

For air-gapped environments:

1. Build on development machine
2. Copy `/dist` folder to USB drive
3. Transfer to industrial network
4. Host on local web server
5. Access via internal network URL

## 📝 Configuration Options

### Dashboard Storage

```typescript
// All dashboards stored in browser localStorage
// Key: 'iot_dashboards'
// Format: Array<StoredDashboard>

// Programmatic access:
import * as DashboardStorage from './utils/dashboardStorage';

// Save dashboard
DashboardStorage.saveDashboard(config);

// Load all dashboards
const dashboards = DashboardStorage.getAllDashboards();

// Export to file
DashboardStorage.exportDashboardToFile(dashboard);
```

### WebSocket Settings

```typescript
// Stored in localStorage
localStorage.setItem('standalone_ws_url', 'wss://server.com');
localStorage.setItem('standalone_conn_id', 'dashboard-01');
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- TypeScript strict mode enabled
- ESLint configuration included
- Follow existing component patterns
- Add JSDoc comments for public APIs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Charts powered by [Recharts](https://recharts.org/)
- 3D rendering via [Three.js](https://threejs.org/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

For issues, questions, or contributions:

- **Issues**: [GitHub Issues](https://github.com/nikolaindustry/Standalone-local-IoT-Dashboard-Renderer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nikolaindustry/Standalone-local-IoT-Dashboard-Renderer/discussions)

## 🗺️ Roadmap

- [ ] Export dashboard as standalone HTML
- [ ] Offline PWA support
- [ ] Dashboard templates library
- [ ] Advanced scripting IDE
- [ ] Mobile app wrapper
- [ ] Dashboard sharing protocol
- [ ] Plugin system for custom widgets

---

**Made with ❤️ for industrial IoT applications**
