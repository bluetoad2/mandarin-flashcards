"use client";

import { Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { CardDraft, Flashcard } from "@/lib/types";
import { toAccentedPinyin } from "@/lib/pinyin";
import Modal from "./Modal";

interface CardFormModalProps {
  open: boolean;
  onClose: () => void;
  decks: string[];
  /** When set, the form edits this card instead of creating a new one. */
  editCard?: Flashcard | null;
  onAdd: (draft: CardDraft) => void;
  onUpdate: (id: string, draft: CardDraft) => void;
}

const inputClass =
  "w-full rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-2.5 text-slate-800 outline-none transition placeholder:text-sky-300 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200";
const labelClass = "mb-1.5 block text-sm font-semibold text-sky-800";

const EMPTY = { hanzi: "", pinyin: "", english: "", imageUrl: "", deck: "" };

export default function CardFormModal({
  open,
  onClose,
  decks,
  editCard,
  onAdd,
  onUpdate,
}: CardFormModalProps) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const isEdit = Boolean(editCard);

  // Load the card being edited (or clear the form) whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      editCard
        ? {
            hanzi: editCard.hanzi,
            pinyin: editCard.pinyin,
            english: editCard.english,
            imageUrl: editCard.imageUrl ?? "",
            deck: editCard.deck,
          }
        : EMPTY
    );
  }, [open, editCard]);

  const set = (key: keyof typeof EMPTY, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hanzi.trim() && !form.english.trim()) {
      setError("Add at least a Hanzi character or an English meaning.");
      return;
    }
    const draft: CardDraft = {
      hanzi: form.hanzi.trim(),
      pinyin: toAccentedPinyin(form.pinyin.trim()),
      english: form.english.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      deck: form.deck.trim() || "Custom",
    };
    if (editCard) onUpdate(editCard.id, draft);
    else onAdd(draft);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit card" : "Add a card"}
      subtitle={
        isEdit ? "Update this card's details" : "Create a single flashcard by hand"
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass}>Hanzi (Chinese)</label>
          <input
            className={`${inputClass} font-hanzi text-lg`}
            value={form.hanzi}
            onChange={(e) => set("hanzi", e.target.value)}
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
            value={form.pinyin}
            onChange={(e) => set("pinyin", e.target.value)}
            placeholder="nǐ hǎo"
          />
        </div>
        <div>
          <label className={labelClass}>English meaning</label>
          <input
            className={inputClass}
            value={form.english}
            onChange={(e) => set("english", e.target.value)}
            placeholder="Hello"
          />
        </div>
        <div>
          <label className={labelClass}>Image URL (optional)</label>
          <input
            className={inputClass}
            value={form.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div>
          <label className={labelClass}>Deck</label>
          <input
            className={inputClass}
            value={form.deck}
            onChange={(e) => set("deck", e.target.value)}
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
            onClick={onClose}
            className="flex-1 rounded-xl border border-sky-100 bg-white px-4 py-3 font-semibold text-sky-600 transition hover:bg-sky-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white shadow-lg shadow-sky-300/50 transition hover:bg-sky-600 active:scale-[0.98]"
          >
            {isEdit ? (
              <>
                <Save className="h-5 w-5" />
                Save changes
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Add card
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
