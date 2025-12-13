// Type definitions for rules - stub for standalone mode

export interface Rule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditions: Condition[];
  actions: Action[];
  created_at?: string;
  updated_at?: string;
}

export interface Condition {
  id: string;
  type: 'runtime_data' | 'time' | 'custom';
  operator: string;
  value: any;
  field?: string;
}

export interface Action {
  id: string;
  type: string;
  parameters: Record<string, any>;
}

export interface ActionPayload {
  type: string;
  [key: string]: any;
}

export interface RuleExecution {
  id: string;
  rule_id: string;
  executed_at: string;
  success: boolean;
  error?: string;
}
