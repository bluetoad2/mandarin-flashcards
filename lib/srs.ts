import type { Flashcard } from "./types";

// A simple Leitner-box scheduler. Cards move up a box each time they are
// recalled correctly and drop straight back to box 1 when they are missed.
// The box decides how long the card waits before it is due again.

const DAY_MS = 86_400_000;

/** Wait time in days, indexed by box. Index 0 is unused. */
export const BOX_INTERVALS_DAYS = [0, 0, 1, 3, 7, 21];
export const MAX_BOX = 5;

export function isDue(card: Flashcard, now: number = Date.now()): boolean {
  return card.dueAt <= now;
}

/** Correct recall: promote a box and schedule the next review further out. */
export function promoteCard(card: Flashcard, now: number = Date.now()): Flashcard {
  const box = Math.min(card.box + 1, MAX_BOX);
  return {
    ...card,
    box,
    dueAt: now + BOX_INTERVALS_DAYS[box] * DAY_MS,
    status: box >= MAX_BOX ? "mastered" : "learning",
    correct: card.correct + 1,
  };
}

/** Missed recall: back to box 1 so the card returns in this same session. */
export function demoteCard(card: Flashcard, now: number = Date.now()): Flashcard {
  return {
    ...card,
    box: 1,
    dueAt: now,
    status: "learning",
    incorrect: card.incorrect + 1,
  };
}

/** How many cards later a missed card reappears within a session. */
export const REINSERT_GAP = 3;

/**
 * Session queue after answering `id`. Correct answers leave the queue;
 * missed ones move back a few places so they come round again.
 */
export function nextQueue(
  queue: string[],
  id: string,
  correct: boolean,
  gap: number = REINSERT_GAP
): string[] {
  const rest = queue.filter((qid) => qid !== id);
  if (correct) return rest;
  const pos = Math.min(gap, rest.length);
  return [...rest.slice(0, pos), id, ...rest.slice(pos)];
}

/** Session queue after skipping `id` — it moves to the back. */
export function skipInQueue(queue: string[], id: string): string[] {
  if (queue.length < 2) return queue;
  return [...queue.filter((qid) => qid !== id), id];
}

/** Human-friendly "due in …" label used by the caught-up screen. */
export function formatDueIn(timestamp: number, now: number = Date.now()): string {
  const diff = timestamp - now;
  if (diff <= 0) return "now";

  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return `in ${minutes} min`;

  const hours = Math.round(diff / 3_600_000);
  if (hours < 24) return `in ${hours} hour${hours === 1 ? "" : "s"}`;

  const days = Math.round(diff / DAY_MS);
  return `in ${days} day${days === 1 ? "" : "s"}`;
}
