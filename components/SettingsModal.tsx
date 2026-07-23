"use client";

import { useRef, useState } from "react";
import type { AppData, Flashcard } from "@/lib/types";
import { cardsToCsv } from "@/lib/csv";
import { normalizeCard } from "@/lib/storage";
import Modal from "./Modal";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  cards: Flashcard[];
  onRestore: (cards: Flashcard[]) => void;
  onReset: () => void;
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const outlineButton =
  "border border-ink-200 px-4 py-3 text-sm font-medium text-ink-600 transition hover:border-ink-800 hover:text-ink-900 active:scale-[0.98]";

export default function SettingsModal({
  open,
  onClose,
  cards,
  onRestore,
  onReset,
}: SettingsModalProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const stamp = new Date().toISOString().slice(0, 10);

  const exportJson = () => {
    const data: AppData = { version: 1, cards };
    download(
      `mandarin-flashcards-${stamp}.json`,
      JSON.stringify(data, null, 2),
      "application/json"
    );
  };

  const exportCsv = () => {
    download(
      `mandarin-flashcards-${stamp}.csv`,
      cardsToCsv(cards),
      "text/csv;charset=utf-8"
    );
  };

  const handleRestoreFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppData;
        if (!parsed || !Array.isArray(parsed.cards)) {
          setMessage("That file doesn't look like a valid backup.");
          return;
        }
        // Backups from an older version may predate the spaced-repetition
        // fields, so normalise them on the way in.
        const restored = parsed.cards.map(normalizeCard);
        onRestore(restored);
        setMessage(`Restored ${restored.length} cards.`);
      } catch {
        setMessage("Could not read that JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const mastered = cards.filter((c) => c.status === "mastered").length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Settings & backup"
      subtitle="Your data lives only in this browser"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-stretch divide-x divide-ink-200 border border-ink-200">
          <div className="flex-1 px-5 py-3">
            <p className="font-serif text-3xl text-ink-900">{cards.length}</p>
            <p className="label-caps mt-1 text-ink-400">Total cards</p>
          </div>
          <div className="flex-1 px-5 py-3">
            <p className="font-serif text-3xl text-jade-600">{mastered}</p>
            <p className="label-caps mt-1 text-ink-400">Mastered</p>
          </div>
        </div>

        <div>
          <p className="label-caps mb-2 text-ink-400">Export a backup</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={exportJson} className={outlineButton}>
              JSON
            </button>
            <button onClick={exportCsv} className={outlineButton}>
              CSV
            </button>
          </div>
        </div>

        <div>
          <p className="label-caps mb-2 text-ink-400">Restore from JSON</p>
          <button
            onClick={() => fileRef.current?.click()}
            className={`w-full ${outlineButton}`}
          >
            Choose backup file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => handleRestoreFile(e.target.files)}
          />
          <p className="mt-2 text-xs text-ink-400">
            Restoring replaces all cards currently in this browser.
          </p>
        </div>

        {message && (
          <p className="border-l-2 border-ink-800 bg-ink-50 px-3 py-2 text-sm text-ink-700">
            {message}
          </p>
        )}

        <div className="border-l-2 border-cinnabar-500 pl-4">
          <p className="label-caps mb-2 text-cinnabar-600">Reset everything</p>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-sm font-medium text-cinnabar-600 transition hover:text-cinnabar-700"
            >
              Restore default cards
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-ink-600">
                This deletes your custom cards and progress, then reloads the 16
                starter cards. Consider exporting a backup first.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 transition hover:border-ink-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onReset();
                    setConfirmReset(false);
                    setMessage("Reset to default cards.");
                  }}
                  className="flex-1 border border-cinnabar-500 bg-cinnabar-500 px-3 py-2 text-sm font-medium text-paper-card transition hover:bg-cinnabar-600"
                >
                  Yes, reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
