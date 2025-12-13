/**
 * Standalone IoT Dashboard Renderer
 * 
 * A self-contained dashboard rendering system that operates independently
 * from the main platform. Designed for:
 * - Industrial environments
 * - Air-gapped networks
 * - Local deployments
 * - Offline operation
 * 
 * Features:
 * - Load dashboard JSON configurations
 * - Configure WebSocket endpoints
 * - Full widget rendering
 * - No authentication required
 * - Portable and standalone
 */

export { StandaloneRenderer } from './StandaloneRenderer';
export { IoTBuilderProvider } from './contexts/IoTBuilderContext';
export { IoTPreview } from './components/IoTPreview';
export { IoTEnhancedWidgetRenderer } from './components/IoTEnhancedWidgetRenderer';

// Export types
export type * from './types';
