import { useState } from 'react';
import MiniReport from './MiniReport';

type Message = {
  role: 'user' | 'bot';
  text?: string;
  report?: {
    carbs: number;
    protein: number;
    fats: number;
  };
};

type Props = {
  onClose: () => void;
};

const ChatWindow = ({ onClose }: Props) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: '👋 Hi! I’m NutriBot. Ask me anything about your food.',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Mock bot response (AI-ready)
    setTimeout(() => {
      const lower = input.toLowerCase();
      const wantsReport =
        lower.includes('analyze') ||
        lower.includes('nutrition') ||
        lower.includes('breakdown') ||
        lower.includes('carbs');

      if (wantsReport) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: 'Here’s a quick nutrition breakdown 👇',
            report: {
              carbs: Math.floor(40 + Math.random() * 40), // 40–80g
              protein: Math.floor(15 + Math.random() * 25), // 15–40g
              fats: Math.floor(10 + Math.random() * 20), // 10–30g
            },
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: '🍎 I can help analyze meals or explain nutrients like carbs, protein, and fats.',
          },
        ]);
      }
    }, 600);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '96px',
        right: '24px',
        width: '360px',
        height: '480px',
        backgroundColor: '#111',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#4CAF50',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        }}
      >
        <div>
          <strong>NutriBot</strong>
          <div style={{ fontSize: '12px' }}>Your Health Navigator</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '18px',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: '12px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.role === 'user' ? '#4CAF50' : '#222',
              color: '#FFFFFF',
              padding: '8px 12px',
              borderRadius: '12px',
              maxWidth: '80%',
              fontSize: '14px',
            }}
          >
            {msg.text && <div>{msg.text}</div>}

            {msg.report && (
              <MiniReport
                carbs={msg.report.carbs}
                protein={msg.report.protein}
                fats={msg.report.fats}
              />
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid #222',
          display: 'flex',
          gap: '8px',
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder='Ask about calories, carbs, protein...'
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            outline: 'none',
            backgroundColor: '#1a1a1a',
            color: '#FFFFFF', // 👈 typed text color (FIX)
            fontSize: '14px',
          }}
        />

        <button
          onClick={handleSend}
          style={{
            backgroundColor: '#4CAF50',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '0 14px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
