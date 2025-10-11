import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

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

    return await ctx.db.insert("typingSessions", {
      userId,
      ...args,
      completedAt: Date.now(),
    });
  },
});

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const sessions = await ctx.db
      .query("typingSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageWpm: 0,
        averageAccuracy: 0,
        totalWordsTyped: 0,
      };
    }

    const totalWpm = sessions.reduce((sum, s) => sum + s.wpm, 0);
    const totalAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0);

    return {
      totalSessions: sessions.length,
      averageWpm: Math.round(totalWpm / sessions.length),
      averageAccuracy: Math.round(totalAccuracy / sessions.length),
      totalWordsTyped: sessions.length * 50,
    };
  },
});