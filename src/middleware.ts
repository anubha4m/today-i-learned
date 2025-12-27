import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: [
    // Protect all routes except auth, api/auth, static files, and public assets
    "/((?!auth|api/auth|_next/static|_next/image|favicon.ico|.*\\.svg).*)",
  ],
};

