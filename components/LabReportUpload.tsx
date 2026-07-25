'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LabReportUploadProps {
  onReportProcessed: (data: any) => void;
}

export function LabReportUpload({ onReportProcessed }: LabReportUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PDF or image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setFile(file);
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      const mockLabData = {
        patientName: "Patient",
        testDate: new Date().toISOString().split('T')[0],
        results: {
          hemoglobin: { value: 14.2, unit: 'g/dL', range: '12.0-16.0', status: 'normal' },
          glucose: { value: 95, unit: 'mg/dL', range: '70-100', status: 'normal' },
          cholesterol: { value: 210, unit: 'mg/dL', range: '125-200', status: 'high' },
          ldl: { value: 135, unit: 'mg/dL', range: '0-100', status: 'high' }
        },
        summary: "Lab results show elevated cholesterol and LDL levels. Other markers are within normal range."
      };

      onReportProcessed(mockLabData);
      toast.success('Lab report processed successfully!');
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process lab report');
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Upload Lab Report
        </CardTitle>
        <CardDescription>
          Upload a PDF or image of your lab results for automated analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-500 font-medium">Drop your lab report here...</p>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Drag & drop your lab report
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  or click to browse files
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports PDF, PNG, JPG (max 5MB)
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Processing...</span>
                  <span className="text-gray-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadProgress === 100 && !isUploading && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Report processed successfully!</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}