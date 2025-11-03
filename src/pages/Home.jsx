import { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import ChatArea from '../components/Chat/ChatArea.jsx';
import PDFUpload from '../components/Chat/PDFUpload.jsx';
import { pdfAPI } from '../services/api.js';

export default function Home() {
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const handleUploadComplete = async (file) => {
    try {
      const response = await pdfAPI.upload(file);
      const newFile = response.data;
      setSelectedPDF(newFile);
      setShowUpload(false);

      window.location.reload();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleSelectPDF = (pdf) => {
    setSelectedPDF(pdf);
    setShowUpload(false);
  };

  const handleUploadTrigger = (file) => {
    handleUploadComplete(file);
  };

  return (
    <div className="flex h-screen bg-[#0d0d0d]">
      <Sidebar 
        onSelectPDF={handleSelectPDF}
        selectedPDF={selectedPDF}
        onUploadComplete={handleUploadTrigger}
      />
      
      {showUpload ? (
        <PDFUpload onUploadComplete={handleUploadComplete} />
      ) : (
        <ChatArea selectedPDF={selectedPDF} />
      )}
    </div>
  );
}