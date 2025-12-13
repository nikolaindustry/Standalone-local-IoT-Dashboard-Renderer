import React, { useState, useEffect } from 'react';
import { IoTDashboardWidget } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, Trash2, Power, PowerOff, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RuleDialog } from './RuleWidgetRenderer/RuleDialog';

interface Rule {
  id: string;
  name: string;
  description: string | null;
  rule_data: any;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface RuleWidgetRendererProps {
  widget: IoTDashboardWidget;
  commonStyles: React.CSSProperties;
  isDesignMode?: boolean;
  onAction?: (actionId: string, parameters?: Record<string, any>) => void;
}

export const RuleWidgetRenderer: React.FC<RuleWidgetRendererProps> = ({
  widget,
  commonStyles,
  isDesignMode = false,
  onAction
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const showContainer = widget.config.showContainer !== false;
  const maxRules = widget.config.maxRules || 5;
  const showActions = widget.config.showActions !== false;
  const showStatus = widget.config.showStatus !== false;
  const showDescription = widget.config.showDescription !== false;
  const listLayout = widget.config.listLayout || 'comfortable';

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
      fetchRules();
    }
  }, [currentUser, isDesignMode]);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rules')
        .select('*')
        .eq('user_id', currentUser?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (rule: Rule) => {
    try {
      const { error } = await supabase
        .from('rules')
        .update({ is_active: !rule.is_active })
        .eq('id', rule.id);

      if (error) throw error;

      toast({
        title: rule.is_active ? 'Rule deactivated' : 'Rule activated',
        description: `${rule.name} has been ${rule.is_active ? 'deactivated' : 'activated'}`,
      });

      fetchRules();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update rule',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: 'Rule deleted',
        description: 'The rule has been removed',
      });

      fetchRules();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete rule',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setShowCreateDialog(true);
  };

  const getStatusBadge = (rule: Rule) => {
    if (!rule.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  // Show all rules (both active and inactive)
  const displayRules = rules.slice(0, maxRules);

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
            New Rule
          </Button>
          <RuleDialog
            open={showCreateDialog}
            onOpenChange={(open) => {
              setShowCreateDialog(open);
              if (!open) setEditingRule(null);
            }}
            currentUser={currentUser}
            onRuleCreated={fetchRules}
            editRule={editingRule}
          />
        </>
      )}

      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading rules...</div>
        ) : displayRules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No automation rules yet</p>
          </div>
        ) : (
          <div style={{ gap: widget.config.itemSpacing || '0.5rem' }} className="flex flex-col">
            {displayRules.map((rule) => (
              <Card 
                key={rule.id} 
                className={`${getLayoutPadding()} ${!rule.is_active ? 'opacity-60' : ''}`}
                style={{
                  backgroundColor: widget.config.itemBackgroundColor,
                  borderRadius: widget.config.borderRadius,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className={listLayout === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} />
                      <h4 className={`font-medium truncate ${getFontSizeClass()}`}>{rule.name}</h4>
                      {showStatus && getStatusBadge(rule)}
                    </div>
                    {showDescription && rule.description && (
                      <p className={`${listLayout === 'compact' ? 'text-[10px]' : 'text-xs'} text-muted-foreground truncate`}>
                        {rule.description}
                      </p>
                    )}
                    <p className={`${listLayout === 'compact' ? 'text-[10px]' : 'text-xs'} text-muted-foreground mt-1`}>
                      Created: {new Date(rule.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {showActions && !isDesignMode && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(rule)}
                        className={listLayout === 'compact' ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
                        title="Edit rule"
                        style={{ color: widget.config.buttonColor }}
                      >
                        <Edit className={listLayout === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(rule)}
                        className={listLayout === 'compact' ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
                        title={rule.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {rule.is_active ? (
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
                        onClick={() => handleDelete(rule.id)}
                        className={`${listLayout === 'compact' ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'} text-destructive hover:text-destructive`}
                        title="Delete rule"
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
          <Zap className="w-4 h-4" />
          {widget.config.title || 'Automation Rules'}
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};
