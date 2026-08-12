"use client";

import { useState } from "react";
import { DashboardShell } from "../../components/layout/DashboardShell";
import { ActivityHeader } from "../../components/activity/ActivityHeader";
import { ActivityControls } from "../../components/activity/ActivityControls";
import { ActivityStats } from "../../components/activity/ActivityStats";
import { ResponseTimeChart } from "../../components/activity/ResponseTimeChart";
import {
  useMonitorList,
  useMonitorResults,
} from "../../hooks/useMonitorResults";

export default function ActivityPage() {
  const monitors = useMonitorList();
  const [selectedId, setSelectedId] = useState("");
  const [compareId, setCompareId] = useState("");

  const activeId = selectedId || monitors[0]?.id || "";
  const results = useMonitorResults(activeId);
  const compareResults = useMonitorResults(compareId);

  const activeMonitor = monitors.find((m) => m.id === activeId);
  const compareMonitor = monitors.find((m) => m.id === compareId);

  function handleSelectedChange(id: string) {
    setSelectedId(id);
    if (id === compareId) setCompareId("");
  }

  return (
    <DashboardShell>
      <ActivityHeader />
      <ActivityControls
        monitors={monitors}
        selectedId={activeId}
        onSelectedChange={handleSelectedChange}
        compareId={compareId}
        onCompareChange={setCompareId}
      />
      <ActivityStats results={results} />
      <ResponseTimeChart
        results={results}
        compareResults={compareId ? compareResults : []}
        primaryLabel={activeMonitor?.url}
        compareLabel={compareMonitor?.url}
      />
    </DashboardShell>
  );
}
