import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    console.log("Token:", token); // Debugging line to check token response

    // Admin protection
    if (request.nextUrl.pathname.startsWith("/admin")) {
        if (!token) {
            console.log("No token found, redirecting to login...");
            return NextResponse.redirect(new URL("/login", request.url));
        }

        if (token.role !== "admin") {
            console.log("Unauthorized access. User role:", token.role);
            return NextResponse.redirect(new URL("/unauthorized", request.url)); // Redirect to an unauthorized page
        }
    }

    // Authenticated user protection
    if (
        ["/profile", "/watchlist", "/settings", "/notifications"].some(path =>
            request.nextUrl.pathname.startsWith(path)
        )
    ) {
        if (!token) {
            console.log("User not authenticated, redirecting to login...");
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/profile/:path*",
        "/watchlist/:path*",
        "/settings/:path*",
        "/notifications/:path*"
    ],
};
