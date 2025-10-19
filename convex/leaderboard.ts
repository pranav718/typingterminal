import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper function to calculate composite score
function calculateScore(wpm: number, accuracy: number): number {
  // Using multiplicative approach: penalizes low accuracy
  return wpm * (accuracy / 100);
}

export const getLeaderboard = query({
  args: { 
    limit: v.optional(v.number()),
    sortBy: v.optional(v.union(
      v.literal("composite"), 
      v.literal("wpm"), 
      v.literal("accuracy")
    ))
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const sortBy = args.sortBy ?? "composite";
    
    const allStats = await ctx.db.query("userStats").collect();

    // Calculate composite scores and enrich with user data
    const enrichedStats = await Promise.all(
      allStats.map(async (stat) => {
        const user = await ctx.db.get(stat.userId);
        return {
          userId: stat.userId,
          displayName: user?.name || user?.email?.split("@")[0] || "Anonymous",
          email: user?.email,
          image: user?.image,
          bestWpm: stat.bestWpm,
          averageWpm: stat.averageWpm,
          bestAccuracy: stat.bestAccuracy,
          averageAccuracy: stat.averageAccuracy,
          totalSessions: stat.totalSessions,
          totalWordsTyped: stat.totalWordsTyped,
          compositeScore: stat.compositeScore || calculateScore(stat.bestWpm, stat.bestAccuracy),
          lastUpdated: stat.lastUpdated,
        };
      })
    );

    // Sort based on selected criteria
    const sorted = enrichedStats.sort((a, b) => {
      switch (sortBy) {
        case "wpm":
          // Sort by best WPM, then by accuracy as tiebreaker
          if (b.bestWpm !== a.bestWpm) {
            return b.bestWpm - a.bestWpm;
          }
          return b.bestAccuracy - a.bestAccuracy;
        
        case "accuracy":
          // Sort by accuracy, then by WPM as tiebreaker
          if (b.bestAccuracy !== a.bestAccuracy) {
            return b.bestAccuracy - a.bestAccuracy;
          }
          return b.bestWpm - a.bestWpm;
        
        case "composite":
        default:
          // Sort by composite score, then by sessions as tiebreaker
          if (b.compositeScore !== a.compositeScore) {
            return b.compositeScore - a.compositeScore;
          }
          return b.totalSessions - a.totalSessions;
      }
    }).slice(0, limit);

    // Add rankings
    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  },
});

export const getTopByWPM = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_best_wpm")
      .order("desc")
      .take(limit);

    const leaderboard = await Promise.all(
      stats.map(async (stat) => {
        const user = await ctx.db.get(stat.userId);
        return {
          rank: 0, // will be set below
          userId: stat.userId,
          displayName: user?.name || user?.email?.split("@")[0] || "Anonymous",
          email: user?.email,
          image: user?.image,
          bestWpm: stat.bestWpm,
          averageWpm: stat.averageWpm,
          bestAccuracy: stat.bestAccuracy,
          averageAccuracy: stat.averageAccuracy,
          totalSessions: stat.totalSessions,
          compositeScore: stat.compositeScore || calculateScore(stat.bestWpm, stat.bestAccuracy),
        };
      })
    );

    // Add rankings
    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  },
});

export const getTopByAccuracy = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    
    const allStats = await ctx.db
      .query("userStats")
      .collect();

    // Sort by best accuracy, then by best WPM as tiebreaker
    const sorted = allStats
      .sort((a, b) => {
        if (b.bestAccuracy !== a.bestAccuracy) {
          return b.bestAccuracy - a.bestAccuracy;
        }
        return b.bestWpm - a.bestWpm;
      })
      .slice(0, limit);

    const leaderboard = await Promise.all(
      sorted.map(async (stat) => {
        const user = await ctx.db.get(stat.userId);
        return {
          rank: 0,
          userId: stat.userId,
          displayName: user?.name || user?.email?.split("@")[0] || "Anonymous",
          email: user?.email,
          image: user?.image,
          bestWpm: stat.bestWpm,
          averageWpm: stat.averageWpm,
          bestAccuracy: stat.bestAccuracy,
          averageAccuracy: stat.averageAccuracy,
          totalSessions: stat.totalSessions,
          compositeScore: stat.compositeScore || calculateScore(stat.bestWpm, stat.bestAccuracy),
        };
      })
    );

    return leaderboard.map((entry, index) => ({
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

    const userStat = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userStat) return null;

    // Get all stats sorted by composite score
    const allStats = await ctx.db
      .query("userStats")
      .collect();

    // Sort by composite score
    const sorted = allStats.sort((a, b) => {
      const scoreA = a.compositeScore || calculateScore(a.bestWpm, a.bestAccuracy);
      const scoreB = b.compositeScore || calculateScore(b.bestWpm, b.bestAccuracy);
      return scoreB - scoreA;
    });

    const rank = sorted.findIndex((s) => s.userId === userId) + 1;

    return {
      rank,
      totalUsers: allStats.length,
      percentile: rank > 0 ? Math.round((1 - (rank / allStats.length)) * 100) : 0,
      bestWpm: userStat.bestWpm,
      bestAccuracy: userStat.bestAccuracy,
      compositeScore: userStat.compositeScore || calculateScore(userStat.bestWpm, userStat.bestAccuracy),
    };
  },
});

