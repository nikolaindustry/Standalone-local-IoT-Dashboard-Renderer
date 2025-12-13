import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IoTDashboardWidget } from '../../types';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface UrlButtonWidgetRendererProps {
  widget: IoTDashboardWidget;
  isDesignMode?: boolean;
  commonStyle?: React.CSSProperties;
  pages?: Array<{ id: string; name: string }>;
  onNavigate?: (pageId: string) => void;
}

// Map of available icons
const AVAILABLE_ICONS: Record<string, LucideIcon> = {
  ArrowRight: Icons.ArrowRight,
  ExternalLink: Icons.ExternalLink,
  Link: Icons.Link,
  Home: Icons.Home,
  Settings: Icons.Settings,
  User: Icons.User,
  Mail: Icons.Mail,
  Phone: Icons.Phone,
  Globe: Icons.Globe,
  Navigation: Icons.Navigation,
  MapPin: Icons.MapPin,
  Send: Icons.Send,
  Download: Icons.Download,
  Upload: Icons.Upload,
  Play: Icons.Play,
  Pause: Icons.Pause,
  Stop: Icons.Square,
  ChevronRight: Icons.ChevronRight,
  ChevronLeft: Icons.ChevronLeft,
  Plus: Icons.Plus,
  Minus: Icons.Minus,
  X: Icons.X,
  Check: Icons.Check,
  Info: Icons.Info,
  AlertCircle: Icons.AlertCircle,
  HelpCircle: Icons.HelpCircle,
  Star: Icons.Star,
  Heart: Icons.Heart,
  Share: Icons.Share2,
  Bookmark: Icons.Bookmark,
  Search: Icons.Search,
  Filter: Icons.Filter,
  Calendar: Icons.Calendar,
  Clock: Icons.Clock,
  Bell: Icons.Bell,
  MessageSquare: Icons.MessageSquare,
  File: Icons.File,
  Folder: Icons.Folder,
  Image: Icons.Image,
  Video: Icons.Video,
  Music: Icons.Music,
  Zap: Icons.Zap,
  Target: Icons.Target,
  TrendingUp: Icons.TrendingUp,
  TrendingDown: Icons.TrendingDown,
  BarChart: Icons.BarChart,
  PieChart: Icons.PieChart,
  Activity: Icons.Activity,
  Wifi: Icons.Wifi,
  Bluetooth: Icons.Bluetooth,
  Battery: Icons.Battery,
  Power: Icons.Power,
  RefreshCw: Icons.RefreshCw,
  RotateCw: Icons.RotateCw,
  Maximize: Icons.Maximize,
  Minimize: Icons.Minimize,
  Eye: Icons.Eye,
  EyeOff: Icons.EyeOff,
  Lock: Icons.Lock,
  Unlock: Icons.Unlock,
  Key: Icons.Key,
  Shield: Icons.Shield,
  Database: Icons.Database,
  Server: Icons.Server,
  Cloud: Icons.Cloud,
  Cpu: Icons.Cpu,
  HardDrive: Icons.HardDrive,
  Monitor: Icons.Monitor,
  Smartphone: Icons.Smartphone,
  Tablet: Icons.Tablet,
  Watch: Icons.Watch,
  Printer: Icons.Printer,
  Camera: Icons.Camera,
  Mic: Icons.Mic,
  Speaker: Icons.Volume2,
  Headphones: Icons.Headphones,
};

