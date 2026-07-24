'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Heart, Activity, Zap } from 'lucide-react';

interface SimulationToggleProps {
  isSimulated: boolean;
  onToggle: () => void;
  scenario: string;
  onScenarioChange: (scenario: string) => void;
}

const SCENARIOS = [
  { id: 'quit-smoking', label: 'Quit Smoking', icon: Brain, color: 'blue' },
  { id: 'lose-weight', label: 'Lose 10kg', icon: Heart, color: 'green' },
  { id: 'exercise', label: 'Start Exercise', icon: Activity, color: 'purple' },
  { id: 'sleep', label: 'Better Sleep', icon: Zap, color: 'orange' }
];

export function SimulationToggle({ 
  isSimulated, 
  onToggle, 
  scenario, 
  onScenarioChange 
}: SimulationToggleProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Switch
                checked={isSimulated}
                onCheckedChange={onToggle}
                id="simulation-mode"
              />
              <Label htmlFor="simulation-mode" className="font-semibold">
                {isSimulated ? '🔮 Projected Health' : '📊 Current Health'}
              </Label>
            </div>
            <div className="text-sm text-muted-foreground">
              {isSimulated ? 'Simulation Active' : 'Viewing Current State'}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map((s) => {
              const Icon = s.icon;
              const isActive = scenario === s.id && isSimulated;
              return (
                <Button
                  key={s.id}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onScenarioChange(s.id)}
                  className={`gap-2 ${
                    isActive ? `bg-${s.color}-500 hover:bg-${s.color}-600` : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                </Button>
              );
            })}
          </div>
        </div>
        
        {isSimulated && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ⚕️ <span className="font-medium">Simulation active:</span> Projected health improvements based on{' '}
              {SCENARIOS.find(s => s.id === scenario)?.label.toLowerCase()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}