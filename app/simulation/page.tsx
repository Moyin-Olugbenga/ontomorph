'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThreeViewer } from '@/components/ThreeViewer';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { SimulationToggle } from '@/components/SimulationToggle';
import { PDFExport } from '@/components/PDFExport';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Heart, AlertCircle, CheckCircle, Brain, Sparkles } from 'lucide-react';
import { DEFAULT_ORGANS } from '@/lib/organs.config';
import { OrganHealth, PatientProfile } from '@/app/types';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SimulationPage() {
  const router = useRouter();
  const [isSimulated, setIsSimulated] = useState(false);
  const [scenario, setScenario] = useState('quit-smoking');
  const [organs, setOrgans] = useState<OrganHealth[]>(DEFAULT_ORGANS);
  const [selectedOrgan, setSelectedOrgan] = useState<OrganHealth | null>(null);
  const [explanation, setExplanation] = useState('');
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [holonRefs, setHolonRefs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [simulationSummary, setSimulationSummary] = useState('');
  const [animationData, setAnimationData] = useState<{
    organUpdates: Array<{
      organId: string;
      status: string;
      colorHex: string;
      intensity: number;
      animationType: string;
    }>;
    narration: string;
  } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('patientProfile');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProfile(parsed);
      } catch (e) {
        console.error('Failed to parse profile');
        toast.error('Failed to load patient profile');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (profile) {
      runAnalysis();
    }
  }, [profile]);

  useEffect(() => {
    if (isSimulated && profile) {
      runSimulation(scenario);
    } else if (!isSimulated && profile) {
      runAnalysis();
    }
  }, [isSimulated, scenario]);

  const runAnalysis = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      const data = await response.json();
      
      if (response.ok && data.organs) {
        const updatedOrgans: OrganHealth[] = DEFAULT_ORGANS.map(organ => {
          const analyzed = data.organs.find((o: any) => o.id === organ.id);
          return analyzed ? {
            ...organ,
            status: analyzed.status as any,
            explanation: analyzed.explanation
          } : organ;
        });
        setOrgans(updatedOrgans);
        setExplanation(data.explanation || 'Analysis complete');
        setRiskFactors(data.riskFactors || []);
        setHolonRefs(data.holonReferences || ['HOLON: Clinical knowledge integrated']);
        setSimulationSummary('');
        setAnimationData(null);
        
        const firstAffected = updatedOrgans.find(o => o.status !== 'healthy');
        if (firstAffected) {
          setSelectedOrgan(firstAffected);
        }
      } else {
        toast.error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze health data');
    } finally {
      setIsLoading(false);
    }
  };

  const runSimulation = async (scenarioId: string) => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scenario: scenarioId,
          currentState: organs,
          patientProfile: profile
        })
      });

      const data = await response.json();
      
      if (response.ok && data.projectedState) {
        setOrgans(data.projectedState);
        setExplanation(data.summary || 'Simulation complete');
        setRiskFactors(data.riskFactors || ['No risk factors identified']);
        setSimulationSummary(data.summary || '');
        
        if (data.animationData) {
          setAnimationData(data.animationData);
        }
        
        const holonRefs = [
          `HOLON: SIM-001 - ${scenarioId} simulation results`,
          'HOLON: CP-2024-001 - Lifestyle intervention outcomes'
        ];
        if (data.scalarOutputs) {
          holonRefs.push(`HOLON: Projected ${data.scalarOutputs.peak_value}% improvement`);
        }
        setHolonRefs(holonRefs);
        
        if (data.disclaimer) {
          toast.info(data.disclaimer);
        }
        
        const improved = data.projectedState.find((o: OrganHealth) => o.status === 'healthy');
        if (improved) {
          setSelectedOrgan(improved);
        }
      } else {
        toast.error(data.error || 'Simulation failed');
      }
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Failed to run simulation');
    } finally {
      setIsLoading(false);
    }
  };

  const healthStats = {
    healthy: organs.filter(o => o.status === 'healthy').length,
    atRisk: organs.filter(o => o.status === 'at-risk').length,
    affected: organs.filter(o => o.status === 'affected').length
  };

  const overallHealth = organs.every(o => o.status === 'healthy') ? 'Excellent' :
                        organs.some(o => o.status === 'affected') ? 'Needs Attention' :
                        'Moderate';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-500" />
                Health Simulator
              </h1>
              <p className="text-sm text-muted-foreground hidden md:block">
                Powered by Ontomorph HOLON Knowledge Graph
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => runAnalysis()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <PDFExport
              organs={organs}
              patientProfile={profile}
              explanation={explanation}
              riskFactors={riskFactors}
              holonReferences={holonRefs}
              isSimulated={isSimulated}
              scenario={scenario}
              simulationSummary={simulationSummary}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Overall Health</p>
            <p className="text-lg font-bold flex items-center gap-1">
              {overallHealth === 'Excellent' && <CheckCircle className="w-4 h-4 text-green-500" />}
              {overallHealth === 'Needs Attention' && <AlertCircle className="w-4 h-4 text-red-500" />}
              {overallHealth === 'Moderate' && <Heart className="w-4 h-4 text-orange-500" />}
              {overallHealth}
            </p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Healthy Organs</p>
            <p className="text-lg font-bold text-green-500">{healthStats.healthy}/{organs.length}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">At Risk</p>
            <p className="text-lg font-bold text-orange-500">{healthStats.atRisk}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Affected</p>
            <p className="text-lg font-bold text-red-500">{healthStats.affected}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 h-[500px] md:h-[600px]">
            <ThreeViewer 
              organs={organs} 
              onOrganClick={setSelectedOrgan}
              animationData={animationData}
              isSimulated={isSimulated}
            />
          </div>

          <div className="lg:col-span-1">
            <ExplanationPanel
              selectedOrgan={selectedOrgan}
              explanation={explanation}
              riskFactors={riskFactors}
              holonReferences={holonRefs}
              isSimulated={isSimulated}
            />
          </div>
        </div>

        <div className="mt-2">
          <SimulationToggle
            isSimulated={isSimulated}
            onToggle={() => setIsSimulated(!isSimulated)}
            scenario={scenario}
            onScenarioChange={setScenario}
          />
        </div>

        {profile && (
          <Card className="p-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <span><strong>Age:</strong> {profile.age}</span>
              <span><strong>Gender:</strong> {profile.gender}</span>
              <span><strong>Smoking:</strong> {profile.smokingStatus}</span>
              <span><strong>BMI:</strong> {(profile.weight / ((profile.height/100) ** 2)).toFixed(1)}</span>
              {profile.additionalSymptoms && (
                <span><strong>Symptoms:</strong> {profile.additionalSymptoms}</span>
              )}
              {(profile as any).labResults && (
                <span><strong>Lab Report:</strong> Uploaded ✓</span>
              )}
            </div>
          </Card>
        )}

        <Card className="p-3 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="font-medium">HOLON Clinical Knowledge:</span>
            <span className="text-muted-foreground text-xs">
              {holonRefs.length > 0 ? `${holonRefs.length} references integrated` : 'No references yet'}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}