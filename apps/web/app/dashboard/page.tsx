"use client";

import { DashboardShell } from "../../components/layout/DashboardShell";
import { StatsGrid } from "../../components/dashboard/StatsGrid";
import { MonitorSection } from "../../components/dashboard/MonitorSection";
import { Eyebrow } from "../../components/ui/Eyebrow";
import { useAuthSession } from "../../hooks/useAuthSession";
import { useMonitors } from "../../hooks/useMonitors";
import styles from "./page.module.css";

export default function DashboardPage() {
  const { email, hasToken } = useAuthSession();
  const {
    monitors,
    status,
    loadMonitors,
    addMonitor,
    toggleMonitor,
    deleteMonitor,
  } = useMonitors(hasToken);

  return (
    <DashboardShell>
      <header className={styles.header}>
        <div>
          <Eyebrow>MONITORING OVERVIEW</Eyebrow>
          <h1>Welcome, {email.split("@")[0]}.</h1>
          <p>Here's what's happening with your endpoints.</p>
        </div>
        <span className={styles.liveBadge}>
          <i /> LIVE
        </span>
      </header>

      <StatsGrid monitors={monitors} />

      <MonitorSection
        monitors={monitors}
        status={status}
        hasToken={hasToken}
        onRefresh={loadMonitors}
        onAdd={addMonitor}
        onToggle={toggleMonitor}
        onDelete={deleteMonitor}
      />
    </DashboardShell>
  );
}
