import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  books: defineTable({
    userId: v.id("users"),
    title: v.string(),
    uploadedAt: v.number(),
    totalPassages: v.number(),
    lastReadPosition: v.number(), 
    fileStorageId: v.optional(v.string()), 
  }).index("by_user", ["userId"]),

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
  }).index("by_user", ["userId"])
    .index("by_book", ["bookId"]),
});