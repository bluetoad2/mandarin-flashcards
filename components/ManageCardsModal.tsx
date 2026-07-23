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
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hanzi, pinyin, English or deck…"
            className="w-full border border-ink-200 bg-paper-bright py-2.5 pl-9 pr-3 text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-cinnabar-500"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-400">
            No cards match “{query}”.
          </p>
        ) : (
          <ul className="divide-y divide-ink-100 border-y border-ink-100">
            {filtered.map((card) => (
              <li key={card.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-hanzi text-lg text-ink-900">
                      {card.hanzi || "—"}
                    </span>
                    <span className="truncate font-serif text-sm italic text-cinnabar-500">
                      {card.pinyin}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="truncate text-sm text-ink-500">
                      {card.english || "—"}
                    </span>
                    <span className="label-caps shrink-0 text-ink-300">
                      {card.deck}
                    </span>
                  </div>
                </div>

                {confirmId === card.id ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => setConfirmId(null)}
                      className="px-2 py-1 text-xs font-medium text-ink-500 transition hover:text-ink-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onDelete(card.id);
                        setConfirmId(null);
                      }}
                      className="border border-cinnabar-500 bg-cinnabar-500 px-2.5 py-1 text-xs font-medium text-paper-card transition hover:bg-cinnabar-600"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => onEdit(card)}
                      aria-label={`Edit ${card.hanzi || card.english}`}
                      className="p-2 text-ink-400 transition hover:text-ink-900"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmId(card.id)}
                      aria-label={`Delete ${card.hanzi || card.english}`}
                      className="p-2 text-ink-400 transition hover:text-cinnabar-500"
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
