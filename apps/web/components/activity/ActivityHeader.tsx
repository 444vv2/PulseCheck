import { Eyebrow } from "../ui/Eyebrow";
import styles from "./ActivityHeader.module.css";

export function ActivityHeader() {
  return (
    <header className={styles.header}>
      <Eyebrow>MONITORING HISTORY</Eyebrow>
      <h1>Activity</h1>
      <p>History of checks for the selected monitor.</p>
    </header>
  );
}
