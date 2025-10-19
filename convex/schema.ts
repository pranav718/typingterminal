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
});

export default schema;