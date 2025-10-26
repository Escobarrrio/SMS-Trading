"use client";

import { useEffect, useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [tag, setTag] = useState("");

  const load = async () => {
    const res = await fetch("/api/v1/campaigns");
    const json = await res.json();
    setCampaigns(json.data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: any) => {
    e.preventDefault();
    await fetch("/api/v1/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message, tag }),
    });
    setName("");
    setMessage("");
    setTag("");
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection animation="fade-down">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Campaigns</h1>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={100}>
          <form onSubmit={create} className="bg-white rounded-lg shadow p-6 space-y-4">
            <input className="border rounded p-2 w-full" placeholder="Campaign name" value={name} onChange={(e) => setName(e.target.value)} required />
            <textarea className="border rounded p-2 w-full h-24" placeholder="Message (max 160)" maxLength={160} value={message} onChange={(e) => setMessage(e.target.value)} required />
            <input className="border rounded p-2 w-full" placeholder="Tag (send to contacts with this tag)" value={tag} onChange={(e) => setTag(e.target.value)} />
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create & Send Now</button>
          </form>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200}>
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="font-semibold mb-4">Recent</h2>
            <div className="space-y-3">
              {campaigns.map((c, i) => (
                <div key={i} className="border rounded p-3">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-600">{c.message}</div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
