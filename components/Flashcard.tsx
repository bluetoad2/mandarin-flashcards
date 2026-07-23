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
        {/* FRONT — the prompt: image (when present) plus the Hanzi to recall */}
        <div className="flip-face">
          <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-sky-100 bg-white/80 shadow-xl shadow-sky-100/60 backdrop-blur-md">
            {hasImage && (
              <div className="relative h-1/2 shrink-0 bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.imageUrl}
                  alt={card.english}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-1 flex-col items-center justify-center gap-5 bg-gradient-to-br from-white via-sky-50/60 to-blue-50/60 px-6 py-6 text-center">
              <p
                className={`font-hanzi font-black leading-none text-slate-800 ${
                  hasImage ? "text-6xl" : "text-8xl sm:text-9xl"
                }`}
              >
                {prompt}
              </p>
              {!card.hanzi && (
                <span className="text-sm font-medium text-sky-400">
                  Recall the Chinese
                </span>
              )}
            </div>

            {canSpeak && (
              <button
                onClick={handleSpeak}
                aria-label="Play pronunciation"
                className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-sky-600 shadow-lg shadow-sky-200/60 backdrop-blur transition hover:scale-105 hover:bg-white hover:text-sky-700 active:scale-95"
              >
                <Volume2 className="h-6 w-6" />
              </button>
            )}

            <div className="flex items-center justify-center gap-2 border-t border-sky-100 bg-white/70 px-6 py-4 text-center">
              <p className="text-sm font-medium text-sky-500">
                Tap the card to reveal the answer
              </p>
            </div>
          </div>
        </div>

        {/* BACK — hanzi, pinyin, english */}
        <div className="flip-face flip-face--back">
          <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-blue-50 px-6 text-center shadow-xl shadow-sky-100/60">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-600">
                {card.deck}
              </span>
              {/* Leitner progress: filled pips = how far up the boxes this card is */}
              <span
                className="flex items-center gap-1"
                title={`Box ${card.box} of ${MAX_BOX}`}
              >
                {Array.from({ length: MAX_BOX }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${
                      i < card.box ? "bg-mint-500" : "bg-sky-200"
                    }`}
                  />
                ))}
              </span>
            </div>
            <p className="font-hanzi text-7xl font-black leading-none text-slate-800 sm:text-8xl">
              {card.hanzi}
            </p>
            <p className="text-2xl font-semibold text-sky-600 sm:text-3xl">
              {card.pinyin}
            </p>
            <p className="text-lg text-slate-600 sm:text-xl">{card.english}</p>
            {canSpeak && (
              <button
                onClick={handleSpeak}
                aria-label="Play pronunciation"
                className="mt-1 flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-300/50 transition hover:bg-sky-600 active:scale-95"
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
