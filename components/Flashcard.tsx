"use client";

import { Volume2 } from "lucide-react";
import { useState } from "react";
import type { Flashcard as FlashcardType } from "@/lib/types";
import { speakMandarin, speechSupported } from "@/lib/speech";
import { MAX_BOX } from "@/lib/srs";

interface FlashcardProps {
  card: FlashcardType;
  flipped: boolean;
  onFlip: () => void;
}

export default function Flashcard({ card, flipped, onFlip }: FlashcardProps) {
  const [imgError, setImgError] = useState(false);
  const canSpeak = speechSupported();
  const hasImage = Boolean(card.imageUrl) && !imgError;
  // Cards without an image would otherwise show a blank front, so the Hanzi
  // itself becomes the prompt (falling back to English for English-only cards).
  const prompt = card.hanzi || card.english;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakMandarin(card.hanzi);
  };

  return (
    <div className="flip-perspective h-[26rem] w-full select-none sm:h-[30rem]">
      <div
        className={`flip-inner cursor-pointer ${flipped ? "is-flipped" : ""}`}
        onClick={onFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onFlip();
          }
        }}
        aria-label="Flashcard, press to flip"
      >
        {/* FRONT — the prompt: the character itself, given room to breathe */}
        <div className="flip-face">
          <div className="relative flex h-full flex-col overflow-hidden border border-ink-200 bg-paper-card">
            {hasImage && (
              <div className="relative h-[42%] shrink-0 border-b border-ink-200 bg-ink-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.imageUrl}
                  alt={card.english}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-1 items-center justify-center px-6">
              <p
                className={`font-hanzi leading-none text-ink-900 ${
                  hasImage ? "text-7xl" : "text-[7rem] sm:text-[9rem]"
                }`}
              >
                {prompt}
              </p>
            </div>

            {canSpeak && (
              <button
                onClick={handleSpeak}
                aria-label="Play pronunciation"
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center border border-ink-200 bg-paper-card text-ink-500 transition hover:border-cinnabar-500 hover:text-cinnabar-500 active:scale-95"
              >
                <Volume2 className="h-[18px] w-[18px]" />
              </button>
            )}

            <div className="border-t border-ink-200 px-6 py-3.5 text-center">
              <p className="label-caps text-ink-400">Tap to reveal</p>
            </div>
          </div>
        </div>

        {/* BACK — the answer */}
        <div className="flip-face flip-face--back">
          <div className="relative flex h-full flex-col items-center justify-center gap-5 border border-ink-800 bg-paper-card px-6 text-center">
            <div className="absolute left-0 right-0 top-0 flex items-center justify-between border-b border-ink-200 px-4 py-3">
              <span className="label-caps text-ink-400">{card.deck}</span>
              {/* Leitner progress: filled marks = how far up the boxes this card is */}
              <span
                className="flex items-center gap-[3px]"
                title={`Box ${card.box} of ${MAX_BOX}`}
              >
                {Array.from({ length: MAX_BOX }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-[3px] w-3 ${
                      i < card.box ? "bg-jade-600" : "bg-ink-200"
                    }`}
                  />
                ))}
              </span>
            </div>

            <p className="font-hanzi text-6xl leading-none text-ink-900 sm:text-7xl">
              {card.hanzi}
            </p>
            <p className="font-serif text-3xl italic text-cinnabar-500 sm:text-4xl">
              {card.pinyin}
            </p>
            <div className="h-px w-12 bg-ink-200" />
            <p className="text-lg text-ink-600 sm:text-xl">{card.english}</p>

            {canSpeak && (
              <button
                onClick={handleSpeak}
                aria-label="Play pronunciation"
                className="mt-1 flex items-center gap-2 border border-ink-300 px-4 py-2 text-sm font-medium text-ink-600 transition hover:border-cinnabar-500 hover:text-cinnabar-500 active:scale-95"
              >
                <Volume2 className="h-4 w-4" />
                Listen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
