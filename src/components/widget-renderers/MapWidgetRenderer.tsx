import React, { useState, useEffect, useRef } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Minus, Map, Satellite, MapPinned, AlertTriangle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapWidget } from '../widgets/MapWidget';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapWidgetRendererProps {
  widget: IoTDashboardWidget;
  isDesignMode?: boolean;
  value?: any;
  onValueChange?: (value: any) => void;
  deviceId?: string;
}

// Error Boundary Component
class MapWidgetErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('MapWidgetErrorBoundary caught an error:', error);
    return { hasError: true };
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
            <p className="text-xs mt-1">Failed to render map widget</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const MapWidgetRenderer: React.FC<MapWidgetRendererProps> = ({
  widget,
  isDesignMode,
  value,
  onValueChange,
  deviceId
}) => {
  const { title, config, style } = widget;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const cartoLabelsRef = useRef<L.TileLayer | null>(null);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  
  // Log widget config for debugging
  useEffect(() => {
    console.log('MapWidgetRenderer config:', config);
  }, [config]);
  
  // Use the new data source configuration
  const productId = widget.config?.productId;
  const tableName = widget.config?.runtimeTableName || widget.config?.mapTableName; // Support both old and new configurations
  const latitudeColumn = widget.config?.latitudeColumn || 'latitude';
  const longitudeColumn = widget.config?.longitudeColumn || 'longitude';
  const refreshInterval = widget.config?.refreshInterval || widget.config?.mapRefreshInterval || 5000; // Support both old and new configurations
  
  // Check if we should connect to database
  // Use a more specific check to determine if database connectivity is configured
  const shouldConnectToDatabase = !!(productId && tableName);
  
  // Log database connection decision
  useEffect(() => {
    console.log('MapWidgetRenderer database connection check:', {
      productId,
      tableName,
      latitudeColumn,
      longitudeColumn,
      refreshInterval,
      shouldConnectToDatabase,
      config: widget.config
    });
  }, [productId, tableName, latitudeColumn, longitudeColumn, refreshInterval, shouldConnectToDatabase, widget.config]);
  
  // If connecting to database (using the new data source configuration), render the MapWidget component
  if (shouldConnectToDatabase) {
    console.log('Rendering database-connected MapWidget with config:', {
      productId,
      tableName,
      latitudeColumn,
      longitudeColumn,
      refreshInterval,
      widgetConfig: widget.config
    });
    
    // Convert WidgetStyle to React.CSSProperties
    const cssStyle: React.CSSProperties = {
      backgroundColor: style?.backgroundColor,
      color: (style as any)?.color || style?.textColor,
      borderColor: style?.borderColor,
      borderWidth: style?.borderWidth ? parseInt(String(style.borderWidth)) : undefined,
      borderRadius: style?.borderRadius ? parseInt(String(style.borderRadius)) : undefined,
      fontSize: style?.fontSize,
      fontWeight: style?.fontWeight,
      padding: style?.padding,
      margin: (style as any)?.margin,
      boxShadow: (style as any)?.boxShadow,
      opacity: style?.opacity ? parseFloat(String(style.opacity)) : undefined,
      visibility: style?.visibility as any,
      zIndex: style?.zIndex
    };
    
    console.log('MapWidget CSS Style:', cssStyle);
    
    return (
      <MapWidgetErrorBoundary>
        <MapWidget
          title={title || 'Map'}
          productId={productId}
          deviceId={deviceId}
          tableName={tableName}
          latitudeColumn={latitudeColumn}
          longitudeColumn={longitudeColumn}
          refreshInterval={refreshInterval}
          style={cssStyle}
          isDesignMode={isDesignMode}
          // Map customization props
          mapProvider={widget.config?.mapProvider}
          defaultCenterLat={widget.config?.latitude || 40.7128}
          defaultCenterLng={widget.config?.longitude || -74.0060}
          defaultZoom={widget.config?.zoomLevel || 13}
          showMarker={widget.config?.showMarker !== false}
          markerColor={widget.config?.markerColor}
          markerType={widget.config?.markerType || 'default'}
          mapShape={widget.config?.mapShape || 'rectangle'}
          mapShapeSides={widget.config?.mapShapeSides || 6}
          showControls={widget.config?.showControls !== false}
          showContainer={style?.showContainer !== false}
          // Path/line customization props - use !== false to default to true
          showPath={widget.config?.showPath !== false}
          pathColor={widget.config?.pathColor || '#3b82f6'}
          showArrows={widget.config?.showArrows !== false}
          arrowColor={widget.config?.arrowColor || '#3b82f6'}
          indexColumn={widget.config?.indexColumn || 'index'}
          // User location
          showUserLocation={widget.config?.showUserLocation === true}
          // Pin descriptions
          showPinDescriptions={widget.config?.showPinDescriptions === true}
          alwaysShowPinDescriptions={widget.config?.alwaysShowPinDescriptions === true}
          pinTitleColumn={widget.config?.pinTitleColumn || 'title'}
          pinDescriptionColumn={widget.config?.pinDescriptionColumn || 'description'}
        />
      </MapWidgetErrorBoundary>
    );
  }
  
  console.log('Rendering static MapWidget');
  
  // Default configuration for static map
  const mapProvider = config?.mapProvider || 'openstreetmap';
  const latitude = config?.latitude || 40.7128; // Default to NYC
  const longitude = config?.longitude || -74.0060;
  const zoomLevel = config?.zoomLevel || 13;
  const showMarker = config?.showMarker !== false;
  const markerColor = config?.markerColor || '#ff0000';
  const markerType = config?.markerType || 'default';
  const mapShape = config?.mapShape || 'rectangle';
  const mapShapeSides = config?.mapShapeSides || 6;
  const showControls = config?.showControls !== false;
  const showContainer = style?.showContainer !== false; // Default to true
  const showUserLocation = config?.showUserLocation === true; // Default to false
  const showPinDescriptions = config?.showPinDescriptions === true; // Default to false
  const alwaysShowPinDescriptions = config?.alwaysShowPinDescriptions === true; // Default to false
  const pinTitleColumn = config?.pinTitleColumn || 'title';
  const pinDescriptionColumn = config?.pinDescriptionColumn || 'description';
  
  console.log('Static MapWidget config:', {
    mapProvider,
    latitude,
    longitude,
    zoomLevel,
    showMarker,
    markerColor,
    markerType,
    mapShape,
    mapShapeSides,
    showControls,
    showContainer,
    showUserLocation,
    showPinDescriptions,
    alwaysShowPinDescriptions,
    pinTitleColumn,
    pinDescriptionColumn
  });
  
  const [currentZoom, setCurrentZoom] = useState(zoomLevel);

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

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) {
      console.log('Static map container not available yet');
      return;
    }

    console.log('Initializing static map with config:', {
      latitude,
      longitude,
      zoomLevel,
      mapProvider,
      showMarker,
      markerColor,
      showControls,
      showUserLocation
    });
    
    try {
      // If map already exists, remove it first
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: zoomLevel,
        attributionControl: false
      });

      mapRef.current = map;
      console.log('Static map created successfully');

      // Add tile layers
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      });
      
      const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri'
      });
      
      const cartoDb = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB'
      });

      // Store references
      tileLayerRef.current = osmLayer;
      satelliteLayerRef.current = esriSatellite;
      cartoLabelsRef.current = cartoDb;

      // Set initial layer based on provider
      switch (mapProvider) {
        case 'esri':
          esriSatellite.addTo(map);
          break;
        case 'carto':
          cartoDb.addTo(map);
          break;
        default: // openstreetmap
          osmLayer.addTo(map);
          break;
      }
      
      console.log('Static map tile layers added successfully');

      // Add navigation controls
      if (showControls && !isDesignMode) {
        const zoomControl = L.control.zoom({
          position: 'topright'
        });
        zoomControl.addTo(map);
        console.log('Static map zoom controls added successfully');
      }

      // Add marker if enabled
      if (showMarker) {
        const marker = L.marker([latitude, longitude], {
          icon: createCustomMarkerIcon(markerColor, markerType)
        }).addTo(map);
        
        // Add popup with data information
        let popupContent = `<div>`;
        
        // If pin descriptions are enabled, use title and description
        if (showPinDescriptions) {
          // For static maps, we don't have database data, so we'll show coordinates
          popupContent += `
            <strong>Location</strong>
            <br/>Latitude: ${latitude.toFixed(6)}
            <br/>Longitude: ${longitude.toFixed(6)}
          `;
        } else {
          // Default behavior - show coordinates
          popupContent += `
            <strong>Location Data</strong>
            <br/>Latitude: ${latitude.toFixed(6)}
            <br/>Longitude: ${longitude.toFixed(6)}
          `;
        }
        
        popupContent += `</div>`;
        marker.bindPopup(popupContent);
        
        // If always show pin descriptions is enabled, add a permanent tooltip
        if (showPinDescriptions && alwaysShowPinDescriptions) {
          const tooltipContent = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
          marker.bindTooltip(tooltipContent, {
            permanent: true,
            direction: 'top',
            offset: [0, -10]
          });
        }
        
        markerRef.current = marker;
        console.log('Static map marker added successfully');
      }

      // Add user location marker if enabled
      if (showUserLocation) {
        getUserLocation()
          .then((location) => {
            const userIcon = L.divIcon({
              className: 'user-location-marker',
              html: `<div style="background-color: #4ade80; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });
            
            const userMarker = L.marker([location.lat, location.lng], {
              icon: userIcon
            }).addTo(map);
            
            userLocationMarkerRef.current = userMarker;
            console.log('User location marker added successfully');
          })
          .catch((error) => {
            console.error('Error getting user location:', error);
          });
      }

      // Update zoom state when map zoom changes
      map.on('zoomend', () => {
        if (mapRef.current) {
          setCurrentZoom(mapRef.current.getZoom());
        }
      });

      // Clean up
      return () => {
        if (mapRef.current) {
          console.log('Cleaning up static map');
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing static map:', error);
    }
  }, [showContainer, showPinDescriptions, alwaysShowPinDescriptions, markerType, mapShape, mapShapeSides]); // Only reinitialize when container visibility changes

  // Update map when configuration changes
  useEffect(() => {
    if (!mapRef.current) return;

    console.log('Updating static map configuration');
    
    try {
      // Update map center
      mapRef.current.setView([latitude, longitude], zoomLevel);
      
      // Update tile layer based on provider
      if (tileLayerRef.current && satelliteLayerRef.current && cartoLabelsRef.current) {
        // Remove all layers first
        mapRef.current.eachLayer((layer) => {
          if (layer !== markerRef.current && layer !== userLocationMarkerRef.current) {
            mapRef.current?.removeLayer(layer);
          }
        });
        
        // Add the selected layer
        switch (mapProvider) {
          case 'esri':
            satelliteLayerRef.current.addTo(mapRef.current);
            break;
          case 'carto':
            cartoLabelsRef.current.addTo(mapRef.current);
            break;
          default: // openstreetmap
            tileLayerRef.current.addTo(mapRef.current);
            break;
        }
      }
      
      // Update marker if it exists
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
        
        // Update marker icon and popup content
        if (showMarker) {
          markerRef.current.setIcon(createCustomMarkerIcon(markerColor, markerType));
          
          // Update popup content
          let popupContent = `<div>`;
          
          // If pin descriptions are enabled, use title and description
          if (showPinDescriptions) {
            // For static maps, we don't have database data, so we'll show coordinates
            popupContent += `
              <strong>Location</strong>
              <br/>Latitude: ${latitude.toFixed(6)}
              <br/>Longitude: ${longitude.toFixed(6)}
            `;
          } else {
            // Default behavior - show coordinates
            popupContent += `
              <strong>Location Data</strong>
              <br/>Latitude: ${latitude.toFixed(6)}
              <br/>Longitude: ${longitude.toFixed(6)}
            `;
          }
          
          popupContent += `</div>`;
          markerRef.current.setPopupContent(popupContent);
          
          // Update or add tooltip for always show pin descriptions
          if (showPinDescriptions && alwaysShowPinDescriptions) {
            const tooltipContent = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
            // Check if tooltip already exists
            if (markerRef.current.getTooltip()) {
              markerRef.current.setTooltipContent(tooltipContent);
            } else {
              markerRef.current.bindTooltip(tooltipContent, {
                permanent: true,
                direction: 'top',
                offset: [0, -10]
              });
            }
          } else if (markerRef.current.getTooltip()) {
            // Remove tooltip if feature is disabled
            markerRef.current.unbindTooltip();
          }
        }
      } else if (showMarker) {
        // Create marker if it doesn't exist but should be shown
        const marker = L.marker([latitude, longitude], {
          icon: createCustomMarkerIcon(markerColor, markerType)
        }).addTo(mapRef.current);
        
        // Add popup with data information
        let popupContent = `<div>`;
        
        // If pin descriptions are enabled, use title and description
        if (showPinDescriptions) {
          // For static maps, we don't have database data, so we'll show coordinates
          popupContent += `
            <strong>Location</strong>
            <br/>Latitude: ${latitude.toFixed(6)}
            <br/>Longitude: ${longitude.toFixed(6)}
          `;
        } else {
          // Default behavior - show coordinates
          popupContent += `
            <strong>Location Data</strong>
            <br/>Latitude: ${latitude.toFixed(6)}
            <br/>Longitude: ${longitude.toFixed(6)}
          `;
        }
        
        popupContent += `</div>`;
        marker.bindPopup(popupContent);
        
        // If always show pin descriptions is enabled, add a permanent tooltip
        if (showPinDescriptions && alwaysShowPinDescriptions) {
          const tooltipContent = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
          marker.bindTooltip(tooltipContent, {
            permanent: true,
            direction: 'top',
            offset: [0, -10]
          });
        }
        
        markerRef.current = marker;
      } else if (markerRef.current && !showMarker) {
        // Remove marker if it exists but should not be shown
        if (mapRef.current && markerRef.current) {
          mapRef.current.removeLayer(markerRef.current);
          markerRef.current = null;
        }
      }
      
      // Handle user location marker
      if (showUserLocation) {
        // If user location marker doesn't exist, create it
        if (!userLocationMarkerRef.current) {
          getUserLocation()
            .then((location) => {
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
              console.log('User location marker added successfully');
            })
            .catch((error) => {
              console.error('Error getting user location:', error);
            });
        }
      } else {
        // Remove user location marker if it exists
        if (userLocationMarkerRef.current && mapRef.current) {
          mapRef.current.removeLayer(userLocationMarkerRef.current);
          userLocationMarkerRef.current = null;
          console.log('User location marker removed');
        }
      }
    } catch (error) {
      console.error('Error updating static map:', error);
    }
  }, [latitude, longitude, zoomLevel, mapProvider, showMarker, markerColor, markerType, showUserLocation, showContainer, showPinDescriptions, alwaysShowPinDescriptions, mapShape, mapShapeSides]);

  // Function to get provider icon
  const getProviderIcon = () => {
    switch (mapProvider) {
      case 'esri':
        return <Satellite className="w-4 h-4" />;
      case 'carto':
        return <MapPinned className="w-4 h-4" />;
      default:
        return <Map className="w-4 h-4" />;
    }
  };

  // Function to get provider name
  const getProviderName = () => {
    switch (mapProvider) {
      case 'esri':
        return 'Satellite';
      case 'carto':
        return 'CartoDB';
      default:
        return 'Street';
    }
  };

  return (
    <MapWidgetErrorBoundary>
      <>
        {showContainer ? (
          <Card className="h-full flex flex-col" style={getMapShapeStyles(mapShape, mapShapeSides)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getProviderIcon()}
                  {title || 'Map'} ({getProviderName()})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative">
              <div 
                ref={mapContainerRef} 
                className="w-full h-full"
                style={{ minHeight: '200px' }}
              />
              
              {/* Coordinates display */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </div>
              
              {/* Zoom level display */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
                Zoom: {currentZoom.toFixed(1)}
              </div>
              
              {/* Map provider indicator */}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10 flex items-center gap-1">
                {getProviderIcon()}
                <span>{getProviderName()}</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full w-full relative" style={getMapShapeStyles(mapShape, mapShapeSides)}>
            <div 
              ref={mapContainerRef} 
              className="w-full h-full"
              style={{ minHeight: '200px' }}
            />
            
            {/* Coordinates display */}
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </div>
            
            {/* Zoom level display */}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
              Zoom: {currentZoom.toFixed(1)}
            </div>
            
            {/* Map provider indicator */}
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10 flex items-center gap-1">
              {getProviderIcon()}
              <span>{getProviderName()}</span>
            </div>
          </div>
        )}
      </>
    </MapWidgetErrorBoundary>
  );
};