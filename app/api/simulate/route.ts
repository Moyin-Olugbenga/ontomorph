import { NextResponse } from 'next/server';
import { runOntomorphSimulation, getMockSimulation } from '@/lib/ontomorphClient';
import { DEFAULT_ORGANS } from '@/lib/organs.config';
import { OrganHealth } from '@/app/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenario, currentState } = body;

    const currentOrgans: OrganHealth[] = currentState || DEFAULT_ORGANS;

    const interventionMap: Record<string, string> = {
      'quit-smoking': 'smoking_cessation',
      'lose-weight': 'weight_loss',
      'exercise': 'exercise',
      'sleep': 'sleep_improvement'
    };

    const intervention = interventionMap[scenario] || 'general_lifestyle';

    // Try real simulation first
    let simulationResult = null;
    try {
      simulationResult = await runOntomorphSimulation(scenario, intervention, 60);
    } catch (error) {
      console.warn('Real simulation failed:', error);
    }

    // If simulation succeeded with scalarOutputs
    if (simulationResult && simulationResult.scalarOutputs) {
      const peakValue = simulationResult.scalarOutputs.peak_value || 0;
      const peakMonth = simulationResult.scalarOutputs.peak_month || 12;

      const projectedOrgans: OrganHealth[] = currentOrgans.map((organ: OrganHealth) => {
        let status: 'healthy' | 'at-risk' | 'affected' = organ.status;
        let explanation = organ.explanation;

        if (organ.id === 'lungs' && scenario === 'quit-smoking') {
          status = peakValue > 10 ? 'healthy' : 'at-risk';
          explanation = `Projected ${peakValue}% improvement in lung function. ${simulationResult.disclaimer || ''}`;
        } else if (organ.id === 'heart' && (scenario === 'lose-weight' || scenario === 'exercise')) {
          status = peakValue > 5 ? 'healthy' : 'at-risk';
          explanation = `Projected improvement in cardiac health. ${simulationResult.disclaimer || ''}`;
        } else if (organ.id === 'liver' && scenario === 'lose-weight') {
          status = peakValue > 5 ? 'healthy' : 'at-risk';
          explanation = `Projected improvement in liver function. ${simulationResult.disclaimer || ''}`;
        }

        return { ...organ, status, explanation };
      });

      return NextResponse.json({
        currentState: currentOrgans,
        projectedState: projectedOrgans,
        timeline: `${peakMonth} months projection`,
        summary: `Projected ${peakValue}% improvement in key health metrics.`,
        riskFactors: ['Continued adherence required', 'Regular monitoring recommended'],
        recommendations: [
          'Maintain planned lifestyle changes',
          'Schedule follow-up assessment in 3 months',
          'Monitor key health metrics regularly'
        ],
        disclaimer: simulationResult.disclaimer || 'Based on clinical models. Individual results may vary.',
        scalarOutputs: simulationResult.scalarOutputs,
        animationData: {
          organUpdates: projectedOrgans.map((o: OrganHealth) => ({
            organId: o.id,
            status: o.status,
            colorHex: o.status === 'healthy' ? '#4CAF50' : o.status === 'at-risk' ? '#FF9800' : '#F44336',
            intensity: o.status === 'healthy' ? 0.8 : o.status === 'at-risk' ? 0.6 : 1.0,
            animationType: o.status === 'affected' ? 'pulse' : o.status === 'at-risk' ? 'fade' : 'idle'
          })),
          narration: `Simulation shows ${peakValue}% improvement.`
        }
      });
    }

    // Fallback to mock data
    console.warn('Using mock simulation data');
    const mockResult = getMockSimulation(scenario, currentOrgans);
    
    return NextResponse.json({
      currentState: currentOrgans,
      projectedState: mockResult.projectedState,
      timeline: mockResult.timeline,
      summary: mockResult.summary,
      riskFactors: mockResult.riskFactors,
      recommendations: mockResult.recommendations,
      disclaimer: mockResult.disclaimer,
      scalarOutputs: mockResult.scalarOutputs,
      animationData: mockResult.animationData
    });

  } catch (error) {
    console.error('Simulation error:', error);
    
    const body = await request.json().catch(() => ({}));
    const { scenario = 'quit-smoking', currentState = DEFAULT_ORGANS } = body;
    const mockResult = getMockSimulation(scenario, currentState);
    
    return NextResponse.json({
      currentState: currentState,
      projectedState: mockResult.projectedState,
      timeline: mockResult.timeline,
      summary: mockResult.summary,
      riskFactors: mockResult.riskFactors,
      recommendations: mockResult.recommendations,
      disclaimer: mockResult.disclaimer,
      scalarOutputs: mockResult.scalarOutputs,
      animationData: mockResult.animationData
    });
  }
}