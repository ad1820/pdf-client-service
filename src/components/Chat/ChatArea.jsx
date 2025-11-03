import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, User, Bot } from 'lucide-react';
import { pdfAPI } from '../../services/api.js';

export default function ChatArea({ selectedPDF }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedPDF) {
      if (selectedPDF.newConversation) {
        setMessages([]);
      } else {
        loadHistory();
      }
    }
  }, [selectedPDF]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    if (!selectedPDF?.file_id) return;
    
    setLoadingHistory(true);
    try {
      const response = await pdfAPI.getHistory(selectedPDF.file_id);
      const conversations = response.data.conversations || [];
      
      if (conversations.length > 0) {
        const latestConv = conversations[conversations.length - 1];
        setMessages(latestConv.messages || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !selectedPDF?.indexed) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await pdfAPI.query(selectedPDF.file_id, userMessage.content);
      
      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedPDF) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No PDF selected</p>
          <p className="text-sm">Upload or select a PDF from the sidebar</p>
        </div>
      </div>
    );
  }

  if (!selectedPDF.indexed) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
          <p className="text-lg mb-2">Indexing PDF...</p>
          <p className="text-sm">Please wait while we process your document</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-[#2a2a2a] p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2a2a2a] rounded flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-medium">{selectedPDF.filename}</h2>
            <p className="text-gray-500 text-xs">Ask me anything about this PDF</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">Start a conversation</p>
              <p className="text-sm">Ask questions about your PDF</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-white text-black'
                      : msg.error
                      ? 'bg-red-500/10 text-red-500 border border-red-500/50'
                      : 'bg-[#1a1a1a] text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-black" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-[#1a1a1a] rounded-lg px-4 py-3">
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[#2a2a2a] p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about the PDF..."
              disabled={loading}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-[#404040] transition resize-none"
              rows={3}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 bottom-2 p-2 bg-white text-black rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}