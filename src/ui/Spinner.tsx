
export function Spinner() {
  return (
    <div style={{
      width: 24,
      height: 24,
      border: '2px solid rgba(102,192,244,0.2)',
      borderTopColor: '#66c0f4',
      borderRadius: '50%',
      animation: 'pp-spin 0.8s linear infinite',
    }}>
      <style>{`@keyframes pp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
