type Props = {
  onClick: () => void;
};

const ChatBubble = ({ onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#4CAF50',
        color: '#FFFFFF',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        zIndex: 1000,
      }}
      aria-label='Open NutriBot'
    >
      💬
    </button>
  );
};

export default ChatBubble;
