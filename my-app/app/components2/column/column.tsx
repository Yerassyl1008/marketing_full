"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";

import { PUBLIC_LEADS_PROXY_BASE } from "@/lib/public-leads-proxy";

type ColumnId = "new" | "in_progress" | "success" | "rejected";

interface Lead {
  id: number;
  name: string;
  email: string;
  contact_type: "telegram" | "whatsapp";
  contact: string;
  message: string | null;
  status: ColumnId;
}

interface ColumnMeta {
  id: ColumnId;
  title: string;
}

const COLUMNS: ColumnMeta[] = [
  { id: "new", title: "1. Новые заявки" },
  { id: "in_progress", title: "2. Заявки в работе" },
  { id: "success", title: "3. Клиент согласился работать" },
  { id: "rejected", title: "4. Нельзя связаться / не согласен работать" },
];

interface BoardResponse {
  new: Lead[];
  in_progress: Lead[];
  success: Lead[];
  rejected: Lead[];
}

/** Удаление через Next API (прокси + JWT), чтобы обойти 404/405 на прямых вызовах к :8000 */
async function deleteLeadOnServer(leadId: number): Promise<Response> {
  return fetch(`/api/leads/${leadId}`, { method: "DELETE" });
}

export function Column() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadBoard = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${PUBLIC_LEADS_PROXY_BASE}/board`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Не удалось загрузить заявки.");
      }
      const board = (await response.json()) as BoardResponse;
      setLeads([...board.new, ...board.in_progress, ...board.success, ...board.rejected]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Ошибка загрузки.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoard();
  }, []);

  const grouped = useMemo(() => {
    return COLUMNS.map((column) => ({
      ...column,
      items: leads.filter((lead) => lead.status === column.id),
    }));
  }, [leads]);

  const moveLead = (leadId: number, nextStatus: ColumnId) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status: nextStatus } : lead))
    );
  };

  const updateLeadMessageLocal = (leadId: number, message: string) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, message } : lead))
    );
  };

  const handleDrop = async (columnId: ColumnId) => {
    if (!draggedLeadId) return;
    const previous = leads;
    moveLead(draggedLeadId, columnId);
    setDraggedLeadId(null);

    try {
      const response = await fetch(`${PUBLIC_LEADS_PROXY_BASE}/${draggedLeadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: columnId }),
      });
      if (!response.ok) {
        throw new Error("Не удалось сохранить статус.");
      }
    } catch {
      setLeads(previous);
      setError("Не удалось сохранить статус на сервере.");
    }
  };

  const saveLeadMessage = async (leadId: number, message: string) => {
    try {
      const response = await fetch(`${PUBLIC_LEADS_PROXY_BASE}/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() || null }),
      });
      if (!response.ok) {
        throw new Error("Не удалось сохранить комментарий.");
      }
    } catch {
      setError("Не удалось сохранить комментарий на сервере.");
    }
  };

  const executeDelete = async (leadId: number) => {
    const previous = leads;
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setPendingDeleteId(null);
    setError("");
    try {
      const response = await deleteLeadOnServer(leadId);
      if (!response.ok) {
        let msg = `Удаление не удалось (${response.status}).`;
        try {
          const data = (await response.json()) as {
            userMessage?: string;
            hint?: string;
            error?: string;
            detail?: string;
          };
          if (data.userMessage) msg = data.userMessage;
          else if (data.hint) msg = data.hint;
          else if (data.error)
            msg = `${data.error}${data.detail ? ` — ${data.detail}` : ""}`;
        } catch {
          /* ignore */
        }
        setLeads(previous);
        setError(msg);
        return;
      }
    } catch {
      setLeads(previous);
      setError("Сеть или сервер Next недоступны.");
    }
  };

  const pendingDeleteLead = useMemo(
    () => (pendingDeleteId == null ? null : leads.find((l) => l.id === pendingDeleteId) ?? null),
    [pendingDeleteId, leads]
  );

  useEffect(() => {
    if (pendingDeleteId == null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setPendingDeleteId(null);
    }
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [pendingDeleteId]);

  return (
    <section className="rounded-[28px] bg-[var(--team-surface)] p-3 shadow-sm sm:p-4 md:rounded-[36px] md:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-xl font-extrabold text-[var(--foreground)] md:text-2xl">CRM воронка</h2>
        <span className="rounded-full bg-[var(--design-btn)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
          {leads.length} клиентов
        </span>
      </div>
      {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
      {isLoading ? <p className="mb-3 text-sm text-[var(--design-muted)]">Загрузка заявок...</p> : null}

      {mounted &&
        pendingDeleteId != null &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-lead-dialog-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] dark:bg-black/60"
              aria-label="Закрыть"
              onClick={() => setPendingDeleteId(null)}
            />
            <div className="relative z-10 w-full max-w-md rounded-3xl border border-[color:var(--foreground)]/12 bg-[var(--header-bg)] p-6 shadow-xl dark:border-white/10">
              <h3 id="delete-lead-dialog-title" className="text-lg font-bold text-[var(--foreground)]">
                Удалить заявку?
              </h3>
              <p className="mt-2 text-sm text-[var(--design-muted)]">
                {pendingDeleteLead
                  ? `Заявка «${pendingDeleteLead.name}» будет удалена без возможности восстановления.`
                  : "Эта заявка будет удалена без возможности восстановления."}
              </p>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPendingDeleteId(null)}
                  className="rounded-2xl border border-[color:var(--foreground)]/15 bg-[var(--background)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--projects-span-bg)] dark:border-white/15"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => void executeDelete(pendingDeleteId)}
                  className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {grouped.map((column) => (
          <div
            key={column.id}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(column.id)}
            className="min-h-[260px] rounded-2xl border border-black/5 bg-[var(--background)] p-3 dark:border-white/10"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold leading-5 text-[var(--foreground)]">{column.title}</h3>
              <span className="rounded-full bg-[var(--projects-span-bg)] px-2 py-1 text-xs text-[var(--design-muted)]">
                {column.items.length}
              </span>
            </div>

            <div className="space-y-3">
              {column.items.map((lead) => (
                <article
                  key={lead.id}
                  draggable
                  onDragStart={() => setDraggedLeadId(lead.id)}
                  onDragEnd={() => setDraggedLeadId(null)}
                  className="cursor-grab rounded-xl border border-black/5 bg-[var(--team-surface)] p-3 active:cursor-grabbing dark:border-white/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--foreground)]">{lead.name}</p>
                      <p className="mt-1 text-xs text-[var(--design-muted)]">{lead.email}</p>
                      <p className="mt-1 text-xs text-[var(--design-muted)]">
                        {lead.contact_type === "telegram" ? "Telegram" : "WhatsApp"}: {lead.contact}
                      </p>
                    </div>
                    <button
                      type="button"
                      title="Удалить заявку"
                      aria-label="Удалить заявку"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDeleteId(lead.id);
                      }}
                      className="shrink-0 rounded-lg p-1.5 text-[var(--design-muted)] transition hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-red-400"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                  <label className="mt-3 block text-xs font-medium text-[var(--design-muted)]">
                    Комментарий для менеджера
                    <textarea
                      value={lead.message ?? ""}
                      onChange={(event) => updateLeadMessageLocal(lead.id, event.target.value)}
                      onBlur={(event) => saveLeadMessage(lead.id, event.target.value)}
                      rows={3}
                      placeholder="Напишите комментарий..."
                      className="mt-1 w-full resize-none rounded-lg border border-black/10 bg-[var(--background)] px-2 py-2 text-xs text-[var(--foreground)] outline-none placeholder:text-[var(--design-muted)] focus:border-[var(--design-btn)] dark:border-white/20"
                    />
                  </label>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
