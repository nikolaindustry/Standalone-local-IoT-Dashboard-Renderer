// IoT Dashboard Page Tabs Component
// Manages multiple pages within a dashboard

import React, { useState } from 'react';
import { useIoTBuilder } from '../contexts/IoTBuilderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  X, 
  MoreVertical,
  Pencil,
  Trash2,
  Copy
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const IoTPageTabs: React.FC = () => {
  const { state, actions } = useIoTBuilder();
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletePageId, setDeletePageId] = useState<string | null>(null);

  const pages = state.config?.pages || [];
  const activePage = pages.find(p => p.id === state.activePageId);

  const handleAddPage = () => {
    const pageNumber = pages.length + 1;
    actions.addPage(`Page ${pageNumber}`);
  };

  const handleStartRename = (pageId: string, currentName: string) => {
    setEditingPageId(pageId);
    setEditingName(currentName);
  };

  const handleSaveRename = () => {
    if (editingPageId && editingName.trim()) {
      actions.renamePage(editingPageId, editingName.trim());
    }
    setEditingPageId(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setEditingPageId(null);
    setEditingName('');
  };

  const handleDuplicatePage = (pageId: string) => {
    actions.duplicatePage(pageId);
  };

  const handleDeletePage = (pageId: string) => {
    setDeletePageId(pageId);
  };

  const confirmDeletePage = () => {
    if (deletePageId) {
      actions.deletePage(deletePageId);
      setDeletePageId(null);
    }
  };

  const pageToDelete = pages.find(p => p.id === deletePageId);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 px-2 border-b border-border bg-card/50">
        <ScrollArea className="flex-1">
          <div className="flex items-center gap-1 py-2">
          {pages.map(page => (
            <div
              key={page.id}
              className={cn(
                "relative group flex items-center gap-1 rounded-md transition-all",
                state.activePageId === page.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-accent/50 border border-transparent"
              )}
            >
              {editingPageId === page.id ? (
                <div className="flex items-center gap-1 px-2">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleSaveRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename();
                      if (e.key === 'Escape') handleCancelRename();
                    }}
                    className="h-7 w-32 text-xs"
                    autoFocus
                  />
                </div>
              ) : (
                <>
                  <button
                    onClick={() => actions.setActivePage(page.id)}
                    className="flex-1 px-3 py-1.5 text-sm font-medium whitespace-nowrap flex items-center gap-2"
                  >
                    <span>{page.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {page.widgets.length}
                    </span>
                  </button>
                  
                  {pages.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleStartRename(page.id, page.name)}
                        >
                          <Pencil className="w-3 h-3 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicatePage(page.id)}
                        >
                          <Copy className="w-3 h-3 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePage(page.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddPage}
            className="h-8 px-2 shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Page
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add a new page to organize your dashboard</p>
          <p className="text-xs text-muted-foreground mt-1">Navigate: Ctrl+Tab / Ctrl+Shift+Tab</p>
        </TooltipContent>
      </Tooltip>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePageId} onOpenChange={() => setDeletePageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the page "{pageToDelete?.name}"? 
              This will remove all widgets on this page. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  );
};
