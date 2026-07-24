import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SimulationResult, OrganStatus } from '@/app/types';
import { DEFAULT_ORGANS } from '@/lib/organs.config';

// Initialize OpenAI client with Groq configuration
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenario, currentState, patientProfile } = body;

    const scenarioLabels: Record<string, string> = {
      'quit-smoking': 'smoking cessation',
      'lose-weight': 'weight loss of 10kg',
      'exercise': 'regular moderate exercise 3x per week',
      'sleep': 'improved sleep habits (7-8 hours nightly)'
    };

    // Personalized scenario prompts based on patient data
    const getPersonalizedScenarioPrompt = (scenario: string, patient: any) => {
      const age = patient?.age || 'unknown';
      const smokingStatus = patient?.smokingStatus || 'unknown';
      const gender = patient?.gender || 'unknown';
      
      const scenarioDetails = {
        'quit-smoking': `For a ${age}-year-old ${gender} ${smokingStatus === 'current' ? 'current smoker' : 'former smoker'}, quitting smoking would have significant benefits. At ${age}, lung recovery potential is ${age < 30 ? 'excellent' : age < 50 ? 'good' : 'moderate but still beneficial'}. 
        - If under 30: Lungs can recover nearly full function within 5 years
        - If 30-50: Significant recovery possible, risk reduction is substantial
        - If over 50: Still beneficial, reduces risk of COPD and cancer progression`,
        
        'lose-weight': `Weight loss of 10kg for a ${age}-year-old ${gender} with ${patient?.bmiCategory || 'unknown'} BMI would:
        - Reduce cardiovascular strain
        - Improve metabolic health
        - Decrease joint stress
        - ${age < 40 ? 'Likely prevent future metabolic issues' : 'Reverse some age-related metabolic decline'}`,
        
        'exercise': `Regular exercise for a ${age}-year-old ${gender}:
        - ${age < 30 ? 'Optimize cardiovascular fitness' : 'Maintain or improve cardiovascular function'}
        - ${age > 40 ? 'Reduce age-related muscle loss' : 'Build long-term health habits'}
        - Improve mental health and cognitive function`,
        
        'sleep': `Better sleep habits for a ${age}-year-old ${gender}:
        - ${age < 25 ? 'Support brain development and academic performance' : 'Improve cognitive function and stress management'}
        - Cardiovascular recovery
        - Metabolic regulation`
      };

      return scenarioDetails[scenario as keyof typeof scenarioDetails] || scenarioDetails['quit-smoking'];
    };

    // If no Groq API key, return personalized mock data
    if (!process.env.GROQ_API_KEY) {
      console.warn('No Groq API key found, returning mock simulation');
      
      const age = patientProfile?.age || 30;
      const smokingStatus = patientProfile?.smokingStatus || 'never';
      
      const projectedOrgans = DEFAULT_ORGANS.map(organ => {
        let status: OrganStatus = organ.status;
        let explanation = organ.explanation;

        if (scenario === 'quit-smoking' && organ.id === 'lungs') {
          status = 'healthy';
          const recovery = age < 30 ? 'excellent recovery' : age < 50 ? 'good recovery' : 'moderate but beneficial recovery';
          explanation = `As a ${age}-year-old, your lungs show ${recovery}. Since you're ${age < 40 ? 'young' : 'at a good age'} for lifestyle changes, we project +${age < 30 ? 20 : age < 50 ? 15 : 10}% improvement in lung function.`;
        } else if (scenario === 'lose-weight' && (organ.id === 'heart' || organ.id === 'liver')) {
          status = 'healthy';
          explanation = organ.id === 'heart' 
            ? `At ${age}, your heart responds well to weight loss. Projected BP reduction of ${age < 40 ? 12 : 10}mmHg.`
            : `Your liver shows reduced fat accumulation. ALT levels projected to normalize within ${age < 30 ? 6 : 12} months.`;
        } else if (scenario === 'exercise' && (organ.id === 'heart' || organ.id === 'lungs')) {
          status = 'healthy';
          explanation = organ.id === 'heart'
            ? `Regular exercise at ${age} improves cardiac output. Projected ${age < 40 ? 15 : 10}% increase in cardiac efficiency.`
            : `Exercise enhances your lung capacity. VO2 max projected to increase ${age < 30 ? 20 : 15}% within 6 months.`;
        } else if (scenario === 'sleep' && organ.id === 'brain') {
          status = 'healthy';
          explanation = `Improved sleep at ${age} enhances cognitive function. ${age < 30 ? 'Your brain neuroplasticity is at peak' : 'Age-related cognitive decline is slowed'}. Memory consolidation improves.`;
        }

        return { ...organ, status, explanation };
      });

      const mockResult: SimulationResult = {
        currentState: currentState || DEFAULT_ORGANS,
        projectedState: projectedOrgans,
        timeline: `5-year projection based on your age (${age}) and lifestyle changes`,
        summary: `${age < 40 ? 'Young age gives you excellent recovery potential' : 'Good age for positive lifestyle changes'}. ${scenarioLabels[scenario] || 'Lifestyle changes'} will significantly improve your health outcomes.`,
        riskFactors: [
          'Consistency in lifestyle changes',
          'Regular health monitoring',
          'Stress management and mental well-being'
        ],
        recommendations: [
          `Continue with ${scenarioLabels[scenario] || 'healthy lifestyle'} plan`,
          `Schedule follow-up in ${age < 30 ? '6 months' : '3 months'} to track progress`,
          `Maintain ${age < 40 ? 'regular' : 'consistent'} monitoring of key health metrics`,
          age > 40 ? 'Consider additional age-appropriate health screenings' : 'Build long-term healthy habits now'
        ]
      };
      
      return NextResponse.json(mockResult);
    }

    const prompt = `
      You are a personalized health simulation AI. Create a realistic, age-appropriate health projection for this specific patient.

      Patient Profile:
      ${JSON.stringify(patientProfile || { age: 'unknown', gender: 'unknown' }, null, 2)}

      Scenario: ${scenarioLabels[scenario] || scenario}
      
      ${getPersonalizedScenarioPrompt(scenario, patientProfile)}

      Current organ health:
      ${JSON.stringify(currentState || DEFAULT_ORGANS, null, 2)}

      Based on this specific patient's profile (age, gender, lifestyle), create a 5-year projection that is:
      1. Realistic for their age group
      2. Specific to their personal risk factors
      3. Uses age-appropriate language and expectations
      4. Provides actionable, personalized recommendations

      Return ONLY valid JSON with this exact structure:
      {
        "currentState": [],
        "projectedState": [],
        "timeline": "Age-appropriate timeline description",
        "summary": "Personalized summary for this patient",
        "riskFactors": ["factor1", "factor2"],
        "recommendations": ["personalized recommendation 1", "personalized recommendation 2"]
      }
      
      Make the recommendations specific to their age and lifestyle. For example, if they're 21, recommend lifestyle changes that are sustainable for young adults.
    `;

    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { 
          role: 'system', 
          content: 'You are a personalized health simulation AI. You create realistic, age-appropriate health projections that speak directly to the patient. Your responses are personalized, evidence-based, and actionable.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    const typedResult: SimulationResult = {
      currentState: result.currentState || currentState || DEFAULT_ORGANS,
      projectedState: result.projectedState?.map((o: any) => ({
        ...o,
        status: o.status as OrganStatus
      })) || DEFAULT_ORGANS,
      timeline: result.timeline || '5-year projection',
      summary: result.summary || 'Simulation complete',
      riskFactors: result.riskFactors || [],
      recommendations: result.recommendations || []
    };
    
    return NextResponse.json(typedResult);
    
  } catch (error) {
    console.error('Simulation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to run simulation';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}