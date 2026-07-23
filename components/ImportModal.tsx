"use client";

import { UploadCloud } from "lucide-react";
import Papa from "papaparse";
import { useRef, useState } from "react";
import type { CardDraft, ColumnMapping } from "@/lib/types";
import { autoDetectMapping, rowsToDrafts } from "@/lib/csv";
import Modal from "./Modal";

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (drafts: CardDraft[]) => void;
}

type Step = "upload" | "map";

const FIELDS: { key: keyof ColumnMapping; label: string; required: boolean }[] = [
  { key: "hanzi", label: "Hanzi", required: true },
  { key: "pinyin", label: "Pinyin", required: false },
  { key: "english", label: "English", required: false },
  { key: "imageUrl", label: "Image URL", required: false },
  { key: "deck", label: "Deck", required: false },
];

const fieldClass =
  "w-full border border-ink-200 bg-paper-bright px-3 py-2.5 text-ink-900 outline-none transition focus:border-cinnabar-500";

export default function ImportModal({
  open,
  onClose,
  onImport,
}: ImportModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    hanzi: "",
    pinyin: "",
    english: "",
    imageUrl: "",
    deck: "",
  });
  const [fallbackDeck, setFallbackDeck] = useState("Imported");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("upload");
    setHeaders([]);
    setRows([]);
    setMapping({ hanzi: "", pinyin: "", english: "", imageUrl: "", deck: "" });
    setFallbackDeck("Imported");
    setError("");
    setDragging(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const parseFile = (file: File) => {
    setError("");
    const deckFromName = file.name.replace(/\.csv$/i, "").trim() || "Imported";
    setFallbackDeck(deckFromName);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        const fields = (result.meta.fields ?? []).filter(Boolean);
        if (fields.length === 0 || result.data.length === 0) {
          setError("Could not find any rows with headers in that CSV.");
          return;
        }
        setHeaders(fields);
        setRows(result.data);
        setMapping(autoDetectMapping(fields));
        setStep("map");
      },
      error: (err) => setError(`Failed to parse CSV: ${err.message}`),
    });
  };

  const onFileChosen = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please choose a .csv file.");
      return;
    }
    parseFile(file);
  };

  const drafts: CardDraft[] =
    step === "map" ? rowsToDrafts(rows, mapping, fallbackDeck) : [];

  const handleConfirm = () => {
    if (drafts.length === 0) {
      setError("No valid cards to import. Check your column mapping.");
      return;
    }
    onImport(drafts);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import from CSV"
      subtitle={
        step === "upload"
          ? "Bulk-add cards from a spreadsheet"
          : "Map your columns, then preview"
      }
      maxWidth="max-w-2xl"
    >
      {step === "upload" && (
        <div className="flex flex-col gap-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              onFileChosen(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed px-6 py-16 text-center transition ${
              dragging
                ? "border-cinnabar-500 bg-cinnabar-50"
                : "border-ink-300 hover:border-ink-800"
            }`}
          >
            <UploadCloud className="h-8 w-8 text-ink-300" strokeWidth={1.5} />
            <p className="text-ink-800">Drop your CSV here, or click to browse</p>
            <p className="text-sm text-ink-400">
              Columns can be in any order — we&apos;ll detect them for you.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => onFileChosen(e.target.files)}
            />
          </div>

          <div className="border-l-2 border-ink-200 pl-4">
            <p className="label-caps mb-1 text-ink-400">Expected columns</p>
            <p className="text-sm text-ink-500">
              Hanzi, Pinyin, English, Image URL, Deck. Only Hanzi (or English) is
              required. Numbered pinyin like{" "}
              <span className="text-ink-800">ni3 hao3</span> converts to{" "}
              <span className="font-serif italic text-cinnabar-500">nǐ hǎo</span>{" "}
              automatically.
            </p>
          </div>

          {error && (
            <p className="border-l-2 border-cinnabar-500 bg-cinnabar-50 px-3 py-2 text-sm text-cinnabar-700">
              {error}
            </p>
          )}
        </div>
      )}

      {step === "map" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.key}>
                <label className="label-caps mb-1.5 block text-ink-400">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-cinnabar-500">*</span>
                  )}
                </label>
                <select
                  value={mapping[field.key]}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [field.key]: e.target.value }))
                  }
                  className={fieldClass}
                >
                  <option value="">— Not mapped —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div>
            <label className="label-caps mb-1.5 block text-ink-400">
              Default deck name
            </label>
            <input
              value={fallbackDeck}
              onChange={(e) => setFallbackDeck(e.target.value)}
              className={fieldClass}
            />
          </div>

          {!mapping.hanzi && !mapping.english && (
            <p className="border-l-2 border-cinnabar-500 bg-cinnabar-50 px-3 py-2 text-sm text-cinnabar-700">
              Map at least a Hanzi or English column to continue.
            </p>
          )}

          <div>
            <p className="label-caps mb-2 text-ink-400">
              Preview · {drafts.length} card{drafts.length === 1 ? "" : "s"}
            </p>
            <div className="overflow-x-auto thin-scroll border border-ink-200">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-200 bg-ink-50">
                    <th className="label-caps px-3 py-2.5 text-ink-400">Hanzi</th>
                    <th className="label-caps px-3 py-2.5 text-ink-400">Pinyin</th>
                    <th className="label-caps px-3 py-2.5 text-ink-400">English</th>
                    <th className="label-caps px-3 py-2.5 text-ink-400">Deck</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {drafts.slice(0, 8).map((d, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-hanzi text-base text-ink-900">
                        {d.hanzi || "—"}
                      </td>
                      <td className="px-3 py-2 font-serif italic text-cinnabar-500">
                        {d.pinyin || "—"}
                      </td>
                      <td className="px-3 py-2 text-ink-600">
                        {d.english || "—"}
                      </td>
                      <td className="label-caps px-3 py-2 text-ink-400">
                        {d.deck}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {drafts.length > 8 && (
              <p className="mt-2 text-center text-xs text-ink-400">
                …and {drafts.length - 8} more
              </p>
            )}
          </div>

          {error && (
            <p className="border-l-2 border-cinnabar-500 bg-cinnabar-50 px-3 py-2 text-sm text-cinnabar-700">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("upload")}
              className="border border-ink-200 px-4 py-3 text-sm font-medium text-ink-600 transition hover:border-ink-800 hover:text-ink-900"
            >
              Choose another
            </button>
            <button
              onClick={handleConfirm}
              disabled={drafts.length === 0}
              className="flex-1 border border-ink-800 bg-ink-900 px-4 py-3 text-sm font-medium text-paper transition hover:bg-ink-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Import {drafts.length} card{drafts.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
