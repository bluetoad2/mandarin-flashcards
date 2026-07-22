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
    return { version: CURRENT_VERSION, cards: parsed.cards };
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
