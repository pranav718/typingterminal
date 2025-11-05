import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const createMatch = mutation({
  args: {
    passageText: v.string(),
    passageSource: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const inviteCode = generateInviteCode();

    const matchId = await ctx.db.insert("matches", {
      hostId: userId,
      passageText: args.passageText,
      passageSource: args.passageSource,
      status: "waiting",
      createdAt: Date.now(),
      inviteCode,
    });

    await ctx.db.insert("matchResults", {
      matchId,
      userId,
      wpm: 0,
      accuracy: 0,
      errors: 0,
      isFinished: false,
    });

    return { matchId, inviteCode };
  },
});

export const joinMatch = mutation({
  args: {
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const match = await ctx.db
      .query("matches")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!match) throw new Error("Invalid invite code");
    if (match.status !== "waiting") throw new Error("Match already started or completed");
    if (match.hostId === userId) throw new Error("You cannot join your own match");
    if (match.opponentId) throw new Error("Match already has an opponent");

    await ctx.db.patch(match._id, {
      opponentId: userId,
      status: "in_progress",
      startedAt: Date.now(),
    });

    await ctx.db.insert("matchResults", {
      matchId: match._id,
      userId,
      wpm: 0,
      accuracy: 0,
      errors: 0,
      isFinished: false,
    });

    return { matchId: match._id };
  },
});

export const getMatch = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    if (!match) return null;

    const host = await ctx.db.get(match.hostId);
    const opponent = match.opponentId ? await ctx.db.get(match.opponentId) : null;

    const results = await ctx.db
      .query("matchResults")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();

    return {
      ...match,
      host: {
        id: host?._id,
        name: host?.name || host?.email?.split("@")[0] || "Unknown",
        image: host?.image,
      },
      opponent: opponent
        ? {
            id: opponent._id,
            name: opponent.name || opponent.email?.split("@")[0] || "Unknown",
            image: opponent.image,
          }
        : null,
      results,
    };
  },
});

export const submitMatchResult = mutation({
  args: {
    matchId: v.id("matches"),
    wpm: v.number(),
    accuracy: v.number(),
    errors: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");
    if (match.status !== "in_progress") throw new Error("Match is not in progress");

    const userResult = await ctx.db
      .query("matchResults")
      .withIndex("by_match_and_user", (q) => q.eq("matchId", args.matchId).eq("userId", userId))
      .first();

    if (!userResult) throw new Error("Result entry not found");
    if (userResult.isFinished) throw new Error("You have already submitted your result");

    await ctx.db.patch(userResult._id, {
      wpm: args.wpm,
      accuracy: args.accuracy,
      errors: args.errors,
      completedAt: Date.now(),
      isFinished: true,
    });

    //save to typing sessions (for stats n leaderboard)
    await ctx.db.insert("typingSessions", {
      userId,
      passageIndex: 0, 
      wpm: args.wpm,
      accuracy: args.accuracy,
      errors: args.errors,
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
      
      const compositeScore = newBestWpm * (newBestAccuracy / 100);

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
      const compositeScore = args.wpm * (args.accuracy / 100);
      
      await ctx.db.insert("userStats", {
        userId,
        bestWpm: args.wpm,
        averageWpm: args.wpm,
        bestAccuracy: args.accuracy,
        averageAccuracy: args.accuracy,
        totalSessions: 1,
        totalWordsTyped: wordsTyped,
        compositeScore,
        lastUpdated: Date.now(),
      });
    }

    const allResults = await ctx.db
      .query("matchResults")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();

    const allFinished = allResults.every((r) => r.isFinished);

    if (allFinished) {
      const sortedResults = allResults.sort((a, b) => {
        if (b.wpm !== a.wpm) return b.wpm - a.wpm;
        return b.accuracy - a.accuracy;
      });

      const winnerId = sortedResults[0].userId;

      await ctx.db.patch(args.matchId, {
        status: "completed",
        completedAt: Date.now(),
        winnerId,
      });
    }

    return { success: true };
  },
});

export const getMyMatches = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const hostMatches = await ctx.db
      .query("matches")
      .withIndex("by_host", (q) => q.eq("hostId", userId))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    const opponentMatches = await ctx.db
      .query("matches")
      .withIndex("by_opponent", (q) => q.eq("opponentId", userId))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    const allMatches = [...hostMatches, ...opponentMatches];

    const enrichedMatches = await Promise.all(
      allMatches.map(async (match) => {
        const host = await ctx.db.get(match.hostId);
        const opponent = match.opponentId ? await ctx.db.get(match.opponentId) : null;

        return {
          ...match,
          host: {
            id: host?._id,
            name: host?.name || host?.email?.split("@")[0] || "Unknown",
            image: host?.image,
          },
          opponent: opponent
            ? {
                id: opponent._id,
                name: opponent.name || opponent.email?.split("@")[0] || "Unknown",
                image: opponent.image,
              }
            : null,
        };
      })
    );

    return enrichedMatches.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const cancelMatch = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");
    
    console.log('Cancel attempt:', {
      matchId: args.matchId,
      userId,
      hostId: match.hostId,
      status: match.status,
      passageSource: match.passageSource
    });

    if (match.hostId !== userId) throw new Error("Only host can cancel");
    if (match.status !== "waiting") throw new Error("Can only cancel waiting matches");

    await ctx.db.patch(args.matchId, {
      status: "cancelled",
    });

    return { success: true };
  },
});

export const getMatchHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit ?? 20;

    const hostMatches = await ctx.db
      .query("matches")
      .withIndex("by_host", (q) => q.eq("hostId", userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const opponentMatches = await ctx.db
      .query("matches")
      .withIndex("by_opponent", (q) => q.eq("opponentId", userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const allMatches = [...hostMatches, ...opponentMatches]
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
      .slice(0, limit);

    const enrichedMatches = await Promise.all(
      allMatches.map(async (match) => {
        const host = await ctx.db.get(match.hostId);
        const opponent = match.opponentId ? await ctx.db.get(match.opponentId) : null;
        const results = await ctx.db
          .query("matchResults")
          .withIndex("by_match", (q) => q.eq("matchId", match._id))
          .collect();

        return {
          ...match,
          host: {
            id: host?._id,
            name: host?.name || host?.email?.split("@")[0] || "Unknown",
            image: host?.image,
          },
          opponent: opponent
            ? {
                id: opponent._id,
                name: opponent.name || opponent.email?.split("@")[0] || "Unknown",
                image: opponent.image,
              }
            : null,
          results,
        };
      })
    );

    return enrichedMatches;
  },
});