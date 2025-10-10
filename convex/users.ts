import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateUser = mutation({
  args: { 
    email: v.string(), 
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    role: v.union(v.literal("guest"), v.literal("user")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existing) return existing;
    
    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      image: args.image,
      role: args.role,
      createdAt: Date.now(),
    });
  },
});

export const createGuestUser = mutation({
  args: {},
  handler: async (ctx) => {
    const guestEmail = `guest_${Date.now()}@terminaltype.temp`;
    return await ctx.db.insert("users", {
      email: guestEmail,
      name: "Guest User",
      role: "guest",
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
