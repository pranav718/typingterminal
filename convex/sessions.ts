import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function calculateScore(wpm: number, accuracy: number): number {
  return wpm * (accuracy / 100);
}

export const saveSession = mutation({
  args: {
    bookId: v.optional(v.id("books")),
    passageIndex: v.number(),
    wpm: v.number(),
    accuracy: v.number(),
    errors: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Server-side validation to prevent exploiting
    if (args.wpm > 300) {
      throw new Error("Invalid WPM: Score exceeds maximum possible limit.");
    }

    const sessionId = await ctx.db.insert("typingSessions", {
      userId,
      ...args,
      completedAt: Date.now(),
    });

    const existingStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const wordsTyped = Math.round(args.wpm * 1);

    if (existingStats) {

      const newTotalSessions = existingStats.totalSessions + 1;
      const newTotalWords = existingStats.totalWordsTyped + wordsTyped;

      const newAvgWpm = Math.round(
        (existingStats.averageWpm * existingStats.totalSessions + args.wpm) / newTotalSessions
      );
      const newAvgAccuracy = Math.round(
        (existingStats.averageAccuracy * existingStats.totalSessions + args.accuracy) / newTotalSessions
      );

      const newBestWpm = Math.max(existingStats.bestWpm, args.wpm);
      const newBestAccuracy = Math.max(existingStats.bestAccuracy, args.accuracy);

      const compositeScore = calculateScore(newBestWpm, newBestAccuracy);

      await ctx.db.patch(existingStats._id, {
        bestWpm: newBestWpm,
        averageWpm: newAvgWpm,
        bestAccuracy: newBestAccuracy,
        averageAccuracy: newAvgAccuracy,
        totalSessions: newTotalSessions,
        totalWordsTyped: newTotalWords,
        compositeScore,
        lastUpdated: Date.now(),
      });
    } else {

      await ctx.db.insert("userStats", {
        userId,
        bestWpm: args.wpm,
        averageWpm: args.wpm,
        bestAccuracy: args.accuracy,
        averageAccuracy: args.accuracy,
        totalSessions: 1,
        totalWordsTyped: wordsTyped,
        compositeScore: calculateScore(args.wpm, args.accuracy),
        lastUpdated: Date.now(),
      });
    }

    return sessionId;
  },
});

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!stats) {
      return {
        totalSessions: 0,
        averageWpm: 0,
        averageAccuracy: 0,
        bestWpm: 0,
        bestAccuracy: 0,
        totalWordsTyped: 0,
        compositeScore: 0,
      };
    }

    return stats;
  },
});

export const getRecentSessions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit ?? 10;

    const sessions = await ctx.db
      .query("typingSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return sessions.map(s => ({
      _id: s._id,
      wpm: s.wpm,
      accuracy: s.accuracy,
      errors: s.errors,
      completedAt: s.completedAt,
      bookId: s.bookId,
      passageIndex: s.passageIndex,
    }));
  },
});

export const getSessionsByBook = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const sessions = await ctx.db
      .query("typingSessions")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    return sessions.sort((a, b) => b.completedAt - a.completedAt);
  },
});

export const deleteSession = mutation({
  args: { sessionId: v.id("typingSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.sessionId);

    return { success: true };
  },
});