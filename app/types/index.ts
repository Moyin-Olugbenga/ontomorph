export type OrganStatus = 'healthy' | 'at-risk' | 'affected';

export interface OrganHealth {
  id: string;
  name: string;
  status: OrganStatus;
  explanation: string;
  position: [number, number, number];
  size: number;
}

export interface OrganDetail {
  organId: string;
  meshName: string;
  status: OrganStatus;
  severity: 'low' | 'medium' | 'high';
  colorHex: string;
  reasoning: string;
  explanation: string;
}

export interface PatientProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  smokingStatus: 'never' | 'former' | 'current';
  weight: number;
  height: number;
  bloodPressure?: string;
  additionalSymptoms?: string;
}

export interface SimulationResult {
  currentState: OrganHealth[];
  projectedState: OrganHealth[];
  timeline: string;
  summary: string;
  riskFactors: string[];
  recommendations: string[];
}

export interface AnalysisResponse {
  organs: OrganHealth[];
  conditions: string[];
  explanation: string;
  riskFactors: string[];
  holonReferences: string[];
}

export interface ApiAnalysisResponse {
  organs: {
    id: string;
    status: OrganStatus;
    explanation: string;
  }[];
  conditions: string[];
  explanation: string;
  riskFactors: string[];
  holonReferences: string[];
}

export interface OrganHealth {
  id: string;
  name: string;
  status: OrganStatus;
  explanation: string;
  position: [number, number, number];
  size: number;
}

export interface OrganDetail {  // Make sure this is exported
  organId: string;
  meshName: string;
  status: OrganStatus;
  severity: 'low' | 'medium' | 'high';
  colorHex: string;
  reasoning: string;
  explanation: string;
}

export interface OrganHealth {
  id: string;
  name: string;
  status: OrganStatus;
  explanation: string;
  position: [number, number, number];
  size: number;
}

export interface OrganShape {
  geometry: 'sphere' | 'capsule' | 'cylinder' | 'heart' | 'bean' | 'custom';
  scale: [number, number, number];
  color: string;
}


