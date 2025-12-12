import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

function calculateScore(wpm: number, accuracy: number): number {
  return wpm * (accuracy / 100);
}

export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
    sortBy: v.optional(v.union(
      v.literal("composite"),
      v.literal("wpm"),
      v.literal("accuracy"),
      v.literal("sessions")
    )),
    timeRange: v.optional(v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("all_time")
    ))
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const sortBy = args.sortBy ?? "composite";
    const timeRange = args.timeRange ?? "all_time";

    let enrichedStats;

    if (timeRange === "all_time") {
      const allStats = await ctx.db.query("userStats").collect();

      const results = await Promise.all(
        allStats.map(async (stat) => {
          const user = await ctx.db.get(stat.userId);

          if (!user || !user.name) return null;

          return {
            userId: stat.userId,
            displayName: user.name,
            email: user.email,
            image: user.image,
            bestWpm: stat.bestWpm,
            averageWpm: stat.averageWpm,
            bestAccuracy: stat.bestAccuracy,
            averageAccuracy: stat.averageAccuracy,
            totalSessions: stat.totalSessions,
            totalWordsTyped: stat.totalWordsTyped,
            compositeScore: stat.compositeScore || calculateScore(stat.bestWpm, stat.bestAccuracy),
          };
        })
      );

      enrichedStats = results.filter((s): s is NonNullable<typeof s> => s !== null);

    } else {
      const now = Date.now();
      let startTime = 0;

      if (timeRange === "daily") {
        startTime = now - (24 * 60 * 60 * 1000);
      } else if (timeRange === "weekly") {
        startTime = now - (7 * 24 * 60 * 60 * 1000);
      } else if (timeRange === "monthly") {
        startTime = now - (30 * 24 * 60 * 60 * 1000);
      }

      const sessions = await ctx.db
        .query("typingSessions")
        .filter((q) => q.gte(q.field("_creationTime"), startTime))
        .collect();

      const userAggregates = new Map<string, {
        userId: Id<"users">;
        sessions: typeof sessions;
        bestWpm: number;
        bestAccuracy: number;
      }>();

      for (const session of sessions) {
        if (!userAggregates.has(session.userId)) {
          userAggregates.set(session.userId, {
            userId: session.userId,
            sessions: [],
            bestWpm: 0,
            bestAccuracy: 0,
          });
        }
        const userEntry = userAggregates.get(session.userId)!;
        userEntry.sessions.push(session);
        userEntry.bestWpm = Math.max(userEntry.bestWpm, session.wpm);
        userEntry.bestAccuracy = Math.max(userEntry.bestAccuracy, session.accuracy);
      }

      const results = await Promise.all(
        Array.from(userAggregates.values()).map(async (entry) => {
          const user = await ctx.db.get(entry.userId);

          if (!user || !user.name) return null;

          const compositeScore = calculateScore(entry.bestWpm, entry.bestAccuracy);

          return {
            userId: entry.userId,
            displayName: user.name,
            email: user.email,
            image: user.image,
            bestWpm: entry.bestWpm,
            bestAccuracy: entry.bestAccuracy,
            averageWpm: 0,
            averageAccuracy: 0,
            totalSessions: entry.sessions.length,
            totalWordsTyped: 0,
            compositeScore: compositeScore,
          };
        })
      );

      enrichedStats = results.filter((s): s is NonNullable<typeof s> => s !== null);
    }

    const sorted = enrichedStats.sort((a, b) => {
      switch (sortBy) {
        case "wpm":
          if (b.bestWpm !== a.bestWpm) return b.bestWpm - a.bestWpm;
          return b.bestAccuracy - a.bestAccuracy;

        case "accuracy":
          if (b.bestAccuracy !== a.bestAccuracy) return b.bestAccuracy - a.bestAccuracy;
          return b.bestWpm - a.bestWpm;

        case "sessions":
          if (b.totalSessions !== a.totalSessions) return b.totalSessions - a.totalSessions;
          return b.compositeScore - a.compositeScore;

        case "composite":
        default:
          if (b.compositeScore !== a.compositeScore) return b.compositeScore - a.compositeScore;
          return b.totalSessions - a.totalSessions;
      }
    }).slice(0, limit);

    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  },
});

