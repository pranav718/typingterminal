import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    role: v.union(v.literal("guest"), v.literal("user")),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"]),

  books: defineTable({
    userId: v.id("users"),
    title: v.string(),
    uploadedAt: v.number(),
    totalPassages: v.number(),
    lastReadPosition: v.number(),
    isPublic: v.boolean(),
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
    .index("by_book", ["bookId"]),
});