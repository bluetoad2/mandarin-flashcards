"use client";

import { List, Plus, Settings, Upload } from "lucide-react";
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

  const iconButton =
    "flex h-9 w-9 items-center justify-center border border-ink-200 text-ink-500 transition hover:border-ink-800 hover:text-ink-900";

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 pb-12 pt-7 sm:px-6">
        {/* Masthead */}
        <header className="mb-7 flex items-center justify-between border-b border-ink-800 pb-4">
          <div className="flex items-center gap-3">
            {/* Seal mark */}
            <span className="flex h-10 w-10 items-center justify-center bg-cinnabar-500 font-hanzi text-xl text-paper-card">
              学
            </span>
            <div>
              <h1 className="font-serif text-2xl leading-none text-ink-900">
                Mandarin
              </h1>
              <p className="label-caps mt-1 text-ink-400">Flashcards</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setManageOpen(true)}
              aria-label="Manage cards"
              className={iconButton}
            >
              <List className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              className={iconButton}
            >
              <Settings className="h-[18px] w-[18px]" />
            </button>
          </div>
        </header>

        {/* Primary actions */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center justify-center gap-2 border border-ink-800 bg-ink-900 px-4 py-3 text-sm font-medium text-paper transition hover:bg-ink-800 active:scale-[0.98]"
          >
            <Upload className="h-[18px] w-[18px]" />
            Import CSV
          </button>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 border border-ink-300 px-4 py-3 text-sm font-medium text-ink-700 transition hover:border-ink-800 hover:text-ink-900 active:scale-[0.98]"
          >
            <Plus className="h-[18px] w-[18px]" />
            Add card
          </button>
        </div>

        {/* Decks */}
        <div className="mb-5">
          <DeckSelector
            decks={decks}
            active={activeDeck}
            counts={counts}
            onSelect={setActiveDeck}
          />
        </div>

        {/* Study mode: spaced-repetition queue vs. the whole deck */}
        <div className="mb-6 flex items-center gap-5">
          {(
            [
              ["due", "Due now", dueCards.length],
              ["all", "All cards", deckCards.length],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`flex items-center gap-2 text-sm transition ${
                mode === value
                  ? "text-ink-900"
                  : "text-ink-400 hover:text-ink-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 ${
                  mode === value ? "bg-cinnabar-500" : "bg-ink-200"
                }`}
              />
              {label}
              <span className="font-serif text-xs text-ink-400">{count}</span>
            </button>
          ))}
        </div>

        {/* Study area */}
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
            <div className="h-[26rem] w-full animate-pulse border border-ink-200 bg-paper-card sm:h-[30rem]" />
          )}
        </div>

        <footer className="mt-10 border-t border-ink-200 pt-4 text-center">
          <p className="label-caps text-ink-300">
            Stored locally · no account needed
          </p>
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
