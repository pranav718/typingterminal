import { Id } from '../../../convex/_generated/dataModel';

export type UserRole = 'guest' | 'user';

export interface User {
  id?: string;
  email: string;
  name?: string;
  role: UserRole;
  image?: string;
}

export interface Book {
  _id: Id<"books">;
  title: string;
  totalPassages: number;
  lastReadPosition: number;
  uploadedAt: number;
}

export interface Passage {
  _id: Id<"passages">;
  bookId: Id<"books">;
  content: string;
  index: number;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  liveWpm: number;
  liveAccuracy: number;
}

export interface ProcessedBook {
  title: string;
  passages: string[];
}
