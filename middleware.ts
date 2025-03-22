import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (request.nextUrl.pathname.startsWith("/admin")) {
        if (!token || token.role !== "admin") {
            const url = new URL("/login", request.url);
            url.searchParams.set("callbackUrl", request.url);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
