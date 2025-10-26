"use client";

import { useEffect, useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tag, setTag] = useState("");

  const load = async () => {
    const res = await fetch("/api/v1/contacts");
    const json = await res.json();
    setContacts(json.data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e: any) => {
    e.preventDefault();
    await fetch("/api/v1/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, tag }),
    });
    setName("");
    setPhone("");
    setTag("");
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection animation="fade-down">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Contacts</h1>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={100}>
          <form onSubmit={add} className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input className="border rounded p-2" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="border rounded p-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <input className="border rounded p-2" placeholder="Tag (e.g. muslim, vip)" value={tag} onChange={(e) => setTag(e.target.value)} />
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add</button>
          </form>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200}>
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Tag</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{c.name}</td>
                    <td className="py-2">{c.phone}</td>
                    <td className="py-2">{c.tag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
