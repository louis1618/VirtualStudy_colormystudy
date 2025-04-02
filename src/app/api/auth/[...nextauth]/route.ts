import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Force dynamic rendering for the auth route
export const dynamic = 'force-dynamic';

// 임시 사용자 데이터 (추후 실제 데이터베이스 연동 필요)
const users = [
  {
    id: "1",
    name: "user1",
    email: "user1@example.com",
    password: "password1",
  },
  {
    id: "2",
    name: "user2",
    email: "user2@example.com",
    password: "password2",
  },
];

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 실제 구현에서는 데이터베이스에서 사용자 정보를 확인
        const user = users.find(
          (user) =>
            user.email === credentials.email &&
            user.password === credentials.password
        );

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
    // 실제 구현 시 환경 변수로 관리해야 함
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "your-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret",
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/signup",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore - Adding id to the session user object
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
