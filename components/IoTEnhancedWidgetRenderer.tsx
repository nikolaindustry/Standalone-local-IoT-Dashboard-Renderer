import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IoTDashboardWidget, IoTDashboardPage } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import deviceWebSocketService from '@/services/deviceWebSocketService';
import { parseColor } from '../utils/colorUtils';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Html5Qrcode } from 'html5-qrcode';
import RuntimeChartWidget from './RuntimeChartWidget';
import { ColorPicker } from './ColorPicker';
import { ButtonWidgetRenderer } from './widget-renderers/ButtonWidgetRenderer';
import { SwitchWidgetRenderer } from './widget-renderers/SwitchWidgetRenderer';
import { GaugeWidgetRenderer } from './widget-renderers/GaugeWidgetRenderer';
import { SliderWidgetRenderer } from './widget-renderers/SliderWidgetRenderer';
import { StatusWidgetRenderer } from './widget-renderers/StatusWidgetRenderer';
import { LabelWidgetRenderer } from './widget-renderers/LabelWidgetRenderer';
import { FormWidgetRenderer } from './widget-renderers/FormWidgetRenderer';
import { QRScannerField } from './widget-renderers/QRScannerField';
import { ImageWidgetRenderer } from './widget-renderers/ImageWidgetRenderer';
import { ChartWidgetRenderer } from './widget-renderers/ChartWidgetRenderer';
import { TableWidgetRenderer } from './widget-renderers/TableWidgetRenderer';
import { ColorPickerWidgetRenderer } from './widget-renderers/ColorPickerWidgetRenderer';
import { MenuWidgetRenderer } from './widget-renderers/MenuWidgetRenderer';
import { MapWidgetRenderer } from './widget-renderers/MapWidgetRenderer';
import { MissionPlanningMapWidgetRenderer } from './widget-renderers/MissionPlanningMapWidgetRenderer';
import { ShapeWidgetRenderer } from './widget-renderers/ShapeWidgetRenderer';
import { JoystickWidgetRenderer } from './widget-renderers/JoystickWidgetRenderer';
import { SvgWidgetRenderer } from './widget-renderers/SvgWidgetRenderer';
import { NavigatePageWidgetRenderer } from './widget-renderers/NavigatePageWidgetRenderer';
import { UrlButtonWidgetRenderer } from './widget-renderers/UrlButtonWidgetRenderer';
import { DatabaseFormWidgetRenderer } from './widget-renderers/DatabaseFormWidgetRenderer';
import { DynamicRepeaterWidgetRenderer } from './widget-renderers/DynamicRepeaterWidgetRenderer';
import { HeatmapWidgetRenderer } from './widget-renderers/HeatmapWidgetRenderer';
import { CompassWidgetRenderer } from './widget-renderers/CompassWidgetRenderer';
import { AttitudeWidgetRenderer } from './widget-renderers/AttitudeWidgetRenderer';
import { HtmlViewerWidgetRenderer } from './widget-renderers/HtmlViewerWidgetRenderer';
import { ThreeDViewerWidgetRenderer } from './widget-renderers/ThreeDViewerWidgetRenderer';
import { DateTimeWeatherWidgetRenderer } from './widget-renderers/DateTimeWeatherWidgetRenderer';
import { CountdownTimerWidgetRenderer } from './widget-renderers/CountdownTimerWidgetRenderer';
import { ScheduleWidgetRenderer } from './widget-renderers/ScheduleWidgetRenderer';
import { RuleWidgetRenderer } from './widget-renderers/RuleWidgetRenderer';
import { TextToSpeechWidgetRenderer } from './widget-renderers/TextToSpeechWidgetRenderer';
import { WebRTCViewerWidgetRenderer } from './widget-renderers/WebRTCViewerWidgetRenderer';
import { WebRTCCameraWidgetRenderer } from './widget-renderers/WebRTCCameraWidgetRenderer';
import { VoiceToTextWidgetRenderer } from './widget-renderers/VoiceToTextWidgetRenderer';
import { TextInputWidgetRenderer } from './widget-renderers/TextInputWidgetRenderer';
import { VideoPlayerWidgetRenderer } from './widget-renderers/VideoPlayerWidgetRenderer';
import { SpotifyPlayerWidgetRenderer } from './widget-renderers/SpotifyPlayerWidgetRenderer';
import { EMSpectrumWidgetRenderer } from './widget-renderers/EMSpectrumWidgetRenderer';
import { SpectralGraphWidgetRenderer } from './widget-renderers/SpectralGraphWidgetRenderer';
import { VectorPlot3DWidgetRenderer } from './widget-renderers/VectorPlot3DWidgetRenderer';
import { VirtualTwin3DWidgetRenderer } from './widget-renderers/VirtualTwin3DWidgetRenderer';
import { UsbSerialWidgetRenderer } from './widget-renderers/UsbSerialWidgetRenderer';
import PaymentActionWidget from '../widgets/PaymentActionWidget';


import {
  Gauge, 
  Activity, 
  Image as ImageIcon, 
  FileText, 
  Circle,
  Power,
  Thermometer,
  Zap,
  Wifi,
  WifiOff,
  Clock,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  StopCircle,
  QrCode,
  Camera,
  Square,
  Smartphone,
  Monitor,
  Battery,
  Volume2 as Volume,
  Cloud,
  Droplets,
  Sun,
  Wind,
  Sliders,
  ToggleLeft,
  Bluetooth,
  Gamepad2,
  Navigation
} from 'lucide-react';

interface IoTEnhancedWidgetRendererProps {
  widget: IoTDashboardWidget;
  deviceId?: string;
  productId?: string;
  isSelected?: boolean;
  isDesignMode?: boolean;
  value?: any;
  onValueChange?: (value: any) => void;
  onAction?: (actionId: string, parameters?: Record<string, any>) => void;
  onUpdate?: (id: string, updates: Partial<IoTDashboardWidget>) => void;
  onWidgetEvent?: (widgetId: string, event: string, value: any) => void;
  deviceStatus?: 'online' | 'offline' | 'connecting';
  lastUpdate?: Date;
  pages?: Array<{ id: string; name: string }>;
  activePageId?: string;
  onNavigateToPage?: (pageId: string) => void;
}

