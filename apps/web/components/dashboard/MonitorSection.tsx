import Link from "next/link";
import { Button } from "../ui/Button";
import { AddMonitorForm } from "./AddMonitorForm";
import { MonitorList } from "./MonitorList";
import { Monitor } from "../../hooks/useMonitors";
import styles from "./MonitorSection.module.css";

export function MonitorSection({
  monitors,
  status,
  hasToken,
  onRefresh,
  onAdd,
  onToggle,
  onDelete,
}: {
  monitors: Monitor[];
  status: string;
  hasToken: boolean;
  onRefresh: () => void;
  onAdd: (url: string, intervalSec: number) => Promise<boolean>;
  onToggle: (monitor: Monitor) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section id="monitors" className={styles.section}>
      <div className={styles.heading}>
        <div>
          <h2>Yours monitors</h2>
          <p>{status}</p>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={!hasToken}>
          Refresh
        </Button>
      </div>

      {!hasToken && (
        <div className={styles.notice}>
          <strong>Dashboard ready.</strong> Log in to connect it to the API. <Link href="/login">To login →</Link>
        </div>
      )}

      {hasToken && <AddMonitorForm onSubmit={onAdd} />}

      <MonitorList
        monitors={monitors}
        hasToken={hasToken}
        onToggle={onToggle}
        onDelete={onDelete}
      />
    </section>
  );
}
