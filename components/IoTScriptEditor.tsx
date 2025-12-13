// Independent IoT Script Editor
// No dependencies on Product Dashboard Designer

import { useState, useCallback, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Save, RotateCcw, Palette, Copy, Check, ChevronDown, ChevronUp, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useIoTBuilder } from '../contexts/IoTBuilderContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const DEFAULT_IOT_SCRIPT = `// IoT Dashboard Script
// This script runs when the dashboard loads
// Access to complete JavaScript APIs for IoT device control

// Widget API - Control and monitor your widgets
// widget.setValue(widgetId, value) - Set widget value
// widget.getValue(widgetId) - Get widget value
// widget.setText(widgetId, text) - Set label/widget text
// widget.getText(widgetId) - Get label/widget text
// widget.show(widgetId) - Show widget
// widget.hide(widgetId) - Hide widget
// widget.setConfig(widgetId, configKey, value) - Update widget configuration
// widget.getConfig(widgetId, configKey) - Get widget configuration
// widget.on(widgetId, event, callback) - Listen to widget events
// widget.emit(widgetId, event, value) - Trigger custom event

// WebSocket API - Real-time device communication
// ws.send(deviceId, payload) - Send message to device
// ws.onMessage(callback) - Listen to incoming messages
// ws.connect(url, onMessage) - Connect to custom WebSocket
// ws.disconnect(url) - Disconnect custom WebSocket

// Storage API - Persistent data storage
// storage.set(key, value) - Store data
// storage.get(key) - Retrieve data
// storage.remove(key) - Remove data
// storage.clear() - Clear all data

// Database API - Runtime data queries
// db.query(tableName, filters, options) - Query runtime data
// db.insert(tableName, data) - Insert data

// Sensor API - Access device sensors (NEW!)
// Platform Detection:
// sensor.platform.isApp - Boolean: running as installed app
// sensor.platform.isBrowser - Boolean: running in web browser
// sensor.platform.capabilities - Object with all available sensors

// Accelerometer (motion sensor):
// sensor.accelerometer.isSupported() - Check if available
// sensor.accelerometer.getCurrentReading() - Get current acceleration
// sensor.accelerometer.watch(callback, options) - Monitor acceleration changes
// Returns: { x, y, z, timestamp } in m/s²

// Gyroscope (orientation sensor):
// sensor.gyroscope.isSupported() - Check if available
// sensor.gyroscope.getCurrentReading() - Get current orientation
// sensor.gyroscope.watch(callback, options) - Monitor orientation changes
// Returns: { alpha, beta, gamma, timestamp } in degrees

// Magnetometer / Compass:
// sensor.magnetometer.isSupported() - Check if available
// sensor.magnetometer.getCurrentReading() - Get compass heading
// sensor.magnetometer.watch(callback, options) - Monitor heading changes
// Returns: { x, y, z, heading, timestamp } - heading in degrees (0-360)

// Ambient Light Sensor:
// sensor.ambientLight.isSupported() - Check if available
// sensor.ambientLight.getCurrentReading() - Get light level
// sensor.ambientLight.watch(callback, options) - Monitor light changes
// Returns: { illuminance, timestamp } in lux

// Microphone / Audio Level:
// sensor.microphone.isSupported() - Check if available
// sensor.microphone.requestPermission() - Request microphone access
// sensor.microphone.watchLevel(callback, options) - Monitor audio levels
// Returns: { level, decibels, timestamp } - level 0-100

// Camera / Image Sensor:
// sensor.camera.isSupported() - Check if available
// sensor.camera.requestPermission() - Request camera access
// sensor.camera.capture(options) - Capture image
// Options: { width, height, facingMode: 'user'|'environment' }
// Returns: { dataUrl, width, height, timestamp }

// Biometric Authentication:
// sensor.biometric.isSupported() - Check if available
// sensor.biometric.authenticate(options) - Authenticate user
// Returns: { authenticated, method, timestamp }

// NFC (Near Field Communication):
// sensor.nfc.isSupported() - Check if available
// sensor.nfc.scan(options) - Scan NFC tag
// sensor.nfc.write(data) - Write to NFC tag

// Note: Some sensors (proximity, barometer, temperature, humidity, heart rate, 
// blood oxygen, LiDAR) require native app environment via Cordova/React Native
// sensor.proximity.isSupported() - Proximity sensor
// sensor.barometer.isSupported() - Barometer (air pressure)
// sensor.temperature.isSupported() - Temperature sensor
// sensor.humidity.isSupported() - Humidity sensor
// sensor.heartRate.isSupported() - Heart rate monitor
// sensor.bloodOxygen.isSupported() - Blood oxygen (SpO2)
// sensor.lidar.isSupported() - LiDAR depth sensor

