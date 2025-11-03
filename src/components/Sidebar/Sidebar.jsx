import { useState, useEffect } from 'react';
import { FileText, LogOut, Upload, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { pdfAPI } from '../../services/api.js';

export default function Sidebar({ onSelectPDF, selectedPDF, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await pdfAPI.list();
      setFiles(response.data.files);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this PDF?')) return;

    try {
      await pdfAPI.delete(fileId);
      setFiles(files.filter(f => f.file_id !== fileId));
      if (selectedPDF?.file_id === fileId) {
        onSelectPDF(null);
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleNewConversation = async (fileId, e) => {
    e.stopPropagation();
    try {
      await pdfAPI.newConversation(fileId);
      const file = files.find(f => f.file_id === fileId);
      onSelectPDF({ ...file, newConversation: true });
    } catch (error) {
      console.error('Failed to start new conversation:', error);
    }
  };

  return (
    <div className="w-64 bg-[#0d0d0d] border-r border-[#2a2a2a] flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-6 h-6 text-white" />
          <span className="text-white font-semibold">PDF Reader</span>
        </div>
        
        <button
          onClick={() => document.getElementById('upload-trigger').click()}
          className="w-full bg-white text-black rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload PDF
        </button>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : files.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            No PDFs yet.<br />Upload one to start!
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((file) => (
              <div
                key={file.file_id}
                onClick={() => onSelectPDF(file)}
                className={`group relative p-3 rounded-lg cursor-pointer transition ${
                  selectedPDF?.file_id === file.file_id
                    ? 'bg-[#2a2a2a]'
                    : 'hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-white text-sm font-medium truncate">
                        {file.filename}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {file.message_count} messages
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => handleNewConversation(file.file_id, e)}
                      className="p-1 hover:bg-[#404040] rounded"
                      title="New conversation"
                    >
                      <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(file.file_id, e)}
                      className="p-1 hover:bg-red-500/20 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {!file.indexed && (
                  <div className="mt-2 text-xs text-yellow-500">
                    Indexing...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-[#2a2a2a]">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Hidden file input for upload */}
      <input
        id="upload-trigger"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files[0]) {
            onUploadComplete(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}