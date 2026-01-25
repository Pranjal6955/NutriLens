type Props = {
  carbs: number;
  protein: number;
  fats: number;
};

const MiniReport = ({ carbs, protein, fats }: Props) => {
  return (
    <div
      style={{
        marginTop: '6px',
        backgroundColor: '#FFFFFF',
        color: '#111',
        borderRadius: '12px',
        padding: '10px 12px',
        fontSize: '13px',
        minWidth: '180px',
      }}
    >
      <strong style={{ color: '#4CAF50' }}>🥗 Mini Report</strong>

      <div style={{ marginTop: '6px' }}>Carbs: {carbs} g</div>
      <div>Protein: {protein} g</div>
      <div>Fats: {fats} g</div>
    </div>
  );
};

export default MiniReport;
