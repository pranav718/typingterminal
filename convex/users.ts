import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    return await ctx.db.get(userId);
  },
});

export const createGuestUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await ctx.db.insert("users", {
      email: `guest_${Date.now()}@terminaltype.temp`,
      name: "Guest User",
      role: "guest",
      isAnonymous: true,
      createdAt: Date.now(),
    });
    
    return userId;
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("guest"), v.literal("user")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role });
  },
});