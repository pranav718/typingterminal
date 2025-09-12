export interface ProcessedBook {
  title: string;
  passages: string[];
}

let pdfjsLib: any = null;

if (typeof window !== 'undefined') {
  import('pdfjs-dist/legacy/build/pdf').then((pdfjs) => {
    pdfjsLib = pdfjs;
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
  });
}

export async function processPDFClient(file: File): Promise<ProcessedBook> {
  if (!pdfjsLib) {
    throw new Error('PDF library is still loading. Please try again.');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + ' ';
    }
    
    const passages = processExtractedText(fullText);
    
    return {
      title: file.name.replace('.pdf', ''),
      passages: passages.length > 0 ? passages : ['No readable text found in this PDF.']
    };
  } catch (error) {
    console.error('PDF processing error:', error);
    throw new Error('Failed to process PDF. The file might be corrupted or password-protected.');
  }
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
  ];
  
  const cleanText = text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  const sentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(sentence => {
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
    
    if ((sentenceCount >= 2 && currentPassage.length > 150) || 
        currentPassage.length > 300 || 
        sentenceCount >= 4) {
      passages.push(currentPassage.trim());
      currentPassage = '';
      sentenceCount = 0;
    }
  }
  
  if (currentPassage.trim() && currentPassage.length > 50) {
    passages.push(currentPassage.trim());
  }
  
  return passages.filter(passage => {
    if (passage.length < 80 || passage.length > 500) return false;
    
  
    const upperRatio = (passage.match(/[A-Z]/g) || []).length / passage.length;
    if (upperRatio > 0.5) return false;
    
    return true;
  }).slice(0, 50);
}