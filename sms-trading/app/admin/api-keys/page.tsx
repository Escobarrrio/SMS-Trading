"use client";

import { useEffect, useState } from "react";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const load = async () => {
    const r = await fetch("/api/v1/api-keys");
    const j = await r.json();
    setKeys(j.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const r = await fetch("/api/v1/api-keys", { method: "POST" });
    const j = await r.json();
    setNewKey(j.data?.apiKey || null);
    load();
  };
  const revoke = async (id: string) => {
    await fetch(`/api/v1/api-keys?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Keys</h1>
        <button onClick={create} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create Key</button>
        {newKey && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <div className="font-semibold">Copy this key now (shown once):</div>
            <div className="font-mono break-all">{newKey}</div>
          </div>
        )}
        <div className="mt-6 bg-white rounded shadow p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2">ID</th>
                <th className="py-2">Created</th>
                <th className="py-2">Last used</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-b">
                  <td className="py-2">{k.id}</td>
                  <td className="py-2">{new Date(k.created_at).toLocaleString()}</td>
                  <td className="py-2">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "-"}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => revoke(k.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
