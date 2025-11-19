import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Loader2 } from "lucide-react";
import { createDISInterface } from "../dis/interface.js";
import { useDomain } from "../context/DomainContext.jsx";

export default function ReconcileDomains() {
  const { API_BASE } = useDomain();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dis = createDISInterface(API_BASE);
    dis.reconcileDomains()
      .then((res) => setData(res.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [API_BASE]);

  if (loading)
    return (
      <div className="center pad-md text-muted" style={{ marginTop: '40px' }}>
        <Loader2 />
      </div>
    );

  return (
    <div className="column gap-md pad-md">
      <h2 className="text-lg font-bold" style={{ marginBottom: '16px' }}>
        Domain Reconciliation
      </h2>

      {data.length === 0 ? (
        <p className="text-muted">
          All domains validated successfully <span className="text-accent">✅</span>
        </p>
      ) : (
        data.map((item) => (
          <Card key={item.id} className="panel pad-md">
            <div className="column gap-sm">
              <div className="flex-between">
                <span className="text-accent font-bold">
                  {item.domain}
                </span>
                <span className="text-sm text-muted">
                  parent: {item.parent || "—"}
                </span>
              </div>
              <p>{item.details}</p>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
