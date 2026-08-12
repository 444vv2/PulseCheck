"use client";

import { useEffect, useState } from "react";
import { useApiRequest } from "./useApiRequest";

type MonitorSummary = { id: string; url: string };
type PingResult = { checkedAt: string; responseTimeMs: number; isUp: boolean };

export function useMonitorList() {
  const request = useApiRequest();
  const [monitors, setMonitors] = useState<MonitorSummary[]>([]);

  useEffect(() => {
    request("/monitors?page=1&limit=20")
      .then(({ data }) =>
        setMonitors((data as unknown as { items: MonitorSummary[] }).items),
      )
      .catch(() => setMonitors([]));
  }, []);

  return monitors;
}

export function useMonitorResults(monitorId: string) {
  const request = useApiRequest();
  const [results, setResults] = useState<PingResult[]>([]);

  useEffect(() => {
    if (!monitorId) {
      setResults([]);
      return;
    }
    request(`/monitors/${monitorId}/ping-results`)
      .then(({ data }) =>
        setResults([...(data as unknown as PingResult[])].reverse()),
      )
      .catch(() => setResults([]));
  }, [monitorId]);

  return results;
}
