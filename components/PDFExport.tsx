'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { OrganHealth, PatientProfile } from '@/app/types';
import { toast } from 'sonner';
import { PDFDocument } from './PDFDocument';

interface PDFExportProps {
  organs: OrganHealth[];
  patientProfile: PatientProfile | null;
  explanation: string;
  riskFactors: string[];
  holonReferences: string[];
  isSimulated: boolean;
  scenario: string;
  simulationSummary?: string;
}

export function PDFExport({
  organs,
  patientProfile,
  explanation,
  riskFactors,
  holonReferences,
  isSimulated,
  scenario,
  simulationSummary
}: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!patientProfile) {
      toast.error('No patient data available');
      return;
    }

    setIsGenerating(true);
    try {
      // Import dynamically to avoid SSR issues
      const { pdf } = await import('@react-pdf/renderer');
      
      // Create PDF document
      const doc = PDFDocument({
        patientProfile,
        organs,
        explanation,
        riskFactors,
        holonReferences,
        isSimulated,
        scenario,
        simulationSummary
      });

      // Generate PDF blob
      const blob = await pdf(doc).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      className="gap-2"
      variant="default"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export Report
        </>
      )}
    </Button>
  );
}