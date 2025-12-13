import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, Navigation, Trash2, Save, Upload, Download, Play, Pause, 
  RotateCcw, Plus, Edit3, Move, Square, Circle as CircleIcon, AlertTriangle, Grid3x3, Send 
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import deviceWebSocketService from '@/services/deviceWebSocketService';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MissionPlanningMapWidgetRendererProps {
  widget: IoTDashboardWidget;
  isDesignMode?: boolean;
  value?: any;
  onValueChange?: (value: any) => void;
  deviceId?: string;
  productId?: string; // Add productId prop from dashboard context
}

interface Waypoint {
  id: string;
  lat: number;
  lng: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  action?: string;
  dwellTime?: number;
  name?: string;
  order: number;
  operations?: string; // Custom operations to perform at this waypoint
}

interface GeoBoundary {
  id: string;
  type: 'polygon' | 'circle' | 'rectangle';
  coordinates: number[][];
  name?: string;
  restriction?: 'no-fly' | 'safe-zone' | 'search-area';
}

interface Mission {
  id: string;
  name: string;
  type: 'mapping' | 'navigation' | 'survey' | 'inspection' | 'delivery' | 'custom';
  waypoints: Waypoint[];
  boundaries: GeoBoundary[];
  parameters: {
    defaultSpeed?: number;
    defaultAltitude?: number;
    returnToHome?: boolean;
    loopMission?: boolean;
    overlapPercentage?: number;
  };
  created_at: string;
  updated_at: string;
}

