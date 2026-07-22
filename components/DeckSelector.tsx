"use client";

import { Layers } from "lucide-react";

interface DeckSelectorProps {
  decks: string[];
  active: string;
  counts: Record<string, number>;
  onSelect: (deck: string) => void;
}

export const ALL_DECKS = "All Decks";

export default function DeckSelector({
  decks,
  active,
  counts,
  onSelect,
}: DeckSelectorProps) {
  const options = [ALL_DECKS, ...decks];

  return (
    <div className="flex gap-2 overflow-x-auto thin-scroll pb-1">
      {options.map((deck) => {
        const isActive = deck === active;
        const count = deck === ALL_DECKS ? counts[ALL_DECKS] : counts[deck];
        return (
          <button
            key={deck}
            onClick={() => onSelect(deck)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "border-sky-500 bg-sky-500 text-white shadow-md shadow-sky-300/50"
                : "border-sky-100 bg-white/70 text-sky-600 hover:border-sky-300 hover:bg-white"
            }`}
          >
            {deck === ALL_DECKS && <Layers className="h-4 w-4" />}
            {deck}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                isActive ? "bg-white/25 text-white" : "bg-sky-100 text-sky-600"
              }`}
            >
              {count ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
