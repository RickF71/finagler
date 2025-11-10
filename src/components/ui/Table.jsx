import React from "react";

export default function Table({ columns = [], data = [] }) {
  return (
    <div className="list" style={{ overflowX: 'auto', borderRadius: '8px' }}>
      <table className="text-muted" style={{ minWidth: '100%', fontSize: '0.875rem' }}>
        <thead className="toolbar text-muted">
          <tr>
            {columns.map((col) => (
              <th key={col} className="pad-sm" style={{ textAlign: 'left', fontWeight: '500' }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="list-item" style={{ borderBottom: '1px solid rgba(42, 54, 66, 1)' }}>
              {columns.map((col) => (
                <td key={col} className="pad-sm">
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}