import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

interface ProviderConfig {
  clientId: string;
  clientSecret: string;
}

// Define the configuration for Google provider
const googleProviderConfig: ProviderConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
};
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
//   site: process.env.NEXTAUTH_URL,
  providers: [
    GoogleProvider({
      clientId: googleProviderConfig.clientId,
      clientSecret: googleProviderConfig.clientSecret,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
});
