import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { pdfAPI } from '../../services/api.js';

export default function PDFUpload({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      await uploadFile(file);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    setError('');
    setUploading(true);

    try {
      const response = await pdfAPI.upload(file);
      onUploadComplete(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
            isDragging
              ? 'border-white bg-[#1a1a1a]'
              : 'border-[#2a2a2a] hover:border-[#404040] hover:bg-[#1a1a1a]'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
              <p className="text-white font-medium">Uploading & indexing...</p>
              <p className="text-gray-400 text-sm">This may take a moment</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              
              <div>
                <p className="text-white font-medium mb-2">
                  Drop your PDF here
                </p>
                <p className="text-gray-400 text-sm">
                  or click to browse
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 text-sm flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Upload a PDF to start asking questions
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}