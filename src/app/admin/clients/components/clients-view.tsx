"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Client } from "@/types";

type ClientRow = Client & { project_count: number };

export function ClientsView({ clients }: { clients: ClientRow[] }) {
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", name: "", company: "" });
  const router = useRouter();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          company: form.company || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to add client");
      }
      setForm({ email: "", name: "", company: "" });
      setAdding(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add client");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40 font-light">
          {clients.length} {clients.length === 1 ? "client" : "clients"}
        </p>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="text-[10px] tracking-[0.2em] uppercase text-white/60 hover:text-gold-200 transition-colors duration-300 border border-white/[0.12] hover:border-gold-400/40 px-4 py-2 rounded-sm"
        >
          {adding ? "Cancel" : "Add Client"}
        </button>
      </div>

      {adding && (
        <form
          onSubmit={handleAdd}
          className="p-6 border border-gold-400/20 bg-gold-400/[0.02] rounded-sm space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="Email"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              required
              type="email"
              placeholder="name@example.com"
            />
            <Field
              label="Name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              required
              placeholder="Madeline Kawanaka"
            />
            <Field
              label="Company"
              value={form.company}
              onChange={(v) => setForm((f) => ({ ...f, company: v }))}
              placeholder="Louisiana Innovation"
            />
          </div>

          {error && (
            <p className="text-xs text-red-300/80 font-light">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white/70 transition-colors duration-300 px-4 py-2"
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-[10px] tracking-[0.2em] uppercase text-[#041c45] bg-gold-200 hover:bg-gold-100 transition-colors duration-300 px-4 py-2 rounded-sm disabled:opacity-50"
              disabled={busy}
            >
              {busy ? "Saving..." : "Create Client"}
            </button>
          </div>
        </form>
      )}

      {clients.length === 0 ? (
        <div className="p-12 border border-white/[0.06] bg-white/[0.01] text-center rounded-sm">
          <p className="text-white/40 font-light">
            No clients yet. Add one above to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <div
              key={client.id}
              className="p-5 border border-white/[0.06] bg-white/[0.02] rounded-sm flex items-center justify-between"
            >
              <div>
                <h2 className="text-base font-light text-white/90">
                  {client.name}
                </h2>
                <p className="text-sm text-white/40 font-light mt-1">
                  {client.email}
                  {client.company ? ` · ${client.company}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40 font-light">
                  {client.project_count}{" "}
                  {client.project_count === 1 ? "project" : "projects"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light">
        {label}
        {required ? "" : <span className="text-white/20"> · optional</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full bg-white/[0.03] border border-white/[0.08] rounded-sm px-3 py-2 text-sm text-white/90 font-light placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors duration-300"
      />
    </label>
  );
}