// USB Serial Communication API (NEW!)
// usb.isSupported() - Check if Web Serial API is available (requires HTTPS)
// usb.platform.hasWebSerial - Boolean: Web Serial API available
// usb.platform.isSecureContext - Boolean: running in secure context (HTTPS)

// Request & Manage USB Serial Ports:
// usb.requestPort(options) - Show device picker and request port access
// Options: { filters: [{ usbVendorId: 0x2341, usbProductId: 0x0043 }] }
// usb.getPorts() - Get list of previously authorized ports
// usb.connect(port, options) - Connect to USB serial port
// Options: { baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' }
// usb.disconnect(port) - Disconnect from USB serial port
// usb.isConnected(port) - Check if port is connected

// Send & Receive Data:
// usb.send(port, data) - Send string or Uint8Array to USB device
// usb.read(port, timeoutMs) - Read data once with timeout
// usb.startReading(port, callback) - Start continuous reading
// usb.stopReading(port) - Stop continuous reading

// Utility Methods:
// usb.getPortInfo(port) - Get port information (vendor ID, product ID)
// usb.arrayToString(data) - Convert Uint8Array to string
// usb.stringToArray(data) - Convert string to Uint8Array
// usb.arrayToHex(data) - Convert Uint8Array to hex string

// Examples:

// Button Click Event
/*
widget.on('control-button', 'click', () => {
  console.log('Button clicked');
  ws.send('device-id', { command: 'toggle' });
});
*/

// Slider Value Change
/*
widget.on('temp-slider', 'change', (value) => {
  console.log('Temperature set to:', value);
  widget.setText('temp-label', value + '°C');
  ws.send('thermostat-device', { setTemp: value });
});
*/

// Switch Toggle
/*
widget.on('power-switch', 'toggle', (isOn) => {
  console.log('Power:', isOn ? 'ON' : 'OFF');
  storage.set('powerState', isOn);
  ws.send('device-id', { power: isOn });
});
*/

// Periodic Data Fetch
/*
setInterval(async () => {
  const data = await db.query('sensor_readings', {}, { limit: 1 });
  if (data.length > 0) {
    widget.setValue('gauge-1', data[0].value);
  }
}, 5000);
*/

// Payment Success Event
/*
widget.on('payment-widget-id', 'payment.success', async (data) => {
  console.log('Payment successful!', data);
  
  // Access payment details from actual response
  const { success, message, execution, transaction } = data;
  const { id, amount, currency } = transaction;
  
  // Update status widgets
  widget.setValue('status-widget', message || 'Payment Completed');
  widget.setValue('amount-display', amount);
  widget.setText('transaction-id', id);
  
  // Send command to device (e.g., unlock door)
  ws.send('device-id', {
    command: 'unlockDevice',
    params: { transactionId: id, amount, currency }
  });
  
  // Save to database
  await db.insert('payment_transactions', {
    transaction_id: id,
    amount: amount,
    currency: currency,
    status: 'completed',
    execution_status: execution.status,
    timestamp: new Date().toISOString()
  });
});
*/

// Payment Failure Event
/*
widget.on('payment-widget-id', 'payment.failure', async (data) => {
  console.log('Payment failed:', data);
  widget.setValue('status-widget', 'Payment Failed');
  widget.show('retry-button');
});
*/

// Dynamic Payment Widget Configuration
/*
// Update payment amount dynamically
widget.setConfig('payment-widget-id', 'amount', 100);

// Update currency
widget.setConfig('payment-widget-id', 'currency', 'USD');

// Update button label
widget.setConfig('payment-widget-id', 'buttonLabel', 'Pay $100 Now');

// Update description
widget.setConfig('payment-widget-id', 'description', 'Premium subscription');

// Get current configuration
const currentAmount = widget.getConfig('payment-widget-id', 'amount');
console.log('Current amount:', currentAmount);

// Get all configuration
const config = widget.getConfig('payment-widget-id');
console.log('Full config:', config);
*/

