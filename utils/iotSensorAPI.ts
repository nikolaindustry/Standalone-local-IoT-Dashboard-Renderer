/**
 * IoT Dashboard Sensor API
 * Provides access to device sensors for IoT Dashboard scripts
 * Independent implementation for IoT Dashboard context
 * 
 * Supported Sensors:
 * - Accelerometer (motion)
 * - Gyroscope (orientation)
 * - Magnetometer (compass)
 * - GPS (geolocation)
 * - Proximity Sensor
 * - Ambient Light Sensor
 * - Barometer (pressure)
 * - Microphone (audio)
 * - NFC
 * - Humidity Sensor
 * - Temperature Sensor
 * - Heart Rate & Blood Oxygen (specialized)
 * - Biometric (fingerprint)
 * - Image Sensors (camera)
 * - LiDAR (depth sensing)
 */

export type IoTConsoleLogCallback = (type: 'log' | 'warn' | 'error' | 'info', message: string, args: any[]) => void;

export interface IoTSensorPermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  error?: string;
}

export interface IoTAccelerometerReading {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface IoTGyroscopeReading {
  alpha: number; // rotation around z-axis (0-360)
  beta: number;  // rotation around x-axis (-180 to 180)
  gamma: number; // rotation around y-axis (-90 to 90)
  timestamp: number;
}

export interface IoTMagnetometerReading {
  x: number;
  y: number;
  z: number;
  heading: number; // compass heading (0-360)
  timestamp: number;
}

export interface IoTProximityReading {
  distance: number | null; // distance in cm, null if not available
  near: boolean;
  timestamp: number;
}

export interface IoTAmbientLightReading {
  illuminance: number; // lux
  timestamp: number;
}

export interface IoTBarometerReading {
  pressure: number; // hPa (hectopascals)
  altitude?: number; // meters (estimated)
  timestamp: number;
}

export interface IoTTemperatureReading {
  celsius: number;
  fahrenheit: number;
  timestamp: number;
}

export interface IoTHumidityReading {
  relativeHumidity: number; // percentage (0-100)
  timestamp: number;
}

export interface IoTHeartRateReading {
  heartRate: number; // beats per minute
  timestamp: number;
}

export interface IoTBloodOxygenReading {
  spo2: number; // percentage (0-100)
  timestamp: number;
}

export interface IoTAudioLevel {
  level: number; // 0-100
  decibels: number;
  timestamp: number;
}

export interface IoTBiometricResult {
  authenticated: boolean;
  method: 'fingerprint' | 'face' | 'other';
  timestamp: number;
}

export interface IoTCameraCapture {
  dataUrl: string;
  width: number;
  height: number;
  timestamp: number;
}

// Platform detection for IoT context
export function getIoTPlatformCapabilities() {
  const isApp = !!(window as any).cordova || !!(window as any).ReactNativeWebView;
  const isBrowser = !isApp;
  
  return {
    isApp,
    isBrowser,
    hasDeviceMotion: typeof DeviceMotionEvent !== 'undefined',
    hasDeviceOrientation: typeof DeviceOrientationEvent !== 'undefined',
    hasGeolocation: 'geolocation' in navigator,
    hasMediaDevices: 'mediaDevices' in navigator,
    hasUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    hasBluetooth: 'bluetooth' in navigator,
    hasNFC: 'nfc' in navigator || 'NDEFReader' in window,
    hasAmbientLight: 'AmbientLightSensor' in window,
    hasAccelerometer: 'Accelerometer' in window,
    hasGyroscope: 'Gyroscope' in window,
    hasMagnetometer: 'Magnetometer' in window,
    hasProximitySensor: 'ProximitySensor' in window,
    hasWebAuthentication: 'credentials' in navigator,
  };
}

/**
 * Create IoT Dashboard Sensor API
 */
export function createIoTSensorAPI(consoleLog?: IoTConsoleLogCallback) {
  const platform = getIoTPlatformCapabilities();
  const log = (type: 'log' | 'warn' | 'error' | 'info', message: string, ...args: any[]) => {
    consoleLog?.(type, message, args);
  };

  return {
    // Platform information
    platform: {
      isApp: platform.isApp,
      isBrowser: platform.isBrowser,
      capabilities: platform,
    },

    // Accelerometer API
    accelerometer: {
      isSupported: () => platform.hasDeviceMotion || platform.hasAccelerometer,
      
      getCurrentReading: async (): Promise<IoTAccelerometerReading | null> => {
        if (!platform.hasDeviceMotion) {
          log('warn', '[IoT Sensor] Accelerometer not supported on this device');
          return null;
        }
        
        return new Promise((resolve) => {
          const handler = (event: DeviceMotionEvent) => {
            if (event.accelerationIncludingGravity) {
              resolve({
                x: event.accelerationIncludingGravity.x || 0,
                y: event.accelerationIncludingGravity.y || 0,
                z: event.accelerationIncludingGravity.z || 0,
                timestamp: Date.now(),
              });
            } else {
              resolve(null);
            }
            window.removeEventListener('devicemotion', handler);
          };
          
          window.addEventListener('devicemotion', handler);
          
          setTimeout(() => {
            window.removeEventListener('devicemotion', handler);
            resolve(null);
          }, 5000);
        });
      },
      
      watch: (callback: (reading: IoTAccelerometerReading) => void, options?: { frequency?: number }) => {
        if (!platform.hasDeviceMotion) {
          log('warn', '[IoT Sensor] Accelerometer not supported');
          return () => {};
        }
        
        const frequency = options?.frequency || 100;
        let lastUpdate = 0;
        
        const handler = (event: DeviceMotionEvent) => {
          const now = Date.now();
          if (now - lastUpdate < frequency) return;
          lastUpdate = now;
          
          if (event.accelerationIncludingGravity) {
            callback({
              x: event.accelerationIncludingGravity.x || 0,
              y: event.accelerationIncludingGravity.y || 0,
              z: event.accelerationIncludingGravity.z || 0,
              timestamp: now,
            });
          }
        };
        
        window.addEventListener('devicemotion', handler);
        log('info', '[IoT Sensor] Accelerometer watching started');
        
        return () => {
          window.removeEventListener('devicemotion', handler);
          log('info', '[IoT Sensor] Accelerometer watching stopped');
        };
      },
    },

    // Gyroscope API
    gyroscope: {
      isSupported: () => platform.hasDeviceOrientation || platform.hasGyroscope,
      
      getCurrentReading: async (): Promise<IoTGyroscopeReading | null> => {
        if (!platform.hasDeviceOrientation) {
          log('warn', '[IoT Sensor] Gyroscope not supported on this device');
          return null;
        }
        
        return new Promise((resolve) => {
          const handler = (event: DeviceOrientationEvent) => {
            resolve({
              alpha: event.alpha || 0,
              beta: event.beta || 0,
              gamma: event.gamma || 0,
              timestamp: Date.now(),
            });
            window.removeEventListener('deviceorientation', handler);
          };
          
          window.addEventListener('deviceorientation', handler);
          
          setTimeout(() => {
            window.removeEventListener('deviceorientation', handler);
            resolve(null);
          }, 5000);
        });
      },
      
      watch: (callback: (reading: IoTGyroscopeReading) => void, options?: { frequency?: number }) => {
        if (!platform.hasDeviceOrientation) {
          log('warn', '[IoT Sensor] Gyroscope not supported');
          return () => {};
        }
        
        const frequency = options?.frequency || 100;
        let lastUpdate = 0;
        
        const handler = (event: DeviceOrientationEvent) => {
          const now = Date.now();
          if (now - lastUpdate < frequency) return;
          lastUpdate = now;
          
          callback({
            alpha: event.alpha || 0,
            beta: event.beta || 0,
            gamma: event.gamma || 0,
            timestamp: now,
          });
        };
        
        window.addEventListener('deviceorientation', handler);
        log('info', '[IoT Sensor] Gyroscope watching started');
        
        return () => {
          window.removeEventListener('deviceorientation', handler);
          log('info', '[IoT Sensor] Gyroscope watching stopped');
        };
      },
    },

    // Magnetometer / Compass API
    magnetometer: {
      isSupported: () => platform.hasDeviceOrientation || platform.hasMagnetometer,
      
      getCurrentReading: async (): Promise<IoTMagnetometerReading | null> => {
        if (!platform.hasDeviceOrientation) {
          log('warn', '[IoT Sensor] Magnetometer not supported on this device');
          return null;
        }
        
        return new Promise((resolve) => {
          const handler = (event: DeviceOrientationEvent) => {
            const heading = (event as any).webkitCompassHeading || event.alpha || 0;
            resolve({
              x: 0,
              y: 0,
              z: 0,
              heading: heading,
              timestamp: Date.now(),
            });
            window.removeEventListener('deviceorientationabsolute', handler);
            window.removeEventListener('deviceorientation', handler);
          };
          
          window.addEventListener('deviceorientationabsolute', handler);
          window.addEventListener('deviceorientation', handler);
          
          setTimeout(() => {
            window.removeEventListener('deviceorientationabsolute', handler);
            window.removeEventListener('deviceorientation', handler);
            resolve(null);
          }, 5000);
        });
      },
      
      watch: (callback: (reading: IoTMagnetometerReading) => void, options?: { frequency?: number }) => {
        if (!platform.hasDeviceOrientation) {
          log('warn', '[IoT Sensor] Magnetometer not supported');
          return () => {};
        }
        
        const frequency = options?.frequency || 100;
        let lastUpdate = 0;
        
        const handler = (event: DeviceOrientationEvent) => {
          const now = Date.now();
          if (now - lastUpdate < frequency) return;
          lastUpdate = now;
          
          const heading = (event as any).webkitCompassHeading || event.alpha || 0;
          callback({
            x: 0,
            y: 0,
            z: 0,
            heading: heading,
            timestamp: now,
          });
        };
        
        window.addEventListener('deviceorientationabsolute', handler);
        window.addEventListener('deviceorientation', handler);
        log('info', '[IoT Sensor] Magnetometer watching started');
        
        return () => {
          window.removeEventListener('deviceorientationabsolute', handler);
          window.removeEventListener('deviceorientation', handler);
          log('info', '[IoT Sensor] Magnetometer watching stopped');
        };
      },
    },

    // Ambient Light Sensor API
    ambientLight: {
      isSupported: () => platform.hasAmbientLight || 'ondevicelight' in window,
      
      getCurrentReading: async (): Promise<IoTAmbientLightReading | null> => {
        if (platform.hasAmbientLight) {
          try {
            const sensor = new (window as any).AmbientLightSensor();
            return new Promise((resolve, reject) => {
              sensor.onreading = () => {
                resolve({
                  illuminance: sensor.illuminance,
                  timestamp: Date.now(),
                });
                sensor.stop();
              };
              sensor.onerror = () => {
                reject(new Error('Ambient light sensor error'));
                sensor.stop();
              };
              sensor.start();
            });
          } catch (error) {
            log('error', '[IoT Sensor] Ambient light sensor error', error);
            return null;
          }
        }
        
        log('warn', '[IoT Sensor] Ambient light sensor not supported');
        return null;
      },
      
      watch: (callback: (reading: IoTAmbientLightReading) => void, options?: { frequency?: number }) => {
        if (!platform.hasAmbientLight && !('ondevicelight' in window)) {
          log('warn', '[IoT Sensor] Ambient light sensor not supported');
          return () => {};
        }
        
        if (platform.hasAmbientLight) {
          try {
            const sensor = new (window as any).AmbientLightSensor({ frequency: options?.frequency || 1 });
            
            sensor.onreading = () => {
              callback({
                illuminance: sensor.illuminance,
                timestamp: Date.now(),
              });
            };
            
            sensor.onerror = (error: any) => {
              log('error', '[IoT Sensor] Ambient light sensor error', error);
            };
            
            sensor.start();
            log('info', '[IoT Sensor] Ambient light sensor watching started');
            
            return () => {
              sensor.stop();
              log('info', '[IoT Sensor] Ambient light sensor watching stopped');
            };
          } catch (error) {
            log('error', '[IoT Sensor] Failed to start ambient light sensor', error);
            return () => {};
          }
        }
        
        const handler = (event: any) => {
          callback({
            illuminance: event.value,
            timestamp: Date.now(),
          });
        };
        
        window.addEventListener('devicelight', handler);
        log('info', '[IoT Sensor] Ambient light sensor (legacy) watching started');
        
        return () => {
          window.removeEventListener('devicelight', handler);
          log('info', '[IoT Sensor] Ambient light sensor watching stopped');
        };
      },
    },

    // Microphone / Audio Level API
    microphone: {
      isSupported: () => platform.hasUserMedia,
      
      requestPermission: async (): Promise<IoTSensorPermissionStatus> => {
        if (!platform.hasUserMedia) {
          return { granted: false, denied: true, prompt: false, error: 'Microphone not supported' };
        }
        
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          log('info', '[IoT Sensor] Microphone permission granted');
          return { granted: true, denied: false, prompt: false };
        } catch (error: any) {
          log('error', '[IoT Sensor] Microphone permission denied', error);
          return { granted: false, denied: true, prompt: false, error: error.message };
        }
      },
      
      watchLevel: (callback: (level: IoTAudioLevel) => void, options?: { frequency?: number }) => {
        if (!platform.hasUserMedia) {
          log('warn', '[IoT Sensor] Microphone not supported');
          return () => {};
        }
        
        let audioContext: AudioContext | null = null;
        let analyser: AnalyserNode | null = null;
        let microphone: MediaStreamAudioSourceNode | null = null;
        let stream: MediaStream | null = null;
        let animationId: number | null = null;
        
        const frequency = options?.frequency || 100;
        let lastUpdate = 0;
        
        const cleanup = () => {
          if (animationId) cancelAnimationFrame(animationId);
          if (microphone) microphone.disconnect();
          if (analyser) analyser.disconnect();
          if (stream) stream.getTracks().forEach(track => track.stop());
          if (audioContext && audioContext.state !== 'closed') audioContext.close();
          log('info', '[IoT Sensor] Microphone monitoring stopped');
        };
        
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((mediaStream) => {
            stream = mediaStream;
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();
            microphone = audioContext.createMediaStreamSource(mediaStream);
            
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            microphone.connect(analyser);
            
            const updateLevel = () => {
              const now = Date.now();
              if (now - lastUpdate >= frequency) {
                lastUpdate = now;
                analyser!.getByteFrequencyData(dataArray);
                
                const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
                const level = Math.round((average / 255) * 100);
                const decibels = 20 * Math.log10(average / 255);
                
                callback({
                  level,
                  decibels: isFinite(decibels) ? decibels : -Infinity,
                  timestamp: now,
                });
              }
              
              animationId = requestAnimationFrame(updateLevel);
            };
            
            updateLevel();
            log('info', '[IoT Sensor] Microphone monitoring started');
          })
          .catch((error) => {
            log('error', '[IoT Sensor] Failed to access microphone', error);
          });
        
        return cleanup;
      },
    },

    // Camera / Image Sensor API
    camera: {
      isSupported: () => platform.hasUserMedia,
      
      requestPermission: async (): Promise<IoTSensorPermissionStatus> => {
        if (!platform.hasUserMedia) {
          return { granted: false, denied: true, prompt: false, error: 'Camera not supported' };
        }
        
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          log('info', '[IoT Sensor] Camera permission granted');
          return { granted: true, denied: false, prompt: false };
        } catch (error: any) {
          log('error', '[IoT Sensor] Camera permission denied', error);
          return { granted: false, denied: true, prompt: false, error: error.message };
        }
      },
      
      capture: async (options?: { width?: number; height?: number; facingMode?: 'user' | 'environment' }): Promise<IoTCameraCapture | null> => {
        if (!platform.hasUserMedia) {
          log('warn', '[IoT Sensor] Camera not supported');
          return null;
        }
        
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: options?.width || 640,
              height: options?.height || 480,
              facingMode: options?.facingMode || 'environment',
            },
          });
          
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();
          
          return new Promise((resolve) => {
            video.onloadedmetadata = () => {
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(video, 0, 0);
              
              const dataUrl = canvas.toDataURL('image/jpeg');
              
              stream.getTracks().forEach(track => track.stop());
              
              resolve({
                dataUrl,
                width: canvas.width,
                height: canvas.height,
                timestamp: Date.now(),
              });
              
              log('info', '[IoT Sensor] Image captured from camera');
            };
          });
        } catch (error) {
          log('error', '[IoT Sensor] Failed to capture image', error);
          return null;
        }
      },
    },

    // Biometric Authentication API
    biometric: {
      isSupported: () => platform.hasWebAuthentication,
      
      authenticate: async (options?: { promptMessage?: string }): Promise<IoTBiometricResult | null> => {
        if (!platform.hasWebAuthentication) {
          log('warn', '[IoT Sensor] Biometric authentication not supported');
          return null;
        }
        
        try {
          const publicKeyCredential = await (navigator as any).credentials.get({
            publicKey: {
              challenge: new Uint8Array(32),
              timeout: 60000,
              userVerification: 'required',
            },
          });
          
          log('info', '[IoT Sensor] Biometric authentication successful');
          
          return {
            authenticated: !!publicKeyCredential,
            method: 'fingerprint',
            timestamp: Date.now(),
          };
        } catch (error) {
          log('error', '[IoT Sensor] Biometric authentication failed', error);
          return {
            authenticated: false,
            method: 'other',
            timestamp: Date.now(),
          };
        }
      },
    },

    // NFC API
    nfc: {
      isSupported: () => platform.hasNFC,
      
      scan: async (options?: { timeout?: number }): Promise<string | null> => {
        if (!platform.hasNFC) {
          log('warn', '[IoT Sensor] NFC not supported on this device');
          return null;
        }
        
        try {
          const ndef = new (window as any).NDEFReader();
          await ndef.scan();
          
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('NFC scan timeout'));
            }, options?.timeout || 10000);
            
            ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
              clearTimeout(timeout);
              log('info', '[IoT Sensor] NFC tag detected', serialNumber);
              resolve(serialNumber);
            });
            
            ndef.addEventListener('readingerror', () => {
              clearTimeout(timeout);
              reject(new Error('NFC read error'));
            });
          });
        } catch (error) {
          log('error', '[IoT Sensor] NFC scan failed', error);
          return null;
        }
      },
      
      write: async (data: string): Promise<boolean> => {
        if (!platform.hasNFC) {
          log('warn', '[IoT Sensor] NFC not supported on this device');
          return false;
        }
        
        try {
          const ndef = new (window as any).NDEFReader();
          await ndef.write({ records: [{ recordType: 'text', data }] });
          log('info', '[IoT Sensor] NFC write successful');
          return true;
        } catch (error) {
          log('error', '[IoT Sensor] NFC write failed', error);
          return false;
        }
      },
    },

    // Simulated sensors (require native app via Cordova/React Native)
    
    proximity: {
      isSupported: () => platform.hasProximitySensor || !!(window as any).cordova,
      
      getCurrentReading: async (): Promise<IoTProximityReading | null> => {
        log('warn', '[IoT Sensor] Proximity sensor requires native app. Use Cordova/React Native for full support.');
        return null;
      },
      
      watch: (callback: (reading: IoTProximityReading) => void) => {
        log('warn', '[IoT Sensor] Proximity sensor requires native app');
        return () => {};
      },
    },

    barometer: {
      isSupported: () => !!(window as any).cordova,
      
      getCurrentReading: async (): Promise<IoTBarometerReading | null> => {
        log('warn', '[IoT Sensor] Barometer requires native app. Use Cordova/React Native for full support.');
        return null;
      },
      
      watch: (callback: (reading: IoTBarometerReading) => void) => {
        log('warn', '[IoT Sensor] Barometer requires native app');
        return () => {};
      },
    },

    temperature: {
      isSupported: () => !!(window as any).cordova,
      
      getCurrentReading: async (): Promise<IoTTemperatureReading | null> => {
        log('warn', '[IoT Sensor] Temperature sensor requires native app. Use Cordova/React Native for full support.');
        return null;
      },
      
      watch: (callback: (reading: IoTTemperatureReading) => void) => {
        log('warn', '[IoT Sensor] Temperature sensor requires native app');
        return () => {};
      },
    },

    humidity: {
      isSupported: () => !!(window as any).cordova,
      
      getCurrentReading: async (): Promise<IoTHumidityReading | null> => {
        log('warn', '[IoT Sensor] Humidity sensor requires native app. Use Cordova/React Native for full support.');
        return null;
      },
      
      watch: (callback: (reading: IoTHumidityReading) => void) => {
        log('warn', '[IoT Sensor] Humidity sensor requires native app');
        return () => {};
      },
    },

    heartRate: {
      isSupported: () => !!(window as any).cordova,
      
      getCurrentReading: async (): Promise<IoTHeartRateReading | null> => {
        log('warn', '[IoT Sensor] Heart rate sensor requires native app. Use Cordova/React Native for full support.');
        return null;
      },
      
      watch: (callback: (reading: IoTHeartRateReading) => void) => {
        log('warn', '[IoT Sensor] Heart rate sensor requires native app');
        return () => {};
      },
    },

    bloodOxygen: {
      isSupported: () => !!(window as any).cordova,
      
      getCurrentReading: async (): Promise<IoTBloodOxygenReading | null> => {
        log('warn', '[IoT Sensor] Blood oxygen sensor requires native app. Use Cordova/React Native for full support.');
        return null;
      },
      
      watch: (callback: (reading: IoTBloodOxygenReading) => void) => {
        log('warn', '[IoT Sensor] Blood oxygen sensor requires native app');
        return () => {};
      },
    },

    lidar: {
      isSupported: () => !!(window as any).cordova,
      
      scan: async (): Promise<any | null> => {
        log('warn', '[IoT Sensor] LiDAR requires native iOS app. Use Swift/React Native for full support.');
        return null;
      },
    },
  };
}
