"use client";

import { ImageIcon, Volume2 } from "lucide-react";
import { useState } from "react";
import type { Flashcard as FlashcardType } from "@/lib/types";
import { speakMandarin, speechSupported } from "@/lib/speech";

interface FlashcardProps {
  card: FlashcardType;
  flipped: boolean;
  onFlip: () => void;
}

export default function Flashcard({ card, flipped, onFlip }: FlashcardProps) {
  const [imgError, setImgError] = useState(false);
  const canSpeak = speechSupported();

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
        {/* FRONT — image + prompt */}
        <div className="flip-face">
          <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-sky-100 bg-white/80 shadow-xl shadow-sky-100/60 backdrop-blur-md">
            <div className="relative flex-1 bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100">
              {card.imageUrl && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.imageUrl}
                  alt={card.english}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-sky-300">
                  <ImageIcon className="h-16 w-16" strokeWidth={1.5} />
                  <span className="text-sm font-medium text-sky-400">
                    No image
                  </span>
                </div>
              )}
              {canSpeak && (
                <button
                  onClick={handleSpeak}
                  aria-label="Play pronunciation"
                  className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-sky-600 shadow-lg shadow-sky-200/60 backdrop-blur transition hover:scale-105 hover:bg-white hover:text-sky-700 active:scale-95"
                >
                  <Volume2 className="h-6 w-6" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 border-t border-sky-100 bg-white/70 px-6 py-5 text-center">
              <p className="text-sm font-medium text-sky-500">
                Tap the card to reveal the answer
              </p>
            </div>
          </div>
        </div>

        {/* BACK — hanzi, pinyin, english */}
        <div className="flip-face flip-face--back">
          <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-blue-50 px-6 text-center shadow-xl shadow-sky-100/60">
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-600">
              {card.deck}
            </span>
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
