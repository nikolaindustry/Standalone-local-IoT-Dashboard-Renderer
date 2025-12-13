import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Html5Qrcode } from 'html5-qrcode';
import { Square, QrCode, Smartphone, Monitor } from 'lucide-react';

interface QRScannerFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

export const QRScannerField: React.FC<QRScannerFieldProps> = ({
  id,
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Tap to scan QR code"
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMethod, setScanMethod] = useState<'native' | 'web' | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();
  const isNativePlatform = Capacitor.isNativePlatform();
  const isMounted = useRef(true);

  // Check if we're running in a secure context (HTTPS)
  const isSecureContext = () => {
    // In a browser environment
    if (typeof window !== 'undefined') {
      return window.isSecureContext || location.protocol === 'https:';
    }
    // In a Capacitor native app, we consider it secure
    return true;
  };

  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;
    
    // Show a warning if not in secure context and trying to use web scanner
    if (!isNativePlatform && !isSecureContext()) {
      console.warn('QR Scanner may not work properly without HTTPS');
    }
    
    // Cleanup on unmount
    return () => {
      isMounted.current = false;
      cleanupScanner();
    };
  }, []);

  const cleanupScanner = async () => {
    try {
      // Stop native scanner using device onboarding approach
      if (isNativePlatform) {
        try {
          await BarcodeScanner.stopScan();
        } catch (err) {
          console.log('Native scanner already stopped or not running');
        }
        
        try {
          BarcodeScanner.showBackground();
        } catch (err) {
          console.log('Failed to show background');
        }
        
        const appRoot = document.getElementById('root');
        if (appRoot) {
          appRoot.style.display = '';
        }
        document.body.style.backgroundColor = '';
      }
      
      // Stop HTML5 scanner
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (err) {
          console.log('HTML5 scanner already stopped or not running');
        }
        html5QrCodeRef.current = null;
      }
    } catch (err) {
      console.log('Cleanup completed with warnings');
    }
  };

  const requestCameraPermissions = async (): Promise<boolean> => {
    try {
      if (isNativePlatform) {
        // Request permissions for native platforms
        const status = await BarcodeScanner.checkPermission({ force: true });
        
        if (status.granted) {
          return true;
        } else if (status.denied) {
          // Permission permanently denied
          toast({
            title: "Camera Permission Required",
            description: "Please enable camera permissions in your device settings to scan QR codes.",
            variant: "destructive"
          });
          return false;
        } else {
          // Permission not determined, request it
          const requestResult = await BarcodeScanner.checkPermission({ force: true });
          if (requestResult.granted) {
            return true;
          } else if (requestResult.denied) {
            toast({
              title: "Camera Permission Required",
              description: "Please enable camera permissions in your device settings to scan QR codes.",
              variant: "destructive"
            });
            return false;
          } else {
            toast({
              title: "Camera Permission Unknown",
              description: "Unable to determine camera permission status. Please check your device settings.",
              variant: "destructive"
            });
            return false;
          }
        }
      } else {
        // For web, check if we're in a secure context
        if (!isSecureContext()) {
          toast({
            title: "Security Error",
            description: "Camera access requires a secure connection (HTTPS). Please ensure you're using HTTPS to scan QR codes.",
            variant: "destructive"
          });
          setError("Camera access requires a secure connection (HTTPS).");
          return false;
        }
        
        // Check if mediaDevices API is available
        if (!navigator.mediaDevices) {
          toast({
            title: "Camera Not Supported",
            description: "Camera access is not supported in this browser or context. Please try a different browser or ensure you're using HTTPS.",
            variant: "destructive"
          });
          setError("Camera access is not supported in this browser or context.");
          return false;
        }
        
        // Try to access the camera to check permissions
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          // If we get here, we have permission
          stream.getTracks().forEach(track => track.stop());
          return true;
        } catch (err) {
          console.error('Web camera permission error:', err);
          if (err instanceof Error) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              toast({
                title: "Camera Permission Denied",
                description: "Please allow camera access in your browser to scan QR codes.",
                variant: "destructive"
              });
            } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
              toast({
                title: "No Camera Found",
                description: "No camera was found on this device.",
                variant: "destructive"
              });
            } else if (err.name === 'NotReadableError') {
              toast({
                title: "Camera In Use",
                description: "Camera is already in use by another application.",
                variant: "destructive"
              });
            } else if (err.name === 'SecurityError') {
              toast({
                title: "Security Error",
                description: "Camera access is blocked due to security restrictions. Please ensure you're using HTTPS.",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Camera Error",
                description: `Failed to access camera: ${err.message}`,
                variant: "destructive"
              });
            }
          } else {
            toast({
              title: "Camera Error",
              description: "Failed to access camera. Please check permissions and try again.",
              variant: "destructive"
            });
          }
          return false;
        }
      }
    } catch (err) {
      console.error('Permission request failed:', err);
      setError(`Failed to request camera permissions: ${err instanceof Error ? err.message : String(err)}`);
      toast({
        title: "Permission Error",
        description: "Failed to request camera permissions. Please check your device settings.",
        variant: "destructive"
      });
      return false;
    }
  };

  const startNativeScanner = async () => {
    try {
      setError(null);
      setScanMethod('native');
      
      const appRoot = document.getElementById('root');

      // Check permission and throw if not granted - DEVICE ONBOARDING APPROACH
      const permissionStatus = await BarcodeScanner.checkPermission({ force: true });
      
      if (!permissionStatus.granted) {
        throw new Error('Camera permission not granted');
      }
      
      // Hide the webview content to reveal the camera feed - DEVICE ONBOARDING APPROACH
      if (appRoot) {
        appRoot.style.display = 'none';
      }
      BarcodeScanner.hideBackground(); // For iOS
      document.body.style.backgroundColor = 'transparent'; // For Android
      
      const result = await BarcodeScanner.startScan();
      
      if (result.hasContent) {
        onChange(result.content);
        toast({
          title: "QR Code Scanned",
          description: `Successfully scanned: ${result.content}`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error with native scanner:", error);
      // Let user know permission was denied or other error
      const message = error instanceof Error ? error.message : String(error);
      if (message.toLowerCase().includes('permission was denied') || message.includes('permission') || message.includes('Permission')) {
        toast({
          title: "Permission Denied",
          description: "Camera access is needed to scan QR codes. Please check your device permissions.",
          variant: "destructive"
        });
      } else if (message.includes('not granted') || message.includes('denied')) {
        toast({
          title: "Permission Required",
          description: "Please grant camera permission to scan QR codes.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Scanner Error", 
          description: `Could not start camera: ${message}`,
          variant: "destructive"
        });
      }
    } finally {
      // Always restore the webview content - DEVICE ONBOARDING CLEANUP
      const appRoot = document.getElementById('root');
      BarcodeScanner.showBackground();
      if (appRoot) {
        appRoot.style.display = '';
      }
      document.body.style.backgroundColor = '';
      setIsScanning(false);
    }
  };


  const startWebScanner = async () => {
    try {
      setError(null);
      setScanMethod('web');
      
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices) {
        throw new Error('Camera access is not supported in this browser or context. Please try a different browser or ensure you\'re using HTTPS.');
      }
      
      // Wait for the DOM to update before initializing the scanner
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const qrCodeElementId = `qr-reader-${id}`;
      const element = document.getElementById(qrCodeElementId);
      
      if (!element) {
        throw new Error(`HTML Element with id=${qrCodeElementId} not found. Please make sure the component is properly mounted.`);
      }
      
      // Check if element has proper dimensions
      if (element.offsetWidth === 0 || element.offsetHeight === 0) {
        console.warn('QR Scanner container has zero dimensions, attempting to set minimum size');
        element.style.minHeight = '250px';
        element.style.minWidth = '250px';
      }
      
      html5QrCodeRef.current = new Html5Qrcode(qrCodeElementId);
      
      const config = {
        fps: 15,
        qrbox: function(viewfinderWidth, viewfinderHeight) {
          // Make qrbox responsive and larger for better detection
          const minEdgePercentage = 0.7; // 70% of the smaller edge
          const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
          return {
            width: qrboxSize,
            height: qrboxSize,
          };
        },
        // Remove strict aspectRatio to allow more flexible scanning
        rememberLastUsedCamera: true,
        // Add experimental features for better detection
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };
      
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Success callback
          onChange(decodedText);
          toast({
            title: "QR Code Scanned",
            description: `Successfully scanned: ${decodedText}`,
            variant: "default"
          });
          stopScanning();
        },
        (error) => {
          // Error callback - we can ignore this as it's called frequently during scanning
          // Only log if it's not a permission error, which we handle separately
          if (!error.includes('Permission') && !error.includes('permission')) {
            console.log(`QR Code scan error: ${error}`);
          }
        }
      );
    } catch (err) {
      console.error('Web scanner error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to start web scanner: ${errorMessage}`);
      
      // Provide more specific error messages
      if (errorMessage.includes('Permission') || errorMessage.includes('permission')) {
        toast({
          title: "Camera Permission Required",
          description: "Please allow camera access in your browser to scan QR codes.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('not found') || errorMessage.includes('notFound')) {
        toast({
          title: "Camera Not Found",
          description: "No camera was found on this device.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('in use') || errorMessage.includes('In use')) {
        toast({
          title: "Camera In Use",
          description: "Camera is already in use by another application.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('HTTPS') || errorMessage.includes('security') || errorMessage.includes('Security')) {
        toast({
          title: "Security Error",
          description: "Camera access requires HTTPS. Please ensure you're using a secure connection.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Camera Error",
          description: "Failed to access camera. Please check permissions and try again.",
          variant: "destructive"
        });
      }
      
      stopScanning();
    }
  };

  const startScanning = async () => {
    if (disabled || !isMounted.current) return;
    
    // Check if we're in a secure context for web scanning
    if (!isNativePlatform && !isSecureContext()) {
      toast({
        title: "Security Error",
        description: "Camera access requires a secure connection (HTTPS). Please ensure you're using HTTPS to scan QR codes.",
        variant: "destructive"
      });
      setError("Camera access requires a secure connection (HTTPS).");
      return;
    }
    
    setIsScanning(true);
    
    // Request permissions first
    const hasPermissions = await requestCameraPermissions();
    if (!hasPermissions || !isMounted.current) {
      if (isMounted.current) {
        setIsScanning(false);
      }
      return;
    }
    
    // Add a small delay to ensure UI updates before starting scanner
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Double-check if component is still mounted
    if (!isMounted.current) {
      return;
    }
    
    // Choose scanning method based on platform
    if (isNativePlatform) {
      await startNativeScanner();
    } else {
      await startWebScanner();
    }
  };

  const stopScanning = async () => {
    if (!isMounted.current) return;
    
    setIsScanning(false);
    setScanMethod(null);
    setError(null);
    await cleanupScanner();
  };

  const handleManualInput = (inputValue: string) => {
    onChange(inputValue);
    if (inputValue) {
      toast({
        title: "QR Code Set",
        description: "QR code value has been entered manually"
      });
    }
  };

  // Render scanning interface for web
  if (isScanning && scanMethod === 'web' && isMounted.current) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="font-medium mb-2">Scanning QR Code</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Position the QR code within the camera frame
          </p>
        </div>
        
        <div 
          id={`qr-reader-${id}`} 
          className="w-full max-w-sm mx-auto"
          style={{ minHeight: '250px', minWidth: '250px' }}
        />
        
        <div className="flex gap-2 justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stopScanning}
          >
            <Square className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
        
        {error && (
          <div className="text-sm text-red-500 text-center">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Render native scanning state (overlay is handled by native scanner)
  if (isScanning && scanMethod === 'native' && isMounted.current) {
    return (
      <div className="space-y-4">
        <div className="text-center p-4 border rounded-lg bg-muted">
          <QrCode className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Camera Scanner Active</p>
          <p className="text-xs text-muted-foreground mt-1">
            Position QR code within the camera frame
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stopScanning}
            className="mt-2"
          >
            Cancel Scan
          </Button>
        </div>
      </div>
    );
  }

  // Default input interface
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => handleManualInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={startScanning}
          disabled={disabled}
          className="px-3"
          title={isNativePlatform ? "Scan with native camera" : "Scan with web camera"}
        >
          {isNativePlatform ? (
            <Smartphone className="w-4 h-4" />
          ) : (
            <Monitor className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      {value && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <QrCode className="w-4 h-4" />
          <span>QR Code: {value}</span>
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        {isNativePlatform ? (
          <span>📱 Native camera scanner available</span>
        ) : (
          <span>🌐 Web camera scanner available {!isSecureContext() && "(requires HTTPS)"}</span>
        )}
      </div>
    </div>
  );
};