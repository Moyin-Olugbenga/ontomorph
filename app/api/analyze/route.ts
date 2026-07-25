import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getHOLONConcept, getReferenceRanges } from '@/lib/ontomorphClient';
import { ApiAnalysisResponse, OrganStatus } from '@/app/types';
import { DEFAULT_ORGANS } from '@/lib/organs.config';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symptoms, age, gender, smokingStatus, weight, height } = body;

    let holonContext = '';
    let smokingConcepts: any[] = [];

    try {
      const smokingCodePromises = ['449868002', '13645005', '254626007'].map(code =>
        getHOLONConcept(code, 'SNOMED')
      );
      smokingConcepts = (await Promise.all(smokingCodePromises)).filter(c => c);
      
      holonContext = `
        HOLON Clinical Reference Data:
        ${smokingConcepts.map(c => 
          `- ${c.concept.term} (ID: ${c.concept.conceptId})`
        ).join('\n')}
      `;
    } catch (error) {
      console.error('HOLON data fetch error:', error);
    }

    const bmi = height ? (weight / ((height/100) ** 2)) : null;

    const prompt = `
      You are a compassionate, personalized health AI assistant grounded in HOLON clinical knowledge.

      Patient Data:
      - Age: ${age} years old
      - Gender: ${gender}
      - BMI: ${bmi ? bmi.toFixed(1) : 'Unknown'}
      - Smoking Status: ${smokingStatus}
      - Weight: ${weight}kg
      - Height: ${height}cm
      ${symptoms ? `- Symptoms: ${symptoms}` : '- No symptoms reported'}

      ${holonContext || 'Use general clinical knowledge.'}

      Based on this patient's specific profile, provide:
      1. Organ-specific analysis (lungs, heart, liver, kidneys, brain, stomach, intestines, spine)
      2. Specific health conditions this patient may be at risk for
      3. A comprehensive, personalized health assessment
      4. Personalized risk factors with context
      5. HOLON clinical references

      Return ONLY valid JSON with this exact structure:
      {
        "organs": [
          {
            "id": "lungs",
            "status": "healthy|at-risk|affected",
            "explanation": "Personalized explanation"
          }
        ],
        "conditions": ["condition1", "condition2"],
        "explanation": "Comprehensive health assessment summary",
        "riskFactors": ["factor1", "factor2"],
        "holonReferences": ["HOLON: CONCEPT_ID - Description"]
      }
    `;

    if (!process.env.GROQ_API_KEY) {
      const mockOrgans = DEFAULT_ORGANS.map(o => ({
        ...o,
        status: o.id === 'lungs' && smokingStatus !== 'never' ? 'at-risk' : 'healthy' as OrganStatus,
        explanation: o.id === 'lungs' && smokingStatus !== 'never'
          ? `HOLON reference indicates elevated risk at age ${age}.`
          : `${o.name} function appears normal.`
      }));

      return NextResponse.json({
        organs: mockOrgans,
        conditions: smokingStatus !== 'never' ? ['Smoking-related risk identified'] : ['No conditions identified'],
        explanation: `Health assessment grounded in HOLON clinical knowledge. ${smokingStatus !== 'never' ? 'Smoking history suggests preventive screening.' : 'All health markers within normal ranges.'}`,
        riskFactors: smokingStatus !== 'never' ? ['Smoking history'] : ['No significant risk factors identified'],
        holonReferences: smokingConcepts.map(c => `HOLON: ${c.concept.conceptId} - ${c.concept.term}`)
      } as ApiAnalysisResponse);
    }

    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { 
          role: 'system', 
          content: 'You are a compassionate, personalized health AI assistant grounded in HOLON clinical knowledge.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    const typedResult: ApiAnalysisResponse = {
      organs: result.organs?.map((o: any) => ({
        ...o,
        status: o.status as OrganStatus
      })) || DEFAULT_ORGANS.map(o => ({ ...o, status: 'healthy' as OrganStatus })),
      conditions: result.conditions || [],
      explanation: result.explanation || 'Analysis complete',
      riskFactors: result.riskFactors || [],
      holonReferences: result.holonReferences || smokingConcepts.map(c => 
        `HOLON: ${c.concept.conceptId} - ${c.concept.term}`
      )
    };
    
    return NextResponse.json(typedResult);
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze health data' },
      { status: 500 }
    );
  }
}