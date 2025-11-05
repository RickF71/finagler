import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Input  from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useBootstrapData } from "@/hooks/useBootstrapData";

export default function BootstrapOverview() {
  const navigate = useNavigate();
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
      const res = await fetch(`/api/bootstrap/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setFilteredEntries(data.results || []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  if (loading)
    return <div className="p-6 text-sm text-gray-400">Loading bootstrap data…</div>;

  if (error)
    return <div className="p-6 text-sm text-red-400">⚠️ Failed to load bootstrap data.</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Stats Card */}
      <Card className="p-4">
        <CardHeader>
          <h2 className="text-xl font-semibold">Bootstrap Stats</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {Object.entries(stats).map(([type, count]) => (
              <li key={type}>
                {type}: <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Entries Card */}
      <Card className="p-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bootstrap Entries</h2>
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by id or file..."
                className="w-64"
              />
              <Button onClick={() => handleSearch("")}>Reset</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[70vh] border-t border-gray-700 mt-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Source</th>
                  <th className="text-left p-2">Imported</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((e) => {
                  const domain = e.id?.split(".")[1] || "other";

                  const colorMap = {
                    terra: "text-green-400",
                    dis: "text-blue-400",
                    overlay: "text-purple-400",
                    governance: "text-yellow-400",
                    limen: "text-pink-400",
                    notech: "text-orange-400",
                    other: "text-slate-300",
                  };

                  const colorClass = colorMap[domain] || colorMap.other;

                  return (
                    <tr
                      key={e.id}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                    >
                      <td
                        className={`p-2 cursor-pointer hover:underline ${colorClass}`}
                        onClick={() => navigate(`/bootstrap/${encodeURIComponent(e.id)}`)}
                      >
                        {e.id}
                      </td>
                      <td className="p-2">{e.type}</td>
                      <td className="p-2 text-gray-300">{e.source_file}</td>
                      <td className="p-2 text-gray-400">
                        {new Date(e.imported_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
