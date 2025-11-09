import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Các route cần đăng nhập mới được truy cập
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/chat",
  "/orders",
  "/products",
];

// Các route chỉ dành cho người chưa đăng nhập
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lấy token từ cookie (nếu có)
  const token = request.cookies.get("token")?.value;

  // Kiểm tra nếu đang truy cập protected routes mà chưa đăng nhập
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    // Chưa đăng nhập, chuyển hướng về login
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && token) {
    // Đã đăng nhập, chuyển hướng về dashboard
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/chat/:path*",
    "/orders/:path*",
    "/products/:path*",
    "/login",
    "/register",
  ],
};
