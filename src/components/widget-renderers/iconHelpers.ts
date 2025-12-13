import { 
    Gauge, 
    Activity, 
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
    Bluetooth
  } from 'lucide-react';
  
  // Get icon component based on icon name
  export const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      Play: PlayCircle,
      Stop: StopCircle,
      Power: Power,
      Thermometer: Thermometer,
      Zap: Zap,
      Wifi: Wifi,
      WifiOff: WifiOff,
      Clock: Clock,
      Alert: AlertTriangle,
      Check: CheckCircle,
      QrCode: QrCode,
      Camera: Camera,
      Square: Square,
      Smartphone: Smartphone,
      Monitor: Monitor,
      Battery: Battery,
      Volume: Volume,
      Cloud: Cloud,
      Droplets: Droplets,
      Sun: Sun,
      Wind: Wind,
      Sliders: Sliders,
      Toggle: ToggleLeft,
      Bluetooth: Bluetooth,
      // Add more icons as needed
    };
    
    return icons[iconName] || Power; // Default to Power icon
  };
  
  export const getSliderIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Volume2': return Volume;
      case 'Sun': return Sun;
      case 'Zap': return Zap;
      case 'Thermometer': return Thermometer;
      case 'Gauge': return Gauge;
      case 'Activity': return Activity;
      case 'Battery': return Battery;
      default: return Sliders;
    }
  };
  
  export const getSwitchIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Power': return Power;
      case 'Zap': return Zap;
      case 'Wifi': return Wifi;
      case 'Bluetooth': return Bluetooth;
      case 'Battery': return Battery;
      default: return ToggleLeft;
    }
  };