import type { CardDraft, ColumnMapping, Flashcard } from "./types";
import { toAccentedPinyin } from "./pinyin";

/** Header keywords used to auto-detect column mapping. */
const FIELD_HINTS: Record<keyof ColumnMapping, string[]> = {
  hanzi: ["hanzi", "chinese", "character", "characters", "字", "汉字", "simplified"],
  pinyin: ["pinyin", "pronunciation", "romanization", "拼音"],
  english: ["english", "meaning", "translation", "definition", "英文", "en"],
  imageUrl: ["image", "img", "picture", "photo", "url", "image url"],
  deck: ["deck", "category", "group", "set", "tag", "lesson", "topic"],
};

export function autoDetectMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    hanzi: "",
    pinyin: "",
    english: "",
    imageUrl: "",
    deck: "",
  };

  (Object.keys(FIELD_HINTS) as (keyof ColumnMapping)[]).forEach((field) => {
    const hints = FIELD_HINTS[field];
    const found = headers.find((h) => {
      const norm = h.trim().toLowerCase();
      return hints.some((hint) => norm === hint || norm.includes(hint));
    });
    if (found) mapping[field] = found;
  });

  return mapping;
}

/** Builds card drafts from parsed CSV rows using the given column mapping. */
export function rowsToDrafts(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  fallbackDeck: string
): CardDraft[] {
  const drafts: CardDraft[] = [];

  for (const row of rows) {
    const hanzi = mapping.hanzi ? (row[mapping.hanzi] ?? "").trim() : "";
    const pinyinRaw = mapping.pinyin ? (row[mapping.pinyin] ?? "").trim() : "";
    const english = mapping.english ? (row[mapping.english] ?? "").trim() : "";
    const imageUrl = mapping.imageUrl
      ? (row[mapping.imageUrl] ?? "").trim()
      : "";
    const deckRaw = mapping.deck ? (row[mapping.deck] ?? "").trim() : "";

    // Skip completely empty rows.
    if (!hanzi && !pinyinRaw && !english) continue;

    drafts.push({
      hanzi,
      pinyin: toAccentedPinyin(pinyinRaw),
      english,
      imageUrl: imageUrl || undefined,
      deck: deckRaw || fallbackDeck,
    });
  }

  return drafts;
}

/** Escapes a value for safe CSV output. */
function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function cardsToCsv(cards: Flashcard[]): string {
  const header = ["Hanzi", "Pinyin", "English", "Image URL", "Deck", "Status"];
  const lines = [header.join(",")];
  for (const c of cards) {
    lines.push(
      [
        csvEscape(c.hanzi),
        csvEscape(c.pinyin),
        csvEscape(c.english),
        csvEscape(c.imageUrl ?? ""),
        csvEscape(c.deck),
        csvEscape(c.status),
      ].join(",")
    );
  }
  return lines.join("\n");
}
