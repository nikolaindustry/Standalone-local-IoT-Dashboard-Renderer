import { useEffect, useRef, useMemo } from 'react';
import { ScriptExecutor, ConsoleLogCallback, ScriptContext } from '../utils/scriptExecutor';
import { IoTDashboardWidget } from '../types';

export const useScriptExecution = (
  script: string | undefined,
  widgets: IoTDashboardWidget[],
  onWidgetUpdate: (widgetId: string, updates: Partial<IoTDashboardWidget>) => void,
  enabled: boolean = true,
  onConsoleLog?: ConsoleLogCallback,
  context?: ScriptContext,
  supabase?: any,
  onTransformUpdate?: (widgetId: string, transform: {
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    rotation?: number;
  }) => void
) => {
  const executorRef = useRef<ScriptExecutor | null>(null);
  const widgetsInitializedRef = useRef(new Set<string>());
  
  // Store callbacks in refs to avoid dependency issues
  const onWidgetUpdateRef = useRef(onWidgetUpdate);
  const onConsoleLogRef = useRef(onConsoleLog);
  const contextRef = useRef(context);
  const supabaseRef = useRef(supabase);
  const onTransformUpdateRef = useRef(onTransformUpdate);
  
  // Update refs when callbacks change
  useEffect(() => {
    onWidgetUpdateRef.current = onWidgetUpdate;
    onConsoleLogRef.current = onConsoleLog;
    contextRef.current = context;
    supabaseRef.current = supabase;
    onTransformUpdateRef.current = onTransformUpdate;
  }, [onWidgetUpdate, onConsoleLog, context, supabase, onTransformUpdate]);
  
  // Create a stable widget ID list to prevent unnecessary re-execution
  const widgetIds = useMemo(() => 
    widgets.map(w => w.id).sort().join(','),
    [widgets]
  );

  useEffect(() => {
    if (!enabled || !script) return;

    // Only cleanup and recreate executor if script changes or widgets are added/removed
    // Update the executor's widget list without re-running the script
    if (executorRef.current && widgetIds) {
      // Update the internal widgets array
      (executorRef.current as any).widgets = widgets;
      
      // Trigger lifecycle events for new widgets
      const currentWidgetIds = new Set(widgets.map(w => w.id));
      currentWidgetIds.forEach(id => {
        if (!widgetsInitializedRef.current.has(id)) {
          widgetsInitializedRef.current.add(id);
          // Trigger load event immediately
          executorRef.current?.triggerLifecycleEvent(id, 'load');
          // Trigger ready event after a short delay
          setTimeout(() => {
            executorRef.current?.triggerLifecycleEvent(id, 'ready');
          }, 100);
        }
      });
      
      return; // Don't re-execute script, just update widget list
    }

    // Cleanup previous executor only when script changes
    if (executorRef.current) {
      executorRef.current.cleanup();
      widgetsInitializedRef.current.clear();
    }

    // Create new executor with console logging support, context, and supabase client
    executorRef.current = new ScriptExecutor(
      widgets, 
      onWidgetUpdateRef.current, 
      onConsoleLogRef.current, 
      contextRef.current, 
      supabaseRef.current, 
      onTransformUpdateRef.current
    );

    try {
      executorRef.current.execute(script);
      
      // Trigger lifecycle events for all widgets after script execution
      widgets.forEach(widget => {
        widgetsInitializedRef.current.add(widget.id);
        // Trigger load event immediately
        executorRef.current?.triggerLifecycleEvent(widget.id, 'load');
        // Trigger ready event after a short delay
        setTimeout(() => {
          executorRef.current?.triggerLifecycleEvent(widget.id, 'ready');
        }, 100);
      });
    } catch (error) {
      console.error('[Dashboard] Script execution failed:', error);
    }

    return () => {
      if (executorRef.current) {
        // Trigger destroy events before cleanup
        widgets.forEach(widget => {
          executorRef.current?.triggerLifecycleEvent(widget.id, 'destroy');
        });
        executorRef.current.cleanup();
        executorRef.current = null;
        widgetsInitializedRef.current.clear();
      }
    };
  }, [script, enabled, widgetIds]); // Only re-execute when script changes or widgets change

  return {
    triggerWidgetEvent: (widgetId: string, event: string, value: any) => {
      executorRef.current?.triggerWidgetEvent(widgetId, event, value);
    }
  };
};
