import { AlertCircle, Loader2, Stethoscope } from 'lucide-react';
import { AppStep, AudioState, ReportResult } from './types';
import React, { useState } from 'react';

import AudioRecorder from './components/AudioRecorder';
import ReportPreview from './components/ReportPreview';
import StepIndicator from './components/StepIndicator';
import TemplateUploader from './components/TemplateUploader';
import { generateMedicalReport } from './services/geminiService';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD_TEMPLATE);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({ blob: null, url: null, duration: 0 });
  const [reportData, setReportData] = useState<ReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!templateFile || !audioState.blob) {
      setError("لطفاً هم فایل قالب و هم فایل صوتی را وارد کنید.");
      return;
    }

    setCurrentStep(AppStep.PROCESSING);
    setError(null);

    try {
      const result = await generateMedicalReport(templateFile, audioState.blob);
      setReportData(result);
      setCurrentStep(AppStep.RESULT);
    } catch (err: any) {
      setError(err.message || "خطایی در تولید گزارش رخ داد. لطفاً مجدداً تلاش کنید.");
      setCurrentStep(AppStep.RECORD_AUDIO); // Go back one step
    }
  };

  const resetApp = () => {
    setCurrentStep(AppStep.UPLOAD_TEMPLATE);
    setTemplateFile(null);
    setAudioState({ blob: null, url: null, duration: 0 });
    setReportData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-[Vazirmatn]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className=" p-2 rounded-lg text-white">
              <img src="/MT-icon.svg" className="w-12  h-12" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">متین طب</h1>
              <p className="text-xs text-gray-500">سیستم هوشمند گزارش‌دهی پزشکی</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full border border-teal-100 flex items-center gap-1">
              <span>مدل:</span>
              <span dir="ltr">Matin Teb Ai</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <StepIndicator currentStep={currentStep} />

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-red-700 text-sm">خطا</h4>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 transition-all duration-300">
          
          {currentStep === AppStep.UPLOAD_TEMPLATE && (
            <div className="space-y-6">
              <TemplateUploader 
                selectedFile={templateFile} 
                onFileSelect={(file) => setTemplateFile(file)} 
              />
              <div className="flex justify-end pt-4">
                <button
                  disabled={!templateFile}
                  onClick={() => setCurrentStep(AppStep.RECORD_AUDIO)}
                  className={`
                    px-6 py-3 rounded-lg font-medium text-sm transition-all
                    ${templateFile 
                      ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                  `}
                >
                  مرحله بعد
                </button>
              </div>
            </div>
          )}

          {currentStep === AppStep.RECORD_AUDIO && (
            <div className="space-y-6">
              <AudioRecorder 
                audioState={audioState} 
                setAudioState={setAudioState} 
              />
              <div className="flex justify-between pt-4 border-t border-gray-100 mt-8">
                <button
                  onClick={() => setCurrentStep(AppStep.UPLOAD_TEMPLATE)}
                  className="text-gray-500 hover:text-gray-800 font-medium text-sm px-4 py-2"
                >
                  بازگشت
                </button>
                <button
                  disabled={!audioState.blob}
                  onClick={handleGenerate}
                  className={`
                    px-6 py-3 rounded-lg font-medium text-sm flex items-center gap-2 transition-all
                    ${audioState.blob 
                      ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                  `}
                >
                  تولید گزارش
                </button>
              </div>
            </div>
          )}

          {currentStep === AppStep.PROCESSING && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-white p-4 rounded-full shadow-md">
                  <Loader2 className="animate-spin text-teal-600" size={48} />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">در حال پردازش</h3>
              <p className="text-gray-500 max-w-sm">
                هوش مصنوعی در حال گوش دادن به دیکته و قالب‌بندی گزارش بر اساس فایل شماست...
              </p>
            </div>
          )}

          {currentStep === AppStep.RESULT && reportData && (
            <ReportPreview reportData={reportData} onReset={resetApp} />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;