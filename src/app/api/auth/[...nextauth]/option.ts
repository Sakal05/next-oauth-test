import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { GoogleProfile } from "next-auth/providers/google";

// interface

export const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      profile(profile: GoogleProfile) {
        console.log(profile);
        // send reques to backend api, verifiy with role and permission inside db
        return {
          ...profile,
          role: profile.role ?? "admin",
          id: "123456789",
          image: profile.picture,
        };
      },
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username:",
          type: "text",
          placeholder: "your-cool-username",
        },
        password: {
          label: "Password:",
          type: "password",
          placeholder: "your-awesome-password",
        },
      },
      async authorize(credentials) {
        // This is where you need to retrieve user data
        // to verify with credentials
        // Docs: https://next-auth.js.org/configuration/providers/credentials
        const user = {
          id: "42",
          name: "Sakal",
          password: "nextauth",
          role: "admin",
        };

        if (
          credentials?.username === user.name &&
          credentials?.password === user.password
        ) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Ref: https://authjs.dev/guides/basics/role-based-access-control#persisting-the-role
    async jwt({ token, user, account }) {
      if (account?.access_token) {
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token;
      }
      console.log("token 1:", token);
      console.log("user 1:", user);

      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("User Info Request:", data);
        });

      if (user) token.role = user.role;
      return token;
    },
    // If you want to use the role in client components
    async session({ session, token }) {
      console.log("Session:", session);
      console.log("token: ", token);
      if (session?.user) session.user.role = token.role;
      return session;
    },
  },
};
