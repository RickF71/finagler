// src/dis/interface.js
export const createDISInterface = (API_BASE) => ({
  // ---------- Domain ----------
  domain: {
    async listDomains() {
      const res = await fetch(`${API_BASE}/api/domain/list`);
      if (!res.ok) throw new Error(`GET /api/domain/list failed: ${res.status}`);
      return res.json();
    },

    async getDomain(domainId) {
      const res = await fetch(`${API_BASE}/api/domain/${domainId}`);
      if (!res.ok) throw new Error(`GET /api/domain/${domainId} failed: ${res.status}`);
      return res.json();
    },

    async getPayload(domainId) {
      if (!domainId) throw new Error("Invalid domain ID");
      const base = `${API_BASE}/api/domain/${domainId}`;
      const endpoints = {
        meta: `${base}`,
        files: `${base}/files`,
        css: `${base}/css`,
        policy: `${base}/policy`,
        receipts: `${base}/receipts`,
      };

      try {
        const [metaRes, filesRes] = await Promise.all([
          fetch(endpoints.meta),
          fetch(endpoints.files),
        ]);

        if (!metaRes.ok)
          throw new Error(`Failed to load domain meta: ${metaRes.statusText}`);
        if (!filesRes.ok)
          throw new Error(`Failed to load domain files: ${filesRes.statusText}`);

        const meta = await metaRes.json();
        const files = await filesRes.json();

        let policy = null;
        let receipts = [];

        try {
          const pRes = await fetch(endpoints.policy);
          if (pRes.ok) policy = await pRes.json();
        } catch {}

        try {
          const rRes = await fetch(endpoints.receipts);
          if (rRes.ok) receipts = await rRes.json();
        } catch {}

        return {
          id: domainId,
          state: "ready",
          meta,
          files,
          policy,
          receipts,
          css: endpoints.css,
          fetchedAt: new Date().toISOString(),
        };
      } catch (err) {
        console.error("DIS: getPayload failed", err);
        throw err;
      }
    },

    async getDomainCSS(domainId) {
    const res = await fetch(`${API_BASE}/api/domain/${domainId}/css`);
    if (!res.ok) throw new Error(`getDomainCSS failed: ${res.status}`);
    return res.text();
    },


    async saveDomainCSS(domainId, css) {
      const res = await fetch(`${API_BASE}/api/domain/${domainId}/css/text`, {
        method: "PUT",
        headers: { "Content-Type": "text/plain" },
        body: css,
      });
      if (!res.ok) throw new Error(`saveDomainCSS failed: ${res.status}`);
      return res.ok;
    },

    async getDomainLinks() {
      const res = await fetch(`${API_BASE}/api/domain/links`);
      if (!res.ok) throw new Error(`getDomainLinks failed: ${res.status}`);
      return res.json();
    },

    async getDomainInfo(code) {
      const res = await fetch(`${API_BASE}/api/domain/info?code=${encodeURIComponent(code)}`);
      if (!res.ok) throw new Error(`getDomainInfo failed: ${res.status}`);
      return res.json();
    },

    async getDefaultDomain() {
      const res = await fetch(`${API_BASE}/api/domain/default`);
      if (!res.ok) throw new Error(`getDefaultDomain failed: ${res.status}`);
      return res.json();
    },
  },

  // ---------- Files ----------
  file: {
    async listFiles(domainId) {
      const res = await fetch(`${API_BASE}/api/domain/${domainId}/files`);
      if (!res.ok) throw new Error(`listFiles failed: ${res.status}`);
      return res.json();
    },

    async getFile(domainId, filename) {
      const res = await fetch(`${API_BASE}/api/domain/${domainId}/file/${filename}`);
      if (!res.ok) throw new Error(`getFile failed: ${res.status}`);
      return res.text();
    },

    async saveFile(domainId, filename, content) {
      const res = await fetch(`${API_BASE}/api/domain/${domainId}/file/${filename}`, {
        method: "PUT",
        headers: { "Content-Type": "text/plain" },
        body: content,
      });
      if (!res.ok) throw new Error(`saveFile failed: ${res.status}`);
      return res.ok;
    },

    async deleteFile(domainId, filename) {
      const res = await fetch(`${API_BASE}/api/domain/${domainId}/file/${filename}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`deleteFile failed: ${res.status}`);
      return res.ok;
    },
  },

  // ---------- Policy ----------
  policy: {
    async getPolicy(domainId) {
      const res = await fetch(`${API_BASE}/api/domain/${domainId}/policy`);
      if (!res.ok) throw new Error(`getPolicy failed: ${res.status}`);
      return res.json();
    },

    async savePolicy(domainId, content) {
      const res = await fetch(`${API_BASE}/api/domain/${domainId}/policy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!res.ok) throw new Error(`savePolicy failed: ${res.status}`);
      return res.ok;
    },
  },

  // ---------- Identities ----------
  identity: {
    async listIdentities(domainId = null) {
      const path = domainId ? `/api/domain/${domainId}/identities` : "/api/identity/list";
      const res = await fetch(`${API_BASE}${path}`);
      if (!res.ok) throw new Error(`listIdentities failed: ${res.status}`);
      return res.json();
    },

    async registerIdentity(payload) {
      const res = await fetch(`${API_BASE}/api/identity/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`registerIdentity failed: ${res.status}`);
      return res.json();
    },
  },

  // ---------- Receipts ----------
  receipts: {
    async listReceipts(domainId) {
      const res = await fetch(`${API_BASE}/api/domain/${domainId}/receipts`);
      if (!res.ok) throw new Error(`listReceipts failed: ${res.status}`);
      return res.json();
    },

    async getDashboard() {
      const res = await fetch(`${API_BASE}/api/receipts/dashboard`);
      if (!res.ok) throw new Error(`getReceiptsDashboard failed: ${res.status}`);
      return res.json();
    },

    async listAll(limit = 50) {
      const res = await fetch(`${API_BASE}/api/receipts/list?limit=${limit}`);
      if (!res.ok) throw new Error(`listAllReceipts failed: ${res.status}`);
      return res.json();
    },
  },

  // ---------- System ----------
  system: {
    async getStatus() {
      const res = await fetch(`${API_BASE}/api/status`);
      if (!res.ok) throw new Error(`getStatus failed: ${res.status}`);
      return res.json();
    },

    async getMirrorSpinStatus() {
      const res = await fetch(`${API_BASE}/api/mirrorspin/status`);
      if (!res.ok) throw new Error(`getMirrorSpinStatus failed: ${res.status}`);
      return res.json();
    },

    async listPeers() {
      const res = await fetch(`${API_BASE}/api/net/peers`);
      if (!res.ok) throw new Error(`listPeers failed: ${res.status}`);
      return res.json();
    },
  },

  // ---------- Overlay ----------
  overlay: {
    async getOverlay(domainOrId, scope = null) {
      const path = scope ? `/api/overlay/${domainOrId}/${scope}` : `/api/overlay/${domainOrId}`;
      const res = await fetch(`${API_BASE}${path}`);
      if (!res.ok) throw new Error(`getOverlay failed: ${res.status}`);
      return res.json();
    },

    async getTerraOverlay(region = "world", nocache = true) {
      const query = `?region=${encodeURIComponent(region)}${nocache ? `&nocache=${Date.now()}` : ""}`;
      const res = await fetch(`${API_BASE}/api/terra/map${query}`);
      if (!res.ok) throw new Error(`getTerraOverlay failed: ${res.status}`);
      return res.json();
    },
  },
});
