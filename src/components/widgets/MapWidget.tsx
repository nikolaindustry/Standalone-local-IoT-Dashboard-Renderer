import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Add polyline decorator for arrows
import 'leaflet-polylinedecorator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, RefreshCw, Database, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Error Boundary Component
class MapWidgetErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('MapWidgetErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MapWidgetErrorBoundary error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center text-destructive p-4">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Map Widget Error</p>
            <p className="text-xs mt-1">{this.state.error?.message || 'Failed to render map widget'}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface MapWidgetProps {
  title: string;
  productId?: string;
  deviceId?: string;
  tableName?: string;
  latitudeColumn?: string;
  longitudeColumn?: string;
  refreshInterval?: number;
  style?: React.CSSProperties;
  isDesignMode?: boolean;
  // Map customization props
  mapProvider?: 'openstreetmap' | 'esri' | 'carto';
  defaultCenterLat?: number;
  defaultCenterLng?: number;
  defaultZoom?: number;
  showMarker?: boolean;
  markerColor?: string;
  markerType?: 'car' | 'bike' | 'robot' | 'tractor' | 'cow' | 'person' | 'drone' | 'boat' | 'plane' | 'default';
  mapShape?: 'rectangle' | 'circle' | 'roundedRectangle' | 'ellipse' | 'customPolygon';
  mapShapeSides?: number;
  showControls?: boolean;
  showContainer?: boolean;
  // Path/line customization props
  showPath?: boolean;
  pathColor?: string;
  showArrows?: boolean;
  arrowColor?: string;
  indexColumn?: string;
  // User location
  showUserLocation?: boolean;
  // Pin descriptions
  showPinDescriptions?: boolean;
  alwaysShowPinDescriptions?: boolean;
  pinTitleColumn?: string;
  pinDescriptionColumn?: string;
}

interface MapDataPoint {
  id: string;
  latitude: number;
  longitude: number;
  created_at: string;
  [key: string]: any; // This will allow index and other fields
}

// Add a more specific interface for our data points
interface IndexedMapDataPoint extends MapDataPoint {
  [indexColumn: string]: string | number | any;
}

export const MapWidget: React.FC<MapWidgetProps> = ({
  title,
  productId,
  deviceId,
  tableName,
  latitudeColumn = 'latitude',
  longitudeColumn = 'longitude',
  refreshInterval = 5000,
  style,
  isDesignMode = false,
  // Map customization props with defaults
  mapProvider = 'openstreetmap',
  defaultCenterLat = 40.7128,
  defaultCenterLng = -74.0060,
  defaultZoom = 13,
  showMarker = true,
  markerColor = '#ff0000',
  markerType = 'default',
  mapShape = 'rectangle',
  mapShapeSides = 6,
  showControls = true,
  showContainer = true,
  // Path/line customization props with defaults - MATCH UI DEFAULTS
  showPath = true,  // Changed from false to true to match UI default
  pathColor = '#3b82f6',
  showArrows = true,
  arrowColor = '#3b82f6',
  indexColumn = 'index',
  // User location
  showUserLocation = false,
  // Pin descriptions
  showPinDescriptions = false,
  alwaysShowPinDescriptions = false,
  pinTitleColumn = 'title',
  pinDescriptionColumn = 'description'
}) => {
  const [data, setData] = useState<MapDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const markersRef = React.useRef<L.LayerGroup | null>(null);
  const pathRef = React.useRef<L.Polyline | null>(null);
  const arrowsRef = React.useRef<L.PolylineDecorator | null>(null);
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const userLocationMarkerRef = React.useRef<L.Marker | null>(null);

  // Log props for debugging
  useEffect(() => {
    console.log('MapWidget props:', {
      productId,
      tableName,
      latitudeColumn,
      longitudeColumn,
      refreshInterval,
      isDesignMode,
      showPath,
      pathColor,
      showArrows,
      arrowColor,
      indexColumn,
      showUserLocation
    });
  }, [productId, tableName, latitudeColumn, longitudeColumn, refreshInterval, isDesignMode, showPath, pathColor, showArrows, arrowColor, indexColumn, showUserLocation]);

  // Function to get user's current location
  const getUserLocation = () => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Function to get map shape styles
  const getMapShapeStyles = (shape: 'rectangle' | 'circle' | 'roundedRectangle' | 'ellipse' | 'customPolygon' = 'rectangle', sides: number = 6) => {
    const baseStyles: React.CSSProperties = {
      overflow: 'hidden',
      position: 'relative'
    };

    switch (shape) {
      case 'circle':
        return {
          ...baseStyles,
          borderRadius: '50%',
          clipPath: 'circle(50% at 50% 50%)'
        };
      case 'roundedRectangle':
        return {
          ...baseStyles,
          borderRadius: '15px'
        };
      case 'ellipse':
        return {
          ...baseStyles,
          borderRadius: '50%',
          clipPath: 'ellipse(50% 40% at 50% 50%)'
        };
      case 'customPolygon':
        // Create a polygon clip-path with the specified number of sides
        if (sides < 3) sides = 3;
        if (sides > 20) sides = 20;
        
        // Calculate points for a regular polygon
        const points = [];
        const centerX = 50;
        const centerY = 50;
        const radius = 50;
        
        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
        }
        
        return {
          ...baseStyles,
          clipPath: `polygon(${points.join(', ')})`
        };
      default: // rectangle
        return {
          ...baseStyles,
          borderRadius: '0px'
        };
    }
  };

  // Function to create custom marker icon based on type
  const createCustomMarkerIcon = (color: string, type: 'car' | 'bike' | 'robot' | 'tractor' | 'cow' | 'person' | 'drone' | 'boat' | 'plane' | 'default' = 'default') => {
    // Use emoji or SVG icons for different types
    let iconHtml = '';
    let iconSize = [32, 32];
    let iconAnchor = [16, 16];
    
    switch (type) {
      case 'car':
        iconHtml = `<div style="font-size: 24px; text-align: center;">🚗</div>`;
        break;
      case 'bike':
        iconHtml = `<div style="font-size: 24px; text-align: center;">🚲</div>`;
        break;
      case 'robot':
        iconHtml = `<div style="font-size: 24px; text-align: center;">🤖</div>`;
        break;
      case 'tractor':
        iconHtml = `<div style="font-size: 24px; text-align: center;">🚜</div>`;
        break;
      case 'cow':
        iconHtml = `<div style="font-size: 24px; text-align: center;">🐄</div>`;
        break;
      case 'person':
        iconHtml = `<div style="font-size: 24px; text-align: center;">👤</div>`;
        break;
      case 'drone':
        iconHtml = `<div style="font-size: 24px; text-align: center;">🛸</div>`;
        break;
      case 'boat':
        iconHtml = `<div style="font-size: 24px; text-align: center;">🚤</div>`;
        break;
      case 'plane':
        iconHtml = `<div style="font-size: 24px; text-align: center;">✈️</div>`;
        break;
      default:
        // Default marker - use a circle
        iconHtml = `<div style="width: 24px; height: 24px; background-color: ${color}; border-radius: 50%; border: 2px solid white;"></div>`;
    }
    
    return L.divIcon({
      className: 'custom-type-marker',
      html: iconHtml,
      iconSize: iconSize,
      iconAnchor: iconAnchor,
      popupAnchor: [0, -iconSize[1] / 2]
    });
  };

  // Function to add or update user location marker
  const updateUserLocationMarker = () => {
    if (!mapRef.current || !showUserLocation) return;

    getUserLocation()
      .then((location) => {
        // If user location marker already exists, update its position
        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.setLatLng([location.lat, location.lng]);
        } else {
          // Create user location marker
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `<div style="background-color: #4ade80; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });
          
          const userMarker = L.marker([location.lat, location.lng], {
            icon: userIcon
          }).addTo(mapRef.current!);
          
          userLocationMarkerRef.current = userMarker;
        }
      })
      .catch((error) => {
        console.error('Error getting user location:', error);
      });
  };

  const fetchMapData = async () => {
    // Use the new data source configuration
    if (!productId || !tableName || isDesignMode) {
      console.log('Skipping data fetch - missing required props or in design mode');
      return;
    }

    console.log('Fetching map data for:', { productId, tableName, deviceId, latitudeColumn, longitudeColumn });
    
    setLoading(true);
    setError(null);

    try {
      // Check if supabase client is available
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      let query = supabase
        .from('product_runtime_data')
        .select('*')
        .eq('product_id', productId)
        .eq('table_name', tableName);

      // Filter by device ID if provided
      if (deviceId) {
        query = query.eq('device_id', deviceId);
      }

      const { data: tableData, error: fetchError } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) {
        console.error('Error fetching map data:', fetchError);
        throw fetchError;
      }

      console.log('Raw data from database:', tableData?.length, tableData?.[0]);

      if (tableData && tableData.length > 0) {
        console.log('Fetched raw data points:', tableData.length, tableData[0]);
        // Transform data for display - extract latitude and longitude from data_payload
        const transformedData = tableData
          .map(row => {
            const payload = row.data_payload as Record<string, any> || {};
            console.log('Processing payload:', payload, 'Looking for columns:', latitudeColumn, longitudeColumn, indexColumn);
            
            // Extract and convert latitude/longitude values
            let latValue = payload[latitudeColumn];
            let lngValue = payload[longitudeColumn];
            let indexValue = payload[indexColumn]; // Extract index value
            
            console.log('Raw values:', { latValue, lngValue, indexValue });
            
            // Convert to numbers if they're strings
            let lat, lng, index;
            if (typeof latValue === 'string') {
              lat = parseFloat(latValue);
            } else if (typeof latValue === 'number') {
              lat = latValue;
            } else {
              lat = NaN;
            }
            
            if (typeof lngValue === 'string') {
              lng = parseFloat(lngValue);
            } else if (typeof lngValue === 'number') {
              lng = lngValue;
            } else {
              lng = NaN;
            }
            
            // Handle index value (can be string or number)
            if (indexValue !== undefined && indexValue !== null) {
              if (typeof indexValue === 'string') {
                index = indexValue; // Keep as string, will be converted during sorting
              } else if (typeof indexValue === 'number') {
                index = indexValue;
              } else {
                index = String(indexValue); // Convert to string as fallback
              }
            }
            
            // Log the extracted values
            console.log('Converted values:', { 
              lat, 
              lng, 
              index,
              latValid: !isNaN(lat), 
              lngValid: !isNaN(lng)
            });
            
            // Only include points with valid coordinates
            if (!isNaN(lat) && !isNaN(lng)) {
              return {
                id: row.id,
                created_at: new Date(row.created_at).toLocaleString(),
                latitude: lat,
                longitude: lng,
                ...(index !== undefined ? { [indexColumn]: index } : {}), // Include index if it exists
                ...payload
              };
            }
            console.log('Skipping point due to invalid coordinates:', lat, lng);
            return null;
          })
          .filter(point => point !== null) as MapDataPoint[];

        console.log('Transformed data points:', transformedData.length, transformedData[0]);
        setData(transformedData);
      } else {
        console.log('No data found for table');
        setData([]);
      }
    } catch (err) {
      console.error('Error fetching map data:', err);
      setError('Failed to load map data: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) {
      console.log('Map container not available yet');
      return;
    }

    console.log('Initializing map with container:', mapContainerRef.current);
    console.log('Map container dimensions:', {
      offsetWidth: mapContainerRef.current.offsetWidth,
      offsetHeight: mapContainerRef.current.offsetHeight,
      clientWidth: mapContainerRef.current.clientWidth,
      clientHeight: mapContainerRef.current.clientHeight
    });
    
    // Check if container has valid dimensions
    if (mapContainerRef.current.offsetWidth === 0 || mapContainerRef.current.offsetHeight === 0) {
      console.warn('Map container has zero dimensions - map may not display properly');
    }
    
    try {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [defaultCenterLat, defaultCenterLng],
        zoom: defaultZoom,
        attributionControl: false
      });

      mapRef.current = map;
      console.log('Map created successfully');

      // Add tile layers based on provider
      let tileLayer;
      switch (mapProvider) {
        case 'esri':
          tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles © Esri'
          });
          break;
        case 'carto':
          tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© CartoDB'
          });
          break;
        default: // openstreetmap
          tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          });
          break;
      }
      
      tileLayer.addTo(map);
      console.log('Tile layer added successfully');

      // Add navigation controls
      if (showControls && !isDesignMode) {
        const zoomControl = L.control.zoom({
          position: 'topright'
        });
        zoomControl.addTo(map);
        console.log('Zoom controls added successfully');
      }

      // Add layer group for markers
      markersRef.current = L.layerGroup().addTo(map);
      console.log('Markers layer group created successfully');

      // Add user location marker if enabled
      if (showUserLocation) {
        updateUserLocationMarker();
      }

      // Clean up
      return () => {
        if (mapRef.current) {
          console.log('Cleaning up map');
          mapRef.current.remove();
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map: ' + (error as Error).message);
    }
  }, [mapProvider, defaultCenterLat, defaultCenterLng, defaultZoom, showControls, isDesignMode, showUserLocation]);

  // Update markers when data changes
  useEffect(() => {
    if (!markersRef.current || !mapRef.current) {
      console.log('Markers or map not available yet', { 
        markersAvailable: !!markersRef.current, 
        mapAvailable: !!mapRef.current 
      });
      return;
    }

    console.log('Updating markers with data:', data.length, data[0]);
    
    try {
      // Clear existing markers
      markersRef.current.clearLayers();
      console.log('Cleared existing markers');
      
      // Clear existing path and arrows
      if (pathRef.current) {
        mapRef.current.removeLayer(pathRef.current);
        pathRef.current = null;
      }
      if (arrowsRef.current) {
        mapRef.current.removeLayer(arrowsRef.current);
        arrowsRef.current = null;
      }

      // Check if we have any data
      if (data.length === 0) {
        console.log('No data points to display');
        return;
      }

      // Add new markers
      let validMarkers = 0;
      data.forEach((point, index) => {
        console.log(`Processing point ${index}:`, point);
        if (showMarker) {
          // Validate coordinates
          const lat = typeof point.latitude === 'number' ? point.latitude : parseFloat(point.latitude);
          const lng = typeof point.longitude === 'number' ? point.longitude : parseFloat(point.longitude);
          
          if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Invalid coordinates for point ${index}:`, point.latitude, point.longitude);
            return;
          }
          
          // Check if coordinates are within valid ranges
          if (lat < -90 || lat > 90) {
            console.warn(`Invalid latitude for point ${index}:`, lat);
            return;
          }
          
          if (lng < -180 || lng > 180) {
            console.warn(`Invalid longitude for point ${index}:`, lng);
            return;
          }
          
          console.log('Creating marker at:', [lat, lng]);
          const marker = L.marker([lat, lng], {
            icon: createCustomMarkerIcon(markerColor, markerType)
          }).addTo(markersRef.current!);
          
          // Add popup with data information
          let popupContent = `<div>`;
          
          // If pin descriptions are enabled, use title and description from data
          if (showPinDescriptions) {
            const title = point[pinTitleColumn];
            const description = point[pinDescriptionColumn];
            
            if (title) {
              popupContent += `<strong>${title}</strong>`;
            } else {
              popupContent += `<strong>Location Data</strong>`;
            }
            
            if (description) {
              popupContent += `<br/>${description}`;
            }
            
            // Always show coordinates
            popupContent += `<br/>Latitude: ${lat.toFixed(6)}`;
            popupContent += `<br/>Longitude: ${lng.toFixed(6)}`;
          } else {
            // Default behavior - show all data
            popupContent += `
              <strong>Location Data</strong>
              <br/>Time: ${point.created_at}
              <br/>Latitude: ${lat.toFixed(6)}
              <br/>Longitude: ${lng.toFixed(6)}
              ${Object.keys(point)
                .filter(key => key !== 'id' && key !== 'created_at' && key !== 'latitude' && key !== 'longitude')
                .map(key => `<br/>${key}: ${point[key]}`)
                .join('')}
            `;
          }
          
          popupContent += `</div>`;
          marker.bindPopup(popupContent);
          
          // If always show pin descriptions is enabled, add a permanent tooltip
          if (showPinDescriptions && alwaysShowPinDescriptions) {
            const title = point[pinTitleColumn];
            const description = point[pinDescriptionColumn];
            
            let tooltipContent = '';
            if (title) {
              tooltipContent += `<strong>${title}</strong>`;
            }
            if (description) {
              if (title) tooltipContent += '<br>';
              tooltipContent += `${description}`;
            }
            
            // If no title or description, show coordinates
            if (!title && !description) {
              tooltipContent += `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
            }
            
            marker.bindTooltip(tooltipContent, {
              permanent: true,
              direction: 'top',
              offset: [0, -10]
            });
          }
          
          console.log('Marker created successfully');
          validMarkers++;
        }
      });

      console.log(`Processed ${validMarkers} valid markers out of ${data.length} data points`);
      console.log('Path drawing check:', { showPath, validMarkers, hasEnoughMarkers: validMarkers > 1 });

      // Draw path and arrows if enabled and we have enough points
      if (showPath && validMarkers > 1) {
        console.log('Drawing path with data:', data.length, 'points');
        
        // Sort data points by index column if it exists
        const sortedData = [...data].filter(point => {
          const lat = typeof point.latitude === 'number' ? point.latitude : parseFloat(point.latitude);
          const lng = typeof point.longitude === 'number' ? point.longitude : parseFloat(point.longitude);
          return !isNaN(lat) && !isNaN(lng) &&
                 lat >= -90 && lat <= 90 &&
                 lng >= -180 && lng <= 180;
        }).sort((a, b) => {
          // Check if index column exists in the data points and has valid values
          const hasIndexColumnA = a.hasOwnProperty(indexColumn) && a[indexColumn] !== undefined && a[indexColumn] !== null;
          const hasIndexColumnB = b.hasOwnProperty(indexColumn) && b[indexColumn] !== undefined && b[indexColumn] !== null;
          
          if (!hasIndexColumnA || !hasIndexColumnB) {
            console.log('Index column not found or invalid, sorting by timestamp');
            // If index column doesn't exist or is invalid, sort by created_at timestamp
            const timeA = new Date(a.created_at).getTime();
            const timeB = new Date(b.created_at).getTime();
            return timeA - timeB;
          }
          
          // Sort by index column value
          const indexA = typeof a[indexColumn] === 'number' ? a[indexColumn] : parseFloat(String(a[indexColumn]));
          const indexB = typeof b[indexColumn] === 'number' ? b[indexColumn] : parseFloat(String(b[indexColumn]));
          
          console.log('Sorting by index column:', indexColumn, 'A:', indexA, 'B:', indexB);
          
          // Handle NaN values
          if (isNaN(indexA)) {
            console.log('Index A is NaN');
            return 1;
          }
          if (isNaN(indexB)) {
            console.log('Index B is NaN');
            return -1;
          }
          
          const result = indexA - indexB;
          console.log('Sorting result:', result);
          return result;
        });
        
        console.log('Sorted data for path:', sortedData.length, 'points');
        console.log('First few sorted points:', sortedData.slice(0, 3));
        
        if (sortedData.length > 1) {
          // Create array of LatLng points
          const latLngs = sortedData.map((point, idx) => {
            const lat = typeof point.latitude === 'number' ? point.latitude : parseFloat(point.latitude);
            const lng = typeof point.longitude === 'number' ? point.longitude : parseFloat(point.longitude);
            console.log(`Point ${idx}: lat=${lat}, lng=${lng}`);
            return L.latLng(lat, lng);
          });
          
          console.log('LatLng points for path:', latLngs.length);
          
          // Draw path
          pathRef.current = L.polyline(latLngs, {
            color: pathColor,
            weight: 3,
            opacity: 0.7
          }).addTo(mapRef.current);
          
          console.log('Path drawn with', latLngs.length, 'points');
          
          // Draw arrows if enabled
          if (showArrows) {
            arrowsRef.current = L.polylineDecorator(pathRef.current, {
              patterns: [
                {
                  offset: '10%',
                  repeat: '20%',
                  symbol: L.Symbol.arrowHead({
                    pixelSize: 10,
                    pathOptions: {
                      fillOpacity: 1,
                      fillColor: arrowColor,
                      color: arrowColor,
                      weight: 0
                    }
                  })
                }
              ]
            }).addTo(mapRef.current);
            
            console.log('Arrows drawn');
          }
          
          console.log('Path and arrows drawn successfully');
        } else {
          console.log('Not enough points to draw path:', sortedData.length);
        }
      }

      // Fit map to markers if we have data
      if (validMarkers > 0) {
        console.log('Fitting map to markers');
        const validPoints = data.filter(point => {
          const lat = typeof point.latitude === 'number' ? point.latitude : parseFloat(point.latitude);
          const lng = typeof point.longitude === 'number' ? point.longitude : parseFloat(point.longitude);
          return !isNaN(lat) && !isNaN(lng) &&
                 lat >= -90 && lat <= 90 &&
                 lng >= -180 && lng <= 180;
        });
        
        if (validPoints.length > 0) {
          const bounds = L.latLngBounds(
            validPoints.map(point => {
              const lat = typeof point.latitude === 'number' ? point.latitude : parseFloat(point.latitude);
              const lng = typeof point.longitude === 'number' ? point.longitude : parseFloat(point.longitude);
              return [lat, lng];
            })
          );
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
          console.log('Map fitted to markers successfully');
        }
      } else {
        console.log('No valid markers to fit map to');
      }
    } catch (error) {
      console.error('Error updating markers:', error);
      setError('Failed to update markers: ' + (error as Error).message);
    }
  }, [data, showMarker, markerColor, showPath, pathColor, showArrows, arrowColor, indexColumn]);

  // Update user location marker when showUserLocation changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (showUserLocation) {
      updateUserLocationMarker();
    } else if (userLocationMarkerRef.current) {
      // Remove user location marker if it exists
      mapRef.current.removeLayer(userLocationMarkerRef.current);
      userLocationMarkerRef.current = null;
      console.log('User location marker removed');
    }
  }, [showUserLocation]);

  // Fetch data periodically
  useEffect(() => {
    console.log('Setting up data fetching effect', { 
      isDesignMode, 
      refreshInterval, 
      productId, 
      tableName,
      deviceId,
      latitudeColumn,
      longitudeColumn
    });
    
    fetchMapData();

    if (!isDesignMode && refreshInterval > 0 && productId && tableName) {
      console.log('Setting up interval for data refresh');
      const interval = setInterval(fetchMapData, refreshInterval);
      return () => {
        console.log('Clearing data refresh interval');
        clearInterval(interval);
      };
    }
  }, [productId, deviceId, tableName, latitudeColumn, longitudeColumn, refreshInterval, isDesignMode]);

  // If showContainer is false, render only the map without the card container
  if (!showContainer) {
    if (isDesignMode) {
      const shapeStyles = getMapShapeStyles(mapShape, mapShapeSides);
      
      return (
        <div className="h-full w-full flex items-center justify-center text-muted-foreground" style={shapeStyles}>
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Map Preview</p>
        </div>
      );
    }

    if (error) {
      const shapeStyles = getMapShapeStyles(mapShape, mapShapeSides);
      
      return (
        <div className="h-full w-full flex items-center justify-center text-destructive" style={shapeStyles}>
          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    const shapeStyles = getMapShapeStyles(mapShape, mapShapeSides);
    
    return (
      <div className="h-full w-full relative" style={shapeStyles}>
        <div 
          ref={mapContainerRef} 
          className="w-full h-full"
          style={{ minHeight: '200px' }}
        />
        
        {loading && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
            <RefreshCw className="w-3 h-3 inline-block mr-1 animate-spin" />
            Loading data...
          </div>
        )}
      </div>
    );
  }

  // Render with container
  const shapeStyles = getMapShapeStyles(mapShape, mapShapeSides);
  
  return (
    <MapWidgetErrorBoundary>
      <Card className="h-full flex flex-col" style={{ ...style, ...shapeStyles }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {title || 'Map'}
            </span>
            {loading && (
              <RefreshCw className="w-4 h-4 animate-spin" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 relative">
          {error ? (
            <div className="h-full w-full flex items-center justify-center text-destructive p-4">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <>
              <div 
                ref={mapContainerRef} 
                className="w-full h-full"
                style={{ minHeight: '200px' }}
              />
              
              {loading && data.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              )}
              
              {data.length === 0 && !loading && !isDesignMode && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                  <div className="text-center text-muted-foreground">
                    <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No location data available</p>
                    <p className="text-xs mt-1">Check column names: lat='{latitudeColumn}', lng='{longitudeColumn}'</p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </MapWidgetErrorBoundary>
  );
};