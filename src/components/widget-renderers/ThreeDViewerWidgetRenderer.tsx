import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Center } from '@react-three/drei';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { GLTFLoader } from 'three-stdlib';

interface ThreeDViewerWidgetRendererProps {
  widget: IoTDashboardWidget;
  commonStyles: React.CSSProperties;
  isDesignMode?: boolean;
  value?: any;
}

interface DynamicControls {
  modelUrl?: string;
  roll?: number;
  pitch?: number;
  yaw?: number;
  cameraX?: number;
  cameraY?: number;
  cameraZ?: number;
  zoom?: number;
  modelColor?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

// Component to load and display 3D models
const ModelViewer: React.FC<{ 
  url: string; 
  modelColor?: string;
  roll?: number;
  pitch?: number;
  yaw?: number;
  wireframeMode?: boolean;
  wireframeColor?: string;
  materialType?: string;
  metalness?: number;
  roughness?: number;
  opacity?: number;
}> = ({ 
  url, 
  modelColor, 
  roll = 0, 
  pitch = 0, 
  yaw = 0,
  wireframeMode = false,
  wireframeColor = '#ffffff',
  materialType = 'standard',
  metalness = 0,
  roughness = 0.5,
  opacity = 1
}) => {
  const [model, setModel] = useState<THREE.Group | THREE.Mesh | null>(null);
  const [error, setError] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!url) {
      return;
    }

    const loadModel = async () => {
      try {
        setError(null);
        const fileExtension = url.split('.').pop()?.toLowerCase();
        
        // Check for unsupported 3MF format
        if (fileExtension === '3mf') {
          setError('3MF format is not directly supported. Please convert your 3MF file to STL, OBJ, or GLTF format. You can use online converters like 3dconvert.com or Blender.');
          return;
        }
        
        let loadedModel: THREE.Group | THREE.Mesh | null = null;

        if (fileExtension === 'stl') {
          // Load STL
          const loader = new STLLoader();
          const geometry = await loader.loadAsync(url);
          
          // Create material based on material type
          let material: THREE.Material;
          
          if (materialType === 'basic') {
            material = new THREE.MeshBasicMaterial({ 
              color: modelColor || '#4f46e5',
              wireframe: wireframeMode,
              transparent: opacity < 1,
              opacity: opacity
            });
          } else if (materialType === 'phong') {
            material = new THREE.MeshPhongMaterial({ 
              color: modelColor || '#4f46e5',
              wireframe: wireframeMode,
              transparent: opacity < 1,
              opacity: opacity
            });
          } else if (materialType === 'lambert') {
            material = new THREE.MeshLambertMaterial({ 
              color: modelColor || '#4f46e5',
              wireframe: wireframeMode,
              transparent: opacity < 1,
              opacity: opacity
            });
          } else {
            // Standard (PBR) material
            material = new THREE.MeshStandardMaterial({ 
              color: modelColor || '#4f46e5',
              metalness: metalness,
              roughness: roughness,
              wireframe: wireframeMode,
              transparent: opacity < 1,
              opacity: opacity
            });
          }
          
          loadedModel = new THREE.Mesh(geometry, material);
          
          // Center the geometry
          geometry.center();
        } else if (fileExtension === 'obj') {
          // Load OBJ
          const loader = new OBJLoader();
          loadedModel = await loader.loadAsync(url);
          
          // Apply material to all meshes based on material type
          loadedModel.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              let material: THREE.Material;
              
              if (materialType === 'basic') {
                material = new THREE.MeshBasicMaterial({ 
                  color: modelColor || '#4f46e5',
                  wireframe: wireframeMode,
                  transparent: opacity < 1,
                  opacity: opacity
                });
              } else if (materialType === 'phong') {
                material = new THREE.MeshPhongMaterial({ 
                  color: modelColor || '#4f46e5',
                  wireframe: wireframeMode,
                  transparent: opacity < 1,
                  opacity: opacity
                });
              } else if (materialType === 'lambert') {
                material = new THREE.MeshLambertMaterial({ 
                  color: modelColor || '#4f46e5',
                  wireframe: wireframeMode,
                  transparent: opacity < 1,
                  opacity: opacity
                });
              } else {
                material = new THREE.MeshStandardMaterial({ 
                  color: modelColor || '#4f46e5',
                  metalness: metalness,
                  roughness: roughness,
                  wireframe: wireframeMode,
                  transparent: opacity < 1,
                  opacity: opacity
                });
              }
              
              child.material = material;
            }
          });
        } else if (fileExtension === 'gltf' || fileExtension === 'glb') {
          // Load GLTF/GLB
          const loader = new GLTFLoader();
          const gltf = await loader.loadAsync(url);
          loadedModel = gltf.scene;
        } else {
          setError(`Unsupported file format: ${fileExtension}. Supported formats: STL, OBJ, GLTF, GLB`);
          return;
        }

        setModel(loadedModel);
      } catch (err) {
        console.error('Failed to load 3D model:', err);
        setError(err instanceof Error ? err.message : 'Failed to load 3D model');
      }
    };

    loadModel();

    return () => {
      // Cleanup
      if (model) {
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      }
    };
  }, [url, modelColor]);

  // Apply rotation to the model group
  useEffect(() => {
    if (groupRef.current) {
      // Convert degrees to radians
      groupRef.current.rotation.x = (pitch * Math.PI) / 180;
      groupRef.current.rotation.y = (yaw * Math.PI) / 180;
      groupRef.current.rotation.z = (roll * Math.PI) / 180;
    }
  }, [roll, pitch, yaw]);

  if (error) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 0.5, 2]} />
          <meshStandardMaterial color="#ef4444" opacity={0.3} transparent />
        </mesh>
      </group>
    );
  }

  if (!model) {
    return null;
  }

  return (
    <Center>
      <group ref={groupRef}>
        <primitive object={model} />
      </group>
    </Center>
  );
};

