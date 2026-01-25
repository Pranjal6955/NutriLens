import { useState } from 'react';
import ChatBubble from './ChatBubble';
import ChatWindow from './ChatWindow';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ChatBubble onClick={() => setIsOpen(true)} />
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default Chatbot;
