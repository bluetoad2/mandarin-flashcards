"use client";

import { CheckCircle2, FileUp, UploadCloud } from "lucide-react";
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
  { key: "deck", label: "Deck / Category", required: false },
];

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
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
              dragging
                ? "border-sky-400 bg-sky-50"
                : "border-sky-200 bg-sky-50/40 hover:border-sky-300 hover:bg-sky-50"
            }`}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-500">
              <UploadCloud className="h-8 w-8" />
            </div>
            <p className="font-semibold text-sky-800">
              Drop your CSV here, or click to browse
            </p>
            <p className="text-sm text-sky-500">
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

          <div className="rounded-2xl border border-sky-100 bg-white/60 px-4 py-3 text-sm text-sky-700">
            <p className="mb-1 font-semibold">Expected columns</p>
            <p className="text-sky-500">
              Hanzi, Pinyin, English, Image URL, Deck. Only Hanzi (or English) is
              required. Numbered pinyin like{" "}
              <code className="rounded bg-sky-100 px-1">ni3 hao3</code> converts
              to <span className="font-hanzi">nǐ hǎo</span> automatically.
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm font-medium text-coral-600">
              {error}
            </p>
          )}
        </div>
      )}

      {step === "map" && (
        <div className="flex flex-col gap-5">
          {/* Mapping controls */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.key}>
                <label className="mb-1.5 block text-sm font-semibold text-sky-800">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-coral-500">*</span>
                  )}
                </label>
                <select
                  value={mapping[field.key]}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [field.key]: e.target.value }))
                  }
                  className="w-full rounded-xl border border-sky-100 bg-sky-50/50 px-3 py-2.5 text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
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
            <label className="mb-1.5 block text-sm font-semibold text-sky-800">
              Default deck name
              <span className="ml-1 font-normal text-sky-400">
                (used when a row has no deck)
              </span>
            </label>
            <input
              value={fallbackDeck}
              onChange={(e) => setFallbackDeck(e.target.value)}
              className="w-full rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-2.5 text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
            />
          </div>

          {!mapping.hanzi && !mapping.english && (
            <p className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm font-medium text-coral-600">
              Map at least a Hanzi or English column to continue.
            </p>
          )}

          {/* Preview */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-sky-800">
                Preview
                <span className="ml-1.5 font-normal text-sky-400">
                  {drafts.length} card{drafts.length === 1 ? "" : "s"}
                </span>
              </p>
            </div>
            <div className="overflow-x-auto thin-scroll rounded-2xl border border-sky-100">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700">
                    <th className="px-3 py-2.5 font-semibold">Hanzi</th>
                    <th className="px-3 py-2.5 font-semibold">Pinyin</th>
                    <th className="px-3 py-2.5 font-semibold">English</th>
                    <th className="px-3 py-2.5 font-semibold">Deck</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.slice(0, 8).map((d, i) => (
                    <tr
                      key={i}
                      className="border-t border-sky-50 odd:bg-white even:bg-sky-50/30"
                    >
                      <td className="px-3 py-2 font-hanzi text-base text-slate-800">
                        {d.hanzi || "—"}
                      </td>
                      <td className="px-3 py-2 text-sky-600">
                        {d.pinyin || "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {d.english || "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-600">
                          {d.deck}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {drafts.length > 8 && (
              <p className="mt-2 text-center text-xs text-sky-400">
                …and {drafts.length - 8} more
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm font-medium text-coral-600">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("upload")}
              className="flex items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white px-4 py-3 font-semibold text-sky-600 transition hover:bg-sky-50"
            >
              <FileUp className="h-5 w-5" />
              Choose another
            </button>
            <button
              onClick={handleConfirm}
              disabled={drafts.length === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white shadow-lg shadow-sky-300/50 transition hover:bg-sky-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 className="h-5 w-5" />
              Import {drafts.length} card{drafts.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
