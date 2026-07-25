import { OrganHealth } from '@/app/types';

// Types
export interface HOLONConcept {
  concept: {
    conceptId: number;
    term: string;
    code: string;
    vocabulary: string;
  };
}

export interface ReferenceRange {
  code: string;
  range: string;
  interpretation?: string;
  low?: number;
  high?: number;
  unit?: string;
}

export interface DrugInteraction {
  hasInteraction: boolean;
  interactions?: Array<{
    severity: string;
    description: string;
  }>;
  totalInteractions?: number;
}

export interface SimulationResult {
  scalarOutputs?: {
    peak_value: number;
    peak_month: number;
    improvement_percentage?: number;
  };
  disclaimer?: string;
  summary?: string;
  timeline?: string;
  projectedState?: OrganHealth[];
  riskFactors?: string[];
  recommendations?: string[];
  animationData?: {
    organUpdates: Array<{
      organId: string;
      status: string;
      colorHex: string;
      intensity: number;
      animationType: string;
    }>;
    narration: string;
  };
}

export class OntomorphClient {
  private apiKey: string;
  private holonKey: string;
  private baseUrl: string;
  private holonUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_DTP_API_KEY || '';
    this.holonKey = process.env.NEXT_PUBLIC_HOLON_API_KEY || '';
    this.baseUrl = process.env.NEXT_PUBLIC_DTP_BASE_URL || 'https://sandbox-api.ontomorph.com';
    this.holonUrl = process.env.NEXT_PUBLIC_HOLON_API_URL || 'https://holon-api.ontomorph.com';
  }

  async getConcept(code: string, vocabulary: string = 'LOINC'): Promise<HOLONConcept | null> {
    try {
      const response = await fetch(`${this.holonUrl}/concepts?code=${code}&vocabulary=${vocabulary}`, {
        headers: {
          'Authorization': `Bearer ${this.holonKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('HOLON concept fetch error:', error);
      return null;
    }
  }

  async searchConcepts(query: string): Promise<HOLONConcept[] | null> {
    try {
      const response = await fetch(`${this.holonUrl}/concepts?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${this.holonKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.hits || [];
    } catch (error) {
      console.error('HOLON search error:', error);
      return null;
    }
  }

  async getReferenceRanges(loincCode: string, age: number, gender: string): Promise<ReferenceRange | null> {
    try {
      const response = await fetch(
        `${this.holonUrl}/reference-ranges?code=${loincCode}&age=${age}&gender=${gender}`,
        {
          headers: {
            'Authorization': `Bearer ${this.holonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Reference ranges fetch error:', error);
      return null;
    }
  }

  async checkDrugInteractions(rxNormCodes: string[]): Promise<DrugInteraction | null> {
    try {
      const response = await fetch(`${this.holonUrl}/interactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.holonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ codes: rxNormCodes })
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Drug interaction check error:', error);
      return null;
    }
  }

  async runSimulation(scenario: string, intervention: string, durationMonths: number = 60): Promise<SimulationResult | null> {
    try {
      const grantToken = process.env.NEXT_PUBLIC_SANDBOX_GRANT_TOKEN;
      
      const response = await fetch(`${this.baseUrl}/twins/simulate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Grant-Token': grantToken || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          simulation_type: scenario,
          intervention: intervention,
          duration_months: durationMonths
        })
      });
      
      if (!response.ok) {
        console.warn('Simulation API returned error:', response.status);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Simulation error:', error);
      return null;
    }
  }

  async connectTwin(grantToken: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/twins/connect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ grant_token: grantToken })
    });
    return response.json();
  }

  async getTwinEvents(twinId: string, system?: string): Promise<any> {
    const url = system 
      ? `${this.baseUrl}/twins/${twinId}/events?system=${system}`
      : `${this.baseUrl}/twins/${twinId}/events`;
      
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async flagTwin(twinId: string, system: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/twins/${twinId}/flags`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system,
        ...data
      })
    });
    return response.json();
  }
}

// Singleton instance
let clientInstance: OntomorphClient | null = null;

export function getOntomorphClient(): OntomorphClient {
  if (!clientInstance) {
    clientInstance = new OntomorphClient();
  }
  return clientInstance;
}

// Helper functions
export async function getHOLONConcept(code: string, vocabulary: string = 'LOINC'): Promise<HOLONConcept | null> {
  const client = getOntomorphClient();
  return await client.getConcept(code, vocabulary);
}

export async function getReferenceRanges(loincCode: string, age: number, gender: string): Promise<ReferenceRange | null> {
  const client = getOntomorphClient();
  return await client.getReferenceRanges(loincCode, age, gender);
}

export async function searchHOLONConcepts(query: string): Promise<HOLONConcept[] | null> {
  const client = getOntomorphClient();
  return await client.searchConcepts(query);
}

export async function checkDrugInteractions(rxNormCodes: string[]): Promise<DrugInteraction | null> {
  const client = getOntomorphClient();
  return await client.checkDrugInteractions(rxNormCodes);
}

export async function runOntomorphSimulation(scenario: string, intervention: string, durationMonths: number = 60): Promise<SimulationResult | null> {
  const client = getOntomorphClient();
  return await client.runSimulation(scenario, intervention, durationMonths);
}

// Mock data (fallback)
export function getMockSimulation(scenario: string, organs: OrganHealth[]): SimulationResult {
  const scenarioLabels: Record<string, string> = {
    'quit-smoking': 'smoking cessation',
    'lose-weight': 'weight loss of 10kg',
    'exercise': 'regular moderate exercise 3x per week',
    'sleep': 'improved sleep habits (7-8 hours nightly)'
  };

  const projectedOrgans = organs.map((organ: OrganHealth) => {
    let status: 'healthy' | 'at-risk' | 'affected' = organ.status;
    let explanation = organ.explanation;

    if (scenario === 'quit-smoking' && organ.id === 'lungs') {
      status = 'healthy';
      explanation = 'Significant improvement in lung function. +15% FEV1 expected. Reduced inflammation.';
    } else if (scenario === 'lose-weight' && (organ.id === 'heart' || organ.id === 'liver')) {
      status = 'healthy';
      explanation = organ.id === 'heart' 
        ? 'Reduced cardiac workload. BP decreased by 10mmHg.' 
        : 'Reduced hepatic fat. ALT levels normalized.';
    } else if (scenario === 'exercise' && (organ.id === 'heart' || organ.id === 'lungs')) {
      status = 'healthy';
      explanation = organ.id === 'heart'
        ? 'Improved cardiac output. Resting HR decreased by 10 bpm.'
        : 'Enhanced respiratory efficiency. VO2 max increased.';
    } else if (scenario === 'sleep' && organ.id === 'brain') {
      status = 'healthy';
      explanation = 'Improved cognitive function. Enhanced neuroplasticity.';
    }

    return { ...organ, status, explanation };
  });

  return {
    scalarOutputs: {
      peak_value: 15,
      peak_month: 12,
      improvement_percentage: 15
    },
    summary: `Positive health trajectory projected through ${scenarioLabels[scenario] || 'lifestyle changes'}.`,
    timeline: '5-year projection based on current health trends',
    projectedState: projectedOrgans,
    riskFactors: ['Continued adherence required', 'Individual results may vary'],
    recommendations: [
      `Continue with ${scenarioLabels[scenario] || 'healthy lifestyle'} plan`,
      'Schedule follow-up health assessment in 6 months',
      'Maintain regular monitoring of key health metrics'
    ],
    disclaimer: 'This is a simulated projection based on clinical models. Actual results may vary.',
    animationData: {
      organUpdates: projectedOrgans.map((o: OrganHealth) => ({
        organId: o.id,
        status: o.status,
        colorHex: o.status === 'healthy' ? '#4CAF50' : o.status === 'at-risk' ? '#FF9800' : '#F44336',
        intensity: o.status === 'healthy' ? 0.8 : o.status === 'at-risk' ? 0.6 : 1.0,
        animationType: o.status === 'affected' ? 'pulse' : o.status === 'at-risk' ? 'fade' : 'idle'
      })),
      narration: `Based on ${scenarioLabels[scenario] || 'lifestyle changes'}, significant improvements are projected.`
    }
  };
}