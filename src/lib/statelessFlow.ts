/**
 * Stateless flow handler for Slack dialogs and web interfaces
 * Uses encoded state to maintain flow progress without server-side session storage
 */

export interface FlowState {
  step: string;
  data: Record<string, any>;
  language?: string;
  office?: string;
}

export function encodeFlowState(state: FlowState): string {
  if (typeof window !== 'undefined') {
    // Browser environment - use btoa
    const json = JSON.stringify(state);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    // Convert base64 to base64url (replace + with -, / with _, remove padding)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } else {
    // Node.js environment - use Buffer
    const json = JSON.stringify(state);
    const base64 = Buffer.from(json, 'utf-8').toString('base64');
    // Convert base64 to base64url
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

export function decodeFlowState(encoded: string): FlowState | null {
  try {
    // Convert base64url back to base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    if (typeof window !== 'undefined') {
      // Browser environment - use atob
      const json = decodeURIComponent(escape(atob(base64)));
      return JSON.parse(json);
    } else {
      // Node.js environment - use Buffer
      const json = Buffer.from(base64, 'base64').toString('utf-8');
      return JSON.parse(json);
    }
  } catch {
    return null;
  }
}

export interface FlowStep {
  id: string;
  next?: string;
  previous?: string;
  handler?: (state: FlowState, input: any) => FlowState;
}

export class StatelessFlow {
  private steps: Map<string, FlowStep> = new Map();

  registerStep(step: FlowStep) {
    this.steps.set(step.id, step);
  }

  getStep(stepId: string): FlowStep | undefined {
    return this.steps.get(stepId);
  }

  processStep(stepId: string, state: FlowState, input: any): FlowState {
    const step = this.getStep(stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found`);
    }

    const updatedState: FlowState = {
      ...state,
      step: stepId,
    };

    if (step.handler) {
      return step.handler(updatedState, input);
    }

    return updatedState;
  }

  getNextStep(stepId: string): string | undefined {
    const step = this.getStep(stepId);
    return step?.next;
  }

  getPreviousStep(stepId: string): string | undefined {
    const step = this.getStep(stepId);
    return step?.previous;
  }
}
