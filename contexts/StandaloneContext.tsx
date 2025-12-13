/**
 * Standalone Context Wrapper
 * 
 * Wraps IoTBuilderContext with WebSocket configuration for standalone operation
 */

import React, { createContext, useContext, useEffect } from 'react';
import { IoTBuilderProvider as OriginalIoTBuilderProvider } from './IoTBuilderContext';
import type { IoTDashboardConfig } from '../types';

interface StandaloneContextValue {
  websocketUrl: string;
  connectionId: string;
}

const StandaloneContext = createContext<StandaloneContextValue | null>(null);

export const useStandaloneContext = () => {
  const context = useContext(StandaloneContext);
  if (!context) {
    throw new Error('useStandaloneContext must be used within StandaloneProvider');
  }
  return context;
};

interface StandaloneProviderProps {
  children: React.ReactNode;
  initialConfig: IoTDashboardConfig;
  websocketUrl: string;
  connectionId: string;
}

export const StandaloneProvider: React.FC<StandaloneProviderProps> = ({
  children,
  initialConfig,
  websocketUrl,
  connectionId,
}) => {
  // Update custom WebSocket service with configured URL and ID
  useEffect(() => {
    // Store configuration in window for access by customWebSocketService
    (window as any).__STANDALONE_WS_CONFIG__ = {
      url: websocketUrl,
      id: connectionId,
    };

    console.log('[Standalone] WebSocket configured:', { websocketUrl, connectionId });

    return () => {
      delete (window as any).__STANDALONE_WS_CONFIG__;
    };
  }, [websocketUrl, connectionId]);

  const contextValue: StandaloneContextValue = {
    websocketUrl,
    connectionId,
  };

  // For standalone mode, we'll directly render IoTPreview with the config
  // Store the config in window for IoTPreview to access
  useEffect(() => {
    (window as any).__STANDALONE_DASHBOARD_CONFIG__ = initialConfig;
    return () => {
      delete (window as any).__STANDALONE_DASHBOARD_CONFIG__;
    };
  }, [initialConfig]);

  return (
    <StandaloneContext.Provider value={contextValue}>
      {children}
    </StandaloneContext.Provider>
  );
};
