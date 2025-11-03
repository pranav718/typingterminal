
export async function generateRandomWords(wordCount: number = 50): Promise<string> {
  try {
    const response = await fetch(`https://random-word-api.herokuapp.com/word?number=${wordCount}`);
    
    if (!response.ok) throw new Error('API failed');
    
    const words: string[] = await response.json();
    
    return words.map(w => w.toLowerCase()).join(' ');
  } catch (error) {
    console.error('Failed to fetch random words:', error);
 
    return generateFallbackWords(wordCount);
  }
}

function generateFallbackWords(count: number): string {
  const words = [
    "the", "be", "to", "of", "and", "in", "that", "have", "it", "for",
    "not", "on", "with", "he", "as", "you", "do", "at", "this", "but",
    "his", "by", "from", "they", "we", "say", "her", "she", "or", "an",
    "will", "my", "one", "all", "would", "there", "their", "what", "so", "up",
    "out", "if", "about", "who", "get", "which", "go", "me", "when", "make",
    "can", "like", "time", "no", "just", "him", "know", "take", "people", "into",
    "year", "your", "good", "some", "could", "them", "see", "other", "than", "then",
    "now", "look", "only", "come", "its", "over", "think", "also", "back", "after",
    "use", "two", "how", "our", "work", "first", "well", "way", "even", "new",
    "want", "because", "any", "these", "give", "day", "most", "us", "is", "was",
  ];

  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(words[Math.floor(Math.random() * words.length)]);
  }
  
  return result.join(' ');
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