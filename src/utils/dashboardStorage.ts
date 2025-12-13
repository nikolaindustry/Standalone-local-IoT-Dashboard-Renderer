/**
 * Dashboard Storage Utility
 * 
 * Manages persistent storage of multiple dashboard configurations in localStorage
 */

import type { IoTDashboardConfig } from '../types';

const STORAGE_KEY = 'standalone_dashboards';
const ACTIVE_DASHBOARD_KEY = 'standalone_active_dashboard_id';

export interface StoredDashboard {
  id: string;
  name: string;
  description?: string;
  config: IoTDashboardConfig;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all stored dashboards from localStorage
 */
export const getAllDashboards = (): StoredDashboard[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as StoredDashboard[];
  } catch (error) {
    console.error('[DashboardStorage] Failed to load dashboards:', error);
    return [];
  }
};

/**
 * Get a specific dashboard by ID
 */
export const getDashboardById = (id: string): StoredDashboard | null => {
  const dashboards = getAllDashboards();
  return dashboards.find(d => d.id === id) || null;
};

/**
 * Save a new dashboard or update an existing one
 */
export const saveDashboard = (config: IoTDashboardConfig, existingId?: string): StoredDashboard => {
  const dashboards = getAllDashboards();
  const now = new Date().toISOString();
  
  const id = existingId || config.id || generateDashboardId();
  const existingIndex = dashboards.findIndex(d => d.id === id);
  
  const dashboard: StoredDashboard = {
    id,
    name: config.name || 'Untitled Dashboard',
    description: config.description,
    config: { ...config, id },
    createdAt: existingIndex >= 0 ? dashboards[existingIndex].createdAt : now,
    updatedAt: now,
  };
  
  if (existingIndex >= 0) {
    dashboards[existingIndex] = dashboard;
  } else {
    dashboards.push(dashboard);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
  console.log(`[DashboardStorage] Saved dashboard: ${dashboard.name} (${id})`);
  
  return dashboard;
};

/**
 * Delete a dashboard by ID
 */
export const deleteDashboard = (id: string): boolean => {
  try {
    const dashboards = getAllDashboards();
    const filtered = dashboards.filter(d => d.id !== id);
    
    if (filtered.length === dashboards.length) {
      return false; // Dashboard not found
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // If deleted dashboard was active, clear active dashboard
    if (getActiveDashboardId() === id) {
      clearActiveDashboard();
    }
    
    console.log(`[DashboardStorage] Deleted dashboard: ${id}`);
    return true;
  } catch (error) {
    console.error('[DashboardStorage] Failed to delete dashboard:', error);
    return false;
  }
};

/**
 * Set the active dashboard ID
 */
export const setActiveDashboardId = (id: string): void => {
  localStorage.setItem(ACTIVE_DASHBOARD_KEY, id);
};

/**
 * Get the active dashboard ID
 */
export const getActiveDashboardId = (): string | null => {
  return localStorage.getItem(ACTIVE_DASHBOARD_KEY);
};

/**
 * Clear the active dashboard
 */
export const clearActiveDashboard = (): void => {
  localStorage.removeItem(ACTIVE_DASHBOARD_KEY);
};

/**
 * Get the active dashboard
 */
export const getActiveDashboard = (): StoredDashboard | null => {
  const activeId = getActiveDashboardId();
  if (!activeId) return null;
  return getDashboardById(activeId);
};

/**
 * Generate a unique dashboard ID
 */
const generateDashboardId = (): string => {
  return `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Import dashboard from JSON file
 */
export const importDashboardFromFile = (file: File): Promise<IoTDashboardConfig> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = JSON.parse(content) as IoTDashboardConfig;
        
        // Validate basic structure
        if (!config.pages || !Array.isArray(config.pages)) {
          throw new Error('Invalid dashboard configuration: missing pages array');
        }
        
        resolve(config);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Export dashboard to JSON file
 */
export const exportDashboardToFile = (dashboard: StoredDashboard): void => {
  const dataStr = JSON.stringify(dashboard.config, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${dashboard.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Clear all dashboards (use with caution)
 */
export const clearAllDashboards = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ACTIVE_DASHBOARD_KEY);
  console.log('[DashboardStorage] Cleared all dashboards');
};
