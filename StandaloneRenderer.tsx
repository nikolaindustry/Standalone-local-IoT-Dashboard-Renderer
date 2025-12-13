import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StandaloneProvider } from './contexts/StandaloneContext';
import { IoTPreview } from './components/IoTPreview';
import { Upload, Settings, Play, FileJson } from 'lucide-react';
import type { IoTDashboardConfig } from './types';

/**
 * Standalone IoT Dashboard Renderer
 * 
 * This component can run independently from the main platform.
 * It loads dashboard JSON configurations and connects to a local WebSocket server.
 * 
 * Features:
 * - Load dashboard JSON from file
 * - Configure WebSocket URL
 * - Configure WebSocket connection ID
 * - Full widget rendering support
 * - Real-time WebSocket communication
 * - No authentication required (for local/industrial use)
 */
export const StandaloneRenderer: React.FC = () => {
  const [dashboardConfig, setDashboardConfig] = useState<IoTDashboardConfig | null>(null);
  const [websocketUrl, setWebsocketUrl] = useState<string>('wss://nikolaindustry-realtime.onrender.com');
  const [connectionId, setConnectionId] = useState<string>('standalone-dashboard');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  // Load saved configuration from localStorage
  useEffect(() => {
    const savedWsUrl = localStorage.getItem('standalone_ws_url');
    const savedConnId = localStorage.getItem('standalone_conn_id');
    
    if (savedWsUrl) setWebsocketUrl(savedWsUrl);
    if (savedConnId) setConnectionId(savedConnId);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = JSON.parse(content) as IoTDashboardConfig;
        
        // Validate basic structure
        if (!config.pages || !Array.isArray(config.pages)) {
          throw new Error('Invalid dashboard configuration: missing pages array');
        }

        setDashboardConfig(config);
        console.log('Dashboard configuration loaded successfully:', config);
      } catch (err) {
        setError(`Failed to parse JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setDashboardConfig(null);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleStartRenderer = () => {
    if (!dashboardConfig) {
      setError('Please load a dashboard configuration first');
      return;
    }

    if (!websocketUrl.trim()) {
      setError('Please enter a WebSocket URL');
      return;
    }

    if (!connectionId.trim()) {
      setError('Please enter a connection ID');
      return;
    }

    // Save configuration
    localStorage.setItem('standalone_ws_url', websocketUrl);
    localStorage.setItem('standalone_conn_id', connectionId);

    setIsConfigured(true);
    setError('');
  };

  const handleReconfigure = () => {
    setIsConfigured(false);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white">Standalone IoT Dashboard Renderer</h1>
            <p className="text-gray-400">Load dashboard configurations and connect to local WebSocket servers</p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileJson className="w-5 h-5" />
                Dashboard Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dashboard-file" className="text-gray-300">
                  Upload Dashboard JSON File
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="dashboard-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                {fileName && (
                  <p className="text-sm text-green-400">✓ Loaded: {fileName}</p>
                )}
              </div>

              {dashboardConfig && (
                <Alert className="bg-green-900/20 border-green-700">
                  <AlertDescription className="text-green-300">
                    Dashboard configuration loaded successfully! 
                    Found {dashboardConfig.pages?.length || 0} page(s) with{' '}
                    {dashboardConfig.pages?.reduce((sum, page) => sum + (page.widgets?.length || 0), 0) || 0} total widget(s).
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="w-5 h-5" />
                WebSocket Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ws-url" className="text-gray-300">
                  WebSocket URL
                </Label>
                <Input
                  id="ws-url"
                  type="text"
                  value={websocketUrl}
                  onChange={(e) => setWebsocketUrl(e.target.value)}
                  placeholder="wss://your-local-server.com"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-500">
                  Example: wss://localhost:8080 or wss://nikolaindustry-realtime.onrender.com
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conn-id" className="text-gray-300">
                  Connection ID
                </Label>
                <Input
                  id="conn-id"
                  type="text"
                  value={connectionId}
                  onChange={(e) => setConnectionId(e.target.value)}
                  placeholder="dashboard-1"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-500">
                  Unique identifier for this dashboard connection (e.g., dashboard-plant-1, device-monitor)
                </p>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleStartRenderer}
              size="lg"
              disabled={!dashboardConfig}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Renderer
            </Button>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">About</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2 text-sm">
              <p>
                This standalone renderer operates independently from the cloud platform. It loads
                dashboard JSON configurations created on the platform and connects to a local
                WebSocket server for real-time communication.
              </p>
              <p className="font-semibold">Key Features:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Full widget rendering support (charts, gauges, buttons, switches, etc.)</li>
                <li>Real-time WebSocket communication</li>
                <li>No authentication required (suitable for isolated networks)</li>
                <li>Portable dashboard configurations via JSON</li>
                <li>Suitable for industrial, air-gapped, or local deployments</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render the dashboard using IoTPreview
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-semibold">
            {dashboardConfig?.name || 'IoT Dashboard'}
          </h2>
          <div className="text-xs text-gray-400">
            WS: {websocketUrl} | ID: {connectionId}
          </div>
        </div>
        <Button
          onClick={handleReconfigure}
          variant="outline"
          size="sm"
          className="bg-gray-700 text-white hover:bg-gray-600"
        >
          <Settings className="w-4 h-4 mr-2" />
          Reconfigure
        </Button>
      </div>

      <StandaloneProvider
        initialConfig={dashboardConfig!}
        websocketUrl={websocketUrl}
        connectionId={connectionId}
      >
        <IoTPreview />
      </StandaloneProvider>
    </div>
  );
};

export default StandaloneRenderer;
