"use client";

interface DeckSelectorProps {
  decks: string[];
  active: string;
  counts: Record<string, number>;
  onSelect: (deck: string) => void;
}

export const ALL_DECKS = "All decks";

export default function DeckSelector({
  decks,
  active,
  counts,
  onSelect,
}: DeckSelectorProps) {
  const options = [ALL_DECKS, ...decks];

  return (
    <div className="flex gap-6 overflow-x-auto thin-scroll border-b border-ink-200">
      {options.map((deck) => {
        const isActive = deck === active;
        const count = counts[deck] ?? 0;
        return (
          <button
            key={deck}
            onClick={() => onSelect(deck)}
            className={`group relative shrink-0 whitespace-nowrap pb-2.5 pt-1 text-sm transition ${
              isActive ? "text-ink-900" : "text-ink-400 hover:text-ink-700"
            }`}
          >
            {deck}
            <span
              className={`ml-1.5 font-serif text-xs ${
                isActive ? "text-cinnabar-500" : "text-ink-300"
              }`}
            >
              {count}
            </span>
            {isActive && (
              <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-cinnabar-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
