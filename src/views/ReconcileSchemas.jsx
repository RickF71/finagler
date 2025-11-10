import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { createDISInterface } from "../dis/interface.js";
import { useDomain } from "../context/DomainContext.jsx";

export default function ReconcileSchemas() {
  const { API_BASE } = useDomain();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dis = createDISInterface(API_BASE);
    dis.reconcileSchemas()
      .then((res) => setData(res.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [API_BASE]);

  if (loading)
    return (
      <div className="flex justify-center mt-10 text-gray-400">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-semibold text-white mb-4">
        Schema Reconciliation
      </h2>

      {data.length === 0 ? (
        <p className="text-gray-400">
          No schema discrepancies found <span className="text-[#00B97A]">🎉</span>
        </p>
      ) : (
        data.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-[#00B97A] font-semibold">
                  {item.schema_type}
                </span>
                <span className="text-sm text-gray-400">{item.file}</span>
              </div>
              <p className="text-gray-300">{item.details}</p>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
