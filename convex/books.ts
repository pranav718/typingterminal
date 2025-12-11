import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { normalizeText } from "./textNormalization";

export const saveBook = mutation({
  args: {
    title: v.string(),
    passages: v.array(v.string()),
    isPublic: v.optional(v.boolean()),
    lowercase: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const processedPassages = args.passages.map(passage => {
      let processed = normalizeText(passage);
      if (args.lowercase) {
        processed = processed.toLowerCase();
      }
      return processed;
    });

    const bookId = await ctx.db.insert("books", {
      userId,
      title: args.title,
      uploadedAt: Date.now(),
      totalPassages: processedPassages.length,
      lastReadPosition: 0,
      isPublic: args.isPublic ?? false,
    });

    await Promise.all(
      processedPassages.map((content, index) =>
        ctx.db.insert("passages", {
          bookId,
          content,
          index,
        })
      )
    );

    return bookId;
  },
});

export const getUserBooks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("books")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getPublicBooks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("books")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .collect();
  },
});

export const getBookWithPassages = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.bookId);
    if (!book) return null;

    const passages = await ctx.db
      .query("passages")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .collect();

    return {
      ...book,
      passages: passages.sort((a, b) => a.index - b.index),
    };
  },
});

export const updateLastPosition = mutation({
  args: {
    bookId: v.id("books"),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const book = await ctx.db.get(args.bookId);
    if (!book || book.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    if (book.lastReadPosition !== args.position) {
      await ctx.db.patch(args.bookId, {
        lastReadPosition: args.position,
      });
    }
  },
});

export const getSampleBookProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return {};

    const progress = await ctx.db
      .query("sampleBookProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const progressMap: Record<string, number> = {};
    progress.forEach((p) => {
      progressMap[p.bookId] = p.passageIndex;
    });

    return progressMap;
  },
});

export const updateSampleBookProgress = mutation({
  args: {
    bookId: v.string(),
    passageIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("sampleBookProgress")
      .withIndex("by_user_and_book", (q) => 
        q.eq("userId", userId).eq("bookId", args.bookId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        passageIndex: args.passageIndex,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("sampleBookProgress", {
        userId,
        bookId: args.bookId,
        passageIndex: args.passageIndex,
        updatedAt: Date.now(),
      });
    }
  },
});