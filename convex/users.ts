import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateUser = mutation({
  args: { email: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existing) return existing;
    
    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      createdAt: Date.now(),
    });
  },
});

export const getCurrentUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});