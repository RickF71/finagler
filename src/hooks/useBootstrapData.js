import { useState, useEffect } from "react";

export function useBootstrapData() {
  const [stats, setStats] = useState({});
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, listRes] = await Promise.all([
          fetch("/api/bootstrap/stats").then(r => r.json()),
          fetch("/api/bootstrap/list").then(r => r.json())
        ]);
        setStats(statsRes.counts || {});
        setEntries(listRes || []);
      } catch (err) {
        console.error("Bootstrap fetch error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { stats, entries, loading, error };
}
