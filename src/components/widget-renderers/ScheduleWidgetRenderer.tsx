import React, { useState, useEffect } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Trash2, Power, PowerOff, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScheduleDialog } from './ScheduleWidgetRenderer/ScheduleDialog';

interface Schedule {
  id: string;
  name: string;
  device_id: string;
  device_name?: string; // Device name from join
  schedule_type: 'once' | 'daily' | 'rule_update';
  scheduled_date: string;
  payload: any;
  is_active: boolean;
  last_executed_at?: string;
  user_devices?: { device_name: string }; // For Supabase join
}

interface ScheduleWidgetRendererProps {
  widget: IoTDashboardWidget;
  commonStyles: React.CSSProperties;
  isDesignMode?: boolean;
  onAction?: (actionId: string, parameters?: Record<string, any>) => void;
  deviceId?: string;
}

export const ScheduleWidgetRenderer: React.FC<ScheduleWidgetRendererProps> = ({
  widget,
  commonStyles,
  isDesignMode = false,
  onAction,
  deviceId
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [productId, setProductId] = useState<string | undefined>();
  const [userDevices, setUserDevices] = useState<Array<{ id: string; device_name: string; product_id: string }>>([]);

  const showContainer = widget.config.showContainer !== false;
  const maxSchedules = widget.config.maxSchedules || 5;
  const showActions = widget.config.showActions !== false;
  const showStatus = widget.config.showStatus !== false;
  const showDate = widget.config.showDate !== false;
  const showLastExecuted = widget.config.showLastExecuted !== false;
  const listLayout = widget.config.listLayout || 'comfortable';
  const filterDeviceId = widget.config.deviceId || deviceId;
  const showDeviceName = widget.config.showDeviceName !== false; // Show device name in general dashboard mode

  // Get layout-specific padding
  const getLayoutPadding = () => {
    switch (listLayout) {
      case 'compact': return 'p-2';
      case 'spacious': return 'p-4';
      default: return 'p-3';
    }
  };

  // Get font size class
  const getFontSizeClass = () => {
    switch (widget.config.fontSize) {
      case 'small': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  useEffect(() => {
    if (!isDesignMode && currentUser) {
      fetchSchedules();
      fetchUserDevices();
      if (filterDeviceId) {
        fetchDeviceProduct();
      }
    }
  }, [currentUser, isDesignMode, filterDeviceId]);

  const fetchDeviceProduct = async () => {
    if (!filterDeviceId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_devices')
        .select('product_id')
        .eq('id', filterDeviceId)
        .single();

      if (error) throw error;
      setProductId(data?.product_id);
    } catch (error) {
      console.error('Error fetching device product:', error);
    }
  };

  const fetchUserDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('user_devices')
        .select('id, device_name, product_id')
        .eq('user_id', currentUser?.id);

      if (error) throw error;
      setUserDevices(data || []);
    } catch (error) {
      console.error('Error fetching user devices:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('schedules')
        .select('*, user_devices(device_name)') // Join with user_devices to get device names
        .eq('user_id', currentUser?.id)
        .order('scheduled_date', { ascending: true });

      // Only filter by device if a specific device ID is configured
      if (filterDeviceId) {
        query = query.eq('device_id', filterDeviceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const typedSchedules = (data || []).map(schedule => ({
        ...schedule,
        schedule_type: schedule.schedule_type as 'once' | 'daily' | 'rule_update',
        device_name: schedule.user_devices?.device_name || 'Unknown Device'
      }));
      
      setSchedules(typedSchedules as Schedule[]);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (schedule: Schedule) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .update({ is_active: !schedule.is_active })
        .eq('id', schedule.id);

      if (error) throw error;

      toast({
        title: schedule.is_active ? 'Schedule deactivated' : 'Schedule activated',
        description: `${schedule.name} has been ${schedule.is_active ? 'deactivated' : 'activated'}`,
      });

      fetchSchedules();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update schedule',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: 'Schedule deleted',
        description: 'The schedule has been removed',
      });

      fetchSchedules();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowCreateDialog(true);
  };


  const getStatusBadge = (schedule: Schedule) => {
    const scheduledDate = new Date(schedule.scheduled_date);
    const now = new Date();

    if (!schedule.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (scheduledDate < now && schedule.schedule_type === 'once') {
      return <Badge variant="outline">Completed</Badge>;
    }

    if (scheduledDate < now && schedule.schedule_type === 'daily') {
      return <Badge variant="default">Recurring</Badge>;
    }

    return <Badge variant="default">Pending</Badge>;
  };

  // Show all schedules (both active and inactive)
  const displaySchedules = schedules.slice(0, maxSchedules);

  const content = (
    <div className="space-y-4">
      {showActions && !isDesignMode && (
        <>
          <Button 
            size="sm" 
            className="w-full" 
            onClick={() => setShowCreateDialog(true)}
            style={{ backgroundColor: widget.config.buttonColor }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Schedule
          </Button>
          <ScheduleDialog
            open={showCreateDialog}
            onOpenChange={(open) => {
              setShowCreateDialog(open);
              if (!open) setEditingSchedule(null);
            }}
            deviceId={filterDeviceId}
            productId={productId}
            currentUser={currentUser}
            onScheduleCreated={fetchSchedules}
            editSchedule={editingSchedule}
            userDevices={userDevices}
            allowDeviceSelection={!filterDeviceId}
          />
        </>
      )}

      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading schedules...</div>
        ) : displaySchedules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="mb-4">No schedules yet</p>
            {!isDesignMode && showActions && (
              <Button 
                size="sm" 
                onClick={() => setShowCreateDialog(true)}
                style={{ backgroundColor: widget.config.buttonColor }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Schedule
              </Button>
            )}
          </div>
        ) : (
          <div style={{ gap: widget.config.itemSpacing || '0.5rem' }} className="flex flex-col">
            {displaySchedules.map((schedule) => (
              <Card 
                key={schedule.id} 
                className={`${getLayoutPadding()} ${!schedule.is_active ? 'opacity-60' : ''}`}
                style={{
                  backgroundColor: widget.config.itemBackgroundColor,
                  borderRadius: widget.config.borderRadius,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium truncate ${getFontSizeClass()}`}>{schedule.name}</h4>
                      {showStatus && getStatusBadge(schedule)}
                    </div>
                    {/* Show device name in general dashboard mode */}
                    {!filterDeviceId && showDeviceName && schedule.device_name && (
                      <div className={`flex items-center gap-1 ${listLayout === 'compact' ? 'text-[10px]' : 'text-xs'} text-muted-foreground mb-1`}>
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                          {schedule.device_name}
                        </Badge>
                      </div>
                    )}
                    {showDate && (
                      <div className={`flex items-center gap-2 ${listLayout === 'compact' ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>
                        <Clock className={listLayout === 'compact' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
                        <span>
                          {format(new Date(schedule.scheduled_date), 'PPp')}
                        </span>
                      </div>
                    )}
                    {schedule.schedule_type === 'daily' && (
                      <Badge variant="outline" className={`mt-1 ${listLayout === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                        Repeats Daily
                      </Badge>
                    )}
                    {showLastExecuted && schedule.last_executed_at && (
                      <p className={`${listLayout === 'compact' ? 'text-[10px]' : 'text-xs'} text-muted-foreground mt-1`}>
                        Last run: {format(new Date(schedule.last_executed_at), 'PPp')}
                      </p>
                    )}
                  </div>
                  {showActions && !isDesignMode && (
                    <div className="flex gap-1">
                      {/* Only show Edit button for device-specific dashboards */}
                      {filterDeviceId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(schedule)}
                          className={listLayout === 'compact' ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
                          title="Edit schedule"
                          style={{ color: widget.config.buttonColor }}
                        >
                          <Edit className={listLayout === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(schedule)}
                        className={listLayout === 'compact' ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
                        title={schedule.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {schedule.is_active ? (
                          <Power 
                            className={listLayout === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} 
                            style={{ color: widget.config.activeColor || '#10b981' }}
                          />
                        ) : (
                          <PowerOff 
                            className={listLayout === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} 
                            style={{ color: widget.config.inactiveColor || '#9ca3af' }}
                          />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(schedule.id)}
                        className={`${listLayout === 'compact' ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'} text-destructive hover:text-destructive`}
                        title="Delete schedule"
                      >
                        <Trash2 className={listLayout === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  if (!showContainer) {
    return (
      <div 
        className="h-full w-full p-4" 
        style={{
          ...commonStyles,
          color: widget.style?.textColor,
          backgroundColor: widget.style?.backgroundColor
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <Card
      className="h-full w-full overflow-hidden"
      style={{
        ...commonStyles,
        color: widget.style?.textColor,
        backgroundColor: widget.style?.backgroundColor,
        border: widget.style?.borderWidth
          ? `${widget.style.borderWidth} solid ${widget.style.borderColor || 'hsl(var(--border))'}`
          : undefined
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {widget.config.title || 'Schedules'}
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};
