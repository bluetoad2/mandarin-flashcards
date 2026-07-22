// Converts numbered pinyin (e.g. "ni3 hao3") into accented pinyin ("nǐ hǎo").
// If the input already contains tone marks, it is returned unchanged so that
// CSV files with either convention render correctly.

const TONE_MARKS: Record<string, string[]> = {
  a: ["a", "ā", "á", "ǎ", "à", "a"],
  e: ["e", "ē", "é", "ě", "è", "e"],
  i: ["i", "ī", "í", "ǐ", "ì", "i"],
  o: ["o", "ō", "ó", "ǒ", "ò", "o"],
  u: ["u", "ū", "ú", "ǔ", "ù", "u"],
  // ü represented in numbered pinyin as "v" or "u:"
  v: ["ü", "ǖ", "ǘ", "ǚ", "ǜ", "ü"],
};

const ACCENTED = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/;

function convertSyllable(raw: string): string {
  const match = raw.match(/^([a-zA-Z:]+)([1-5])$/);
  if (!match) return raw.replace(/:/g, "ü").replace(/v/g, "ü");

  let [, letters, toneStr] = match;
  const tone = parseInt(toneStr, 10);
  letters = letters.replace(/u:/g, "v"); // normalise "u:" -> v (ü)

  if (tone === 5) {
    return letters.replace(/v/g, "ü");
  }

  const lower = letters.toLowerCase();

  // Placement rules: a/e always win; in "ou" the o takes it;
  // otherwise the mark falls on the last vowel.
  let targetIndex = -1;
  if (lower.includes("a")) targetIndex = lower.indexOf("a");
  else if (lower.includes("e")) targetIndex = lower.indexOf("e");
  else if (lower.includes("ou")) targetIndex = lower.indexOf("o");
  else {
    for (let i = lower.length - 1; i >= 0; i--) {
      if ("aeiouv".includes(lower[i])) {
        targetIndex = i;
        break;
      }
    }
  }

  if (targetIndex === -1) return letters.replace(/v/g, "ü");

  const vowel = lower[targetIndex];
  const marked = TONE_MARKS[vowel]?.[tone] ?? vowel;
  const isUpper = letters[targetIndex] !== lower[targetIndex];
  const finalMark = isUpper ? marked.toUpperCase() : marked;

  const out =
    letters.slice(0, targetIndex) + finalMark + letters.slice(targetIndex + 1);
  return out.replace(/v/g, "ü").replace(/V/g, "Ü");
}

export function toAccentedPinyin(input: string): string {
  if (!input) return "";
  // Already accented — leave it alone.
  if (ACCENTED.test(input) && !/[1-5]/.test(input)) return input;

  return input
    .split(/(\s+)/) // keep whitespace tokens
    .map((token) => (/\s+/.test(token) ? token : convertSyllable(token)))
    .join("");
}
