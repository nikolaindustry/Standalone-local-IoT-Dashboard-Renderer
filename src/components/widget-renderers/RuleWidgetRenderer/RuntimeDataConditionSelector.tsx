import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, RefreshCw, Database } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RuntimeDataCondition {
  deviceId: string;
  deviceName: string;
  tableName: string;
  dataField: string;
  operator: string;
  threshold: number;
  maxAgeMinutes?: number;
}

interface RuntimeDataConditionSelectorProps {
  conditions: RuntimeDataCondition[];
  onChange: (conditions: RuntimeDataCondition[]) => void;
}

const RuntimeDataConditionSelector: React.FC<RuntimeDataConditionSelectorProps> = ({
  conditions,
  onChange
}) => {
  const { currentUser } = useAuth();
  const [devices, setDevices] = useState<Array<{ id: string; name: string; productId: string }>>([]);
  const [tables, setTables] = useState<Record<string, string[]>>({});
  const [availableFields, setAvailableFields] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [fetchingFields, setFetchingFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchUserDevices();
  }, [currentUser]);

  const fetchUserDevices = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_devices')
        .select('id, device_name, product_id')
        .eq('user_id', currentUser.id)
        .eq('is_active', true);

      if (error) throw error;
      
      setDevices(data?.map(d => ({ 
        id: d.id, 
        name: d.device_name, 
        productId: d.product_id 
      })) || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTables = async (deviceId: string, productId: string) => {
    if (tables[deviceId]) return;
    
    try {
      const { data, error } = await supabase
        .from('product_runtime_data')
        .select('table_name')
        .eq('device_id', deviceId)
        .eq('product_id', productId);

      if (error) throw error;

      const uniqueTables = Array.from(new Set(data?.map(d => d.table_name) || []));
      setTables(prev => ({ ...prev, [deviceId]: uniqueTables }));
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchAvailableFields = async (deviceId: string, tableName: string) => {
    const key = `${deviceId}-${tableName}`;
    if (availableFields[key]) return;
    
    setFetchingFields(prev => ({ ...prev, [key]: true }));
    
    try {
      const { data, error } = await supabase
        .from('product_runtime_data')
        .select('data_payload')
        .eq('device_id', deviceId)
        .eq('table_name', tableName)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const fieldsSet = new Set<string>();
      data?.forEach(record => {
        if (record.data_payload && typeof record.data_payload === 'object') {
          Object.keys(record.data_payload).forEach(key => fieldsSet.add(key));
        }
      });

      setAvailableFields(prev => ({
        ...prev,
        [key]: Array.from(fieldsSet).sort()
      }));
    } catch (error) {
      console.error('Error fetching runtime data fields:', error);
    } finally {
      setFetchingFields(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleAddCondition = () => {
    const newCondition: RuntimeDataCondition = {
      deviceId: '',
      deviceName: '',
      tableName: '',
      dataField: '',
      operator: '>',
      threshold: 0,
      maxAgeMinutes: 10
    };
    
    onChange([...conditions, newCondition]);
  };

  const handleRemoveCondition = (index: number) => {
    const newConditions = [...conditions];
    newConditions.splice(index, 1);
    onChange(newConditions);
  };

  const handleConditionChange = (index: number, field: keyof RuntimeDataCondition, value: string | number) => {
    const newConditions = [...conditions];
    
    if (field === 'deviceId') {
      const selectedDevice = devices.find(d => d.id === value);
      newConditions[index].deviceId = value as string;
      newConditions[index].deviceName = selectedDevice?.name || '';
      if (selectedDevice) {
        fetchAvailableTables(selectedDevice.id, selectedDevice.productId);
      }
    } else if (field === 'tableName') {
      newConditions[index].tableName = value as string;
      if (newConditions[index].deviceId && value) {
        fetchAvailableFields(newConditions[index].deviceId, value as string);
      }
    } else {
      (newConditions[index] as any)[field] = value;
    }
    
    onChange(newConditions);
  };

  const refreshFields = async (deviceId: string, tableName: string) => {
    const key = `${deviceId}-${tableName}`;
    setAvailableFields(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    await fetchAvailableFields(deviceId, tableName);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <CardTitle>Device Runtime Data Conditions</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Monitor real-time data from your devices. Select a device, table, and data field to create conditions.
          </p>
          
          {conditions.length > 0 && (
            <div className="space-y-4">
              {conditions.map((condition, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Runtime Condition {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCondition(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Device</Label>
                      <Select
                        value={condition.deviceId}
                        onValueChange={(value) => handleConditionChange(index, 'deviceId', value)}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={loading ? "Loading..." : "Select device"} />
                        </SelectTrigger>
                        <SelectContent>
                          {devices.length === 0 && !loading ? (
                            <SelectItem value="no-devices" disabled>
                              No devices found
                            </SelectItem>
                          ) : (
                            devices.map(device => (
                              <SelectItem key={device.id} value={device.id}>
                                {device.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Data Table</Label>
                      <Select
                        value={condition.tableName}
                        onValueChange={(value) => handleConditionChange(index, 'tableName', value)}
                        disabled={!condition.deviceId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select table" />
                        </SelectTrigger>
                        <SelectContent>
                          {tables[condition.deviceId]?.length === 0 ? (
                            <SelectItem value="no-tables" disabled>
                              No tables found
                            </SelectItem>
                          ) : (
                            tables[condition.deviceId]?.map(table => (
                              <SelectItem key={table} value={table}>
                                {table}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <Label>Data Field (JSON Key)</Label>
                        {condition.deviceId && condition.tableName && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => refreshFields(condition.deviceId, condition.tableName)}
                            disabled={fetchingFields[`${condition.deviceId}-${condition.tableName}`]}
                          >
                            <RefreshCw className={`h-3 w-3 ${fetchingFields[`${condition.deviceId}-${condition.tableName}`] ? 'animate-spin' : ''}`} />
                          </Button>
                        )}
                      </div>
                      {condition.deviceId && condition.tableName && availableFields[`${condition.deviceId}-${condition.tableName}`]?.length > 0 ? (
                        <Select
                          value={condition.dataField || ''}
                          onValueChange={(value) => handleConditionChange(index, 'dataField', value)}
                          disabled={fetchingFields[`${condition.deviceId}-${condition.tableName}`]}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={fetchingFields[`${condition.deviceId}-${condition.tableName}`] ? "Loading..." : "Select field"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFields[`${condition.deviceId}-${condition.tableName}`].map(field => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={condition.dataField || ''}
                          onChange={(e) => handleConditionChange(index, 'dataField', e.target.value)}
                          placeholder="e.g., temperature, status"
                          disabled={!condition.tableName}
                        />
                      )}
                    </div>
                    
                    <div>
                      <Label>Operator</Label>
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => handleConditionChange(index, 'operator', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=">">Greater than (&gt;)</SelectItem>
                          <SelectItem value=">=">Greater or equal (≥)</SelectItem>
                          <SelectItem value="<">Less than (&lt;)</SelectItem>
                          <SelectItem value="<=">Less or equal (≤)</SelectItem>
                          <SelectItem value="==">Equal (==)</SelectItem>
                          <SelectItem value="!=">Not equal (!=)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Threshold Value</Label>
                      <Input
                        type="number"
                        value={condition.threshold}
                        onChange={(e) => handleConditionChange(index, 'threshold', parseFloat(e.target.value))}
                        placeholder="Enter threshold"
                      />
                    </div>
                    
                    <div>
                      <Label>Max Data Age (minutes)</Label>
                      <Input
                        type="number"
                        value={condition.maxAgeMinutes || 10}
                        onChange={(e) => handleConditionChange(index, 'maxAgeMinutes', parseInt(e.target.value))}
                        placeholder="10"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={handleAddCondition}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Runtime Data Condition
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RuntimeDataConditionSelector;
