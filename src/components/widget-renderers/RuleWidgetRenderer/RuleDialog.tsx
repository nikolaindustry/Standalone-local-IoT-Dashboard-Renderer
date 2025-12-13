import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RuntimeDataConditionSelector from './RuntimeDataConditionSelector';
import ActionBuilder from '@/pages/UserDashboard/components/RulesTab/ActionBuilder';
import { ActionPayload } from '@/pages/UserDashboard/types/ruleTypes';

interface RuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: any;
  onRuleCreated: () => void;
  editRule?: any;
}

export const RuleDialog: React.FC<RuleDialogProps> = ({
  open,
  onOpenChange,
  currentUser,
  onRuleCreated,
  editRule
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [runtimeConditions, setRuntimeConditions] = useState<any[]>([]);
  const [thenActions, setThenActions] = useState<ActionPayload[]>([]);
  const [elseActions, setElseActions] = useState<ActionPayload[]>([]);

  // Populate form when editing
  useEffect(() => {
    if (open && editRule) {
      setFormData({
        name: editRule.name,
        description: editRule.description || ''
      });
      
      // Load existing conditions and actions if available
      if (editRule.rule_data?.if?.runtimeConditions) {
        setRuntimeConditions(editRule.rule_data.if.runtimeConditions);
      }
      if (editRule.rule_data?.then) {
        setThenActions(editRule.rule_data.then);
      }
      if (editRule.rule_data?.else) {
        setElseActions(editRule.rule_data.else);
      }
    } else if (open) {
      // Reset form for new rule
      setFormData({
        name: '',
        description: ''
      });
      setRuntimeConditions([]);
      setThenActions([]);
      setElseActions([]);
      setCurrentTab('basic');
    }
  }, [open, editRule]);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a rule name',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const ruleData = {
        meta: {
          initiatedBy: currentUser?.id || '',
          timestamp: new Date().toISOString(),
          ruleId: editRule?.id || '',
          description: formData.description
        },
        if: {
          sensorConditions: [],
          runtimeConditions: runtimeConditions,
          condition: {
            operator: 'AND',
            conditions: []
          }
        },
        waitFor: 0,
        then: thenActions,
        elseIf: [],
        else: elseActions
      };

      if (editRule) {
        // Update existing rule
        const { error } = await supabase
          .from('rules')
          .update({
            name: formData.name,
            description: formData.description,
            rule_data: ruleData as any
          })
          .eq('id', editRule.id);

        if (error) throw error;

        toast({
          title: 'Rule updated',
          description: `${formData.name} has been updated`,
        });
      } else {
        // Create new rule
        const { error } = await supabase
          .from('rules')
          .insert([{
            name: formData.name,
            description: formData.description,
            rule_data: ruleData as any,
            is_active: false,
            user_id: currentUser?.id
          }]);

        if (error) throw error;

        toast({
          title: 'Rule created',
          description: `${formData.name} has been created with conditions and actions.`,
        });
      }

      // Reset form
      setFormData({
        name: '',
        description: ''
      });
      setRuntimeConditions([]);
      setThenActions([]);
      setElseActions([]);
      setCurrentTab('basic');
      onOpenChange(false);
      onRuleCreated();
    } catch (error) {
      console.error('Error creating/updating rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to save rule',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{editRule ? 'Edit Rule' : 'Create New Rule'}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="conditions">If Conditions</TabsTrigger>
            <TabsTrigger value="then">Then Actions</TabsTrigger>
            <TabsTrigger value="else">Else Actions</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="basic" className="space-y-6 pr-4">
              <div>
                <Label>Rule Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter rule name"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter rule description (optional)"
                  rows={4}
                />
              </div>

              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> Configure the rule name and description, then use the tabs above to set up conditions and actions.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="conditions" className="pr-4">
              <RuntimeDataConditionSelector
                conditions={runtimeConditions}
                onChange={setRuntimeConditions}
              />
            </TabsContent>

            <TabsContent value="then" className="pr-4">
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Define actions that will execute when ALL conditions are met.
                  </p>
                </div>
                <ActionBuilder
                  actions={thenActions}
                  onChange={setThenActions}
                  emptyMessage="No 'Then' actions added yet"
                  addButtonLabel="Add Then Action"
                />
              </div>
            </TabsContent>

            <TabsContent value="else" className="pr-4">
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Define actions that will execute when conditions are NOT met (optional).
                  </p>
                </div>
                <ActionBuilder
                  actions={elseActions}
                  onChange={setElseActions}
                  emptyMessage="No 'Else' actions added yet"
                  addButtonLabel="Add Else Action"
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-between gap-2 pt-4 border-t">
          <div className="flex gap-2">
            {currentTab !== 'basic' && (
              <Button 
                variant="outline" 
                onClick={() => {
                  const tabs = ['basic', 'conditions', 'then', 'else'];
                  const currentIndex = tabs.indexOf(currentTab);
                  if (currentIndex > 0) setCurrentTab(tabs[currentIndex - 1]);
                }}
              >
                Previous
              </Button>
            )}
            {currentTab !== 'else' && (
              <Button 
                variant="outline"
                onClick={() => {
                  const tabs = ['basic', 'conditions', 'then', 'else'];
                  const currentIndex = tabs.indexOf(currentTab);
                  if (currentIndex < tabs.length - 1) setCurrentTab(tabs[currentIndex + 1]);
                }}
              >
                Next
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? (editRule ? 'Updating...' : 'Creating...') : (editRule ? 'Update Rule' : 'Create Rule')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
