export async function fetchMirrorSpinStatus() {
  try {
    const response = await fetch("http://localhost:8080/api/mirrorspin/status");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error("MirrorSpin fetch error:", err);
    return { error: err.message };
  }
}
