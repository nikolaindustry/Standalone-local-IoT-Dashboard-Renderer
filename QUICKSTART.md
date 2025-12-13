# Quick Start Guide - Standalone IoT Dashboard Renderer

## 🚀 Getting Started in 5 Minutes

### Step 1: Add Route (Optional)

If you want to access via a route, add to `src/App.tsx`:

```tsx
import StandaloneDashboard from '@/pages/StandaloneDashboard';

// In your routes:
<Route path="/standalone" element={<StandaloneDashboard />} />
```

Or use directly in any component:

```tsx
import { StandaloneRenderer } from '@/components/StandaloneIoTRenderer';

<StandaloneRenderer />
```

### Step 2: Start Development Server

```bash
npm run dev
```

Navigate to: `http://localhost:5173/standalone`

### Step 3: Create a Test Dashboard JSON

Save this as `test-dashboard.json`:

```json
{
  "name": "Test Dashboard",
  "description": "Simple test configuration",
  "pages": [
    {
      "id": "page-1",
      "name": "Main",
      "widgets": [
        {
          "id": "gauge-1",
          "type": "gauge",
          "title": "Temperature",
          "position": { "x": 50, "y": 50 },
          "size": { "width": 250, "height": 250 },
          "config": {
            "min": 0,
            "max": 100,
            "value": 25,
            "unit": "°C",
            "showValue": true,
            "gaugeColor": "#3b82f6"
          }
        },
        {
          "id": "button-1",
          "type": "button",
          "title": "Toggle LED",
          "position": { "x": 350, "y": 50 },
          "size": { "width": 150, "height": 80 },
          "config": {
            "label": "Toggle",
            "backgroundColor": "#10b981",
            "textColor": "#ffffff"
          }
        },
        {
          "id": "switch-1",
          "type": "switch",
          "title": "Power",
          "position": { "x": 550, "y": 50 },
          "size": { "width": 120, "height": 80 },
          "config": {
            "initialState": false
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
    "backgroundColor": "#1f2937",
    "textColor": "#ffffff"
  },
  "settings": {
    "enableWebSocket": true,
    "isPublic": false
  }
}
```

### Step 4: Upload and Configure

1. Click "Upload Dashboard JSON File"
2. Select `test-dashboard.json`
3. Enter WebSocket URL: `wss://nikolaindustry-realtime.onrender.com` (for testing)
4. Enter Connection ID: `test-dashboard-1`
5. Click "Start Renderer"

### Step 5: See It Work!

You should now see:
- A temperature gauge showing 25°C
- A toggle button
- A power switch

All widgets are interactive!

## 🔧 Setting Up Local WebSocket Server

For production use, set up a local WebSocket server.

### Option 1: Simple Node.js Server

Create `websocket-server.js`:

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();

console.log('WebSocket server started on ws://localhost:8080');

