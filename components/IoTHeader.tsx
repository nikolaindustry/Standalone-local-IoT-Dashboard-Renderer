// Independent IoT Dashboard Header
// No dependencies on Product Dashboard Designer

import React from 'react';
import { useIoTBuilder } from '../contexts/IoTBuilderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, Share2, Check, Download, Upload, Sparkles, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { IconPicker } from './IconPicker';

interface IoTHeaderProps {
  onOpenAIChat?: () => void;
}

const CopyTargetIdButton: React.FC<{ customTargetId?: string }> = ({ customTargetId }) => {
  const { currentUser } = useAuth();
  const [justCopied, setJustCopied] = React.useState(false);

  const handleCopyTargetId = async () => {
    // Use custom target ID if set, otherwise use user ID
    const targetId = customTargetId || currentUser?.id;
    
    if (!targetId) {
      toast.error('Target ID not available');
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(targetId);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = targetId;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setJustCopied(true);
      toast.success('Target ID copied to clipboard!');
      setTimeout(() => setJustCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy Target ID');
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleCopyTargetId}
      className={justCopied ? 'bg-green-50 border-green-200' : ''}
    >
      {justCopied ? (
        <>
          <Check className="w-4 h-4 mr-2 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          Copy Target ID
        </>
      )}
    </Button>
  );
};

export const IoTHeader: React.FC<IoTHeaderProps> = ({ onOpenAIChat }) => {
  const { state, actions } = useIoTBuilder();
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [dashboardName, setDashboardName] = React.useState(state.config?.name || '');
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);
  const [shareToken, setShareToken] = React.useState<string | null>(null);
  const [shareEnabled, setShareEnabled] = React.useState(false);
  const [loadingShare, setLoadingShare] = React.useState(false);
  const [justCopied, setJustCopied] = React.useState(false);
  
  // Settings state
  const [description, setDescription] = React.useState(state.config?.description || '');
  const [isPublic, setIsPublic] = React.useState(state.config?.settings.isPublic || false);
  const [enableWebSocket, setEnableWebSocket] = React.useState(state.config?.settings.enableWebSocket !== false);
  const [customTargetId, setCustomTargetId] = React.useState(state.config?.settings.customTargetId || '');
  const [iconName, setIconName] = React.useState(state.config?.theme?.iconName || 'LayoutGrid');

  React.useEffect(() => {
    if (state.config?.name) {
      setDashboardName(state.config.name);
    }
    if (state.config?.description) {
      setDescription(state.config.description);
    }
    if (state.config?.settings) {
      setIsPublic(state.config.settings.isPublic || false);
      setEnableWebSocket(state.config.settings.enableWebSocket !== false);
      setCustomTargetId(state.config.settings.customTargetId || '');
    }
    if (state.config?.theme?.iconName) {
      setIconName(state.config.theme.iconName);
    }
  }, [state.config]);

  const handleNameSave = () => {
    if (dashboardName.trim()) {
      actions.updateConfig({ name: dashboardName.trim() });
      setIsEditingName(false);
    }
  };

  const handleSettingsSave = () => {
    actions.updateConfig({
      description,
      settings: {
        ...state.config?.settings,
        isPublic,
        enableWebSocket,
        customTargetId: customTargetId.trim() || undefined,
      },
      theme: {
        ...state.config?.theme,
        iconName,
      },
    });
    setSettingsDialogOpen(false);
    toast.success('Settings updated successfully');
  };

  const handleExportJSON = () => {
    if (!state.config) {
      toast.error('No dashboard to export');
      return;
    }

    try {
      const jsonString = JSON.stringify(state.config, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${state.config.name || 'dashboard'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Dashboard exported successfully');
    } catch (error) {
      console.error('Error exporting dashboard:', error);
      toast.error('Failed to export dashboard');
    }
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = JSON.parse(content);
        
        // Validate basic structure
        if (!config.name || !config.pages || !Array.isArray(config.pages)) {
          throw new Error('Invalid dashboard configuration');
        }

        // Update the config
        actions.updateConfig(config);
        toast.success('Dashboard imported successfully');
        setSettingsDialogOpen(false);
      } catch (error) {
        console.error('Error importing dashboard:', error);
        toast.error('Failed to import dashboard. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  // Load share settings
  React.useEffect(() => {
    const loadShareSettings = async () => {
      if (!state.config?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('custom_iot_dashboards')
          .select('share_token, share_enabled')
          .eq('id', state.config.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setShareToken(data.share_token);
          setShareEnabled(data.share_enabled || false);
        }
      } catch (error) {
        console.error('Error loading share settings:', error);
      }
    };

    loadShareSettings();
  }, [state.config?.id]);

  const generateShareLink = async () => {
    if (!state.config?.id) {
      toast.error('Please save the dashboard first');
      return;
    }

    setLoadingShare(true);
    try {
      // Generate a new share token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_share_token');

      if (tokenError) throw tokenError;

      const newToken = tokenData;

      // Update the dashboard with the new token
      const { error: updateError } = await supabase
        .from('custom_iot_dashboards')
        .update({
          share_token: newToken,
          share_enabled: true,
          share_permissions: {
            canControl: true,
            canEdit: false,
            canView: true,
          },
        })
        .eq('id', state.config.id);

      if (updateError) throw updateError;

      setShareToken(newToken);
      setShareEnabled(true);
      
      // Auto-copy to clipboard
      const shareUrl = `${window.location.origin}/shared-dashboard/${newToken}`;
      
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }
        
        setJustCopied(true);
        toast.success('Share link copied to clipboard!');
        setTimeout(() => setJustCopied(false), 3000);
      } catch (copyError) {
        console.error('Failed to copy:', copyError);
        toast.warning('Link generated but failed to copy automatically');
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error('Failed to generate share link');
    } finally {
      setLoadingShare(false);
    }
  };

  const toggleShareEnabled = async () => {
    if (!state.config?.id || !shareToken) return;

    setLoadingShare(true);
    try {
      const { error } = await supabase
        .from('custom_iot_dashboards')
        .update({ share_enabled: !shareEnabled })
        .eq('id', state.config.id);

      if (error) throw error;

      setShareEnabled(!shareEnabled);
      toast.success(shareEnabled ? 'Sharing disabled' : 'Sharing enabled');
    } catch (error) {
      console.error('Error toggling share:', error);
      toast.error('Failed to update share settings');
    } finally {
      setLoadingShare(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareToken) {
      toast.error('No share token available');
      return;
    }
    
    try {
      const shareUrl = `${window.location.origin}/shared-dashboard/${shareToken}`;
      
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers or insecure contexts
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          textArea.remove();
        } catch (err) {
          textArea.remove();
          throw new Error('Copy command failed');
        }
      }
      
      setJustCopied(true);
      toast.success('Share link copied to clipboard!');
      
      setTimeout(() => setJustCopied(false), 3000);
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/iot-dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {isEditingName ? (
          <Input
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSave();
              if (e.key === 'Escape') {
                setDashboardName(state.config?.name || '');
                setIsEditingName(false);
              }
            }}
            className="w-64"
            autoFocus
          />
        ) : (
          <h1
            className="text-xl font-semibold cursor-pointer hover:text-primary"
            onClick={() => setIsEditingName(true)}
          >
            {state.config?.name || 'Untitled Dashboard'}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <CopyTargetIdButton customTargetId={state.config?.settings.customTargetId} />
        
        {onOpenAIChat && (
          <Button variant="outline" size="sm" onClick={onOpenAIChat} className="relative">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Designer
            <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0">BETA</Badge>
          </Button>
        )}
        
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Dashboard</DialogTitle>
              <DialogDescription>
                Generate a shareable link that allows others to view and control this dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {shareToken ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to access this dashboard
                      </p>
                    </div>
                    <Switch
                      checked={shareEnabled}
                      onCheckedChange={toggleShareEnabled}
                      disabled={loadingShare}
                    />
                  </div>
                  
                  <div className="rounded-lg bg-muted p-3 space-y-2">
                    <h4 className="text-sm font-medium">Permissions</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✓ View dashboard</li>
                      <li>✓ Control widgets (buttons, switches, etc.)</li>
                      <li>✗ Edit dashboard layout</li>
                    </ul>
                  </div>
                  
                  {justCopied && (
                    <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-green-600 font-medium">
                        Share link copied to clipboard!
                      </p>
                    </div>
                  )}
                  
                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Share token has been generated. Sharing is currently {shareEnabled ? 'enabled' : 'disabled'}.
                    </p>
                    <Button 
                      onClick={copyShareLink}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Copy Link Again
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate a shareable link that will be automatically copied to your clipboard.
                  </p>
                  <Button onClick={generateShareLink} disabled={loadingShare}>
                    {loadingShare ? 'Generating...' : 'Generate Share Link'}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Dashboard Settings</DialogTitle>
              <DialogDescription>
                Configure your dashboard preferences and behavior.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Import/Export Section */}
              <div className="space-y-3 p-4 rounded-lg border bg-muted/50">
                <h4 className="text-sm font-semibold">Import / Export</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportJSON}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('import-json-input')?.click()}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import JSON
                  </Button>
                  <input
                    id="import-json-input"
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Export your dashboard configuration or import from a JSON file
                </p>
              </div>
              
              {/* Icon Picker */}
              <IconPicker 
                value={iconName} 
                onChange={setIconName} 
              />
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter dashboard description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Dashboard</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this dashboard visible to everyone
                  </p>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable WebSocket</Label>
                  <p className="text-sm text-muted-foreground">
                    Real-time communication for live updates
                  </p>
                </div>
                <Switch
                  checked={enableWebSocket}
                  onCheckedChange={setEnableWebSocket}
                />
              </div>
              
              {/* Custom Target ID */}
              <div className="space-y-2">
                <Label htmlFor="customTargetId">Custom Target ID (Optional)</Label>
                <Input
                  id="customTargetId"
                  placeholder="Leave empty to use your user ID"
                  value={customTargetId}
                  onChange={(e) => setCustomTargetId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Set a custom WebSocket target ID for this dashboard. If empty, your user ID will be used by default.
                </p>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSettingsSave}>
                  Save Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
