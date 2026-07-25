'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrganHealth } from '@/app/types';
import { ORGAN_STATUS_LABELS } from '@/lib/organs.config';

interface ExplanationPanelProps {
  selectedOrgan: OrganHealth | null;
  explanation: string;
  riskFactors: string[];
  holonReferences: string[];
  isSimulated?: boolean;
}

export function ExplanationPanel({ 
  selectedOrgan, 
  explanation, 
  riskFactors,
  holonReferences,
  isSimulated = false
}: ExplanationPanelProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Health Assessment</span>
            {isSimulated && (
              <Badge variant="default" className="bg-blue-500">
                🔬 Projected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedOrgan ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{selectedOrgan.name}</h4>
                  <Badge 
                    variant={
                      selectedOrgan.status === 'healthy' ? 'default' : 
                      selectedOrgan.status === 'at-risk' ? 'secondary' : 
                      'destructive'
                    }
                    className={
                      selectedOrgan.status === 'healthy' ? 'bg-green-500 hover:bg-green-600' :
                      selectedOrgan.status === 'at-risk' ? 'bg-orange-500 hover:bg-orange-600' :
                      'bg-red-500 hover:bg-red-600'
                    }
                  >
                    {ORGAN_STATUS_LABELS[selectedOrgan.status]}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {isSimulated ? '📈 Projected' : '📊 Current'}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{selectedOrgan.explanation}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              👆 Click on an organ to see detailed health assessment
            </p>
          )}
          
          {explanation && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-1">AI Analysis</h4>
              <p className="text-sm">{explanation}</p>
            </div>
          )}
          
          {riskFactors.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                ⚠️ Risk Factors
              </h4>
              <div className="flex flex-wrap gap-2">
                {riskFactors.map((factor, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {holonReferences.length > 0 && (
            <div className="border-t pt-3 mt-3">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                📚 HOLON Clinical References
              </h4>
              <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                {holonReferences.map((ref, index) => (
                  <li key={index}>{ref}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}