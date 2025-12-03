import React, { ChangeEvent } from 'react';
import { UploadCloud, FileType } from 'lucide-react';

interface TemplateUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

const TemplateUploader: React.FC<TemplateUploaderProps> = ({ onFileSelect, selectedFile }) => {
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center text-sm pt-1">۱</span>
        آپلود قالب گزارش
      </h2>
      <p className="text-gray-500 mb-6 text-sm">
        لطفاً یک نمونه فایل خام گزارش (PDF) را آپلود کنید تا هوش مصنوعی ساختار آن را یاد بگیرد.
      </p>

      <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors p-10 flex flex-col items-center justify-center text-center cursor-pointer group">
        <input 
          type="file" 
          accept="application/pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {selectedFile ? (
          <div className="flex flex-col items-center animate-bounce-short">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-3">
              <FileType size={32} />
            </div>
            <p className="text-teal-700 font-medium text-lg">{selectedFile.name}</p>
            <p className="text-gray-400 text-sm mt-1">{(selectedFile.size / 1024).toFixed(0)} کیلوبایت</p>
            <span className="mt-4 text-xs text-teal-600 font-semibold bg-teal-50 px-3 py-1 rounded-full">
              برای تغییر فایل کلیک کنید
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-gray-300 transition-colors">
              <UploadCloud size={32} />
            </div>
            <p className="text-gray-700 font-medium">برای انتخاب فایل PDF کلیک کنید</p>
            <p className="text-gray-400 text-xs mt-2">فرمت پشتیبانی شده: PDF</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateUploader;