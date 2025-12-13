import React, { useState } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight, List } from 'lucide-react';

// Import all the available icons
import { 
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

interface MenuWidgetRendererProps {
  widget: IoTDashboardWidget;
  isDesignMode?: boolean;
  commonStyles?: React.CSSProperties;
  // Additional props for when used outside of DashboardProvider
  pages?: Array<{ id: string; name: string }>;
  activePageId?: string;
  onNavigate?: (pageId: string) => void;
}

// Map of available icons
const AVAILABLE_ICONS = {
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

export const MenuWidgetRenderer: React.FC<MenuWidgetRendererProps> = ({
  widget,
  isDesignMode = false,
  commonStyles = {},
  pages,
  activePageId,
  onNavigate
}) => {
  // When used outside of DashboardProvider, show a simplified version
  if (!pages) {
    return (
      <div className="h-full w-full flex items-center justify-center" style={commonStyles}>
        <div className="text-center text-muted-foreground">
          <List className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Navigation menu</p>
          <p className="text-xs mt-1">Available in dashboard designer</p>
        </div>
      </div>
    );
  }

  const config = widget.config || {};
  const [isCollapsed, setIsCollapsed] = useState(config.startCollapsed === true);
  
  // Menu configuration options
  const menuTitle = config.menuTitle || widget.title || 'Navigation';
  const layout = config.layout || 'vertical';
  const textAlignment = config.textAlignment || 'left';
  const showIcons = config.showIcons !== false;
  const collapsible = config.collapsible === true;
  const highlightActive = config.highlightActive !== false;
  const showContainer = config.showContainer !== false; // Default to true
  const menuBorderRadius = config.menuBorderRadius || 0; // Default to 0 (no rounding)
  const menuItemHeight = config.menu_item_height || 32; // Default to 32px
  const menuIconSize = config.menuIconSize || 16; // Default to 16px
  const menuFontSize = config.menuFontSize || 14; // Default to 14px
  const hiddenMenuItems = config.hiddenMenuItems || []; // Get hidden menu items
  const menuItemLabelVisibility = config.menuItemLabelVisibility || {}; // Get label visibility settings
  const menuItemIcons = config.menuItemIcons || {}; // Get icon settings
  
  // Filter out hidden pages
  const visiblePages = pages.filter(page => !hiddenMenuItems.includes(page.id));
  
  // Font customization options
  const fontFamily = config.fontFamily || 'inherit';
  const fontWeight = config.fontWeight || 'normal';
  const fontStyle = config.fontStyle || 'normal';
  
  // Color customization options
  const textColor = config.textColor || '#000000';
  const backgroundColor = config.backgroundColor || '#ffffff';
  const activeBackgroundColor = config.activeBackgroundColor || '#007bff';
  const activeTextColor = config.activeTextColor || '#ffffff';
  const borderColor = config.borderColor || '#e5e7eb';

  const handlePageChange = (pageId: string) => {
    if (!isDesignMode && onNavigate) {
      onNavigate(pageId);
    }
  };

  const getTextAlignClass = () => {
    switch (textAlignment) {
      case 'center': return 'justify-center';
      case 'right': return 'justify-end';
      default: return 'justify-start';
    }
  };

  // Apply font styles
  const fontStyles: React.CSSProperties = {
    fontFamily,
    fontSize: `${menuFontSize}px`,
    fontWeight,
    fontStyle
  };

  // Apply color styles
  const menuStyles: React.CSSProperties = {
    backgroundColor,
    color: textColor,
    borderColor,
    borderRadius: menuBorderRadius ? `${menuBorderRadius}px` : undefined
  };

  // Get icon component for a page
  const getPageIcon = (pageId: string) => {
    const iconName = menuItemIcons[pageId] || 'Home';
    return AVAILABLE_ICONS[iconName as keyof typeof AVAILABLE_ICONS] || Home;
  };

  // Check if label should be visible for a page
  const isLabelVisible = (pageId: string) => {
    return menuItemLabelVisibility[pageId] !== false; // Default to true
  };

  // If container is hidden, render menu items directly
  if (!showContainer) {
    return (
      <div className="h-full w-full" style={{ ...commonStyles, ...menuStyles }}>
        {collapsible && (
          <div 
            className="font-medium text-sm p-2 flex items-center justify-between cursor-pointer"
            style={{ ...fontStyles, borderTopLeftRadius: menuBorderRadius ? `${menuBorderRadius}px` : undefined, borderTopRightRadius: menuBorderRadius ? `${menuBorderRadius}px` : undefined }}
          >
            <div>{menuTitle}</div>
            {collapsible && (
              isCollapsed ? 
                <ChevronRight className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
            )}
          </div>
        )}
        
        {!isCollapsed && (
          <div className={`p-2 ${layout === 'horizontal' ? 'flex flex-wrap gap-1' : ''}`} 
               style={{ 
                 borderBottomLeftRadius: menuBorderRadius ? `${menuBorderRadius}px` : undefined, 
                 borderBottomRightRadius: menuBorderRadius ? `${menuBorderRadius}px` : undefined 
               }}>
            {visiblePages.map((page) => {
              const isActive = highlightActive && activePageId === page.id;
              const IconComponent = getPageIcon(page.id);
              const labelVisible = isLabelVisible(page.id);
              
              // Apply active styles
              const buttonStyles: React.CSSProperties = {
                ...fontStyles,
                backgroundColor: isActive ? activeBackgroundColor : 'transparent',
                color: isActive ? activeTextColor : textColor,
                borderRadius: menuBorderRadius ? `${menuBorderRadius}px` : undefined,
                height: `${menuItemHeight}px`
              };
              
              return (
                <Button
                  key={page.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full ${layout === 'horizontal' ? 'flex-1' : ''} ${getTextAlignClass()} text-sm`}
                  style={buttonStyles}
                  onClick={() => handlePageChange(page.id)}
                  disabled={isDesignMode}
                >
                  {showIcons && (
                    <div className="flex items-center justify-center mr-2">
                      <IconComponent className="w-4 h-4" style={{ width: `${menuIconSize}px`, height: `${menuIconSize}px` }} />
                    </div>
                  )}
                  {labelVisible ? page.name : ''}
                </Button>
              );
            })}
            
            {visiblePages.length === 0 && (
              <div className="text-center text-muted-foreground text-xs p-4" style={fontStyles}>
                No pages available
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Render with container (default behavior)
  const renderMenuItems = () => {
    if (isCollapsed && collapsible) {
      return null;
    }

    return (
      <div className={`p-2 space-y-1 ${layout === 'horizontal' ? 'flex flex-wrap gap-1' : ''}`} 
           style={{ 
             borderBottomLeftRadius: menuBorderRadius ? `${menuBorderRadius}px` : undefined, 
             borderBottomRightRadius: menuBorderRadius ? `${menuBorderRadius}px` : undefined 
           }}>
        {visiblePages.map((page) => {
          const isActive = highlightActive && activePageId === page.id;
          const IconComponent = getPageIcon(page.id);
          const labelVisible = isLabelVisible(page.id);
          
          // Apply active styles
          const buttonStyles: React.CSSProperties = {
            ...fontStyles,
            backgroundColor: isActive ? activeBackgroundColor : 'transparent',
            color: isActive ? activeTextColor : textColor,
            borderRadius: menuBorderRadius ? `${menuBorderRadius}px` : undefined,
            height: `${menuItemHeight}px`
          };
          
          return (
            <Button
              key={page.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full ${layout === 'horizontal' ? 'flex-1' : ''} ${getTextAlignClass()} text-sm`}
              style={buttonStyles}
              onClick={() => handlePageChange(page.id)}
              disabled={isDesignMode}
            >
              {showIcons && (
                <div className="flex items-center justify-center mr-2">
                  <IconComponent className="w-4 h-4" style={{ width: `${menuIconSize}px`, height: `${menuIconSize}px` }} />
                </div>
              )}
              {labelVisible ? page.name : ''}
            </Button>
          );
        })}
        
        {visiblePages.length === 0 && (
          <div className="text-center text-muted-foreground text-xs p-4" style={fontStyles}>
            No pages available
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="h-full" style={{ ...commonStyles, ...menuStyles }}>
      <CardContent className="p-0 h-full flex flex-col" style={{ borderRadius: menuBorderRadius ? `${menuBorderRadius}px` : undefined }}>
        <div 
          className="font-medium text-sm p-3 border-b flex items-center justify-between"
          style={{ 
            ...fontStyles, 
            borderTopLeftRadius: menuBorderRadius ? `${menuBorderRadius}px` : undefined, 
            borderTopRightRadius: menuBorderRadius ? `${menuBorderRadius}px` : undefined 
          }}
        >
          <div>{menuTitle}</div>
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? 
                <ChevronRight className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1">
          {renderMenuItems()}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};