// Conditional Payment Amount Based on User Selection
/*
widget.on('plan-selector', 'change', (plan) => {
  let amount = 0;
  let description = '';
  
  switch(plan) {
    case 'basic':
      amount = 10;
      description = 'Basic Plan - $10/month';
      break;
    case 'premium':
      amount = 25;
      description = 'Premium Plan - $25/month';
      break;
    case 'enterprise':
      amount = 100;
      description = 'Enterprise Plan - $100/month';
      break;
  }
  
  // Update payment widget configuration
  widget.setConfig('payment-widget-id', 'amount', amount);
  widget.setConfig('payment-widget-id', 'description', description);
  widget.setConfig('payment-widget-id', 'buttonLabel', 'Pay $' + amount);
});
*/

// Sensor Examples:

// Check Platform and Sensor Availability
/*
console.log('Platform:', sensor.platform.isBrowser ? 'Browser' : 'App');
console.log('Accelerometer available:', sensor.accelerometer.isSupported());
console.log('Camera available:', sensor.camera.isSupported());
*/

// Monitor Device Motion (Accelerometer)
/*
if (sensor.accelerometer.isSupported()) {
  const stopWatching = sensor.accelerometer.watch((reading) => {
    const { x, y, z } = reading;
    widget.setValue('accel-x', x.toFixed(2));
    widget.setValue('accel-y', y.toFixed(2));
    widget.setValue('accel-z', z.toFixed(2));
    
    // Detect shake
    const magnitude = Math.sqrt(x*x + y*y + z*z);
    if (magnitude > 20) {
      console.log('Device shaken!');
      widget.emit('shake-detected', 'trigger');
    }
  }, { frequency: 100 });
  
  // Stop watching after 60 seconds
  // setTimeout(stopWatching, 60000);
}
*/

// Monitor Device Orientation (Gyroscope)
/*
if (sensor.gyroscope.isSupported()) {
  sensor.gyroscope.watch((reading) => {
    widget.setValue('orientation-alpha', reading.alpha.toFixed(0));
    widget.setValue('orientation-beta', reading.beta.toFixed(0));
    widget.setValue('orientation-gamma', reading.gamma.toFixed(0));
  }, { frequency: 200 });
}
*/

// Compass Heading (Magnetometer)
/*
if (sensor.magnetometer.isSupported()) {
  sensor.magnetometer.watch((reading) => {
    const direction = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(reading.heading / 45) % 8];
    widget.setValue('compass-heading', reading.heading.toFixed(0) + '°');
    widget.setText('compass-direction', direction);
  }, { frequency: 200 });
}
*/

// Monitor Ambient Light
/*
if (sensor.ambientLight.isSupported()) {
  sensor.ambientLight.watch((reading) => {
    widget.setValue('light-level', reading.illuminance);
    
    // Auto-adjust display based on ambient light
    if (reading.illuminance < 10) {
      console.log('Dark environment detected');
      widget.emit('theme-switcher', 'dark');
    } else if (reading.illuminance > 1000) {
      console.log('Bright environment detected');
      widget.emit('theme-switcher', 'light');
    }
  });
}
*/

// Monitor Audio Levels (Microphone)
/*
if (sensor.microphone.isSupported()) {
  sensor.microphone.requestPermission().then((permission) => {
    if (permission.granted) {
      sensor.microphone.watchLevel((audio) => {
        widget.setValue('audio-level', audio.level);
        widget.setValue('decibels', audio.decibels.toFixed(1) + ' dB');
        
        // Detect loud noise
        if (audio.level > 80) {
          console.log('Loud noise detected!');
          ws.send('device-id', { alert: 'noise', level: audio.level });
        }
      }, { frequency: 100 });
    }
  });
}
*/

// Capture Image from Camera
/*
widget.on('capture-button', 'click', async () => {
  if (sensor.camera.isSupported()) {
    const permission = await sensor.camera.requestPermission();
    if (permission.granted) {
      const image = await sensor.camera.capture({
        width: 640,
        height: 480,
        facingMode: 'environment' // or 'user' for front camera
      });
      
      if (image) {
        // Display captured image
        widget.setConfig('image-widget', 'src', image.dataUrl);
        console.log('Image captured:', image.width + 'x' + image.height);
        
        // Send to server
        await db.insert('captured_images', {
          image_data: image.dataUrl,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
});
*/

// NFC Tag Reading
/*
widget.on('scan-nfc-button', 'click', async () => {
  if (sensor.nfc.isSupported()) {
    widget.setText('status', 'Scanning for NFC tag...');
    const tagId = await sensor.nfc.scan({ timeout: 10000 });
    
    if (tagId) {
      console.log('NFC tag detected:', tagId);
      widget.setText('nfc-id', tagId);
      ws.send('device-id', { nfcTag: tagId });
    } else {
      widget.setText('status', 'No tag detected');
    }
  } else {
    widget.setText('status', 'NFC not supported on this device');
  }
});
*/

