"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { CardDraft } from "@/lib/types";
import { toAccentedPinyin } from "@/lib/pinyin";
import Modal from "./Modal";

interface AddCardModalProps {
  open: boolean;
  onClose: () => void;
  decks: string[];
  onAdd: (draft: CardDraft) => void;
}

const inputClass =
  "w-full rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-2.5 text-slate-800 outline-none transition placeholder:text-sky-300 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200";
const labelClass = "mb-1.5 block text-sm font-semibold text-sky-800";

export default function AddCardModal({
  open,
  onClose,
  decks,
  onAdd,
}: AddCardModalProps) {
  const [hanzi, setHanzi] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [english, setEnglish] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [deck, setDeck] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setHanzi("");
    setPinyin("");
    setEnglish("");
    setImageUrl("");
    setDeck("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hanzi.trim() && !english.trim()) {
      setError("Add at least a Hanzi character or an English meaning.");
      return;
    }
    onAdd({
      hanzi: hanzi.trim(),
      pinyin: toAccentedPinyin(pinyin.trim()),
      english: english.trim(),
      imageUrl: imageUrl.trim() || undefined,
      deck: deck.trim() || "Custom",
    });
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add a card"
      subtitle="Create a single flashcard by hand"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass}>Hanzi (Chinese)</label>
          <input
            className={`${inputClass} font-hanzi text-lg`}
            value={hanzi}
            onChange={(e) => setHanzi(e.target.value)}
            placeholder="你好"
          />
        </div>
        <div>
          <label className={labelClass}>
            Pinyin{" "}
            <span className="font-normal text-sky-400">
              (numbers like ni3 auto-convert)
            </span>
          </label>
          <input
            className={inputClass}
            value={pinyin}
            onChange={(e) => setPinyin(e.target.value)}
            placeholder="nǐ hǎo"
          />
        </div>
        <div>
          <label className={labelClass}>English meaning</label>
          <input
            className={inputClass}
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            placeholder="Hello"
          />
        </div>
        <div>
          <label className={labelClass}>Image URL (optional)</label>
          <input
            className={inputClass}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div>
          <label className={labelClass}>Deck</label>
          <input
            className={inputClass}
            value={deck}
            onChange={(e) => setDeck(e.target.value)}
            placeholder="e.g. Greetings"
            list="deck-options"
          />
          <datalist id="deck-options">
            {decks.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>

        {error && (
          <p className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm font-medium text-coral-600">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-xl border border-sky-100 bg-white px-4 py-3 font-semibold text-sky-600 transition hover:bg-sky-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white shadow-lg shadow-sky-300/50 transition hover:bg-sky-600 active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Add card
          </button>
        </div>
      </form>
    </Modal>
  );
}
