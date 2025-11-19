export default function DisconnectedView() {
  return (
    <div style={{
      padding: 40,
      fontFamily: "sans-serif",
      background: "#000",
      color: "#888",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3em", marginBottom: "0.5em", color: "#ff6b35" }}>⚠️</div>
        <div style={{ fontSize: "1.5em", marginBottom: "1em", color: "#eee" }}>
          DIS-Core Offline
        </div>
        <div style={{ fontSize: "1em", color: "#888" }}>
          Waiting for connection...
        </div>
        <div style={{
          marginTop: "20px",
          display: "inline-block",
          width: "8px",
          height: "8px",
          background: "#ff6b35",
          borderRadius: "50%",
          animation: "pulse 2s infinite"
        }} />
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
