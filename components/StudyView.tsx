"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Flashcard as FlashcardType, StudyStatus } from "@/lib/types";
import Flashcard from "./Flashcard";

interface StudyViewProps {
  cards: FlashcardType[];
  deckName: string;
  onGrade: (cardId: string, status: StudyStatus) => void;
}

export default function StudyView({ cards, deckName, onGrade }: StudyViewProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(1);

  // Reset to the start whenever the deck changes or the deck size shrinks.
  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [deckName]);

  useEffect(() => {
    if (index > cards.length - 1) {
      setIndex(cards.length > 0 ? cards.length - 1 : 0);
    }
  }, [cards.length, index]);

  const masteredCount = useMemo(
    () => cards.filter((c) => c.status === "mastered").length,
    [cards]
  );

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-sky-200 bg-white/60 px-6 py-20 text-center">
        <Sparkles className="h-10 w-10 text-sky-300" />
        <p className="text-lg font-semibold text-sky-800">No cards here yet</p>
        <p className="max-w-xs text-sm text-sky-500">
          Add a card manually or import a CSV to start studying this deck.
        </p>
      </div>
    );
  }

  const card = cards[index];

  const advance = (delta: number) => {
    setDirection(delta);
    setFlipped(false);
    setIndex((prev) => (prev + delta + cards.length) % cards.length);
  };

  const grade = (status: StudyStatus) => {
    onGrade(card.id, status);
    // Small delay lets the button state feel responsive before the card swaps.
    window.setTimeout(() => advance(1), 120);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex items-center justify-between px-1 text-sm">
        <span className="font-semibold text-sky-700">
          Card {index + 1}
          <span className="text-sky-400"> / {cards.length}</span>
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-mint-500/10 px-3 py-1 font-semibold text-mint-600">
          <Check className="h-3.5 w-3.5" />
          {masteredCount} mastered
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-sky-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500"
          style={{ width: `${((index + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={card.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
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

      {/* Study actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => grade("learning")}
          className="flex items-center justify-center gap-2 rounded-2xl border border-coral-400/30 bg-coral-500/10 px-4 py-4 font-semibold text-coral-600 transition hover:bg-coral-500/20 active:scale-[0.98]"
        >
          <X className="h-5 w-5" />
          Needs Review
        </button>
        <button
          onClick={() => grade("mastered")}
          className="flex items-center justify-center gap-2 rounded-2xl border border-mint-400/30 bg-mint-500/10 px-4 py-4 font-semibold text-mint-600 transition hover:bg-mint-500/20 active:scale-[0.98]"
        >
          <Check className="h-5 w-5" />
          Got It
        </button>
      </div>

      <div className="flex items-center justify-center">
        <button
          onClick={() => advance(1)}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-sky-500 transition hover:bg-sky-50 hover:text-sky-700"
        >
          <RotateCcw className="h-4 w-4" />
          Skip
        </button>
      </div>
    </div>
  );
}
