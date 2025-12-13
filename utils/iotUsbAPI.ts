/**
 * IoT Dashboard USB Serial Communication API
 * Provides USB serial port access for IoT Dashboard scripts
 * Uses Web Serial API for browser-based USB communication
 * 
 * Supported Features:
 * - USB device enumeration and filtering
 * - Serial port connection management
 * - Data transmission (send/receive)
 * - Baud rate configuration
 * - Flow control settings
 * - Error handling and disconnect detection
 */

// Type definition for Web Serial API (not yet in TypeScript lib)
type SerialPort = any;

export type IoTUsbConsoleLogCallback = (type: 'log' | 'warn' | 'error' | 'info', message: string, args: any[]) => void;

export interface IoTUsbPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

export interface IoTUsbConnectionOptions {
  baudRate?: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
}

export interface IoTUsbDevice {
  portInfo: IoTUsbPortInfo;
  connected: boolean;
  readable: boolean;
  writable: boolean;
}

export interface IoTUsbFilter {
  usbVendorId?: number;
  usbProductId?: number;
}

// Platform detection for USB support
export function getIoTUsbCapabilities() {
  const hasWebSerial = 'serial' in navigator;
  const isSecureContext = window.isSecureContext;
  
  return {
    hasWebSerial,
    isSecureContext,
    isSupported: hasWebSerial && isSecureContext,
  };
}

/**
 * Create IoT Dashboard USB Serial API
 */
