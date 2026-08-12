import styles from "./StatusDot.module.css";

type Status = "up" | "down" | "paused";

export function StatusDot({ status }: { status: Status }) {
  return <span className={`${styles.dot} ${styles[status]}`} />;
}
