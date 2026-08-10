"use client";

import { useEffect, useState } from "react";
import { socket } from "../lib/socket";

interface PingResult {
  monitorId: string;
  statusCode: number | null;
  isUp: boolean;
  responseTimeMs: number;
  error: string | null;
  checkedAt: string;
}

export function MonitorCard({
  monitorId,
  url,
}: {
  monitorId: string;
  url: string;
}) {
  const [latestResult, setLatestResult] = useState<PingResult | null>(null);

  useEffect(() => {
    socket.emit("subscribe:monitor", monitorId);

    const handleUpdate = (data: PingResult) => {
      if (data.monitorId === monitorId) {
        setLatestResult(data);
      }
    };

    socket.on("monitor:update", handleUpdate);

    return () => {
      socket.emit("unsubscribe:monitor", monitorId);
      socket.off("monitor:update", handleUpdate);
    };
  }, [monitorId]);

  return (
    <div className="border rounded-lg p-4">
      <p className="font-semibold">{url}</p>
      {latestResult ? (
        <>
          <p className={latestResult.isUp ? "text-green-600" : "text-red-600"}>
            {latestResult.isUp ? "🟢 Up" : "🔴 Down"} —{" "}
            {latestResult.statusCode ?? "no response"}
          </p>
          <p className="text-sm text-gray-500">
            {latestResult.responseTimeMs}ms
          </p>
        </>
      ) : (
        <p className="text-gray-400">Очікування першої перевірки...</p>
      )}
    </div>
  );
}
