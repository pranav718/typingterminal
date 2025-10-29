import * as fs from 'fs';
import * as path from 'path';
import EPub from 'epub';

interface BookMetadata {
  id: string;
  title: string;
  author: string;
  filename: string;
}

// defining books here, epubs go in /public/sample-books/
const BOOKS_TO_PROCESS: BookMetadata[] = [
  {
    id: 'pride-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    filename: 'pride-and-prejudice.epub',
  },
  {
    id: '1984',
    title: '1984',
    author: 'George Orwell',
    filename: '1984.epub',
  },
  {
    id: 'great-gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    filename: 'great-gatsby.epub',
  },
  {
    id: 'moby-dick',
    title: 'Moby Dick',
    author: 'Herman Melville',
    filename: 'moby-dick.epub',
  },
  {
    id: 'alice-wonderland',
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    filename: 'alice-in-wonderland.epub',
  },
  {
    id: 'metamorphosis',
    title: 'The Metamorphosis',
    author: 'Franz Kafka',
    filename: 'metamorphosis.epub',
  },
  {
    id: 'frankenstein',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    filename: 'frankenstein.epub',
  },
  {
    id: 'dracula',
    title: 'Dracula',
    author: 'Bram Stoker',
    filename: 'dracula.epub',
  },
  {
    id: 'sherlock-holmes',
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    filename: 'sherlock-holmes.epub',
  },
  {
    id: 'count-of-monte-cristo',
    title: 'The Count of Monte Cristo',
    author: 'Alexandre Dumas',
    filename: 'count-of-monte-cristo.epub',
  },
  {
    id: 'picture-of-dorian-gray',
    title: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
    filename: 'dorian-gray.epub',
  },
  {
    id: 'jane-eyre',
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    filename: 'jane-eyre.epub',
  },
  {
    id: 'wuthering-heights',
    title: 'Wuthering Heights',
    author: 'Emily Brontë',
    filename: 'wuthering-heights.epub',
  },
  {
    id: 'little-women',
    title: 'Little Women',
    author: 'Louisa May Alcott',
    filename: 'little-women.epub',
  },
  {
    id: 'odyssey',
    title: 'The Odyssey',
    author: 'Homer',
    filename: 'odyssey.epub',
  },
];

function processEPUB(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const epub = new EPub(filePath);

    epub.on('error', (error) => {
      console.error('EPUB parsing error:', error);
      reject(error);
    });

    epub.on('end', () => {
      const chapters = (epub.flow as any[]).map((chapter: any) => chapter.id);
      let fullText = '';
      let processedChapters = 0;

      if (chapters.length === 0) {
        resolve([]);
        return;
      }

      chapters.forEach((chapterId) => {
        epub.getChapter(chapterId, (error, text) => {
          if (error) {
            console.error(`Error reading chapter ${chapterId}:`, error);
          } else {
            // remove html tags
            const cleanText = text
              .replace(/<[^>]*>/g, ' ')
              .replace(/&nbsp;/g, ' ')
              .replace(/&quot;/g, '"')
              .replace(/&apos;/g, "'")
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/\s+/g, ' ')
              .trim();
            
            fullText += ' ' + cleanText;
          }

          processedChapters++;
          if (processedChapters === chapters.length) {
            const passages = processExtractedText(fullText);
            resolve(passages);
          }
        });
      });
    });

    epub.parse();
  });
}

function processExtractedText(text: string): string[] {
  const skipPatterns = [
    /table of contents/i,
    /^contents$/im,
    /^index$/im,
    /^preface$/im,
    /^acknowledgments/i,
    /^bibliography$/im,
    /^references$/im,
    /copyright.*\d{4}/i,
    /isbn[\s-]*[\d-]+/i,
    /published by/i,
    /all rights reserved/i,
    /^chapter\s+\d+$/im,
    /^page\s+\d+$/im,
    /^\d+$/,
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

async function generateSampleBooksFile() {
  console.log('Starting sample books generation from EPUB files...\n');

  const sampleBooksDir = path.join(process.cwd(), 'public', 'sample-books');
  const outputPath = path.join(process.cwd(), 'src', 'app', 'data', 'sampleBooks.ts');

  if (!fs.existsSync(sampleBooksDir)) {
    console.error('Error: /public/sample-books/ directory not found!');
    console.log('Please create the directory and add your EPUB files there.\n');
    console.log('Download free EPUBs from:');
    console.log('   - https://www.gutenberg.org/ (select EPUB format)');
    console.log('   - https://standardebooks.org/');
    console.log('   - https://www.feedbooks.com/publicdomain\n');
    process.exit(1);
  }

  const books = [];

  for (const bookMeta of BOOKS_TO_PROCESS) {
    const epubPath = path.join(sampleBooksDir, bookMeta.filename);

    if (!fs.existsSync(epubPath)) {
      console.warn(`Skipping ${bookMeta.title} - EPUB not found: ${bookMeta.filename}`);
      continue;
    }

    console.log(`Processing: ${bookMeta.title} by ${bookMeta.author}...`);
    
    try {
      const passages = await processEPUB(epubPath);

      if (passages.length === 0) {
        console.warn(` No passages extracted from ${bookMeta.title}`);
        continue;
      }

      books.push({
        id: bookMeta.id,
        title: bookMeta.title,
        author: bookMeta.author,
        passages,
      });

      console.log(`✓ Extracted ${passages.length} passages\n`);
    } catch (error) {
      console.error(`Error processing ${bookMeta.title}:`, error);
    }
  }

  if (books.length === 0) {
    console.error('No books were successfully processed!');
    process.exit(1);
  }

  const fileContent = `// Auto-generated file - Do not edit manually
// Generated on: ${new Date().toISOString()}
// Run 'npm run generate-books' to regenerate
// Source: EPUB files in /public/sample-books/

export interface SampleBook {
  id: string;
  title: string;
  author: string;
  passages: string[];
}

export const SAMPLE_BOOKS: SampleBook[] = ${JSON.stringify(books, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/\\\\/g, '\\')};\n`;

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, fileContent, 'utf-8');

  console.log('✓ Sample books file generated successfully!');
  console.log(`Output: ${outputPath}`);
  console.log(`Total books: ${books.length}`);
  console.log(`Total passages: ${books.reduce((sum, b) => sum + b.passages.length, 0)}\n`);
}

generateSampleBooksFile().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});