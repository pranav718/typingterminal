import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  books: defineTable({
    userId: v.id("users"),
    title: v.string(),
    uploadedAt: v.number(),
    totalPassages: v.number(),
    lastReadPosition: v.number(),
    isPublic: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_public", ["isPublic"]),

  passages: defineTable({
    bookId: v.id("books"),
    content: v.string(),
    index: v.number(),
  }).index("by_book", ["bookId"]),

  typingSessions: defineTable({
    userId: v.id("users"),
    bookId: v.optional(v.id("books")),
    passageIndex: v.number(),
    wpm: v.number(),
    accuracy: v.number(),
    errors: v.number(),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_book", ["bookId"])
    .index("by_wpm", ["wpm"])
    .index("by_accuracy", ["accuracy"]),

  sampleBookProgress: defineTable({
    userId: v.id("users"),
    bookId: v.string(),
    passageIndex: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_book", ["userId", "bookId"]),

  userStats: defineTable({
    userId: v.id("users"),
    bestWpm: v.number(),
    averageWpm: v.number(),
    bestAccuracy: v.number(),
    averageAccuracy: v.number(),
    totalSessions: v.number(),
    totalWordsTyped: v.number(),
    compositeScore: v.number(), 
    lastUpdated: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_best_wpm", ["bestWpm"])
  .index("by_average_wpm", ["averageWpm"])
  .index("by_composite_score", ["compositeScore"]),

  matches: defineTable({
    hostId: v.id("users"),
    opponentId: v.optional(v.id("users")),
    passageText: v.string(),
    passageSource: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    winnerId: v.optional(v.id("users")),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    inviteCode: v.string()
  })
    .index("by_host", ["hostId"])
    .index("by_opponent", ["opponentId"])
    .index("by_status", ["status"])
    .index("by_invite_code", ["inviteCode"]),

  matchResults: defineTable({
    matchId: v.id("matches"),
    userId: v.id("users"),
    wpm: v.number(),
    accuracy: v.number(),
    errors: v.number(),
    completedAt: v.optional(v.number()),
    isFinished: v.boolean(),
  })
    .index("by_match", ["matchId"])
    .index("by_user", ["userId"])
    .index("by_match_and_user", ["matchId", "userId"]),
});

export default schema;