import type { Flashcard } from "./types";

let seq = 0;
function card(
  hanzi: string,
  pinyin: string,
  english: string,
  deck: string
): Flashcard {
  return {
    id: `seed-${seq++}`,
    hanzi,
    pinyin,
    english,
    deck,
    status: "new",
    correct: 0,
    incorrect: 0,
    createdAt: Date.now() + seq,
  };
}

export const DEFAULT_CARDS: Flashcard[] = [
  // Greetings
  card("你好", "nǐ hǎo", "Hello", "Greetings"),
  card("谢谢", "xiè xie", "Thank you", "Greetings"),
  card("再见", "zài jiàn", "Goodbye", "Greetings"),
  card("对不起", "duì bu qǐ", "Sorry", "Greetings"),
  card("请", "qǐng", "Please", "Greetings"),
  card("是", "shì", "To be / Yes", "Greetings"),
  card("不", "bù", "No / Not", "Greetings"),
  // Food
  card("水", "shuǐ", "Water", "Food"),
  card("茶", "chá", "Tea", "Food"),
  card("米饭", "mǐ fàn", "Rice", "Food"),
  card("面条", "miàn tiáo", "Noodles", "Food"),
  card("苹果", "píng guǒ", "Apple", "Food"),
  card("鸡蛋", "jī dàn", "Egg", "Food"),
  // Numbers
  card("一", "yī", "One", "Numbers"),
  card("二", "èr", "Two", "Numbers"),
  card("三", "sān", "Three", "Numbers"),
];
