import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Text } from '@react-three/drei';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, Loader2 } from 'lucide-react';
import * as THREE from 'three';

interface VectorPlot3DWidgetRendererProps {
  widget: IoTDashboardWidget;
  commonStyles: React.CSSProperties;
  isDesignMode?: boolean;
  value?: any;
}

interface Vector3D {
  x: number;
  y: number;
  z: number;
}

interface VectorData {
  vectors?: Vector3D[];
  origin?: Vector3D;
}

// Component to render vectors in the 3D scene
const VectorRenderer: React.FC<{
  vectors: Vector3D[];
  origin: Vector3D;
  vectorScale: number;
  colorMode: 'static' | 'magnitude' | 'axis';
  staticColor: string;
  opacity: number;
  arrowShaftRadius: number;
  arrowHeadRadius: number;
  arrowHeadLength: number;
  arrowSegments: number;
  showVectorTips: boolean;
  tipMarkerSize: number;
  tipMarkerColor: string;
  displayMode: string;
  pointMarkerSize: number;
  pointColorMode: string;
  pointMarkerColor: string;
  showPointLabels: boolean;
  labelFormat: string;
  labelPrecision: number;
  labelSize: number;
  labelColor: string;
  labelOffset: number;
}> = ({ 
  vectors, 
  origin, 
  vectorScale, 
  colorMode, 
  staticColor, 
  opacity,
  arrowShaftRadius,
  arrowHeadRadius,
  arrowHeadLength,
  arrowSegments,
  showVectorTips,
  tipMarkerSize,
  tipMarkerColor,
  displayMode,
  pointMarkerSize,
  pointColorMode,
  pointMarkerColor,
  showPointLabels,
  labelFormat,
  labelPrecision,
  labelSize,
  labelColor,
  labelOffset
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Calculate color based on mode for arrows
  const getVectorColor = (vector: Vector3D, index: number): string => {
    switch (colorMode) {
      case 'magnitude':
        const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
        const normalizedMag = Math.min(magnitude / 2, 1);
        return `hsl(${(1 - normalizedMag) * 240}, 100%, 50%)`;
      
      case 'axis':
        const absX = Math.abs(vector.x);
        const absY = Math.abs(vector.y);
        const absZ = Math.abs(vector.z);
        if (absX > absY && absX > absZ) return '#ef4444'; // red for X-dominant
        if (absY > absX && absY > absZ) return '#22c55e'; // green for Y-dominant
        return '#3b82f6'; // blue for Z-dominant
      
      case 'static':
      default:
        return staticColor;
    }
  };

  // Calculate color for point markers based on zone mode
  const getPointColor = (vector: Vector3D, scaledVector: Vector3D): string => {
    switch (pointColorMode) {
      case 'zone-octant':
        // Color based on octant (±X, ±Y, ±Z combination)
        if (scaledVector.x >= 0 && scaledVector.y >= 0 && scaledVector.z >= 0) return '#ff6b6b'; // +X+Y+Z - Red
        if (scaledVector.x < 0 && scaledVector.y >= 0 && scaledVector.z >= 0) return '#4ecdc4'; // -X+Y+Z - Cyan
        if (scaledVector.x >= 0 && scaledVector.y < 0 && scaledVector.z >= 0) return '#ffd93d'; // +X-Y+Z - Yellow
        if (scaledVector.x < 0 && scaledVector.y < 0 && scaledVector.z >= 0) return '#95e1d3'; // -X-Y+Z - Mint
        if (scaledVector.x >= 0 && scaledVector.y >= 0 && scaledVector.z < 0) return '#f38181'; // +X+Y-Z - Pink
        if (scaledVector.x < 0 && scaledVector.y >= 0 && scaledVector.z < 0) return '#aa96da'; // -X+Y-Z - Purple
        if (scaledVector.x >= 0 && scaledVector.y < 0 && scaledVector.z < 0) return '#fcbad3'; // +X-Y-Z - Light Pink
        return '#a8d8ea'; // -X-Y-Z - Light Blue
      
      case 'zone-radial':
        // Color based on distance from origin
        const distance = Math.sqrt(scaledVector.x ** 2 + scaledVector.y ** 2 + scaledVector.z ** 2);
        if (distance < 1) return '#4ade80'; // Green - Close
        if (distance < 2) return '#facc15'; // Yellow - Medium
        if (distance < 3) return '#fb923c'; // Orange - Far
        return '#ef4444'; // Red - Very Far
      
      case 'zone-height':
        // Color based on Y-axis (height)
        if (scaledVector.y < -1) return '#1e40af'; // Dark Blue - Very Low
        if (scaledVector.y < 0) return '#3b82f6'; // Blue - Low
        if (scaledVector.y < 1) return '#22c55e'; // Green - Mid
        if (scaledVector.y < 2) return '#eab308'; // Yellow - High
        return '#dc2626'; // Red - Very High
      
      case 'magnitude':
        const mag = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
        const normalizedMag = Math.min(mag / 2, 1);
        return `hsl(${(1 - normalizedMag) * 240}, 100%, 50%)`;
      
      case 'static':
      default:
        return pointMarkerColor;
    }
  };

  // Format coordinate label
  const formatLabel = (vector: Vector3D, scaledVector: Vector3D): string => {
    const x = scaledVector.x.toFixed(labelPrecision);
    const y = scaledVector.y.toFixed(labelPrecision);
    const z = scaledVector.z.toFixed(labelPrecision);
    
    switch (labelFormat) {
      case 'xyz':
        return `X:${x}, Y:${y}, Z:${z}`;
      case 'compact':
        return `(${x}, ${y}, ${z})`;
      case 'array':
        return `[${x}, ${y}, ${z}]`;
      case 'multiline':
        return `X:${x}\nY:${y}\nZ:${z}`;
      default:
        return `(${x}, ${y}, ${z})`;
    }
  };

  const showArrows = displayMode !== 'points-only';
  const showPoints = displayMode === 'arrows-and-points' || displayMode === 'points-only';

  return (
    <group ref={groupRef}>
      {vectors.map((vector, index) => {
        const direction = new THREE.Vector3(
          vector.x * vectorScale,
          vector.y * vectorScale,
          vector.z * vectorScale
        );
        const length = direction.length();
        
        if (length === 0) return null;

        const normalized = direction.clone().normalize();
        const color = getVectorColor(vector, index);
        const scaledVector = { x: vector.x * vectorScale, y: vector.y * vectorScale, z: vector.z * vectorScale };
        const pointColor = getPointColor(vector, scaledVector);

        // Calculate proper rotation to align cylinder (default orientation is along Y-axis)
        const axis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(axis, normalized);
        const euler = new THREE.Euler().setFromQuaternion(quaternion);

        const shaftLength = length * (1 - arrowHeadLength / length);
        const tipPosition = normalized.clone().multiplyScalar(length);
        const labelPosition = tipPosition.clone().add(new THREE.Vector3(0, labelOffset, 0));

        return (
          <group key={index} position={[origin.x, origin.y, origin.z]}>
            {/* Arrow shaft and head */}
            {showArrows && (
              <>
                {/* Arrow shaft (cylinder) */}
                <mesh
                  position={normalized.clone().multiplyScalar(shaftLength / 2).toArray()}
                  rotation={[euler.x, euler.y, euler.z]}
                >
                  <cylinderGeometry args={[arrowShaftRadius, arrowShaftRadius, shaftLength, arrowSegments]} />
                  <meshStandardMaterial color={color} transparent opacity={opacity} />
                </mesh>
                
                {/* Arrow head (cone) */}
                <mesh
                  position={normalized.clone().multiplyScalar(shaftLength + arrowHeadLength / 2).toArray()}
                  rotation={[euler.x, euler.y, euler.z]}
                >
                  <coneGeometry args={[arrowHeadRadius, arrowHeadLength, arrowSegments]} />
                  <meshStandardMaterial color={color} transparent opacity={opacity} />
                </mesh>
              </>
            )}

            {/* Point markers at tips (new display mode) */}
            {showPoints && (
              <mesh position={tipPosition.toArray()}>
                <sphereGeometry args={[pointMarkerSize, 16, 16]} />
                <meshStandardMaterial color={pointColor} />
              </mesh>
            )}

            {/* Legacy tip marker (for backward compatibility) */}
            {showVectorTips && !showPoints && (
              <mesh position={tipPosition.toArray()}>
                <sphereGeometry args={[tipMarkerSize, 16, 16]} />
                <meshStandardMaterial color={tipMarkerColor} />
              </mesh>
            )}

            {/* Point labels */}
            {showPointLabels && showPoints && (
              <Text
                position={labelPosition.toArray()}
                fontSize={labelSize}
                color={labelColor}
                anchorX="center"
                anchorY="middle"
              >
                {formatLabel(vector, scaledVector)}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
};

// Loading fallback
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="text-center text-muted-foreground">
      <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
      <p className="text-sm">Loading 3D Vector Plotter...</p>
    </div>
  </div>
);

export const VectorPlot3DWidgetRenderer: React.FC<VectorPlot3DWidgetRendererProps> = ({
  widget,
  commonStyles,
  isDesignMode = false,
  value
}) => {
  const [vectors, setVectors] = useState<Vector3D[]>([]);
  const [origin, setOrigin] = useState<Vector3D>({ x: 0, y: 0, z: 0 });

  // Parse incoming WebSocket value and update vectors
  useEffect(() => {
    if (value) {
      console.log('[VectorPlot3D] Received value:', value);
      
      try {
        let parsedVectors: Vector3D[] = [];
        let parsedOrigin: Vector3D = { x: 0, y: 0, z: 0 };

        if (typeof value === 'object') {
          // Handle { vectors: [...], origin: {...} } format
          if (value.vectors && Array.isArray(value.vectors)) {
            parsedVectors = value.vectors.map((v: any) => ({
              x: parseFloat(v.x || v[0] || 0),
              y: parseFloat(v.y || v[1] || 0),
              z: parseFloat(v.z || v[2] || 0)
            }));
            console.log('[VectorPlot3D] Parsed vectors:', parsedVectors);
          }
          
          if (value.origin) {
            parsedOrigin = {
              x: parseFloat(value.origin.x || value.origin[0] || 0),
              y: parseFloat(value.origin.y || value.origin[1] || 0),
              z: parseFloat(value.origin.z || value.origin[2] || 0)
            };
            console.log('[VectorPlot3D] Parsed origin:', parsedOrigin);
          }
        } else if (Array.isArray(value)) {
          // Handle raw array format [[x,y,z], ...] or [{x,y,z}, ...]
          parsedVectors = value.map((v: any) => ({
            x: parseFloat(v.x || v[0] || 0),
            y: parseFloat(v.y || v[1] || 0),
            z: parseFloat(v.z || v[2] || 0)
          }));
          console.log('[VectorPlot3D] Parsed vectors from array:', parsedVectors);
        }

        // Apply history window if configured
        const historyWindow = widget.config.historyWindow || 0;
        if (historyWindow > 0 && parsedVectors.length > 0) {
          setVectors(prev => {
            const combined = [...prev, ...parsedVectors];
            const result = combined.slice(-historyWindow);
            console.log('[VectorPlot3D] Applied history window:', { historyWindow, totalVectors: result.length });
            return result;
          });
        } else {
          setVectors(parsedVectors);
          console.log('[VectorPlot3D] Set vectors (no history):', { count: parsedVectors.length });
        }
        
        setOrigin(parsedOrigin);
      } catch (error) {
        console.error('[VectorPlot3D] Error parsing vectors:', error);
      }
    }
  }, [value, widget.config.historyWindow]);

  // Configuration with defaults
  const showGrid = widget.config.showGrid !== false;
  const showAxes = widget.config.showAxes !== false;
  const backgroundColor = widget.config.backgroundColor || '#1a1a1a';
  const vectorScale = widget.config.vectorScale ?? 1;
  const colorMode = widget.config.colorMode || 'static';
  const staticColor = widget.config.staticColor || '#4f46e5';
  const opacity = widget.config.opacity ?? 1;
  
  // Arrow design settings
  const displayMode = widget.config.displayMode || 'arrows-and-points';
  const arrowShaftRadius = widget.config.arrowShaftRadius ?? 0.02;
  const arrowHeadRadius = widget.config.arrowHeadRadius ?? 0.06;
  const arrowHeadLength = widget.config.arrowHeadLength ?? 0.2;
  const arrowSegments = widget.config.arrowSegments || 8;
  const showVectorTips = widget.config.showVectorTips || false;
  const tipMarkerSize = widget.config.tipMarkerSize ?? 0.08;
  const tipMarkerColor = widget.config.tipMarkerColor || '#ff6b6b';
  
  // Point marker settings
  const pointMarkerSize = widget.config.pointMarkerSize ?? 0.08;
  const pointColorMode = widget.config.pointColorMode || 'static';
  const pointMarkerColor = widget.config.pointMarkerColor || '#ff6b6b';
  
  // Point label settings
  const showPointLabels = widget.config.showPointLabels || false;
  const labelFormat = widget.config.labelFormat || 'xyz';
  const labelPrecision = widget.config.labelPrecision ?? 2;
  const labelSize = widget.config.labelSize ?? 0.3;
  const labelColor = widget.config.labelColor || '#ffffff';
  const labelOffset = widget.config.labelOffset ?? 0.3;
  
  // Origin point settings
  const showOrigin = widget.config.showOrigin !== false;
  const originSize = widget.config.originSize ?? 0.05;
  const originColor = widget.config.originColor || '#ffffff';
  
  // Grid settings
  const gridSize = widget.config.gridSize ?? 10;
  const gridCellColor = widget.config.gridCellColor || '#6b7280';
  const gridSectionColor = widget.config.gridSectionColor || '#374151';
  
  // Axes settings
  const axesSize = widget.config.axesSize ?? 2;
  const xAxisColor = widget.config.xAxisColor || '#ff0000';
  const yAxisColor = widget.config.yAxisColor || '#00ff00';
  const zAxisColor = widget.config.zAxisColor || '#0000ff';
  
  const cameraX = widget.config.cameraPosition?.[0] ?? 3;
  const cameraY = widget.config.cameraPosition?.[1] ?? 3;
  const cameraZ = widget.config.cameraPosition?.[2] ?? 3;
  const cameraPosition: [number, number, number] = [cameraX, cameraY, cameraZ];
  const cameraFov = widget.config.cameraFov || 75;
  
  const enableControls = !isDesignMode && (widget.config.enableControls !== false);
  const enableDamping = widget.config.enableDamping !== false;
  const showContainer = widget.config.showContainer !== false;
  
  // Lighting settings
  const ambientLightIntensity = widget.config.ambientLightIntensity ?? 0.5;
  const directionalLightIntensity = widget.config.directionalLightIntensity ?? 1;
  
  // Performance settings
  const enableAntialiasing = widget.config.enableAntialiasing !== false;
  const pixelRatio = widget.config.pixelRatio === 'auto' 
    ? window.devicePixelRatio 
    : (parseFloat(widget.config.pixelRatio) || window.devicePixelRatio);

  const canvasContent = (
    <div className="h-full w-full" style={{ minHeight: '200px' }}>
      <Canvas
        dpr={pixelRatio}
        gl={{ antialias: enableAntialiasing }}
      >
        <PerspectiveCamera 
          makeDefault 
          position={cameraPosition}
          fov={cameraFov}
        />
        
        {/* Lighting */}
        <ambientLight intensity={ambientLightIntensity} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={directionalLightIntensity}
        />
        <directionalLight 
          position={[-10, -10, -5]} 
          intensity={directionalLightIntensity * 0.5}
        />
        
        {/* Controls - only enabled in runtime mode */}
        {enableControls && (
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            enableDamping={enableDamping}
            dampingFactor={0.05}
          />
        )}
        
        {/* Grid */}
        {showGrid && (
          <Grid 
            args={[gridSize, gridSize]} 
            cellColor={gridCellColor}
            sectionColor={gridSectionColor}
            fadeDistance={25}
            fadeStrength={1}
          />
        )}
        
        {/* Custom Axes with colors */}
        {showAxes && (
          <>
            {/* X-Axis */}
            <arrowHelper args={[
              new THREE.Vector3(1, 0, 0),
              new THREE.Vector3(0, 0, 0),
              axesSize,
              xAxisColor
            ]} />
            {/* Y-Axis */}
            <arrowHelper args={[
              new THREE.Vector3(0, 1, 0),
              new THREE.Vector3(0, 0, 0),
              axesSize,
              yAxisColor
            ]} />
            {/* Z-Axis */}
            <arrowHelper args={[
              new THREE.Vector3(0, 0, 1),
              new THREE.Vector3(0, 0, 0),
              axesSize,
              zAxisColor
            ]} />
          </>
        )}
        
        {/* Origin point */}
        {showOrigin && (
          <mesh position={[origin.x, origin.y, origin.z]}>
            <sphereGeometry args={[originSize, 16, 16]} />
            <meshStandardMaterial color={originColor} />
          </mesh>
        )}
        
        {/* Vector arrows */}
        {vectors.length > 0 && (
          <VectorRenderer
            vectors={vectors}
            origin={origin}
            vectorScale={vectorScale}
            colorMode={colorMode}
            staticColor={staticColor}
            opacity={opacity}
            arrowShaftRadius={arrowShaftRadius}
            arrowHeadRadius={arrowHeadRadius}
            arrowHeadLength={arrowHeadLength}
            arrowSegments={arrowSegments}
            showVectorTips={showVectorTips}
            tipMarkerSize={tipMarkerSize}
            tipMarkerColor={tipMarkerColor}
            displayMode={displayMode}
            pointMarkerSize={pointMarkerSize}
            pointColorMode={pointColorMode}
            pointMarkerColor={pointMarkerColor}
            showPointLabels={showPointLabels}
            labelFormat={labelFormat}
            labelPrecision={labelPrecision}
            labelSize={labelSize}
            labelColor={labelColor}
            labelOffset={labelOffset}
          />
        )}
      </Canvas>
    </div>
  );

  if (!showContainer) {
    return (
      <div 
        className="h-full w-full" 
        style={{
          ...commonStyles,
          backgroundColor: backgroundColor
        }}
      >
        {canvasContent}
      </div>
    );
  }

  return (
    <Card className="h-full" style={commonStyles}>
      {widget.config.showLabel !== false && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Box className="w-4 h-4" />
            <span>{widget.title}</span>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent 
        className={`${widget.config.showLabel !== false ? 'pt-0' : 'p-2'} h-full`}
        style={{ backgroundColor: backgroundColor }}
      >
        {canvasContent}
      </CardContent>
    </Card>
  );
};
