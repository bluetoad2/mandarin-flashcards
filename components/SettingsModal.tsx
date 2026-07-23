"use client";

import { Download, FileJson, FileSpreadsheet, RotateCcw, Trash2 } from "lucide-react";
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
      <div className="flex flex-col gap-5">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-sky-100 bg-sky-50/50 px-4 py-3">
            <p className="text-2xl font-black text-sky-700">{cards.length}</p>
            <p className="text-sm text-sky-500">Total cards</p>
          </div>
          <div className="rounded-2xl border border-mint-400/20 bg-mint-500/10 px-4 py-3">
            <p className="text-2xl font-black text-mint-600">{mastered}</p>
            <p className="text-sm text-mint-600/80">Mastered</p>
          </div>
        </div>

        {/* Export */}
        <div>
          <p className="mb-2 text-sm font-semibold text-sky-800">
            Export / backup
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportJson}
              className="flex items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white px-4 py-3 font-semibold text-sky-600 transition hover:bg-sky-50 active:scale-[0.98]"
            >
              <FileJson className="h-5 w-5" />
              JSON
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white px-4 py-3 font-semibold text-sky-600 transition hover:bg-sky-50 active:scale-[0.98]"
            >
              <FileSpreadsheet className="h-5 w-5" />
              CSV
            </button>
          </div>
        </div>

        {/* Restore */}
        <div>
          <p className="mb-2 text-sm font-semibold text-sky-800">
            Restore from JSON backup
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white px-4 py-3 font-semibold text-sky-600 transition hover:bg-sky-50 active:scale-[0.98]"
          >
            <Download className="h-5 w-5" />
            Choose backup file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => handleRestoreFile(e.target.files)}
          />
          <p className="mt-1.5 text-xs text-sky-400">
            Restoring replaces all cards currently in this browser.
          </p>
        </div>

        {message && (
          <p className="rounded-lg bg-sky-100 px-3 py-2 text-sm font-medium text-sky-700">
            {message}
          </p>
        )}

        {/* Danger zone */}
        <div className="rounded-2xl border border-coral-400/20 bg-coral-500/5 p-4">
          <p className="mb-2 text-sm font-semibold text-coral-600">
            Reset everything
          </p>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-coral-600 transition hover:bg-coral-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Restore default cards
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-coral-600/90">
                This deletes your custom cards and progress, then reloads the 16
                starter cards. Consider exporting a backup first.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 rounded-xl border border-sky-100 bg-white px-3 py-2 text-sm font-semibold text-sky-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onReset();
                    setConfirmReset(false);
                    setMessage("Reset to default cards.");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-coral-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-coral-600"
                >
                  <RotateCcw className="h-4 w-4" />
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
