import React from 'react';
import { 
  LayoutGrid, 
  Gauge, 
  Activity, 
  Power,
  Thermometer,
  Zap,
  Wifi,
  Clock,
  CheckCircle,
  Camera,
  Smartphone,
  Monitor,
  Battery,
  Cloud,
  Droplets,
  Sun,
  Wind,
  Sliders,
  Bluetooth,
  Home,
  Settings,
  User,
  Bell,
  Heart,
  Star,
  TrendingUp,
  BarChart,
  PieChart,
  Calendar,
  Mail,
  Lock,
  Key,
  Shield,
  Database,
  Server,
  Cpu,
  HardDrive,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

const DASHBOARD_ICONS = [
  { name: 'LayoutGrid', icon: LayoutGrid },
  { name: 'Gauge', icon: Gauge },
  { name: 'Activity', icon: Activity },
  { name: 'Power', icon: Power },
  { name: 'Thermometer', icon: Thermometer },
  { name: 'Zap', icon: Zap },
  { name: 'Wifi', icon: Wifi },
  { name: 'Clock', icon: Clock },
  { name: 'CheckCircle', icon: CheckCircle },
  { name: 'Camera', icon: Camera },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Monitor', icon: Monitor },
  { name: 'Battery', icon: Battery },
  { name: 'Cloud', icon: Cloud },
  { name: 'Droplets', icon: Droplets },
  { name: 'Sun', icon: Sun },
  { name: 'Wind', icon: Wind },
  { name: 'Sliders', icon: Sliders },
  { name: 'Bluetooth', icon: Bluetooth },
  { name: 'Home', icon: Home },
  { name: 'Settings', icon: Settings },
  { name: 'User', icon: User },
  { name: 'Bell', icon: Bell },
  { name: 'Heart', icon: Heart },
  { name: 'Star', icon: Star },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'BarChart', icon: BarChart },
  { name: 'PieChart', icon: PieChart },
  { name: 'Calendar', icon: Calendar },
  { name: 'Mail', icon: Mail },
  { name: 'Lock', icon: Lock },
  { name: 'Key', icon: Key },
  { name: 'Shield', icon: Shield },
  { name: 'Database', icon: Database },
  { name: 'Server', icon: Server },
  { name: 'Cpu', icon: Cpu },
  { name: 'HardDrive', icon: HardDrive },
  { name: 'Lightbulb', icon: Lightbulb },
];

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ value = 'LayoutGrid', onChange }) => {
  const [open, setOpen] = React.useState(false);
  
  const selectedIcon = DASHBOARD_ICONS.find(icon => icon.name === value) || DASHBOARD_ICONS[0];
  const SelectedIconComponent = selectedIcon.icon;

  return (
    <div className="space-y-2">
      <Label>Dashboard Icon</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <SelectedIconComponent className="w-4 h-4 mr-2" />
            {selectedIcon.name}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-2">
            <div className="text-sm font-medium mb-2 px-2">Select an icon</div>
            <div className="grid grid-cols-6 gap-1 max-h-64 overflow-y-auto">
              {DASHBOARD_ICONS.map(({ name, icon: IconComponent }) => (
                <Button
                  key={name}
                  variant={value === name ? 'default' : 'ghost'}
                  size="sm"
                  className="h-10 w-10 p-0"
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  title={name}
                >
                  <IconComponent className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">
        Choose an icon to represent your dashboard
      </p>
    </div>
  );
};