export function createIoTUsbAPI(consoleLog?: IoTUsbConsoleLogCallback) {
  const capabilities = getIoTUsbCapabilities();
  const log = (type: 'log' | 'warn' | 'error' | 'info', message: string, ...args: any[]) => {
    consoleLog?.(type, message, args);
  };

  // Store active ports and readers/writers
  const activePorts = new Map<SerialPort, {
    reader: ReadableStreamDefaultReader<Uint8Array> | null;
    writer: WritableStreamDefaultWriter<Uint8Array> | null;
    readCallback: ((data: Uint8Array) => void) | null;
    isReading: boolean;
  }>();

  return {
    // Platform information
    platform: {
      isSupported: capabilities.isSupported,
      hasWebSerial: capabilities.hasWebSerial,
      isSecureContext: capabilities.isSecureContext,
    },

    // Check if USB Serial API is supported
    isSupported: (): boolean => {
      if (!capabilities.isSupported) {
        if (!capabilities.isSecureContext) {
          log('warn', '[IoT USB] Web Serial API requires secure context (HTTPS)');
        } else {
          log('warn', '[IoT USB] Web Serial API not supported in this browser');
        }
        return false;
      }
      return true;
    },

    // Request access to USB serial port
    requestPort: async (options?: { filters?: IoTUsbFilter[] }): Promise<SerialPort | null> => {
      if (!capabilities.hasWebSerial) {
        log('error', '[IoT USB] Web Serial API not available');
        return null;
      }

      try {
        const filters = options?.filters?.map(f => ({
          usbVendorId: f.usbVendorId,
          usbProductId: f.usbProductId,
        }));

        const port = await (navigator as any).serial.requestPort({
          filters: filters || [],
        });

        log('info', '[IoT USB] USB serial port access granted');
        return port;
      } catch (error: any) {
        if (error.name === 'NotFoundError') {
          log('warn', '[IoT USB] No USB device selected');
        } else {
          log('error', '[IoT USB] Failed to request USB port', error);
        }
        return null;
      }
    },

    // Get list of previously authorized ports
    getPorts: async (): Promise<SerialPort[]> => {
      if (!capabilities.hasWebSerial) {
        log('error', '[IoT USB] Web Serial API not available');
        return [];
      }

      try {
        const ports = await (navigator as any).serial.getPorts();
        log('info', `[IoT USB] Found ${ports.length} authorized USB serial port(s)`);
        return ports;
      } catch (error) {
        log('error', '[IoT USB] Failed to get USB ports', error);
        return [];
      }
    },

    // Connect to USB serial port
    connect: async (
      port: SerialPort,
      options?: IoTUsbConnectionOptions
    ): Promise<boolean> => {
      if (!port) {
        log('error', '[IoT USB] Invalid port');
        return false;
      }

      try {
        const openOptions = {
          baudRate: options?.baudRate || 9600,
          dataBits: options?.dataBits || 8,
          stopBits: options?.stopBits || 1,
          parity: options?.parity || 'none',
          bufferSize: options?.bufferSize || 255,
          flowControl: options?.flowControl || 'none',
        };

        await port.open(openOptions as any);
        
        // Initialize port tracking
        activePorts.set(port, {
          reader: null,
          writer: null,
          readCallback: null,
          isReading: false,
        });

        log('info', `[IoT USB] Connected to USB serial port at ${openOptions.baudRate} baud`);
        return true;
      } catch (error: any) {
        if (error.name === 'InvalidStateError') {
          log('warn', '[IoT USB] Port is already open');
        } else {
          log('error', '[IoT USB] Failed to connect to USB port', error);
        }
        return false;
      }
    },

    // Disconnect from USB serial port
    disconnect: async (port: SerialPort): Promise<boolean> => {
      if (!port) {
        log('error', '[IoT USB] Invalid port');
        return false;
      }

      try {
        const portData = activePorts.get(port);
        
        // Stop reading if active
        if (portData?.reader) {
          try {
            await portData.reader.cancel();
          } catch (e) {
            // Reader may already be closed
          }
        }

        // Close writer if active
        if (portData?.writer) {
          try {
            await portData.writer.close();
          } catch (e) {
            // Writer may already be closed
          }
        }

        // Close the port
        await port.close();
        
        // Remove from active ports
        activePorts.delete(port);

        log('info', '[IoT USB] Disconnected from USB serial port');
        return true;
      } catch (error) {
        log('error', '[IoT USB] Failed to disconnect from USB port', error);
        return false;
      }
    },

    // Send data to USB serial port
    send: async (port: SerialPort, data: string | Uint8Array): Promise<boolean> => {
      if (!port) {
        log('error', '[IoT USB] Invalid port');
        return false;
      }

      try {
        const portData = activePorts.get(port);
        
        if (!portData) {
          log('error', '[IoT USB] Port not connected');
          return false;
        }

        // Get or create writer
        let writer = portData.writer;
        if (!writer && port.writable) {
          writer = port.writable.getWriter();
          portData.writer = writer;
        }

        if (!writer) {
          log('error', '[IoT USB] Port not writable');
          return false;
        }

        // Convert string to Uint8Array if needed
        const dataArray = typeof data === 'string' 
          ? new TextEncoder().encode(data)
          : data;

        await writer.write(dataArray);
        
        log('info', `[IoT USB] Sent ${dataArray.length} bytes to USB serial port`);
        return true;
      } catch (error) {
        log('error', '[IoT USB] Failed to send data to USB port', error);
        return false;
      }
    },

    // Read data from USB serial port (one-time read)
    read: async (port: SerialPort, timeoutMs?: number): Promise<Uint8Array | null> => {
      if (!port) {
        log('error', '[IoT USB] Invalid port');
        return null;
      }

      try {
        const portData = activePorts.get(port);
        
        if (!portData) {
          log('error', '[IoT USB] Port not connected');
          return null;
        }

        if (!port.readable) {
          log('error', '[IoT USB] Port not readable');
          return null;
        }

        const reader = port.readable.getReader();
        
        const timeout = timeoutMs || 5000;
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), timeout);
        });

        const readPromise = reader.read().then(({ value, done }) => {
          reader.releaseLock();
          if (done) {
            return null;
          }
          return value || null;
        });

        const result = await Promise.race([readPromise, timeoutPromise]);
        
        if (result) {
          log('info', `[IoT USB] Read ${result.length} bytes from USB serial port`);
        } else {
          log('warn', '[IoT USB] Read timeout or no data available');
        }

        return result;
      } catch (error) {
        log('error', '[IoT USB] Failed to read from USB port', error);
        return null;
      }
    },

    // Start continuous reading from USB serial port
    startReading: async (
      port: SerialPort,
      callback: (data: Uint8Array) => void
    ): Promise<boolean> => {
      if (!port) {
        log('error', '[IoT USB] Invalid port');
        return false;
      }

      try {
        const portData = activePorts.get(port);
        
        if (!portData) {
          log('error', '[IoT USB] Port not connected');
          return false;
        }

        if (portData.isReading) {
          log('warn', '[IoT USB] Already reading from this port');
          return true;
        }

        if (!port.readable) {
          log('error', '[IoT USB] Port not readable');
          return false;
        }

        portData.readCallback = callback;
        portData.isReading = true;

        // Start async read loop
        const readLoop = async () => {
          const reader = port.readable!.getReader();
          portData.reader = reader;

          try {
            while (portData.isReading) {
              const { value, done } = await reader.read();
              
              if (done) {
                log('info', '[IoT USB] Stream closed');
                break;
              }

              if (value && portData.readCallback) {
                portData.readCallback(value);
              }
            }
          } catch (error: any) {
            if (error.name === 'NetworkError') {
              log('warn', '[IoT USB] USB device disconnected');
            } else {
              log('error', '[IoT USB] Error reading from USB port', error);
            }
          } finally {
            try {
              reader.releaseLock();
            } catch (e) {
              // Reader may already be released
            }
            portData.reader = null;
            portData.isReading = false;
          }
        };

        // Start reading in background
        readLoop();

        log('info', '[IoT USB] Started continuous reading from USB serial port');
        return true;
      } catch (error) {
        log('error', '[IoT USB] Failed to start reading from USB port', error);
        return false;
      }
    },

    // Stop continuous reading from USB serial port
    stopReading: async (port: SerialPort): Promise<boolean> => {
      if (!port) {
        log('error', '[IoT USB] Invalid port');
        return false;
      }

      try {
        const portData = activePorts.get(port);
        
        if (!portData) {
          log('warn', '[IoT USB] Port not found in active ports');
          return false;
        }

        if (!portData.isReading) {
          log('warn', '[IoT USB] Not currently reading from this port');
          return true;
        }

        portData.isReading = false;
        portData.readCallback = null;

        if (portData.reader) {
          try {
            await portData.reader.cancel();
          } catch (e) {
            // Reader may already be cancelled
          }
        }

        log('info', '[IoT USB] Stopped reading from USB serial port');
        return true;
      } catch (error) {
        log('error', '[IoT USB] Failed to stop reading from USB port', error);
        return false;
      }
    },

    // Get port information
    getPortInfo: (port: SerialPort): IoTUsbDevice | null => {
      if (!port) {
        return null;
      }

      const info = port.getInfo();
      const portData = activePorts.get(port);

      return {
        portInfo: {
          usbVendorId: info.usbVendorId,
          usbProductId: info.usbProductId,
        },
        connected: portData !== undefined,
        readable: port.readable !== null,
        writable: port.writable !== null,
      };
    },

    // Check if port is connected
    isConnected: (port: SerialPort): boolean => {
      if (!port) {
        return false;
      }
      return activePorts.has(port);
    },

    // Utility: Convert Uint8Array to string
    arrayToString: (data: Uint8Array): string => {
      return new TextDecoder().decode(data);
    },

    // Utility: Convert string to Uint8Array
    stringToArray: (data: string): Uint8Array => {
      return new TextEncoder().encode(data);
    },

    // Utility: Convert Uint8Array to hex string
    arrayToHex: (data: Uint8Array): string => {
      return Array.from(data)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(' ');
    },
  };
}
