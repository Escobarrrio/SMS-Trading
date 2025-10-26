'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import AnimatedSection from '@/components/AnimatedSection';
import ClientNav from '@/components/ClientNav';

interface Contact {
  id: string;
  name?: string;
  phone: string;
  tag?: string;
  created_at: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tags, setTags] = useState<string[]>([]);
  const [showBulkTagModal, setShowBulkTagModal] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { register, handleSubmit, reset } = useForm<Contact>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/contacts');
      const json = await res.json();
      if (json.success) {
        setContacts(json.data ?? []);
        const uniqueTags = Array.from(new Set((json.data ?? []).map((c: Contact) => c.tag).filter(Boolean) as string[]));
        setTags(uniqueTags);
      } else {
        setError(json.error?.message ?? 'Failed to load contacts');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Error loading contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchSearch = !searchTerm || c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm);
      const matchTag = !selectedTag || c.tag === selectedTag;
      return matchSearch && matchTag;
    });
  }, [contacts, searchTerm, selectedTag]);

  const addContact = async (data: Contact) => {
    try {
      const res = await fetch('/api/v1/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name || null, phone: data.phone, tag: data.tag || null }),
      });
      if (res.ok) {
        reset();
        await load();
      } else {
        setError('Failed to add contact');
      }
    } catch (e: any) {
      setError(e?.message);
    }
  };

  const doBulkTag = async () => {
    if (!bulkTagInput.trim() || selected.size === 0) return;
    try {
      const ids = Array.from(selected);
      for (const id of ids) {
        await fetch(`/api/v1/contacts/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag: bulkTagInput.trim() }),
        });
      }
      setSelected(new Set());
      setBulkTagInput('');
      setShowBulkTagModal(false);
      await load();
    } catch (e: any) {
      setError(e?.message);
    }
  };

  const doBulkDelete = async () => {
    try {
      const ids = Array.from(selected);
      for (const id of ids) {
        await fetch(`/api/v1/contacts/${id}`, { method: 'DELETE' });
      }
      setSelected(new Set());
      setShowDeleteConfirm(false);
      await load();
    } catch (e: any) {
      setError(e?.message);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection animation="fade-down">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Contacts</h1>
            <p className="text-gray-600">Manage and organize your contact list</p>
          </div>
        </AnimatedSection>

        <ClientNav />

        {error && (
          <AnimatedSection animation="fade-up" delay={50}>
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          </AnimatedSection>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AnimatedSection animation="fade-up" delay={100} className="lg:col-span-1">
            <form onSubmit={handleSubmit(addContact)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Add Contact</h2>
              <input {...register('name')} placeholder="Name (optional)" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <input {...register('phone', { required: true })} placeholder="Phone (+27...)" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <input {...register('tag')} placeholder="Tag" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">Add</button>
            </form>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={150} className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
              <input type="text" placeholder="Search by name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedTag(null)} className={`px-4 py-2 rounded-full font-medium transition ${!selectedTag ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  All
                </button>
                {tags.map((t) => (
                  <button key={t} onClick={() => setSelectedTag(t)} className={`px-4 py-2 rounded-full font-medium transition ${selectedTag === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>

        {selected.size > 0 && (
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">{selected.size} contact(s) selected</span>
              <div className="flex gap-3">
                <button onClick={() => setShowBulkTagModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition">
                  Tag
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition">
                  Delete
                </button>
              </div>
            </div>
          </AnimatedSection>
        )}

        <AnimatedSection animation="fade-up" delay={250}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={selectAll} className="w-4 h-4 rounded cursor-pointer" />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tag</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <p className="text-lg font-medium">No contacts found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="w-4 h-4 rounded cursor-pointer" />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{c.name || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{c.phone}</td>
                        <td className="px-6 py-4 text-sm">
                          {c.tag ? <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{c.tag}</span> : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedSection>

        {showBulkTagModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <AnimatedSection animation="fade-up">
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Add Tag to {selected.size} Contact(s)</h3>
                <input type="text" placeholder="Enter tag name..." value={bulkTagInput} onChange={(e) => setBulkTagInput(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4" autoFocus />
                <div className="flex gap-3">
                  <button onClick={() => setShowBulkTagModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">
                    Cancel
                  </button>
                  <button onClick={doBulkTag} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
                    Apply Tag
                  </button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <AnimatedSection animation="fade-up">
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-red-600 mb-4">Delete {selected.size} Contact(s)?</h3>
                <p className="text-gray-600 text-sm mb-6">This action cannot be undone. All associated data will be permanently removed.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">
                    Cancel
                  </button>
                  <button onClick={doBulkDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition">
                    Delete
                  </button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        )}
      </div>
    </div>
  );
}
