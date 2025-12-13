import React, { useEffect, useState, useRef, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Environment, useGLTF, Stage } from '@react-three/drei';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

interface VirtualTwin3DWidgetRendererProps {
  widget: IoTDashboardWidget;
  commonStyles: React.CSSProperties;
  isDesignMode?: boolean;
  value?: any;
}

interface Model3D {
  id: string;
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible: boolean;
  color?: string;
  metalness?: number;
  roughness?: number;
  opacity?: number;
  wireframe?: boolean;
  animationIndex?: number;
  animationSpeed?: number;
}

// Component to render a single 3D model (supports STL, glTF, GLB)
const Model3DRenderer: React.FC<{
  model: Model3D;
  isDesignMode: boolean;
}> = ({ model, isDesignMode }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>([]);
  
  // Validate URL before attempting to load
  if (!model.url || model.url.trim() === '') {
    console.warn('[VirtualTwin3D] Model has no URL, skipping render:', model.id);
    return null;
  }

  // Determine file type from URL
  const fileExtension = model.url.toLowerCase().split('.').pop()?.split('?')[0] || '';
  const isSTL = fileExtension === 'stl';
  const isGLTF = fileExtension === 'gltf' || fileExtension === 'glb';

  // Load STL files
  if (isSTL) {
    try {
      const stlGeometry = useLoader(STLLoader, model.url);
      
      useEffect(() => {
        if (stlGeometry) {
          // Center the geometry
          stlGeometry.center();
          setGeometry(stlGeometry);
        }
      }, [stlGeometry]);

      if (!geometry) return null;

      return (
        <group
          ref={groupRef}
          position={model.position}
          rotation={model.rotation}
          scale={model.scale}
          visible={model.visible}
        >
          <mesh geometry={geometry}>
            <meshStandardMaterial
              color={model.color || '#808080'}
              metalness={model.metalness ?? 0.5}
              roughness={model.roughness ?? 0.5}
              opacity={model.opacity ?? 1}
              transparent={model.opacity !== undefined && model.opacity < 1}
              wireframe={model.wireframe || false}
            />
          </mesh>
        </group>
      );
    } catch (error) {
      console.error('[VirtualTwin3D] Error loading STL model:', model.url, error);
      return (
        <mesh position={model.position}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#ff0000" wireframe />
        </mesh>
      );
    }
  }

  // Load glTF/GLB files
  if (isGLTF) {
    try {
      const gltfData = useGLTF(model.url);
      const mixer = useRef<THREE.AnimationMixer | null>(null);

      useEffect(() => {
        if (gltfData.scene) {
          // Clone the scene to avoid shared state between instances
          const clonedScene = gltfData.scene.clone(true);
          setScene(clonedScene);
          setAnimations(gltfData.animations || []);
        }
      }, [gltfData]);

      useEffect(() => {
        if (scene && animations.length > 0 && model.animationIndex !== undefined) {
          mixer.current = new THREE.AnimationMixer(scene);
          const clip = animations[model.animationIndex];
          if (clip) {
            const action = mixer.current.clipAction(clip);
            action.timeScale = model.animationSpeed || 1;
            action.play();
          }
        }

        return () => {
          if (mixer.current) {
            mixer.current.stopAllAction();
          }
        };
      }, [scene, animations, model.animationIndex, model.animationSpeed]);

      useEffect(() => {
        const delta = 0.01;
        const interval = setInterval(() => {
          if (mixer.current) {
            mixer.current.update(delta);
          }
        }, 16);

        return () => clearInterval(interval);
      }, []);

      // Apply material overrides
      useEffect(() => {
        if (scene) {
          scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.material) {
                const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                materials.forEach((mat: THREE.Material) => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    if (model.color) mat.color = new THREE.Color(model.color);
                    if (model.metalness !== undefined) mat.metalness = model.metalness;
                    if (model.roughness !== undefined) mat.roughness = model.roughness;
                    if (model.opacity !== undefined) {
                      mat.opacity = model.opacity;
                      mat.transparent = model.opacity < 1;
                    }
                    if (model.wireframe !== undefined) mat.wireframe = model.wireframe;
                  }
                });
              }
            }
          });
        }
      }, [scene, model.color, model.metalness, model.roughness, model.opacity, model.wireframe]);

      if (!scene) return null;

      return (
        <group
          ref={groupRef}
          position={model.position}
          rotation={model.rotation}
          scale={model.scale}
          visible={model.visible}
        >
          <primitive object={scene} />
        </group>
      );
    } catch (error) {
      console.error('[VirtualTwin3D] Error loading glTF/GLB model:', model.url, error);
      return (
        <mesh position={model.position}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#ff0000" wireframe />
        </mesh>
      );
    }
  }

  // Unsupported file type
  console.error('[VirtualTwin3D] Unsupported file format:', fileExtension);
  return (
    <mesh position={model.position}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#ff9900" wireframe />
    </mesh>
  );
};