// Biometric Authentication
/*
widget.on('auth-button', 'click', async () => {
  if (sensor.biometric.isSupported()) {
    const result = await sensor.biometric.authenticate({
      promptMessage: 'Authenticate to continue'
    });
    
    if (result && result.authenticated) {
      console.log('Authentication successful!');
      widget.setValue('auth-status', 'Authenticated');
      widget.emit('unlock-panel', 'show');
    } else {
      console.log('Authentication failed');
      widget.setValue('auth-status', 'Failed');
    }
  }
});
*/

// USB Serial Communication Examples:

// Request and Connect to Arduino/USB Device
/*
widget.on('connect-usb-button', 'click', async () => {
  if (!usb.isSupported()) {
    console.log('USB Serial API requires HTTPS and supported browser');
    return;
  }
  
  // Request Arduino Uno (VendorID: 0x2341, ProductID: 0x0043)
  const port = await usb.requestPort({
    filters: [{ usbVendorId: 0x2341, usbProductId: 0x0043 }]
  });
  
  if (port) {
    // Connect at 9600 baud
    const connected = await usb.connect(port, { baudRate: 9600 });
    if (connected) {
      console.log('Connected to Arduino!');
      storage.set('usbPort', port); // Save port reference
    }
  }
});
*/

// Send Commands to USB Device
/*
widget.on('send-command-button', 'click', async () => {
  const port = storage.get('usbPort');
  if (port && usb.isConnected(port)) {
    // Send text command
    await usb.send(port, 'LED_ON\n');
    console.log('Command sent to USB device');
  }
});

widget.on('led-slider', 'change', async (value) => {
  const port = storage.get('usbPort');
  if (port) {
    // Send binary data
    const cmd = 'BRIGHTNESS:' + value + '\\n';
    const data = usb.stringToArray(cmd);
    await usb.send(port, data);
  }
});
*/

// Continuous Reading from USB Device
/*
widget.on('start-reading-button', 'click', async () => {
  const port = storage.get('usbPort');
  if (port) {
    await usb.startReading(port, (data) => {
      // Convert received bytes to string
      const text = usb.arrayToString(data);
      console.log('Received:', text);
      
      // Update widget with received data
      widget.setValue('usb-data-display', text);
      
      // Parse sensor data (example: "TEMP:25.5")
      if (text.includes('TEMP:')) {
        const temp = parseFloat(text.split(':')[1]);
        widget.setValue('temperature-gauge', temp);
      }
    });
    console.log('Started reading from USB device');
  }
});

widget.on('stop-reading-button', 'click', async () => {
  const port = storage.get('usbPort');
  if (port) {
    await usb.stopReading(port);
    console.log('Stopped reading from USB device');
  }
});
*/

// One-time Read with Timeout
/*
widget.on('read-once-button', 'click', async () => {
  const port = storage.get('usbPort');
  if (port) {
    const data = await usb.read(port, 3000); // 3 second timeout
    if (data) {
      const text = usb.arrayToString(data);
      console.log('Read data:', text);
      widget.setText('status-label', text);
    } else {
      console.log('No data received or timeout');
    }
  }
});
*/

// Disconnect from USB Device
/*
widget.on('disconnect-usb-button', 'click', async () => {
  const port = storage.get('usbPort');
  if (port) {
    await usb.disconnect(port);
    storage.remove('usbPort');
    console.log('Disconnected from USB device');
  }
});
*/

// Get Previously Authorized Ports (Auto-reconnect)
/*
(async () => {
  const ports = await usb.getPorts();
  if (ports.length > 0) {
    console.log('Found ' + ports.length + ' previously authorized port(s)');
    
    // Auto-reconnect to first port
    const port = ports[0];
    const info = usb.getPortInfo(port);
    console.log('Port info:', info);
    
    const connected = await usb.connect(port, { baudRate: 115200 });
    if (connected) {
      storage.set('usbPort', port);
      widget.setValue('connection-status', 'Connected');
    }
  }
})();
*/

