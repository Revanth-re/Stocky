import { cookies } from "next/headers";

export const ACCESS_TOKEN_COOKIE = "kirana_access_token";
export const REFRESH_TOKEN_COOKIE = "kirana_refresh_token";

const isProd = process.env.NODE_ENV === "production";

const ONE_DAY = 60 * 60 * 24;
const THIRTY_DAYS = ONE_DAY * 30;

/**
 * `rememberMe` controls how long the session survives closing the browser /
 * coming back later — checked at login gives the full 30 days (matching the
 * refresh token), unchecked still gets a full day so a normal work session
 * doesn't get logged out mid-use.
 */
export async function setAuthCookies(accessToken: string, refreshToken: string, rememberMe = true) {
  const accessMaxAge = rememberMe ? THIRTY_DAYS : ONE_DAY;

  const store = await cookies();
  store.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
  });
  store.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}
