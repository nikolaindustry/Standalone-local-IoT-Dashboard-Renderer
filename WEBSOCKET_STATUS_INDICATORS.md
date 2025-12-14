# WebSocket Connection Status Indicators

## Overview

This feature adds visual feedback to the dashboard UI to clearly indicate when a WebSocket connection is established or lost. Users can now easily monitor their connection status through both persistent indicators and transient notifications.

## Features Implemented

### 1. Corner WebSocket Status Indicator
A subtle WebSocket status indicator positioned in the top-right corner of the dashboard area that displays:
- **Connection Status**: Visual indicator (green for connected, red for disconnected)
- **Minimal Text Labels**: "Connected"/"Disconnected" text visible on larger screens
- **Live Indicator**: Pulsing animation when connected to show real-time activity

### 2. Toast Notifications
Transient notifications that appear when connection events occur:
- **Connection Established**: Green toast with server details
- **Connection Lost**: Red toast indicating disconnection
- **Connection Failed**: Red toast for connection errors

### 3. Visual Design
Following the industrial UI design language:
- **Color Coding**: 
  - Emerald green (#10b981) for connected state
  - Red (#ef4444) for disconnected/error states
- **Subtle Placement**: Corner indicator that doesn't disrupt dashboard layout
- **Responsive Design**: Text labels hidden on small screens
- **Backdrop Blur**: Semi-transparent indicator with blur effect
- **Pulse Animations**: Live indicator shows real-time activity

## Implementation Details

### Component Modifications

#### `src/components/IoTPreview.tsx`
- Removed separate status bar that overlapped content
- Added corner WebSocket status indicator in top-right of dashboard area
- Maintained toast notifications for connection events
- Preserved connection state tracking (`wsConnected`, `wsUrl`, `wsConnectionId`)
- Implemented responsive design (labels hidden on small screens)

#### `src/App.tsx`
- Added `<Toaster />` component to render toast notifications

### State Management

```typescript
const [wsConnected, setWsConnected] = useState<boolean>(false);
const [wsUrl, setWsUrl] = useState<string>('');
const [wsConnectionId, setWsConnectionId] = useState<string>('');
```

### Event Handling

The component subscribes to WebSocket connection events:

```typescript
useEffect(() => {
  const handleConnectionChange = (connected: boolean) => {
    setWsConnected(connected);
    
    if (connected) {
      toast({
        title: 'WebSocket Connected',
        description: `Connected to ${wsUrl || 'server'}`,
        variant: 'default',
      });
    } else {
      toast({
        title: 'WebSocket Disconnected',
        description: 'Connection to server lost',
        variant: 'destructive',
      });
    }
  };

  const unsubscribe = deviceWebSocketService.onConnectionChange(handleConnectionChange);
  
  // Set initial connection status
  setWsConnected(deviceWebSocketService.isConnected());
  
  return () => {
    unsubscribe();
  };
}, [toast, wsUrl]);
```

## Visual Elements

### Status Bar Classes
```html
<div className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 flex items-center justify-between border-b transition-all ${
  wsConnected 
    ? 'bg-emerald-500/10 border-emerald-500/30 backdrop-blur-sm' 
    : 'bg-red-500/10 border-red-500/30 backdrop-blur-sm'
}`}>
```

### Connection Icons
- **Connected**: `Wifi` icon with pulsing dot overlay
- **Disconnected**: `WifiOff` icon
- **Live Activity**: `Activity` icon with pulse animation

### Toast Notifications
- **Success**: Green background for connection events
- **Error**: Red background for disconnection events
- **Auto-dismiss**: 3-second timeout

## Testing

To verify the WebSocket connection status indicators are working:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Load a dashboard and configure WebSocket settings**:
   - Enter WebSocket URL and Connection ID
   - Click "LAUNCH DASHBOARD"

3. **Observe the status bar**:
   - Fixed bar at top showing connection status
   - Green when connected, red when disconnected
   - Shows server URL and connection ID

4. **Watch for toast notifications**:
   - Green toast when connection is established
   - Red toast when connection is lost or fails

5. **Check browser console**:
   ```
   [IoTPreview] WebSocket connected
   [IoTPreview] WebSocket disconnected
   [Toast default] WebSocket Connected Connected to wss://your-server.com
   [Toast destructive] WebSocket Disconnected Connection to server lost
   ```

## Benefits

✅ **Immediate Feedback**: Users instantly know connection status  
✅ **Visual Clarity**: Color-coded indicators follow industrial design  
✅ **Detailed Information**: Shows server URL and connection ID  
✅ **Non-Intrusive**: Status bar is integrated in header, toasts auto-dismiss  
✅ **Accessible**: Clear text labels and visual icons  
✅ **Consistent**: Matches existing industrial UI design language  
✅ **No Overlap**: Status bar is properly contained in header area

## Related Files

- `src/components/IoTPreview.tsx` - Main implementation
- `src/App.tsx` - Toaster integration
- `src/hooks/use-toast.ts` - Toast notification system
- `src/components/ui/toaster.tsx` - Toast UI component
- `src/services/deviceWebSocketService.ts` - WebSocket service with connection events
