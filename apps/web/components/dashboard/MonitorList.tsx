import { Monitor } from "../../hooks/useMonitors";
import { MonitorRow } from "./MonitorRow";
import styles from "./MonitorList.module.css";

export function MonitorList({
  monitors,
  hasToken,
  onToggle,
  onDelete,
}: {
  monitors: Monitor[];
  hasToken: boolean;
  onToggle: (monitor: Monitor) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={styles.list}>
      {monitors.map((monitor) => (
        <MonitorRow
          key={monitor.id}
          monitor={monitor}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
      {hasToken && !monitors.length && (
        <div className={styles.empty}>
          Here will appear your monitors after adding them.
        </div>
      )}
    </div>
  );
}
