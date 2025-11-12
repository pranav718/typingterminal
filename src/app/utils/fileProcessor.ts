import { processPDFClient } from './clientPdfProcessor';
import { processEPUBClient } from './clientEpubProcessor';

export interface ProcessedBook {
  title: string;
  passages: string[];
}

export async function processBookFile(file: File): Promise<ProcessedBook> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (fileExtension === 'pdf') {
    return await processPDFClient(file);
  } else if (fileExtension === 'epub') {
    return await processEPUBClient(file);
  } else {
    throw new Error(`Unsupported file type: ${fileExtension}. Please upload PDF or EPUB files.`);
  }
}