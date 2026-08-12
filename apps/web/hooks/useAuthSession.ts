"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getStoredToken,
  getStoredEmail,
  setStoredSession,
  clearStoredSession,
} from "../lib/authStorage";

export function useAuthSession() {
  const [email, setEmail] = useState("");
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getStoredToken()));
    setEmail(getStoredEmail() ?? "Guest");
  }, []);

  const login = useCallback((accessToken: string, userEmail: string) => {
    setStoredSession(accessToken, userEmail);
  }, []);

  const signOut = useCallback(() => {
    clearStoredSession();
  }, []);

  return { email, hasToken, login, signOut };
}
