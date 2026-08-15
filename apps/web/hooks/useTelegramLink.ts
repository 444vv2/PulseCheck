"use client";

import { useCallback, useEffect, useState } from "react";
import { useApiRequest } from "./useApiRequest";

export function useTelegramLink(hasToken: boolean) {
  const request = useApiRequest();
  const [linked, setLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const { data } = await request("/notifications/telegram/status");
      setLinked(Boolean((data as { linked?: boolean } | null)?.linked));
    } catch {
      setLinked(false);
    }
  }, [request]);

  useEffect(() => {
    if (hasToken) void refreshStatus();
  }, [hasToken, refreshStatus]);

  const generateLink = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await request("/notifications/telegram/link-token", {
        method: "POST",
      });
      return (data as { link?: string } | null)?.link ?? null;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  const unlink = useCallback(async () => {
    try {
      await request("/notifications/telegram/link", { method: "DELETE" });
      setLinked(false);
    } catch {
    }
  }, [request]);

  return { linked, isLoading, generateLink, unlink, refreshStatus };
}
