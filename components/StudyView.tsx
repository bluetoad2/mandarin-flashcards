"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, PartyPopper, RotateCcw, Sparkles, X } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-sky-200 bg-white/60 px-6 py-16 text-center">
        {caughtUp ? (
          <>
            <PartyPopper className="h-10 w-10 text-mint-500" />
            <p className="text-lg font-semibold text-sky-800">All caught up!</p>
            <p className="max-w-xs text-sm text-sky-500">
              Nothing is due in this deck right now. Next review{" "}
              <span className="font-semibold text-sky-600">
                {formatDueIn(nextDueAt)}
              </span>
              .
            </p>
            <button
              onClick={onStudyAll}
              className="mt-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-300/50 transition hover:bg-sky-600 active:scale-95"
            >
              Study ahead anyway
            </button>
          </>
        ) : (
          <>
            <Sparkles className="h-10 w-10 text-sky-300" />
            <p className="text-lg font-semibold text-sky-800">
              No cards here yet
            </p>
            <p className="max-w-xs text-sm text-sky-500">
              Add a card manually or import a CSV to start studying this deck.
            </p>
          </>
        )}
      </div>
    );
  }

  // ---- Session complete ---------------------------------------------------

  if (!card) {
    const accuracy = answered > 0 ? Math.round((stats.right / answered) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-sky-100 bg-white/80 px-6 py-14 text-center shadow-xl shadow-sky-100/60">
        <PartyPopper className="h-12 w-12 text-mint-500" />
        <p className="text-xl font-black text-sky-900">Session complete</p>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-mint-500/10 px-5 py-3">
            <p className="text-2xl font-black text-mint-600">{stats.right}</p>
            <p className="text-xs font-medium text-mint-600/80">Got it</p>
          </div>
          <div className="rounded-2xl bg-coral-500/10 px-5 py-3">
            <p className="text-2xl font-black text-coral-600">{stats.wrong}</p>
            <p className="text-xs font-medium text-coral-600/80">Missed</p>
          </div>
          <div className="rounded-2xl bg-sky-100 px-5 py-3">
            <p className="text-2xl font-black text-sky-700">{accuracy}%</p>
            <p className="text-xs font-medium text-sky-500">Accuracy</p>
          </div>
        </div>
        <button
          onClick={restart}
          className="mt-1 flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-300/50 transition hover:bg-sky-600 active:scale-95"
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
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between px-1 text-sm">
        <span className="font-semibold text-sky-700">
          {queue.length}
          <span className="text-sky-400"> left</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-mint-600">
            <Check className="h-3.5 w-3.5" />
            {stats.right}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-coral-500">
            <X className="h-3.5 w-3.5" />
            {stats.wrong}
          </span>
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-sky-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
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
          className="flex items-center justify-center gap-2 rounded-2xl border border-coral-400/30 bg-coral-500/10 px-4 py-4 font-semibold text-coral-600 transition hover:bg-coral-500/20 active:scale-[0.98]"
        >
          <X className="h-5 w-5" />
          Needs Review
        </button>
        <button
          onClick={() => grade(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-mint-400/30 bg-mint-500/10 px-4 py-4 font-semibold text-mint-600 transition hover:bg-mint-500/20 active:scale-[0.98]"
        >
          <Check className="h-5 w-5" />
          Got It
        </button>
      </div>

      <div className="flex items-center justify-center">
        <button
          onClick={skip}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-sky-500 transition hover:bg-sky-50 hover:text-sky-700"
        >
          <RotateCcw className="h-4 w-4" />
          Skip
        </button>
      </div>
    </div>
  );
}
