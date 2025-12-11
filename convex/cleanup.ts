import { mutation } from "./_generated/server";

export const fixBadData = mutation({
    args: {},
    handler: async (ctx) => {
        const badSessions = await ctx.db
            .query("typingSessions")
            .filter((q) => q.gt(q.field("wpm"), 300))
            .collect();

        const affectedUserIds = new Set<string>();

        for (const session of badSessions) {
            affectedUserIds.add(session.userId);
            await ctx.db.delete(session._id);
        }

        const badMatchResults = await ctx.db
            .query("matchResults")
            .filter((q) => q.gt(q.field("wpm"), 300))
            .collect();

        for (const result of badMatchResults) {
            affectedUserIds.add(result.userId);
            await ctx.db.patch(result._id, {
                wpm: 0,
                accuracy: 0,
                errors: 0,
                isFinished: false
            });
        }

        console.log(`Found ${badSessions.length} bad sessions and ${badMatchResults.length} bad match results.`);
        console.log(`Recalculating stats for ${affectedUserIds.size} users...`);

        for (const userId of affectedUserIds) {
            const userSessions = await ctx.db
                .query("typingSessions")
                .withIndex("by_user", (q) => q.eq("userId", userId as any))
                .collect();

            const userStats = await ctx.db
                .query("userStats")
                .withIndex("by_user", (q) => q.eq("userId", userId as any))
                .first();

            if (!userStats) continue;

            if (userSessions.length === 0) {
                await ctx.db.patch(userStats._id, {
                    totalSessions: 0,
                    totalWordsTyped: 0,
                    averageWpm: 0,
                    averageAccuracy: 0,
                    bestWpm: 0,
                    bestAccuracy: 0,
                    compositeScore: 0,
                    lastUpdated: Date.now(),
                });
                continue;
            }

            let totalWpm = 0;
            let totalAccuracy = 0;
            let maxWpm = 0;
            let maxAccuracy = 0;
            let totalWords = 0;

            for (const s of userSessions) {
                totalWpm += s.wpm;
                totalAccuracy += s.accuracy;
                maxWpm = Math.max(maxWpm, s.wpm);
                maxAccuracy = Math.max(maxAccuracy, s.accuracy);

                totalWords += Math.round(s.wpm);
            }

            const avgWpm = Math.round(totalWpm / userSessions.length);
            const avgAcc = Math.round(totalAccuracy / userSessions.length);
            const compositeScore = maxWpm * (maxAccuracy / 100);

            await ctx.db.patch(userStats._id, {
                totalSessions: userSessions.length,
                totalWordsTyped: totalWords,
                averageWpm: avgWpm,
                averageAccuracy: avgAcc,
                bestWpm: maxWpm,
                bestAccuracy: maxAccuracy,
                compositeScore,
                lastUpdated: Date.now(),
            });
        }

        return {
            deletedSessions: badSessions.length,
            fixedMatchResults: badMatchResults.length,
            recalculatedUsers: affectedUserIds.size
        };
    },
});
