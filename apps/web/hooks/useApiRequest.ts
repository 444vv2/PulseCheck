"use client";

import { useCallback } from "react";
import { getStoredToken } from "../lib/authStorage";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

export function useApiRequest() {
  return useCallback(async (path: string, init?: RequestInit) => {
    const token = getStoredToken();
    if (!token) throw new Error("You are not authenticated.");

    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    const data = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    if (!response.ok) throw new Error(data?.message ?? "Request failed.");
    return { response, data };
  }, []);
}
