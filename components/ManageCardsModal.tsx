"use client";

import { Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Flashcard } from "@/lib/types";
import Modal from "./Modal";

interface ManageCardsModalProps {
  open: boolean;
  onClose: () => void;
  cards: Flashcard[];
  onEdit: (card: Flashcard) => void;
  onDelete: (id: string) => void;
}

export default function ManageCardsModal({
  open,
  onClose,
  cards,
  onEdit,
  onDelete,
}: ManageCardsModalProps) {
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? cards.filter((c) =>
          [c.hanzi, c.pinyin, c.english, c.deck]
            .join(" ")
            .toLowerCase()
            .includes(q)
        )
      : cards;
    // Group by deck so the list stays readable at 60+ cards.
    return [...list].sort(
      (a, b) => a.deck.localeCompare(b.deck) || a.createdAt - b.createdAt
    );
  }, [cards, query]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage cards"
      subtitle={`${cards.length} card${cards.length === 1 ? "" : "s"} in your collection`}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hanzi, pinyin, English or deck…"
            className="w-full rounded-xl border border-sky-100 bg-sky-50/50 py-2.5 pl-10 pr-4 text-slate-800 outline-none transition placeholder:text-sky-300 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-sky-400">
            No cards match “{query}”.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((card) => (
              <li
                key={card.id}
                className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white/70 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-hanzi text-lg font-bold text-slate-800">
                      {card.hanzi || "—"}
                    </span>
                    <span className="truncate text-sm text-sky-600">
                      {card.pinyin}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm text-slate-500">
                      {card.english || "—"}
                    </span>
                    <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-600">
                      {card.deck}
                    </span>
                  </div>
                </div>

                {confirmId === card.id ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => setConfirmId(null)}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-600 transition hover:bg-sky-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onDelete(card.id);
                        setConfirmId(null);
                      }}
                      className="rounded-lg bg-coral-500 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-coral-600"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => onEdit(card)}
                      aria-label={`Edit ${card.hanzi || card.english}`}
                      className="rounded-lg p-2 text-sky-500 transition hover:bg-sky-50 hover:text-sky-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmId(card.id)}
                      aria-label={`Delete ${card.hanzi || card.english}`}
                      className="rounded-lg p-2 text-coral-400 transition hover:bg-coral-500/10 hover:text-coral-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
