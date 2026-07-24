import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { OrganHealth, PatientProfile } from '@/app/types';
import { ORGAN_STATUS_COLORS } from '@/lib/organs.config';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helvetica/v1/helvetica.woff2', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/helvetica/v1/helvetica-bold.woff2', fontWeight: 'bold' }
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #2563eb',
    paddingBottom: 20,
    marginBottom: 30
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a2a4a'
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a2a4a',
    marginBottom: 10,
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 5
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6
  },
  label: {
    fontSize: 11,
    color: '#64748b',
    width: 120
  },
  value: {
    fontSize: 11,
    color: '#1a2a4a',
    flex: 1
  },
  organGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10
  },
  organItem: {
    width: '48%',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    marginBottom: 8
  },
  organName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4
  },
  organStatus: {
    fontSize: 10,
    marginBottom: 4
  },
  organExplanation: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.4
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 9,
    fontWeight: 'bold',
    display: 'flex',
    marginBottom: 4
  },
  riskFactors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6
  },
  riskTag: {
    backgroundColor: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 9,
    color: '#475569'
  },
  holonRef: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
    paddingLeft: 12
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#94a3b8'
  },
  disclaimer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 4,
    fontSize: 9,
    color: '#dc2626',
    borderWidth: 1,
    borderColor: '#fee2e2'
  },
  simulationBadge: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 'bold',
    display: 'flex'
  }
});

interface PDFDocumentProps {
  patientProfile: PatientProfile;
  organs: OrganHealth[];
  explanation: string;
  riskFactors: string[];
  holonReferences: string[];
  isSimulated: boolean;
  scenario: string;
  simulationSummary?: string;
}

export function PDFDocument({
  patientProfile,
  organs,
  explanation,
  riskFactors,
  holonReferences,
  isSimulated,
  scenario,
  simulationSummary
}: PDFDocumentProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#22c55e';
      case 'at-risk': return '#f59e0b';
      case 'affected': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'healthy': return '✅ Healthy';
      case 'at-risk': return '⚠️ At Risk';
      case 'affected': return '❌ Affected';
      default: return status;
    }
  };

  const scenarioLabels: Record<string, string> = {
    'quit-smoking': 'Quit Smoking',
    'lose-weight': 'Lose 10kg',
    'exercise': 'Start Exercise',
    'sleep': 'Better Sleep'
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Health Assessment Report</Text>
            <Text style={styles.subtitle}>Powered by Ontomorph HOLON Knowledge Graph</Text>
          </View>
          <View>
            {isSimulated && (
              <Text style={styles.simulationBadge}>🔬 Projected Health</Text>
            )}
          </View>
        </View>

        {/* Patient Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Age:</Text>
            <Text style={styles.value}>{patientProfile.age} years</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{patientProfile.gender}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Smoking Status:</Text>
            <Text style={styles.value}>{patientProfile.smokingStatus}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>BMI:</Text>
            <Text style={styles.value}>
              {(patientProfile.weight / ((patientProfile.height/100) ** 2)).toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Organ Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organ Health Assessment</Text>
          <View style={styles.organGrid}>
            {organs.map((organ) => (
              <View key={organ.id} style={styles.organItem}>
                <Text style={styles.organName}>{organ.name}</Text>
                <Text style={[styles.organStatus, { color: getStatusColor(organ.status) }]}>
                  {getStatusLabel(organ.status)}
                </Text>
                <Text style={styles.organExplanation}>{organ.explanation}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Analysis */}
        {explanation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Health Analysis</Text>
            <Text style={styles.value}>{explanation}</Text>
          </View>
        )}

        {/* Risk Factors */}
        {riskFactors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risk Factors</Text>
            <View style={styles.riskFactors}>
              {riskFactors.map((factor, index) => (
                <Text key={index} style={styles.riskTag}>{factor}</Text>
              ))}
            </View>
          </View>
        )}

        {/* HOLON References */}
        {holonReferences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Clinical References (HOLON)</Text>
            {holonReferences.map((ref, index) => (
              <Text key={index} style={styles.holonRef}>• {ref}</Text>
            ))}
          </View>
        )}

        {/* Simulation Summary */}
        {isSimulated && simulationSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Simulation: {scenarioLabels[scenario] || scenario}</Text>
            <Text style={styles.value}>{simulationSummary}</Text>
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text>⚠️ Disclaimer: This is an AI-generated health assessment based on provided data. It is not a medical diagnosis and should not replace professional medical advice. Always consult with a qualified healthcare provider.</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleDateString()}</Text>
          <Text>© {new Date().getFullYear()} Ontomorph Health Simulator</Text>
        </View>
      </Page>
    </Document>
  );
}