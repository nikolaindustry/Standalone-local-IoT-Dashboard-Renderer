# WebSocket Connection Fix

## Problem Identified

The Standalone IoT Dashboard Renderer was not establishing WebSocket connections when launched in standalone mode.

### Root Cause

The `IoTPreview.tsx` component was designed for the full platform mode with Supabase authentication. It only initiated WebSocket connections after receiving a user ID from Supabase's authentication system:

```typescript
// OLD CODE - Lines 32-52
useEffect(() => {
  const initializeConnection = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (userId) {  // ❌ Never true in standalone mode
      await deviceWebSocketService.connect(targetId);
    }
  };
  
  initializeConnection();
}, []);
```

**In standalone mode:**
- No Supabase authentication is available
- No `userId` is returned
- WebSocket connection is never initiated
- Dashboard never connects to the configured WebSocket server

## Solution Implemented

Modified `IoTPreview.tsx` to detect standalone mode and use the configured connection parameters from `window.__STANDALONE_WS_CONFIG__`:

```typescript
// NEW CODE
useEffect(() => {
  const initializeConnection = async () => {
    // Check for standalone mode configuration
    const standaloneConfig = (window as any).__STANDALONE_WS_CONFIG__;
    
    if (standaloneConfig) {
      // ✅ Standalone mode - use configured connection ID
      const targetId = standaloneConfig.id || 'standalone-dashboard';
      console.log('[IoTPreview] Standalone mode detected');
      console.log('[IoTPreview] Connecting to:', standaloneConfig.url);
      console.log('[IoTPreview] Connection ID:', targetId);
      
      await deviceWebSocketService.connect(targetId);
    } else {
      // Normal mode - use Supabase authentication
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (userId) {
        await deviceWebSocketService.connect(targetId);
      }
    }
  };
  
  initializeConnection();
}, []);
```

## How It Works

### Configuration Flow

1. **User configures WebSocket settings** in `StandaloneRenderer.tsx`:
   - WebSocket URL (e.g., `wss://nikolaindustry-realtime.onrender.com`)
   - Connection ID (e.g., `standalone-dashboard`)

2. **StandaloneProvider stores config** in `window.__STANDALONE_WS_CONFIG__`:
   ```typescript
   // src/contexts/StandaloneContext.tsx (lines 62-74)
   useEffect(() => {
     (window as any).__STANDALONE_WS_CONFIG__ = {
       url: websocketUrl,
       id: connectionId,
     };
   }, [websocketUrl, connectionId]);
   ```

3. **IoTPreview detects standalone mode** and connects:
   ```typescript
   const standaloneConfig = (window as any).__STANDALONE_WS_CONFIG__;
   if (standaloneConfig) {
     await deviceWebSocketService.connect(standaloneConfig.id);
   }
   ```

4. **deviceWebSocketService builds WebSocket URL**:
   ```typescript
   // src/services/deviceWebSocketService.ts (lines 82-89)
   const standaloneConfig = (window as any).__STANDALONE_WS_CONFIG__;
   const wsBaseUrl = standaloneConfig?.url || 'wss://nikolaindustry-realtime.onrender.com';
   const wsUrl = `${wsBaseUrl}/?id=${targetId}`;
   this.ws = new WebSocket(wsUrl);
   ```

### Connection URL Format

The WebSocket connects to: `wss://[configured-url]/?id=[connection-id]`

**Example:**
- Configured URL: `wss://nikolaindustry-realtime.onrender.com`
- Connection ID: `standalone-dashboard`
- **Final WebSocket URL:** `wss://nikolaindustry-realtime.onrender.com/?id=standalone-dashboard`

## Files Modified

### `src/components/IoTPreview.tsx`
- **Lines 31-52:** Added standalone mode detection
- **Change:** Check for `window.__STANDALONE_WS_CONFIG__` before trying Supabase auth
- **Impact:** WebSocket connections now work in standalone mode

## Testing

To verify the fix is working:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Configure WebSocket settings:**
   - Enter your WebSocket URL (e.g., `wss://your-server.com`)
   - Enter your Connection ID (e.g., `standalone-dashboard`)

3. **Load a dashboard and click "LAUNCH DASHBOARD"**

4. **Check browser console for these messages:**
   ```
   [IoTPreview] Standalone mode detected
   [IoTPreview] Connecting to: wss://your-server.com
   [IoTPreview] Connection ID: standalone-dashboard
   [Standalone] Connecting to WebSocket: wss://your-server.com/?id=standalone-dashboard
   Device WebSocket connected with ID: standalone-dashboard
   [IoTPreview] WebSocket connection established in standalone mode
   ```

5. **Verify WebSocket in DevTools:**
   - Open Chrome DevTools → Network tab
   - Filter by "WS" (WebSocket)
   - Should see active WebSocket connection to your configured URL

## Benefits

✅ **Standalone mode now works as designed** - connects to local/custom WebSocket servers  
✅ **Backwards compatible** - normal platform mode with Supabase still works  
✅ **Proper error logging** - clear console messages for debugging  
✅ **No code duplication** - reuses existing `deviceWebSocketService` infrastructure  
✅ **Industrial use case supported** - perfect for air-gapped/offline deployments  

## Related Files

- `src/components/IoTPreview.tsx` - Dashboard preview component
- `src/contexts/StandaloneContext.tsx` - Standalone configuration provider
- `src/services/deviceWebSocketService.ts` - WebSocket service singleton
- `src/StandaloneRenderer.tsx` - Main standalone UI
- `src/utils/customWebSocketService.ts` - Alternative WebSocket service (not used for dashboard data)
