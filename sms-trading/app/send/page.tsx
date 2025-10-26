"use client";

import { useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { normalizePhone } from "@/lib/phone";

const templates = [
  { key: "specials", label: "Special Prices", text: "🔥 Specials today: {item} now only {price}. Reply STOP to opt out." },
  { key: "stock", label: "Back In Stock", text: "✅ {item} is back in stock. Limited units available. Reply STOP to opt out." },
  { key: "collection", label: "Collection Reminder", text: "📦 Your parcel is ready for collection on {date}. Bring ID. Reply STOP to opt out." },
];

export default function SendPage() {
  const [recipients, setRecipients] = useState("");
  const [message, setMessage] = useState(templates[0].text);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTemplate = (t: string) => {
    setMessage(t);
  };

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const numbers = recipients
      .split(/\n|,|;|\s+/)
      .map((n) => n.trim())
      .filter(Boolean)
      .map(normalizePhone);

    try {
      const res = await fetch("/api/v1/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients: numbers, message }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ success: false, error: { message: (e as any)?.message ?? "Failed" } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection animation="fade-down">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Send SMS</h1>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={100}>
          <form onSubmit={submit} className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
              <textarea
                className="w-full border rounded p-3 h-28"
                placeholder="Paste numbers separated by comma, space or newline"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Example: 0821234567, +27 82 987 6543</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {templates.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className="px-3 py-1 rounded border hover:bg-gray-50"
                    onClick={() => handleTemplate(t.text)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <textarea
                className="w-full border rounded p-3 h-28"
                maxLength={160}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="text-xs text-gray-500 mt-1">{message.length}/160 characters</div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </AnimatedSection>

        {result && (
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
