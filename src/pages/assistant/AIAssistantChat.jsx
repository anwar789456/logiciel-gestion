import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, User, Brain, Loader2 } from 'lucide-react';

// Simule une API ML (à remplacer par un vrai appel API)
const fakeMLApi = async (question) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        answer: `Prédiction IA pour : "${question}"\n\n➡️ Résultat simulé : ${Math.random() > 0.5 ? 'Tendance positive' : 'Tendance négative'} sur vos données.`
      });
    }, 1800);
  });
};

const AIAssistantChat = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ia',
      text: 'Bonjour ! Je suis votre assistant IA. Posez-moi une question business ou demandez une prédiction.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = {
      sender: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    // Appel API ML (simulé)
    const res = await fakeMLApi(input);
    setMessages((msgs) => [
      ...msgs,
      {
        sender: 'ia',
        text: res.answer,
        timestamp: new Date().toISOString(),
      },
    ]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[70vh] max-h-[600px] bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white/80 border-b border-blue-200">
        <Brain className="w-7 h-7 text-blue-600 animate-pulse" />
        <h2 className="text-xl font-bold text-gray-900">Assistant IA (Chat)</h2>
        <Sparkles className="w-5 h-5 text-yellow-400 ml-2 animate-bounce" />
      </div>
      {/* Chat body */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ia' && (
              <div className="flex-shrink-0 mr-2">
                <Brain className="w-9 h-9 text-blue-500 bg-white rounded-full p-1 shadow" />
              </div>
            )}
            <div
              className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-md text-base whitespace-pre-line transition-all duration-300
                ${msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white text-gray-900 rounded-bl-md border border-blue-100'}
              `}
            >
              {msg.text}
              <div className="text-xs text-gray-400 mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {msg.sender === 'user' && (
              <div className="flex-shrink-0 ml-2">
                <User className="w-9 h-9 text-gray-400 bg-white rounded-full p-1 shadow" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 mt-2">
            <Brain className="w-7 h-7 text-blue-400 animate-spin" />
            <Loader2 className="w-5 h-5 text-blue-300 animate-spin" />
            <span className="text-blue-500 font-medium">L'IA réfléchit...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-3 px-6 py-4 bg-white/90 border-t border-blue-200">
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-900 bg-blue-50"
          placeholder="Posez une question à l'IA..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default AIAssistantChat; 