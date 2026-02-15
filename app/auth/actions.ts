"use server"

import { cookies } from "next/headers"
import {
  createJWT,
  verifyJWT,
  hashPassword,
  verifyPassword,
  getCookieName,
  getCookieOptions,
  type SessionPayload,
} from "@/lib/auth"
import { findUserByEmail, createUser } from "@/lib/user-store"

export interface AuthResult {
  success: boolean
  error?: string
  redirect?: string
  requires2FA?: boolean
  email?: string
}

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Email and password are required" }
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.status === 202) {
      const cookieStore = await cookies()
      cookieStore.set("auth_pending", data.tempToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600
      })
      return { success: true, requires2FA: true, email }
    }

    if (!res.ok) {
      if (res.status === 403) return { success: false, error: "Account locked" }
      return { success: false, error: data.message || "Invalid credentials" }
    }

    const { token } = data;

    const cookieStore = await cookies()
    cookieStore.set(getCookieName(), token, getCookieOptions())

    return { success: true, redirect: "/dashboard" }
  } catch (err) {
    console.error("Login failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function verify2FAAction(formData: FormData): Promise<AuthResult> {
  const otp = formData.get("otp") as string;

  const cookieStore = await cookies()
  const tempToken = cookieStore.get("auth_pending")?.value

  if (!otp) return { success: false, error: "Code required" };
  if (!tempToken) return { success: false, error: "Session expired" };

  try {
    const res = await fetch("http://localhost:5000/api/auth/verify-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tempToken, otp }),
    });

    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message || "Invalid code" };

    const { token } = data;

    // Clear pending cookie
    cookieStore.delete("auth_pending")
    // Set real cookie
    cookieStore.set(getCookieName(), token, getCookieOptions())

    return { success: true, redirect: "/dashboard" };
  } catch (err) {
    return { success: false, error: "Verification failed" };
  }
}

export async function signupAction(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const password = formData.get("password") as string

  if (!email || !name || !password) {
    return { success: false, error: "All fields are required" }
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || "Signup failed" }
    }

    const { token } = data;

    const cookieStore = await cookies()
    cookieStore.set(getCookieName(), token, getCookieOptions())

    return { success: true, redirect: "/dashboard" }
  } catch (err) {
    console.error("Signup failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function logoutAction(): Promise<AuthResult> {
  const cookieStore = await cookies()
  cookieStore.delete(getCookieName())
  return { success: true, redirect: "/auth/login" }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(getCookieName())?.value
  if (!token) return null
  const payload = await verifyJWT(token)
  if (payload) {
    return { ...payload, token }
  }
  return null
}
