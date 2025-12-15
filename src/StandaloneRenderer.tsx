import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StandaloneProvider } from './contexts/StandaloneContext';
import { IoTPreview } from './components/IoTPreview';
import { Upload, Settings, Play, FileJson, Trash2, Download, Plus, List, Search, LayoutGrid, Eye, ExternalLink, Calendar, Layers, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import type { IoTDashboardConfig } from './types';
import * as DashboardStorage from './utils/dashboardStorage';
import type { StoredDashboard } from './utils/dashboardStorage';
import deviceWebSocketService from './services/deviceWebSocketService';

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
  const [storedDashboards, setStoredDashboards] = useState<StoredDashboard[]>([]);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | null>(null);
  const [showDashboardList, setShowDashboardList] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSettingsPanel, setShowSettingsPanel] = useState<boolean>(false);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);

  // Load saved configuration from localStorage
  useEffect(() => {
    const savedWsUrl = localStorage.getItem('standalone_ws_url');
    const savedConnId = localStorage.getItem('standalone_conn_id');
    
    if (savedWsUrl) setWebsocketUrl(savedWsUrl);
    if (savedConnId) setConnectionId(savedConnId);
    
    // Load all stored dashboards
    loadStoredDashboards();
    
    // Check for dashboard ID in URL
    const params = new URLSearchParams(window.location.search);
    const urlDashboardId = params.get('dashboard');
    
    if (urlDashboardId) {
      // Try to load dashboard from URL parameter
      const dashboard = DashboardStorage.getDashboardById(urlDashboardId);
      if (dashboard) {
        console.log('[StandaloneRenderer] Loading dashboard from URL:', urlDashboardId);
        setDashboardConfig(dashboard.config);
        setSelectedDashboardId(dashboard.id);
        DashboardStorage.setActiveDashboardId(dashboard.id);
        // Auto-launch dashboard if WebSocket config exists
        if (savedWsUrl && savedConnId) {
          setIsConfigured(true);
        }
      } else {
        console.warn('[StandaloneRenderer] Dashboard not found for URL ID:', urlDashboardId);
        setError(`Dashboard "${urlDashboardId}" not found. Please import it first.`);
      }
    } else {
      // Load active dashboard if no URL parameter
      const activeDashboard = DashboardStorage.getActiveDashboard();
      if (activeDashboard) {
        setDashboardConfig(activeDashboard.config);
        setSelectedDashboardId(activeDashboard.id);
      }
    }
  }, []);

  // Monitor WebSocket connection status
  useEffect(() => {
    const handleConnectionChange = (connected: boolean) => {
      setWsConnected(connected);
    };

    const unsubscribe = deviceWebSocketService.onConnectionChange(handleConnectionChange);
    
    // Set initial connection status
    setWsConnected(deviceWebSocketService.isConnected());
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Load all dashboards from storage
  const loadStoredDashboards = () => {
    const dashboards = DashboardStorage.getAllDashboards();
    setStoredDashboards(dashboards);
  };
  
  // Filter dashboards based on search query
  const filteredDashboards = storedDashboards.filter(dashboard => 
    dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dashboard.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    try {
      const config = await DashboardStorage.importDashboardFromFile(file);
      
      // Save to localStorage immediately
      const saved = DashboardStorage.saveDashboard(config);
      
      setDashboardConfig(saved.config);
      setSelectedDashboardId(saved.id);
      loadStoredDashboards();
      
      console.log('Dashboard imported and saved successfully:', saved.name);
    } catch (err) {
      setError(`Failed to import dashboard: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setDashboardConfig(null);
    }
    
    // Reset file input
    event.target.value = '';
  };
  
  // Load a dashboard from the stored list
  const handleLoadDashboard = (dashboard: StoredDashboard) => {
    setDashboardConfig(dashboard.config);
    setSelectedDashboardId(dashboard.id);
    DashboardStorage.setActiveDashboardId(dashboard.id);
    setFileName(dashboard.name);
    setError('');
    
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('dashboard', dashboard.id);
    window.history.pushState({}, '', url);
    console.log('[StandaloneRenderer] Updated URL for dashboard:', dashboard.id);
  };
  
  // Delete a dashboard
  const handleDeleteDashboard = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this dashboard?')) {
      DashboardStorage.deleteDashboard(id);
      loadStoredDashboards();
      
      // If deleted dashboard was selected, clear selection
      if (selectedDashboardId === id) {
        setDashboardConfig(null);
        setSelectedDashboardId(null);
        setFileName('');
      }
    }
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
    
    // Save active dashboard ID and update URL
    if (selectedDashboardId) {
      DashboardStorage.setActiveDashboardId(selectedDashboardId);
      
      // Update URL to include dashboard ID
      const url = new URL(window.location.href);
      url.searchParams.set('dashboard', selectedDashboardId);
      window.history.pushState({}, '', url);
    }

    setIsConfigured(true);
    setError('');
  };

  const handleReconfigure = () => {
    setIsConfigured(false);
  };
  
  // Copy dashboard URL to clipboard
  const handleCopyDashboardLink = (dashboardId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('dashboard', dashboardId);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      // Show success feedback (you could add a toast notification here)
      console.log('[StandaloneRenderer] Dashboard link copied:', url.toString());
      alert('Dashboard link copied to clipboard!');
    }).catch((err) => {
      console.error('[StandaloneRenderer] Failed to copy link:', err);
      alert('Failed to copy link. Please copy manually: ' + url.toString());
    });
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#E6E8EA]">
        {/* Industrial Top Bar */}
        <div className="bg-white border-b-2 border-[#263347]/10 px-6 py-3 shadow-sm">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-[#263347]/60 uppercase tracking-wider">System Online</span>
              </div>
              <div className="h-4 w-px bg-[#263347]/10" />
              <span className="text-xs font-mono text-[#263347]/60">v1.0.0</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-[#263347]/40 uppercase tracking-wider">Industrial Dashboard Manager</span>
            </div>
          </div>
        </div>
        
        <div className="max-w-[1600px] mx-auto p-6 space-y-6">
          {/* Header Section */}
          <div className="bg-white border border-[#263347]/10 p-6 shadow-md">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#263347] border border-[#263347]/20">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-[#263347] tracking-tight uppercase">
                    DASHBOARD CONTROL SYSTEM
                  </h1>
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-xs font-mono text-emerald-600 uppercase tracking-wider font-bold">Ready</span>
                  </div>
                </div>
                <p className="text-sm text-[#263347]/60 font-mono">
                  Configuration Management & Real-Time WebSocket Connectivity
                </p>
              </div>
            </div>
          </div>

          {/* Stored Dashboards Section */}
          {storedDashboards.length > 0 && (
            <div className="bg-white border border-[#263347]/10 shadow-md">
              {/* Section Header */}
              <div className="border-b border-[#263347]/10 bg-[#F9F9FA] px-6 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-[#263347]" />
                      <h2 className="text-sm font-bold text-[#263347] uppercase tracking-wider">Configured Dashboards</h2>
                    </div>
                    <div className="px-2 py-1 bg-[#263347] border border-[#263347]">
                      <span className="text-xs font-mono text-white">
                        {filteredDashboards.length}/{storedDashboards.length} DISPLAYED
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#263347]/40" />
                      <Input
                        type="text"
                        placeholder="FILTER BY NAME..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-[#F9F9FA] border-[#263347]/20 text-[#263347] placeholder:text-[#263347]/40 placeholder:uppercase placeholder:text-xs font-mono h-9 focus:border-[#263347] focus:ring-0"
                      />
                    </div>
                    
                    {/* View Toggle */}
                    <div className="flex items-center border border-[#263347]/20">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={`h-9 px-3 ${viewMode === 'grid' ? 'bg-[#263347] text-white' : 'bg-transparent text-[#263347]/60 hover:text-[#263347] hover:bg-[#F9F9FA]'}`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                      <div className="w-px h-5 bg-[#263347]/20" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={`h-9 px-3 ${viewMode === 'list' ? 'bg-[#263347] text-white' : 'bg-transparent text-[#263347]/60 hover:text-[#263347] hover:bg-[#F9F9FA]'}`}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDashboardList(!showDashboardList)}
                      className="h-9 bg-transparent border border-[#263347]/20 text-[#263347] hover:bg-[#F9F9FA] uppercase text-xs font-mono tracking-wider"
                    >
                      {showDashboardList ? 'COLLAPSE' : 'EXPAND'}
                    </Button>
                  </div>
                </div>
              </div>
              
              {showDashboardList && (
                <div className="p-6">
                  {filteredDashboards.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-[#263347]/20">
                      <Search className="w-12 h-12 text-[#263347]/20 mx-auto mb-3" />
                      <p className="text-[#263347]/60 font-mono text-sm uppercase tracking-wider">No Matching Results</p>
                    </div>
                  ) : (
                    <div className={viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                      : 'flex flex-col gap-3'
                    }>
                      {filteredDashboards.map((dashboard) => (
                        <div
                          key={dashboard.id}
                          onClick={() => handleLoadDashboard(dashboard)}
                          className={`relative border-2 cursor-pointer transition-all ${
                            selectedDashboardId === dashboard.id
                              ? 'bg-[#263347] border-[#263347] shadow-lg'
                              : 'bg-white border-[#263347]/20 hover:border-[#263347] hover:shadow-md'
                          }`}
                        >
                          {/* Status Indicator */}
                          <div className={`absolute top-0 left-0 w-full h-1 ${
                            selectedDashboardId === dashboard.id ? 'bg-emerald-500' : 'bg-transparent'
                          }`} />
                          
                          {/* Active Badge */}
                          {selectedDashboardId === dashboard.id && (
                            <div className="absolute -top-3 -right-3 px-3 py-1 bg-emerald-500 border-2 border-white shadow-md">
                              <span className="text-xs font-mono text-white font-bold uppercase tracking-wider">ACTIVE</span>
                            </div>
                          )}
                          
                          <div className="p-5">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className={`text-base font-bold mb-1 uppercase tracking-wide ${
                                  selectedDashboardId === dashboard.id ? 'text-white' : 'text-[#263347]'
                                }`}>
                                  {dashboard.name}
                                </h3>
                                {dashboard.description && (
                                  <p className={`text-xs font-mono line-clamp-2 ${
                                    selectedDashboardId === dashboard.id ? 'text-white/70' : 'text-[#263347]/60'
                                  }`}>
                                    {dashboard.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-[#263347]/10">
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 border ${
                                  selectedDashboardId === dashboard.id
                                    ? 'bg-white/10 border-white/20'
                                    : 'bg-[#F9F9FA] border-[#263347]/20'
                                }`}>
                                  <Layers className={`w-3.5 h-3.5 ${
                                    selectedDashboardId === dashboard.id ? 'text-white' : 'text-[#263347]'
                                  }`} />
                                </div>
                                <div>
                                  <div className={`text-xs font-mono ${
                                    selectedDashboardId === dashboard.id ? 'text-white/70' : 'text-[#263347]/60'
                                  }`}>PAGES</div>
                                  <div className={`text-sm font-bold font-mono ${
                                    selectedDashboardId === dashboard.id ? 'text-white' : 'text-[#263347]'
                                  }`}>{dashboard.config.pages?.length || 0}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 border ${
                                  selectedDashboardId === dashboard.id
                                    ? 'bg-white/10 border-white/20'
                                    : 'bg-[#F9F9FA] border-[#263347]/20'
                                }`}>
                                  <LayoutGrid className={`w-3.5 h-3.5 ${
                                    selectedDashboardId === dashboard.id ? 'text-white' : 'text-[#263347]'
                                  }`} />
                                </div>
                                <div>
                                  <div className={`text-xs font-mono ${
                                    selectedDashboardId === dashboard.id ? 'text-white/70' : 'text-[#263347]/60'
                                  }`}>WIDGETS</div>
                                  <div className={`text-sm font-bold font-mono ${
                                    selectedDashboardId === dashboard.id ? 'text-white' : 'text-[#263347]'
                                  }`}>
                                    {dashboard.config.pages?.reduce((sum, page) => sum + (page.widgets?.length || 0), 0) || 0}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Timestamp */}
                            <div className={`flex items-center gap-2 text-xs font-mono mb-4 ${
                              selectedDashboardId === dashboard.id ? 'text-white/60' : 'text-[#263347]/50'
                            }`}>
                              <Calendar className="w-3.5 h-3.5" />
                              <span>UPDATED: {new Date(dashboard.updatedAt).toLocaleDateString().toUpperCase()}</span>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="grid grid-cols-3 gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                                                onClick={async (e) => {
                                  e.stopPropagation();
                                  
                                  console.log('[VIEW Button] Clicked for dashboard:', dashboard.id);
                                  console.log('[VIEW Button] Current WebSocket config - URL:', websocketUrl, 'ConnID:', connectionId);
                                  setIsLaunching(true);
                                  setError('');
                                  
                                  try {
                                    // Load dashboard state
                                    handleLoadDashboard(dashboard);
                                    console.log('[VIEW Button] Dashboard loaded into state');
                                    
                                    // Check if WebSocket config exists in state (includes defaults)
                                    if (websocketUrl && websocketUrl.trim() && connectionId && connectionId.trim()) {
                                      console.log('[VIEW Button] WebSocket config found, launching dashboard...');
                                      
                                      // Save to localStorage if not already saved
                                      if (!localStorage.getItem('standalone_ws_url')) {
                                        localStorage.setItem('standalone_ws_url', websocketUrl);
                                        console.log('[VIEW Button] Saved WebSocket URL to localStorage');
                                      }
                                      if (!localStorage.getItem('standalone_conn_id')) {
                                        localStorage.setItem('standalone_conn_id', connectionId);
                                        console.log('[VIEW Button] Saved Connection ID to localStorage');
                                      }
                                      
                                      // Small delay to ensure state updates
                                      setTimeout(() => {
                                        setIsConfigured(true);
                                        setIsLaunching(false);
                                        console.log('[VIEW Button] Dashboard launched successfully');
                                      }, 150);
                                    } else {
                                      console.warn('[VIEW Button] No WebSocket config found in state');
                                      setIsLaunching(false);
                                      setError('Please configure WebSocket connection settings first. Scroll down to "Show Configuration Panel" to set up your connection.');
                                      setShowSettingsPanel(true);
                                      // Scroll to settings panel
                                      setTimeout(() => {
                                        const settingsButton = document.querySelector('[class*="justify-center"]');
                                        settingsButton?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }, 100);
                                    }
                                  } catch (error) {
                                    console.error('[VIEW Button] Error:', error);
                                    setIsLaunching(false);
                                    setError(`Failed to launch dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                  }
                                }}
                                disabled={isLaunching}
                                className={`h-8 border font-mono text-xs uppercase tracking-wider ${
                                  isLaunching
                                    ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30 cursor-wait'
                                    : selectedDashboardId === dashboard.id
                                    ? 'bg-white text-[#263347] border-white hover:bg-white/90'
                                    : 'bg-transparent text-[#263347] border-[#263347]/20 hover:bg-[#F9F9FA]'
                                }`}
                              >
                                {isLaunching ? (
                                  <>
                                    <div className="w-3.5 h-3.5 mr-1.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                    LOADING
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                                    VIEW
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleCopyDashboardLink(dashboard.id, e)}
                                className={`h-8 border font-mono text-xs uppercase tracking-wider ${
                                  selectedDashboardId === dashboard.id
                                    ? 'bg-transparent text-white border-white/20 hover:bg-white/5'
                                    : 'bg-transparent text-[#263347] border-[#263347]/20 hover:bg-[#F9F9FA]'
                                }`}
                                title="Copy dashboard link"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDeleteDashboard(dashboard.id, e)}
                                className="h-8 border font-mono text-xs uppercase tracking-wider bg-transparent text-red-600 border-red-600/20 hover:bg-red-50"
                                title="Delete dashboard"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Settings Panel Toggle Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => setShowSettingsPanel(!showSettingsPanel)}
              variant="ghost"
              size="lg"
              className="bg-white border-2 border-[#263347]/20 text-[#263347] hover:bg-[#F9F9FA] hover:border-[#263347] px-8 py-6 shadow-md uppercase text-sm font-mono tracking-wider font-bold"
            >
              <Settings className="w-5 h-5 mr-3" />
              {showSettingsPanel ? 'Hide Configuration Panel' : 'Show Configuration Panel'}
              {showSettingsPanel ? (
                <ChevronUp className="w-5 h-5 ml-3" />
              ) : (
                <ChevronDown className="w-5 h-5 ml-3" />
              )}
            </Button>
          </div>

          {/* Collapsible Settings Panel */}
          {showSettingsPanel && (
            <div className="space-y-6">
              {/* Import Dashboard Section */}
              <div className="grid lg:grid-cols-2 gap-6">

            {/* Import Panel */}
            <div className="bg-white border border-[#263347]/10 shadow-md">
              <div className="border-b border-[#263347]/10 bg-[#F9F9FA] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#263347]" />
                  <h2 className="text-sm font-bold text-[#263347] uppercase tracking-wider">Dashboard Import</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Label htmlFor="dashboard-file" className="text-xs font-mono text-[#263347] uppercase tracking-wider mb-3 block">
                    Configuration File (JSON)
                  </Label>
                  <div className="relative">
                    <Input
                      id="dashboard-file"
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="bg-[#F9F9FA] border-[#263347]/20 text-[#263347] file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#263347] file:text-white file:font-mono file:text-xs file:uppercase file:tracking-wider hover:file:bg-[#263347]/90 file:cursor-pointer cursor-pointer focus:border-[#263347] focus:ring-0 font-mono text-sm"
                    />
                  </div>
                  <div className="flex items-start gap-2 mt-2 text-xs text-[#263347]/40 font-mono">
                    <FileJson className="w-3.5 h-3.5 mt-0.5" />
                    <p>ACCEPTS: Dashboard configuration JSON files</p>
                  </div>
                </div>

                {dashboardConfig && selectedDashboardId && (
                  <div className="border-2 border-emerald-500/30 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-500/20 border border-emerald-500/30">
                        <Play className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-mono text-emerald-700 uppercase tracking-wider mb-2 font-bold">System Ready</div>
                        <div className="text-sm font-bold text-[#263347] mb-3">{dashboardConfig.name || 'Dashboard'}</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs font-mono text-[#263347]/60 uppercase">Pages</div>
                            <div className="text-sm font-bold font-mono text-[#263347]">{dashboardConfig.pages?.length || 0}</div>
                          </div>
                          <div>
                            <div className="text-xs font-mono text-[#263347]/60 uppercase">Widgets</div>
                            <div className="text-sm font-bold font-mono text-[#263347]">
                              {dashboardConfig.pages?.reduce((sum, page) => sum + (page.widgets?.length || 0), 0) || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* WebSocket Configuration */}
            <div className="bg-white border border-[#263347]/10 shadow-md">
              <div className="border-b border-[#263347]/10 bg-[#F9F9FA] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#263347]" />
                  <h2 className="text-sm font-bold text-[#263347] uppercase tracking-wider">Connection Parameters</h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <Label htmlFor="ws-url" className="text-xs font-mono text-[#263347] uppercase tracking-wider mb-3 block flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5" />
                    WebSocket Server URL
                  </Label>
                  <Input
                    id="ws-url"
                    type="text"
                    value={websocketUrl}
                    onChange={(e) => setWebsocketUrl(e.target.value)}
                    placeholder="wss://server-address:port"
                    className="bg-[#F9F9FA] border-[#263347]/20 text-[#263347] placeholder:text-[#263347]/40 font-mono text-sm focus:border-[#263347] focus:ring-0"
                  />
                  <p className="text-xs text-[#263347]/40 mt-2 font-mono">
                    EXAMPLE: wss://localhost:8080
                  </p>
                </div>

                <div>
                  <Label htmlFor="conn-id" className="text-xs font-mono text-[#263347] uppercase tracking-wider mb-3 block flex items-center gap-2">
                    <FileJson className="w-3.5 h-3.5" />
                    Connection Identifier
                  </Label>
                  <Input
                    id="conn-id"
                    type="text"
                    value={connectionId}
                    onChange={(e) => setConnectionId(e.target.value)}
                    placeholder="DASHBOARD-ID"
                    className="bg-[#F9F9FA] border-[#263347]/20 text-[#263347] placeholder:text-[#263347]/40 font-mono text-sm uppercase focus:border-[#263347] focus:ring-0"
                  />
                  <p className="text-xs text-[#263347]/40 mt-2 font-mono">
                    UNIQUE ID FOR THIS INSTANCE
                  </p>
                </div>
              </div>
              </div>
            </div>

              {/* Error Alert */}
              {error && (
                <div className="border-2 border-red-500 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-500/20 border border-red-500">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-mono text-red-600 uppercase tracking-wider mb-1 font-bold">System Error</div>
                      <div className="text-sm text-[#263347] font-mono">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Info Footer */}
              <div className="bg-white border border-[#263347]/10 p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-[#263347] border border-[#263347]/20">
                    <FileJson className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-[#263347] uppercase tracking-wider mb-3">System Capabilities</h3>
                    <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-[#263347] mt-1">■</span>
                        <span className="text-xs text-[#263347]/70 font-mono">Persistent dashboard storage (localStorage)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#263347] mt-1">■</span>
                        <span className="text-xs text-[#263347]/70 font-mono">Real-time WebSocket connectivity</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#263347] mt-1">■</span>
                        <span className="text-xs text-[#263347]/70 font-mono">Multi-dashboard management system</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#263347] mt-1">■</span>
                        <span className="text-xs text-[#263347]/70 font-mono">49+ industrial widget types</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#263347] mt-1">■</span>
                        <span className="text-xs text-[#263347]/70 font-mono">Air-gapped deployment compatible</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#263347] mt-1">■</span>
                        <span className="text-xs text-[#263347]/70 font-mono">JSON import/export functionality</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render the dashboard using IoTPreview
  return (
    <div className="min-h-screen bg-[#E6E8EA]">
      {/* Industrial Top Control Bar */}
      <div className="bg-white border-b-2 border-[#263347]/10 shadow-lg">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Dashboard Info */}
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#263347] border border-[#263347]/20">
                <LayoutGrid className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-[#263347] uppercase tracking-wide">
                    {dashboardConfig?.name || 'IoT Dashboard'}
                  </h2>
                  <div className={`px-3 py-1 border ${
                    wsConnected 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        wsConnected 
                          ? 'bg-emerald-500 animate-pulse' 
                          : 'bg-red-500'
                      }`} />
                      <span className={`text-xs font-mono uppercase tracking-wider font-bold ${
                        wsConnected 
                          ? 'text-emerald-600' 
                          : 'text-red-600'
                      }`}>{wsConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-[#263347]/60 font-mono">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{websocketUrl.replace('wss://', '').replace('ws://', '')}</span>
                  </div>
                  <div className="w-px h-3 bg-[#263347]/20" />
                  <div className="flex items-center gap-1.5 text-xs text-[#263347]/60 font-mono">
                    <FileJson className="w-3.5 h-3.5" />
                    <span>ID: {connectionId}</span>
                  </div>
                  {storedDashboards.length > 1 && (
                    <>
                      <div className="w-px h-3 bg-[#263347]/20" />
                      <div className="px-2 py-1 bg-[#263347] border border-[#263347]">
                        <span className="text-xs font-mono text-white uppercase">
                          {storedDashboards.findIndex(d => d.id === selectedDashboardId) + 1}/{storedDashboards.length}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right: Control Actions */}
            <div className="flex items-center gap-2">
              {selectedDashboardId && (
                <Button
                  onClick={(e) => handleCopyDashboardLink(selectedDashboardId, e)}
                  variant="ghost"
                  size="sm"
                  className="bg-transparent border border-[#263347]/20 text-[#263347] hover:bg-[#F9F9FA] hover:border-[#263347] uppercase text-xs font-mono tracking-wider h-9 px-4"
                  title="Copy dashboard link"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              )}
              <Button
                onClick={handleReconfigure}
                variant="ghost"
                size="sm"
                className="bg-[#263347] border border-[#263347] text-white hover:bg-[#263347]/90 uppercase text-xs font-mono tracking-wider h-9 px-4 font-bold"
              >
                <Settings className="w-4 h-4 mr-2" />
                {storedDashboards.length > 0 ? 'Switch Dashboard' : 'Configure'}
              </Button>
            </div>
          </div>
        </div>
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
