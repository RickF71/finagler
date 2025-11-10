import { getDomain } from "../api";

export async function applyDomainCss(domainId) {
  try {
    // Fetch domain data from centralized API
    const json = await getDomain(domainId);
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
