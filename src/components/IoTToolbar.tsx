// Independent IoT Toolbar
// No dependencies on Product Dashboard Designer

import React, { useState } from 'react';
import { useIoTBuilder } from '../contexts/IoTBuilderContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MousePointer2, 
  Move, 
  Undo, 
  Redo, 
  Copy, 
  Clipboard, 
  Save, 
  Eye,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Code2,
  Monitor,
  Smartphone,
  Loader2,
  GitBranch
} from 'lucide-react';

export const IoTToolbar: React.FC = () => {
  const { state, actions } = useIoTBuilder();
  const [isSaving, setIsSaving] = useState(false);

  const tools = [
    { id: 'select', label: 'Select', icon: MousePointer2 },
    { id: 'move', label: 'Move', icon: Move },
    { id: 'connection', label: 'Connection', icon: GitBranch }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await actions.saveDashboard();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card">
      {/* Tool Selection */}
      <div className="flex items-center gap-1">
        {tools.map(tool => (
          <Button
            key={tool.id}
            variant={state.activeTool === tool.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => actions.setTool(tool.id)}
          >
            <tool.icon className="w-4 h-4" />
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* History Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={!state.history.canUndo}
          onClick={actions.undo}
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!state.history.canRedo}
          onClick={actions.redo}
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Clipboard */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={state.selectedWidgets.length === 0}
          onClick={actions.copyWidgets}
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={state.clipboard.length === 0}
          onClick={actions.pasteWidgets}
        >
          <Clipboard className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* View Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant={state.showGrid ? "default" : "ghost"}
          size="sm"
          onClick={actions.toggleGrid}
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={actions.zoomIn}
          disabled={state.zoom >= 2}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={actions.zoomOut}
          disabled={state.zoom <= 0.5}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Responsive View Mode */}
      <div className="flex items-center gap-1 border rounded-md p-1">
        <Button
          variant={state.editingViewMode === 'desktop' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => actions.setEditingViewMode('desktop')}
          className="h-7 px-2"
        >
          <Monitor className="w-3 h-3 mr-1" />
          Desktop
        </Button>
        <Button
          variant={state.editingViewMode === 'mobile' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => actions.setEditingViewMode('mobile')}
          className="h-7 px-2"
        >
          <Smartphone className="w-3 h-3 mr-1" />
          Mobile
        </Button>
      </div>

      <div className="flex-1" />

      {/* Mode Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant={state.mode === 'design' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => actions.setMode('design')}
        >
          Design
        </Button>
        <Button
          variant={state.mode === 'script' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => actions.setMode('script')}
        >
          <Code2 className="w-4 h-4 mr-1" />
          Script
        </Button>
        <Button
          variant={state.mode === 'preview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => actions.setMode('preview')}
        >
          <Eye className="w-4 h-4 mr-1" />
          Preview
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Save */}
      <Button
        variant="default"
        size="sm"
        onClick={handleSave}
        disabled={isSaving}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-1" />
            Save
          </>
        )}
      </Button>
    </div>
  );
};
