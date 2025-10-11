import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    return await ctx.db.get(userId);
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(userId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.image !== undefined && { image: args.image }),
    });

    return { success: true };
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
        bestWpm: 0,
        recentSessions: [],
      };
    }

    const totalWpm = sessions.reduce((sum, s) => sum + s.wpm, 0);
    const totalAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0);
    const bestWpm = Math.max(...sessions.map(s => s.wpm));

    const recentSessions = sessions
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 10);

    return {
      totalSessions: sessions.length,
      averageWpm: Math.round(totalWpm / sessions.length),
      averageAccuracy: Math.round(totalAccuracy / sessions.length),
      bestWpm,
      recentSessions: recentSessions.map(s => ({
        wpm: s.wpm,
        accuracy: s.accuracy,
        completedAt: s.completedAt,
      })),
    };
  },
});