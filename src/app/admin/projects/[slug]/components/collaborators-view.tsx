"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Client, CollaboratorRole } from "@/types";

type CollaboratorRow = {
  id: string;
  role: CollaboratorRole;
  added_at: string;
  client: Client;
};

const ROLE_LABELS: Record<CollaboratorRole, string> = {
  primary: "Primary",
  collaborator: "Collaborator",
  viewer: "Viewer",
};

export function CollaboratorsView({
  slug,
  collaborators,
  availableClients,
}: {
  slug: string;
  collaborators: CollaboratorRow[];
  availableClients: Client[];
}) {
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedRole, setSelectedRole] =
    useState<CollaboratorRole>("collaborator");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClientId) {
      setError("Pick a client to add.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/projects/${encodeURIComponent(slug)}/collaborators`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: selectedClientId,
            role: selectedRole,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to add collaborator");
      }
      setSelectedClientId("");
      setSelectedRole("collaborator");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(clientId: string) {
    setPendingRemovalId(clientId);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/projects/${encodeURIComponent(slug)}/collaborators?client_id=${encodeURIComponent(clientId)}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to remove collaborator");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setPendingRemovalId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add collaborator form */}
      <form
        onSubmit={handleAdd}
        className="p-6 border border-white/[0.06] bg-white/[0.02] rounded-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_120px] gap-4 items-end">
          <label className="block">
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light">
              Client
            </span>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="mt-2 w-full bg-white/[0.03] border border-white/[0.08] rounded-sm px-3 py-2 text-sm text-white/90 font-light focus:outline-none focus:border-gold-400/40 transition-colors duration-300"
              disabled={busy || availableClients.length === 0}
            >
              <option value="">
                {availableClients.length === 0
                  ? "All clients are already assigned"
                  : "Select a client..."}
              </option>
              {availableClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.email}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-light">
              Role
            </span>
            <select
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as CollaboratorRole)
              }
              className="mt-2 w-full bg-white/[0.03] border border-white/[0.08] rounded-sm px-3 py-2 text-sm text-white/90 font-light focus:outline-none focus:border-gold-400/40 transition-colors duration-300"
              disabled={busy}
            >
              <option value="collaborator">Collaborator</option>
              <option value="viewer">Viewer</option>
              <option value="primary">Primary</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={busy || !selectedClientId}
            className="text-[10px] tracking-[0.2em] uppercase text-[#041c45] bg-gold-200 hover:bg-gold-100 transition-colors duration-300 px-4 py-2 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {busy ? "Adding..." : "Add"}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-300/80 font-light mt-4">{error}</p>
        )}

        <p className="text-[10px] text-white/30 mt-4 font-light">
          Need a client who isn&apos;t here?{" "}
          <a
            href="/admin/clients"
            className="text-white/50 hover:text-gold-200 underline transition-colors"
          >
            Create one in /admin/clients
          </a>
          .
        </p>
      </form>

      {/* Current collaborators */}
      {collaborators.length === 0 ? (
        <div className="p-8 border border-white/[0.06] bg-white/[0.01] text-center rounded-sm">
          <p className="text-white/40 font-light">
            No collaborators yet. Add one above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {collaborators.map((row) => (
            <div
              key={row.id}
              className="p-5 border border-white/[0.06] bg-white/[0.02] rounded-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-base font-light text-white/90">
                    {row.client?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-white/40 font-light mt-1">
                    {row.client?.email}
                    {row.client?.company ? ` · ${row.client.company}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span
                  className={`text-[10px] tracking-[0.2em] uppercase ${
                    row.role === "primary"
                      ? "text-gold-200"
                      : "text-white/50"
                  }`}
                >
                  {ROLE_LABELS[row.role]}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(row.client.id)}
                  disabled={pendingRemovalId === row.client.id}
                  className="text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-red-300 transition-colors duration-300 disabled:opacity-40"
                >
                  {pendingRemovalId === row.client.id
                    ? "Removing..."
                    : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
