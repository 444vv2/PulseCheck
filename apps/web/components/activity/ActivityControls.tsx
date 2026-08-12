import styles from "./ActivityControls.module.css";

type MonitorSummary = { id: string; url: string };

export function ActivityControls({
  monitors,
  selectedId,
  onSelectedChange,
  compareId,
  onCompareChange,
}: {
  monitors: MonitorSummary[];
  selectedId: string;
  onSelectedChange: (id: string) => void;
  compareId: string;
  onCompareChange: (id: string) => void;
}) {
  return (
    <div className={styles.controls}>
      <div className={styles.field}>
        <label htmlFor="activity-primary">Monitor</label>
        <select
          id="activity-primary"
          value={selectedId}
          onChange={(event) => onSelectedChange(event.target.value)}
        >
          {monitors.map((m) => (
            <option key={m.id} value={m.id}>
              {m.url}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="activity-compare">Compare with</label>
        <select
          id="activity-compare"
          value={compareId}
          onChange={(event) => onCompareChange(event.target.value)}
        >
          <option value="">None</option>
          {monitors
            .filter((m) => m.id !== selectedId)
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.url}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}
