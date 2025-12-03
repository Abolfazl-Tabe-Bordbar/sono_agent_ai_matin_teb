import React from 'react';
import { Download, Copy, RefreshCw, FileText, Cpu } from 'lucide-react';
import { ReportResult } from '../types';

interface ReportPreviewProps {
  reportData: ReportResult;
  onReset: () => void;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ reportData, onReset }) => {
  const handleCopy = () => {
    // Copying HTML text content to clipboard
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = reportData.html;
    navigator.clipboard.writeText(tempDiv.textContent || "");
    alert('متن گزارش در کلیپ‌بورد کپی شد!');
  };

  const handleDownload = () => {
    // Create a Blob that Word can open (HTML disguised as .doc)
    // We add a standard HTML/Body wrapper for the file context with RTL support
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40' dir='rtl'>
      <head>
        <meta charset='utf-8'>
        <title>گزارش پزشکی</title>
        <style>
          body { font-family: 'Vazirmatn', 'Tahoma', sans-serif; text-align: right; }
          table { border-collapse: collapse; width: 100%; direction: rtl; }
          td, th { border: 1px solid #000; padding: 8px; text-align: right; }
        </style>
      </head>
      <body>`;
    const footer = "</body></html>";
    
    const sourceHTML = header + reportData.html + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Medical_Report.doc'; // .doc extension opens in Word
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full animate-fade-in">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center text-sm pt-1">۳</span>
            گزارش تولید شده
          </h2>
          {reportData.tokenUsage > 0 && (
            <div className="flex items-center gap-1.5 mt-1 mr-10 text-xs text-gray-500">
              <Cpu size={12} />
              <span>توکن مصرف شده: <span className="font-mono font-medium">{reportData.tokenUsage.toLocaleString()}</span></span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 self-end md:self-auto">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Copy size={14} /> کپی متن
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download size={14} /> دانلود فایل Word
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center gap-2">
            <FileText size={16} className="text-gray-500"/>
            <span className="text-sm font-medium text-gray-600">پیش‌نمایش (ساختار ظاهری)</span>
        </div>
        
        {/* HTML Render Container - Explicitly setting color to black to avoid 'white text' issue */}
        <div className="p-8 max-h-[600px] overflow-y-auto custom-scrollbar bg-white text-black">
          <div 
            className="all-initial font-serif text-black"
            style={{ color: '#000000' }}
            dangerouslySetInnerHTML={{ __html: reportData.html }} 
          />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors"
        >
          <RefreshCw size={16} /> ایجاد گزارش جدید
        </button>
      </div>
    </div>
  );
};

export default ReportPreview;