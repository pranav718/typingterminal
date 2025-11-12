import ePub from 'epubjs';

export interface ProcessedBook {
  title: string;
  passages: string[];
}

/**
 * Process EPUB file on client side
 */
export async function processEPUBClient(file: File): Promise<ProcessedBook> {
  try {
    console.log('Processing EPUB:', file.name);

    const arrayBuffer = await file.arrayBuffer();
    
    const book = ePub(arrayBuffer);
    await book.ready;

    const metadata = await book.loaded.metadata;
    const title = metadata.title || file.name.replace('.epub', '');

    console.log('EPUB Title:', title);

    await book.loaded.spine;
    
    let fullText = '';
    const spine = book.spine as any;
    
    for (let i = 0; i < spine.items.length; i++) {
      try {
        const item = spine.get(i);
        const doc = await item.load(book.load.bind(book));
        
        const textContent = doc.textContent || '';
        fullText += ' ' + textContent;
      } catch (error) {
        console.warn(`Error loading section ${i}:`, error);
      }
    }

    console.log('Extracted text length:', fullText.length);

    const passages = processExtractedText(fullText);

    if (passages.length === 0) {
      return {
        title,
        passages: ['No readable text found in this EPUB.']
      };
    }

    console.log('Generated passages:', passages.length);

    return {
      title,
      passages
    };
  } catch (error) {
    console.error('EPUB processing error:', error);
    throw new Error('Failed to process EPUB file. Please try another file.');
  }
}

/**
 * Process extracted text into typing-friendly passages
 */
function processExtractedText(text: string): string[] {
  const skipPatterns = [
    /table of contents/i,
    /^contents$/im,
    /^index$/im,
    /^preface$/im,
    /acknowledgments/i,
    /bibliography/im,
    /^references$/im,
    /copyright.*\d{4}/i,
    /isbn[\s-]*[\d-]+/i,
    /published by/i,
    /all rights reserved/i,
    /^chapter\s+\d+$/im,
    /^page\s+\d+$/im,
  ];

  const cleanText = text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const sentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((sentence) => {

      if (!sentence || sentence.length < 30) return false;
      if (/^\d+$/.test(sentence)) return false;

      for (const pattern of skipPatterns) {
        if (pattern.test(sentence)) return false;
      }

      if (!/[a-zA-Z]{3,}/.test(sentence)) return false;

      const numberRatio = (sentence.match(/\d/g) || []).length / sentence.length;
      if (numberRatio > 0.3) return false;

      return true;
    });

  const passages: string[] = [];
  let currentPassage = '';
  let sentenceCount = 0;

  for (const sentence of sentences) {
    currentPassage += (currentPassage ? ' ' : '') + sentence;
    sentenceCount++;

    if (
      (sentenceCount >= 2 && currentPassage.length > 150) ||
      currentPassage.length > 300 ||
      sentenceCount >= 4
    ) {
      passages.push(currentPassage.trim());
      currentPassage = '';
      sentenceCount = 0;
    }
  }

  if (currentPassage.trim() && currentPassage.length > 50) {
    passages.push(currentPassage.trim());
  }

  return passages
    .filter((passage) => {
      if (passage.length < 80 || passage.length > 500) return false;

      const upperRatio = (passage.match(/[A-Z]/g) || []).length / passage.length;
      if (upperRatio > 0.5) return false;

      return true;
    })
    .slice(0, 150); 
}