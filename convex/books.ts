import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveBook = mutation({
  args: {
    title: v.string(),
    passages: v.array(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const bookId = await ctx.db.insert("books", {
      userId,
      title: args.title,
      uploadedAt: Date.now(),
      totalPassages: args.passages.length,
      lastReadPosition: 0,
      isPublic: args.isPublic ?? false,
    });

    await Promise.all(
      args.passages.map((content, index) =>
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
