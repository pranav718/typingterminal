import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveBook = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    passages: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const bookId = await ctx.db.insert("books", {
      userId: args.userId,
      title: args.title,
      uploadedAt: Date.now(),
      totalPassages: args.passages.length,
      lastReadPosition: 0,
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
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("books")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
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
    const book = await ctx.db.get(args.bookId);
    if (!book) return;
    
    if (book.lastReadPosition !== args.position) {
      await ctx.db.patch(args.bookId, {
        lastReadPosition: args.position,
      });
    }
  },
});