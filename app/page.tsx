"use client";

import { CalendarClock, Layers3, List, Plus, Settings, Sparkles, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CardDraft, Flashcard, StudyMode } from "@/lib/types";
import { createId, loadData, saveCards } from "@/lib/storage";
import { DEFAULT_CARDS } from "@/lib/defaultData";
import { demoteCard, isDue, promoteCard } from "@/lib/srs";
import DeckSelector, { ALL_DECKS } from "@/components/DeckSelector";
import StudyView from "@/components/StudyView";
import ImportModal from "@/components/ImportModal";
import CardFormModal from "@/components/CardFormModal";
import ManageCardsModal from "@/components/ManageCardsModal";
import SettingsModal from "@/components/SettingsModal";

export default function Home() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [activeDeck, setActiveDeck] = useState<string>(ALL_DECKS);
  const [mode, setMode] = useState<StudyMode>("due");
  const [hydrated, setHydrated] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editCard, setEditCard] = useState<Flashcard | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setCards(loadData().cards);
    setHydrated(true);
  }, []);

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

  const deckCards = useMemo(
    () =>
      activeDeck === ALL_DECKS
        ? cards
        : cards.filter((c) => c.deck === activeDeck),
    [cards, activeDeck]
  );

  const dueCards = useMemo(() => {
    const now = Date.now();
    return deckCards
      .filter((c) => isDue(c, now))
      .sort((a, b) => a.dueAt - b.dueAt);
  }, [deckCards]);

  const visibleCards = mode === "due" ? dueCards : deckCards;

  /** Soonest upcoming review in this deck, for the "all caught up" message. */
  const nextDueAt = useMemo(() => {
    const upcoming = deckCards
      .map((c) => c.dueAt)
      .filter((t) => t > Date.now())
      .sort((a, b) => a - b);
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [deckCards]);

  const handleGrade = useCallback((cardId: string, correct: boolean) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? (correct ? promoteCard(c) : demoteCard(c)) : c
      )
    );
  }, []);

  const draftToCard = (d: CardDraft): Flashcard => ({
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
    box: 1,
    dueAt: 0,
  });

  const handleImport = (drafts: CardDraft[]) => {
    setCards((prev) => [...prev, ...drafts.map(draftToCard)]);
    const importedDecks = new Set(drafts.map((d) => d.deck));
    if (importedDecks.size === 1) setActiveDeck(Array.from(importedDecks)[0]);
  };

  const handleAdd = (draft: CardDraft) => handleImport([draft]);

  const handleUpdate = (id: string, draft: CardDraft) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              hanzi: draft.hanzi,
              pinyin: draft.pinyin,
              english: draft.english,
              imageUrl: draft.imageUrl,
              deck: draft.deck,
            }
          : c
      )
    );
  };

  const handleDelete = (id: string) =>
    setCards((prev) => prev.filter((c) => c.id !== id));

  const handleRestore = (restored: Flashcard[]) => {
    setCards(restored);
    setActiveDeck(ALL_DECKS);
  };

  const handleReset = () => {
    setCards(DEFAULT_CARDS.map((c) => ({ ...c, id: createId() })));
    setActiveDeck(ALL_DECKS);
  };

  const openAdd = () => {
    setEditCard(null);
    setFormOpen(true);
  };

  const openEdit = (card: Flashcard) => {
    setEditCard(card);
    setFormOpen(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -right-20 top-40 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-xl flex-col px-4 pb-10 pt-6 sm:px-6">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setManageOpen(true)}
              aria-label="Manage cards"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-white/70 text-sky-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-sky-800"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-white/70 text-sky-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-sky-800"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 px-4 py-3 font-semibold text-white shadow-lg shadow-sky-300/50 transition hover:brightness-105 active:scale-[0.98]"
          >
            <Upload className="h-5 w-5" />
            Import CSV
          </button>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white/80 px-4 py-3 font-semibold text-sky-600 shadow-sm backdrop-blur transition hover:bg-white active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Add card
          </button>
        </div>

        <div className="mb-4">
          <DeckSelector
            decks={decks}
            active={activeDeck}
            counts={counts}
            onSelect={setActiveDeck}
          />
        </div>

        {/* Study mode: spaced-repetition queue vs. the whole deck */}
        <div className="mb-5 flex gap-2 rounded-2xl border border-sky-100 bg-white/60 p-1">
          <button
            onClick={() => setMode("due")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              mode === "due"
                ? "bg-sky-500 text-white shadow-md shadow-sky-200"
                : "text-sky-600 hover:bg-sky-50"
            }`}
          >
            <CalendarClock className="h-4 w-4" />
            Due now
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                mode === "due" ? "bg-white/25" : "bg-sky-100"
              }`}
            >
              {dueCards.length}
            </span>
          </button>
          <button
            onClick={() => setMode("all")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              mode === "all"
                ? "bg-sky-500 text-white shadow-md shadow-sky-200"
                : "text-sky-600 hover:bg-sky-50"
            }`}
          >
            <Layers3 className="h-4 w-4" />
            All cards
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                mode === "all" ? "bg-white/25" : "bg-sky-100"
              }`}
            >
              {deckCards.length}
            </span>
          </button>
        </div>

        <div className="flex-1">
          {hydrated ? (
            <StudyView
              cards={visibleCards}
              deckName={activeDeck}
              mode={mode}
              nextDueAt={nextDueAt}
              onGrade={handleGrade}
              onStudyAll={() => setMode("all")}
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
      <ManageCardsModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        cards={cards}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
      <CardFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        decks={decks}
        editCard={editCard}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
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
