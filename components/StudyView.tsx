"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Flashcard as FlashcardType, StudyMode } from "@/lib/types";
import { formatDueIn, nextQueue, skipInQueue } from "@/lib/srs";
import Flashcard from "./Flashcard";

interface StudyViewProps {
  /** Cards already filtered by deck and study mode. */
  cards: FlashcardType[];
  deckName: string;
  mode: StudyMode;
  /** Soonest due time in this deck, used by the caught-up screen. */
  nextDueAt: number | null;
  onGrade: (cardId: string, correct: boolean) => void;
  onStudyAll: () => void;
}

export default function StudyView({
  cards,
  deckName,
  mode,
  nextDueAt,
  onGrade,
  onStudyAll,
}: StudyViewProps) {
  const [queue, setQueue] = useState<string[]>([]);
  const [stats, setStats] = useState({ right: 0, wrong: 0 });
  const [flipped, setFlipped] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  // In "due" mode a correct answer removes the card from `cards`, so the queue
  // is seeded once per session from a ref rather than tracking the array —
  // otherwise every answer would rebuild the queue and reset the score.
  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const ids = cardsRef.current.map((c) => c.id);
    seenRef.current = new Set(ids);
    setQueue(ids);
    setStats({ right: 0, wrong: 0 });
    setFlipped(false);
  }, [deckName, mode, sessionKey]);

  // Keep the queue in step with cards added or deleted mid-session, without
  // disturbing the cards still waiting to be answered.
  useEffect(() => {
    const present = new Set(cards.map((c) => c.id));
    const added = cards
      .filter((c) => !seenRef.current.has(c.id))
      .map((c) => c.id);
    added.forEach((id) => seenRef.current.add(id));

    setQueue((q) => {
      const pruned = q.filter((id) => present.has(id));
      const next = added.length > 0 ? [...pruned, ...added] : pruned;
      const unchanged =
        next.length === q.length && next.every((id, i) => id === q[i]);
      return unchanged ? q : next;
    });
  }, [cards]);

  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);

  // First queued card that still exists, so a deletion never blanks the view.
  const card = useMemo(() => {
    for (const id of queue) {
      const found = byId.get(id);
      if (found) return found;
    }
    return undefined;
  }, [queue, byId]);

  const answered = stats.right + stats.wrong;
  const restart = () => setSessionKey((k) => k + 1);

  const grade = (correct: boolean) => {
    if (!card) return;
    onGrade(card.id, correct);
    setStats((s) => ({
      right: s.right + (correct ? 1 : 0),
      wrong: s.wrong + (correct ? 0 : 1),
    }));
    setFlipped(false);
    const id = card.id;
    setQueue((q) => nextQueue(q, id, correct));
  };

  const skip = () => {
    if (!card) return;
    setFlipped(false);
    const id = card.id;
    setQueue((q) => skipInQueue(q, id));
  };

  // ---- Empty states -------------------------------------------------------

  if (cards.length === 0) {
    const caughtUp = mode === "due" && nextDueAt !== null;
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-ink-200 px-6 py-20 text-center">
        {caughtUp ? (
          <>
            <p className="font-hanzi text-5xl text-cinnabar-500">好</p>
            <p className="mt-1 text-lg text-ink-800">All caught up</p>
            <p className="max-w-xs text-sm text-ink-500">
              Nothing is due in this deck. Next review{" "}
              <span className="text-ink-800">{formatDueIn(nextDueAt)}</span>.
            </p>
            <button
              onClick={onStudyAll}
              className="mt-2 border border-ink-800 bg-ink-900 px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-ink-800 active:scale-[0.98]"
            >
              Study ahead anyway
            </button>
          </>
        ) : (
          <>
            <p className="font-hanzi text-5xl text-ink-300">空</p>
            <p className="mt-1 text-lg text-ink-800">No cards here yet</p>
            <p className="max-w-xs text-sm text-ink-500">
              Add a card by hand or import a CSV to start studying this deck.
            </p>
          </>
        )}
      </div>
    );
  }

  // ---- Session complete ---------------------------------------------------

  if (!card) {
    const accuracy =
      answered > 0 ? Math.round((stats.right / answered) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center gap-5 border border-ink-200 bg-paper-card px-6 py-14 text-center">
        <p className="font-hanzi text-5xl text-cinnabar-500">完</p>
        <p className="label-caps text-ink-400">Session complete</p>
        <div className="flex items-stretch divide-x divide-ink-200 border border-ink-200">
          <div className="px-6 py-3">
            <p className="font-serif text-3xl text-jade-600">{stats.right}</p>
            <p className="label-caps mt-1 text-ink-400">Got it</p>
          </div>
          <div className="px-6 py-3">
            <p className="font-serif text-3xl text-cinnabar-500">
              {stats.wrong}
            </p>
            <p className="label-caps mt-1 text-ink-400">Missed</p>
          </div>
          <div className="px-6 py-3">
            <p className="font-serif text-3xl text-ink-800">{accuracy}%</p>
            <p className="label-caps mt-1 text-ink-400">Accuracy</p>
          </div>
        </div>
        <button
          onClick={restart}
          className="flex items-center gap-2 border border-ink-800 bg-ink-900 px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-ink-800 active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" />
          Study again
        </button>
      </div>
    );
  }

  // ---- Active session -----------------------------------------------------

  const total = queue.length + stats.right;
  const progress = total > 0 ? (stats.right / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <span className="label-caps text-ink-400">
          {queue.length} remaining
        </span>
        <span className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-jade-600">
            <Check className="h-3.5 w-3.5" />
            {stats.right}
          </span>
          <span className="flex items-center gap-1.5 text-cinnabar-500">
            <X className="h-3.5 w-3.5" />
            {stats.wrong}
          </span>
        </span>
      </div>

      <div className="h-px w-full bg-ink-200">
        <div
          className="h-px bg-ink-800 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <Flashcard
              card={card}
              flipped={flipped}
              onFlip={() => setFlipped((f) => !f)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => grade(false)}
          className="flex items-center justify-center gap-2 border border-cinnabar-500 px-4 py-3.5 font-medium text-cinnabar-600 transition hover:bg-cinnabar-50 active:scale-[0.98]"
        >
          <X className="h-[18px] w-[18px]" />
          Needs review
        </button>
        <button
          onClick={() => grade(true)}
          className="flex items-center justify-center gap-2 border border-jade-600 bg-jade-600 px-4 py-3.5 font-medium text-paper transition hover:bg-jade-700 active:scale-[0.98]"
        >
          <Check className="h-[18px] w-[18px]" />
          Got it
        </button>
      </div>

      <div className="flex items-center justify-center">
        <button
          onClick={skip}
          className="label-caps px-4 py-2 text-ink-400 transition hover:text-ink-700"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
