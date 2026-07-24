import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ApiAnalysisResponse, OrganStatus } from '@/app/types';
import { DEFAULT_ORGANS } from '@/lib/organs.config';

// Initialize OpenAI client with Groq configuration
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symptoms, age, gender, smokingStatus, weight, height } = body;

    // Calculate BMI
    const bmi = height ? (weight / ((height/100) ** 2)) : null;
    const bmiCategory = bmi ? 
      bmi < 18.5 ? 'underweight' :
      bmi < 25 ? 'normal' :
      bmi < 30 ? 'overweight' : 'obese' : 'unknown';

    // Personalized intro based on patient data
    const patientIntro = `
      Patient Profile:
      - Age: ${age} years old
      - Gender: ${gender}
      - BMI: ${bmi ? bmi.toFixed(1) : 'Unknown'} (${bmiCategory})
      - Smoking Status: ${smokingStatus === 'never' ? 'never smoked' : smokingStatus === 'former' ? 'former smoker' : 'current smoker'}
      - Weight: ${weight}kg
      - Height: ${height}cm
      ${symptoms ? `- Reported Symptoms: ${symptoms}` : '- No symptoms reported'}
    `;

    // Personalized risk assessment
    const riskContext = `
      For a ${age}-year-old ${gender} with ${smokingStatus === 'current' ? 'active smoking' : smokingStatus === 'former' ? 'former smoking history' : 'no smoking history'}:
      - ${smokingStatus === 'current' ? 'Immediate smoking cessation is critical. Lung function is actively declining.' : ''}
      - ${smokingStatus === 'former' ? 'Past smoking history increases risk for COPD and lung cancer. Regular screening recommended.' : ''}
      - ${bmiCategory === 'obese' || bmiCategory === 'overweight' ? 'Weight management is important for cardiovascular and metabolic health.' : ''}
      - ${age < 30 ? 'Young age is favorable for recovery and lifestyle changes.' : ''}
      - ${age > 50 ? 'Age-related health screenings should be prioritized.' : ''}
    `;

    const prompt = `
      You are a compassionate, personalized health AI assistant. Provide a detailed, patient-specific health assessment based on the following data:

      ${patientIntro}

      ${riskContext}

      Based on this specific patient's profile, provide:
      1. Organ-specific analysis (lungs, heart, liver, kidneys, brain) with personalized explanations
      2. Specific health conditions this patient may be at risk for
      3. A comprehensive, personalized health assessment
      4. Personalized risk factors with context
      5. HOLON clinical references

      For the explanations, use the patient's age, gender, and specific risk factors. For example, if the patient is 21 and a former smoker, say something like:
      "At 21 years old, your lungs have remarkable regenerative capacity. While your former smoking history puts you at higher risk for COPD and lung cancer, your young age means your lungs can recover significantly if you maintain a smoke-free lifestyle. We recommend lung function testing and regular screening."

      Return ONLY valid JSON with this exact structure:
      {
        "organs": [
          {
            "id": "lungs",
            "status": "healthy|at-risk|affected",
            "explanation": "Personalized explanation for this patient's specific situation"
          }
        ],
        "conditions": ["condition1", "condition2"],
        "explanation": "Comprehensive, personalized health assessment summary",
        "riskFactors": ["factor1", "factor2"],
        "holonReferences": ["HOLON: REF-001 - Description"]
      }
      
      Make it feel like a caring doctor talking to this specific patient, not a generic response.
    `;

    // If no Groq API key, return mock data
    if (!process.env.GROQ_API_KEY) {
      console.warn('No Groq API key found, returning mock data');
      
      // Generate personalized mock responses based on patient data
      const smokingRisk = smokingStatus === 'current' ? 'high' : smokingStatus === 'former' ? 'moderate' : 'low';
      const ageRisk = parseInt(age) < 30 ? 'low' : parseInt(age) > 50 ? 'high' : 'moderate';
      
      const mockOrgans = DEFAULT_ORGANS.map(o => {
        let status: OrganStatus = 'healthy';
        let explanation = o.explanation;
        
        if (o.id === 'lungs' && smokingStatus !== 'never') {
          status = smokingStatus === 'current' ? 'affected' : 'at-risk';
          explanation = smokingStatus === 'current' 
            ? `At ${age} years old, your lungs are showing signs of active damage from smoking. We strongly recommend smoking cessation to prevent further decline.`
            : `As a ${age}-year-old former smoker, your lungs are at increased risk. However, your age means you have excellent recovery potential if you stay smoke-free.`;
        }
        
        if (o.id === 'heart' && bmiCategory === 'obese') {
          status = 'at-risk';
          explanation = `Your BMI of ${bmi?.toFixed(1)} puts extra strain on your heart. At ${age} years old, it's important to focus on heart-healthy habits.`;
        }
        
        return { ...o, status, explanation };
      });

      const mockResponse: ApiAnalysisResponse = {
        organs: mockOrgans,
        conditions: smokingStatus !== 'never' ? ['Smoking-related risks'] : ['No conditions identified'],
        explanation: `Based on your profile as a ${age}-year-old ${gender} ${smokingStatus !== 'never' ? 'with a smoking history' : ''}, your overall health assessment is ${smokingStatus !== 'never' ? 'moderate with some concerns' : 'favorable'}. ${smokingStatus !== 'never' ? 'We recommend regular health screenings and lifestyle optimization.' : 'Continue maintaining your healthy lifestyle.'}`,
        riskFactors: [
          smokingStatus !== 'never' ? `${smokingStatus === 'current' ? 'Active smoking' : 'Former smoking history'}` : 'No significant risks',
          bmiCategory === 'obese' || bmiCategory === 'overweight' ? 'Weight management needed' : 'Maintain healthy weight',
          ageRisk === 'high' ? 'Age-related health monitoring' : 'Good age for preventive care'
        ].filter(Boolean),
        holonReferences: [
          smokingStatus !== 'never' ? 'HOLON: CP-2024-001 - Smoking cessation outcomes' : 'HOLON: CP-2024-002 - Preventive health guidelines',
          'HOLON: R-2341 - Lung function recovery'
        ]
      };
      
      return NextResponse.json(mockResponse);
    }

    // Use the OpenAI client with Groq base URL
    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { 
          role: 'system', 
          content: 'You are a compassionate, personalized health AI assistant. You respond like a caring doctor who speaks directly to the patient, using their age, gender, and specific health data to provide tailored advice. You never use generic responses.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    // Ensure status is properly typed
    const typedResult: ApiAnalysisResponse = {
      organs: result.organs?.map((o: any) => ({
        ...o,
        status: o.status as OrganStatus
      })) || [],
      conditions: result.conditions || [],
      explanation: result.explanation || 'Analysis complete',
      riskFactors: result.riskFactors || [],
      holonReferences: result.holonReferences || []
    };
    
    return NextResponse.json(typedResult);
    
  } catch (error) {
    console.error('Analysis error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze health data';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}