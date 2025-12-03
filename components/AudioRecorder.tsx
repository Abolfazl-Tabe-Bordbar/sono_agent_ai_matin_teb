import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, Play, Pause, Trash2, FileAudio } from 'lucide-react';
import { AudioState } from '../types';

interface AudioRecorderProps {
  audioState: AudioState;
  setAudioState: (state: AudioState) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ audioState, setAudioState }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (audioState.url) {
        URL.revokeObjectURL(audioState.url);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioState({
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime,
        });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("دسترسی به میکروفون برای ضبط صدا الزامی است.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setAudioState({
        blob: file,
        url: url,
        duration: 0, // Unknown duration for upload without loading it
      });
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioState.url) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const resetAudio = () => {
    setAudioState({ blob: null, url: null, duration: 0 });
    setIsPlaying(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center text-sm pt-1">۲</span>
        دیکته پزشک
      </h2>
      <p className="text-gray-500 mb-6 text-sm">
        صدای خود را ضبط کنید یا یک فایل صوتی حاوی اطلاعات بیمار را بارگذاری نمایید.
      </p>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('record')}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'record' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          ضبط صدا
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'upload' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          آپلود فایل صوتی
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {!audioState.blob ? (
          activeTab === 'record' ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className={`relative mb-6 ${isRecording ? 'animate-pulse' : ''}`}>
                 <div className={`absolute inset-0 rounded-full bg-teal-200 opacity-20 transform scale-150 ${isRecording ? 'block' : 'hidden'}`}></div>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`
                    w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105
                    ${isRecording ? 'bg-red-500 text-white' : 'bg-teal-600 text-white'}
                  `}
                >
                  {isRecording ? <Square size={28} fill="currentColor" /> : <Mic size={32} />}
                </button>
              </div>
              <p className="text-lg font-medium text-gray-700 mb-1">
                {isRecording ? 'در حال ضبط...' : 'برای ضبط کلیک کنید'}
              </p>
              {isRecording && (
                <p className="text-red-500 font-mono text-xl" dir="ltr">{formatTime(recordingTime)}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <label className="cursor-pointer flex flex-col items-center">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 font-medium">برای انتخاب فایل صوتی کلیک کنید</span>
                <span className="text-xs text-gray-400 mt-1">MP3, WAV, M4A, WEBM</span>
                <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )
        ) : (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
             <audio 
                ref={audioPlayerRef} 
                src={audioState.url!} 
                onEnded={() => setIsPlaying(false)}
                className="hidden" 
             />
             
             <div className="flex items-center gap-4">
               <button 
                onClick={togglePlayback}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 text-teal-600 hover:bg-teal-50 transition-colors"
               >
                 {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="mr-0.5" />}
               </button>
               <div>
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <FileAudio size={16} className="text-teal-500"/> 
                    {activeTab === 'record' ? 'صدای ضبط شده' : 'فایل آپلود شده'}
                  </h3>
                  <p className="text-xs text-gray-500" dir="ltr">
                    {activeTab === 'record' ? formatTime(audioState.duration) : 'آماده پردازش'}
                  </p>
               </div>
             </div>

             <button 
              onClick={resetAudio}
              className="text-gray-400 hover:text-red-500 p-2 transition-colors"
              title="حذف و تلاش مجدد"
             >
               <Trash2 size={20} />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;