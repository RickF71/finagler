export async function applyDomainCss(domainId) {
  try {
    // Fetch CSS from your backend
    const res = await fetch(`/api/domain/${domainId}`);
    if (!res.ok) throw new Error(`fetch failed: ${res.statusText}`);

    const json = await res.json();
    const css = json?.css ?? "";

    // Find or create a <style> tag
    let tag = document.getElementById("dis-domain-css");
    if (!tag) {
      tag = document.createElement("style");
      tag.id = "dis-domain-css";
      document.head.appendChild(tag);
    }

    tag.textContent = css;
  } catch (err) {
    console.error("applyDomainCss failed:", err);
  }
}
