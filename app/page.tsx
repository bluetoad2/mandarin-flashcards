"use client";

import { Plus, Settings, Sparkles, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CardDraft, Flashcard, StudyStatus } from "@/lib/types";
import { createId, loadData, saveCards } from "@/lib/storage";
import { DEFAULT_CARDS } from "@/lib/defaultData";
import DeckSelector, { ALL_DECKS } from "@/components/DeckSelector";
import StudyView from "@/components/StudyView";
import ImportModal from "@/components/ImportModal";
import AddCardModal from "@/components/AddCardModal";
import SettingsModal from "@/components/SettingsModal";

export default function Home() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [activeDeck, setActiveDeck] = useState<string>(ALL_DECKS);
  const [hydrated, setHydrated] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Load once on mount (client-only, so localStorage is available).
  useEffect(() => {
    setCards(loadData().cards);
    setHydrated(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (hydrated) saveCards(cards);
  }, [cards, hydrated]);

  const decks = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((c) => set.add(c.deck));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [cards]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { [ALL_DECKS]: cards.length };
    cards.forEach((c) => {
      map[c.deck] = (map[c.deck] ?? 0) + 1;
    });
    return map;
  }, [cards]);

  const visibleCards = useMemo(
    () =>
      activeDeck === ALL_DECKS
        ? cards
        : cards.filter((c) => c.deck === activeDeck),
    [cards, activeDeck]
  );

  const handleGrade = (cardId: string, status: StudyStatus) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        return {
          ...c,
          status,
          correct: c.correct + (status === "mastered" ? 1 : 0),
          incorrect: c.incorrect + (status === "learning" ? 1 : 0),
        };
      })
    );
  };

  const handleImport = (drafts: CardDraft[]) => {
    const newCards: Flashcard[] = drafts.map((d) => ({
      id: createId(),
      hanzi: d.hanzi,
      pinyin: d.pinyin,
      english: d.english,
      imageUrl: d.imageUrl,
      deck: d.deck,
      status: "new",
      correct: 0,
      incorrect: 0,
      createdAt: Date.now(),
    }));
    setCards((prev) => [...prev, ...newCards]);
    // Jump to the deck we just imported into, if consistent.
    const importedDecks = new Set(drafts.map((d) => d.deck));
    if (importedDecks.size === 1) {
      setActiveDeck(Array.from(importedDecks)[0]);
    }
  };

  const handleAdd = (draft: CardDraft) => {
    handleImport([draft]);
  };

  const handleRestore = (restored: Flashcard[]) => {
    setCards(restored);
    setActiveDeck(ALL_DECKS);
  };

  const handleReset = () => {
    // Fresh copies so ids don't collide across resets.
    const fresh = DEFAULT_CARDS.map((c) => ({ ...c, id: createId() }));
    setCards(fresh);
    setActiveDeck(ALL_DECKS);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Decorative blur blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -right-20 top-40 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-xl flex-col px-4 pb-10 pt-6 sm:px-6">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-300/50">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-sky-900">
                Mandarin
              </h1>
              <p className="-mt-0.5 text-sm font-medium text-sky-500">
                Flashcards
              </p>
            </div>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-white/70 text-sky-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-sky-800"
          >
            <Settings className="h-5 w-5" />
          </button>
        </header>

        {/* Action buttons */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 px-4 py-3 font-semibold text-white shadow-lg shadow-sky-300/50 transition hover:brightness-105 active:scale-[0.98]"
          >
            <Upload className="h-5 w-5" />
            Import CSV
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white/80 px-4 py-3 font-semibold text-sky-600 shadow-sm backdrop-blur transition hover:bg-white active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Add card
          </button>
        </div>

        {/* Deck selector */}
        <div className="mb-5">
          <DeckSelector
            decks={decks}
            active={activeDeck}
            counts={counts}
            onSelect={setActiveDeck}
          />
        </div>

        {/* Study area */}
        <div className="flex-1">
          {hydrated ? (
            <StudyView
              cards={visibleCards}
              deckName={activeDeck}
              onGrade={handleGrade}
            />
          ) : (
            <div className="h-[26rem] w-full animate-pulse rounded-3xl border border-sky-100 bg-white/50 sm:h-[30rem]" />
          )}
        </div>

        <footer className="mt-8 text-center text-xs text-sky-400">
          Saved locally in your browser · no account needed
        </footer>
      </div>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
      <AddCardModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        decks={decks}
        onAdd={handleAdd}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        cards={cards}
        onRestore={handleRestore}
        onReset={handleReset}
      />
    </main>
  );
}