export const IoTEnhancedWidgetRenderer: React.FC<IoTEnhancedWidgetRendererProps> = ({
  widget,
  deviceId,
  productId,
  isSelected = false,
  isDesignMode = false,
  value,
  onValueChange,
  onAction,
  onUpdate,
  onWidgetEvent,
  deviceStatus = 'online',
  lastUpdate,
  pages,
  activePageId,
  onNavigateToPage
}) => {
  const { toast } = useToast();
  const [localValue, setLocalValue] = useState(value);
  const [isInteracting, setIsInteracting] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleValueChange = useCallback((newValue: any) => {
    if (isDesignMode) return;
    
    setLocalValue(newValue);
    setIsInteracting(true);
    
    // Trigger change event immediately for script execution
    onValueChange?.(newValue);
    onWidgetEvent?.(widget.id, 'change', newValue);
    
    // For switches, execute specific 'on' or 'off' action instead of 'toggle'
    if (widget.type === 'switch') {
      // Execute specific on/off action based on the new value
      if (newValue) {
        executeAction('on', { checked: newValue });
        onWidgetEvent?.(widget.id, 'on', newValue);
      } else {
        executeAction('off', { checked: newValue });
        onWidgetEvent?.(widget.id, 'off', newValue);
      }
    }
    
    // Debounce interaction state
    const timeoutId = setTimeout(() => {
      setIsInteracting(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [isDesignMode, onValueChange, widget.type, onWidgetEvent, widget.id]);

  const executeAction = useCallback((actionId: string, parameters?: Record<string, any>) => {
    if (isDesignMode) return;
    
    setLastAction(actionId);
    onAction?.(actionId, parameters);
    
    // Handle isPressed state for button visual feedback
    if (widget.type === 'button') {
      if (actionId === 'press') {
        setIsPressed(true);
        onWidgetEvent?.(widget.id, 'push', true);
      } else if (actionId === 'release') {
        setIsPressed(false);
        onWidgetEvent?.(widget.id, 'release', false);
      }
    }
    
    // NEW EVENT SYSTEM: Check if widget has event-based configuration
    if (widget.config?.widgetEvents && Array.isArray(widget.config.widgetEvents)) {
      // Find matching events for this action
      const matchingEvents = widget.config.widgetEvents.filter((event: any) => {
        // Map action IDs to event types
        // For switches: 'on' action only triggers 'on' events, 'off' action only triggers 'off' events
        const actionToEventMap: Record<string, string[]> = {
          'press': ['push', 'click'],
          'release': ['release'],
          'click': ['click'],
          'toggle': ['toggle', 'change'],
          'valueChange': ['change', 'slide', 'slideEnd'],
          'colorChange': ['change'],
          'positionChange': ['change'],
          'on': ['on'],  // Only trigger 'on' events when action is 'on'
          'off': ['off'],  // Only trigger 'off' events when action is 'off'
          'submit': ['submit', 'change'],  // Text input submit
          'clear': ['clear'],  // Text input clear
          'complete': ['complete'],  // Countdown timer complete
          'start': ['start'],  // Countdown timer start
          'pause': ['pause'],  // Countdown timer pause
          'reset': ['reset'],  // Countdown timer reset
          'speechStart': ['speechStart'],  // Voice-to-text speech start
          'speechEnd': ['speechEnd', 'submit'],  // Voice-to-text speech end
          'speechResult': ['speechResult', 'change'],  // Voice-to-text speech result
          'paymentSuccess': ['paymentSuccess', 'payment.success'],  // Payment success (both naming conventions)
          'paymentFailed': ['paymentFailed', 'payment.failure']  // Payment failed (both naming conventions)
        };
        
        const eventTypes = actionToEventMap[actionId] || [];
        return eventTypes.includes(event.eventType);
      });
      
      // Execute each matching event's targets
      matchingEvents.forEach((event: any) => {
        if (event.targets && Array.isArray(event.targets)) {
          // Send the targets array as WebSocket messages
          event.targets.forEach((target: any) => {
            if (target.targetId && target.payload) {
              // Prepare payload with dynamic values
              let finalPayload = target.payload;
              
              // For text-input widgets, inject the input value into the payload
              if (widget.type === 'text-input' && actionId === 'submit' && parameters?.value !== undefined) {
                // Deep clone the payload to avoid mutation
                finalPayload = JSON.parse(JSON.stringify(target.payload));
                
                // Inject the input value into ALL possible locations
                const inputValue = parameters.value;
                
                // 1. Top-level value field
                if (finalPayload.value !== undefined) {
                  finalPayload.value = inputValue;
                }
                
                // 2. Parameters object
                if (finalPayload.parameters && typeof finalPayload.parameters === 'object') {
                  if (finalPayload.parameters.value !== undefined) {
                    finalPayload.parameters.value = inputValue;
                  }
                  if (finalPayload.parameters.message !== undefined) {
                    finalPayload.parameters.message = inputValue;
                  }
                  if (finalPayload.parameters.text !== undefined) {
                    finalPayload.parameters.text = inputValue;
                  }
                }
                
                // 3. Commands array -> actions array -> params
                if (finalPayload.commands && Array.isArray(finalPayload.commands)) {
                  finalPayload.commands.forEach((cmd: any) => {
                    if (cmd.actions && Array.isArray(cmd.actions)) {
                      cmd.actions.forEach((action: any) => {
                        if (action.params && typeof action.params === 'object') {
                          // Inject into any 'value', 'message', or 'text' field in params
                          if (action.params.value !== undefined) {
                            action.params.value = inputValue;
                          }
                          if (action.params.message !== undefined) {
                            action.params.message = inputValue;
                          }
                          if (action.params.text !== undefined) {
                            action.params.text = inputValue;
                          }
                        }
                      });
                    }
                  });
                }
                
                // 4. Action parameters
                if (finalPayload.actionParameters && typeof finalPayload.actionParameters === 'object') {
                  finalPayload.actionParameters.inputValue = inputValue;
                  if (finalPayload.actionParameters.value !== undefined) {
                    finalPayload.actionParameters.value = inputValue;
                  }
                }
              }
              
              // For slider widgets, inject the slider value into the payload
              if (widget.type === 'slider' && (actionId === 'valueChange' || actionId === 'slideEnd' || actionId === 'change') && parameters?.value !== undefined) {
                // Deep clone the payload to avoid mutation
                finalPayload = JSON.parse(JSON.stringify(target.payload));
                
                // Inject the slider value into ALL possible locations
                const sliderValue = parameters.value;
                
                // 1. Top-level value field
                if (finalPayload.value !== undefined) {
                  finalPayload.value = sliderValue;
                }
                
                // 2. Parameters object
                if (finalPayload.parameters && typeof finalPayload.parameters === 'object') {
                  if (finalPayload.parameters.value !== undefined) {
                    finalPayload.parameters.value = sliderValue;
                  }
                  if (finalPayload.parameters.speed !== undefined) {
                    finalPayload.parameters.speed = sliderValue;
                  }
                  if (finalPayload.parameters.level !== undefined) {
                    finalPayload.parameters.level = sliderValue;
                  }
                  if (finalPayload.parameters.intensity !== undefined) {
                    finalPayload.parameters.intensity = sliderValue;
                  }
                }
                
                // 3. Commands array -> actions array -> params
                if (finalPayload.commands && Array.isArray(finalPayload.commands)) {
                  finalPayload.commands.forEach((cmd: any) => {
                    if (cmd.actions && Array.isArray(cmd.actions)) {
                      cmd.actions.forEach((action: any) => {
                        if (action.params && typeof action.params === 'object') {
                          // Inject into any 'value', 'speed', 'level', 'intensity' field in params
                          if (action.params.value !== undefined) {
                            action.params.value = sliderValue;
                          }
                          if (action.params.speed !== undefined) {
                            action.params.speed = sliderValue;
                          }
                          if (action.params.level !== undefined) {
                            action.params.level = sliderValue;
                          }
                          if (action.params.intensity !== undefined) {
                            action.params.intensity = sliderValue;
                          }
                        }
                      });
                    }
                  });
                }
                
                // 4. Action parameters
                if (finalPayload.actionParameters && typeof finalPayload.actionParameters === 'object') {
                  finalPayload.actionParameters.sliderValue = sliderValue;
                  if (finalPayload.actionParameters.value !== undefined) {
                    finalPayload.actionParameters.value = sliderValue;
                  }
                }
              }
              
              // For form widgets, inject the form data into the payload
              if ((widget.type === 'form' || widget.type === 'database-form') && actionId === 'submit' && parameters?.formData) {
                // Deep clone the payload to avoid mutation
                finalPayload = JSON.parse(JSON.stringify(target.payload));
                
                // Inject the form data (entire object)
                const formData = parameters.formData;
                
                // 1. Top-level formData field
                if (finalPayload.formData !== undefined) {
                  finalPayload.formData = formData;
                }
                
                // 2. Top-level data field
                if (finalPayload.data !== undefined) {
                  finalPayload.data = formData;
                }
                
                // 3. Parameters object - merge form data into parameters
                if (finalPayload.parameters && typeof finalPayload.parameters === 'object') {
                  // If there's a formData field in parameters, replace it
                  if (finalPayload.parameters.formData !== undefined) {
                    finalPayload.parameters.formData = formData;
                  }
                  // If there's a data field in parameters, replace it
                  if (finalPayload.parameters.data !== undefined) {
                    finalPayload.parameters.data = formData;
                  }
                  // Also merge individual form fields into parameters
                  // This allows targeting specific fields like {"name": "", "email": ""}
                  Object.keys(formData).forEach(key => {
                    if (finalPayload.parameters[key] !== undefined) {
                      finalPayload.parameters[key] = formData[key];
                    }
                  });
                }
                
                // 4. Commands array -> actions array -> params
                if (finalPayload.commands && Array.isArray(finalPayload.commands)) {
                  finalPayload.commands.forEach((cmd: any) => {
                    if (cmd.actions && Array.isArray(cmd.actions)) {
                      cmd.actions.forEach((action: any) => {
                        if (action.params && typeof action.params === 'object') {
                          // Inject form data or individual fields
                          if (action.params.formData !== undefined) {
                            action.params.formData = formData;
                          }
                          if (action.params.data !== undefined) {
                            action.params.data = formData;
                          }
                          // Merge individual form fields
                          Object.keys(formData).forEach(key => {
                            if (action.params[key] !== undefined) {
                              action.params[key] = formData[key];
                            }
                          });
                        }
                      });
                    }
                  });
                }
                
                // 5. Action parameters
                if (finalPayload.actionParameters && typeof finalPayload.actionParameters === 'object') {
                  finalPayload.actionParameters.formData = formData;
                  // Also spread individual form fields
                  Object.assign(finalPayload.actionParameters, formData);
                }
              }
              
              // For color-picker widgets, inject the color value into the payload
              if (widget.type === 'color-picker' && (actionId === 'colorChange' || actionId === 'change') && parameters?.colorData) {
                // Deep clone the payload to avoid mutation
                finalPayload = JSON.parse(JSON.stringify(target.payload));
                
                // Inject the color data (hex, rgb, hsl values)
                const colorData = parameters.colorData;
                
                // 1. Top-level color fields
                if (finalPayload.color !== undefined) {
                  finalPayload.color = colorData.hex || colorData;
                }
                if (finalPayload.hex !== undefined) {
                  finalPayload.hex = colorData.hex;
                }
                if (finalPayload.rgb !== undefined) {
                  finalPayload.rgb = colorData.rgb;
                }
                if (finalPayload.hsl !== undefined) {
                  finalPayload.hsl = colorData.hsl;
                }
                
                // 2. Parameters object
                if (finalPayload.parameters && typeof finalPayload.parameters === 'object') {
                  if (finalPayload.parameters.color !== undefined) {
                    finalPayload.parameters.color = colorData.hex || colorData;
                  }
                  if (finalPayload.parameters.hex !== undefined) {
                    finalPayload.parameters.hex = colorData.hex;
                  }
                  if (finalPayload.parameters.rgb !== undefined) {
                    finalPayload.parameters.rgb = colorData.rgb;
                  }
                  if (finalPayload.parameters.hsl !== undefined) {
                    finalPayload.parameters.hsl = colorData.hsl;
                  }
                  if (finalPayload.parameters.r !== undefined && colorData.rgb) {
                    finalPayload.parameters.r = colorData.rgb.r;
                  }
                  if (finalPayload.parameters.g !== undefined && colorData.rgb) {
                    finalPayload.parameters.g = colorData.rgb.g;
                  }
                  if (finalPayload.parameters.b !== undefined && colorData.rgb) {
                    finalPayload.parameters.b = colorData.rgb.b;
                  }
                }
                
                // 3. Commands array -> actions array -> params
                if (finalPayload.commands && Array.isArray(finalPayload.commands)) {
                  finalPayload.commands.forEach((cmd: any) => {
                    if (cmd.actions && Array.isArray(cmd.actions)) {
                      cmd.actions.forEach((action: any) => {
                        if (action.params && typeof action.params === 'object') {
                          if (action.params.color !== undefined) {
                            action.params.color = colorData.hex || colorData;
                          }
                          if (action.params.hex !== undefined) {
                            action.params.hex = colorData.hex;
                          }
                          if (action.params.rgb !== undefined) {
                            action.params.rgb = colorData.rgb;
                          }
                          if (action.params.hsl !== undefined) {
                            action.params.hsl = colorData.hsl;
                          }
                          if (action.params.r !== undefined && colorData.rgb) {
                            action.params.r = colorData.rgb.r;
                          }
                          if (action.params.g !== undefined && colorData.rgb) {
                            action.params.g = colorData.rgb.g;
                          }
                          if (action.params.b !== undefined && colorData.rgb) {
                            action.params.b = colorData.rgb.b;
                          }
                        }
                      });
                    }
                  });
                }
                
                // 4. Action parameters
                if (finalPayload.actionParameters && typeof finalPayload.actionParameters === 'object') {
                  finalPayload.actionParameters.colorData = colorData;
                  finalPayload.actionParameters.color = colorData.hex || colorData;
                  if (colorData.hex) finalPayload.actionParameters.hex = colorData.hex;
                  if (colorData.rgb) finalPayload.actionParameters.rgb = colorData.rgb;
                  if (colorData.hsl) finalPayload.actionParameters.hsl = colorData.hsl;
                }
              }
              
              // For countdown-timer widgets, inject timer data into the payload
              if (widget.type === 'countdown-timer' && (actionId === 'complete' || actionId === 'start' || actionId === 'pause' || actionId === 'reset') && parameters) {
                // Deep clone the payload to avoid mutation
                finalPayload = JSON.parse(JSON.stringify(target.payload));
                
                // Inject timer data
                const timerData = parameters;
                
                // 1. Top-level timer fields
                if (finalPayload.widgetId !== undefined) {
                  finalPayload.widgetId = timerData.widgetId;
                }
                if (finalPayload.initialSeconds !== undefined) {
                  finalPayload.initialSeconds = timerData.initialSeconds;
                }
                if (finalPayload.timeLeft !== undefined) {
                  finalPayload.timeLeft = timerData.timeLeft;
                }
                if (finalPayload.completedAt !== undefined) {
                  finalPayload.completedAt = timerData.completedAt;
                }
                
                // 2. Parameters object
                if (finalPayload.parameters && typeof finalPayload.parameters === 'object') {
                  if (finalPayload.parameters.widgetId !== undefined) {
                    finalPayload.parameters.widgetId = timerData.widgetId;
                  }
                  if (finalPayload.parameters.initialSeconds !== undefined) {
                    finalPayload.parameters.initialSeconds = timerData.initialSeconds;
                  }
                  if (finalPayload.parameters.timeLeft !== undefined) {
                    finalPayload.parameters.timeLeft = timerData.timeLeft;
                  }
                  if (finalPayload.parameters.completedAt !== undefined) {
                    finalPayload.parameters.completedAt = timerData.completedAt;
                  }
                  if (finalPayload.parameters.event !== undefined) {
                    finalPayload.parameters.event = actionId;
                  }
                }
                
                // 3. Commands array -> actions array -> params
                if (finalPayload.commands && Array.isArray(finalPayload.commands)) {
                  finalPayload.commands.forEach((cmd: any) => {
                    if (cmd.actions && Array.isArray(cmd.actions)) {
                      cmd.actions.forEach((action: any) => {
                        if (action.params && typeof action.params === 'object') {
                          if (action.params.widgetId !== undefined) {
                            action.params.widgetId = timerData.widgetId;
                          }
                          if (action.params.initialSeconds !== undefined) {
                            action.params.initialSeconds = timerData.initialSeconds;
                          }
                          if (action.params.timeLeft !== undefined) {
                            action.params.timeLeft = timerData.timeLeft;
                          }
                          if (action.params.completedAt !== undefined) {
                            action.params.completedAt = timerData.completedAt;
                          }
                          if (action.params.event !== undefined) {
                            action.params.event = actionId;
                          }
                        }
                      });
                    }
                  });
                }
                
                // 4. Action parameters
                if (finalPayload.actionParameters && typeof finalPayload.actionParameters === 'object') {
                  finalPayload.actionParameters.timerData = timerData;
                  finalPayload.actionParameters.widgetId = timerData.widgetId;
                  if (timerData.initialSeconds !== undefined) finalPayload.actionParameters.initialSeconds = timerData.initialSeconds;
                  if (timerData.timeLeft !== undefined) finalPayload.actionParameters.timeLeft = timerData.timeLeft;
                  if (timerData.completedAt !== undefined) finalPayload.actionParameters.completedAt = timerData.completedAt;
                  finalPayload.actionParameters.event = actionId;
                }
              }
              
              // For voice-to-text widgets, inject text value into the payload
              if (widget.type === 'voice-to-text' && (actionId === 'speechEnd' || actionId === 'speechResult' || actionId === 'submit') && parameters?.text) {
                // Deep clone the payload to avoid mutation
                finalPayload = JSON.parse(JSON.stringify(target.payload));
                
                // Inject the text value into ALL possible locations
                const textValue = parameters.text;
                
                // 1. Top-level text/value fields
                if (finalPayload.text !== undefined) {
                  finalPayload.text = textValue;
                }
                if (finalPayload.value !== undefined) {
                  finalPayload.value = textValue;
                }
                if (finalPayload.message !== undefined) {
                  finalPayload.message = textValue;
                }
                if (finalPayload.widgetId !== undefined) {
                  finalPayload.widgetId = parameters.widgetId;
                }
                
                // 2. Parameters object
                if (finalPayload.parameters && typeof finalPayload.parameters === 'object') {
                  if (finalPayload.parameters.text !== undefined) {
                    finalPayload.parameters.text = textValue;
                  }
                  if (finalPayload.parameters.value !== undefined) {
                    finalPayload.parameters.value = textValue;
                  }
                  if (finalPayload.parameters.message !== undefined) {
                    finalPayload.parameters.message = textValue;
                  }
                  if (finalPayload.parameters.command !== undefined) {
                    finalPayload.parameters.command = textValue;
                  }
                  if (finalPayload.parameters.data !== undefined) {
                    finalPayload.parameters.data = textValue;
                  }
                  if (finalPayload.parameters.widgetId !== undefined) {
                    finalPayload.parameters.widgetId = parameters.widgetId;
                  }
                }
                
                // 3. Commands array -> actions array -> params
                if (finalPayload.commands && Array.isArray(finalPayload.commands)) {
                  finalPayload.commands.forEach((cmd: any) => {
                    if (cmd.actions && Array.isArray(cmd.actions)) {
                      cmd.actions.forEach((action: any) => {
                        if (action.params && typeof action.params === 'object') {
                          if (action.params.text !== undefined) {
                            action.params.text = textValue;
                          }
                          if (action.params.value !== undefined) {
                            action.params.value = textValue;
                          }
                          if (action.params.message !== undefined) {
                            action.params.message = textValue;
                          }
                          if (action.params.command !== undefined) {
                            action.params.command = textValue;
                          }
                          if (action.params.data !== undefined) {
                            action.params.data = textValue;
                          }
                          if (action.params.widgetId !== undefined) {
                            action.params.widgetId = parameters.widgetId;
                          }
                        }
                      });
                    }
                  });
                }
                
                // 4. Action parameters
                if (finalPayload.actionParameters && typeof finalPayload.actionParameters === 'object') {
                  finalPayload.actionParameters.text = textValue;
                  finalPayload.actionParameters.value = textValue;
                  if (parameters.widgetId) finalPayload.actionParameters.widgetId = parameters.widgetId;
                }
              }
              
              // For joystick widgets, inject position values into the payload
              if (widget.type === 'joystick' && (actionId === 'positionChange' || actionId === 'change') && parameters?.position) {
                // Deep clone the payload to avoid mutation
                finalPayload = JSON.parse(JSON.stringify(target.payload));
                
                // Inject the joystick position values into ALL possible locations
                const positionData = parameters.position;
                const xValue = positionData.x;
                const yValue = positionData.y;
                
                // 1. Top-level position/x/y fields
                if (finalPayload.position !== undefined) {
                  finalPayload.position = positionData;
                }
                if (finalPayload.x !== undefined) {
                  finalPayload.x = xValue;
                }
                if (finalPayload.y !== undefined) {
                  finalPayload.y = yValue;
                }
                if (finalPayload.joystick !== undefined) {
                  finalPayload.joystick = positionData;
                }
                
                // 2. Parameters object
                if (finalPayload.parameters && typeof finalPayload.parameters === 'object') {
                  if (finalPayload.parameters.position !== undefined) {
                    finalPayload.parameters.position = positionData;
                  }
                  if (finalPayload.parameters.x !== undefined) {
                    finalPayload.parameters.x = xValue;
                  }
                  if (finalPayload.parameters.y !== undefined) {
                    finalPayload.parameters.y = yValue;
                  }
                  if (finalPayload.parameters.joystick !== undefined) {
                    finalPayload.parameters.joystick = positionData;
                  }
                  if (finalPayload.parameters.horizontal !== undefined) {
                    finalPayload.parameters.horizontal = xValue;
                  }
                  if (finalPayload.parameters.vertical !== undefined) {
                    finalPayload.parameters.vertical = yValue;
                  }
                }
                
                // 3. Commands array -> actions array -> params
                if (finalPayload.commands && Array.isArray(finalPayload.commands)) {
                  finalPayload.commands.forEach((cmd: any) => {
                    if (cmd.actions && Array.isArray(cmd.actions)) {
                      cmd.actions.forEach((action: any) => {
                        if (action.params && typeof action.params === 'object') {
                          if (action.params.position !== undefined) {
                            action.params.position = positionData;
                          }
                          if (action.params.x !== undefined) {
                            action.params.x = xValue;
                          }
                          if (action.params.y !== undefined) {
                            action.params.y = yValue;
                          }
                          if (action.params.joystick !== undefined) {
                            action.params.joystick = positionData;
                          }
                          if (action.params.horizontal !== undefined) {
                            action.params.horizontal = xValue;
                          }
                          if (action.params.vertical !== undefined) {
                            action.params.vertical = yValue;
                          }
                        }
                      });
                    }
                  });
                }
                
                // 4. Action parameters
                if (finalPayload.actionParameters && typeof finalPayload.actionParameters === 'object') {
                  finalPayload.actionParameters.position = positionData;
                  finalPayload.actionParameters.x = xValue;
                  finalPayload.actionParameters.y = yValue;
                  finalPayload.actionParameters.joystick = positionData;
                }
              }
              
              console.log('[Event System] Sending WebSocket message:', {
                targetId: target.targetId,
                originalPayload: target.payload,
                finalPayload: finalPayload,
                widgetType: widget.type,
                actionId: actionId,
                parameters: parameters
              });
              
              // Send via WebSocket service
              deviceWebSocketService.sendMessage({
                targetId: target.targetId,
                payload: finalPayload
              });
              
              // Trigger the widget event for script execution
              onWidgetEvent?.(widget.id, event.eventType, { target, parameters });
            }
          });
        }
      });
      
      // If new event system is configured, skip legacy system
      if (matchingEvents.length > 0) {
        // Clear action feedback after 3 seconds
        setTimeout(() => setLastAction(null), 3000);
        return;
      }
    }
    
    // LEGACY SYSTEM: Handle WebSocket command sending based on widget type and configuration
    if (widget.type === 'joystick') {
      // For joystick widgets, first check for configuration in deviceCommand sub-object (new pattern)
      if (widget.config?.deviceCommand?.positionChangeCommandId || widget.config?.deviceCommand?.positionChangeActionId) {
        const config = widget.config.deviceCommand;
        const targetDeviceId = deviceId || widget.config.deviceId || 'default-device';
        
        // Joystick position change
        if (actionId === 'positionChange' && parameters?.position) {
          deviceWebSocketService.sendJoystickCommand(targetDeviceId, config, parameters.position, widget.id);
        }
      }
      // Also check for legacy configuration directly in widget.config for backward compatibility
      else if (widget.config?.positionChangeCommandId || widget.config?.positionChangeActionId) {
        const config = widget.config;
        const targetDeviceId = deviceId || widget.config.deviceId || 'default-device';
        
        // Joystick position change
        if (actionId === 'positionChange' && parameters?.position) {
          deviceWebSocketService.sendJoystickCommand(targetDeviceId, config, parameters.position, widget.id);
        }
      }
    }
    // For other widgets, check for deviceCommand sub-object
    else if (widget.config?.deviceCommand) {
      const config = widget.config.deviceCommand;
      const targetDeviceId = deviceId || widget.config.deviceId || 'default-device';
      
      if (widget.type === 'button') {
        // Check if it's a push button with press/release commands
        if (config.buttonType === 'push') {
          if (actionId === 'press') {
            setIsPressed(true);
            deviceWebSocketService.sendPushButtonPress(targetDeviceId, config, widget.id);
            // Trigger push event
            onWidgetEvent?.(widget.id, 'push', true);
          } else if (actionId === 'release') {
            setIsPressed(false);
            deviceWebSocketService.sendPushButtonRelease(targetDeviceId, config, widget.id);
            // Trigger release event
            onWidgetEvent?.(widget.id, 'release', false);
          }
        } else {
          // Normal button - single command on click
          deviceWebSocketService.sendButtonCommand(targetDeviceId, config, widget.id);
          // Trigger click event
          onWidgetEvent?.(widget.id, 'click', true);
        }
      } else if (widget.type === 'switch') {
        // Switch toggle
        const isOn = parameters?.checked !== undefined ? parameters.checked : !localValue;
        deviceWebSocketService.sendSwitchCommand(targetDeviceId, config, isOn, widget.id);
      } else if (widget.type === 'form') {
        // Form submission
        deviceWebSocketService.sendFormCommand?.(targetDeviceId, config, parameters?.formData || formData, widget.id);
      } else if (widget.type === 'color-picker') {
        // Color picker value change
        if (actionId === 'colorChange' && parameters?.colorData) {
          deviceWebSocketService.sendColorPickerCommand(targetDeviceId, config, parameters.colorData, widget.id);
        }
      } else if (widget.type === 'slider') {
        // Slider value change
        if (actionId === 'valueChange' && parameters?.value !== undefined) {
          // Send slider value command
          deviceWebSocketService.sendSliderCommand?.(targetDeviceId, config, parameters.value, widget.id);
        }
      } else if (widget.type === 'compass') {
        // Compass value change
        if (actionId === 'valueChange' && parameters?.value !== undefined) {
          // Send compass value command
          deviceWebSocketService.sendSliderCommand?.(targetDeviceId, config, parameters.value, widget.id);
        }
      } else if (widget.type === 'heatmap') {
        // Heatmap value change
        if (actionId === 'valueChange' && parameters?.data !== undefined) {
          // Send heatmap data command
          deviceWebSocketService.sendHeatmapCommand?.(targetDeviceId, config, parameters.data, widget.id);
        }
      }
    }
    
    // Command sent silently

    // Clear action feedback after 3 seconds
    setTimeout(() => setLastAction(null), 3000);
  }, [isDesignMode, onAction, widget.title, widget.type, widget.config, localValue, deviceId, formData, onWidgetEvent, widget.id]);


  const renderWidget = () => {
    const commonStyles = {
      backgroundColor: widget.style?.backgroundColor,
      color: widget.style?.textColor,
      borderColor: widget.style?.borderColor,
      borderWidth: widget.style?.borderWidth,
      borderRadius: widget.style?.borderRadius,
      fontSize: widget.style?.fontSize,
      fontWeight: widget.style?.fontWeight,
      opacity: widget.style?.opacity,
      padding: widget.style?.padding,
      zIndex: widget.style?.zIndex !== undefined ? widget.style.zIndex : 'auto'
    };

    // Card wrapper styles for visibility, transparency, shadow, and glass effect
    const cardWrapperStyles: React.CSSProperties = {};
    
    // Apply card visibility and fade transition
    if (widget.style?.cardVisible === false) {
      cardWrapperStyles.opacity = 0;
      cardWrapperStyles.pointerEvents = 'none';
      cardWrapperStyles.transition = `opacity ${widget.style?.cardFadeTransition || 300}ms ease-in-out`;
    } else {
      cardWrapperStyles.transition = `opacity ${widget.style?.cardFadeTransition || 300}ms ease-in-out`;
    }
    
    // Apply card opacity (transparency)
    if (widget.style?.cardOpacity !== undefined) {
      // Create a wrapper that applies opacity only to background
      cardWrapperStyles.position = 'relative';
    }
    
    // Apply shadow customization
    if (widget.style?.shadowPreset !== 'none' && widget.style?.boxShadow) {
      cardWrapperStyles.boxShadow = widget.style.boxShadow;
    }
    
    // Apply glass effect
    if (widget.style?.glassEffect === true) {
      const glassBlur = widget.style?.glassBlur || 10;
      const glassOpacity = widget.style?.glassOpacity || 0.7;
      const glassTint = widget.style?.glassTint || '#ffffff';
      const glassBorder = widget.style?.glassBorder !== false;
      
      // Convert hex to rgba for tint
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      
      cardWrapperStyles.backdropFilter = `blur(${glassBlur}px)`;
      cardWrapperStyles.WebkitBackdropFilter = `blur(${glassBlur}px)`; // Safari support
      cardWrapperStyles.backgroundColor = hexToRgba(glassTint, glassOpacity);
      
      if (glassBorder) {
        cardWrapperStyles.border = '1px solid rgba(255, 255, 255, 0.3)';
        // Override shadow for glass effect
        cardWrapperStyles.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.1)';
      }
      
      // Fallback for browsers that don't support backdrop-filter
      // @ts-ignore
      if (!CSS.supports('backdrop-filter', 'blur(10px)') && !CSS.supports('-webkit-backdrop-filter', 'blur(10px)')) {
        cardWrapperStyles.backgroundColor = hexToRgba(glassTint, Math.min(glassOpacity + 0.2, 1));
      }
    } else {
      // Apply card opacity only if glass effect is NOT enabled
      // If card opacity is set, we need to apply it differently
      if (widget.style?.cardOpacity !== undefined && widget.style?.cardOpacity < 1) {
        // Override backgroundColor with alpha channel
        const bgColor = widget.style?.backgroundColor || '#ffffff';
        const hexToRgba = (hex: string, alpha: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        cardWrapperStyles.backgroundColor = hexToRgba(bgColor, widget.style.cardOpacity);
      }
    }
    
    // Merge common styles with card wrapper styles
    const mergedStyles = { ...commonStyles, ...cardWrapperStyles };

    // Debug logging
    console.log('EnhancedWidgetRenderer rendering widget:', widget);
    console.log('Widget type:', widget.type);
    console.log('Widget config:', widget.config);

    switch (widget.type) {
      case 'button':
        return (
          <ButtonWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            isPressed={isPressed}
            deviceStatus={deviceStatus}
            executeAction={executeAction}
            commonStyles={mergedStyles}
          />
        );

      case 'switch':
        return (
          <SwitchWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            localValue={localValue}
            deviceStatus={deviceStatus}
            handleValueChange={handleValueChange}
            commonStyles={mergedStyles}
          />
        );

      case 'gauge':
        return (
          <GaugeWidgetRenderer
            widget={widget}
            localValue={localValue}
            lastUpdate={lastUpdate}
            commonStyles={mergedStyles}
          />
        );

      case 'slider':
        return (
          <SliderWidgetRenderer
            widget={widget}
            localValue={localValue}
            handleValueChange={handleValueChange}
            executeAction={executeAction}
            commonStyles={mergedStyles}
          />
        );

      case 'status':
        return (
          <StatusWidgetRenderer
            widget={widget}
            localValue={localValue}
            lastUpdate={lastUpdate}
            commonStyles={mergedStyles}
          />
        );

      case 'label':
        return (
          <LabelWidgetRenderer
            widget={widget}
            value={value}
            commonStyles={mergedStyles}
          />
        );

      case 'text-input':
        return (
          <TextInputWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            localValue={localValue}
            handleValueChange={handleValueChange}
            executeAction={executeAction}
            commonStyles={mergedStyles}
          />
        );

      case 'form':
        return (
          <FormWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            deviceStatus={deviceStatus}
            formData={formData}
            setFormData={setFormData}
            executeAction={executeAction}
            commonStyles={mergedStyles}
          />
        );

      case 'image':
        return (
          <ImageWidgetRenderer
            widget={widget}
            commonStyles={mergedStyles}
          />
        );

      case 'chart':
        return (
          <ChartWidgetRenderer
            widget={widget}
            deviceId={deviceId}
            commonStyles={mergedStyles}
          />
        );

      case 'table':
        return (
          <TableWidgetRenderer
            widget={widget}
            deviceId={deviceId}
            isDesignMode={isDesignMode}
            commonStyles={mergedStyles}
          />
        );

      case 'database-form':
        return (
          <DatabaseFormWidgetRenderer
            widget={widget}
            deviceId={deviceId}
            isDesignMode={isDesignMode}
            commonStyles={mergedStyles}
          />
        );

      case 'color-picker':
        return (
          <ColorPickerWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            localValue={localValue}
            handleValueChange={handleValueChange}
            executeAction={executeAction}
            commonStyles={mergedStyles}
          />
        );

      case 'menu':
        return (
          <MenuWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            commonStyles={mergedStyles}
            pages={pages}
            activePageId={activePageId}
            onNavigate={onNavigateToPage}
          />
        );

      case 'map':
        return (
          <MapWidgetRenderer
            widget={widget}
            deviceId={deviceId}
            isDesignMode={isDesignMode}
            value={value}
            onValueChange={handleValueChange}
          />
        );

      case 'mission-planning-map':
        return (
          <MissionPlanningMapWidgetRenderer
            widget={widget}
            deviceId={deviceId}
            productId={productId}
            isDesignMode={isDesignMode}
            value={value}
            onValueChange={handleValueChange}
          />
        );

      case 'joystick':
        return (
          <JoystickWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            localValue={localValue}
            deviceStatus={deviceStatus}
            handleValueChange={handleValueChange}
            commonStyles={mergedStyles}
            executeAction={executeAction}
          />
        );

      case 'svg':
        return (
          <SvgWidgetRenderer
            widget={widget}
            commonStyles={mergedStyles}
          />
        );

      case 'rectangle':
      case 'ellipse':
      case 'triangle':
      case 'polygon':
      case 'star':
      case 'line':
      case 'arrow':
        return (
          <ShapeWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            commonStyles={mergedStyles}
          />
        );

      case 'navigate-page':
        return (
          <NavigatePageWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            commonStyles={mergedStyles}
            pages={pages}
            activePageId={activePageId}
            onNavigate={onNavigateToPage}
          />
        );

      case 'url-button':
        return (
          <UrlButtonWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            commonStyle={commonStyles}
            pages={pages}
            onNavigate={onNavigateToPage}
          />
        );

      case 'dynamic-repeater':
        return (
          <DynamicRepeaterWidgetRenderer
            widget={widget}
            deviceId={deviceId}
            isDesignMode={isDesignMode}
            commonStyles={mergedStyles}
          />
        );

      case 'compass':
        return (
          <CompassWidgetRenderer
            widget={widget}
            localValue={localValue}
            handleValueChange={handleValueChange}
            executeAction={executeAction}
            commonStyles={mergedStyles}
          />
        );

      case 'heatmap':
        return (
          <HeatmapWidgetRenderer
            widget={widget}
            localValue={localValue}
            handleValueChange={handleValueChange}
            executeAction={executeAction}
            commonStyles={mergedStyles}
          />
        );

      case 'attitude':
        return (
          <AttitudeWidgetRenderer
            widget={widget}
            localValue={localValue}
            handleValueChange={handleValueChange}
            executeAction={executeAction}
            commonStyles={mergedStyles}
          />
        );

      case 'html-viewer':
        return (
          <HtmlViewerWidgetRenderer
            widget={widget}
            localValue={localValue}
            commonStyles={mergedStyles}
          />
        );

      case 'webrtc-viewer':
        return (
          <WebRTCViewerWidgetRenderer
            widget={widget}
            value={value}
            isDesignMode={isDesignMode}
          />
        );

      case 'webrtc-camera':
        return (
          <WebRTCCameraWidgetRenderer
            widget={widget}
            value={value}
            isDesignMode={isDesignMode}
          />
        );

      case 'voice-to-text':
        return (
          <VoiceToTextWidgetRenderer
            widget={widget}
            deviceId={deviceId}
            onUpdate={onUpdate}
            onAction={executeAction}
            onWidgetEvent={onWidgetEvent}
            isDesignMode={isDesignMode}
          />
        );

      case '3d-viewer':
        return (
          <ThreeDViewerWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            commonStyles={mergedStyles}
            value={value}
          />
        );

      case 'datetime-weather':
        return (
          <DateTimeWeatherWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            commonStyles={mergedStyles}
          />
        );

      case 'countdown-timer':
        return (
          <CountdownTimerWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            commonStyles={mergedStyles}
            onAction={executeAction}
            onWidgetEvent={onWidgetEvent}
            value={value}
          />
        );

      case 'schedule':
        return (
          <ScheduleWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            commonStyles={mergedStyles}
            onAction={executeAction}
            deviceId={deviceId}
          />
        );

      case 'rule':
        return (
          <RuleWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            commonStyles={mergedStyles}
            onAction={executeAction}
          />
        );

      case 'text-to-speech':
        return (
          <TextToSpeechWidgetRenderer
            widget={widget}
            isDesignMode={isDesignMode}
            localValue={localValue}
            commonStyles={mergedStyles}
          />
        );

      case 'video-player':
        return (
          <VideoPlayerWidgetRenderer
            widget={widget}
            commonStyles={mergedStyles}
          />
        );

      case 'spotify-player':
        return (
          <SpotifyPlayerWidgetRenderer
            widget={widget}
            commonStyles={mergedStyles}
            isDesignMode={isDesignMode}
            executeAction={executeAction}
          />
        );

      case 'em-spectrum':
        return (
          <EMSpectrumWidgetRenderer
            widget={widget}
            localValue={localValue}
            commonStyles={mergedStyles}
            isDesignMode={isDesignMode}
          />
        );

      case 'spectral-graph':
        console.log('[IoTEnhancedWidgetRenderer] Rendering spectral-graph:', {
          widgetId: widget.id,
          localValue,
          valueType: typeof localValue,
          isArray: Array.isArray(localValue)
        });
        return (
          <SpectralGraphWidgetRenderer
            widget={widget}
            localValue={localValue}
            commonStyles={mergedStyles}
            isDesignMode={isDesignMode}
            onWidgetEvent={onWidgetEvent}
          />
        );

      case 'vector-plot-3d':
        return (
          <VectorPlot3DWidgetRenderer
            widget={widget}
            value={localValue}
            commonStyles={mergedStyles}
            isDesignMode={isDesignMode}
          />
        );

      case 'virtual-twin-3d':
        return (
          <VirtualTwin3DWidgetRenderer
            widget={widget}
            value={localValue}
            commonStyles={mergedStyles}
            isDesignMode={isDesignMode}
          />
        );

      case 'payment-action':
        return (
          <PaymentActionWidget
            config={{
              actionConfigId: widget.config?.actionConfigId,
              actionName: widget.title,
              amount: widget.config?.amount,
              currency: widget.config?.currency,
              buttonLabel: widget.config?.buttonLabel,
              description: widget.config?.description,
              buttonVariant: widget.config?.buttonVariant as any,
              paymentSuccessEventName: widget.config?.paymentSuccessEventName,
              paymentFailureEventName: widget.config?.paymentFailureEventName,
              paymentSuccessMessage: widget.config?.paymentSuccessMessage,
              paymentFailureMessage: widget.config?.paymentFailureMessage,
              // Design customization options
              cardBackgroundColor: widget.config?.cardBackgroundColor,
              cardBorderColor: widget.config?.cardBorderColor,
              cardBorderWidth: widget.config?.cardBorderWidth,
              cardBorderRadius: widget.config?.cardBorderRadius,
              cardPadding: widget.config?.cardPadding,
              cardShadow: widget.config?.cardShadow,
              // Icon customization
              iconColor: widget.config?.iconColor,
              iconSize: widget.config?.iconSize,
              hideIcon: widget.config?.hideIcon,
              // Title customization
              titleColor: widget.config?.titleColor,
              titleSize: widget.config?.titleSize,
              titleWeight: widget.config?.titleWeight,
              titleAlign: widget.config?.titleAlign,
              // Description customization
              descriptionColor: widget.config?.descriptionColor,
              descriptionSize: widget.config?.descriptionSize,
              // Amount customization
              amountColor: widget.config?.amountColor,
              amountSize: widget.config?.amountSize,
              amountWeight: widget.config?.amountWeight,
              currencyPosition: widget.config?.currencyPosition,
              showCurrencyCode: widget.config?.showCurrencyCode,
              // Button customization
              buttonBackgroundColor: widget.config?.buttonBackgroundColor,
              buttonTextColor: widget.config?.buttonTextColor,
              buttonBorderColor: widget.config?.buttonBorderColor,
              buttonBorderWidth: widget.config?.buttonBorderWidth,
              buttonBorderRadius: widget.config?.buttonBorderRadius,
              buttonPadding: widget.config?.buttonPadding,
              buttonFontSize: widget.config?.buttonFontSize,
              buttonFontWeight: widget.config?.buttonFontWeight,
              buttonWidth: widget.config?.buttonWidth,
              buttonIconSize: widget.config?.buttonIconSize,
              buttonIconPosition: widget.config?.buttonIconPosition,
              hideButtonIcon: widget.config?.hideButtonIcon,
              // Success/Error state customization
              successIconColor: widget.config?.successIconColor,
              successIconSize: widget.config?.successIconSize,
              successTitleColor: widget.config?.successTitleColor,
              successTitleSize: widget.config?.successTitleSize,
              successMessageColor: widget.config?.successMessageColor,
              errorIconColor: widget.config?.errorIconColor,
              errorIconSize: widget.config?.errorIconSize,
              errorTitleColor: widget.config?.errorTitleColor,
              errorTitleSize: widget.config?.errorTitleSize,
              errorMessageColor: widget.config?.errorMessageColor,
              // Layout customization
              layoutDirection: widget.config?.layoutDirection,
              contentAlignment: widget.config?.contentAlignment,
              spacing: widget.config?.spacing,
            }}
            widgetId={widget.id}
            onPaymentSuccess={(data) => {
              console.log('[PaymentActionWidget] Payment success, triggering events', data);
              executeAction('paymentSuccess', data);
              // Trigger both event naming conventions for compatibility
              onWidgetEvent?.(widget.id, 'paymentSuccess', data);
              onWidgetEvent?.(widget.id, 'payment.success', data);
            }}
            onPaymentFailure={(error) => {
              console.log('[PaymentActionWidget] Payment failure, triggering events', error);
              executeAction('paymentFailed', error);
              // Trigger both event naming conventions for compatibility
              onWidgetEvent?.(widget.id, 'paymentFailed', error);
              onWidgetEvent?.(widget.id, 'payment.failure', error);
            }}
          />
        );

      case 'usb-serial':
        return (
          <UsbSerialWidgetRenderer
            widget={widget}
            value={value}
            isDesignMode={isDesignMode}
            onValueChange={handleValueChange}
            executeAction={executeAction}
            commonStyles={mergedStyles}
          />
        );

      default:
        return (
          <Card className="h-full" style={commonStyles}>
            <CardContent className="p-4 h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Unknown widget type: {widget.type}</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  // Check if widget should be visible (after all hooks)
  if (widget.style?.visible === false && !isDesignMode) {
    return null;
  }

  return (
    <div
      className={`
        w-full h-full transition-all duration-200
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${isDesignMode ? 'cursor-pointer' : ''}
      `}
      style={{
        opacity: deviceStatus === 'offline' && !isDesignMode ? 0.6 : 1,
      }}
      // Adding debug ID for inspection
      data-widget-id={widget.id}
      data-widget-type={widget.type}
    >
      {renderWidget()}
      
      {/* Design mode overlay */}
      {isDesignMode && isSelected && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary rounded pointer-events-none" />
      )}
    </div>
  );
};