export const UrlButtonWidgetRenderer: React.FC<UrlButtonWidgetRendererProps> = ({
  widget,
  isDesignMode = false,
  commonStyle = {},
  pages = [],
  onNavigate,
}) => {
  const config = widget.config || {};
  
  // Extract configuration
  const targetUrl = config.urlButtonTargetUrl || '';
  const buttonText = config.urlButtonText || config.label || widget.title || 'Click Here';
  const iconName = config.urlButtonIcon;
  const openInNewTab = config.urlButtonOpenInNewTab || false;
  const showIcon = config.urlButtonShowIcon !== false;
  const iconPosition = config.urlButtonIconPosition || 'left';
  const buttonSize = config.urlButtonSize || 'default';
  const buttonVariant = config.urlButtonVariant || 'default';
  const showContainer = config.showUrlButtonContainer !== false;
  const showLabel = config.urlButtonShowLabel !== false;

  // Get icon component
  const IconComponent = iconName && AVAILABLE_ICONS[iconName] ? AVAILABLE_ICONS[iconName] : null;

  // Validate URL format
  const isExternalUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('www.');
  };

  // Check if it's an application route
  const isApplicationRoute = (url: string) => {
    return url.startsWith('/') && !url.startsWith('//');
  };

  // Check if it's an internal page ID
  const isInternalPage = pages.some(page => page.id === targetUrl);

  const handleClick = () => {
    if (isDesignMode) {
      console.log('URL Button: Click disabled in design mode');
      return;
    }

    if (!targetUrl) {
      console.warn('URL Button: No target URL configured');
      return;
    }

    // Handle internal page navigation
    if (isInternalPage && onNavigate) {
      onNavigate(targetUrl);
      return;
    }

    // Handle application route navigation
    if (isApplicationRoute(targetUrl)) {
      window.location.href = targetUrl;
      return;
    }

    // Handle external URL
    if (isExternalUrl(targetUrl)) {
      let url = targetUrl;
      // Add https:// if URL starts with www.
      if (url.startsWith('www.')) {
        url = 'https://' + url;
      }

      if (openInNewTab) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = url;
      }
    } else {
      console.warn('URL Button: Invalid URL format. Use http://, https://, www., a route path (/page), or a valid page ID');
    }
  };

  // Button styles - check if custom styles are configured
  const hasCustomColors = config.urlButtonBackgroundColor || config.urlButtonTextColor || config.urlButtonBorderColor;
  const hasCustomTypography = config.urlButtonFontSize || config.urlButtonFontWeight;
  
  const buttonStyle: React.CSSProperties = {
    ...(config.urlButtonBackgroundColor && { 
      backgroundColor: config.urlButtonBackgroundColor
    }),
    ...(config.urlButtonTextColor && { 
      color: config.urlButtonTextColor
    }),
    ...(config.urlButtonBorderColor && { 
      borderColor: config.urlButtonBorderColor
    }),
    ...(config.urlButtonBorderWidth && { 
      borderWidth: `${config.urlButtonBorderWidth}px`,
      borderStyle: 'solid' 
    }),
    ...(config.urlButtonBorderRadius !== undefined && { 
      borderRadius: `${config.urlButtonBorderRadius}px`
    }),
    ...(config.urlButtonPadding && { 
      padding: `${config.urlButtonPadding}px`
    }),
    ...commonStyle,
  };

  // Typography styles applied separately for better specificity
  const typographyStyle: React.CSSProperties = {
    ...(config.urlButtonFontSize && { 
      fontSize: `${config.urlButtonFontSize}px` 
    }),
    ...(config.urlButtonFontWeight && { 
      fontWeight: config.urlButtonFontWeight 
    }),
  };

  // Icon size based on config
  const iconSize = config.urlButtonIconSize || (buttonSize === 'sm' ? 16 : buttonSize === 'lg' ? 20 : 18);

  const buttonContent = (
    <Button
      variant={hasCustomColors ? 'ghost' : (buttonVariant as any)}
      size={buttonSize as any}
      onClick={handleClick}
      disabled={isDesignMode}
      className="w-full h-full cursor-pointer transition-opacity"
      style={{
        ...buttonStyle,
        ...typographyStyle,
        pointerEvents: isDesignMode ? 'none' : 'auto',
        opacity: isDesignMode ? 0.7 : 1,
        // Force custom colors to override defaults
        ...(hasCustomColors && {
          background: config.urlButtonBackgroundColor || undefined,
          color: config.urlButtonTextColor || undefined,
        }),
      }}
    >
      <span style={typographyStyle} className="flex items-center">
        {showIcon && IconComponent && iconPosition === 'left' && (
          <IconComponent style={{ width: iconSize, height: iconSize, marginRight: '8px' }} />
        )}
        {showLabel && buttonText}
        {showIcon && IconComponent && iconPosition === 'right' && (
          <IconComponent style={{ width: iconSize, height: iconSize, marginLeft: '8px' }} />
        )}
      </span>
    </Button>
  );

  if (showContainer) {
    return (
      <Card className="h-full w-full">
        <CardContent className="flex items-center justify-center h-full p-4">
          {buttonContent}
        </CardContent>
      </Card>
    );
  }

  return buttonContent;
};
