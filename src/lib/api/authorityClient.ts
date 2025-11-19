// GOV-2: Authority Console API Client
// Provides functions to interact with authority console endpoints

const DEFAULT_BASE_URL = 'http://localhost:8080';

export interface TriadSeat {
  seat_id: string;
  layer: 'terra' | 'numen' | 'lima';
  state: 'EMPTY' | 'ASSIGNED' | 'OCCUPIED' | 'FROZEN';
  updated_at: string;
}

export interface IdentityTriad {
  identity_id: string;
  seats: TriadSeat[];
  complete: boolean;
}

export interface FlowScenario {
  name: string;
  description: string;
  direction: string;
  seat_state: string;
  expected: string;
}

export interface FlowPreview {
  scenarios: FlowScenario[];
  timestamp: string;
}

export interface FlowEvalInput {
  identity_id: string;
  domain_id: string;
  action: string;
  direction: 'upward' | 'downward' | 'lateral';
  action_domain?: string;
  seat_domain?: string;
  parent_approved: boolean;
  context?: Record<string, any>;
}

export interface TriadSeatStatus {
  layer: string;
  state: string;
  frozen: boolean;
}

export interface FlowEvalResult {
  allow: boolean;
  reason: string;
  triad_seats: TriadSeatStatus[];
  details?: Record<string, any>;
  evaluated_at: string;
  policy_version?: string;
}

/**
 * Fetch identity triad (terra/numen/lima seats)
 */
export async function fetchTriad(
  baseUrl: string = DEFAULT_BASE_URL,
  identityId: string
): Promise<IdentityTriad> {
  const url = `${baseUrl}/api/authority/triad/${encodeURIComponent(identityId)}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Triad fetch failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch flow preview (sample scenarios)
 */
export async function previewFlow(
  baseUrl: string = DEFAULT_BASE_URL
): Promise<FlowPreview> {
  const url = `${baseUrl}/api/authority/flow/preview`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Flow preview failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Evaluate authority flow (read-only, no side effects)
 */
export async function evalFlow(
  baseUrl: string = DEFAULT_BASE_URL,
  input: FlowEvalInput
): Promise<FlowEvalResult> {
  const url = `${baseUrl}/api/authority/flow/eval`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Flow eval failed: ${response.status} ${errorText}`);
  }
  
  return response.json();
}
