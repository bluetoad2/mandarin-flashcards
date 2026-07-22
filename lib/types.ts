export type StudyStatus = "new" | "learning" | "mastered";

export interface Flashcard {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  imageUrl?: string;
  deck: string;
  status: StudyStatus;
  /** Number of times marked "Got It". */
  correct: number;
  /** Number of times marked "Needs Review". */
  incorrect: number;
  createdAt: number;
}

export interface AppData {
  version: number;
  cards: Flashcard[];
}

/** Draft used by the CSV import + manual add flows before an id/status is assigned. */
export interface CardDraft {
  hanzi: string;
  pinyin: string;
  english: string;
  imageUrl?: string;
  deck: string;
}

/** Maps a logical field to a CSV header (or "" when unmapped). */
export interface ColumnMapping {
  hanzi: string;
  pinyin: string;
  english: string;
  imageUrl: string;
  deck: string;
}
