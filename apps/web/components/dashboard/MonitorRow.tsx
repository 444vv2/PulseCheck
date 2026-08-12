import { Monitor } from "../../hooks/useMonitors";
import { StatusDot } from "../ui/StatusDot";
import { Button } from "../ui/Button";
import styles from "./MonitorList.module.css";

function formatInterval(seconds: number) {
  return seconds % 60 === 0 ? `${seconds / 60} хв` : `${seconds} с`;
}

function statusOf(monitor: Monitor): "up" | "down" | "paused" {
  if (!monitor.isActive) return "paused";
  return monitor.lastIsUp === false ? "down" : "up";
}

export function MonitorRow({
  monitor,
  onToggle,
  onDelete,
}: {
  monitor: Monitor;
  onToggle: (monitor: Monitor) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article className={styles.row}>
      <StatusDot status={statusOf(monitor)} />
      <div className={styles.main}>
        <strong>{monitor.url}</strong>
        <small>
          Check every {formatInterval(monitor.intervalSec)} ·{" "}
          {monitor.lastCheckedAt
            ? `last request ${new Date(monitor.lastCheckedAt).toLocaleString("uk-UA")}`
            : "not checked yet"}
          {monitor.lastResponseTimeMs !== undefined && (
            <> · {monitor.lastResponseTimeMs}ms</>
          )}
        </small>
      </div>
      <span
        className={`${styles.state} ${monitor.isActive ? styles.stateActive : ""}`}
      >
        {monitor.isActive ? "Active" : "Paused"}
      </span>
      <span className={styles.actionSlot}>
        <Button variant="text" onClick={() => onToggle(monitor)}>
          {monitor.isActive ? "Pause" : "Start"}
        </Button>
      </span>
      <Button
        variant="delete"
        aria-label={`Delete ${monitor.url}`}
        onClick={() => onDelete(monitor.id)}
      >
        ×
      </Button>
    </article>
  );
}
