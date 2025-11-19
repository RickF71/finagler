export default function LoadingScreen() {
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
        <div style={{ fontSize: "2em", marginBottom: "0.5em" }}>⚡</div>
        <div>Loading DIS...</div>
      </div>
    </div>
  );
}