// Loading fallback
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="text-center text-muted-foreground">
      <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
      <p className="text-sm">Loading 3D Virtual Twin...</p>
    </div>
  </div>
);

export const VirtualTwin3DWidgetRenderer: React.FC<VirtualTwin3DWidgetRendererProps> = ({
  widget,
  commonStyles,
  isDesignMode = false,
  value
}) => {
  const [models, setModels] = useState<Model3D[]>([]);

  // Parse incoming WebSocket value and update models
  useEffect(() => {
    if (value) {
      console.log('[VirtualTwin3D] Received value:', value);
      
      try {
        // Handle different message formats
        if (typeof value === 'object') {
          // Format 0: Array of update objects [{modelId, updates}, ...]
          if (Array.isArray(value)) {
            value.forEach((item: any) => {
              if (item.modelId && item.updates) {
                setModels(prev => {
                  const updated = [...prev];
                  const modelIndex = updated.findIndex(m => m.id === item.modelId);
                  if (modelIndex !== -1) {
                    updated[modelIndex] = { ...updated[modelIndex], ...item.updates };
                    console.log('[VirtualTwin3D] Updated model from array:', item.modelId, item.updates);
                  }
                  return updated;
                });
              }
            });
            return;
          }
          
          // Format 1: { modelId: "model1", updates: { position: [x, y, z], ... } }
          if (value.modelId && value.updates) {
            setModels(prev => {
              const updated = [...prev];
              const modelIndex = updated.findIndex(m => m.id === value.modelId);
              if (modelIndex !== -1) {
                updated[modelIndex] = { ...updated[modelIndex], ...value.updates };
                console.log('[VirtualTwin3D] Updated model:', value.modelId, value.updates);
              }
              return updated;
            });
          }
          // Format 2: { models: [{id, url, position, ...}, ...] }
          else if (value.models && Array.isArray(value.models)) {
            const newModels: Model3D[] = value.models.map((m: any) => ({
              id: m.id || `model-${Date.now()}`,
              url: m.url || '',
              position: m.position || [0, 0, 0],
              rotation: m.rotation || [0, 0, 0],
              scale: m.scale || [1, 1, 1],
              visible: m.visible !== undefined ? m.visible : true,
              color: m.color,
              metalness: m.metalness,
              roughness: m.roughness,
              opacity: m.opacity,
              wireframe: m.wireframe,
              animationIndex: m.animationIndex,
              animationSpeed: m.animationSpeed
            }));
            setModels(newModels);
            console.log('[VirtualTwin3D] Set models:', newModels);
          }
          // Format 3: { action: "add|remove|update", modelId, model }
          else if (value.action) {
            if (value.action === 'add' && value.model) {
              const newModel: Model3D = {
                id: value.model.id || `model-${Date.now()}`,
                url: value.model.url || '',
                position: value.model.position || [0, 0, 0],
                rotation: value.model.rotation || [0, 0, 0],
                scale: value.model.scale || [1, 1, 1],
                visible: value.model.visible !== undefined ? value.model.visible : true,
                color: value.model.color,
                metalness: value.model.metalness,
                roughness: value.model.roughness,
                opacity: value.model.opacity,
                wireframe: value.model.wireframe,
                animationIndex: value.model.animationIndex,
                animationSpeed: value.model.animationSpeed
              };
              setModels(prev => [...prev, newModel]);
              console.log('[VirtualTwin3D] Added model:', newModel.id);
            } else if (value.action === 'remove' && value.modelId) {
              setModels(prev => prev.filter(m => m.id !== value.modelId));
              console.log('[VirtualTwin3D] Removed model:', value.modelId);
            } else if (value.action === 'update' && value.modelId && value.updates) {
              setModels(prev => {
                const updated = [...prev];
                const modelIndex = updated.findIndex(m => m.id === value.modelId);
                if (modelIndex !== -1) {
                  updated[modelIndex] = { ...updated[modelIndex], ...value.updates };
                }
                return updated;
              });
              console.log('[VirtualTwin3D] Updated model:', value.modelId);
            }
          }
        }
      } catch (error) {
        console.error('[VirtualTwin3D] Error processing message:', error);
      }
    }
  }, [value]);

  // Initialize with configured models
  useEffect(() => {
    if (widget.config.initialModels && Array.isArray(widget.config.initialModels)) {
      const initialModels: Model3D[] = widget.config.initialModels.map((m: any) => ({
        id: m.id || `model-${Date.now()}-${Math.random()}`,
        url: m.url || '',
        position: m.position || [0, 0, 0],
        rotation: m.rotation || [0, 0, 0],
        scale: m.scale || [1, 1, 1],
        visible: m.visible !== undefined ? m.visible : true,
        color: m.color,
        metalness: m.metalness,
        roughness: m.roughness,
        opacity: m.opacity,
        wireframe: m.wireframe,
        animationIndex: m.animationIndex,
        animationSpeed: m.animationSpeed
      }));
      setModels(initialModels);
    }
  }, [widget.config.initialModels]);

  // Configuration with defaults
  const showGrid = widget.config.showGrid !== false;
  const showAxes = widget.config.showAxes !== false;
  const backgroundColor = widget.config.backgroundColor || '#1a1a1a';
  const useEnvironment = widget.config.useEnvironment !== false;
  const environmentPreset = widget.config.environmentPreset || 'city';
  const useStaging = widget.config.useStaging || false;
  
  // Grid settings
  const gridSize = widget.config.gridSize ?? 10;
  const gridCellColor = widget.config.gridCellColor || '#6b7280';
  const gridSectionColor = widget.config.gridSectionColor || '#374151';
  
  // Axes settings
  const axesSize = widget.config.axesSize ?? 5;
  
  // Camera settings
  const cameraX = widget.config.cameraPosition?.[0] ?? 5;
  const cameraY = widget.config.cameraPosition?.[1] ?? 5;
  const cameraZ = widget.config.cameraPosition?.[2] ?? 5;
  const cameraPosition: [number, number, number] = [cameraX, cameraY, cameraZ];
  const cameraFov = widget.config.cameraFov || 50;
  
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
  const enableShadows = widget.config.enableShadows || false;

  // Filter out models with invalid URLs
  const validModels = models.filter(m => m.url && m.url.trim() !== '');

  const canvasContent = (
    <div className="h-full w-full" style={{ minHeight: '200px' }}>
      <Canvas
        dpr={pixelRatio}
        gl={{ antialias: enableAntialiasing }}
        shadows={enableShadows}
      >
        <PerspectiveCamera 
          makeDefault 
          position={cameraPosition}
          fov={cameraFov}
        />
        
        {/* Lighting */}
        {!useStaging && (
          <>
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
          </>
        )}
        
        {/* Environment */}
        {useEnvironment && !useStaging && (
          <Environment preset={environmentPreset as any} />
        )}
        
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
        {showGrid && !useStaging && (
          <Grid 
            args={[gridSize, gridSize]} 
            cellColor={gridCellColor}
            sectionColor={gridSectionColor}
            fadeDistance={25}
            fadeStrength={1}
          />
        )}
        
        {/* Axes helper */}
        {showAxes && !useStaging && <axesHelper args={[axesSize]} />}
        
        {/* 3D Models */}
        <Suspense fallback={null}>
          {useStaging && validModels.length > 0 ? (
            <Stage>
              {validModels.map((model) => (
                <Model3DRenderer key={model.id} model={model} isDesignMode={isDesignMode} />
              ))}
            </Stage>
          ) : (
            validModels.map((model) => (
              <Model3DRenderer key={model.id} model={model} isDesignMode={isDesignMode} />
            ))
          )}
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
