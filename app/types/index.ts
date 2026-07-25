export type OrganStatus = 'healthy' | 'at-risk' | 'affected';

export interface OrganHealth {
  id: string;
  name: string;
  status: OrganStatus;
  explanation: string;
  position: [number, number, number];
  size: number;
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
  disclaimer?: string;
  scalarOutputs?: {
    peak_value: number;
    peak_month: number;
    improvement_percentage?: number;
  };
  animationData?: {
    organUpdates: Array<{
      organId: string;
      status: OrganStatus;
      colorHex: string;
      intensity: number;
      animationType: string;
    }>;
    narration: string;
  };
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