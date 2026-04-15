import { useState, useRef, useEffect } from 'react';
import { Send, FileText, Clock, Bot, User, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { queryAPI, documentsAPI } from '../api/axios';
import './Chat.css';

export default function ChatPage() {
  const [selectedDoc, setSelectedDoc] = useState('');
  const [documents, setDocuments] = useState([]); // 🔥 API documents aayenge yaha
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I\'m your AI legal assistant. Select a document and ask me any questions about its contents. I\'ll provide answers with specific citations.',
      sources: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // 🔥 [NEW] Page khulte hi database se tumhari files mangwayega
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await documentsAPI.getAll();
        setDocuments(res.data);
        if (res.data.length > 0) {
          // By default pehli file chun lo
          setSelectedDoc(res.data[0]._id); 
        }
      } catch (error) {
        console.error("Failed to fetch documents", error);
      }
    };
    fetchDocs();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || !selectedDoc) return;
    const question = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setLoading(true);

    try {
      // 🔥 [NEW] Ye direct Node.js -> Python Engine ko query bheja hai!
      const res = await queryAPI.ask(selectedDoc, question);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: res.data.answer,
        sources: res.data.sources || [],
        confidence: res.data.confidence || 90,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "Error connecting to AI Backend. Please make sure the document is processed.",
        sources: [],
        confidence: 0,
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Jo file user ne chuni hai uska naam filter karna
  const activeDocName = documents.find(d => d._id === selectedDoc)?.title || 'Select a document';

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content chat-main">
        <aside className="chat-sidebar glass-card">
          <div className="chat-sidebar-section">
            <h3 className="chat-sidebar-title">Document</h3>
            <select
              className="input-field doc-select"
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
            >
              {documents.length > 0 ? (
                documents.map(d => <option key={d._id} value={d._id}>{d.title}</option>)
              ) : (
                <option value="">No files uploaded yet</option>
              )}
            </select>
          </div>
        </aside>

        <div className="chat-area">
          <div className="chat-header glass">
            <FileText size={18} className="chat-header-icon" />
            <span>{activeDocName}</span>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div className={`chat-bubble ${msg.role}`} key={i}>
                <div className="bubble-avatar">
                  {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className="bubble-content">
                  <p className="bubble-text">{msg.text}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="bubble-sources">
                      {msg.sources.map((s, j) => (
                        <span className="source-pill" key={j}>{s.label}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble assistant">
                <div className="bubble-avatar"><Bot size={18} /></div>
                <div className="bubble-content">
                  <div className="typing-indicator"><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-bar glass">
            <input
              type="text"
              className="chat-input"
              placeholder={documents.length > 0 ? "Ask about your document..." : "Upload a document first..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={documents.length === 0}
            />
            <button className="gradient-btn send-btn" onClick={handleSend} disabled={loading || documents.length === 0}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
