// Independent IoT Dashboard Designer
// No dependencies on Product Dashboard Designer

import React, { useState } from 'react';
import { useIoTBuilder, IoTBuilderProvider } from '../contexts/IoTBuilderContext';
import { IoTHeader } from './IoTHeader';
import { IoTToolbar } from './IoTToolbar';
import { IoTPageTabs } from './IoTPageTabs';
import { IoTWidgetLibrary } from './IoTWidgetLibrary';
import { IoTCanvas } from './IoTCanvas';
import { IoTPropertiesPanel } from './IoTPropertiesPanel';
import { IoTScriptEditor } from './IoTScriptEditor';
import { IoTPreview } from './IoTPreview';
import { AIDashboardChat } from './AIDashboardChat';
import { Loader2, GripVertical } from 'lucide-react';

interface IoTDashboardDesignerProps {
  dashboardId?: string;
}

const IoTDashboardDesignerContent: React.FC = () => {
  const { state, actions } = useIoTBuilder();
  const [propertiesPanelWidth, setPropertiesPanelWidth] = useState(320);
  const [widgetLibraryWidth, setWidgetLibraryWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingLibrary, setIsResizingLibrary] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Keyboard shortcuts for page navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Tab to navigate pages
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        
        const pages = state.config?.pages || [];
        const currentIndex = pages.findIndex(p => p.id === state.activePageId);
        
        if (pages.length > 1) {
          if (e.shiftKey) {
            // Previous page
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : pages.length - 1;
            actions.setActivePage(pages[prevIndex].id);
          } else {
            // Next page
            const nextIndex = currentIndex < pages.length - 1 ? currentIndex + 1 : 0;
            actions.setActivePage(pages[nextIndex].id);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.config?.pages, state.activePageId, actions]);

  // Properties panel resize handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = window.innerWidth - e.clientX;
    const minWidth = 280;
    const maxWidth = 600;
    setPropertiesPanelWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Widget library resize handlers
  const handleLibraryMouseDown = (e: React.MouseEvent) => {
    setIsResizingLibrary(true);
    e.preventDefault();
  };

  const handleLibraryMouseMove = (e: MouseEvent) => {
    if (!isResizingLibrary) return;
    const newWidth = e.clientX;
    const minWidth = 200;
    const maxWidth = 500;
    setWidgetLibraryWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
  };

  const handleLibraryMouseUp = () => {
    setIsResizingLibrary(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing]);

  React.useEffect(() => {
    if (isResizingLibrary) {
      document.addEventListener('mousemove', handleLibraryMouseMove);
      document.addEventListener('mouseup', handleLibraryMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleLibraryMouseMove);
        document.removeEventListener('mouseup', handleLibraryMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizingLibrary]);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground">{state.error}</p>
        </div>
      </div>
    );
  }

  if (!state.config) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">No Dashboard</h2>
          <p className="text-muted-foreground">Please create a new dashboard to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <IoTHeader onOpenAIChat={() => setIsAIChatOpen(true)} />
      <IoTToolbar />
      {(state.mode === 'design' || state.mode === 'preview') && <IoTPageTabs />}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Widget Library - Only show in design mode */}
        {state.mode === 'design' && (
          <div 
            className="border-r border-border bg-card flex relative"
            style={{ width: widgetLibraryWidth }}
          >
            <div className="flex-1 pr-2">
              <IoTWidgetLibrary />
            </div>
            
            {/* Resize Handle */}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 hover:w-2 bg-transparent hover:bg-primary/20 cursor-col-resize transition-all duration-200 flex items-center justify-center group z-10"
              onMouseDown={handleLibraryMouseDown}
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <GripVertical className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
          </div>
        )}
        
        {/* Main Canvas */}
        <div className="flex-1 relative">
          {state.mode === 'design' ? (
            <IoTCanvas />
          ) : state.mode === 'script' ? (
            <IoTScriptEditor />
          ) : (
            <IoTPreview />
          )}
        </div>
        
        {/* Properties Panel - Show in design AND preview mode */}
        {(state.mode === 'design' || state.mode === 'preview') && (
          <div 
            className="border-l border-border bg-card flex relative"
            style={{ width: propertiesPanelWidth }}
          >
            {/* Resize Handle */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 hover:w-2 bg-transparent hover:bg-primary/20 cursor-col-resize transition-all duration-200 flex items-center justify-center group z-10"
              onMouseDown={handleMouseDown}
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <GripVertical className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
            
            <div className="flex-1 pl-2">
              <IoTPropertiesPanel />
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Panel */}
      <AIDashboardChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </div>
  );
};

export const IoTDashboardDesigner: React.FC<IoTDashboardDesignerProps> = ({ dashboardId }) => {
  return (
    <IoTBuilderProvider dashboardId={dashboardId} mode="design">
      <IoTDashboardDesignerContent />
    </IoTBuilderProvider>
  );
};