// Loading fallback
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="text-center text-muted-foreground">
      <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
      <p className="text-sm">Loading 3D model...</p>
    </div>
  </div>
);

export const ThreeDViewerWidgetRenderer: React.FC<ThreeDViewerWidgetRendererProps> = ({
  widget,
  commonStyles,
  isDesignMode = false,
  value
}) => {
  const [dynamicControls, setDynamicControls] = useState<DynamicControls>({});

  // Parse incoming WebSocket value and update dynamic controls
  useEffect(() => {
    if (value && typeof value === 'object') {
      const controls: DynamicControls = {};
      
      if (value.modelUrl !== undefined) controls.modelUrl = value.modelUrl;
      if (value.roll !== undefined) controls.roll = parseFloat(value.roll);
      if (value.pitch !== undefined) controls.pitch = parseFloat(value.pitch);
      if (value.yaw !== undefined) controls.yaw = parseFloat(value.yaw);
      if (value.cameraX !== undefined) controls.cameraX = parseFloat(value.cameraX);
      if (value.cameraY !== undefined) controls.cameraY = parseFloat(value.cameraY);
      if (value.cameraZ !== undefined) controls.cameraZ = parseFloat(value.cameraZ);
      if (value.zoom !== undefined) controls.zoom = parseFloat(value.zoom);
      if (value.modelColor !== undefined) controls.modelColor = value.modelColor;
      if (value.autoRotate !== undefined) controls.autoRotate = value.autoRotate;
      if (value.rotationSpeed !== undefined) controls.rotationSpeed = parseFloat(value.rotationSpeed);
      
      setDynamicControls(controls);
    } else if (typeof value === 'string') {
      // Handle simple string URL
      setDynamicControls({ modelUrl: value });
    }
  }, [value]);

  // Merge dynamic controls with widget config (dynamic takes priority)
  const modelUrl = dynamicControls.modelUrl ?? widget.config.modelUrl ?? '';
  const showGrid = widget.config.showGrid !== false;
  const showAxes = widget.config.showAxes || false;
  const backgroundColor = widget.config.backgroundColor || '#1a1a1a';
  const modelColor = dynamicControls.modelColor ?? widget.config.modelColor ?? '#4f46e5';
  
  const cameraX = dynamicControls.cameraX ?? widget.config.cameraPosition?.[0] ?? 5;
  const cameraY = dynamicControls.cameraY ?? widget.config.cameraPosition?.[1] ?? 5;
  const cameraZ = dynamicControls.cameraZ ?? widget.config.cameraPosition?.[2] ?? 5;
  const cameraPosition = [cameraX, cameraY, cameraZ];
  const cameraFov = widget.config.cameraFov || 75;
  
  const enableControls = !isDesignMode && (widget.config.enableControls !== false);
  const autoRotate = dynamicControls.autoRotate ?? widget.config.autoRotate ?? false;
  const rotationSpeed = dynamicControls.rotationSpeed ?? widget.config.rotationSpeed ?? 2;
  const enableDamping = widget.config.enableDamping !== false;
  const showContainer = widget.config.showContainer !== false;
  
  const roll = dynamicControls.roll ?? 0;
  const pitch = dynamicControls.pitch ?? 0;
  const yaw = dynamicControls.yaw ?? 0;
  
  // Material settings
  const wireframeMode = widget.config.wireframeMode || false;
  const wireframeColor = widget.config.wireframeColor || '#ffffff';
  const materialType = widget.config.materialType || 'standard';
  const metalness = widget.config.metalness ?? 0;
  const roughness = widget.config.roughness ?? 0.5;
  const opacity = widget.config.modelOpacity ?? 1;
  
  // Lighting settings
  const ambientLightIntensity = widget.config.ambientLightIntensity ?? 0.5;
  const directionalLightIntensity = widget.config.directionalLightIntensity ?? 1;
  const enableShadows = widget.config.enableShadows || false;
  
  // Performance settings
  const enableAntialiasing = widget.config.enableAntialiasing !== false;
  const pixelRatio = widget.config.pixelRatio === 'auto' ? window.devicePixelRatio : (parseFloat(widget.config.pixelRatio) || window.devicePixelRatio);
  
  // Check if URL is 3MF format
  const is3MF = modelUrl.toLowerCase().endsWith('.3mf');
  const fileExtension = modelUrl.split('.').pop()?.toLowerCase();
  const supportedFormats = ['stl', 'obj', 'gltf', 'glb'];
  const isSupported = supportedFormats.includes(fileExtension || '');

  const errorMessage = is3MF 
    ? '3MF format is not directly supported in browser. Please convert to STL, OBJ, or GLTF format.'
    : !isSupported && modelUrl
    ? `Format '${fileExtension}' is not supported. Use: STL, OBJ, GLTF, or GLB`
    : null;

  const canvasContent = (
    <div className="h-full w-full" style={{ minHeight: '200px' }}>
      <Canvas
        dpr={pixelRatio}
        gl={{ antialias: enableAntialiasing }}
        shadows={enableShadows}
      >
        <PerspectiveCamera 
          makeDefault 
          position={cameraPosition as [number, number, number]}
          fov={cameraFov}
        />
        
        {/* Lighting */}
        <ambientLight intensity={ambientLightIntensity} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={directionalLightIntensity}
          castShadow={enableShadows}
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
            autoRotate={autoRotate}
            autoRotateSpeed={rotationSpeed}
          />
        )}
        
        {/* Grid */}
        {showGrid && (
          <Grid 
            args={[10, 10]} 
            cellColor="#6b7280"
            sectionColor="#374151"
            fadeDistance={25}
            fadeStrength={1}
          />
        )}
        
        {/* Axes helper */}
        {showAxes && <axesHelper args={[5]} />}
        
        {/* 3D Model */}
        <Suspense fallback={null}>
          <ModelViewer 
            url={modelUrl} 
            modelColor={modelColor}
            roll={roll}
            pitch={pitch}
            yaw={yaw}
            wireframeMode={wireframeMode}
            wireframeColor={wireframeColor}
            materialType={materialType}
            metalness={metalness}
            roughness={roughness}
            opacity={opacity}
          />
        </Suspense>
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
        <Suspense fallback={<LoadingFallback />}>
          {canvasContent}
        </Suspense>
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
        {errorMessage ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-md p-4">
              <Box className="w-12 h-12 mx-auto mb-3 text-destructive opacity-70" />
              <p className="text-sm font-medium text-destructive mb-2">Unsupported Format</p>
              <p className="text-xs text-muted-foreground mb-3">{errorMessage}</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Conversion options:</p>
                <p>• Use Blender (free) to export as STL/OBJ/GLTF</p>
                <p>• Try online converters like 3dconvert.com</p>
                <p>• Use CAD software export features</p>
              </div>
            </div>
          </div>
        ) : modelUrl ? (
          <Suspense fallback={<LoadingFallback />}>
            {canvasContent}
          </Suspense>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <div>
              <Box className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No 3D model configured</p>
              <p className="text-xs mt-1">Add a model URL in the configuration</p>
              <p className="text-xs mt-2 text-muted-foreground/70">Supported: STL, OBJ, GLTF, GLB</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
