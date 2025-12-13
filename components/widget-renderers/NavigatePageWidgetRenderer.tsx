import React, { useState } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Navigation, 
  Home, 
  Settings, 
  User, 
  Bell, 
  Search, 
  File, 
  BarChart, 
  Calendar, 
  Mail, 
  ShoppingCart, 
  Heart, 
  Star, 
  MapPin, 
  Camera, 
  Music, 
  Video, 
  Bookmark, 
  Download, 
  Upload, 
  Share, 
  Plus, 
  Minus, 
  Edit, 
  Trash, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Wifi, 
  Bluetooth, 
  Battery, 
  Sun, 
  Moon, 
  Cloud, 
  Zap, 
  Gift, 
  Award, 
  Trophy, 
  Flag, 
  Tag, 
  Key, 
  Clock, 
  Globe, 
  Phone, 
  MessageCircle, 
  HelpCircle, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle
} from 'lucide-react';

// Map of available icons
const AVAILABLE_ICONS = {
  Navigation: Navigation,
  Home: Home,
  Settings: Settings,
  User: User,
  Bell: Bell,
  Search: Search,
  File: File,
  BarChart: BarChart,
  Calendar: Calendar,
  Mail: Mail,
  ShoppingCart: ShoppingCart,
  Heart: Heart,
  Star: Star,
  MapPin: MapPin,
  Camera: Camera,
  Music: Music,
  Video: Video,
  Bookmark: Bookmark,
  Download: Download,
  Upload: Upload,
  Share: Share,
  Plus: Plus,
  Minus: Minus,
  Edit: Edit,
  Trash: Trash,
  Lock: Lock,
  Unlock: Unlock,
  Eye: Eye,
  EyeOff: EyeOff,
  Wifi: Wifi,
  Bluetooth: Bluetooth,
  Battery: Battery,
  Sun: Sun,
  Moon: Moon,
  Cloud: Cloud,
  Zap: Zap,
  Gift: Gift,
  Award: Award,
  Trophy: Trophy,
  Flag: Flag,
  Tag: Tag,
  Key: Key,
  Clock: Clock,
  Globe: Globe,
  Phone: Phone,
  MessageCircle: MessageCircle,
  HelpCircle: HelpCircle,
  Info: Info,
  AlertTriangle: AlertTriangle,
  CheckCircle: CheckCircle,
  XCircle: XCircle
};

interface NavigatePageWidgetRendererProps {
  widget: IoTDashboardWidget;
  isDesignMode: boolean;
  commonStyles: React.CSSProperties;
  pages?: Array<{ id: string; name: string }>;
  activePageId?: string;
  onNavigate?: (pageId: string) => void;
}

export const NavigatePageWidgetRenderer: React.FC<NavigatePageWidgetRendererProps> = ({
  widget,
  isDesignMode,
  commonStyles,
  pages,
  activePageId,
  onNavigate
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  // Get configuration properties
  const config = widget.config || {};
  const targetPageId = config.targetPageId;
  const buttonText = config.buttonText || widget.title || 'Navigate';
  const buttonVariant = config.buttonVariant || 'default';
  const showIcon = config.showIcon !== false;
  const buttonIcon = config.buttonIcon || 'Navigation';
  const iconPosition = config.iconPosition || 'left';
  const showLabel = config.showLabel !== false;
  const showContainer = config.showContainer !== false;
  const buttonBorderRadius = config.buttonBorderRadius || 6;
  const buttonFontSize = config.buttonFontSize || '14px';
  const buttonIconSize = config.buttonIconSize || 16;
  const textAlign = config.textAlign || 'center';
  const buttonBackgroundColor = config.buttonBackgroundColor || '';
  const buttonTextColor = config.buttonTextColor || '';
  const buttonBorderColor = config.buttonBorderColor || '';
  const buttonBorderWidth = config.buttonBorderWidth || '';
  
  // Find the target page name
  const targetPage = pages?.find(page => page.id === targetPageId);
  const targetPageName = targetPage?.name || 'Select Page';
  
  // Get button text - prioritize custom text, then target page name, then default
  // Only show target page name if no custom text is set
  const displayText = buttonText && buttonText !== 'Navigate' ? buttonText : 
                     (targetPageName !== 'Select Page' ? targetPageName : buttonText);
  
  // Get icon component
  const IconComponent = AVAILABLE_ICONS[buttonIcon as keyof typeof AVAILABLE_ICONS] || Navigation;
  
  // Handle button click
  const handleClick = () => {
    if (!isDesignMode && targetPageId && onNavigate) {
      setIsPressed(true);
      onNavigate(targetPageId);
      
      // Reset pressed state after a short delay for visual feedback
      setTimeout(() => setIsPressed(false), 150);
    }
  };

  // Apply custom styles
  const buttonStyles: React.CSSProperties = {
    borderRadius: `${buttonBorderRadius}px`,
    fontSize: buttonFontSize,
    backgroundColor: buttonBackgroundColor || undefined,
    color: buttonTextColor || undefined,
    borderColor: buttonBorderColor || undefined,
    borderWidth: buttonBorderWidth || undefined,
    textAlign: textAlign as React.CSSProperties['textAlign'],
  };

  const iconStyles = {
    width: `${buttonIconSize}px`,
    height: `${buttonIconSize}px`,
  };

  // Content alignment classes
  const contentAlignmentClass = `flex flex-col justify-center ${
    textAlign === 'left' ? 'items-start' : 
    textAlign === 'right' ? 'items-end' : 'items-center'
  }`;

  // Button alignment classes
  const buttonAlignmentClass = `w-full h-full flex items-center justify-center gap-2 ${
    iconPosition === 'right' ? 'flex-row-reverse' : ''
  } ${
    textAlign === 'left' ? 'justify-start' : 
    textAlign === 'right' ? 'justify-end' : 'justify-center'
  }`;

  // When container is hidden, we don't apply commonStyles to avoid background issues
  const buttonElement = (
    <Button
      variant={buttonVariant as any}
      className={`${buttonAlignmentClass} ${
        isPressed ? 'scale-95 transition-transform' : ''
      }`}
      style={buttonStyles}
      onClick={handleClick}
      disabled={!targetPageId || !onNavigate || isDesignMode}
    >
      {showIcon && <IconComponent style={iconStyles} />}
      {showLabel && <span>{displayText}</span>}
    </Button>
  );

  // Handle container visibility
  if (showContainer) {
    // Apply border radius to container as well
    const containerStyles = {
      ...commonStyles,
      borderRadius: `${buttonBorderRadius}px`,
      overflow: 'hidden' // Ensure content doesn't overflow rounded corners
    };
    
    return (
      <Card className="h-full" style={containerStyles}>
        <CardContent className={`p-4 h-full ${contentAlignmentClass}`}>
          {buttonElement}
          {!targetPageId && !isDesignMode && (
            <div className="text-xs text-muted-foreground text-center mt-2">
              No target page selected
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // When container is hidden, return just the button element without any wrapper
  // and without commonStyles to avoid background issues
  return buttonElement;
};