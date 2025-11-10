import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Input  from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useBootstrapData } from "@/hooks/useBootstrapData";
import { createDISInterface } from "../dis/interface.js";
import { useDomain } from "../context/DomainContext.jsx";

export default function BootstrapOverview() {
  const navigate = useNavigate();
  const { API_BASE } = useDomain();
  const [query, setQuery] = useState("");
  const { stats, entries, loading, error } = useBootstrapData();
  const [filteredEntries, setFilteredEntries] = useState([]);

  // Update filtered list when entries change
  useEffect(() => {
    setFilteredEntries(entries);
  }, [entries]);

  const handleSearch = async (q) => {
    setQuery(q);
    if (!q) {
      setFilteredEntries(entries);
      return;
    }
    try {
      const dis = createDISInterface(API_BASE);
      const data = await dis.searchBootstrap(q);
      setFilteredEntries(data.results || []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  if (loading)
    return <div className="text-muted">Loading bootstrap data…</div>;

  if (error)
    return <div className="warning">⚠️ Failed to load bootstrap data.</div>;

  return (
    <div className="list">
      {/* Stats Card */}
      <div className="panel">
        <h2>Bootstrap Stats</h2>
        <ul className="list">
          {Object.entries(stats).map(([type, count]) => (
            <li key={type}>
              {type}: <strong>{count}</strong>
            </li>
          ))}
        </ul>
      </div>

      {/* Entries Card */}
      <div className="panel">
        <div className="flex-between">
          <h2>Bootstrap Entries</h2>
          <div className="flex-gap">
            <input
              className="field"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by id or file..."
            />
            <button className="button" onClick={() => handleSearch("")}>Reset</button>
          </div>
        </div>
        
        <div className="scroll-area">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Source</th>
                <th>Imported</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((e) => {
                const domain = e.id?.split(".")[1] || "other";
                
                return (
                  <tr key={e.id}>
                    <td 
                      className="text-accent clickable"
                      onClick={() => navigate(`/bootstrap/${encodeURIComponent(e.id)}`)}
                    >
                      {e.id}
                    </td>
                    <td>{e.type}</td>
                    <td className="text-muted">{e.source_file}</td>
                    <td className="text-muted">
                      {new Date(e.imported_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
