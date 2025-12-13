import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Code2, ChevronDown, ChevronUp } from 'lucide-react';

interface DeviceCommand {
  id: string;
  name: string;
  actions: DeviceAction[];
}

interface DeviceAction {
  id: string;
  name: string;
  parameters: ActionParameter[];
}

interface ActionParameter {
  id: string;
  name: string;
  type: string;
  required: boolean;
  default_value?: string;
}

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceId?: string; // Optional now - can select from devices list
  productId?: string;
  currentUser: any;
  onScheduleCreated: () => void;
  editSchedule?: any; // Schedule being edited
  userDevices?: Array<{ id: string; device_name: string; product_id: string }>; // List of user's devices
  allowDeviceSelection?: boolean; // Allow selecting device in general dashboard mode
}

export const ScheduleDialog: React.FC<ScheduleDialogProps> = ({
  open,
  onOpenChange,
  deviceId,
  productId,
  currentUser,
  onScheduleCreated,
  editSchedule,
  userDevices = [],
  allowDeviceSelection = false
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [commands, setCommands] = useState<DeviceCommand[]>([]);
  const [selectedCommands, setSelectedCommands] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(deviceId || '');
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(productId);
  
  const [formData, setFormData] = useState({
    name: '',
    schedule_type: 'once' as 'once' | 'daily',
    scheduled_date: '',
    scheduled_time: ''
  });

  // Update device selection
  useEffect(() => {
    if (deviceId) {
      setSelectedDeviceId(deviceId);
      setSelectedProductId(productId);
    }
  }, [deviceId, productId]);

  // Populate form when editing
  useEffect(() => {
    if (open && editSchedule) {
      const scheduleDate = new Date(editSchedule.scheduled_date);
      setFormData({
        name: editSchedule.name,
        schedule_type: editSchedule.schedule_type,
        scheduled_date: scheduleDate.toISOString().split('T')[0],
        scheduled_time: scheduleDate.toTimeString().slice(0, 5)
      });
      
      // Reconstruct selected commands from payload
      if (editSchedule.payload?.commands) {
        // We'll need to match the payload back to the commands structure
        // This will be populated after commands are fetched
      }
    } else if (open) {
      // Reset form for new schedule
      setFormData({
        name: '',
        schedule_type: 'once',
        scheduled_date: '',
        scheduled_time: ''
      });
      setSelectedCommands([]);
    }
  }, [open, editSchedule]);

  useEffect(() => {
    if (open && selectedProductId) {
      fetchCommands();
    }
  }, [open, selectedProductId]);

  const fetchCommands = async () => {
    if (!selectedProductId) return;
    
    try {
      setLoading(true);
      
      // Fetch commands for this product
      const { data: productCommands, error: commandsError } = await supabase
        .from('product_commands')
        .select('*')
        .eq('product_id', selectedProductId);

      if (commandsError) throw commandsError;

      // Fetch actions for each command
      const commandsWithActions = await Promise.all(
        (productCommands || []).map(async (command) => {
          const { data: actions, error: actionsError } = await supabase
            .from('command_actions')
            .select('*')
            .eq('command_id', command.id);

          if (actionsError) throw actionsError;

          // Fetch parameters for each action
          const actionsWithParams = await Promise.all(
            (actions || []).map(async (action) => {
              const { data: params, error: paramsError } = await supabase
                .from('action_parameters')
                .select('*')
                .eq('action_id', action.id);

              if (paramsError) throw paramsError;

              return {
                ...action,
                parameters: params || []
              };
            })
          );

          return {
            ...command,
            actions: actionsWithParams
          };
        })
      );

      setCommands(commandsWithActions);
      
      // If editing, reconstruct selected commands from payload
      if (editSchedule && editSchedule.payload?.commands) {
        reconstructSelectedCommands(commandsWithActions, editSchedule.payload.commands);
      }
    } catch (error) {
      console.error('Error fetching commands:', error);
      toast({
        title: 'Error',
        description: 'Failed to load commands',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const reconstructSelectedCommands = (availableCommands: DeviceCommand[], payloadCommands: any[]) => {
    const reconstructed: any[] = [];
    
    payloadCommands.forEach((payloadCmd: any) => {
      const matchingCommand = availableCommands.find(cmd => cmd.name === payloadCmd.command);
      if (matchingCommand) {
        const selectedActions: any[] = [];
        
        payloadCmd.actions?.forEach((payloadAction: any) => {
          const matchingAction = matchingCommand.actions.find(act => act.name === payloadAction.action);
          if (matchingAction) {
            selectedActions.push({
              ...matchingAction,
              parameterValues: payloadAction.params || {}
            });
          }
        });
        
        if (selectedActions.length > 0) {
          reconstructed.push({
            ...matchingCommand,
            actions: selectedActions
          });
        }
      }
    });
    
    setSelectedCommands(reconstructed);
  };

  const handleCommandToggle = (command: DeviceCommand) => {
    const isSelected = selectedCommands.some(c => c.id === command.id);
    
    if (isSelected) {
      setSelectedCommands(prev => prev.filter(c => c.id !== command.id));
    } else {
      setSelectedCommands(prev => [...prev, { ...command, actions: [] }]);
    }
  };

  const handleActionToggle = (commandId: string, action: DeviceAction) => {
    setSelectedCommands(prev => {
      const commandIndex = prev.findIndex(c => c.id === commandId);
      if (commandIndex === -1) return prev;

      const command = prev[commandIndex];
      const actionExists = command.actions?.some((a: any) => a.id === action.id);

      const updatedCommands = [...prev];
      
      if (actionExists) {
        updatedCommands[commandIndex] = {
          ...command,
          actions: command.actions.filter((a: any) => a.id !== action.id)
        };
      } else {
        const parameterValues: Record<string, any> = {};
        if (action.parameters && Array.isArray(action.parameters)) {
          action.parameters.forEach(param => {
            parameterValues[param.name] = param.default_value || '';
          });
        }

        updatedCommands[commandIndex] = {
          ...command,
          actions: [...(command.actions || []), { ...action, parameterValues }]
        };
      }

      console.log('Updated commands after action toggle:', updatedCommands);
      return updatedCommands;
    });
  };

  const handleParameterChange = (commandId: string, actionId: string, paramName: string, value: any) => {
    setSelectedCommands(prev => {
      const commandIndex = prev.findIndex(c => c.id === commandId);
      if (commandIndex === -1) return prev;

      const command = prev[commandIndex];
      const actionIndex = command.actions?.findIndex((a: any) => a.id === actionId);
      if (actionIndex === -1 || actionIndex === undefined) return prev;

      const updatedCommands = [...prev];
      const updatedActions = [...command.actions];
      const updatedAction = { ...updatedActions[actionIndex] };
      
      updatedAction.parameterValues = {
        ...updatedAction.parameterValues,
        [paramName]: value
      };

      updatedActions[actionIndex] = updatedAction;
      updatedCommands[commandIndex] = {
        ...command,
        actions: updatedActions
      };

      return updatedCommands;
    });
  };

  const buildPayload = () => {
    const commandsMap: Record<string, any> = {};

    // Group actions by command
    selectedCommands.forEach(command => {
      if (command.actions && Array.isArray(command.actions) && command.actions.length > 0) {
        if (!commandsMap[command.id]) {
          commandsMap[command.id] = {
            command: command.name,
            actions: []
          };
        }

        command.actions.forEach((action: any) => {
          const actionData: any = {
            action: action.name
          };

          // Add parameters if they exist
          if (action.parameterValues && typeof action.parameterValues === 'object') {
            const params = { ...action.parameterValues };
            if (Object.keys(params).length > 0) {
              actionData.params = params;
            }
          }

          commandsMap[command.id].actions.push(actionData);
        });
      }
    });

    const payload = {
      commands: Object.values(commandsMap)
    };

    console.log('Built payload:', JSON.stringify(payload, null, 2));
    return payload;
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.scheduled_date || !formData.scheduled_time) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (allowDeviceSelection && !selectedDeviceId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a target device',
        variant: 'destructive'
      });
      return;
    }

    if (selectedCommands.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one command',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      const scheduledDateTime = new Date(formData.scheduled_date);
      const [hours, minutes] = formData.scheduled_time.split(':').map(Number);
      scheduledDateTime.setHours(hours, minutes, 0);

      const payload = buildPayload();

      if (editSchedule) {
        // Update existing schedule
        const { error } = await supabase
          .from('schedules')
          .update({
            name: formData.name,
            schedule_type: formData.schedule_type,
            scheduled_date: scheduledDateTime.toISOString(),
            payload: payload,
          })
          .eq('id', editSchedule.id);

        if (error) throw error;

        toast({
          title: 'Schedule updated',
          description: `${formData.name} has been updated`,
        });
      } else {
        // Create new schedule
        const { error } = await supabase
          .from('schedules')
          .insert({
            name: formData.name,
            device_id: selectedDeviceId || deviceId,
            schedule_type: formData.schedule_type,
            scheduled_date: scheduledDateTime.toISOString(),
            payload: payload,
            is_active: true,
            user_id: currentUser?.id
          });

        if (error) throw error;

        toast({
          title: 'Schedule created',
          description: `${formData.name} has been scheduled`,
        });
      }

      // Reset form
      setFormData({
        name: '',
        schedule_type: 'once',
        scheduled_date: '',
        scheduled_time: ''
      });
      setSelectedCommands([]);
      onOpenChange(false);
      onScheduleCreated();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to create schedule',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const isCommandSelected = (commandId: string) => {
    return selectedCommands.some(c => c.id === commandId);
  };

  const isActionSelected = (commandId: string, actionId: string) => {
    const command = selectedCommands.find(c => c.id === commandId);
    return command?.actions?.some((a: any) => a.id === actionId) || false;
  };

  const getParameterValue = (commandId: string, actionId: string, paramName: string) => {
    const command = selectedCommands.find(c => c.id === commandId);
    const action = command?.actions?.find((a: any) => a.id === actionId);
    const value = action?.parameterValues?.[paramName] || '';
    console.log('Getting parameter value:', { commandId, actionId, paramName, value, action });
    return value;
  };

  const hasSelectedActions = selectedCommands.some(cmd => 
    cmd.actions && Array.isArray(cmd.actions) && cmd.actions.length > 0
  );

  const payloadPreview = JSON.stringify(buildPayload(), null, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{editSchedule ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-1">
          <div className="space-y-6 pr-4">
            {/* Basic Info */}
            <div className="space-y-4">
              {/* Device Selection (only in general dashboard mode) */}
              {allowDeviceSelection && userDevices.length > 0 && (
                <div>
                  <Label>Target Device</Label>
                  <Select
                    value={selectedDeviceId}
                    onValueChange={(value) => {
                      setSelectedDeviceId(value);
                      const device = userDevices.find(d => d.id === value);
                      setSelectedProductId(device?.product_id);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a device" />
                    </SelectTrigger>
                    <SelectContent>
                      {userDevices.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.device_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose which device this schedule will control
                  </p>
                </div>
              )}
              
              <div>
                <Label>Schedule Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter schedule name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.schedule_type}
                    onValueChange={(value: 'once' | 'daily') =>
                      setFormData({ ...formData, schedule_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">One Time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                />
              </div>
            </div>

            {/* Command Selection */}
            <div>
              <Label className="mb-2 block">Configure Remote Commands</Label>
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading commands...</div>
              ) : commands.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No commands available</div>
              ) : (
                <Accordion type="multiple" className="w-full">
                  {commands.map((command) => (
                    <AccordionItem key={command.id} value={command.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isCommandSelected(command.id)}
                            onCheckedChange={() => handleCommandToggle(command)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="font-medium">{command.name}</span>
                          {isCommandSelected(command.id) && (
                            <Badge variant="secondary" className="ml-2">
                              {selectedCommands.find(c => c.id === command.id)?.actions?.length || 0} actions
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-6 space-y-3">
                          {command.actions && command.actions.map((action) => {
                            const actionSelected = isActionSelected(command.id, action.id);
                            const hasParameters = action.parameters && Array.isArray(action.parameters) && action.parameters.length > 0;
                            
                            return (
                              <div key={action.id} className="space-y-2 border-l-2 border-border pl-4">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={actionSelected}
                                    onCheckedChange={() => handleActionToggle(command.id, action)}
                                    disabled={!isCommandSelected(command.id)}
                                  />
                                  <span className="text-sm font-medium">{action.name}</span>
                                  {hasParameters && (
                                    <Badge variant="outline" className="text-xs">
                                      {action.parameters.length} params
                                    </Badge>
                                  )}
                                </div>
                                
                                {actionSelected && hasParameters && (
                                  <div className="pl-6 space-y-2 mt-2 bg-muted/30 p-3 rounded">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Parameters:</p>
                                    {action.parameters.map((param) => (
                                      <div key={param.id} className="space-y-1">
                                        <Label className="text-xs font-medium">
                                          {param.name}
                                          {param.required && <span className="text-destructive ml-1">*</span>}
                                        </Label>
                                        <Input
                                          placeholder={param.default_value || `Enter ${param.name}`}
                                          value={getParameterValue(command.id, action.id, param.name)}
                                          onChange={(e) => handleParameterChange(command.id, action.id, param.name, e.target.value)}
                                          className="text-sm h-8"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                          Type: {param.type}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>

            {/* Advanced Section - WebSocket Payload Preview */}
            {hasSelectedActions && (
              <div className="border-t pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full justify-between p-3 h-auto"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Code2 className="w-4 h-4" />
                    Advanced - Message Preview
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                
                {showAdvanced && (
                  <div className="mt-3 space-y-2">
                    <div className="bg-muted p-3 rounded-md border">
                      <pre className="text-xs overflow-x-auto font-mono">{payloadPreview}</pre>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This JSON payload will be sent to your device when the schedule executes.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? (editSchedule ? 'Updating...' : 'Creating...') : (editSchedule ? 'Update Schedule' : 'Create Schedule')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
