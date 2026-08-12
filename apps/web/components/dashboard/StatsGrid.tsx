import { Monitor } from "../../hooks/useMonitors";
import styles from "./StatsGrid.module.css";

export function StatsGrid({ monitors }: { monitors: Monitor[] }) {
  const active = monitors.filter((m) => m.isActive).length;

  return (
    <section className={styles.grid}>
      <article>
        <span>ALL MONITORS</span>
        <strong>{monitors.length}</strong>
        <small>In your space</small>
      </article>
      <article>
        <span>ACTIVE</span>
        <strong>{active}</strong>
        <small className={styles.positive}>● Ready for checking</small>
      </article>
      <article>
        <span>PAUSED</span>
        <strong>{monitors.length - active}</strong>
        <small>Can be resumed at any time</small>
      </article>
    </section>
  );
}
