/**
 * Returns the correct backend API base URL.
 * Works on both server (Next.js Server Actions / SSR) and client (browser).
 * 
 * On the server: if NEXT_PUBLIC_API_URL points to localhost, 
 * we override it to the production Render URL since the server 
 * (e.g. Vercel) cannot reach localhost.
 */
export function getApiUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // If no URL set, use production
  if (!envUrl) {
    return "https://project-exhibition.onrender.com";
  }

  // On the server side (no window), localhost URLs are unreachable on Vercel
  if (typeof window === "undefined" && envUrl.includes("localhost")) {
    return "https://project-exhibition.onrender.com";
  }

  // On the client side, if we're on a deployed domain but env points to localhost
  if (typeof window !== "undefined" && 
      window.location.hostname !== "localhost" && 
      envUrl.includes("localhost")) {
    return "https://project-exhibition.onrender.com";
  }

  return envUrl;
}