export const MissionPlanningMapWidgetRenderer: React.FC<MissionPlanningMapWidgetRendererProps> = ({
  widget,
  isDesignMode = false,
  value,
  onValueChange,
  deviceId,
  productId: contextProductId // Get productId from dashboard context
}) => {
  const config = widget.config || {};
  const style = widget.style || {};
  
  // Configuration - prioritize context productId over widget config
  const productId = contextProductId || config.productId;
  const missionType = config.missionType || 'mapping';
  const mapProvider = config.mapProvider || 'openstreetmap';
  const centerLat = config.centerLat || 40.7128;
  const centerLng = config.centerLng || -74.0060;
  const zoomLevel = config.zoomLevel || 13;
  const waypointColor = config.waypointColor || '#ef4444';
  const routeColor = config.routeColor || '#3b82f6';
  const boundaryColor = config.boundaryColor || '#10b981';
  const showToolbar = config.showToolbar !== false;
  const enableEditing = config.enableEditing !== false;
  const showCoordinates = config.showCoordinates !== false;
  const showAltitude = config.showAltitude !== false;
  const enableAutoSave = config.enableAutoSave === true;
  
  // State
  const [mission, setMission] = useState<Mission | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [boundaries, setBoundaries] = useState<GeoBoundary[]>([]);
  const [editMode, setEditMode] = useState<'waypoint' | 'boundary' | 'route' | null>(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState<string | null>(null);
  const [missionName, setMissionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [savedMissions, setSavedMissions] = useState<Mission[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [generationSettings, setGenerationSettings] = useState({
    spacing: 0.001,
    pattern: 'grid' as 'grid' | 'serpentine' | 'spiral',
    direction: 0, // degrees
    altitude: config.defaultAltitude || 100,
    speed: config.defaultSpeed || 10,
    operations: ''
  });
  
  // Refs
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const waypointsLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const boundariesLayerRef = useRef<L.LayerGroup | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || isDesignMode) return;
    
    console.log('Initializing mission planning map');
    
    // Set up WebSocket connection monitoring
    const unsubscribe = deviceWebSocketService.onConnectionChange((connected) => {
      setWsConnected(connected);
      console.log('WebSocket connection status:', connected);
    });
    
    // Connect WebSocket if device ID is available
    if (deviceId) {
      deviceWebSocketService.setDeviceId(deviceId).catch(err => {
        console.error('Failed to connect WebSocket:', err);
      });
    }
    
    try {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoomLevel,
        attributionControl: false
      });
      
      mapRef.current = map;
      
      // Add tile layer
      switch (mapProvider) {
        case 'esri':
          L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles © Esri'
          }).addTo(map);
          break;
        case 'carto':
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© CartoDB'
          }).addTo(map);
          break;
        default:
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);
      }
      
      // Add zoom control
      L.control.zoom({ position: 'topright' }).addTo(map);
      
      // Initialize feature groups
      waypointsLayerRef.current = L.layerGroup().addTo(map);
      boundariesLayerRef.current = L.layerGroup().addTo(map);
      drawnItemsRef.current = new L.FeatureGroup().addTo(map);
      
      // Initialize drawing controls
      if (enableEditing) {
        const drawControl = new L.Control.Draw({
          position: 'topleft',
          draw: {
            polyline: false,
            polygon: {
              allowIntersection: false,
              shapeOptions: {
                color: boundaryColor
              }
            },
            rectangle: {
              shapeOptions: {
                color: boundaryColor
              }
            },
            circle: {
              shapeOptions: {
                color: boundaryColor
              }
            },
            marker: false,
            circlemarker: false
          },
          edit: {
            featureGroup: drawnItemsRef.current,
            remove: true
          }
        });
        
        drawControl.addTo(map);
        drawControlRef.current = drawControl;
        
        // Handle drawing events
        map.on(L.Draw.Event.CREATED, (e: any) => {
          console.log('L.Draw.Event.CREATED fired:', e);
          const { layer, layerType } = e;
          drawnItemsRef.current?.addLayer(layer);
          
          // Add boundary to state
          const boundary: GeoBoundary = {
            id: Math.random().toString(36).substr(2, 9),
            type: layerType,
            coordinates: [],
            name: `Boundary ${boundaries.length + 1}`,
            restriction: 'safe-zone'
          };
          
          if (layerType === 'polygon' || layerType === 'rectangle') {
            const latLngs = (layer as L.Polygon).getLatLngs()[0] as L.LatLng[];
            boundary.coordinates = latLngs.map(ll => [ll.lat, ll.lng]);
            console.log('Polygon/Rectangle boundary coordinates:', boundary.coordinates);
          } else if (layerType === 'circle') {
            const circle = layer as L.Circle;
            const center = circle.getLatLng();
            const radius = circle.getRadius();
            boundary.coordinates = [[center.lat, center.lng, radius]];
            console.log('Circle boundary coordinates:', boundary.coordinates);
          }
          
          setBoundaries(prev => {
            const updated = [...prev, boundary];
            console.log('Boundary added, total boundaries:', updated.length);
            console.log('Boundaries array:', updated);
            return updated;
          });
          toast({ title: 'Boundary Added', description: `Added ${layerType} boundary. Click "Generate Waypoints" to create mission.` });
        });
        
        map.on(L.Draw.Event.EDITED, (e: any) => {
          toast({ title: 'Boundaries Updated', description: 'Boundary shapes have been updated' });
        });
        
        map.on(L.Draw.Event.DELETED, (e: any) => {
          const layers = e.layers;
          const layerIds: string[] = [];
          layers.eachLayer(() => {
            layerIds.push('layer');
          });
          
          // Remove corresponding boundaries from state
          setBoundaries(prev => {
            const updated = prev.slice(0, -layerIds.length);
            console.log('Boundaries deleted, remaining:', updated.length);
            return updated;
          });
          
          toast({ title: 'Boundaries Deleted', description: 'Selected boundaries have been removed' });
        });
      }
      
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentPosition({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => console.error('Error getting location:', error)
        );
      }
      
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
        }
        unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({ title: 'Map Error', description: 'Failed to initialize map', variant: 'destructive' });
    }
  }, [isDesignMode, mapProvider, centerLat, centerLng, zoomLevel, enableEditing, boundaryColor]);
  
  // Add waypoint function (defined before map click handler)
  const addWaypoint = useCallback((lat: number, lng: number) => {
    console.log('Adding waypoint at:', lat, lng);
    const newWaypoint: Waypoint = {
      id: Math.random().toString(36).substr(2, 9),
      lat,
      lng,
      altitude: config.defaultAltitude || 100,
      speed: config.defaultSpeed || 10,
      name: `WP${waypoints.length + 1}`,
      order: waypoints.length + 1
    };
    
    setWaypoints(prev => {
      const updated = [...prev, newWaypoint];
      console.log('Waypoints updated, new count:', updated.length);
      return updated;
    });
    
    toast({ title: 'Waypoint Added', description: `Added waypoint at ${lat.toFixed(4)}, ${lng.toFixed(4)}` });
    
    if (enableAutoSave) {
      // Schedule auto-save after state update
      setTimeout(() => {
        setWaypoints(current => {
          if (current.length > 0) {
            autoSaveMission(current);
          }
          return current;
        });
      }, 100);
    }
  }, [config.defaultAltitude, config.defaultSpeed, waypoints.length, enableAutoSave, toast]);
  
  // Handle map clicks for waypoint placement (separate effect to capture editMode changes)
  useEffect(() => {
    if (!mapRef.current || isDesignMode) return;
    
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      console.log('Map clicked, editMode:', editMode, 'enableEditing:', enableEditing);
      if (editMode === 'waypoint' && enableEditing) {
        addWaypoint(e.latlng.lat, e.latlng.lng);
      }
    };
    
    // Remove previous listener and add new one
    mapRef.current.off('click', handleMapClick);
    mapRef.current.on('click', handleMapClick);
    
    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
      }
    };
  }, [editMode, enableEditing, isDesignMode, addWaypoint]);
  
  // Update waypoints on map
  useEffect(() => {
    if (!waypointsLayerRef.current || !mapRef.current) return;
    
    console.log('Updating waypoints on map, count:', waypoints.length);
    waypointsLayerRef.current.clearLayers();
    
    waypoints.forEach((waypoint, index) => {
      // Create custom numbered icon
      const icon = L.divIcon({
        className: 'waypoint-marker',
        html: `
          <div style="
            background-color: ${waypointColor};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
          ">
            ${waypoint.order}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      
      const marker = L.marker([waypoint.lat, waypoint.lng], { icon, draggable: enableEditing })
        .addTo(waypointsLayerRef.current!);
      
      // Popup content
      let popupContent = `
        <div style="min-width: 200px;">
          <strong>${waypoint.name || `Waypoint ${waypoint.order}`}</strong><br/>
          Lat: ${waypoint.lat.toFixed(6)}<br/>
          Lng: ${waypoint.lng.toFixed(6)}
      `;
      
      if (showAltitude && waypoint.altitude) {
        popupContent += `<br/>Altitude: ${waypoint.altitude}m`;
      }
      if (waypoint.speed) {
        popupContent += `<br/>Speed: ${waypoint.speed} m/s`;
      }
      if (waypoint.action) {
        popupContent += `<br/>Action: ${waypoint.action}`;
      }
      if (waypoint.operations) {
        popupContent += `<br/>Operations: ${waypoint.operations.substring(0, 50)}${waypoint.operations.length > 50 ? '...' : ''}`;
      }
      
      popupContent += `<br/><small style="color: #888; cursor: pointer;" onclick="alert('Click waypoint to edit')">Click to edit</small></div>`;
      marker.bindPopup(popupContent);
      
      // Handle marker drag
      if (enableEditing) {
        marker.on('dragend', (e: any) => {
          const newLatLng = e.target.getLatLng();
          updateWaypoint(waypoint.id, { lat: newLatLng.lat, lng: newLatLng.lng });
        });
        
        marker.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e); // Prevent map click event
          setSelectedWaypoint(waypoint.id);
        });
      }
    });
    
    // Draw route line connecting waypoints
    if (routeLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    
    if (waypoints.length > 1) {
      const latLngs = waypoints
        .sort((a, b) => a.order - b.order)
        .map(wp => [wp.lat, wp.lng] as [number, number]);
      
      routeLayerRef.current = L.polyline(latLngs, {
        color: routeColor,
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 5'
      }).addTo(mapRef.current!);
      
      console.log('Route drawn with', waypoints.length, 'waypoints');
    }
  }, [waypoints, waypointColor, routeColor, enableEditing, showAltitude]);
  
  // Update waypoint
  const updateWaypoint = (id: string, updates: Partial<Waypoint>) => {
    setWaypoints(prev => prev.map(wp => wp.id === id ? { ...wp, ...updates } : wp));
    
    if (enableAutoSave) {
      const updated = waypoints.map(wp => wp.id === id ? { ...wp, ...updates } : wp);
      autoSaveMission(updated);
    }
  };
  
  // Remove waypoint
  const removeWaypoint = (id: string) => {
    setWaypoints(prev => {
      const filtered = prev.filter(wp => wp.id !== id);
      // Reorder remaining waypoints
      return filtered.map((wp, idx) => ({ ...wp, order: idx + 1 }));
    });
    
    if (selectedWaypoint === id) {
      setSelectedWaypoint(null);
    }
    
    toast({ title: 'Waypoint Removed', description: 'Waypoint has been deleted' });
  };
  
  // Clear all waypoints
  const clearWaypoints = () => {
    setWaypoints([]);
    setSelectedWaypoint(null);
    if (routeLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    toast({ title: 'Waypoints Cleared', description: 'All waypoints have been removed' });
  };
  
  // Save mission
  const saveMission = async () => {
    if (!productId || !deviceId) {
      toast({ title: 'Error', description: 'Product ID and Device ID required', variant: 'destructive' });
      return;
    }
    
    if (waypoints.length === 0) {
      toast({ title: 'Error', description: 'Add waypoints before saving', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    
    try {
      const missionData: Mission = {
        id: mission?.id || Math.random().toString(36).substr(2, 9),
        name: missionName || `Mission ${new Date().toLocaleString()}`,
        type: missionType,
        waypoints,
        boundaries,
        parameters: {
          defaultSpeed: config.defaultSpeed,
          defaultAltitude: config.defaultAltitude,
          returnToHome: config.returnToHome,
          loopMission: config.loopMission,
          overlapPercentage: config.overlapPercentage
        },
        created_at: mission?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('product_runtime_data')
        .insert({
          product_id: productId,
          device_id: deviceId,
          table_name: 'mission_plans',
          data_payload: missionData as any
        });
      
      if (error) throw error;
      
      setMission(missionData);
      toast({ title: 'Mission Saved', description: `Mission "${missionData.name}" saved successfully` });
      
      // Trigger value change event
      if (onValueChange) {
        onValueChange(missionData);
      }
    } catch (error) {
      console.error('Error saving mission:', error);
      toast({ title: 'Save Failed', description: 'Failed to save mission', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  // Auto-save mission
  const autoSaveMission = async (currentWaypoints: Waypoint[]) => {
    if (!enableAutoSave || !productId || !deviceId) return;
    
    try {
      const missionData: Mission = {
        id: mission?.id || Math.random().toString(36).substr(2, 9),
        name: missionName || 'Auto-saved Mission',
        type: missionType,
        waypoints: currentWaypoints,
        boundaries,
        parameters: {
          defaultSpeed: config.defaultSpeed,
          defaultAltitude: config.defaultAltitude
        },
        created_at: mission?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await supabase
        .from('product_runtime_data')
        .upsert({
          product_id: productId,
          device_id: deviceId,
          table_name: 'mission_plans',
          data_payload: missionData as any
        });
      
      setMission(missionData);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };
  
  // Load missions list
  const loadMissionsList = async () => {
    if (!productId) {
      toast({ title: 'Error', description: 'Product ID required', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    
    try {
      const query = supabase
        .from('product_runtime_data')
        .select('*')
        .eq('product_id', productId)
        .eq('table_name', 'mission_plans')
        .order('created_at', { ascending: false });
      
      // Filter by device ID if available
      if (deviceId) {
        query.eq('device_id', deviceId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const missions = data?.map(item => item.data_payload as unknown as Mission) || [];
      setSavedMissions(missions);
      setShowLoadDialog(true);
      
      if (missions.length === 0) {
        toast({ title: 'No Missions', description: 'No saved missions found for this product', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error loading missions list:', error);
      toast({ title: 'Load Failed', description: 'Failed to load missions list', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  // Load selected mission
  const loadSelectedMission = () => {
    const selected = savedMissions.find(m => m.id === selectedMissionId);
    if (!selected) return;
    
    setMission(selected);
    setWaypoints(selected.waypoints || []);
    setBoundaries(selected.boundaries || []);
    setMissionName(selected.name);
    setShowLoadDialog(false);
    
    toast({ title: 'Mission Loaded', description: `Loaded "${selected.name}" with ${selected.waypoints?.length || 0} waypoints` });
    
    // Fit map to waypoints if available
    if (selected.waypoints && selected.waypoints.length > 0 && mapRef.current) {
      setTimeout(() => fitToWaypoints(), 500);
    }
  };
  
  // Send mission to device via WebSocket
  const sendMissionToDevice = () => {
    if (!deviceId) {
      toast({ title: 'Error', description: 'Device ID required', variant: 'destructive' });
      return;
    }
    
    if (waypoints.length === 0) {
      toast({ title: 'Error', description: 'No waypoints to send', variant: 'destructive' });
      return;
    }
    
    if (!wsConnected) {
      toast({ title: 'Not Connected', description: 'WebSocket connection not established', variant: 'destructive' });
      return;
    }
    
    const missionData: Mission = {
      id: mission?.id || Math.random().toString(36).substr(2, 9),
      name: missionName || 'Mission ' + new Date().toLocaleString(),
      type: missionType,
      waypoints,
      boundaries,
      parameters: {
        defaultSpeed: config.defaultSpeed,
        defaultAltitude: config.defaultAltitude,
        returnToHome: config.returnToHome,
        loopMission: config.loopMission
      },
      created_at: mission?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const success = deviceWebSocketService.sendMessage({
      type: 'mission_upload',
      targetId: deviceId,
      payload: {
        mission: missionData,
        action: 'upload',
        timestamp: new Date().toISOString()
      }
    });
    
    if (success) {
      toast({ 
        title: 'Mission Sent', 
        description: `Mission "${missionData.name}" sent to device with ${waypoints.length} waypoints` 
      });
      setShowSendDialog(false);
    } else {
      toast({ 
        title: 'Send Failed', 
        description: 'Failed to send mission to device', 
        variant: 'destructive' 
      });
    }
  };
  
  // Export mission to JSON
  const exportMission = () => {
    if (waypoints.length === 0) {
      toast({ title: 'Error', description: 'No waypoints to export', variant: 'destructive' });
      return;
    }
    
    const missionData: Mission = {
      id: mission?.id || 'exported-mission',
      name: missionName || 'Exported Mission',
      type: missionType,
      waypoints,
      boundaries,
      parameters: {
        defaultSpeed: config.defaultSpeed,
        defaultAltitude: config.defaultAltitude,
        returnToHome: config.returnToHome,
        loopMission: config.loopMission
      },
      created_at: mission?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(missionData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mission_${missionData.name.replace(/\s+/g, '_')}_${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({ title: 'Mission Exported', description: 'Mission downloaded as JSON file' });
  };
  
  // Import mission from JSON
  const importMission = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as Mission;
        setMission(imported);
        setWaypoints(imported.waypoints || []);
        setBoundaries(imported.boundaries || []);
        setMissionName(imported.name);
        toast({ title: 'Mission Imported', description: `Imported "${imported.name}"` });
      } catch (error) {
        console.error('Import error:', error);
        toast({ title: 'Import Failed', description: 'Invalid mission file', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
  };
  
  // Toggle edit mode
  const toggleEditMode = (mode: 'waypoint' | 'boundary' | 'route' | null) => {
    const newMode = editMode === mode ? null : mode;
    setEditMode(newMode);
    console.log('Edit mode changed to:', newMode);
  };
  
  // Generate waypoints from boundary (for area mapping missions)
  const openGenerateDialog = () => {
    if (boundaries.length === 0) {
      toast({ title: 'No Boundary', description: 'Draw a boundary first to generate waypoints', variant: 'destructive' });
      return;
    }
    setShowGenerateDialog(true);
  };

  const generateWaypointsFromBoundary = () => {
    if (boundaries.length === 0) return;
    
    const boundary = boundaries[0]; // Use first boundary
    const { spacing, pattern, direction, altitude, speed, operations } = generationSettings;
    
    // Simple grid pattern generation for rectangular areas
    if (boundary.type === 'rectangle' || boundary.type === 'polygon') {
      const coords = boundary.coordinates;
      if (coords.length < 3) return;
      
      // Find bounding box
      const lats = coords.map(c => c[0]);
      const lngs = coords.map(c => c[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const newWaypoints: Waypoint[] = [];
      let order = 1;
      
      // Generate pattern based on selection
      if (pattern === 'grid') {
        // Simple grid pattern
        for (let lat = minLat; lat <= maxLat; lat += spacing) {
          for (let lng = minLng; lng <= maxLng; lng += spacing) {
            newWaypoints.push({
              id: Math.random().toString(36).substr(2, 9),
              lat,
              lng,
              altitude,
              speed,
              name: `WP${order}`,
              order: order++,
              operations
            });
          }
        }
      } else if (pattern === 'serpentine') {
        // Serpentine/lawn mower pattern
        let latIndex = 0;
        for (let lat = minLat; lat <= maxLat; lat += spacing) {
          const lngValues: number[] = [];
          for (let lng = minLng; lng <= maxLng; lng += spacing) {
            lngValues.push(lng);
          }
          
          // Reverse every other row for serpentine pattern
          if (latIndex % 2 === 1) {
            lngValues.reverse();
          }
          
          lngValues.forEach(lng => {
            newWaypoints.push({
              id: Math.random().toString(36).substr(2, 9),
              lat,
              lng,
              altitude,
              speed,
              name: `WP${order}`,
              order: order++,
              operations
            });
          });
          
          latIndex++;
        }
      } else if (pattern === 'spiral') {
        // Spiral pattern from outside to center
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        let currentLat = minLat;
        let currentLng = minLng;
        let layer = 0;
        
        // Simple spiral approximation
        const numLayers = Math.min(
          Math.ceil((maxLat - minLat) / (2 * spacing)),
          Math.ceil((maxLng - minLng) / (2 * spacing))
        );
        
        for (let l = 0; l < numLayers; l++) {
          // Top edge
          for (let lng = minLng + l * spacing; lng <= maxLng - l * spacing; lng += spacing) {
            newWaypoints.push({
              id: Math.random().toString(36).substr(2, 9),
              lat: minLat + l * spacing,
              lng,
              altitude,
              speed,
              name: `WP${order}`,
              order: order++,
              operations
            });
          }
        }
      }
      
      setWaypoints(newWaypoints);
      setShowGenerateDialog(false);
      toast({ 
        title: 'Waypoints Generated', 
        description: `Created ${newWaypoints.length} waypoints with ${pattern} pattern` 
      });
    } else if (boundary.type === 'circle') {
      // For circular boundaries, generate concentric circles or spiral
      const [centerLat, centerLng, radius] = boundary.coordinates[0];
      const newWaypoints: Waypoint[] = [];
      let order = 1;
      
      // Add center point
      newWaypoints.push({
        id: Math.random().toString(36).substr(2, 9),
        lat: centerLat,
        lng: centerLng,
        altitude,
        speed,
        name: `WP${order}`,
        order: order++,
        operations
      });
      
      // Add circular layers
      const numRings = Math.ceil(radius / (spacing * 111320)); // Convert to meters
      for (let ring = 1; ring <= numRings; ring++) {
        const ringRadius = (radius / numRings) * ring;
        const circumference = 2 * Math.PI * ringRadius;
        const numPoints = Math.max(8, Math.ceil(circumference / (spacing * 111320)));
        
        for (let i = 0; i < numPoints; i++) {
          const angle = (2 * Math.PI * i) / numPoints;
          const lat = centerLat + (ringRadius / 111320) * Math.cos(angle);
          const lng = centerLng + (ringRadius / (111320 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);
          
          newWaypoints.push({
            id: Math.random().toString(36).substr(2, 9),
            lat,
            lng,
            altitude,
            speed,
            name: `WP${order}`,
            order: order++,
            operations
          });
        }
      }
      
      setWaypoints(newWaypoints);
      setShowGenerateDialog(false);
      toast({ 
        title: 'Waypoints Generated', 
        description: `Created ${newWaypoints.length} waypoints from circular boundary` 
      });
    }
  };
  
  // Center map on current location
  const centerOnLocation = () => {
    if (currentPosition && mapRef.current) {
      mapRef.current.setView([currentPosition.lat, currentPosition.lng], 15);
    }
  };
  
  // Fit map to waypoints
  const fitToWaypoints = () => {
    if (waypoints.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(waypoints.map(wp => [wp.lat, wp.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };
  
  // Design mode preview
  if (isDesignMode) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <CardContent className="text-center py-8">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium">Mission Planning Map</p>
          <p className="text-xs text-muted-foreground mt-2">
            {missionType.charAt(0).toUpperCase() + missionType.slice(1)} Mission
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const cssStyle: React.CSSProperties = {
    width: widget.size?.width || 600,
    height: widget.size?.height || 500,
    opacity: style?.opacity,
    visibility: style?.visibility as any,
    zIndex: style?.zIndex
  };
  
  return (
    <Card style={cssStyle} className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            {widget.title || 'Mission Planning'}
          </div>
          <div className="flex items-center gap-3">
            {boundaries.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {boundaries.length} boundar{boundaries.length !== 1 ? 'ies' : 'y'}
              </span>
            )}
            {showCoordinates && waypoints.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {waypoints.length} waypoint{waypoints.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Toolbar */}
        {showToolbar && enableEditing && (
          <div className="px-4 py-2 border-b flex gap-2 flex-wrap bg-muted/30">
            <Button
              size="sm"
              variant={editMode === 'waypoint' ? 'default' : 'outline'}
              onClick={() => toggleEditMode('waypoint')}
            >
              <MapPin className="w-4 h-4 mr-1" />
              Add Waypoint
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={clearWaypoints}
              disabled={waypoints.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={fitToWaypoints}
              disabled={waypoints.length === 0}
            >
              <Move className="w-4 h-4 mr-1" />
              Fit
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={centerOnLocation}
              disabled={!currentPosition}
            >
              <Navigation className="w-4 h-4 mr-1" />
              My Location
            </Button>
            
            {/* Debug: Show boundary count */}
            <Button
              size="sm"
              variant="outline"
              disabled
            >
              Boundaries: {boundaries.length}
            </Button>
            
            {/* Generate Waypoints Button - shows when boundaries exist */}
            {boundaries.length > 0 && (
              <Button
                size="sm"
                variant="default"
                onClick={openGenerateDialog}
                className="bg-green-600 hover:bg-green-700"
              >
                <Grid3x3 className="w-4 h-4 mr-1" />
                Generate Waypoints
              </Button>
            )}
            
            <div className="flex-1" />
            
            <Button
              size="sm"
              variant="outline"
              onClick={loadMissionsList}
              disabled={loading}
            >
              <Upload className="w-4 h-4 mr-1" />
              Load
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={saveMission}
              disabled={loading || waypoints.length === 0}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            
            <Button
              size="sm"
              variant="default"
              onClick={() => setShowSendDialog(true)}
              disabled={loading || waypoints.length === 0 || !wsConnected}
              className="bg-blue-600 hover:bg-blue-700"
              title={!wsConnected ? 'WebSocket not connected' : 'Send mission to device'}
            >
              <Send className="w-4 h-4 mr-1" />
              Send to Device
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={exportMission}
              disabled={waypoints.length === 0}
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            
            <label className="cursor-pointer">
              <Button size="sm" variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-1" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={importMission}
              />
            </label>
          </div>
        )}
        
        {/* Map Container */}
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: showToolbar ? 'calc(100% - 60px)' : '100%',
            minHeight: '400px'
          }}
        />
        
        {/* Status Bar */}
        {showCoordinates && (
          <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
            {editMode === 'waypoint' && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Click on map to add waypoints
              </span>
            )}
            {editMode === null && waypoints.length > 0 && (
              <span>
                Mission type: {missionType} | Distance: ~
                {waypoints.length > 1
                  ? Math.round(
                      waypoints.reduce((total, wp, i) => {
                        if (i === 0) return 0;
                        const prev = waypoints[i - 1];
                        return (
                          total +
                          mapRef.current?.distance([prev.lat, prev.lng], [wp.lat, wp.lng]) || 0
                        );
                      }, 0)
                    )
                  : 0}
                m
              </span>
            )}
            {waypoints.length === 0 && (
              <span className="text-muted-foreground/60">No waypoints added yet</span>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Waypoint Generation Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Waypoints from Boundary</DialogTitle>
            <DialogDescription>
              Configure waypoint generation pattern and density for area coverage.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pattern Type</Label>
              <Select
                value={generationSettings.pattern}
                onValueChange={(value: 'grid' | 'serpentine' | 'spiral') =>
                  setGenerationSettings({ ...generationSettings, pattern: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid (Row by Row)</SelectItem>
                  <SelectItem value="serpentine">Serpentine (Lawn Mower)</SelectItem>
                  <SelectItem value="spiral">Spiral (Outside-In)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {generationSettings.pattern === 'grid' && 'Simple grid pattern with rows and columns'}
                {generationSettings.pattern === 'serpentine' && 'Efficient back-and-forth pattern minimizing turns'}
                {generationSettings.pattern === 'spiral' && 'Spiral pattern from perimeter to center'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Spacing (degrees)</Label>
              <Input
                type="number"
                step="0.0001"
                value={generationSettings.spacing}
                onChange={(e) =>
                  setGenerationSettings({ ...generationSettings, spacing: parseFloat(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">
                Distance between waypoints (~{Math.round(generationSettings.spacing * 111320)}m)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Pattern Direction (degrees)</Label>
              <Input
                type="number"
                min="0"
                max="360"
                value={generationSettings.direction}
                onChange={(e) =>
                  setGenerationSettings({ ...generationSettings, direction: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">
                Rotation angle of the pattern (0° = North)
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Altitude (m)</Label>
                <Input
                  type="number"
                  value={generationSettings.altitude}
                  onChange={(e) =>
                    setGenerationSettings({ ...generationSettings, altitude: parseFloat(e.target.value) })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label>Speed (m/s)</Label>
                <Input
                  type="number"
                  value={generationSettings.speed}
                  onChange={(e) =>
                    setGenerationSettings({ ...generationSettings, speed: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Operations (Optional)</Label>
              <Textarea
                placeholder="Enter operations to perform at each waypoint (e.g., take photo, collect sample)"
                value={generationSettings.operations}
                onChange={(e) =>
                  setGenerationSettings({ ...generationSettings, operations: e.target.value })
                }
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                These operations will be assigned to all generated waypoints
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={generateWaypointsFromBoundary}>
              Generate Waypoints
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Waypoint Editor Dialog */}
      {selectedWaypoint && (() => {
        const waypoint = waypoints.find(wp => wp.id === selectedWaypoint);
        if (!waypoint) return null;
        
        return (
          <Dialog open={!!selectedWaypoint} onOpenChange={() => setSelectedWaypoint(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Waypoint: {waypoint.name}</DialogTitle>
                <DialogDescription>
                  Modify waypoint properties and operations.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={waypoint.name || ''}
                    onChange={(e) => {
                      setWaypoints(prev =>
                        prev.map(wp =>
                          wp.id === selectedWaypoint ? { ...wp, name: e.target.value } : wp
                        )
                      );
                    }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={waypoint.lat}
                      onChange={(e) => {
                        setWaypoints(prev =>
                          prev.map(wp =>
                            wp.id === selectedWaypoint ? { ...wp, lat: parseFloat(e.target.value) } : wp
                          )
                        );
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={waypoint.lng}
                      onChange={(e) => {
                        setWaypoints(prev =>
                          prev.map(wp =>
                            wp.id === selectedWaypoint ? { ...wp, lng: parseFloat(e.target.value) } : wp
                          )
                        );
                      }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Altitude (m)</Label>
                    <Input
                      type="number"
                      value={waypoint.altitude || 0}
                      onChange={(e) => {
                        setWaypoints(prev =>
                          prev.map(wp =>
                            wp.id === selectedWaypoint ? { ...wp, altitude: parseFloat(e.target.value) } : wp
                          )
                        );
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Speed (m/s)</Label>
                    <Input
                      type="number"
                      value={waypoint.speed || 0}
                      onChange={(e) => {
                        setWaypoints(prev =>
                          prev.map(wp =>
                            wp.id === selectedWaypoint ? { ...wp, speed: parseFloat(e.target.value) } : wp
                          )
                        );
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Operations</Label>
                  <Textarea
                    placeholder="Enter operations to perform at this waypoint"
                    value={waypoint.operations || ''}
                    onChange={(e) => {
                      setWaypoints(prev =>
                        prev.map(wp =>
                          wp.id === selectedWaypoint ? { ...wp, operations: e.target.value } : wp
                        )
                      );
                    }}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Custom actions to execute at this location
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <Select
                    value={waypoint.action || 'none'}
                    onValueChange={(value) => {
                      setWaypoints(prev =>
                        prev.map(wp =>
                          wp.id === selectedWaypoint ? { ...wp, action: value } : wp
                        )
                      );
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="photo">Take Photo</SelectItem>
                      <SelectItem value="video">Record Video</SelectItem>
                      <SelectItem value="scan">Scan Area</SelectItem>
                      <SelectItem value="collect">Collect Sample</SelectItem>
                      <SelectItem value="measure">Take Measurement</SelectItem>
                      <SelectItem value="hover">Hover</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {waypoint.action && waypoint.action !== 'none' && (
                  <div className="space-y-2">
                    <Label>Dwell Time (seconds)</Label>
                    <Input
                      type="number"
                      value={waypoint.dwellTime || 0}
                      onChange={(e) => {
                        setWaypoints(prev =>
                          prev.map(wp =>
                            wp.id === selectedWaypoint ? { ...wp, dwellTime: parseFloat(e.target.value) } : wp
                          )
                        );
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Time to spend at this waypoint performing the action
                    </p>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setWaypoints(prev => prev.filter(wp => wp.id !== selectedWaypoint));
                    setSelectedWaypoint(null);
                  }}
                >
                  Delete Waypoint
                </Button>
                <Button onClick={() => setSelectedWaypoint(null)}>
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
      
      {/* Load Mission Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Load Saved Mission</DialogTitle>
            <DialogDescription>
              Select a previously saved mission to load onto the map.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {savedMissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No saved missions found</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Available Missions</Label>
                <Select value={selectedMissionId || ''} onValueChange={setSelectedMissionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mission" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedMissions.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} ({m.waypoints?.length || 0} waypoints, {new Date(m.created_at).toLocaleDateString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedMissionId && (() => {
                  const selected = savedMissions.find(m => m.id === selectedMissionId);
                  if (!selected) return null;
                  
                  return (
                    <div className="mt-4 p-4 bg-muted rounded-md space-y-2">
                      <h4 className="font-semibold">{selected.name}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Type: {selected.type}</p>
                        <p>Waypoints: {selected.waypoints?.length || 0}</p>
                        <p>Boundaries: {selected.boundaries?.length || 0}</p>
                        <p>Created: {new Date(selected.created_at).toLocaleString()}</p>
                        {selected.parameters && (
                          <>
                            <p>Altitude: {selected.parameters.defaultAltitude}m</p>
                            <p>Speed: {selected.parameters.defaultSpeed}m/s</p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={loadSelectedMission}
              disabled={!selectedMissionId}
            >
              Load Mission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Send to Device Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Mission to Device</DialogTitle>
            <DialogDescription>
              Transmit the current mission to the connected device via WebSocket.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-md space-y-2">
              <h4 className="font-semibold">{missionName || 'Current Mission'}</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Type: {missionType}</p>
                <p>Waypoints: {waypoints.length}</p>
                <p>Boundaries: {boundaries.length}</p>
                {config.defaultAltitude && <p>Altitude: {config.defaultAltitude}m</p>}
                {config.defaultSpeed && <p>Speed: {config.defaultSpeed}m/s</p>}
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-md" style={{ backgroundColor: wsConnected ? '#dcfce7' : '#fee2e2' }}>
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                {wsConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
              </span>
            </div>
            
            {deviceId && (
              <div className="text-sm text-muted-foreground">
                <p><strong>Target Device:</strong> {deviceId}</p>
              </div>
            )}
            
            {!wsConnected && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ WebSocket is not connected. Please ensure the device is online before sending the mission.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={sendMissionToDevice}
              disabled={!wsConnected || waypoints.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Mission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