wss.on('connection', (ws, req) => {
  // Extract connection ID from query params
  const params = new URLSearchParams(req.url.split('?')[1]);
  const id = params.get('id') || 'unknown';
  
  clients.set(id, ws);
  console.log(`✓ Client connected: ${id} (Total: ${clients.size})`);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`📨 Message from ${id}:`, data);
      
      // Route message to target
      if (data.targetId) {
        const target = clients.get(data.targetId);
        if (target && target.readyState === WebSocket.OPEN) {
          target.send(message);
          console.log(`  ↳ Routed to ${data.targetId}`);
        } else {
          console.log(`  ↳ Target ${data.targetId} not found or disconnected`);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  ws.on('close', () => {
    clients.delete(id);
    console.log(`✗ Client disconnected: ${id} (Total: ${clients.size})`);
  });
  
  ws.on('error', (error) => {
    console.error(`Error on client ${id}:`, error);
  });
});
```

Run it:

```bash
node websocket-server.js
```

Then configure renderer with:
- WebSocket URL: `ws://localhost:8080`
- Connection ID: `dashboard-1`

### Option 2: With TLS (Production)

```javascript
const https = require('https');
const WebSocket = require('ws');
const fs = require('fs');

const server = https.createServer({
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem')
});

const wss = new WebSocket.Server({ server });

// ... (same connection logic as above)

server.listen(8443, () => {
  console.log('Secure WebSocket server on wss://localhost:8443');
});
```

## 📱 Test with Simulated Device

Create `device-simulator.js`:

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080/?id=device-123');

ws.on('open', () => {
  console.log('Device connected');
  
  // Simulate sensor data every 2 seconds
  setInterval(() => {
    const temperature = 20 + Math.random() * 10;
    
    ws.send(JSON.stringify({
      targetId: 'dashboard-1',
      payload: {
        type: 'sensor_data',
        widgetId: 'gauge-1',
        value: temperature.toFixed(1)
      }
    }));
    
    console.log(`Sent temperature: ${temperature.toFixed(1)}°C`);
  }, 2000);
});

ws.on('message', (message) => {
  const data = JSON.parse(message.toString());
  console.log('Received command:', data);
  
  // Respond to commands
  if (data.payload.commands) {
    data.payload.commands.forEach(cmd => {
      console.log(`Executing command: ${cmd.command}`);
      cmd.actions.forEach(action => {
        console.log(`  Action: ${action.action}`, action.params);
      });
    });
  }
});
```

Run alongside server:

```bash
node device-simulator.js
```

You should see the gauge update with live temperature data!

## 🎯 Common Use Cases

### Case 1: Factory Floor Monitor

```json
{
  "name": "Production Line A",
  "pages": [{
    "name": "Overview",
    "widgets": [
      { "type": "gauge", "title": "Line Speed", ... },
      { "type": "chart", "title": "Output Rate", ... },
      { "type": "switch", "title": "Emergency Stop", ... }
    ]
  }]
}
```

### Case 2: HVAC Control

```json
{
  "name": "Building HVAC",
  "pages": [{
    "name": "Zone 1",
    "widgets": [
      { "type": "gauge", "title": "Temperature", ... },
      { "type": "slider", "title": "Setpoint", ... },
      { "type": "switch", "title": "Fan", ... }
    ]
  }]
}
```

### Case 3: Equipment Status

```json
{
  "name": "Motor Controller",
  "pages": [{
    "name": "Status",
    "widgets": [
      { "type": "status", "title": "Running", ... },
      { "type": "gauge", "title": "Current", ... },
      { "type": "button", "title": "Start/Stop", ... }
    ]
  }]
}
```

## 🛠️ Troubleshooting

### Widgets Not Showing

- Check console for errors
- Verify JSON structure matches schema
- Ensure `position` and `size` are set

### WebSocket Not Connecting

- Check WebSocket URL is correct
- Verify server is running
- Check browser console for connection errors
- Try `ws://` instead of `wss://` for local testing

### Widgets Not Updating

- Verify connection ID matches in server and renderer
- Check message `targetId` matches dashboard connection ID
- Look at WebSocket server logs for routing issues

### TypeScript Errors

- The standalone renderer uses the same types as IoTDashboardBuilder
- Ensure all dependencies are installed: `npm install`

## 📚 Next Steps

1. **Read Full Documentation**: See `README.md` for complete details
2. **Explore Widget Types**: Check `components/widget-renderers/` for all available widgets
3. **Customize Appearance**: Modify theme in dashboard JSON
4. **Add Scripts**: Use dashboard scripts for advanced behavior
5. **Deploy**: Package for your target environment

## 💡 Tips

- **Save Configurations**: The renderer saves your WebSocket URL and ID to localStorage
- **Multiple Dashboards**: You can switch dashboards by uploading a new JSON
- **Debugging**: Open browser DevTools to see WebSocket messages
- **Performance**: The renderer handles 50+ widgets smoothly
- **Mobile**: Works on tablets and mobile browsers

## 🎓 Learning Resources

- **Widget Reference**: See each widget renderer in `components/widget-renderers/`
- **Type Definitions**: Check `types/index.ts` for all interfaces
- **Script API**: Look at `utils/scriptExecutor.ts` for available APIs
- **Examples**: `IMPLEMENTATION_SUMMARY.md` has more examples

## Need Help?

- Check `README.md` for detailed documentation
- Review widget renderer source code for configuration options
- Test with the provided example dashboard JSON
- Verify WebSocket server compatibility

---

**You're ready to go! 🚀**

Load a dashboard JSON, configure your WebSocket server, and start rendering!
