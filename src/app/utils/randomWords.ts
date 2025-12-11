
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface RandomWordsOptions {
  wordCount?: number;
  difficulty?: DifficultyLevel;
}

function getFallbackWords(count: number, difficulty: DifficultyLevel): string[] {
  const mediumWords = [
    "time", "year", "work", "back", "call", "hand", "high", "keep", "last", "long",
    "come", "made", "find", "down", "side", "been", "make", "over", "such", "take",
    "than", "them", "well", "only", "also", "city", "life", "part", "said", "each",
    "both", "must", "just", "show", "very", "help", "many", "here", "form", "much",
    "about", "after", "again", "being", "could", "every", "first", "found", "great", "house",
    "large", "later", "leave", "might", "never", "other", "place", "point", "right", "small",
    "sound", "still", "study", "their", "there", "these", "thing", "think", "three", "under",
    "water", "where", "which", "while", "world", "would", "write", "above", "along", "among",
    "began", "being", "below", "bring", "given", "heard", "known", "light", "lived", "means",
    "moved", "often", "order", "power", "since", "story", "those", "today", "until", "white",
    "whole", "whose", "young", "early", "begin", "group", "learn", "money", "music", "party",
    "before", "better", "change", "common", "family", "father", "friend", "mother", "number",
    "against", "because", "between", "company", "country", "develop", "during", "enough",
    "example", "follow", "general", "getting", "however", "include", "interest", "letter",
    "making", "member", "moment", "nothing", "office", "others", "people", "person", "picture",
    "possible", "present", "problem", "program", "public", "question", "rather", "receive",
    "result", "return", "second", "service", "several", "should", "simple", "system", "through",
    "together", "without", "another", "believe", "certain", "children", "consider", "continue",
  ];

  const easyWords = [
    "the", "and", "for", "are", "but", "not", "you", "all", "any", "can", "her", "was", "one", "our", "out", "day", "get", "has", "him", "his", "how", "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did", "its", "let", "put", "say", "she", "too", "use",
    "red", "big", "box", "car", "cat", "dog", "eat", "fun", "hat", "hot", "joy", "key", "kid", "kit", "law", "lie", "low", "map", "may", "mix", "mud", "oil", "own", "pan", "pay", "pet", "pie", "pig", "pot", "raw", "ray", "run", "sad", "sat", "saw", "set", "sit", "six", "sky", "son", "sun", "tax", "tea", "ten", "tie", "toe", "top", "toy", "try", "van", "war", "wet", "win", "yes", "yet", "zip", "zoo",
    "air", "arm", "art", "ask", "bad", "bag", "bar", "bat", "bed", "bee", "bet", "bit", "bus", "buy", "cap", "cow", "cup", "cut", "dad", "dry", "ear", "egg", "end", "eye", "fan", "far", "fat", "few", "fit", "fly", "fog", "fox", "gap", "gas", "gem", "got", "gum", "guy", "hit", "hug", "ice", "ill", "ink", "jar", "jet", "job", "leg", "lip", "lot", "mad", "men", "mom", "net", "nod", "nut", "off", "pad", "pen", "pop", "rag", "rat", "rib", "rid", "row", "rub", "rug", "sap", "sea", "sip", "sir", "sob", "spy", "tap", "tip", "tow", "tub", "via", "wax", "web", "why", "wig", "wit", "wow", "yam"
  ];
  const hardWords = ["absolute", "academic", "accident", "accuracy", "activity", "actually", "addition", "adequate", "advanced", "advisory", "advocate", "aircraft", "alliance", "although", "aluminum", "analysis", "announce", "anything", "anywhere", "apparent", "appendix", "approach", "approval"];

  let pool = mediumWords;
  if (difficulty === 'easy') pool = easyWords;
  if (difficulty === 'hard') pool = hardWords;

  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  return result;
}

function isValidEnglishWord(word: string, minLen: number, maxLen: number): boolean {
  if (!/^[a-z]+$/.test(word)) return false;

  if (word.length < minLen || word.length > maxLen) return false;

  const nonEnglishPatterns = [
    /^[aeiou]{4,}/,
    /[^aeiou]{5,}/,
    /(.)\1{3,}/,
  ];

  for (const pattern of nonEnglishPatterns) {
    if (pattern.test(word)) return false;
  }

  return true;
}

async function fetchWordsFromAPI(count: number, difficulty: DifficultyLevel): Promise<string[]> {
  let minLen = 3, maxLen = 8;
  if (difficulty === 'easy') { minLen = 2; maxLen = 5; }
  if (difficulty === 'hard') { minLen = 8; maxLen = 15; }

  try {
    const response = await fetch(
      `https://random-word-api.herokuapp.com/word?number=${count * 3}`
    );

    if (!response.ok) throw new Error('Random Word API failed');

    const allWords: string[] = await response.json();

    const validWords = allWords
      .filter(w => isValidEnglishWord(w, minLen, maxLen))
      .slice(0, count);

    if (validWords.length >= count) {
      return shuffleArray(validWords);
    }

    const needed = count - validWords.length;
    const fallback = getFallbackWords(needed, difficulty);
    return shuffleArray([...validWords, ...fallback]);

  } catch (error) {
    console.error('Failed to fetch from Random Word API:', error);

    try {
      const response = await fetch(
        `https://api.datamuse.com/words?md=f&max=${count * 3}&topics=english`
      );

      if (response.ok) {
        const data: Array<{ word: string }> = await response.json();

        const validWords = data
          .map(item => item.word)
          .filter(w => isValidEnglishWord(w, minLen, maxLen))
          .slice(0, count);

        if (validWords.length >= count * 0.8) {
          const needed = count - validWords.length;
          const fallback = getFallbackWords(needed, difficulty);
          return shuffleArray([...validWords, ...fallback]);
        }
      }
    } catch (err) {
      console.error('DataMuse fallback also failed:', err);
    }

    return getFallbackWords(count, difficulty);
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function generateRandomWords(options: RandomWordsOptions = {}): Promise<string> {
  const { wordCount = 50, difficulty = 'medium' } = options;
  const words = await fetchWordsFromAPI(wordCount, difficulty);
  return words.map(w => w.toLowerCase()).join(' ');
}

export function generateRandomLetters(length: number = 200): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += letters[Math.floor(Math.random() * letters.length)];
    if (i > 0 && i % (4 + Math.floor(Math.random() * 4)) === 0) {
      result += ' ';
    }
  }

  return result.trim();
}

export function getRandomPassageSource(type: string): string {
  return type === 'letters' ? 'Random Letters' : 'Random Words';
}