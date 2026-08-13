"use client";

import { useCallback, useEffect, useState } from "react";
import { socket } from "../lib/socket";
import { useApiRequest } from "./useApiRequest";

export type Monitor = {
  id: string;
  url: string;
  intervalSec: number;
  isActive: boolean;
  lastCheckedAt: string | null;
  createdAt: string;
  lastStatusCode?: number | null;
  lastIsUp?: boolean;
  lastResponseTimeMs?: number;
};

type MonitorUpdate = {
  monitorId: string;
  statusCode: number | null;
  isUp: boolean;
  responseTimeMs: number;
  checkedAt: string;
};

export function useMonitors(hasToken: boolean) {
  const request = useApiRequest();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [status, setStatus] = useState("Enter to see your monitors.");

  const loadMonitors = useCallback(async () => {
    try {
      const { data } = await request("/monitors?page=1&limit=20");
      const response = data as unknown as { items: Monitor[] };
      setMonitors(response.items);
      setStatus(
        response.items.length
          ? "Data updated just now."
          : "Add your first endpoint to start monitoring.",
      );
    } catch (reason) {
      setStatus(
        reason instanceof Error ? reason.message : "Failed to load monitors.",
      );
    }
  }, [request]);

  useEffect(() => {
    if (hasToken) void loadMonitors();
  }, [hasToken, loadMonitors]);

  useEffect(() => {
    if (!monitors.length) return;

    const ids = monitors.map((m) => m.id);
    ids.forEach((id) => socket.emit("subscribe:monitor", id));

    const handleUpdate = (data: MonitorUpdate) => {
      setMonitors((prev) =>
        prev.map((m) =>
          m.id === data.monitorId
            ? {
                ...m,
                lastCheckedAt: data.checkedAt,
                lastStatusCode: data.statusCode,
                lastIsUp: data.isUp,
                lastResponseTimeMs: data.responseTimeMs,
              }
            : m,
        ),
      );
    };

    socket.on("monitor:update", handleUpdate);

    return () => {
      ids.forEach((id) => socket.emit("unsubscribe:monitor", id));
      socket.off("monitor:update", handleUpdate);
    };
  }, [monitors.map((m) => m.id).join(",")]);

  const addMonitor = useCallback(
    async (url: string, intervalSec: number) => {
      try {
        await request("/monitors", {
          method: "POST",
          body: JSON.stringify({ url, intervalSec }),
        });
        await loadMonitors();
        return true;
      } catch (reason) {
        setStatus(
          reason instanceof Error
            ? reason.message
            : "Failed to create monitor.",
        );
        return false;
      }
    },
    [request, loadMonitors],
  );

  const toggleMonitor = useCallback(
    async (monitor: Monitor) => {
      try {
        await request(`/monitors/${monitor.id}`, {
          method: "PATCH",
          body: JSON.stringify({ isActive: !monitor.isActive }),
        });
        await loadMonitors();
      } catch (reason) {
        setStatus(
          reason instanceof Error
            ? reason.message
            : "Failed to update monitor.",
        );
      }
    },
    [request, loadMonitors],
  );

  const deleteMonitor = useCallback(
    async (id: string) => {
      try {
        await request(`/monitors/${id}`, { method: "DELETE" });
        await loadMonitors();
      } catch (reason) {
        setStatus(
          reason instanceof Error
            ? reason.message
            : "Failed to delete monitor.",
        );
      }
    },
    [request, loadMonitors],
  );

  const updateMonitorUrl = useCallback(
    async (monitor: Monitor, url: string) => {
      try {
        await request(`/monitors/${monitor.id}`, {
          method: "PATCH",
          body: JSON.stringify({ url }),
        });
        await loadMonitors();
        return true;
      } catch (reason) {
        setStatus(
          reason instanceof Error
            ? reason.message
            : "Failed to update monitor URL.",
        );
        return false;
      }
    },
    [request, loadMonitors],
  );

  return {
    monitors,
    status,
    loadMonitors,
    addMonitor,
    toggleMonitor,
    deleteMonitor,
    updateMonitorUrl,
  };
}