export const getLeaderboards = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const allStats = await ctx.db.query("userStats").collect();

    const enrichedStats = await Promise.all(
      allStats.map(async (stat) => {
        const user = await ctx.db.get(stat.userId);
        return {
          userId: stat.userId,
          displayName: user?.name || user?.email?.split("@")[0] || "Anonymous",
          email: user?.email,
          image: user?.image,
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

    return {
      speed: enrichedStats
        .sort((a, b) => b.bestWpm - a.bestWpm || b.bestAccuracy - a.bestAccuracy)
        .slice(0, limit)
        .map((e, i) => ({ ...e, rank: i + 1 })),
      
      accuracy: enrichedStats
        .sort((a, b) => b.bestAccuracy - a.bestAccuracy || b.bestWpm - a.bestWpm)
        .slice(0, limit)
        .map((e, i) => ({ ...e, rank: i + 1 })),
      
      balanced: enrichedStats
        .sort((a, b) => b.compositeScore - a.compositeScore)
        .slice(0, limit)
        .map((e, i) => ({ ...e, rank: i + 1 })),
      
      consistent: enrichedStats
        .filter((s) => s.totalSessions >= 10) // Only experienced users
        .sort((a, b) => b.averageWpm - a.averageWpm)
        .slice(0, limit)
        .map((e, i) => ({ ...e, rank: i + 1 })),
    };
  },
});

export const getTopPerformers = query({
  args: {},
  handler: async (ctx) => {
    const allStats = await ctx.db.query("userStats").collect();

    // Get top 3 for each category
    const enrichedStats = await Promise.all(
      allStats.map(async (stat) => {
        const user = await ctx.db.get(stat.userId);
        return {
          userId: stat.userId,
          displayName: user?.name || user?.email?.split("@")[0] || "Anonymous",
          email: user?.email,
          image: user?.image,
          bestWpm: stat.bestWpm,
          averageWpm: stat.averageWpm,
          bestAccuracy: stat.bestAccuracy,
          compositeScore: stat.compositeScore || calculateScore(stat.bestWpm, stat.bestAccuracy),
          totalSessions: stat.totalSessions,
        };
      })
    );

    return {
      fastestTypers: enrichedStats
        .sort((a, b) => b.bestWpm - a.bestWpm)
        .slice(0, 3),
      
      mostAccurate: enrichedStats
        .sort((a, b) => b.bestAccuracy - a.bestAccuracy)
        .slice(0, 3),
      
      topOverall: enrichedStats
        .sort((a, b) => b.compositeScore - a.compositeScore)
        .slice(0, 3),
      
      mostDedicated: enrichedStats
        .sort((a, b) => b.totalSessions - a.totalSessions)
        .slice(0, 3),
    };
  },
});

export const getGlobalStats = query({
  args: {},
  handler: async (ctx) => {
    const allStats = await ctx.db.query("userStats").collect();
    
    if (allStats.length === 0) {
      return {
        totalUsers: 0,
        totalSessions: 0,
        averageWpm: 0,
        averageAccuracy: 0,
        highestWpm: 0,
        highestAccuracy: 0,
      };
    }

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

export const getNearbyRanks = query({
  args: { 
    range: v.optional(v.number()) // How many ranks above/below to show
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const range = args.range ?? 5;

    const userStat = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!userStat) return null;

    const allStats = await ctx.db.query("userStats").collect();
    
    // Sort by composite score
    const sorted = allStats.sort((a, b) => {
      const scoreA = a.compositeScore || calculateScore(a.bestWpm, a.bestAccuracy);
      const scoreB = b.compositeScore || calculateScore(b.bestWpm, b.bestAccuracy);
      return scoreB - scoreA;
    });

    const userIndex = sorted.findIndex((s) => s.userId === userId);
    if (userIndex === -1) return null;

    const start = Math.max(0, userIndex - range);
    const end = Math.min(sorted.length, userIndex + range + 1);
    const nearby = sorted.slice(start, end);

    const enriched = await Promise.all(
      nearby.map(async (stat, idx) => {
        const user = await ctx.db.get(stat.userId);
        return {
          rank: start + idx + 1,
          userId: stat.userId,
          displayName: user?.name || user?.email?.split("@")[0] || "Anonymous",
          email: user?.email,
          image: user?.image,
          bestWpm: stat.bestWpm,
          averageWpm: stat.averageWpm,
          bestAccuracy: stat.bestAccuracy,
          compositeScore: stat.compositeScore || calculateScore(stat.bestWpm, stat.bestAccuracy),
          isCurrentUser: stat.userId === userId,
        };
      })
    );

    return enriched;
  },
});