// Your code here:
console.log('IoT Dashboard initialized');
`;

const STORAGE_KEY = 'iot-dashboard-editor-theme';

interface ConsoleLog {
  id: string;
  timestamp: Date;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  args: any[];
}

export const IoTScriptEditor = () => {
  const { state, actions } = useIoTBuilder();
  const [script, setScript] = useState(
    state.config?.script || DEFAULT_IOT_SCRIPT
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [editorTheme, setEditorTheme] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || 'vs-dark';
  });
  const [errorCount, setErrorCount] = useState(0);
  const [isWidgetListOpen, setIsWidgetListOpen] = useState(true);
  const [copiedWidgetId, setCopiedWidgetId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScriptRef = useRef<string>(script);

  // Sync script when config changes
  useEffect(() => {
    if (state.config?.script && state.config.script !== script) {
      setScript(state.config.script);
    }
  }, [state.config?.script]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, editorTheme);
  }, [editorTheme]);

  const addConsoleLog = useCallback((type: 'log' | 'warn' | 'error' | 'info', message: string, args: any[]) => {
    setConsoleLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type,
      message,
      args
    }]);
    
    if (type === 'error') {
      setErrorCount(prev => prev + 1);
    }
  }, []);

  const clearConsoleLogs = useCallback(() => {
    setConsoleLogs([]);
    setErrorCount(0);
  }, []);

  const handleAutoSave = useCallback(async () => {
    if (!state.config || script === lastScriptRef.current) {
      return;
    }

    setIsAutoSaving(true);
    
    try {
      actions.updateConfig({ script });
      await new Promise(resolve => setTimeout(resolve, 50));
      await actions.saveDashboard();
      
      setLastSaved(new Date());
      lastScriptRef.current = script;
      console.log('[Auto-save] Script saved successfully');
    } catch (error) {
      console.error('[Auto-save] Failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [state.config, script, actions]);

  // Auto-save effect: Debounced save after 5 seconds of inactivity
  useEffect(() => {
    if (script === lastScriptRef.current) {
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for 5 seconds after last keystroke
    autoSaveTimerRef.current = setTimeout(() => {
      handleAutoSave();
    }, 5000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [script, handleAutoSave]);

  // Periodic auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (script !== lastScriptRef.current && !isAutoSaving && !isSaving) {
        handleAutoSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [script, handleAutoSave, isAutoSaving, isSaving]);

  const handleSave = async () => {
    if (!state.config) {
      toast.error('No dashboard configuration found');
      return;
    }

    setIsSaving(true);
    
    try {
      actions.updateConfig({ script });
      await new Promise(resolve => setTimeout(resolve, 50));
      await actions.saveDashboard();
      
      setLastSaved(new Date());
      lastScriptRef.current = script;
      toast.success('Script saved successfully');
    } catch (error) {
      console.error('Script save error:', error);
      toast.error('Failed to save script');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setScript(DEFAULT_IOT_SCRIPT);
    clearConsoleLogs();
    toast.success('Script reset to default template');
  };

  const copyWidgetId = useCallback((widgetId: string) => {
    navigator.clipboard.writeText(widgetId);
    setCopiedWidgetId(widgetId);
    toast.success(`Widget ID copied: ${widgetId}`);
    setTimeout(() => setCopiedWidgetId(null), 2000);
  }, []);

  const handleTest = () => {
    setIsRunning(true);
    clearConsoleLogs();
    
    try {
      const startTime = performance.now();
      
      // Mock APIs for testing
      const mockWidget = {
        get: (widgetId: string) => {
          addConsoleLog('log', `widget.get('${widgetId}')`, [widgetId]);
          return undefined;
        },
        setValue: (widgetId: string, value: any) => {
          addConsoleLog('log', `widget.setValue('${widgetId}', ${JSON.stringify(value)})`, [widgetId, value]);
        },
        getValue: (widgetId: string) => {
          addConsoleLog('log', `widget.getValue('${widgetId}')`, [widgetId]);
          return undefined;
        },
        setText: (widgetId: string, text: string) => {
          addConsoleLog('log', `widget.setText('${widgetId}', '${text}')`, [widgetId, text]);
        },
        getText: (widgetId: string) => {
          addConsoleLog('log', `widget.getText('${widgetId}')`, [widgetId]);
          return `Widget ${widgetId}`;
        },
        show: (widgetId: string) => {
          addConsoleLog('log', `widget.show('${widgetId}')`, [widgetId]);
        },
        hide: (widgetId: string) => {
          addConsoleLog('log', `widget.hide('${widgetId}')`, [widgetId]);
        },
        on: (widgetId: string, event: string, callback: Function) => {
          addConsoleLog('log', `widget.on('${widgetId}', '${event}', ...)`, [widgetId, event]);
          return () => {};
        },
        emit: (widgetId: string, event: string, value?: any) => {
          addConsoleLog('log', `widget.emit('${widgetId}', '${event}', ${JSON.stringify(value)})`, [widgetId, event, value]);
        }
      };
      
      const mockWs = {
        send: (deviceId: string, payload: any) => {
          addConsoleLog('log', `ws.send('${deviceId}', ${JSON.stringify(payload)})`, [deviceId, payload]);
        },
        onMessage: (callback: Function) => {
          addConsoleLog('log', 'ws.onMessage(...)', []);
          return () => {};
        },
        connect: async (url: string, onMessage?: Function) => {
          addConsoleLog('log', `ws.connect('${url}', ...)`, [url]);
          return true;
        },
        disconnect: (url: string) => {
          addConsoleLog('log', `ws.disconnect('${url}')`, [url]);
        }
      };
      
      const mockStorage = {
        set: (key: string, value: any) => {
          addConsoleLog('log', `storage.set('${key}', ${JSON.stringify(value)})`, [key, value]);
        },
        get: (key: string) => {
          addConsoleLog('log', `storage.get('${key}')`, [key]);
          return undefined;
        },
        remove: (key: string) => {
          addConsoleLog('log', `storage.remove('${key}')`, [key]);
        },
        clear: () => {
          addConsoleLog('log', 'storage.clear()', []);
        }
      };

      const mockDb = {
        save: async (key: string, value: any) => {
          addConsoleLog('log', `db.save('${key}', ${JSON.stringify(value)})`, [key, value]);
        },
        load: async (key: string) => {
          addConsoleLog('log', `db.load('${key}')`, [key]);
          return undefined;
        },
        remove: async (key: string) => {
          addConsoleLog('log', `db.remove('${key}')`, [key]);
        },
        list: async () => {
          addConsoleLog('log', 'db.list()', []);
          return [];
        }
      };

      const mockContext = {
        user: null,
        device: {
          type: 'desktop',
          isMobile: false,
          isTablet: false,
          isDesktop: true,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
          orientation: 'landscape',
          touchEnabled: false
        },
        dashboardId: state.config?.id || null
      };

      const mockLocation = {
        getCurrentPosition: async (options?: any) => {
          addConsoleLog('log', 'location.getCurrentPosition(...)', [options]);
          return {
            latitude: 0,
            longitude: 0,
            accuracy: 0,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            timestamp: Date.now()
          };
        },
        watchPosition: (callback: Function, options?: any) => {
          addConsoleLog('log', 'location.watchPosition(...)', [options]);
          return () => {};
        },
        isSupported: () => {
          return 'geolocation' in navigator;
        }
      };

      const mockHttp = {
        get: async (url: string, options?: any) => {
          addConsoleLog('log', `http.get('${url}', ...)`, [url, options]);
          return {};
        },
        post: async (url: string, body?: any, options?: any) => {
          addConsoleLog('log', `http.post('${url}', ${JSON.stringify(body)}, ...)`, [url, body]);
          return {};
        },
        put: async (url: string, body?: any, options?: any) => {
          addConsoleLog('log', `http.put('${url}', ${JSON.stringify(body)}, ...)`, [url, body]);
          return {};
        },
        delete: async (url: string, options?: any) => {
          addConsoleLog('log', `http.delete('${url}', ...)`, [url, options]);
          return {};
        },
        request: async (url: string, options?: any) => {
          addConsoleLog('log', `http.request('${url}', ...)`, [url, options]);
          return {};
        }
      };

      const mockDevice = {
        getDevices: async () => {
          addConsoleLog('log', 'device.getDevices()', []);
          return [
            { id: 'mock-device-1', name: 'Mock Device 1', online: true },
            { id: 'mock-device-2', name: 'Mock Device 2', online: false }
          ];
        },
        getDeviceData: async (deviceId: string, limit = 100) => {
          addConsoleLog('log', `device.getDeviceData('${deviceId}', ${limit})`, [deviceId, limit]);
          return [];
        },
        sendCommand: async (deviceId: string, command: any) => {
          addConsoleLog('log', `device.sendCommand('${deviceId}', ${JSON.stringify(command)})`, [deviceId, command]);
        }
      };

      const mockSensor = {
        platform: {
          isApp: false,
          isBrowser: true,
          capabilities: {
            hasDeviceMotion: typeof DeviceMotionEvent !== 'undefined',
            hasDeviceOrientation: typeof DeviceOrientationEvent !== 'undefined',
            hasGeolocation: 'geolocation' in navigator,
            hasMediaDevices: 'mediaDevices' in navigator
          }
        },
        accelerometer: {
          isSupported: () => typeof DeviceMotionEvent !== 'undefined',
          getCurrentReading: async () => {
            addConsoleLog('log', 'sensor.accelerometer.getCurrentReading()', []);
            return { x: 0, y: 0, z: 9.8, timestamp: Date.now() };
          },
          watch: (callback: Function, options?: any) => {
            addConsoleLog('log', 'sensor.accelerometer.watch(...)', [options]);
            return () => {};
          }
        },
        gyroscope: {
          isSupported: () => typeof DeviceOrientationEvent !== 'undefined',
          getCurrentReading: async () => {
            addConsoleLog('log', 'sensor.gyroscope.getCurrentReading()', []);
            return { alpha: 0, beta: 0, gamma: 0, timestamp: Date.now() };
          },
          watch: (callback: Function, options?: any) => {
            addConsoleLog('log', 'sensor.gyroscope.watch(...)', [options]);
            return () => {};
          }
        },
        magnetometer: {
          isSupported: () => typeof DeviceOrientationEvent !== 'undefined',
          getCurrentReading: async () => {
            addConsoleLog('log', 'sensor.magnetometer.getCurrentReading()', []);
            return { x: 0, y: 0, z: 0, heading: 0, timestamp: Date.now() };
          },
          watch: (callback: Function, options?: any) => {
            addConsoleLog('log', 'sensor.magnetometer.watch(...)', [options]);
            return () => {};
          }
        },
        ambientLight: {
          isSupported: () => 'AmbientLightSensor' in window,
          getCurrentReading: async () => {
            addConsoleLog('log', 'sensor.ambientLight.getCurrentReading()', []);
            return { illuminance: 500, timestamp: Date.now() };
          },
          watch: (callback: Function, options?: any) => {
            addConsoleLog('log', 'sensor.ambientLight.watch(...)', [options]);
            return () => {};
          }
        },
        microphone: {
          isSupported: () => 'mediaDevices' in navigator,
          requestPermission: async () => {
            addConsoleLog('log', 'sensor.microphone.requestPermission()', []);
            return { granted: false, denied: false, prompt: true };
          },
          watchLevel: (callback: Function, options?: any) => {
            addConsoleLog('log', 'sensor.microphone.watchLevel(...)', [options]);
            return () => {};
          }
        },
        camera: {
          isSupported: () => 'mediaDevices' in navigator,
          requestPermission: async () => {
            addConsoleLog('log', 'sensor.camera.requestPermission()', []);
            return { granted: false, denied: false, prompt: true };
          },
          capture: async (options?: any) => {
            addConsoleLog('log', 'sensor.camera.capture(...)', [options]);
            return null;
          }
        },
        biometric: {
          isSupported: () => 'credentials' in navigator,
          authenticate: async (options?: any) => {
            addConsoleLog('log', 'sensor.biometric.authenticate(...)', [options]);
            return { authenticated: false, method: 'fingerprint', timestamp: Date.now() };
          }
        },
        nfc: {
          isSupported: () => 'nfc' in navigator || 'NDEFReader' in window,
          scan: async (options?: any) => {
            addConsoleLog('log', 'sensor.nfc.scan(...)', [options]);
            return null;
          },
          write: async (data: string) => {
            addConsoleLog('log', `sensor.nfc.write('${data}')`, [data]);
            return false;
          }
        },
        proximity: { isSupported: () => false },
        barometer: { isSupported: () => false },
        temperature: { isSupported: () => false },
        humidity: { isSupported: () => false },
        heartRate: { isSupported: () => false },
        bloodOxygen: { isSupported: () => false },
        lidar: { isSupported: () => false }
      };
      
      const testConsole = {
        log: (...args: any[]) => addConsoleLog('log', args.map(a => String(a)).join(' '), args),
        warn: (...args: any[]) => addConsoleLog('warn', args.map(a => String(a)).join(' '), args),
        error: (...args: any[]) => addConsoleLog('error', args.map(a => String(a)).join(' '), args),
        info: (...args: any[]) => addConsoleLog('info', args.map(a => String(a)).join(' '), args),
      };
      
      // Execute script
      const scriptFunction = new Function(
        'widget',
        'ws',
        'storage',
        'db',
        'context',
        'location',
        'http',
        'device',
        'sensor',
        'console',
        'fetch',
        'setTimeout',
        'setInterval',
        script
      );
      
      scriptFunction(mockWidget, mockWs, mockStorage, mockDb, mockContext, mockLocation, mockHttp, mockDevice, mockSensor, testConsole, fetch, setTimeout, setInterval);
      
      const executionTime = performance.now() - startTime;
      
      toast.success(`Script executed successfully in ${executionTime.toFixed(2)}ms`);
    } catch (error: any) {
      addConsoleLog('error', `Script error: ${error.message}`, [error]);
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-background to-muted/30">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            IoT Script Editor
            {errorCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorCount} {errorCount === 1 ? 'error' : 'errors'}
              </Badge>
            )}
            {isAutoSaving && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3 animate-pulse" />
                Auto-saving...
              </Badge>
            )}
            {lastSaved && !isAutoSaving && (
              <span className="text-xs text-muted-foreground">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            Write JavaScript to control IoT devices and dashboard behavior
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={editorTheme} onValueChange={setEditorTheme}>
            <SelectTrigger className="w-[140px]">
              <Palette className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vs-dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="hc-black">High Contrast Dark</SelectItem>
              <SelectItem value="hc-light">High Contrast Light</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isSaving || isRunning}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={isSaving || isRunning}
          >
            <Play className="h-4 w-4 mr-2" />
            Test
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isRunning}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col min-h-0 rounded-lg border overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={script}
            onChange={(value) => setScript(value || '')}
            theme={editorTheme}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              formatOnPaste: true,
              quickSuggestions: true,
              folding: true,
              matchBrackets: 'always',
              autoClosingBrackets: 'always',
            }}
          />
        </div>

        {/* Right Panel - Widget List & Console */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          {/* Widget IDs Reference Panel */}
          <Collapsible open={isWidgetListOpen} onOpenChange={setIsWidgetListOpen}>
            <div className="rounded-lg border bg-card">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent/50 transition-colors">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  📋 Widget IDs
                  <Badge variant="secondary" className="text-xs">
                    {state.config?.pages.find(p => p.id === state.activePageId)?.widgets.length || 0}
                  </Badge>
                </h4>
                {isWidgetListOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-2 max-h-[200px] overflow-auto space-y-1">
                  {(() => {
                    const currentPage = state.config?.pages.find(p => p.id === state.activePageId);
                    const widgets = currentPage?.widgets || [];
                    
                    if (widgets.length === 0) {
                      return (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No widgets on this page
                        </div>
                      );
                    }
                    
                    return widgets.map(widget => (
                      <div
                        key={widget.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-accent/50 group transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{widget.title || 'Untitled'}</div>
                          <code className="text-xs text-muted-foreground truncate block">{widget.id}</code>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyWidgetId(widget.id)}
                        >
                          {copiedWidgetId === widget.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    ));
                  })()}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Console Output */}
          <div className="flex-1 flex flex-col gap-2 min-h-[300px]">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Console Output</h4>
              <Button variant="ghost" size="sm" onClick={clearConsoleLogs}>
                Clear
              </Button>
            </div>
            <div className="flex-1 rounded-lg border bg-black/5 dark:bg-black/20 p-2 overflow-auto font-mono text-xs">
              {consoleLogs.length === 0 ? (
                <div className="text-muted-foreground">No output yet. Run your script to see results.</div>
              ) : (
                <div className="space-y-1">
                  {consoleLogs.map(log => (
                    <div
                      key={log.id}
                      className={`${
                        log.type === 'error' ? 'text-red-500' :
                        log.type === 'warn' ? 'text-yellow-500' :
                        log.type === 'info' ? 'text-blue-500' :
                        'text-foreground'
                      }`}
                    >
                      <span className="text-muted-foreground text-[10px]">
                        {log.timestamp.toLocaleTimeString()}
                      </span>{' '}
                      {log.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Tips */}
      <div className="p-4 border-t bg-muted/30">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-2">💡 Quick Tips:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div><code className="px-1 py-0.5 bg-background rounded">widget.on()</code> - Listen to events</div>
            <div><code className="px-1 py-0.5 bg-background rounded">ws.send()</code> - Send to device</div>
            <div><code className="px-1 py-0.5 bg-background rounded">storage.set()</code> - Store data</div>
            <div><code className="px-1 py-0.5 bg-background rounded">db.query()</code> - Query data</div>
          </div>
        </div>
      </div>
    </div>
  );
};
