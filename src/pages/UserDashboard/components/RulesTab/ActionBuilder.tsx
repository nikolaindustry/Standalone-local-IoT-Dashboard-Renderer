// Stub for ActionBuilder - Rules feature disabled in standalone mode
import React from 'react';

export interface Action {
  id: string;
  type: string;
  parameters: Record<string, any>;
}

interface ActionBuilderProps {
  actions: Action[];
  onChange: (actions: Action[]) => void;
}

export const ActionBuilder: React.FC<ActionBuilderProps> = ({ actions, onChange }) => {
  return (
    <div className="p-4 border rounded bg-gray-50">
      <p className="text-sm text-gray-600">
        ⚠️ Action Builder is not available in standalone mode
      </p>
    </div>
  );
};

export default ActionBuilder;
