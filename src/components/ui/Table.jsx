import React from "react";

export default function Table({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto border border-[#2A3642] rounded-lg">
      <table className="min-w-full text-sm text-gray-300">
        <thead className="bg-[#0E1319] text-gray-400 border-b border-[#2A3642]">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 text-left font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-[#1A242E] border-b border-[#2A3642]">
              {columns.map((col) => (
                <td key={col} className="px-4 py-2">
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