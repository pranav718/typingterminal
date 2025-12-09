import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import Twitter from "@auth/core/providers/twitter";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID!,
      clientSecret: process.env.AUTH_TWITTER_SECRET!,
      profile(profile) {
        const data: any = (profile as any).data ?? profile;
        const username = data?.username ?? `x_${data?.id}`;
        return {
          id: data?.id,
          name: data?.name ?? username,
          email: `${username}@x.local`, 
          image: data?.profile_image_url?.replace("_normal", "") ?? undefined,
        };
      },
    }),
    Password,
    Anonymous,
  ],
});