export const getUserRank = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    // if user has no name, they aint on the leaderboard, so return null
    if (!user || !user.name) return null;

    const userStat = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userStat) return null;

    const allStats = await ctx.db.query("userStats").collect();

    const validUserStats = [];
    for (const stat of allStats) {
      const u = await ctx.db.get(stat.userId);
      if (u && u.name) {
        validUserStats.push(stat);
      }
    }

    const sorted = validUserStats.sort((a, b) => {
      const scoreA = a.compositeScore || calculateScore(a.bestWpm, a.bestAccuracy);
      const scoreB = b.compositeScore || calculateScore(b.bestWpm, b.bestAccuracy);
      return scoreB - scoreA;
    });

    const rank = sorted.findIndex((s) => s.userId === userId) + 1;

    if (rank === 0) return null;

    return {
      rank,
      totalUsers: validUserStats.length,
      percentile: rank > 0 ? Math.round((1 - (rank / validUserStats.length)) * 100) : 0,
      bestWpm: userStat.bestWpm,
      bestAccuracy: userStat.bestAccuracy,
      compositeScore: userStat.compositeScore || calculateScore(userStat.bestWpm, userStat.bestAccuracy),
    };
  },
});

export const getGlobalStats = query({
  args: {},
  handler: async (ctx) => {
    const allStats = await ctx.db.query("userStats").collect();
    if (allStats.length === 0) return { totalUsers: 0, totalSessions: 0, averageWpm: 0, averageAccuracy: 0, highestWpm: 0, highestAccuracy: 0 };

    const totalSessions = allStats.reduce((sum, s) => sum + s.totalSessions, 0);
    const totalWpm = allStats.reduce((sum, s) => sum + s.averageWpm, 0);
    const totalAccuracy = allStats.reduce((sum, s) => sum + s.averageAccuracy, 0);
    const highestWpm = Math.max(...allStats.map(s => s.bestWpm));
    const highestAccuracy = Math.max(...allStats.map(s => s.bestAccuracy));

    return {
      totalUsers: allStats.length,
      totalSessions,
      averageWpm: Math.round(totalWpm / allStats.length),
      averageAccuracy: Math.round(totalAccuracy / allStats.length),
      highestWpm,
      highestAccuracy,
    };
  },
});

export const getTopPerformers = query({
  args: {},
  handler: async (ctx) => {
    const allStats = await ctx.db.query("userStats").collect();

    const results = await Promise.all(
      allStats.map(async (stat) => {
        const user = await ctx.db.get(stat.userId);

        if (!user || !user.name) return null;

        return {
          userId: stat.userId,
          displayName: user.name,
          email: user.email,
          image: user.image,
          bestWpm: stat.bestWpm,
          averageWpm: stat.averageWpm,
          bestAccuracy: stat.bestAccuracy,
          compositeScore: stat.compositeScore || calculateScore(stat.bestWpm, stat.bestAccuracy),
          totalSessions: stat.totalSessions,
        };
      })
    );

    const enrichedStats = results.filter((s): s is NonNullable<typeof s> => s !== null);

    return {
      fastestTypers: enrichedStats.sort((a, b) => b.bestWpm - a.bestWpm).slice(0, 3),
      mostAccurate: enrichedStats.sort((a, b) => b.bestAccuracy - a.bestAccuracy).slice(0, 3),
      topOverall: enrichedStats.sort((a, b) => b.compositeScore - a.compositeScore).slice(0, 3),
      mostDedicated: enrichedStats.sort((a, b) => b.totalSessions - a.totalSessions).slice(0, 3),
    };
  },
});