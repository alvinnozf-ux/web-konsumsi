export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/permintaan/:path*",
    "/persetujuan/:path*",
    "/users/:path*",
  ],
};
