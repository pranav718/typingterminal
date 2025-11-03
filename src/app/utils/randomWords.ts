
function getMediumDifficultyFallback(count: number): string[] {
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

  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(mediumWords[Math.floor(Math.random() * mediumWords.length)]);
  }
  
  return result;
}

function isValidEnglishWord(word: string): boolean {
  // Must be lowercase letters only
  if (!/^[a-z]+$/.test(word)) return false;

  if (word.length < 3 || word.length > 8) return false;
  
  const nonEnglishPatterns = [
    /^[aeiou]{4,}/, // Too many consecutive vowels (aeio, ouea, etc.)
    /[^aeiou]{5,}/, // Too many consecutive consonants
    /(.)\1{3,}/,    // Same letter repeated 4+ times
  ];
  
  for (const pattern of nonEnglishPatterns) {
    if (pattern.test(word)) return false;
  }
  
  return true;
}

async function fetchMediumDifficultyWords(count: number): Promise<string[]> {
  try {
    const response = await fetch(
      `https://random-word-api.herokuapp.com/word?number=${count * 3}`
    );
    
    if (!response.ok) throw new Error('Random Word API failed');
    
    const allWords: string[] = await response.json();
    
    const mediumWords = allWords
      .filter(isValidEnglishWord)
      .slice(0, count);
    
    if (mediumWords.length >= count) {
      return shuffleArray(mediumWords);
    }
    
    const needed = count - mediumWords.length;
    const fallback = getMediumDifficultyFallback(needed);
    return shuffleArray([...mediumWords, ...fallback]);
    
  } catch (error) {
    console.error('Failed to fetch from Random Word API:', error);
    
    try {
      const response = await fetch(
        `https://api.datamuse.com/words?md=f&max=${count * 3}&topics=english`
      );
      
      if (response.ok) {
        const data: Array<{ word: string }> = await response.json();
        
        const mediumWords = data
          .map(item => item.word)
          .filter(isValidEnglishWord)
          .slice(0, count);
        
        if (mediumWords.length >= count * 0.8) { 
          const needed = count - mediumWords.length;
          const fallback = getMediumDifficultyFallback(needed);
          return shuffleArray([...mediumWords, ...fallback]);
        }
      }
    } catch (err) {
      console.error('DataMuse fallback also failed:', err);
    }
    
    return getMediumDifficultyFallback(count);
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

export async function generateRandomWords(wordCount: number = 50): Promise<string> {
  const words = await fetchMediumDifficultyWords(wordCount);
  
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