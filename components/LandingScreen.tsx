'use client';

import React, { useState } from 'react';
import { Activity, FileText, Stethoscope, Upload, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { parseLabFile } from '@/lib/labParser';

interface LandingScreenProps {
  onAnalysisComplete: (sessionData: {
    sessionId: string;
    highlightedOrgans: any[];
    aiAnalysis: any;
  }) => void;
}

export default function LandingScreen({ onAnalysisComplete }: LandingScreenProps) {
  const [activeTab, setActiveTab] = useState<'TEXT' | 'LAB_REPORT'>('TEXT');
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick preset symptom buttons for quick testing
  const PRESETS = [
    {
      label: 'Jaundice & Fatigue',
      text: 'Experiencing severe fatigue, jaundice, upper right quadrant abdominal pain, and dark urine for 3 days.',
    },
    {
      label: 'Chest Pressure & Shortness of Breath',
      text: 'Sharp chest pain worsening on deep breath, mild shortness of breath, and mild dizziness after exertion.',
    },
    {
      label: 'Flank Pain & Dysuria',
      text: 'Severe right flank pain radiating to lower abdomen, accompanied by dysuria, fever, and nausea.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let rawInputText = inputText;

    if (activeTab === 'LAB_REPORT') {
      if (!file) {
        setError('Please select a lab report file to upload.');
        return;
      }
      try {
        rawInputText = await parseLabFile(file);
      } catch (err) {
        setError('Failed to read the lab report file. Try pasting the text instead.');
        return;
      }
    }

    if (!rawInputText.trim()) {
      setError('Please provide symptoms or upload a valid lab report.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/twin/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputMode: activeTab,
          rawInputText,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to analyze symptoms');
      }

      const data = await res.json();
      onAnalysisComplete(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
      {/* Header Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-medium mb-6">
        <Sparkles className="w-3.5 h-3.5" />
        Powered by Ontomorph Digital Twin & HOLON Clinical Graph
      </div>

      <div className="max-w-2xl w-full text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
          Symptom-to-Anatomy AI
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Describe your symptoms in plain language or upload lab results. Our AI maps your clinical profile onto an interactive 3D digital twin body grounded in 5.3M+ medical concepts.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Input Mode Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('TEXT');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'TEXT'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            Describe Symptoms
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('LAB_REPORT');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'LAB_REPORT'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Upload Lab Report
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {activeTab === 'TEXT' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Plain-Language Symptoms
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. For the past two days I've felt severe nausea, yellowing eyes, right upper stomach pain, and extreme tiredness..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm resize-none"
              />

              {/* Quick Presets */}
              <div className="mt-3">
                <span className="text-xs text-slate-500 block mb-2">Or try a test scenario:</span>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInputText(preset.text)}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Sample Lab Report (.txt / .csv / text PDF)
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-8 text-center bg-slate-950 transition-colors">
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                <p className="text-sm text-slate-300 mb-1">
                  {file ? file.name : 'Click or drag lab report file here'}
                </p>
                <p className="text-xs text-slate-500 mb-4">Supports plain text or exported lab summaries</p>
                <input
                  type="file"
                  accept=".txt,.csv,.json"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="lab-file-input"
                />
                <label
                  htmlFor="lab-file-input"
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer border border-slate-700 transition-colors"
                >
                  Choose File
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-red-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-950/50 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Digital Twin & Mapping Anatomy...
              </>
            ) : (
              <>
                Generate 3D Digital Twin
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Disclaimers Footer */}
      <p className="text-xs text-slate-600 max-w-lg text-center mt-8">
        ⚠️ <strong>Medical Disclaimer:</strong> This application is a hackathon demonstration built on Ontomorph platform APIs for educational and visual exploration only. It does not provide medical diagnoses or medical advice.
      </p>
    </div>
  );
}