import type { AppData, Flashcard } from "./types";
import { DEFAULT_CARDS } from "./defaultData";

const STORAGE_KEY = "mandarin-flashcards:v1";
const CURRENT_VERSION = 1;

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function seedData(): AppData {
  return { version: CURRENT_VERSION, cards: DEFAULT_CARDS };
}

/**
 * Fills in fields added after a card was first saved, so decks stored by an
 * older version of the app keep working instead of rendering as blanks.
 */
export function normalizeCard(raw: Partial<Flashcard>): Flashcard {
  return {
    id: raw.id ?? createId(),
    hanzi: raw.hanzi ?? "",
    pinyin: raw.pinyin ?? "",
    english: raw.english ?? "",
    imageUrl: raw.imageUrl,
    deck: raw.deck || "Uncategorised",
    status: raw.status ?? "new",
    correct: raw.correct ?? 0,
    incorrect: raw.incorrect ?? 0,
    createdAt: raw.createdAt ?? Date.now(),
    // Cards saved before spaced repetition existed start in box 1, due now.
    box: typeof raw.box === "number" ? raw.box : 1,
    dueAt: typeof raw.dueAt === "number" ? raw.dueAt : 0,
  };
}

/** Loads app data from localStorage, seeding defaults on first run. */
export function loadData(): AppData {
  if (typeof window === "undefined") return seedData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedData();
      saveData(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed || !Array.isArray(parsed.cards)) return seedData();
    return {
      version: CURRENT_VERSION,
      cards: parsed.cards.map(normalizeCard),
    };
  } catch {
    return seedData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — fail silently.
  }
}

export function saveCards(cards: Flashcard[]): void {
  saveData({ version: CURRENT_VERSION, cards });
}
