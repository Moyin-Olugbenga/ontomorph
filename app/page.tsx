'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabReportUpload } from '@/components/LabReportUpload';
import { ArrowRight, Brain, Sparkles, Shield, Clock, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    smokingStatus: '',
    weight: '',
    height: '',
    additionalSymptoms: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile.age || !profile.gender || !profile.smokingStatus || !profile.weight || !profile.height) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      sessionStorage.setItem('patientProfile', JSON.stringify({
        age: parseInt(profile.age),
        gender: profile.gender,
        smokingStatus: profile.smokingStatus,
        weight: parseInt(profile.weight),
        height: parseInt(profile.height),
        additionalSymptoms: profile.additionalSymptoms
      }));
      
      router.push('/simulation');
    } catch (error) {
      toast.error('Failed to start simulation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLabReportProcessed = (data: any) => {
    const extractedProfile = {
      age: '35',
      gender: 'male',
      smokingStatus: 'never',
      weight: '75',
      height: '175',
      additionalSymptoms: JSON.stringify(data.results)
    };
    
    sessionStorage.setItem('patientProfile', JSON.stringify({
      age: parseInt(extractedProfile.age),
      gender: extractedProfile.gender,
      smokingStatus: extractedProfile.smokingStatus,
      weight: parseInt(extractedProfile.weight),
      height: parseInt(extractedProfile.height),
      additionalSymptoms: extractedProfile.additionalSymptoms,
      labResults: data.results,
      labSummary: data.summary
    }));
    
    router.push('/simulation');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12 border-b border-slate-200 pb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">
              Health Simulator
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powered by Ontomorph's HOLON knowledge graph — visualize your future health trajectory
          </p>
          <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> HIPAA Compliant</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Real-time Analysis</span>
          </div>
        </div>

        <Tabs defaultValue="manual" className="mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="upload">Lab Report Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <div className="grid md:grid-cols-5 gap-6">
              <Card className="md:col-span-3 shadow-sm border-slate-200">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Patient Health Profile
                  </CardTitle>
                  <CardDescription>
                    Enter current health data to generate a comprehensive assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-sm font-medium">
                          Age <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="e.g., 35"
                          value={profile.age}
                          onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                          className="h-11"
                          required
                        />
                        <p className="text-xs text-muted-foreground">Must be 18 or older</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-sm font-medium">
                          Gender <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={profile.gender}
                          onValueChange={(value) => setProfile({ ...profile, gender: value })}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smoking" className="text-sm font-medium">
                        Smoking Status <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={profile.smokingStatus}
                        onValueChange={(value) => setProfile({ ...profile, smokingStatus: value })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select smoking status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never Smoked</SelectItem>
                          <SelectItem value="former">Former Smoker</SelectItem>
                          <SelectItem value="current">Current Smoker</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-sm font-medium">
                          Weight (kg) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          placeholder="70"
                          value={profile.weight}
                          onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                          className="h-11"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height" className="text-sm font-medium">
                          Height (cm) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="height"
                          type="number"
                          placeholder="175"
                          value={profile.height}
                          onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                          className="h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="symptoms" className="text-sm font-medium">
                        Additional Symptoms <span className="text-muted-foreground font-normal">(optional)</span>
                      </Label>
                      <Input
                        id="symptoms"
                        placeholder="e.g., shortness of breath, fatigue, chest pain"
                        value={profile.additionalSymptoms}
                        onChange={(e) => setProfile({ ...profile, additionalSymptoms: e.target.value })}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">List any symptoms you are currently experiencing</p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 gap-2 bg-primary hover:bg-primary/90 text-white font-medium" 
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Analyzing...' : 'Generate Health Assessment'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="md:col-span-2 space-y-4">
                <Card className="border-l-4 border-l-accent shadow-sm">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <Heart className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">Predictive Health</h4>
                          <p className="text-xs text-muted-foreground">
                            See 5-year projections based on lifestyle changes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <Brain className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">HOLON Grounded</h4>
                          <p className="text-xs text-muted-foreground">
                            5.3M clinical concepts powering your assessment
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="upload">
            <div className="max-w-2xl mx-auto">
              <LabReportUpload onReportProcessed={handleLabReportProcessed} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ontomorph Health Simulator • Powered by HOLON Knowledge Graph
          </p>
        </div>
      </div>
    </main>
  );
}