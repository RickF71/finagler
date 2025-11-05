function useDomainVisuals(domainId) {
  useEffect(() => {
    if (!domainId) return;

    console.log("🎨 loading domain theme:", domainId);

    fetch(`http://localhost:8080/api/domain/theme/${domainId}`)
      .then(r => r.json())
      .then(({ css }) => {
        console.log("✅ theme received");

        let style = document.getElementById("domain-style");
        if (!style) {
          style = document.createElement("style");
          style.id = "domain-style";
          document.head.appendChild(style);
        }

        style.textContent = css;
      })
      .catch(err => console.error("❌ theme load error:", err));
  }, [domainId]);
}
